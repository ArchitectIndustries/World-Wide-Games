# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current candidate source release is **v44 — Aetherglass Breaker**, with **74 games across 122 genre tags**, **118 unique achievements**, and **48 remappable releases**. Source QA is green; GitHub synchronization remains the release gate before v44 is described as fully shipped.


## v44 — Aetherglass Breaker

v44 adds **Aetherglass Breaker**, an original six-chamber brick-breaking campaign built for instant browser play. The campaign layers classic paddle-and-ball readability with armored crystals, moving glass formations, three-hit Aether Core targets, combo scoring, a rechargeable Focus slow-time mechanic, and three temporary relics: Wide Paddle, Multiball, and Safety Shield.

Aetherglass Breaker supports universal Arrow/A-D movement, remapped controls, keyboard, touch, and gamepad play; persistent best score, furthest chamber, and campaign-clear records; unlocked chamber practice; pause/restart; explicit objectives; and standard game events for stage clears, campaign completion, and eight-hit combo mastery. It becomes the featured release and first PWA shortcut. **Aetherglass Sealer** and **Prism Chain** raise the platform to **118 unique achievements**, the Classics, Reimagined collection grows to 16 archetypes with **Brick Breaker**, and the offline cache advances to `wwg-v44`.

## v43 — Neon Stack 2.0

v43 turns **Neon Stack** into a full falling-block classic rather than a minimal endless loop. Version 2.0 adds a fair seven-piece bag, hold slot, next preview, ghost placement, wall-kick rotation, combo/drop scoring, persistent records, and three distinct contracts: **Classic 40**, **Prism Sprint**, and **Ascension**. Arrow/WASD movement, touch controls, gamepad support, pause/restart, and clear contract objectives are built in.

Neon Stack is now the featured release and first PWA shortcut. The new **Prism Stack Master** achievement raises WorldWideGames to **116 unique achievements**, and the offline cache advances to `wwg-v43`.

## v42 — Reliability Sweep

v42 is a catalog-wide gameplay-correctness release. It keeps the catalog at **73 games / 121 genre tags / 115 achievements / 47 remappable releases** while correcting four reproducible state/logic defects found beyond the Orbit Breaker fix:

- **Skyhook Sprint 1.1:** checkpoints can no longer land inside a void and trap the player in an endless respawn fall.
- **Crownline Tactics 1.1:** Wardens retarget living operatives instead of wasting attacks on squad members killed earlier in the same enemy turn.
- **Vector League 1.1:** the final whistle freezes simulation immediately, preventing a post-result goal from changing the visible score after the final event.
- **Windward Cargo 1.2:** zero fuel/cargo and final delivery can no longer produce contradictory win + loss events in the same frame.
- Offline cache advances to `wwg-v42`, and a dedicated `tests/v42_reliability.py` release gate locks all four fixes.

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