# WorldWideGames v50 — Skyvault Atlas

Prepared as a verified source candidate on 2026-10-04 by Architect Industries.

Skyvault Atlas adds **Skyvault Cartographer 1.0**, an original three-region procedural 3D aerial exploration campaign. Players continuously fly a survey craft, scan five ordered beacons per region, manage boost energy, ride thermal columns, recover from terrain impacts at checkpoints, and reach extraction gates while building persistent route and campaign records.

The shared `assets/wwg-webgl.js` compatibility path now accounts for camera pitch during Canvas2D perspective projection, improving third-person framing when WebGL2 is unavailable. Cinderline Velocity and Glasswild Ascent dedicated campaign regressions remain green after the engine change.

Platform integration expands WorldWideGames to **80 games / 125 genre tags / 130 achievements / 52 remappable releases**, adds **Skyvault Atlas** and **Clean Air** achievements, introduces the catalog-driven **3D Worlds** collection, makes Skyvault Cartographer the featured release/first PWA shortcut, and advances offline caching to `wwg-v50`.

Release verification is green: **80/80 registered games boot, 80/80 runtime-clean, 80/80 objective/control pages, 52/52 remappable profiles, and 168/168 local-origin paths**. Dedicated v50 control/campaign/persistence/mobile QA passes, and the retained v49→v41 regression chain remains green.

GitHub synchronization, final archive persistence, and deployment-status evidence are recorded in `PROJECT_STATE.md` as the release gate completes. Vercel project/deployment connector visibility is currently authorization-limited; no duplicate project is created.

---

# WorldWideGames Release Notes

## v49 — Procedural Worlds — 2026-10-04

Added the shared procedural WebGL2/Canvas2D 3D runtime plus Cinderline Velocity and Glasswild Ascent, with persistent campaigns, touch/gamepad support, remappable controls, local generated visuals/audio, strengthened script-aware smoke/catalog tests, and atomic GitHub synchronization.

## v48 — Parallax Accord — 2026-10-04

Added a three-delegation card-and-board strategy campaign with growing round energy, district laws, envoy abilities, adaptive rival drafting, persistent unlocks, touch/keyboard/gamepad play, and campaign score checkpoints.



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
