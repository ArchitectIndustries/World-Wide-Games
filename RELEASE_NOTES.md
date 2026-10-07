# WorldWideGames Release Notes

## v72 — Harbor Pulse 1.1: Full Shift — 2026-10-06

- Fixes Harbor Pulse result ambiguity: reputation collapse and legitimate 90-second survival no longer share the same scored terminal event.
- Adds explicit `shift-cleared` and `shift-failed` outcomes while retaining neutral, unscored `shift-complete` compatibility telemetry.
- Only surviving the full 90-second shift with reputation remaining can mark Harbor Pulse cleared, earn Daily Circuit milestone credit, or submit a local best score.
- Failed shifts no longer update `wwg:harbor-best` or enter platform score history.
- Clarifies the objective/control copy and adds explicit Harbor score metadata.
- Dedicated Chromium regression, 82/82 whole-catalog interaction audit, 82/82 objective/control pages, 54/54 remappable profiles, 82/82 mobile homepage cards, and 178/178 local-origin paths are green.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.
- Build persistence note: the initial verified v72 package reached `/WorldWideGames`; a records-only final refresh could not overwrite those copies because the Library bridge returned `container_session_unavailable`, so the exact final handoff archives remain attached to this run for Release & Deploy verification.

## v71 — Vector League 1.2: Decisive Whistle — 2026-10-06

- Replaces Vector League's ambiguous all-outcome terminal signal with explicit `match-won`, `match-lost`, and `match-draw` result telemetry while retaining neutral `match-complete` compatibility telemetry.
- Only `match-won` counts as a WorldWideGames milestone/true completion; losses and draws cannot mark the game cleared or inflate Daily Circuit milestone progress.
- Only victories submit a numeric Vector League score, preventing losing/drawn runs from entering the local best-score channel.
- Preserves first-to-five/90-second rules, final-whistle freeze behavior, restart, remapped keyboard, gamepad, and touch play.
- Dedicated Chromium outcome regression, 82/82 catalog interaction audit, 82/82 objective/control pages, 54/54 remappable profiles, 82/82 mobile homepage cards, 178/178 local-origin paths, and the recent integrity regression line are green.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v70 — Platform 1.2: Completion Coverage — 2026-10-06

- Fixes a v69 false-negative progression regression: nine legitimate finite-game success events were omitted from the explicit completion allowlist and therefore never appeared as cleared games.
- Adds true-completion recognition for Crownline Tactics, Forgeflow, Hexbound Tactics, Lumen Relay, Pulse Archive, Rift Relay solo/duo campaigns, Skyhook Sprint, and Starweaver Drift.
- Keeps failure, neutral end-state, and per-stage telemetry excluded from cleared-game and Daily Circuit milestone credit.
- Advances PWA/cache metadata to v70 and adds dedicated false-negative completion regression coverage.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v69 — Platform 1.1: Completion Integrity — 2026-10-06

- Fixes a platform-wide false-clear defect where any recorded game event, including failure telemetry, could mark a title cleared and inflate catalog-clear progress.
- Adds a shared event-classification contract with 115 achievement-backed milestone events and 68 curated true-completion events.
- Cleared discovery, catalog-clear percentage, Twenty Clears, and Catalog Master now require a true completion event rather than arbitrary telemetry.
- Daily Circuit milestone credit now accepts only supported milestone events; failure telemetry remains recorded globally but earns no milestone credit.
- Existing daily records that include `eventKeys` are normalized from the supported milestone allowlist on load, preventing stale failure events from keeping inflated milestone totals.
- Preserves individual achievement event counters, score telemetry, input behavior, and all game-specific event transport.
- Advances PWA/cache metadata to v69 and caches the new event-rules module.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v68 — Riftwake Regatta 1.1: Honest Finish — 2026-10-06

