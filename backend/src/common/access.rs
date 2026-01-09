use uuid::Uuid;

use crate::{
    errors::{CloudBoostclicksError, CloudBoostclicksResult},
    models::access::AccessType,
    repositories::access::AccessRepository,
};

pub async fn check_access<'d>(
    repo: &AccessRepository<'d>,
    user_id: Uuid,
    storage_id: Uuid,
    access_type: &AccessType,
) -> CloudBoostclicksResult<()> {
    if !repo.has_access(user_id, storage_id, access_type).await? {
        Err(CloudBoostclicksError::DoesNotExist(format!(
            "облако с id \"{storage_id}\""
        )))
    } else {
        Ok(())
    }
}
