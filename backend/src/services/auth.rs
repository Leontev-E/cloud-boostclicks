use std::time::{Duration, SystemTime, UNIX_EPOCH};

use hmac::Mac;
use sqlx::PgPool;
use sha2::{Digest, Sha256};

use crate::{
    common::{
        jwt_manager::{AuthUser, JWTManager},
        password_manager::PasswordManager,
    },
    config::Config,
    errors::{CloudBoostclicksError, CloudBoostclicksResult},
    repositories::users::UsersRepository,
    schemas::auth::{LoginSchema, TelegramLoginSchema},
};

pub struct AuthService<'d> {
    repo: UsersRepository<'d>,
}

impl<'d> AuthService<'d> {
    pub fn new(db: &'d PgPool) -> Self {
        let repo = UsersRepository::new(db);
        Self { repo }
    }

    pub async fn login(
        &self,
        login_data: LoginSchema,
        config: &Config,
    ) -> CloudBoostclicksResult<(String, Duration)> {
        // trying to find a user with a given email
        let user = self
            .repo
            .get_by_email(&login_data.email)
            .await
            .map_err(|_| CloudBoostclicksError::NotAuthenticated)?;

        // verifying password
        let password_hash = user
            .password_hash
            .as_ref()
            .ok_or(CloudBoostclicksError::NotAuthenticated)?;
        PasswordManager::verify(&login_data.password, password_hash)?;

        // generating access token
        let user = AuthUser::new(user.id, user.identifier());
        let expire_in = Duration::from_secs(config.access_token_expire_in_secs.into());
        let token = JWTManager::generate(user, expire_in, &config.secret_key);
        Ok((token, expire_in))

        // TODO: add generating refresh token
    }

    pub async fn telegram_login(
        &self,
        login_data: TelegramLoginSchema,
        config: &Config,
    ) -> CloudBoostclicksResult<(String, Duration)> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| CloudBoostclicksError::NotAuthenticated)?
            .as_secs();
        let auth_date = login_data.auth_date as u64;

        if auth_date > now.saturating_add(300) {
            return Err(CloudBoostclicksError::NotAuthenticated);
        }

        let login_age = now.saturating_sub(auth_date);
        if login_age > config.telegram_login_max_age_secs {
            return Err(CloudBoostclicksError::NotAuthenticated);
        }

        let data_check_string = build_telegram_login_string(&login_data);
        let secret_key = Sha256::digest(config.telegram_login_bot_token.as_bytes());
        let mut mac = hmac::Hmac::<Sha256>::new_from_slice(&secret_key)
            .map_err(|_| CloudBoostclicksError::NotAuthenticated)?;
        mac.update(data_check_string.as_bytes());
        let computed_hash = hex::encode(mac.finalize().into_bytes());

        if computed_hash != login_data.hash {
            return Err(CloudBoostclicksError::NotAuthenticated);
        }

        let display_name = match (&login_data.first_name, &login_data.last_name) {
            (Some(first), Some(last)) if !last.is_empty() => Some(format!("{first} {last}")),
            (Some(first), _) if !first.is_empty() => Some(first.clone()),
            _ => login_data.username.clone(),
        };

        let telegram_username = login_data
            .username
            .as_ref()
            .map(|username| username.trim_start_matches('@').to_string());

        let user = self
            .repo
            .upsert_telegram_user(login_data.id, telegram_username, display_name)
            .await?;

        let auth_user = AuthUser::new(user.id, user.identifier());
        let expire_in = Duration::from_secs(config.access_token_expire_in_secs.into());
        let token = JWTManager::generate(auth_user, expire_in, &config.secret_key);
        Ok((token, expire_in))
    }
}

fn build_telegram_login_string(login_data: &TelegramLoginSchema) -> String {
    let mut pairs = vec![
        format!("auth_date={}", login_data.auth_date),
        format!("id={}", login_data.id),
    ];

    if let Some(first_name) = &login_data.first_name {
        pairs.push(format!("first_name={first_name}"));
    }
    if let Some(last_name) = &login_data.last_name {
        pairs.push(format!("last_name={last_name}"));
    }
    if let Some(username) = &login_data.username {
        pairs.push(format!("username={username}"));
    }
    if let Some(photo_url) = &login_data.photo_url {
        pairs.push(format!("photo_url={photo_url}"));
    }

    pairs.sort();
    pairs.join("\n")
}

