# WorldWideGames

WorldWideGames is an **Architect Industries** browser-gaming platform for original instant-play games. The current verified release is **v51 — Aegis Verge**, with **81 games across 126 genre tags**, **132 achievements**, and **53 remappable releases**.

## v51 — Aegis Verge

**Aegis Verge** is an original three-operation 3D hover-combat campaign built on the shared WorldWideGames procedural renderer. Drive through Helix Yard, Ion Reef, and Meridian Crown; destroy three shield pylons in each fortress, survive autonomous interceptor fire, use the Aegis Pulse to clear nearby threats, then collapse the exposed Bastion Core.

It supports keyboard, touch, and gamepad play, permanent Arrow/WASD fallbacks alongside the WorldWideGames remapping layer, persistent unlocks/best scores, local generated visuals/audio, and dual game-event telemetry. It uses no remote engine, paid API, or external runtime asset service.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/` in a modern browser.

## Project structure

- `index.html` — discovery/home experience and collections
- `game.html` — reusable game-detail shell
- `js/games.js` — canonical data-driven game catalog
- `js/app.js` — discovery, profile, achievements, challenges, recommendations, and release history
- `assets/wwg-input.js` — universal movement/remapping layer
- `assets/wwg-webgl.js` — shared procedural WebGL2 renderer with Canvas2D compatibility fallback
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — release gates and regressions
- `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md` — continuity and QA records

## Release gate

v51 source QA is green. Verified v51 source commit: `7371080a69df9584189189d23ac4643d9be4e87e`. See `PROJECT_STATE.md` for final GitHub-main, Library-persistence, Vercel, and evidence-boundary status.

WorldWideGames is owned and operated by **Architect Industries**.
