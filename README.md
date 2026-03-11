# ytbot

WhatsApp bot (Baileys) that detects YouTube links and returns a direct audio URL extracted with `yt-dlp`.

## Features

- Pair-code based WhatsApp login (no QR in terminal).
- Blacklist support (ignore specific senders).
- YouTube link detection (`youtube.com` + `youtu.be`).
- Direct audio link extraction via `yt-dlp -g -f bestaudio`.
- Modular codebase for easier maintenance and extension.

## Architecture

```text
index.js
└── src/
    ├── bot.js                  # WhatsApp connection lifecycle + reconnect logic
    ├── config/index.js         # Env-based configuration
    ├── handlers/messages.js    # Incoming message flow
    ├── services/ytdlp.js       # yt-dlp integration
    └── utils/
        ├── message.js          # Sender/text extraction from WA payload
        └── url.js              # YouTube and URL parsing helpers
```

## Prerequisites

- Node.js 18+
- `yt-dlp` installed and available in `PATH`
- A WhatsApp number to connect as the bot

## Installation

```bash
npm install
```

## Configuration

Environment variables:

- `AUTH_FOLDER` (default: `auth_info`) – Baileys session path.
- `LOG_LEVEL` (default: `info`) – Pino logging level.
- `BLACKLIST` (optional) – comma-separated phone numbers in international format (without `+`).

Example:

```bash
export BLACKLIST="972501234567,972540000000"
export LOG_LEVEL="silent"
```

## Run

```bash
npm start
```

On first run, enter the bot phone number and use the pairing code in WhatsApp linked devices.

## Validation

```bash
npm run check
```

## Operational Notes

- This bot currently handles text and extended-text message types.
- If `yt-dlp` is missing, extraction will fail and the user receives an error message.
- Auth files are written under `AUTH_FOLDER`; do not commit these credentials.

## Suggested Next Improvements

- Add unit tests for URL parsing and message extraction.
- Queue/rate-limit extraction requests for high-traffic usage.
- Add structured logging and metrics for production monitoring.
- Add support for non-text message wrappers (quoted/replied message payloads).
