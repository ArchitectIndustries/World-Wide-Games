# WorldWideGames

WorldWideGames is an **Architect Industries** browser-gaming platform for original instant-play games. The current tested source candidate is **v50 — Skyvault Atlas**, with **80 games across 125 genre tags**, **130 achievements**, and **52 remappable releases**.

## v50 — Skyvault Atlas

**Skyvault Cartographer 1.0** expands the shared procedural 3D line into aerial exploration. Players fly three survey routes, scan five ordered beacons per region, use thermal columns to recover boost energy, avoid terrain impacts, and reach extraction gates while building persistent best-time and campaign records.

The release also improves the shared `assets/wwg-webgl.js` Canvas2D compatibility renderer with camera-pitch-aware perspective projection. This makes third-person craft/character framing more faithful when WebGL2 is unavailable while keeping the WebGL2-first renderer contract unchanged.

WorldWideGames discovery adds a **3D Worlds** collection, Skyvault Cartographer becomes the featured release and first PWA shortcut, and offline caching advances to `wwg-v50`.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/` in a modern browser. The bundled catalog requires no package installation, paid API, remote runtime asset service, or external game engine.

## Project structure

- `index.html` — discovery/home experience and collections
- `game.html` — reusable game-detail shell with objective, controls, records, and event telemetry
- `js/games.js` — canonical data-driven game catalog
- `js/app.js` — discovery, profile, achievements, challenges, recommendations, and release history
- `js/game-page.js` — reusable detail/runtime bridge accepting both `game` and `gameId` event identifiers
- `assets/wwg-input.js` — universal movement and local keyboard-remapping layer
- `assets/wwg-webgl.js` — shared procedural 3D renderer, deterministic utilities, audio helpers, and Canvas2D compatibility path
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — release gates and regression suites
- `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md` — release continuity and QA state

## Release gate status

v50 local/source QA is green. The verified GitHub source and release-state commit identifiers are recorded in `PROJECT_STATE.md` after synchronization. Vercel connector visibility remains authorization-limited, so production-origin verification is tracked separately from local/source evidence.

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
