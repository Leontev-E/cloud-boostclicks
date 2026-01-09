use pwhash::bcrypt;

use crate::errors::{CloudBoostclicksError, CloudBoostclicksResult};

pub struct PasswordManager;

impl PasswordManager {
    pub fn generate(password: &str) -> CloudBoostclicksResult<String> {
        bcrypt::hash(password).map_err(|e| {
            tracing::error!("{e}");
            CloudBoostclicksError::Unknown
        })
    }

    pub fn verify(password: &str, hash: &str) -> CloudBoostclicksResult<()> {
        if bcrypt::verify(password, hash) {
            Ok(())
        } else {
            Err(CloudBoostclicksError::NotAuthenticated)
        }
    }
}

