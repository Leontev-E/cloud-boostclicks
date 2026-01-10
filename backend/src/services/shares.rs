use tokio::sync::oneshot;
use uuid::Uuid;

use crate::{
    common::{
        access::check_access,
        channels::{ClientData, ClientMessage, ClientSender, DownloadFileData, StorageManagerData},
        jwt_manager::AuthUser,
        zip::build_zip,
    },
    errors::{CloudBoostclicksError, CloudBoostclicksResult},
    models::{access::AccessType, files::FSElement, shares::Share},
    repositories::{access::AccessRepository, files::FilesRepository, shares::SharesRepository},
    schemas::shares::CreateShareSchema,
};

pub struct SharesService<'d> {
    shares_repo: SharesRepository<'d>,
    files_repo: FilesRepository<'d>,
    access_repo: AccessRepository<'d>,
    tx: ClientSender,
}

impl<'d> SharesService<'d> {
    pub fn new(db: &'d sqlx::PgPool, tx: ClientSender) -> Self {
        Self {
            shares_repo: SharesRepository::new(db),
            files_repo: FilesRepository::new(db),
            access_repo: AccessRepository::new(db),
            tx,
        }
    }

    pub async fn create(
        &self,
        storage_id: Uuid,
        in_schema: CreateShareSchema,
        user: &AuthUser,
    ) -> CloudBoostclicksResult<Share> {
        check_access(&self.access_repo, user.id, storage_id, &AccessType::R).await?;

        if !Self::validate_path(&in_schema.path) {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let mut path = in_schema.path.trim().to_string();
        let is_folder = in_schema.is_folder;

        if is_folder {
            path = path.trim_end_matches('/').to_string();
            if path.is_empty() {
                return Err(CloudBoostclicksError::InvalidPath);
            }

            let prefix = format!("{path}/");
            let exists = self.files_repo.folder_exists(storage_id, &prefix).await?;
            if !exists {
                return Err(CloudBoostclicksError::DoesNotExist("папка".to_string()));
            }

            path = prefix;
        } else {
            path = path.trim_end_matches('/').to_string();
            let _ = self
                .files_repo
                .get_uploaded_file_by_path(&path, storage_id)
                .await?;
        }

        self.shares_repo
            .create(storage_id, &path, is_folder, user.id)
            .await
    }

    pub async fn get(&self, share_id: Uuid) -> CloudBoostclicksResult<Share> {
        self.shares_repo.get_by_id(share_id).await
    }

    pub async fn list_dir(&self, share_id: Uuid) -> CloudBoostclicksResult<Vec<FSElement>> {
        let share = self.shares_repo.get_by_id(share_id).await?;

        if !share.is_folder {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let prefix = share.path.trim_end_matches('/');
        self.files_repo.list_dir(share.storage_id, prefix).await
    }

    pub async fn download_file(&self, share_id: Uuid) -> CloudBoostclicksResult<Vec<u8>> {
        let share = self.shares_repo.get_by_id(share_id).await?;

        if share.is_folder {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let file = self
            .files_repo
            .get_uploaded_file_by_path(&share.path, share.storage_id)
            .await?;

        self.download_file_by_id(file.id, share.storage_id, Uuid::nil())
            .await
    }

    pub async fn download_folder(&self, share_id: Uuid) -> CloudBoostclicksResult<Vec<u8>> {
        let share = self.shares_repo.get_by_id(share_id).await?;

        if !share.is_folder {
            return Err(CloudBoostclicksError::InvalidPath);
        }

        let folder_path = share.path.trim_end_matches('/');
        let prefix = if folder_path.is_empty() {
            "".to_string()
        } else {
            format!("{folder_path}/")
        };

        let files = self
            .files_repo
            .list_files_in_folder(share.storage_id, &prefix)
            .await?;

        if files.is_empty() {
            return Err(CloudBoostclicksError::DoesNotExist("папка".to_string()));
        }

        let mut zipped_files = Vec::with_capacity(files.len());
        for file in files {
            let data = self
                .download_file_by_id(file.id, share.storage_id, Uuid::nil())
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

        let _ = self.tx.send(message).await;

        match resp_rx.await.unwrap().data {
            StorageManagerData::DownloadFile(r) => r,
            _ => unimplemented!(),
        }
    }
}
