use reqwest::multipart;
use crate::{
    common::types::ChatId,
    errors::CloudBoostclicksResult,
};

use super::schemas::{DownloadBodySchema, UploadBodySchema, UploadSchema};

pub struct TelegramBotApi<'t> {
    base_url: &'t str,
}

impl<'t> TelegramBotApi<'t> {
    pub fn new(base_url: &'t str) -> Self {
        Self { base_url }
    }

    pub async fn upload(
        &self,
        file: &[u8],
        chat_id: ChatId,
        token: String,
    ) -> CloudBoostclicksResult<UploadSchema> {
        let chat_id = Self::normalize_chat_id(chat_id);

        let url = self.build_url("", "sendDocument", &token);

        let file_part =
            multipart::Part::bytes(file.to_vec()).file_name("cloud_boostclicks_chunk.bin");
        let form = multipart::Form::new()
            .text("chat_id", chat_id.to_string())
            .part("document", file_part);

        let response = reqwest::Client::new()
            .post(url)
            .multipart(form)
            .send()
            .await?;

        match response.error_for_status() {
            // https://stackoverflow.com/a/32679930/12255756
            Ok(r) => Ok(r.json::<UploadBodySchema>().await?.result.document),
            Err(e) => Err(e.into()),
        }
    }

    pub async fn download(
        &self,
        telegram_file_id: &str,
        token: String,
    ) -> CloudBoostclicksResult<Vec<u8>> {
        // getting file path
        let url = self.build_url("", "getFile", &token);
        // TODO: add retries with their number taking from env
        let body: DownloadBodySchema = reqwest::Client::new()
            .get(url)
            .query(&[("file_id", telegram_file_id)])
            .send()
            .await?
            .json()
            .await?;

        // downloading the file itself
        let url = self.build_url("file/", &body.result.file_path, &token);
        let file = reqwest::get(url)
            .await?
            .bytes()
            .await
            .map(|file| file.to_vec())?;

        Ok(file)
    }

    /// Taking token by a value to force dropping it so it can be used only once
    #[inline]
    fn build_url(&self, pre: &str, relative: &str, token: &str) -> String {
        format!("{}/{pre}bot{token}/{relative}", self.base_url)
    }

    #[inline]
    fn normalize_chat_id(chat_id: ChatId) -> ChatId {
        // For channels/supergroups Telegram expects "-100" prefix. If user already
        // provided it (13+ digits), do not apply the prefix again.
        if chat_id <= -1_000_000_000_000 {
            return chat_id;
        }

        let n = chat_id.abs().checked_ilog10().unwrap_or(0) + 1;
        chat_id - (100 * ChatId::from(10).pow(n))
    }
}

