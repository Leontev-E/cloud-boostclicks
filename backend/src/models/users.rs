pub struct InDBUser {
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub telegram_id: Option<i64>,
    pub telegram_username: Option<String>,
    pub display_name: Option<String>,
}

impl InDBUser {
    pub fn new(email: String, password_hash: String) -> Self {
        Self {
            email: Some(email),
            password_hash: Some(password_hash),
            telegram_id: None,
            telegram_username: None,
            display_name: None,
        }
    }

    pub fn new_telegram(
        telegram_id: i64,
        telegram_username: Option<String>,
        display_name: Option<String>,
    ) -> Self {
        Self {
            email: None,
            password_hash: None,
            telegram_id: Some(telegram_id),
            telegram_username,
            display_name,
        }
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct User {
    pub id: uuid::Uuid,
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub telegram_id: Option<i64>,
    pub telegram_username: Option<String>,
    pub display_name: Option<String>,
}

impl User {
    pub fn new(
        id: uuid::Uuid,
        email: Option<String>,
        password_hash: Option<String>,
        telegram_id: Option<i64>,
        telegram_username: Option<String>,
        display_name: Option<String>,
    ) -> Self {
        Self {
            id,
            email,
            password_hash,
            telegram_id,
            telegram_username,
            display_name,
        }
    }

    pub fn identifier(&self) -> String {
        if let Some(email) = &self.email {
            if !email.is_empty() {
                return email.clone();
            }
        }

        if let Some(username) = &self.telegram_username {
            let username = username.trim_start_matches('@');
            return format!("@{}", username);
        }

        if let Some(telegram_id) = self.telegram_id {
            return format!("tg:{}", telegram_id);
        }

        "неизвестно".to_string()
    }

    pub fn display_label(&self) -> String {
        if let Some(display_name) = &self.display_name {
            if !display_name.is_empty() {
                return display_name.clone();
            }
        }

        self.identifier()
    }
}
