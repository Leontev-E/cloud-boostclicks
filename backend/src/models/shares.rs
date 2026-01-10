use serde::Serialize;

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Share {
    pub id: uuid::Uuid,
    pub storage_id: uuid::Uuid,
    pub path: String,
    pub is_folder: bool,
}
