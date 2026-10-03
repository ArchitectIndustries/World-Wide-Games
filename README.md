# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v41 — Playability & Classic Vault**, with **73 games across 121 genre tags**, **115 unique achievements**, and **47 remappable releases**.

## v41 — Playability & Classic Vault

v41 is a usability-and-classics release driven by direct play feedback.

- **Astral Menagerie 3.1** fixes two input defects: Arrow/WASD movement now remains available even after a custom keyboard remap is saved, and **E** correctly studies habitat nodes outside battle instead of being consumed as the Secondary action. Astral also gains a live **Next Objective** HUD and an in-game objective guide.
- Shared remappable movement now treats **Arrow keys and W/A/S/D as permanent universal movement aliases**. A custom directional remap is additive instead of replacing those familiar movement keys.
- Every game detail page now has a separate **How to win** objective card, and full-size discovery cards show a concise **Goal** line.
- The homepage adds **Classics, Reimagined**, which makes familiar game archetypes easy to find without copying protected franchises: retro corridor FPS, classic snake, maze chase, falling blocks, space-rock shooter, pinball, top-down adventure, creature collection RPG, platformer, arcade racing, tower defense, arena survival, stealth maze, arcade duel, and rhythm arcade.
- **Neon Serpent 2.0** begins with a clean hazard-free **Classic Snake** contract before unlocking three progressively more complex remix contracts.
- **Orbit Breaker 1.1** fixes false shield loss: only direct asteroid collisions can damage the ship, missed asteroids are harmless, and post-hit invulnerability prevents multi-hit chains.
- New game **Pulse Maze 1.0** is an original three-maze chase arcade campaign with signal shards, four distinct Prism Hunter behaviors, power-pulse reversals, fruit bonuses, lives, escalating speed, touch/gamepad input, and persistent best/clear records.
- Pulse Maze is the featured release; the PWA shortcuts now surface **Maze Chase**, **Snake**, and the **Retro FPS** directly.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a modern browser. No package installation, paid API, remote runtime asset service, or external game engine is required for the bundled catalog.

## Project structure

- `index.html` — discovery/home experience and Classics, Reimagined shelf
- `game.html` — reusable game-detail shell with explicit objective and controls
- `js/games.js` — data-driven game catalog
- `js/app.js` — discovery/profile/achievement/classics logic
- `assets/wwg-input.js` — shared universal movement + keyboard-remapping layer
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — release gates and regression coverage
- `CATALOG_AUDIT.md` / `LONGFORM_AUDIT.md` — quality/depth evidence
- `PROJECT_STATE.md` / `TEST_REPORT.md` / `RELEASE_NOTES.md` — durable release continuity

## Branding

WorldWideGames is owned and operated by **Architect Industries**.