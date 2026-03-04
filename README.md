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
```

The calendar API returns `[]` when these variables are missing.

## Google Calendar OAuth2 Setup

This project uses Google Calendar API with OAuth2 refresh tokens (no public iCal URL).

1. Ensure your Google OAuth client allows redirect URI:
   - `http://localhost:8085/callback`
2. Run the one-time auth helper:

```bash
bun scripts/google-auth.js
```

3. Sign in and grant access.
4. Copy the printed `GOOGLE_REFRESH_TOKEN` into `.env`.
5. Set `GOOGLE_CALENDAR_ID` to the target calendar ID.

Notes:
- The script requests `https://www.googleapis.com/auth/calendar.events.readonly`.
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
- Filesystem usage (`si.fsSize`) -> `disk.used`, `disk.total`
- CPU temperature (`si.cpuTemperature`) -> `temp`
- System uptime (`si.time`) -> `uptime`

Dashboard behavior:
- `useStats` polls every 3 seconds and computes `cpuPercent`, `ramPercent`, and `diskPercent`.
- `StatsPanel` shows:
  - Uptime chip (`Xd Yh`)
  - Service count chip (based on loaded services)
  - CPU, RAM, Disk, and Temp bars/values
- Disk source:
  - If `HOST_FS` is set (Docker uses `/hostfs`), the API uses that mount when available.
  - Otherwise it falls back to `/`.

## Docker

`docker-compose.yml` passes the Google Calendar env vars into the container.
The app is exposed on `http://localhost:5000`.

```bash
docker compose up -d --build
```
