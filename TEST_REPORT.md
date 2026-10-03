# WorldWideGames Validation Report

Date: 2026-10-03
Release candidate: **v44 — Aetherglass Breaker**

## Release result

**PASS — source QA gate green.** GitHub and production deployment are tracked as separate release-management gates.


## v44 Aetherglass Breaker

**PASS — local/source QA gate green.** GitHub synchronization and production deployment remain separate release-management gates until promoted.

- `python3 tests/v44_breaker.py`: PASS for six authored chambers, initial 40-brick field, universal Arrow movement under a custom remap, saved custom movement, Primary launch, Focus slow-time/drain, Wide Paddle / Multiball / Safety Shield, 8× combo mastery event, moving glass, three-hit Aether Core, real six-stage campaign completion, persistence, pause/restart, touch controls, and 390×844 mobile layout.
- `python3 tests/v44_static.py`: PASS on the tested package for **74 games / 122 genre tags / 118 achievements / 48 remappable releases**, sole featured Aetherglass Breaker, first PWA shortcut, Brick Breaker Classics mapping, `wwg-v44` cache, asset existence, and public-source hygiene.
- `node tests/smoke.js`: **74/74** registered games boot plus platform shells.
- `python3 tests/v41_controls_browser.py`: **74/74** detail pages expose objectives/controls and **48/48** remappable games expose current keyboard profiles.
- `python3 tests/v32_http.py`: **155/155** local-origin paths return HTTP 200.
- `python3 tests/v42_reliability.py`, `tests/v41_classics.py`, and `tests/v41_orbit_breaker.py`: PASS.
- Representative deep regressions pass for Ironlight, Astral Menagerie, Polyforge, Ashen Covenant, Verdant Echoes, Rune Depths, Circuit Rush, Pulsevine Parkour, and score-direction semantics.
- `tests/v41_catalog_audit.py` was attempted twice but exceeded the execution window before completion, so no v44 full-catalog interaction-pass claim is made from that harness.

## v43 Neon Stack 2.0

Neon Stack 2.0 passed the release checks for its seven-piece bag, hold lock, wall-kick rotation, universal movement, pause/restart flow, three contract completion paths, persistent records, and 390×844 mobile layout.

Catalog validation remains green at **73 games / 121 genre tags / 116 achievements / 47 remappable releases**. The sole featured release is Neon Stack, the offline cache is `wwg-v43`, and the first PWA shortcut opens Neon Stack.

Regression coverage remains green: 73/73 game boots, 73/73 objective/control pages, 47/47 remappable profiles, 73/73 runtime-clean catalog entries, 153/153 local-origin paths, the v42 reliability fixes, the v41 classics and Orbit Breaker checks, and the retained deep campaign suites.

## v42 reliability sweep

`python3 tests/v42_reliability.py`

- Skyhook Sprint: an arithmetic checkpoint that previously resolved into the 760–920 void is clamped onto a safe ground segment; a subsequent fall respawns on valid ground.
- Crownline Tactics: a Warden no longer attacks a 0-HP operative killed earlier in the same enemy turn; it retargets/moves toward a living operative.
- Vector League: match expiry with a ball already crossing the goal line emits one final result and leaves the scoreline frozen at the whistle.
- Windward Cargo: zero fuel on the final delivery frame produces only `route-ended`, not both completion and failure.

`python3 tests/v42_static.py`

- Cache is `wwg-v42`.
- Skyhook Sprint and Crownline Tactics are v1.1; Vector League is v1.1; Windward Cargo is v1.2.
- Fix-source invariants are present in the final release tree.

The full v41 catalog, controls, classics, Orbit Breaker, deep flagship, correctness, and score-direction suites were rerun on the v42 source and remain green.

## User-reported Astral Menagerie issue

`python3 tests/v41_astral_controls.py`

The failure was reproduced and fixed at two concrete input boundaries:

- With a stored custom `wwg:keymap` of I/J/K/L/F/H, Astral previously ignored normal Arrow/WASD movement. v41 proves **ArrowRight**, **D**, and the custom **L** mapping all move the same player in the same saved-remap session.
- E previously collided with the platform's default Secondary action before habitat Study could execute. v41 places contextual out-of-battle Study first; the regression positions the player on the authored Canopy Well and verifies **KeyE attunes the node**.
- The live objective HUD is verified to progress from remaining wild battles → trainer gauntlet → Warden.
- The objective guide explicitly describes the three-habitat campaign and universal Arrow/WASD movement.
- 390×844 layout has no horizontal overflow.

`python3 tests/v40_astral.py` also remains green on v41, covering the complete original v3 field studies, trainer/Warden campaign, post-Atlas rematches, Ascendant Wardens, Starlight mastery, persistence, and v2→v3 migration.

## Classic-game validation

`python3 tests/v41_classics.py`

### Neon Serpent 2.0

