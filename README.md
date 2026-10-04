# WorldWideGames

WorldWideGames is an **Architect Industries** browser-gaming platform for original instant-play games. The current tested source candidate is **v49 — Procedural Worlds**, with **79 games across 125 genre tags**, **128 achievements**, and **51 remappable releases**.

## v49 — Procedural Worlds

v49 establishes a reusable procedural 3D foundation for multiple genres instead of concentrating high-end browser rendering in a single FPS. The new local `assets/wwg-webgl.js` engine attempts WebGL2 first, provides a Canvas2D compatibility renderer when a GPU context is unavailable, generates its visuals/audio locally, and requires no remote game-engine or art service.

**Cinderline Velocity** is a three-circuit 3D hover-racing campaign with rival craft, ordered gates, drift-built boost, off-road grip loss, touch/gamepad support, remappable controls, and persistent circuit records.

**Glasswild Ascent** is a three-expedition 3D traversal/platforming campaign with memory echoes, moving platforms, momentum movement, coyote-time jumps, air dash, void recovery, checkpoints, touch/gamepad support, and persistent progression.

Cinderline Velocity is the featured release and first PWA shortcut; Glasswild Ascent is the second. Both join Flagship Worlds and Long Campaigns. Offline caching advances to `wwg-v49`.

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

v49 is source-QA green; verified source `8be1f4d846358a08a59f5069c7e1be4e7dc940eb` and release-state `914de1e77cce32159b7725b4686284952d99a9bb` are on canonical GitHub `main`, and the final source/records archives are persisted in `/WorldWideGames`. Vercel reports successful commit deployment status through GitHub integration, while independent public-origin smoke is still blocked by this execution environment's network/fetch path. `PROJECT_STATE.md` records the exact evidence boundary.

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
