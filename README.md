# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games that run directly in modern browsers.

## Current release

**v20** — 57 games, 90 genre tags, 67 local achievements, 22 remappable releases, responsive desktop/mobile layouts, PWA/offline support, local profiles, favorites, Play Later, ratings, score history, Daily and Weekly Circuits, deterministic Daily Pick, shareable discovery state, curated collections, recommendations, and three-game discovery mixes.

Featured release: **Mirrormesh Relay**.

## Run locally

Serve this folder with any static HTTP server. For example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

The project contains no required server-side runtime or paid API dependency.

## Structure

- `index.html` — discovery/home platform
- `game.html` — reusable game detail/launch shell
- `js/games.js` — data-driven game catalog
- `js/app.js` — platform/profile/discovery logic
- `assets/wwg-input.js` — shared remappable input layer
- `games/*/index.html` — self-contained game builds
- `covers/*.svg` — local game cover art
- `tests/` — static, runtime, browser, HTTP, remap, score-event, and authored-content checks
- `sw.js` / `manifest.webmanifest` — PWA/offline support
- `vercel.json` — static Vercel configuration

## Canonical project targets

- Source mirror: `ArchitectIndustries/World-Wide-Games`
- Production project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`
- Production origin: `https://worldwidegames.vercel.app`

WorldWideGames is owned and operated by Architect Industries.
