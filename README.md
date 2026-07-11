# Homebase

A friendly "Start Page" or "Homebase" for your family homelab built with Preact + Vite, served by a Bun backend.

## Requirements

- Bun 1.3+

## Install

```bash
bun install
```

## Run

- Dev (Vite + API middleware on `http://localhost:4001`)

```bash
bun run dev
```

- Production-style server (serves `dist/` + API on `http://localhost:4000`)

```bash
bun run build
bun run start
```

## Environment

Create a `.env` file in the repo root:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=
GOOGLE_CALENDAR_IDS=
```

The calendar API returns `[]` when these variables are missing.

Use `GOOGLE_CALENDAR_IDS` for multiple calendars as a comma-separated list. It takes precedence over the backward-compatible `GOOGLE_CALENDAR_ID` setting:

```env
GOOGLE_CALENDAR_IDS=primary,family-calendar-id@group.calendar.google.com
```

## Google Calendar OAuth2 Setup

This project uses Google Calendar API with OAuth2 refresh tokens (no public iCal URL).

1. Create or download a Google OAuth client with application type **Desktop app**. The helper uses the supported loopback callback `http://127.0.0.1:8085`.
2. Run the one-time auth helper:

```bash
bun scripts/google-auth.js
```

3. Sign in and grant access.
4. Copy the printed `GOOGLE_REFRESH_TOKEN` into `.env`.
5. Set `GOOGLE_CALENDAR_ID` to the target calendar ID.

When running the helper on the deployment host, it can update the ignored `.env` file without printing the token:

```bash
bun scripts/google-auth.js --update-env
```

Notes:
- The script requests `https://www.googleapis.com/auth/calendar.readonly` so it can discover calendar names and read events. It cannot create, edit, or delete calendar data.
- It uses `access_type=offline` and `prompt=consent` so Google returns a refresh token.

## API Endpoints

- `GET /api/services`
- `GET /api/stats`
- `GET /api/calendar`

`/api/calendar` returns:

```json
[
  {
    "id": "event-id",
    "title": "Event name",
    "time": "2:30 PM",
    "date": "Wed, Mar 4",
    "color": "#3B82F6",
    "icon": "ri-calendar-event-line"
  }
]
```

For all-day events, `time` is `"All day"`.

## Service Data (`data/services.json`)

The service cards are driven by [`data/services.json`](/home/mikekey/Builds/homepage/data/services.json), which is served by `GET /api/services` and rendered by `ServiceGrid` + `ServiceTile`.

How it works:
- `ServiceGrid` groups by `category`, sorts each group by `order`, and renders one tile per item.
- `ServiceTile` renders links for normal services and a non-link info card when `type: "info"`.
- For `type: "info"`, the optional `details` object is shown as extra rows (currently used for Minecraft host/ports).

Typical service item fields:
- `name` (string): display name and React key.
- `icon` (string): Remix Icon class, e.g. `ri-server-line`.
- `category` (string): category bucket used by `ServiceGrid` (must match a key in `CATEGORY_THEMES`).
- `color` (string): tile accent color (hex recommended).
- `description` (string): subtitle text.
- `order` (number): ascending sort order within category.
- `url` (string, optional): target URL; omitted for info-only cards.
- `type` (string, optional): use `"info"` for non-clickable informational tiles.
- `details` (object, optional): additional structured content for info tiles.

Example:

```json
{
  "name": "Proxmox",
  "icon": "ri-server-line",
  "url": "http://proxmox.home.local",
  "category": "infrastructure",
  "color": "#E97627",
  "description": "Virtualization",
  "order": 2
}
```

## System Stats (`systeminformation`)

Server stats come from `systeminformation` in [`api/stats.js`](/home/mikekey/Builds/homepage/api/stats.js) and are exposed via `GET /api/stats`.

Collected metrics:
- CPU current load (`si.currentLoad`) -> `cpu`
- Memory usage (`si.mem`) -> `ram.used`, `ram.total`
- Configured filesystem usage (`si.fsSize`) -> `disks`
- CPU temperature (`si.cpuTemperature`) -> `temp`
- System uptime (`si.time`) -> `uptime`
- Running Docker applications and containers -> `services.running`, `services.containers`

Dashboard behavior:
- `useStats` polls every 3 seconds and computes `cpuPercent`, `ramPercent`, and `diskPercent`.
- `StatsPanel` shows:
  - Uptime chip (`Xd Yh`)
  - Docker application count
  - CPU, RAM, configured disks, and temperature
- Docker application count:
  - Containers with the same `com.docker.compose.project` label count as one application.
  - Each standalone container counts as one application.
  - The Compose stack exposes only read-only container metadata through a private Docker socket proxy. The proxy publishes no host port and rejects POST requests.
- Disk sources:
  - `HOST_DISK_MOUNTS` lists host mounts exposed under `/hostfs`.
  - The default Compose configuration reports `/` as System and `/mnt/storage` as Storage.
  - Local development reads `/` and `/mnt/storage` directly when the variable is unset.

## Docker

`compose.yaml` passes the Google Calendar env vars into the container. Set either `GOOGLE_CALENDAR_ID` for one calendar or `GOOGLE_CALENDAR_IDS` for a comma-separated list.
The app is exposed on `http://localhost:5000`.

```bash
docker compose up -d --build
```

## Deploy

Commit your changes, then deploy from the project root:

```bash
bun run deploy
```

The command:

1. Requires a clean local working tree.
2. Runs the test suite and production build.
3. Pushes the current branch to `origin`.
4. Requires a clean homelab checkout.
5. Fast-forwards `/opt/stacks/homepage` to the pushed branch.
6. Rebuilds the `homepage` service with `compose.yaml`.
7. Verifies that `/api/services` and `/api/calendar` return valid arrays.

The homelab keeps secrets in its ignored `.env` file; deployment never copies that file. `.dockerignore` also excludes dotenv and downloaded OAuth credential files from Docker's build context.

Override deployment targets when needed:

```bash
DEPLOY_HOST=homelab \
DEPLOY_DIR=/opt/stacks/homepage \
DEPLOY_URL=http://192.168.1.3:5000 \
DEPLOY_SSH_CONFIG="$HOME/.ssh/config" \
bun run deploy
```
