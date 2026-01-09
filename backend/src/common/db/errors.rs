use crate::errors::CloudBoostclicksError;

#[inline]
pub fn map_not_found(e: sqlx::Error, entity_name: &str) -> CloudBoostclicksError {
    match e {
        sqlx::Error::RowNotFound => {
            if entity_name.is_empty() {
                CloudBoostclicksError::DoesNotExist("объект не найден".to_string())
            } else {
                CloudBoostclicksError::DoesNotExist(format!("объект \"{entity_name}\" не найден"))
            }
        }
        _ => {
            tracing::error!("{e}");
            CloudBoostclicksError::Unknown
        }
    }
}