- Fixes a false-completion defect where the 105-second heat timeout called the same finish path as clearing all seven gates.
- Timeouts now emit `regatta-dnf`, report actual checkpoint progress, and submit no score, so unfinished heats cannot unlock Regatta Skipper or contaminate lower-is-better best times.
- Legitimate completion now requires all seven gates; premature completion attempts are rejected.
- Preserves adjusted-time scoring, rival comparison, remapped keyboard controls, gamepad/touch support, and restart behavior for valid finishes.
- Clarifies objective/control copy around the 105-second heat limit and DNF semantics.
- Advances PWA/cache metadata to v68 and rotates the leading install shortcut to Riftwake Regatta 1.1.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v67 — Solar Loom 1.1: Stable Horizon — 2026-10-06

- Fixes a false-success path where a system collapsing below 25 stability still emitted `system-complete`, incorrectly satisfying the System Architect achievement condition.
- Adds an explicit `system-collapse` failure event; only surviving all eight epochs emits `system-complete`.
- Preserves solar-shock stability penalties across recalculation so the intended epoch hazard now has real gameplay consequences.
- Adds keyboard access to orbital lane 6 via `0`; keys 5-9 continue to seed lanes 1-5.
- Clarifies the objective/control copy around the 25-stability survival requirement and failed-collapse behavior.
- Advances PWA/cache metadata to v67 and rotates the install shortcut to Solar Loom 1.1.


## v66 — Pulse Archive 1.2: Clear Signal — 2026-10-06

- Fixes a false-success path where Pulse Archive emitted `archive-cleared` and displayed a synchronized result even after a zero-hit, 0%-accuracy run.
- Requires at least 70% final accuracy for a legitimate archive clear; lower results display `SIGNAL DESYNCHRONIZED` and emit `archive-desynced` instead.
- Preserves keyboard, touch, gamepad, scoring, replay, and procedural audio behavior, while adding explicit success criteria to the catalog objective/controls.
- Adds dedicated Chromium regression for 0%, 60%, 70%, real keyboard timing input, mobile containment, and completion telemetry.
- Advances PWA/cache metadata to v66 and rotates the leading install shortcut to Pulse Archive 1.2.
- Bounded platform QA remains green at 82/82 boots, 82/82 interaction audits, 82/82 objective/control pages, 54/54 remappable profiles, and 172/172 local HTTP paths.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v65 — Parallax Accord 1.1: True Majority — 2026-10-06

- Fixes a false campaign victory in Parallax Accord when each side won one district, the third district tied, and aggregate player power happened to be higher.
- Enforces the published rule exactly: a player must win at least two of three districts after round six to defeat a delegation.
- A 1-1 split with one tied district is now an explicit **Accord deadlock**; aggregate power cannot override district majority.
- Deadlocks no longer unlock the next delegation or emit `match-complete`; legitimate two-district wins still advance even when aggregate power is lower.
- Adds explicit rules copy plus dedicated Chromium regression for deadlock, majority win/loss, keyboard commit flow, telemetry/progression protection, and 390px mobile use.
- Advances PWA/cache metadata to v65 and rotates an install shortcut to Parallax Accord 1.1.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v64 — Hexbound Tactics 1.1: True Stalemate — 2026-10-05

- Fixes a false victory in Hexbound Tactics when both citadels are destroyed during the same simultaneous combat resolution with unequal overkill.
- Mutual citadel destruction now always resolves as a stalemate; local win counters and win telemetry remain untouched for that outcome.
- Preserves legitimate single-sided victory/defeat behavior and turn-limit ties.
- Adds explicit objective/control text for the mutual-destruction rule plus dedicated browser regression covering outcome integrity, real card deployment, and 390px mobile use.
- Advances PWA/cache metadata to v64 and rotates an install shortcut to Hexbound Tactics 1.1.
- Bounded platform QA remains green at 82/82 boots, 82/82 interaction audits, 82/82 objective/control pages, 54/54 remappable profiles, and 172/172 local HTTP paths.
- Catalog remains 82 games / 129 genre tags / 152 achievements / 54 remappable releases.

## v63 — Command Bloom 1.1: Six-Map Integrity — 2026-10-05

