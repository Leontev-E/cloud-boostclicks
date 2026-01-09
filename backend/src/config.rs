use std::{env, str::FromStr};

use super::errors::{CloudBoostclicksError, CloudBoostclicksResult};

#[derive(Debug, Clone)]
pub struct Config {
    pub db_uri: String,
    pub db_uri_without_dbname: String,
    pub db_name: String,
    pub port: u16,
    pub workers: u16,
    pub channel_capacity: u16,

    pub access_token_expire_in_secs: u32,
    pub refresh_token_expire_in_days: u16,
    pub secret_key: String,

    pub telegram_api_base_url: String,
    pub telegram_rate_limit: u8,
    pub telegram_login_bot_token: String,
    pub telegram_login_max_age_secs: u64,
}

impl Config {
    pub fn new() -> CloudBoostclicksResult<Self> {
        let db_user: String = Self::get_env_var("DATABASE_USER")?;
        let db_password: String = Self::get_env_var("DATABASE_PASSWORD")?;
        let db_name: String = Self::get_env_var("DATABASE_NAME")?;
        let db_host: String = Self::get_env_var("DATABASE_HOST")?;
        let db_port: String = Self::get_env_var("DATABASE_PORT")?;
        let db_uri =
            { format!("postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}") };
        let db_uri_without_dbname =
            { format!("postgres://{db_user}:{db_password}@{db_host}:{db_port}") };
        let port = Self::get_env_var("PORT")?;
        let workers = Self::get_env_var("WORKERS")?;
        let channel_capacity = Self::get_env_var("CHANNEL_CAPACITY")?;
        let access_token_expire_in_secs = Self::get_env_var("ACCESS_TOKEN_EXPIRE_IN_SECS")?;
        let refresh_token_expire_in_days = Self::get_env_var("REFRESH_TOKEN_EXPIRE_IN_DAYS")?;
        let secret_key = Self::get_env_var("SECRET_KEY")?;
        let telegram_api_base_url = Self::get_env_var("TELEGRAM_API_BASE_URL")?;
        let telegram_rate_limit = Self::get_env_var_with_default("TELEGRAM_RATE_LIMIT", 18)?;
        let telegram_login_bot_token = Self::get_env_var("TELEGRAM_LOGIN_BOT_TOKEN")?;
        let telegram_login_max_age_secs =
            Self::get_env_var_with_default("TELEGRAM_LOGIN_MAX_AGE_SECS", 86400u64)?;

        Ok(Self {
            db_uri,
            db_uri_without_dbname,
            db_name,
            port,
            workers,
            channel_capacity,
            access_token_expire_in_secs,
            refresh_token_expire_in_days,
            secret_key,
            telegram_api_base_url,
            telegram_rate_limit,
            telegram_login_bot_token,
            telegram_login_max_age_secs,
        })
    }

    #[inline]
    fn get_env_var<T: FromStr>(env_var: &str) -> CloudBoostclicksResult<T> {
        env::var(env_var)
            .map_err(|_| CloudBoostclicksError::EnvConfigLoadingError(env_var.to_owned()))?
            .parse::<T>()
            .map_err(|_| CloudBoostclicksError::EnvVarParsingError(env_var.to_owned()))
    }

    #[inline]
    fn get_env_var_with_default<T: FromStr>(env_var: &str, default: T) -> CloudBoostclicksResult<T> {
        let result = Self::get_env_var(env_var);

        if matches!(result, Err(CloudBoostclicksError::EnvConfigLoadingError(_))) {
            return Ok(default);
        }

        result
    }
}

