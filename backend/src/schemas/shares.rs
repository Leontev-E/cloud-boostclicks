use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateShareSchema {
    pub path: String,
    pub is_folder: bool,
}

#[derive(Serialize)]
pub struct ShareCreatedSchema {
    pub id: Uuid,
}

impl ShareCreatedSchema {
    pub fn new(id: Uuid) -> Self {
        Self { id }
    }
}

#[derive(Serialize)]
pub struct ShareInfoSchema {
    pub id: Uuid,
    pub path: String,
    pub is_folder: bool,
    pub name: String,
}

impl ShareInfoSchema {
    pub fn new(id: Uuid, path: String, is_folder: bool) -> Self {
        let name = if path.is_empty() {
            "Облако".to_string()
        } else {
            path.trim_end_matches('/')
                .split('/')
                .last()
                .unwrap_or("")
                .to_string()
        };

        Self {
            id,
            path,
            is_folder,
            name,
        }
    }
}