- Fixed a real **Command Bloom** campaign-progression defect: selecting and solving stage 6 first could previously trigger the “All six programs stabilized” terminal state without clearing stages 1–5.
- Added unique six-stage completion tracking and a visible **Solved X/6** HUD counter.
- Preserved free selection among unsolved maps while requiring all six unique clears before `program-complete` can fire.
- Cleared map buttons now lock, preventing duplicate-score farming through repeated solved-stage play.
- Added explicit objective/control metadata and upgraded Command Bloom **1.0 → 1.1**.
- Added `tests/v63_command_bloom.py`, which reproduces the historical exploit path, verifies any-order six-map completion, validates all six maps are path-solvable, checks single-event completion/reset behavior, and verifies 390px mobile layout.
- Added `tests/v63_static.js` to enforce catalog totals, Command Bloom 1.1 metadata/source wiring, PWA/cache versioning, and release-record artifact filenames.
- Corrected release-record package targets so the current record points to **v63** artifacts rather than stale prior-version filenames.
- Full regression remains green: **82/82 interaction audit**, **82/82 smoke boots**, **82/82 rendered objective/control pages**, **54/54 remappable profiles**, and **172/172 local HTTP paths**.
- Advanced PWA/cache metadata to **v63** and promoted Command Bloom 1.1 to the first install shortcut.
- **Build handoff:** READY FOR RELEASE TASK. Canonical GitHub `main` and production remain unchanged by this Build & QA task. Library upload-back was attempted twice but is currently blocked by `container_session_expired`; final artifacts are retained for the release handoff.


## v62 — Emberfield Survival 2.0: Pyre Crown — 2026-10-05

- Upgraded **Emberfield Survival 1.0 → 2.0** into a three-phase survival campaign: Ash Verge, Cinderstorm, and Pyre Crown.
- Added Drifters, armored Brutes, ranged Wraiths, enemy projectiles, healing salvage, six build upgrades, and escalating encounter pressure.
- Added a chargeable **0–100 Ember Core** and player-triggered **Nova Burst** on remappable Secondary/E, gamepad B, and touch.
- Added two Cinder Warden encounters and an **850-HP Pyre Regent** finale with persistent boss damage.
- Added v2 persistent best/clear/highest-level/Nova-use records, campaign telemetry, pause/restart, synthesized feedback, and responsive touch/gamepad play.
- Added **Pyre Crown** and **Nova Born** achievements, raising the platform to **152 achievements**.
- Reran the catalog reliability baseline: **82/82 interaction audit**, **82/82 smoke boots**, **82/82 rendered objective/control pages**, **54/54 remappable profiles**, and **172/172 local HTTP paths** pass.
- Updated PWA/cache metadata to v62 and rotated the first install shortcut to Emberfield Survival 2.0.


## v61 — Orbit Breaker 2.0: Breaker Campaign — 2026-10-05

- Upgraded **Orbit Breaker 1.1 → 2.0** into a three-sector campaign: Debris Corridor, Hunter Belt, and Breaker Core.
- Added small and three-hit armored asteroids, two-hit hunter drones with projectile fire, shield-cell salvage, sector progression, and a moving **24-HP Breaker Core** finale.
- Added a chargeable **0–100 Reactor** and player-triggered **Pulse Burst** on remappable Secondary/E, gamepad B, and touch. Pulse clears nearby threats and heavily damages the final Core.
- Preserved and revalidated the trust-critical collision rule: missed enemies leaving the playfield do **not** damage shield; only direct collisions or enemy bolts can.
- Added persistent v2 campaign records with legacy best-score migration, campaign clears, unlock state, score telemetry, pause/restart, responsive touch controls, gamepad support, and synthesized feedback honoring platform audio preferences.
- Added **Orbit Secured** and **Pulse Breaker** achievements, bringing the platform to **150 achievements**.
- Added a dedicated Orbit 2.0 regression covering migration, collision safety, progression, salvage, drones, Pulse Burst, persistent Core damage, campaign completion, remapping, pause/restart, and mobile layout.
- Reran the completed catalog reliability baseline: **82/82** interaction-level browser audit, **82/82** smoke boots, **82/82** rendered objective/control pages, **54/54** remappable profiles, and **172/172** local HTTP release paths pass.
- Updated PWA/cache metadata to v61 and added Orbit Breaker 2.0 to PWA shortcuts.

