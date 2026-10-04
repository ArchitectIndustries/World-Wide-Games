# WorldWideGames

WorldWideGames is an **Architect Industries** browser-gaming platform for original instant-play games. The current tested source candidate is **v48 — Parallax Accord**, with **77 games across 125 genre tags**, **124 achievements**, and **49 remappable releases**.

## v48 — Parallax Accord

Parallax Accord is an original turn-based card-and-board strategy campaign built around three simultaneous districts, growing round energy, six envoy archetypes, district-specific scoring laws, and three rival delegations with distinct AI preferences. The six-round match structure supports comeback play, low-cost combo lines, high-power Foundry builds, persistent progression, campaign score checkpoints, touch controls, keyboard shortcuts, and gamepad district/action support.

Parallax Accord becomes the featured release and first PWA shortcut, joins Long Campaigns, and is automatically discoverable in Strategy Desk and Board & Tabletop. The offline cache advances to `wwg-v48`.

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
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — release gates and regression suites
- `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md` — release continuity and QA state

## Release gate status

v48 is source-QA green. Canonical GitHub `main` promotion remains blocked by connector write-safety authorization and the established Vercel project remains unavailable for authenticated deployment/listing through the current connector context. v48 is therefore a **verified release candidate rather than a fully shipped production release** until those gates are completed.

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
