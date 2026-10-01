# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v28**
Status: **66-game** playable static browser-gaming platform with **106 genre tags**, **87 achievements**, **39 remappable releases**, persistent local player data, PWA/offline support, GitHub source continuity, and a complete v28 release gate.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **106 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, and three-game mixes.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **39 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; six current titles use lower-is-better scoring.
- `wwg-v28` service worker caches the complete 66-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v28 production work — Fluxward Conclave / Circuit Rush 2.0

### New release: Fluxward Conclave

- Added **Fluxward Conclave**, an original three-arena territory strategy game built around extending connected territory, charging cells, pulse conversions, relay bonus actions, and positioning against a deterministic tactical rival.
- Supports a Solo three-arena campaign and **Local Multiplayer** pass-and-play duel mode.
- Includes pointer/touch play, shared remappable keyboard input, gamepad support, persistent local records, standardized score/milestone events, responsive presentation, and a dedicated cover.
- Fluxward Conclave becomes the featured release and the PWA shortcut target.

### Major existing-game upgrade: Circuit Rush 2.0

- Rebuilt **Circuit Rush** into a fuller three-lap competitive racer with **three live AI rivals**, ordered eight-gate checkpoint progression, live position tracking, boost gates, off-track grip loss, pause/resume, best-time/place persistence, and standardized race completion/win events.
- Preserved touch, keyboard, gamepad, remapping, and fullscreen-friendly browser play.
- Circuit Rush now participates in achievement/event progression through the new race-win milestone.

### Platform and progression updates

- Catalog expands from 65 to **66 games** and from 105 to **106 genre tags**.
- Shared remapping coverage rises from 38 to **39 games**.
- Added **three achievements**: Circuit Champion, Fluxward Victor, and Triple Crown, bringing the local total to **87**.
- Numeric scored-release regression coverage rises from 55 to **56 releases**.
- Release History advances to **v28 through v23**.
- Offline cache upgraded to `wwg-v28` and includes the new game/cover.
- PWA shortcut now launches Fluxward Conclave.

## Validation summary

- `python3 tests/v28_catalog_audit.py`: **66/66 games runtime-clean** in isolated Chromium; generic input changed observable state in 63, with the three known geometry-specific cases retaining direct regression coverage.
- `python3 tests/v28_game.py`: Fluxward pointer expansion, pulse conversion, custom-remap input, Local Multiplayer turn passing, forced campaign milestone events, and 390 px mobile overflow checks pass.
- `python3 tests/v28_circuit.py`: Circuit Rush checkpoint ordering, three-rival race state, steering/throttle, pause/resume, boost behavior, deterministic three-lap completion, and win/completion events pass.
- `node tests/smoke.js`: all **66 registered games** boot and advance; homepage and reusable detail shell pass.
- `python3 tests/v28_static.py`: 66 unique IDs, **106 genres**, exactly one featured release, **87 achievements**, **39 remappable games**, complete game/cover/cache/PWA shortcut registration, and public-source branding/tooling scan across **140 files**.
- `python3 tests/v28_http.py`: **139/139** requested local-origin paths returned HTTP 200.
- `python3 tests/v28_remap.py`: inherited custom I/J/K/L/F/H mapping remains green across the previous 38 releases and Fluxward Conclave, for **39 remappable games**.
- `python3 tests/v28_events.py`: new Fluxward/Circuit events are numeric where scored and carried-forward/current scored-release coverage is **56 releases**.
- `python3 tests/v27_fixes.py`: all six v27 correctness regressions remain green.
- `python3 tests/v26_events.py` and `node tests/v26_direction.js`: existing scored-event and score-direction semantics remain green.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

v28 was built directly from verified GitHub `main` v27 commit `1c6650e83eee4d441cd900fe1b93ae013e1db8f8` and the matching `/WorldWideGames/WorldWideGames_v27.zip`. The complete v28 source should be synchronized as a fast-forward after the final release gate, without overwriting unrelated newer work. The release record must be updated with the resulting v28 commit SHA after synchronization.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries team `team_wwOmTAdrfPwvTGNSLU1VarOy`.
- Production domain: `https://worldwidegames.vercel.app`.
- Production remains distinct from the verified local/GitHub source release until a successful deployment and live-origin smoke test are recorded.
- Connected Vercel deployment enumeration has previously returned **403 Forbidden**, and project lookup has exposed a connector/schema limitation. This is treated as authorization/visibility trouble, not evidence that the project is missing.
- Never create a duplicate Vercel project solely because connector enumeration is unauthorized.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and should be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than rebuilding from an older source.

## Next high-value priorities

1. Complete representative full-run depth tests for another long-form game, especially campaign/progression paths not yet exercised end-to-end.
2. Expand explicit completion-path regressions and gamepad/touch interaction coverage for older releases.
3. Continue substantial upgrades of concise legacy games where depth can be added without losing their immediate-play identity.
4. Verify and deploy the newest tested release to the existing Vercel project when connector write/visibility access permits.
5. Keep cloud leaderboards/social identity gated on abuse-resistant persistence, privacy controls, and a durable backend.
