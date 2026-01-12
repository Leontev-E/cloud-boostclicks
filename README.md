# cloud.boostclicks

[Русская версия](#русский) · [English version](#english) · [Открыть продукт](https://cloud.boostclicks.ru/login)

---

## Русский

**cloud.boostclicks** — облачное хранилище поверх Telegram. Файлы живут в ваших Telegram‑каналах, сервер хранит только метаданные и управляет ссылками на доступ/скачивание.

### Что умеет
- Вход через Telegram (основной способ).
- Несколько ботов на одно облако для ускорения загрузки/выдачи.
- Файлы и папки с шарингом по ссылке (включить/выключить в один клик).
- Крупные файлы: нарезка на чанки (20 МБ) и сборка при скачивании.
- PWA: установка на главный экран + сборка в вебвью (Capacitor) для Android/iOS.
- Индикация загрузки/скачивания, пагинация, список облаков/ботов.
- Контакты в футере, открытие через домен `cloud.boostclicks.ru` с HTTPS.

### Как это работает
1) Войти через Telegram.  
2) Добавить токен бота(ов), привязанных к вашему каналу.  
3) Создать облако, указав ID канала, и добавить бота админом в канал.  
4) Загружать файлы (обычные и большие) — они уходят в Telegram, метаданные остаются на сервере.  
5) Делиться ссылкой на файл/папку или скачивать прямо из интерфейса.

### Стек
- Backend: Rust, Axum, SQLx, JWT.
- DB: PostgreSQL.
- Frontend: SolidJS + SUID (Material UI) + Vite.
- Mobile: PWA + Capacitor (Android/iOS).
- Infra: Docker / Docker Compose, Nginx (TLS/прокси), Telegram Bot API.

### Развертывание на своём сервере
Требования: Docker + Docker Compose, публичный домен и TLS (Nginx/Traefik).

1. Клонировать репозиторий и перейти в корень:
   ```sh
   git clone https://github.com/Leontev-E/cloud-boostclicks.git
   cd cloud-boostclicks
   ```
2. Создать `.env` (пример ниже) и указать:
   - `TELEGRAM_LOGIN_BOT_TOKEN`
   - `VITE_TELEGRAM_LOGIN_BOT_USERNAME` (например, `cloudBoostclicks_bot`)
   - `SECRET_KEY`
   - Параметры БД (`DATABASE_*`)
3. Запустить:
   ```sh
   docker compose up -d --build
   ```
4. Настроить reverse-proxy и HTTPS на домен (`cloud.boostclicks.ru` или свой).

Минимальный `.env`:
```
PORT=8000
WORKERS=4
CHANNEL_CAPACITY=32
SECRET_KEY=change-me
TELEGRAM_API_BASE_URL=https://api.telegram.org
TELEGRAM_LOGIN_BOT_TOKEN=xxx:yyy
TELEGRAM_LOGIN_MAX_AGE_SECS=86400
VITE_TELEGRAM_LOGIN_BOT_USERNAME=cloudBoostclicks_bot
DATABASE_USER=cloud_boostclicks
DATABASE_PASSWORD=cloud_boostclicks
DATABASE_NAME=cloud_boostclicks
DATABASE_HOST=db
DATABASE_PORT=5432
```

### Локальная разработка
- Backend:
  ```sh
  cd backend
  cargo run
  ```
- Frontend:
  ```sh
  cd ui
  pnpm i
  pnpm run dev
  ```

### Контакты разработчика
BoostClicks — Евгений Леонтьев  
Telegram: https://t.me/boostclicks  
Сайт: https://boostclicks.ru

---

## English

**cloud.boostclicks** is a Telegram-backed cloud. File payloads stay in your Telegram channels; the server stores metadata and controls link sharing/downloads.

### Features
- Telegram login (primary).
- Multiple bots per cloud to speed up uploads/downloads.
- File & folder sharing via link (toggle on/off).
- Large files: 20 MB chunks, reassembled on download.
- PWA ready; packaged to Android/iOS via Capacitor.
- Progress indicators, pagination, cloud/bot lists.
- HTTPS domain `cloud.boostclicks.ru` with contact info in the footer.

### How it works
1) Sign in with Telegram.  
2) Add bot token(s) linked to your channel.  
3) Create a cloud, set the channel ID, add the bot as channel admin.  
4) Upload files (small or large) — stored in Telegram; metadata stays on the server.  
5) Share links to files/folders or download directly from the UI.

### Stack
- Backend: Rust, Axum, SQLx, JWT.
- DB: PostgreSQL.
- Frontend: SolidJS + SUID (Material UI) + Vite.
- Mobile: PWA + Capacitor (Android/iOS).
- Infra: Docker / Docker Compose, Nginx (TLS/proxy), Telegram Bot API.

### Self-hosting
Prereqs: Docker + Docker Compose, public domain + TLS.
1. Clone:
   ```sh
   git clone https://github.com/Leontev-E/cloud-boostclicks.git
   cd cloud-boostclicks
   ```
2. Create `.env` (see sample above) with:
   - `TELEGRAM_LOGIN_BOT_TOKEN`
   - `VITE_TELEGRAM_LOGIN_BOT_USERNAME` (e.g. `cloudBoostclicks_bot`)
   - `SECRET_KEY`, DB params.
3. Run:
   ```sh
   docker compose up -d --build
   ```
4. Put Nginx/Traefik in front with HTTPS and point your domain.

### Dev
- Backend: `cd backend && cargo run`
- Frontend: `cd ui && pnpm i && pnpm run dev`

### Contacts
BoostClicks — Evgeniy Leontiev  
Telegram: https://t.me/boostclicks  
Website: https://boostclicks.ru
