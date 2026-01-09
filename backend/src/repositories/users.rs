use sqlx::PgPool;
use uuid::Uuid;

use crate::common::db::errors::map_not_found;
use crate::errors::{CloudBoostclicksError, CloudBoostclicksResult};
use crate::models::users::{InDBUser, User};

pub struct UsersRepository<'d> {
    db: &'d PgPool,
}

impl<'d> UsersRepository<'d> {
    pub fn new(db: &'d PgPool) -> Self {
        Self { db }
    }

    pub async fn create(&self, in_obj: InDBUser) -> CloudBoostclicksResult<User> {
        let id = Uuid::new_v4();

        let user = sqlx::query_as(
            r#"
                INSERT INTO users (id, email, password_hash, telegram_id, telegram_username, display_name)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            "#,
        )
        .bind(id)
        .bind(in_obj.email)
        .bind(in_obj.password_hash)
        .bind(in_obj.telegram_id)
        .bind(in_obj.telegram_username)
        .bind(in_obj.display_name)
        .fetch_one(self.db)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(dbe) if dbe.constraint() == Some("users_email_key") => {
                CloudBoostclicksError::AlreadyExists("пользователь с таким email".into())
            }
            sqlx::Error::Database(dbe) if dbe.constraint() == Some("users_telegram_id_key") => {
                CloudBoostclicksError::AlreadyExists("пользователь с таким telegram id".into())
            }
            _ => {
                tracing::error!("{e}");
                CloudBoostclicksError::Unknown
            }
        })?;

        Ok(user)
    }

    pub async fn get_by_email(&self, email: &str) -> CloudBoostclicksResult<User> {
        sqlx::query_as("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_one(self.db)
            .await
            .map_err(|e| map_not_found(e, "user"))
    }

    pub async fn upsert_telegram_user(
        &self,
        telegram_id: i64,
        telegram_username: Option<String>,
        display_name: Option<String>,
    ) -> CloudBoostclicksResult<User> {
        let id = Uuid::new_v4();

        sqlx::query_as(
            r#"
                INSERT INTO users (id, telegram_id, telegram_username, display_name)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (telegram_id)
                DO UPDATE
                    SET telegram_username = EXCLUDED.telegram_username,
                        display_name = EXCLUDED.display_name
                RETURNING *;
            "#,
        )
        .bind(id)
        .bind(telegram_id)
        .bind(telegram_username)
        .bind(display_name)
        .fetch_one(self.db)
        .await
        .map_err(|e| {
            tracing::error!("{e}");
            CloudBoostclicksError::Unknown
        })
    }
}
