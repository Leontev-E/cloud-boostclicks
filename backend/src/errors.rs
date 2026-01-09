use axum::http::StatusCode;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CloudBoostclicksError {
    #[error("переменная окружения `{0}` не задана")]
    EnvConfigLoadingError(String),
    #[error("переменная окружения `{0}` не может быть распознана")]
    EnvVarParsingError(String),

    #[error("пользователь удален")]
    UserWasRemoved,

    #[error("{0} уже существует")]
    AlreadyExists(String),
    #[error("{0} не существует")]
    DoesNotExist(String),
    #[error("У пользователя уже есть облако с таким именем")]
    StorageNameConflict,
    #[error("У пользователя уже есть облако с таким chat id")]
    StorageChatIdConflict,
    #[error("У пользователя уже есть бот с таким именем")]
    StorageWorkerNameConflict,
    #[error("Токен должен быть уникальным")]
    StorageWorkerTokenConflict,
    #[error("не авторизован")]
    NotAuthenticated,
    #[error("[Telegram API] {0}")]
    TelegramAPIError(String),
    #[error("Добавьте хотя бы одного бота")]
    NoStorageWorkers,
    #[error("Неверный путь")]
    InvalidPath,
    #[error("Неверное имя папки")]
    InvalidFolderName,
    #[error("Нельзя изменять права для себя")]
    CannotManageAccessOfYourself,
    #[error("У облака нет ботов")]
    StorageDoesNotHaveWorkers,
    #[error("неизвестная ошибка")]
    Unknown,
    #[error("требуется заголовок {0}")]
    HeaderMissed(String),
    #[error("заголовок {0} должен быть {1}")]
    HeaderIsInvalid(String, String),
}

impl From<CloudBoostclicksError> for (StatusCode, String) {
    fn from(e: CloudBoostclicksError) -> Self {
        match &e {
            CloudBoostclicksError::AlreadyExists(_)
            | CloudBoostclicksError::StorageNameConflict
            | CloudBoostclicksError::StorageChatIdConflict
            | CloudBoostclicksError::StorageWorkerNameConflict
            | CloudBoostclicksError::StorageWorkerTokenConflict
            | CloudBoostclicksError::StorageDoesNotHaveWorkers
            | CloudBoostclicksError::CannotManageAccessOfYourself => {
                (StatusCode::CONFLICT, e.to_string())
            }
            CloudBoostclicksError::NotAuthenticated => (StatusCode::UNAUTHORIZED, e.to_string()),
            CloudBoostclicksError::DoesNotExist(_) => (StatusCode::NOT_FOUND, e.to_string()),
            CloudBoostclicksError::HeaderMissed(_)
            | CloudBoostclicksError::HeaderIsInvalid(..)
            | CloudBoostclicksError::InvalidFolderName => (StatusCode::BAD_REQUEST, e.to_string()),
            _ => {
                tracing::error!("{e}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Что-то пошло не так".to_owned(),
                )
            }
        }
    }
}

impl From<reqwest::Error> for CloudBoostclicksError {
    fn from(e: reqwest::Error) -> Self {
        match e.status() {
            Some(e) if e.is_client_error() => CloudBoostclicksError::TelegramAPIError(e.to_string()),
            Some(_) | None => {
                tracing::error!("{e}");
                CloudBoostclicksError::Unknown
            }
        }
    }
}

pub type CloudBoostclicksResult<T> = Result<T, CloudBoostclicksError>;
