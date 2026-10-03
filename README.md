# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v45 — Vector Shatter**, with **75 games across 122 genre tags**, **120 unique achievements**, and **48 remappable releases**.

## v45 — Vector Shatter

Vector Shatter is an original five-sector brick-breaker campaign with angle-controlled paddle rebounds, armored and prism panels, five powerup systems, multiball, Guard recovery, combo scoring, persistent local records, touch controls, gamepad support, and universal Arrow/A-D movement alongside saved custom remaps.

It is the featured v45 release, the first PWA shortcut, and the Brick Breaker entry in Classics, Reimagined. The offline cache is `wwg-v45`.

## Run locally

Serve the repository with a local static HTTP server, then open the root page in a modern browser. No paid API, remote asset service, game engine install, or external runtime dependency is required for the bundled catalog.

## Project structure

- `index.html` — discovery/home experience
- `game.html` — reusable game-detail shell
- `js/games.js` — data-driven catalog
- `js/app.js` — discovery, profile, achievement, and classics logic
- `assets/wwg-input.js` — shared input/remapping layer
- `games/` — self-contained games
- `covers/` — local cover artwork
- `tests/` — release and regression gates
- `PROJECT_STATE.md`, `TEST_REPORT.md`, and `RELEASE_NOTES.md` — release continuity

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