- Four contracts exist.
- Contract 1 is exactly **Classic Snake** with **0 drones / 0 gates**.
- Arrow/WASD movement remains active with a saved custom remap.
- Classic completion emits `classic-cleared`.
- Mobile-width layout passes.

### Pulse Maze 1.0

- Initial state now exists before the render loop; a pre-release `player undefined` boot/render error was detected and fixed.
- Maze starts with a populated shard field.
- Universal Arrow/WASD movement works with custom remap data present.
- A powered player/hunter collision defeats the hunter without consuming a life.
- Deterministic release-gate progression clears all **three authored mazes** through the real tick/end logic.
- At least three `maze-complete` events and a final `campaign-complete` event emit.
- Persistent clear count is written.
- 390×844 layout passes.

## Orbit Breaker false-loss regression

`python3 tests/v41_orbit_breaker.py`

- Reproduces the reported failure condition with an asteroid already below the playfield and verifies **zero shield damage**.
- Verifies a direct asteroid/ship overlap removes **exactly one** shield point.
- Verifies the post-hit invulnerability window prevents immediate chain damage from another overlapping asteroid.
- Verifies collision distance is wrap-aware across the left/right screen seam.
- Verifies the in-game objective text states that off-screen missed asteroids do not damage the ship.

## Objective and control presentation

`python3 tests/v41_controls_browser.py`

- **73/73 game-detail pages** render at least three authored control lines.
- **73/73 game-detail pages** render a non-empty explicit `How to win` objective.
- **47/47 remappable games** display current mappings and the universal Arrow/WASD movement rule.
- Representative legacy control expansion remains green.

## Static/release checks

`python3 tests/v41_static.py`

- **73** unique game IDs.
- **121** genre tags.
- **115** unique achievements.
- **47** remappable releases.
- Sole featured game: **Pulse Maze**.
- Astral Menagerie **3.1**, Neon Serpent **2.0**, Pulse Maze **1.0**.
- `Classics, Reimagined` collection/home shelf present.
- PWA shortcuts: Pulse Maze, Neon Serpent, Ironlight Breach.
- Offline cache: `wwg-v42`.
- All catalog game/cover asset paths exist.
- Public-facing source scan remains clear of prohibited internal branding/tool references.

## Full-catalog browser audit

`python3 tests/v41_catalog_audit.py`

- **73/73 games runtime-clean** in isolated Chromium.
- Generic interaction generated observable state change in **70** titles.
- Atlas Below, Lumen Relay, and Forgeflow retain direct mechanic-specific coverage.

## Boot and HTTP delivery

- `node tests/smoke.js`: **73/73 registered games boot**; homepage and reusable detail shell boot.
- `python3 tests/v32_http.py`: **153/153** local-origin paths return HTTP 200.
- `python3 tests/v32_remap.py`: custom I/J/K/L/F/H regression remains green.

## Deep regressions retained

The following suites remain green on the v42 source:

- `python3 tests/v39_ironlight.py` — five-sector retro FPS, three weapons, projectile sentries, cipher/vault routes, checkpoint semantics.
- `python3 tests/v38_polyforge.py` — grouped assemblies, drag gizmos, scene codes, history and seven certification briefs.
- `python3 tests/v37_ashen.py` — three pilgrimage paths, weapons, forging, death recovery, Lord patterns and persistence.
- `python3 tests/v35_verdant.py` — connected two-area quest/equipment/boss campaign.
- `python3 tests/v31_rune_depths.py` — Heart/Edge/Flask mastery and persistence.
- `python3 tests/v27_fixes.py` — catalog correctness fixes.
- `node tests/v26_direction.js` — score-direction semantics.
- `python3 tests/v28_circuit.py` — ordered racing checkpoints/rivals/boost/podium.
- `python3 tests/v28_game.py` — Fluxward tactical interactions and events.
- `python3 tests/v30_pulsevine.py` — five-course physics reachability and controls.

## Browser evidence limitation

The `agent-browser` CLI required by the preferred dev-server verification workflow is not installed in this execution environment. Direct Playwright navigation to localhost is also blocked by the runtime administrator. Browser evidence therefore comes from the established self-contained Chromium/Playwright page harness, while HTTP-origin evidence comes from the project's local HTTP path test. Neither is represented as production-origin verification.

## GitHub/Vercel

GitHub `main` was inspected at finalized v41 commit **`8ded69db99ad6d99b6bb0d17693d0b3d1d461460`** before v42 promotion. The complete verified v42 source was committed as **`f9d27674227fb04173fe7459aa129645673c1d95`**; `main` was re-read immediately before promotion, then advanced by a **non-force fast-forward** and re-verified at that commit. Fresh Vercel deployment enumeration remains **403 Forbidden**; authenticated production fetch is also denied and project lookup retains the connector/schema mismatch, so no v42 production deployment is claimed.