use axum::body::Bytes;
use sqlx::PgPool;
use tokio::sync::oneshot;
use uuid::Uuid;

use crate::{
    config::Config,
    common::{
        access::check_access,
        channels::{
            ClientData, ClientMessage, ClientSender, DownloadFileData, StorageManagerData,
            UploadFileData,
        },
        jwt_manager::AuthUser,
        zip::build_zip,
    },
    errors::{CloudBoostclicksError, CloudBoostclicksResult},
    models::{
        access::AccessType,
        files::{FSElement, File, InFile, SearchFSElement},
    },
    repositories::{
        access::AccessRepository, files::FilesRepository, storage_workers::StorageWorkersRepository,
        storages::StoragesRepository,
    },
    schemas::files::{InFileSchema, InFolderSchema},
};
use crate::schemas::files::DeleteSummary;
use crate::services::storage_manager::StorageManagerService;

pub struct FilesService<'d> {
    db: &'d PgPool,
    repo: FilesRepository<'d>,
    storage_workers_repo: StorageWorkersRepository<'d>,
    access_repo: AccessRepository<'d>,
    config: Config,
    tx: ClientSender,
}

impl<'d> FilesService<'d> {
    pub fn new(db: &'d PgPool, config: crate::config::Config, tx: ClientSender) -> Self {
        let repo = FilesRepository::new(db);
        let storage_workers_repo = StorageWorkersRepository::new(db);
        let access_repo = AccessRepository::new(db);
        Self {
            db,
            repo,
            access_repo,
            storage_workers_repo,
            config,
            tx,
        }
    }

