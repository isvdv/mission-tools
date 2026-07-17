# Mission Tools Web Dashboard

This folder adds a Next.js dashboard for the existing Mission Tools bot.

## What Was Added

- Token-only login page.
- Encrypted token storage through the existing `TokenStore`.
- Signed HTTP-only session cookie.
- Dashboard pages for Mission, Clean, Voice, Rich Presence, Username Checker, Delete Bot DM, Logs and Settings.
- Internal API routes with standardized JSON responses.
- Shared service layer in `src/services`.
- File-based logs in `data/web-logs.json`.

## Run

From the project root:

```bash
npm run app
```

This starts the Discord bot and the web dashboard together.

To run only the dashboard:

```bash
npm run web:install
npm run web:dev
```

Open:

```txt
http://localhost:3000
```

The Discord bot still runs separately:

```bash
npm start
```

## Installable App

### Windows `.exe`

From the project root:

```bash
npm run desktop:dist
```

The installer is generated at:

```txt
dist-desktop/Mission Tools Setup 1.0.0.exe
```

The desktop app starts the bundled Next.js server automatically and stores local data under `%APPDATA%/Mission Tools`.

### PWA

The dashboard is configured as a PWA with a web manifest, app icons, service worker and offline fallback. Start it, open `http://localhost:3000`, then use the browser install option or the **Instalar** button in the dashboard top bar when available.

## Environment

Copy `.env.example` to `.env` in the project root and fill the values.

Important web variables:

- `TOKEN_STORE_SECRET`: encrypts submitted tokens.
- `WEB_SESSION_SECRET`: signs browser sessions.
- `WEB_BASE_URL`: used for logout redirects.

## Security Notes

- The dashboard only supports token login.
- Submitted tokens are validated with `/users/@me`.
- Tokens are stored encrypted server-side and are not returned to the frontend.
- Sensitive APIs validate the signed session and the stored token before actions.
- Server-specific routes verify administrator or manage-server permission when a guild ID is supplied.

## TODO

- Wire `Delete Bot DM` to the live Discord bot client. The API route and logging are present, but deleting bot panel DMs needs a bridge to the running `discord.js` client.
- Gradually replace the remaining Discord panel handlers in `bot.ts` with direct calls to the new shared services.
