use std::sync::Arc;

use axum::{
    body::Full,
    extract::{Path, State},
    http::StatusCode,
    response::{AppendHeaders, IntoResponse, Response},
    routing::get,
    Json, Router,
};
use reqwest::header;
use tokio_util::bytes::Bytes;
use uuid::Uuid;

use crate::{
    common::routing::app_state::AppState,
    schemas::shares::ShareInfoSchema,
    services::shares::SharesService,
};

pub struct SharesRouter;

impl SharesRouter {
    pub fn get_router(state: Arc<AppState>) -> Router {
        Router::new()
            .route("/:share_id", get(Self::get_share))
            .route("/:share_id/tree", get(Self::tree))
            .route("/:share_id/download", get(Self::download))
            .route("/:share_id/download_folder", get(Self::download_folder))
            .with_state(state)
    }

    async fn get_share(
        State(state): State<Arc<AppState>>,
        Path(share_id): Path<Uuid>,
    ) -> Result<Json<ShareInfoSchema>, (StatusCode, String)> {
        let share = SharesService::new(&state.db, state.tx.clone())
            .get(share_id)
            .await
            .map_err(|e| <(StatusCode, String)>::from(e))?;

        Ok(Json(ShareInfoSchema::new(
            share.id,
            share.path,
            share.is_folder,
        )))
    }

    async fn tree(
        State(state): State<Arc<AppState>>,
        Path(share_id): Path<Uuid>,
    ) -> Result<Response, (StatusCode, String)> {
        SharesService::new(&state.db, state.tx.clone())
            .list_dir(share_id)
            .await
            .map(Json)
            .map(IntoResponse::into_response)
            .map_err(|e| <(StatusCode, String)>::from(e))
    }

    async fn download(
        State(state): State<Arc<AppState>>,
        Path(share_id): Path<Uuid>,
    ) -> Result<Response, (StatusCode, String)> {
        let service = SharesService::new(&state.db, state.tx.clone());
        let share = service
            .get(share_id)
            .await
            .map_err(|e| <(StatusCode, String)>::from(e))?;

        service
            .download_file(share_id)
            .await
            .map(|data| {
                let name = share
                    .path
                    .trim_end_matches('/')
                    .split('/')
                    .last()
                    .unwrap_or("shared_file");
                let bytes = Bytes::from(data);
                let body = Full::new(bytes);
                let content_type = mime_guess::from_path(name)
                    .first_or_octet_stream()
                    .to_string();
                let headers = AppendHeaders([
                    (header::CONTENT_TYPE, content_type),
                    (
                        header::CONTENT_DISPOSITION,
                        format!("attachment; filename=\"{name}\""),
                    ),
                ]);

                (headers, body).into_response()
            })
            .map_err(|e| <(StatusCode, String)>::from(e))
    }

    async fn download_folder(
        State(state): State<Arc<AppState>>,
        Path(share_id): Path<Uuid>,
    ) -> Result<Response, (StatusCode, String)> {
        let service = SharesService::new(&state.db, state.tx.clone());
        let share = service
            .get(share_id)
            .await
            .map_err(|e| <(StatusCode, String)>::from(e))?;

        service
            .download_folder(share_id)
            .await
            .map(|data| {
                let name = share
                    .path
                    .trim_end_matches('/')
                    .split('/')
                    .last()
                    .unwrap_or("shared_folder");
                let bytes = Bytes::from(data);
                let body = Full::new(bytes);
                let headers = AppendHeaders([
                    (header::CONTENT_TYPE, "application/zip".to_string()),
                    (
                        header::CONTENT_DISPOSITION,
                        format!("attachment; filename=\"{name}.zip\""),
                    ),
                ]);

                (headers, body).into_response()
            })
            .map_err(|e| <(StatusCode, String)>::from(e))
    }
}
