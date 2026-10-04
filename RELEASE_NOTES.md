# WorldWideGames v49 — Procedural Worlds

Prepared as a verified source candidate on 2026-10-04 by Architect Industries.

Procedural Worlds establishes a reusable original 3D runtime for WorldWideGames and launches it with two different genres: **Cinderline Velocity 1.0**, a three-circuit hover-racing campaign, and **Glasswild Ascent 1.0**, a three-expedition traversal/platforming campaign. Both use locally generated geometry/visuals/audio, persistent progression, touch/gamepad input, universal plus remapped controls, and dual telemetry.

The shared `assets/wwg-webgl.js` engine attempts WebGL2 first and cleanly falls back to a Canvas2D compatibility renderer. The current CI Chromium environment does not expose a WebGL context, so campaign QA exercised the fallback while WebGL2 shader/source paths were statically validated. No GPU-rendered WebGL claim is made from this environment.

Platform integration expands WorldWideGames to **79 games / 125 genre tags / 128 achievements / 51 remappable releases**, adds four achievements, makes Cinderline Velocity the featured release/first PWA shortcut, adds both games to Flagship Worlds and Long Campaigns, and advances offline caching to `wwg-v49`.

The release also strengthens test infrastructure: smoke testing now executes local script dependencies in document order; the full catalog audit is catalog-driven rather than hard-coded to a historical game total and inlines every local script dependency; local HTTP coverage includes the shared 3D engine.

Release verification is green: **79/79 registered games boot, 79/79 runtime-clean, 79/79 objective/control pages, 51/51 remappable profiles, and 166/166 local-origin paths**, with the complete v48→v41 flagship/reliability regression chain retained.

GitHub source synchronization is complete: verified source commit `8be1f4d846358a08a59f5069c7e1be4e7dc940eb` is on canonical `main` after a non-force fast-forward and a 21/21 blob-SHA verification. Vercel remains a separate connector-limited production gate and is recorded in `PROJECT_STATE.md`.

---

# WorldWideGames Release Notes


## v47 — Lattice Armada — 2026-10-03

WorldWideGames adds **Lattice Armada 1.0**, an original four-sector vertical shoot-'em-up campaign from Architect Industries.

### New game

- Four sectors: Prism Wake, Fold Line, Citadel Array, Crown Lattice.
- Scout, Weaver, Turret, and elite formation enemies.
- Chain scoring plus Rapid, Tri-shot, and Shield weapon cores.
- Charge-based Phase Burst clears hostile fire and damages formations/bosses.
- Multi-pattern Crown Array final boss.
- Cumulative campaign score, sector-start retry checkpoints, persistent best/furthest/clear/perfect records.
- Arrow/WASD plus saved custom remaps, touch controls, gamepad support, pause/restart, sector selection, procedural audio respecting WorldWideGames preferences.

### Platform

- Catalog: **76 games / 124 genre tags / 122 achievements / 49 remappable releases**.
- Added **Armada Breaker** and **Sector Sweeper** achievements.
- Added `Vertical Shoot ’Em Up` to Classics, Reimagined.
- Lattice Armada becomes the sole featured release and first PWA shortcut.
- Offline cache advances to `wwg-v47`.
- Rift Relay 2.0 metadata/release history is integrated directly into canonical source; `js/v46-patch.js` is removed.
- v46 event telemetry compatibility (`game` or `gameId`) remains active.

### QA

Dedicated Lattice Armada, Rift Relay, event bridge, Vector Shatter, Vanta Frontline, smoke, controls/objectives, full-catalog Chromium, reliability, classics, and local HTTP suites are green. Final catalog evidence: **76/76 runtime-clean**, **76/76 boot**, **76/76 objective/control pages**, **49/49 remappable profiles**, **159/159 local-origin paths**.

### Release gate

The complete source is packaged and tested, but this version is not labeled fully shipped because canonical GitHub `main` remains v44. A Library upload attempt also failed with `container_session_unavailable`; the tested working archives remain available for direct download and future catch-up. The verified v45 branch is a strict fast-forward, but both non-force ref promotion and PR fallback were blocked by connector safety authorization. Vercel project inspection remains authorization-limited (404 exact project lookup / 403 deployment listing). No duplicate project was created.

## v46 — Rift Relay 2.0 — 2026-10-03

Rift Relay was rebuilt into a six-arena cooperative relay campaign with Solo Link AI, Local Duo play, ordered gates, tether pressure, shared shields, defensive pulse abilities, patrol shards, mines, gravity wells, sweep beams, persistent arena unlocks/records, touch input, and two-gamepad support. The game-detail event bridge was also corrected to accept both legacy `game` and modern `gameId` payloads.

## v45 — Vector Shatter — 2026-10-03

Added the five-sector Vector Shatter brick-breaker campaign with angle-controlled rebounds, armored/prism panels, multiball, Wide/Multi/Slow/Guard/Pierce powers, persistent records, touch/gamepad input, new achievements, and the Brick Breaker Classics archetype.

Earlier release history remains preserved in Git history and prior release packages.
