############################################################################################
####  SERVER
############################################################################################

FROM rust:1-bookworm AS chef
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY ./backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY ./backend .
RUN cargo build --release

############################################################################################
####  UI
############################################################################################

FROM node:21-slim AS ui
WORKDIR /app
COPY ./ui .
RUN npm install -g pnpm
RUN pnpm i
ARG VITE_TELEGRAM_LOGIN_BOT_USERNAME
ENV VITE_API_BASE /api
ENV VITE_TELEGRAM_LOGIN_BOT_USERNAME=$VITE_TELEGRAM_LOGIN_BOT_USERNAME
RUN pnpm run build

############################################################################################
####  RUNNING
############################################################################################

FROM debian:bookworm-slim AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/cloud_boostclicks /usr/local/bin/cloud_boostclicks
COPY --from=ui /app/dist /ui
ENTRYPOINT ["cloud_boostclicks"]
