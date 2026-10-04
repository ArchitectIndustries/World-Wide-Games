# WorldWideGames v48 — Parallax Accord

Released as a verified source candidate on 2026-10-03 by Architect Industries.

Parallax Accord adds an original three-delegation card-and-board strategy campaign built around three simultaneous district laws, six envoy card archetypes, growing round energy, adaptive rival drafting, persistent unlocks, touch/keyboard/gamepad input, and score-checkpointed campaign progression.

Platform integration expands WorldWideGames to **77 games / 125 genre tags / 124 achievements / 49 remappable releases**, adds **Accord Keeper** and **District Sweep**, makes Parallax Accord the featured release and first PWA shortcut, adds it to Long Campaigns, and advances offline caching to `wwg-v48`.

Release verification is green: 77/77 registered games boot, 77/77 runtime-clean in isolated Chromium, 77/77 game-detail objective/control pages, 49/49 remappable profiles, and 161/161 local-origin paths. Dedicated Parallax QA covers real energy/card commits, AI turns, retry checkpoints, the complete three-delegation campaign, telemetry, persistence, and mobile layout. A narrow-screen grid min-content overflow found during QA was fixed before packaging.

GitHub `main` remains safely unchanged at v44 because the required non-force catch-up write is blocked by the connector safety layer. Vercel access remains connector-limited. v48 is therefore not represented as fully shipped production.

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
