# cloud.boostclicks

Современное облачное хранилище поверх Telegram. Файлы хранятся в Telegram-каналах, сервер держит только метаданные и управляет доступом.

## Ключевые возможности

- Вход через Telegram (основной способ).
- Мультиоблака: несколько облаков, несколько ботов, несколько пользователей.
- Роли доступа: Просмотр, Редактирование, Админ.
- Большие файлы: нарезка на чанки и сборка при скачивании.
- PWA + Capacitor для упаковки в Android/iOS.

## Как это работает

1. Пользователь входит через Telegram.
2. Добавляет токен бота (или нескольких ботов) для работы с Telegram API.
3. Создает облако, указывая ID Telegram-канала.
4. Приложение сохраняет метаданные в Postgres и управляет доступами.
5. Файлы разбиваются на части, загружаются в Telegram и собираются при скачивании.

## Стек

- Backend: Rust, Axum, SQLx, JWT.
- БД: PostgreSQL.
- Frontend: SolidJS + SUID (Material UI) + Vite.
- Mobile: PWA + Capacitor (Android/iOS).
- Инфраструктура: Docker, Docker Compose, Nginx/Traefik.

## Быстрый старт (Docker)

1. Скопируйте `.env.example` в `.env` и заполните:

- `TELEGRAM_LOGIN_BOT_TOKEN`
- `VITE_TELEGRAM_LOGIN_BOT_USERNAME=cloudBoostclicks_bot`
- `SECRET_KEY`

2. Запуск:

```sh
docker compose up -d --build
```

3. Откройте:

- API: `http://localhost:8000`
- Web: `http://localhost:8000` (UI обслуживается сервером API)

## Переменные окружения (минимум)

Backend (`.env`):

- `PORT`, `WORKERS`, `CHANNEL_CAPACITY`
- `SUPERUSER_EMAIL`, `SUPERUSER_PASS`
- `SECRET_KEY`
- `TELEGRAM_API_BASE_URL`
- `TELEGRAM_LOGIN_BOT_TOKEN`
- `TELEGRAM_LOGIN_MAX_AGE_SECS`
- `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT`

Frontend (`ui/.env` или build args):

- `VITE_API_BASE` (по умолчанию `http://localhost:8000/api`)
- `VITE_TELEGRAM_LOGIN_BOT_USERNAME`

## Локальная разработка

Backend:

```sh
cd backend
cargo run
```

Frontend:

```sh
cd ui
pnpm i
pnpm run dev
```

## Android/iOS (Capacitor)

1. Установите зависимости:

```sh
cd ui
pnpm i
```

2. Сборка и синхронизация:

```sh
pnpm run build
pnpm cap:sync
```

3. Добавьте платформы:

```sh
pnpm cap:add:android
pnpm cap:add:ios
```

4. Открыть нативные проекты:

```sh
pnpm cap:open:android
pnpm cap:open:ios
```

## Деплой

- Рекомендуется reverse-proxy (Nginx/Traefik) и TLS.
- Домен: `app.boostclicks.ru`.
- Не храните `TELEGRAM_LOGIN_BOT_TOKEN` в репозитории.

## Контакты разработчика

BoostClicks — Евгений Леонтьев

- Telegram: https://t.me/boostclicks
- Сайт: https://boostclicks.ru

---

# cloud.boostclicks (EN)

A modern cloud storage built on top of Telegram. File payloads live in Telegram channels, while the server stores metadata and handles access control.

## Key Features

- Telegram login (primary).
- Multi-cloud, multi-bot, multi-user.
- Access roles: Viewer, Editor, Admin.
- Large files via chunking and reassembly.
- PWA + Capacitor packaging for Android/iOS.

## How It Works

1. User signs in with Telegram.
2. Adds one or more bot tokens to access Telegram API.
3. Creates a cloud by providing a Telegram channel ID.
4. Metadata is stored in Postgres and access is managed by the API.
5. Files are chunked, uploaded to Telegram, and reassembled on download.

## Tech Stack

- Backend: Rust, Axum, SQLx, JWT.
- DB: PostgreSQL.
- Frontend: SolidJS + SUID (Material UI) + Vite.
- Mobile: PWA + Capacitor (Android/iOS).
- Infra: Docker, Docker Compose, Nginx/Traefik.

## Quick Start (Docker)

1. Copy `.env.example` to `.env` and set:

- `TELEGRAM_LOGIN_BOT_TOKEN`
- `VITE_TELEGRAM_LOGIN_BOT_USERNAME=cloudBoostclicks_bot`
- `SECRET_KEY`

2. Start:

```sh
docker compose up -d --build
```

3. Open:

- API: `http://localhost:8000`
- Web UI: `http://localhost:8000` (served by the API)

## Environment (minimal)

Backend (`.env`):

- `PORT`, `WORKERS`, `CHANNEL_CAPACITY`
- `SUPERUSER_EMAIL`, `SUPERUSER_PASS`
- `SECRET_KEY`
- `TELEGRAM_API_BASE_URL`
- `TELEGRAM_LOGIN_BOT_TOKEN`
- `TELEGRAM_LOGIN_MAX_AGE_SECS`
- `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT`

Frontend (`ui/.env` or build args):

- `VITE_API_BASE` (defaults to `http://localhost:8000/api`)
- `VITE_TELEGRAM_LOGIN_BOT_USERNAME`

## Local Development

Backend:

```sh
cd backend
cargo run
```

Frontend:

```sh
cd ui
pnpm i
pnpm run dev
```

## Android/iOS (Capacitor)

1. Install dependencies:

```sh
cd ui
pnpm i
```

2. Build and sync:

```sh
pnpm run build
pnpm cap:sync
```

3. Add platforms (once):

```sh
pnpm cap:add:android
pnpm cap:add:ios
```

4. Open native projects:

```sh
pnpm cap:open:android
pnpm cap:open:ios
```

## Deploy

- Use a reverse proxy (Nginx/Traefik) + TLS.
- Domain: `app.boostclicks.ru`.
- Never commit `TELEGRAM_LOGIN_BOT_TOKEN` to git.

## Developer Contacts

BoostClicks — Evgeniy Leontiev

- Telegram: https://t.me/boostclicks
- Website: https://boostclicks.ru
