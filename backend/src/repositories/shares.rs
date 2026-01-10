use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::{CloudBoostclicksError, CloudBoostclicksResult};
use crate::models::shares::Share;

pub const SHARES_TABLE: &str = "shares";

pub struct SharesRepository<'d> {
    db: &'d PgPool,
}

impl<'d> SharesRepository<'d> {
    pub fn new(db: &'d PgPool) -> Self {
        Self { db }
    }

    pub async fn create(
        &self,
        storage_id: Uuid,
        path: &str,
        is_folder: bool,
        created_by: Uuid,
    ) -> CloudBoostclicksResult<Share> {
        let id = Uuid::new_v4();

        sqlx::query_as(
            format!(
                "
                INSERT INTO {SHARES_TABLE} (id, storage_id, path, is_folder, created_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, storage_id, path, is_folder;
            "
            )
            .as_str(),
        )
        .bind(id)
        .bind(storage_id)
        .bind(path)
        .bind(is_folder)
        .bind(created_by)
        .fetch_one(self.db)
        .await
        .map_err(|_| CloudBoostclicksError::Unknown)
    }

    pub async fn get_by_id(&self, share_id: Uuid) -> CloudBoostclicksResult<Share> {
        sqlx::query_as(
            format!(
                "SELECT id, storage_id, path, is_folder FROM {SHARES_TABLE} WHERE id = $1"
            )
            .as_str(),
        )
        .bind(share_id)
        .fetch_one(self.db)
        .await
        .map_err(|_| CloudBoostclicksError::DoesNotExist("ссылка".to_string()))
    }
}