    pub async fn create_folder(
        &self,
        in_schema: InFolderSchema,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<()> {
        // 0. checking access
        check_access(
            &self.access_repo,
            user.id,
            in_schema.storage_id,
            &AccessType::W,
        )
        .await?;

        // 1. validation
        if !Self::validate_filepath(&in_schema.parent_path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }
        if in_schema.folder_name.contains(r"/") {
            return Err(CloudBoostclicksError::InvalidFolderName);
        }

        // 2. constructing final values
        let path = if !in_schema.parent_path.is_empty() {
            format!("{}/{}/", in_schema.parent_path, in_schema.folder_name)
        } else {
            format!("{}/", in_schema.folder_name)
        };
        let in_file = InFile::new(path, 0, in_schema.storage_id);

        // 3. saving to db
        self.repo.create_folder(in_file).await.map(|_| ())
    }

    pub async fn upload_to(&self, in_schema: InFileSchema, user: &AuthUser) -> CloudBoostclicksResult<()> {
        // 0. checking access
        check_access(
            &self.access_repo,
            user.id,
            in_schema.storage_id,
            &AccessType::W,
        )
        .await?;

        // 1. check whether storage got workers
        Self::check_storage_workers(&self, in_schema.storage_id).await?;

        // 2. path validation
        if !Self::validate_filepath(&in_schema.path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let in_file = InFile::new(in_schema.path, in_schema.size, in_schema.storage_id);

        // 3. saving file to db
        let file = self.repo.create_file(in_file).await?;

        self._upload(file, in_schema.file, user).await
    }

    pub async fn upload_anyway(
        &self,
        in_file: InFile,
        file_data: Bytes,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<()> {
        // 0. checking access
        check_access(
            &self.access_repo,
            user.id,
            in_file.storage_id,
            &AccessType::W,
        )
        .await?;

        // 1. check whether storage got workers
        Self::check_storage_workers(&self, in_file.storage_id).await?;

        // 2. saving file in db
        let file = self.repo.create_file_anyway(in_file).await?;

        self._upload(file, file_data, user).await
    }

    async fn _upload(&self, file: File, file_data: Bytes, user: &AuthUser) -> CloudBoostclicksResult<()> {
        // 2. sending file to storage manager
        let (resp_tx, resp_rx) = oneshot::channel();

        let message = {
            let upload_file_data = UploadFileData {
                file_id: file.id,
                user_id: user.id,
                file_data: file_data.as_ref().into(),
            };
            ClientMessage {
                data: ClientData::UploadFile(upload_file_data),
                tx: resp_tx,
            }
        };

        tracing::debug!("sending task to manager");
        let _ = self.tx.send(message).await;

        // 3. waiting for a storage manager result
        let message_back = match resp_rx.await.unwrap().data {
            StorageManagerData::UploadFile(r) => r,
            _ => unimplemented!(),
        };
        if let Err(e) = message_back.and({
            tracing::debug!("file loaded successfully");

            // 4. setting file as uploaded
            self.repo.set_as_uploaded(file.id).await
        }) {
            tracing::error!("{e}");

            // fallback logic: deleting file
            let _ = self.repo.delete_with_folders(file.id).await;

            return Err(e);
        };

        Ok(())
    }

    pub async fn upload_chunked(
        &self,
        storage_id: Uuid,
        path: String,
        size: Option<i64>,
        file_id: Option<Uuid>,
        chunk_index: usize,
        total_chunks: usize,
        chunk_data: Bytes,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Uuid> {
        // check access
        check_access(&self.access_repo, user.id, storage_id, &AccessType::W).await?;
        // workers check
        Self::check_storage_workers(&self, storage_id).await?;

        if !Self::validate_filepath(&path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        // create file once
        let file_id = match file_id {
            Some(id) => id,
            None => {
                let file_size = size.unwrap_or(chunk_data.len() as i64);
                let in_file = InFile::new(path.clone(), file_size, storage_id);
                self.repo.create_file(in_file).await?.id
            }
        };

        // upload chunk directly to Telegram via StorageManagerService
        let storage = StoragesRepository::new(self.db).get_by_id(storage_id).await?;
        let storage_manager =
            StorageManagerService::new(self.db, &self.config.telegram_api_base_url, self.config.telegram_rate_limit);
        let chunk = storage_manager
            .upload_chunk(storage.id, storage.chat_id, file_id, chunk_index, &chunk_data)
            .await?;

        self.repo.create_chunks_batch(vec![chunk]).await?;

        if chunk_index + 1 == total_chunks {
            self.repo.set_as_uploaded(file_id).await?;
        }

        Ok(file_id)
    }

    async fn check_storage_workers(&self, storage_id: Uuid) -> CloudBoostclicksResult<()> {
        if !self
            .storage_workers_repo
            .storage_has_any(storage_id)
            .await?
        {
            Err(CloudBoostclicksError::StorageDoesNotHaveWorkers)
        } else {
            Ok(())
        }
    }

    pub async fn download(
        &self,
        path: &str,
        storage_id: Uuid,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Vec<u8>> {
        // 0. checking access
        check_access(&self.access_repo, user.id, storage_id, &AccessType::R).await?;

        // 1. path validation
        if !Self::validate_path(path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        // 2. getting file by path
        let file = self.repo.get_file_by_path(path, storage_id).await?;

        self.download_file_by_id(file.id, storage_id, user.id).await
    }

    pub async fn list_dir(
        self,
        storage_id: Uuid,
        path: &str,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Vec<FSElement>> {
        check_access(&self.access_repo, user.id, storage_id, &AccessType::R).await?;

        self.repo.list_dir(storage_id, path).await
    }

    pub async fn download_folder(
        &self,
        path: &str,
        storage_id: Uuid,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Vec<u8>> {
        check_access(&self.access_repo, user.id, storage_id, &AccessType::R).await?;

        if !Self::validate_path(path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let folder_path = path.trim_end_matches('/');
        let prefix = if folder_path.is_empty() {
            "".to_string()
        } else {
            format!("{folder_path}/")
        };

        let files = self
            .repo
            .list_files_in_folder(storage_id, &prefix)
            .await?;

        if files.is_empty() {
            return Err(CloudBoostclicksError::DoesNotExist("папка".to_string()));
        }

        let mut zipped_files = Vec::with_capacity(files.len());
        for file in files {
            let data = self
                .download_file_by_id(file.id, storage_id, user.id)
                .await?;

            let rel_path = if prefix.is_empty() {
                file.path.clone()
            } else {
                file.path.strip_prefix(&prefix).unwrap_or(&file.path).to_string()
            };

            zipped_files.push((rel_path, data));
        }

        build_zip(zipped_files)
    }

    pub async fn search(
        self,
        storage_id: Uuid,
        path: &str,
        search_path: &str,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Vec<SearchFSElement>> {
        check_access(&self.access_repo, user.id, storage_id, &AccessType::R).await?;

        self.repo.search(search_path, path, storage_id).await
    }

    pub async fn rename(
        &self,
        old_path: &str,
        new_path: &str,
        storage_id: Uuid,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<()> {
        // 0. checking access
        check_access(&self.access_repo, user.id, storage_id, &AccessType::W).await?;

        // 1. path validation
        if !Self::validate_path(old_path) || !Self::validate_path(new_path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        // 2. renaming file
        self.repo.update_path(old_path, new_path, storage_id).await
    }

    pub async fn delete(
        &self,
        path: &str,
        storage_id: Uuid,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<DeleteSummary> {
        // 0. checking access
        check_access(&self.access_repo, user.id, storage_id, &AccessType::W).await?;

        // 1. path validation
        if !Self::validate_path(path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        // 2. deleting file
        self.repo.delete(path, storage_id).await
    }

    /////////////////////////////////////////////////////////////////////
    ////    Helpers
    /////////////////////////////////////////////////////////////////////

    fn validate_filepath(path: &str) -> bool {
        Self::validate_path(path) && !path.ends_with(r"/")
    }

    fn validate_path(path: &str) -> bool {
        !path.starts_with(r"/") && !path.contains(r"//")
    }

    async fn download_file_by_id(
        &self,
        file_id: Uuid,
        storage_id: Uuid,
        user_id: Uuid,
    ) -> CloudBoostclicksResult<Vec<u8>> {
        let (resp_tx, resp_rx) = oneshot::channel();

        let message = {
            let download_file_data = DownloadFileData {
                file_id,
                storage_id,
                user_id,
            };
            ClientMessage {
                data: ClientData::DownloadFile(download_file_data),
                tx: resp_tx,
            }
        };

        tracing::debug!("sending task to manager");
        let _ = self.tx.send(message).await;

        match resp_rx.await.unwrap().data {
            StorageManagerData::DownloadFile(r) => r,
            _ => unimplemented!(),
        }
    }
}

