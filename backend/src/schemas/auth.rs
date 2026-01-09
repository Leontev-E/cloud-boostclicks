use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginSchema {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct TelegramLoginSchema {
    pub id: i64,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub username: Option<String>,
    pub photo_url: Option<String>,
    pub auth_date: i64,
    pub hash: String,
}

#[derive(Serialize)]
pub struct TokenSchema {
    access_token: String,
}

impl TokenSchema {
    pub fn new(access_token: String) -> Self {
        Self { access_token }
    }
}

