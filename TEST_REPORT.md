# WorldWideGames Validation Report

Date: 2026-10-03
Release: **v44 — Vanta Frontline**

## Release result

**PASS — source QA gate green. GitHub synchronization and production deployment are tracked as separate release-management gates.**

## v44 tactical FPS validation

`python3 tests/v44_vanta.py`

- Validates all three 25×18 operations, exactly three encrypted uplinks per operation, extraction endpoints, mixed rifle/rusher/sniper response teams, and health/ammo pickups.
- Validates Low/Medium/High graphics-profile switching and 390×844 mobile layout without horizontal overflow.
- With a stored I/J/K/L/F/H custom keymap, ArrowRight and W still move through the shared universal movement layer.
- Reload transfer, armor absorption, line-of-sight rifle damage, and one-round ammunition consumption pass deterministic boundary checks.
- A pre-release initial-render defect was reproduced: the animation loop could raycast an empty grid before deployment. The release now parses operation 1 before the first frame; the browser harness is page-error clean.
- A second pre-release defect was reproduced: a failed attempt could carry its earned score into retry. Operation-start score checkpoints now restore the pre-attempt score on death, preventing retry farming.
- The real extraction rule clears all three operations, emits three `operation-complete` events plus `campaign-complete`, and persists clear/best-operation/best-score records.

full-catalog Chromium release harness

- Static release assertions confirm **74** unique games / **121** genre tags / **118** unique achievements / **47** remappable releases.
- Sole featured release: **Vanta Frontline 1.0**; first PWA shortcut targets Vanta Frontline and cache is `wwg-v44`.
- Vanta Operator + Signal Sweep achievements, v44 release-history wiring, and all catalog game/cover paths are present.
- **74/74 runtime-clean** in isolated Chromium.
- Generic interaction produced observable state change in **71** titles.
- Atlas Below, Lumen Relay, and Forgeflow remain the three known generic-harness no-change cases with direct mechanic-specific coverage.



## Platform and retained regressions

- `node tests/smoke.js`: **74/74** registered games boot; homepage and reusable game-detail shell boot.
- `python3 tests/v41_controls_browser.py`: **74/74** detail pages show explicit objectives/controls; **47/47** remappable releases expose the current/universal keyboard profile.
- `python3 tests/v32_http.py`: **155/155** local-origin release paths return HTTP 200.
- `python3 tests/v42_reliability.py`: Skyhook safe checkpoints, Crownline living-target AI, Vector final-whistle freeze, and Windward single-terminal-event semantics remain green.
- Deep regressions remain green for Ironlight 3.0, Astral Menagerie 3.1, Polyforge Studio 3.0, Ashen Covenant 2.0, Verdant Echoes 2.0, Rune Depths, Circuit Rush, Fluxward Conclave, Pulsevine Parkour, and score-direction semantics.

## v43 Neon Stack 2.0

Pre-release Neon Stack contract harness

- Active piece + next queue + remaining bag form one complete seven-piece set before the next shuffle cycle.
- ArrowRight and D remain valid movement aliases with a stored I/J/K/L/F/H custom keymap.
- Hold stores the active prism and cannot be reused until the next prism deploys.
- Rotation near the right boundary succeeds through wall-kick resolution.
- Pause/resume and restart paths remain functional.
- Classic 40, Prism Sprint, and Ascension all complete through the real merge/line-clear/goal path and emit their standard events.
- Ascension clear persistence and sprint record persistence write successfully.
- 390×844 layout has no horizontal overflow.

Static v43 release assertions

- 73 unique game IDs / 121 genre tags / 116 unique achievements / 47 remappable releases.
- Neon Stack metadata is version 2.0 with an explicit contract objective and high-score semantics.
- Sole featured game is Neon Stack; PWA first shortcut targets Neon Stack; cache is `wwg-v43`.
- Seven-bag, hold, wall-kick, sprint, and Ascension source invariants are present.
- Public-facing source remains clear of prohibited internal tooling references.

## v43 catalog regression

- `node tests/smoke.js`: 73/73 game boot checks pass; homepage and game-detail shells pass.
- `python3 tests/v41_controls_browser.py`: 73/73 objective/control pages and 47/47 remappable profiles pass.
- `python3 tests/v41_catalog_audit.py`: 73/73 runtime-clean; 70 titles show generic state change and the same three mechanic-specific exceptions remain covered separately.
- `python3 tests/v42_reliability.py`, `tests/v41_classics.py`, and `tests/v41_orbit_breaker.py` remain green.
- Deep regressions remain green for Ironlight 3.0, Astral Menagerie 3.1, Polyforge 3.0, Ashen Covenant 2.0, Verdant Echoes 2.0, Rune Depths, Circuit Rush, Fluxward Conclave, Pulsevine Parkour, and score-direction semantics.
- `python3 tests/v32_http.py`: 153/153 local-origin pages/assets return HTTP 200. The local test server logged benign client-disconnect `BrokenPipeError` messages after successful responses; the asserted delivery result remained 153/153.

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

GitHub `main` was inspected at finalized v41 commit **`8ded69db99ad6d99b6bb0d17693d0b3d1d461460`** before v42 promotion. The complete verified v42 source was committed as **`f9d27674227fb04173fe7459aa129645673c1d95`**; `main` was re-read immediately before promotion, then advanced by a **non-force fast-forward** and re-verified at that commit. Release-state documentation was then finalized at **`0393a86790cbe3b5cfc32161d27e8e1d08c6b0c7`** and `main` was re-verified there. Fresh Vercel deployment enumeration remains **403 Forbidden**; authenticated production fetch is also denied and project lookup retains the connector/schema mismatch, so no v42 production deployment is claimed.