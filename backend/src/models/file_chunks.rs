use crate::common::types::Position;

#[derive(Debug, sqlx::FromRow)]
pub struct FileChunk {
    pub id: uuid::Uuid,
    pub file_id: uuid::Uuid,
    pub telegram_file_id: String,
    pub storage_worker_id: Option<uuid::Uuid>,
    pub position: Position,
}

impl FileChunk {
    pub fn new(
        id: uuid::Uuid,
        file_id: uuid::Uuid,
        telegram_file_id: String,
        storage_worker_id: Option<uuid::Uuid>,
        position: Position,
    ) -> Self {
        Self {
            id,
            file_id,
            telegram_file_id,
            storage_worker_id,
            position,
        }
    }
}