## v60 — Catalog Reliability Audit — 2026-10-05

- Completed an interaction-level Chromium audit across **all 82 catalog games**, extending beyond boot/static checks to exercise keyboard, pointer/canvas, start/action controls, pause/resume/restart safety, local asset references, unhandled errors, invalid visible numeric state, and 390px mobile overflow.
- Fixed a real **Verdant Echoes 2.0** boss lifecycle defect: the Hollow Stag and Thorn Regent were recreated at full health every animation frame, effectively erasing normal paced combat damage.
- Upgraded **Verdant Echoes to 2.1**. Living bosses now retain health and position across animation frames; map transitions explicitly reset boss state before evaluating the next area's spawn conditions.
- Added a dedicated multi-frame Verdant regression proving Hollow Stag and Thorn Regent damage persists and both bosses can be defeated through spaced attacks.
- Refreshed historical regression harnesses for Pulsevine Parkour, catalog-control metadata, Neon Serpent Classic Coil compatibility, and the v32 flagship bundle so obsolete assumptions do not create false failures.
- Advanced the PWA cache to `wwg-v60`, rotated the install shortcut to Verdant Echoes 2.1, and synchronized homepage/detail cache-busters.
- Catalog remains **82 games / 129 genre tags / 148 achievements / 54 remappable releases**.
- **Build handoff:** READY FOR RELEASE TASK. Canonical GitHub `main` and production remain unchanged by this Build & QA task.

## v59 — Neon Serpent 3.0: Crown Coil — 2026-10-05

- Upgraded **Neon Serpent** into a five-contract snake campaign: Classic Coil, Drone Run, Relay Rush, Gridfall, and Crown Coil.
- Added deterministic seeded layouts, escalating hunter drones, paired relay gates, combo scoring, gold sparks in advanced contracts, and eight Crown hazards in the finale.
- Added **Phase Drive**, a rechargeable collision-protection routing mechanic with keyboard remap, touch, and gamepad support.
- Added v2→v3 local-save migration while preserving legacy unlock/best-score mirrors.
- Added synthesized audio feedback, seed/length/phase HUD data, pause/restart controls, mobile layout support, and event telemetry.
- Added **Crown Coil** and **Phase Architect** achievements, raising the platform to **148 achievements**.
- Hardened initial placement so food, gold, drones, relay endpoints, hazards, and the starting snake do not overlap; Classic Coil no longer spawns the later-contract gold bonus.
- Advanced the PWA cache to `wwg-v59`, rotated the first install shortcut to Neon Serpent, and advanced homepage/detail cache-busters to v59.
- QA passed: 82/82 game boots, 82/82 isolated runtime loads, 82/82 rendered detail/objective/control pages, 54/54 remappable profiles, 172/172 HTTP paths, and all selected flagship regressions.
- **Build handoff:** READY FOR RELEASE TASK. This Build & QA pass does not update canonical `main` or production.

## v58 — Quiet Protocol 2.0: Ghostline — 2026-10-05

- Rebuilds **Quiet Protocol** into a three-mission stealth-action campaign across Glass Intake, Archive Lattice, and Crown Node.
- Adds wall-occluded patrol/camera vision, investigation behavior, shared alert/lockdown pressure, noisy sprinting, rechargeable cloak energy, and limited pulse jammers.
- Relay objectives now use hold-to-hack interactions; completed facilities unlock persistent campaign progression and clean-extraction/campaign telemetry.
- Adds touch controls, gamepad support, pause/restart, remapped keyboard movement, synthesized audio, refreshed Architect Industries cover art, and offline/PWA cache metadata for v58.
- Adds **Ghostline Complete** and **Clean Signal**, raising the platform to **146 achievements**.
- Preserves and revalidates v57 Glasswing Polo 2.0 Grand Circuit, including Wingdrive, three rival styles, local-control isolation, persistence, and its dedicated QA.
- Catalog totals: **82 games / 129 genre tags / 146 achievements / 54 remappable releases**.
- QA is green: **82/82** boots, **82/82** objective/control pages, **54/54** remappable profiles, **82/82** isolated runtime checks, and **172/172** local HTTP paths.

