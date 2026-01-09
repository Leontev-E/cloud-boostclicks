############################################################################################
####  SERVER
############################################################################################

# Using the `rust-musl-builder` as base image, instead of 
# the official Rust toolchain
FROM clux/muslrust:stable AS chef
USER root
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY ./backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
# Build application
COPY ./backend .
RUN cargo build --target x86_64-unknown-linux-musl --release

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

# We do not need the Rust toolchain to run the binary!
FROM scratch AS runtime
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/cloud_boostclicks /
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=ui /app/dist /ui
ENTRYPOINT ["/cloud_boostclicks"]