### Release gate status

Verified v58 source commit: `8da5e0e42356a5fd5f941ac35d3508ecfa2e2d75`, based on verified v57 release-record commit `252f29b5226c09142617434a06274fa8270a1536`. Canonical main was still verified v55 at release-gate start; v58 is not fully shipped until the required non-force main promotion succeeds. The Library container upload bridge returned `container_session_unavailable` during staging.

## v57 — Glasswing Polo 2.0: Grand Circuit — 2026-10-04

- Glasswing Polo 2.0 adds a three-rival Grand Circuit, first-to-three 60-second rounds, and distinct defensive, pressing, and predictive opponents.
- Wingdrive turns bank play into a charge-and-spend system: touches and wall banks build energy, then Secondary/E/gamepad B/mobile activates a four-second surge.
- Local two-player keyboard routing is corrected so Player 2 owns Arrow movement while Player 1 retains WASD/remapped movement.
- Persistent circuit records, bank-goal and Wingdrive telemetry, pause, touch, dual-gamepad support, synthesized feedback, and refreshed Architect Industries artwork are included.
- Grand Circuit Crown and Bank Artist raise the platform to 144 achievements; Glasswing Polo becomes featured and offline/cache metadata advances to v57.
- QA is green across the dedicated Glasswing suite and the existing Vector, Ironlight, Aegis, Aetherfoil, Skyvault, procedural-world, catalog, control, runtime, and local HTTP regressions.

### Release gate status

Verified v57 source commit: `2ad2ef9d7eb04334afe21c4e165a02816652672f` on `release/v57-source`, 13 commits ahead and 0 behind canonical main. Vercel preview `dpl_A7ChUGpSW213V7EncQ3fDh4gVtmY` is READY on that exact source. Canonical main remains verified v55 because the required non-force ref update was not accepted; no force update was attempted. Library archive upload is also unavailable in this run because the container-to-Library bridge returned `container_session_unavailable`.

## v56 — Vector Shatter 2.0: Prism Reactor — 2026-10-04

- Upgrades **Vector Shatter to 2.0** with a chargeable Prism Reactor and deliberate Secondary/E/gamepad-B/mobile activation.
- Reactor Surge creates multiball, temporary pierce, and time dilation for six seconds.
- Sector five now exposes a moving 14-HP **Prism Core** after the lattice is cleared; destroying it is required to complete the campaign.
- Adds v1→v2 record migration with mirrored compatibility saves, reactor/core persistence, and gameplay telemetry.
- Adds **Prism Ignition** and **Core Shatter** achievements; platform total is now 142.
- Promotes Vector Shatter as featured and advances PWA shortcuts/cache/cache-busters to v56.
- Hardens the control-page regression harness for versioned catalog scripts.
- Revalidates v55 Ironlight 4.0 plus Aegis, Aetherfoil, Skyvault, shared procedural worlds, full boot, control/objective, isolated runtime, and 172-path HTTP coverage.
- Complete verified source/test commit: `a65803e9f0c96ffe63aec93a121d7c3a66941a88`.

### Release gate status

v56 is verified and staged but not fully shipped. The complete lineage is preserved on recovery branch `release/v56-staged` at `425a6d4011c668284029e2b76dc783594841c464`. The required non-force canonical `main` promotion remains blocked before acceptance, so Vercel production remains v55; no force update or duplicate Vercel project was attempted. The v56 source and records archives are persisted in `/WorldWideGames`.
