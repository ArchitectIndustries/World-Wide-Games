# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v31**
Status: **66-game** playable static browser-gaming platform with **106 genre tags**, **94 achievements**, **40 remappable releases**, persistent local player data, PWA/offline support, durable GitHub/Library continuity, full-catalog runtime auditing, and expanding deep-run coverage for long-form games.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **106 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, three-game mixes, and **Long Campaigns**.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **40 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; six current titles use lower-is-better scoring.
- `wwg-v31` service worker caches the complete catalog/covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v31 production work — Rune Depths Mastery Pass

- Rune Depths advances to **2.1** with action-level active-run autosave and exact-state resume after reload.
- Active saves and durable meta progression are separated: completion/failure/fresh-run actions clear the run snapshot without deleting mastery, clear count, best depth, or best score.
- Added pure Heart, Edge, and Flask mastery paths requiring a consistent four-relic build through a full five-depth clear.
- Added path-specific mastery events plus `triple-path-mastered`, four new achievements, persistent 3/3 mastery status, and a refreshed mastery-focused cover.
- Combat pacing was tuned through actual play: 4→8 enemies across depths, bounded seven-tile aggro, at most one incoming hit per player turn, sigil healing, and stronger Heart sustain.
- The catalog remains at 66 games to prioritize deep-run quality over raw count.

### v31 validation summary

- `python3 tests/v31_rune_depths.py`: exact autosave/resume, completion/failure cleanup, corrupt-save recovery, and **three full five-depth pure mastery clears against real enemies**.
- `python3 tests/v31_static.py`: 66 games, 106 genres, **94 achievements**, 40 remappable games, `wwg-v31`, metadata/public-source checks.
- `python3 tests/v31_catalog_audit.py`: **66/66 games runtime-clean** in isolated Chromium.
- `node tests/smoke.js`: **66/66 registered games** boot; platform homepage/detail shell pass.
- `python3 tests/v31_http.py`: **139/139** local-origin paths HTTP 200.
- v30 explicit controls, v29 long-form/remapping, v28 direct-game, v27 defect-fix, and v26 score-direction regressions remain green.

## v30 production work — Pulsevine Expansion & Explicit Controls

v30 keeps the catalog at 66 games and focuses on a user-requested favorite plus platform-wide usability.

### Pulsevine Parkour 2.0

- Expanded the original single five-gate run into a **five-course parkour progression**: Rooftop Pulse, Glassroot Gap, Skyline Switchbacks, Thornspire Relay, and Pulse Crown.
- Course difficulty now escalates through 5 / 6 / 7 / 7 / 8 checkpoint gates, launch pads, crosswinds, denser thorn timing, and mixed elevation lines.
- Added persistent course unlocks and per-course best times, a five-course best-total campaign score, number-key course selection, and a new full-campaign completion event.
- Improved checkpoint respawns so a fall returns the player to a safe run-up instead of an edge-trap.
- Added exact controls: A/D or Left/Right move, Space/Up jumps, R restarts, 1-5 selects unlocked courses, N advances after a clear; gamepad and touch actions are also named explicitly.

### Explicit control presentation across all games

- Every game detail page continues to show its authored game-specific control list.
- All **40 remappable games** now also display the player's current keyboard mapping for Up, Down, Left, Right, Primary, and Secondary.
- Abstract labels such as `Primary`, `Secondary`, and `Remappable directions` are expanded in the UI with the actual current key and default (`W/A/S/D`, `Space`, `E`) so players never have to infer what an action label means.
- Added regression coverage over all **66 game detail pages** to ensure control lists render and every remappable title exposes the explicit keyboard profile.

### Platform/release updates

- Added achievement **Pulse Crown** for clearing all five Pulsevine courses, bringing the total to **90**.
- Release History advances to **v30 through v25**.
- Offline cache advances to `wwg-v30`.

### v30 validation summary

- `python3 tests/v30_pulsevine.py`: five courses, real keyboard input, course selection/restart, and **5/5 real-physics reachability** using the authored movement/collision loop.
- `python3 tests/v30_controls.py`: all 66 catalog entries retain explicit control lists and the exact remapping defaults are present in the game-detail renderer.
- `python3 tests/v30_controls_browser.py`: all 66 game detail pages render at least three control lines; all **40 remappable titles** expose the current/default keyboard profile.
- `python3 tests/v30_catalog_audit.py`: **66/66 games runtime-clean** in isolated Chromium.
- `node tests/smoke.js`: **66/66 registered games** boot; platform homepage/detail shell pass.
- `python3 tests/v30_static.py`: 66 IDs, 106 genres, one featured release, **90 achievements**, 40 remappable games, `wwg-v30`, metadata/public-source checks.
- `python3 tests/v30_http.py`: **139/139** local-origin paths returned HTTP 200.
- v29 long-form, v28 direct-game/event, v27 defect-fix, remapping, and score-direction regressions remain green.

## v29 production work — Long-Form Depth Pass

v29 deliberately keeps the catalog at 66 games and spends the release budget on titles intended to sustain longer sessions. `LONGFORM_AUDIT.md` records the evaluation of Mosslight Vale, Aetherstead Colony, Rune Depths, Emberdeck Pilgrim, Atlas Below, Ashfall Caravan, Bastion Bloom, and Fluxward Conclave.

### Aetherstead Colony 2.0

- Rebuilt the former single 16-turn scenario into a persistent **three-charter / 36-turn colony campaign**.
- Added charter-specific civic policies, deterministic crises/events, six structure classes with three upgrade levels, farm-water/home-park/lab-power adjacency systems, and carry-forward charter-seal bonuses.
- Added autosave/resume, lifetime campaign clears/best score, persistent charter seals, standardized charter completion/failure events, and scored full-campaign completion.
- Added shared remapping support: directions move the platform cursor; Primary builds/upgrades; Secondary cycles structures; Enter advances the turn; pointer/touch remains supported.
- Fixed Emergency Reserve restart behavior so its initial resource grant is reapplied when legitimately restarting the charter while retaining the selected policy.

### Mosslight Vale 1.8

- Preserved the existing six-region RPG campaign and backward save compatibility.
- Added silent milestone autosaves so major regional restoration progress no longer depends solely on returning to a shrine.
- Added the **Starshade Warden** post-restoration final boss after Starbloom Canopy.
- Added a final Ranger Elian return, durable epilogue state, persistent campaign clear/best score meta, and scored `campaign-complete` event.
- Final boss HP/death and completed-campaign state survive reloads; older Starbloom-complete saves enter the finale rather than losing access to it.

### Platform/release updates

- Added the **Long Campaigns** curated collection.
- Added achievements **Six-Region Warden** and **Sky-City Architect**, bringing the total to **89**.
- Release History advances to **v29 through v24**.
- Shared-remapping coverage increases from 39 to **40** with Aetherstead Colony 2.0.
- Offline cache advances to `wwg-v29`.
- Featured game remains Fluxward Conclave.

## Validation summary

- `python3 tests/v29_longform.py`: legitimate full Aetherstead three-charter completion plus save/reload/custom-remap coverage; full Mosslight six-region progression, two boss defeats, midpoint autosave/reload, final autosave/reload, and campaign completion.
- `python3 tests/v29_catalog_audit.py`: **66/66 games runtime-clean** in isolated Chromium.
- `node tests/smoke.js`: **66/66 registered games** boot; platform homepage/detail shell pass.
- `python3 tests/v29_static.py`: 66 unique IDs, **106 genres**, one featured release, **89 achievements**, **40 remappable games**, `wwg-v29`, version/metadata checks, and public-source scan.
- `python3 tests/v29_http.py`: **139/139** requested local-origin paths returned HTTP 200.
- `python3 tests/v29_remap.py`: inherited 39-title remapping regression plus Aetherstead custom mapping pass; **40 total**.
- `python3 tests/v28_game.py` and `tests/v28_circuit.py`: v28 Fluxward Conclave and Circuit Rush 2.0 direct regressions remain green.
- `python3 tests/v27_fixes.py`: all six v27 correctness fixes and targeted legacy interactions remain green.
- `python3 tests/v28_events.py`: numeric scored-release coverage remains **56 releases**.
- `node tests/v26_direction.js`: lower-is-better semantics remain correct for all six low-score titles and general high-score behavior remains intact.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

- GitHub `main` was successfully advanced from v29 to the complete verified v30 source at commit `9390c4907085ee6da780a2bb7a91c4a7c4897a2c` before v31 development began.
- v31 was built from the verified v30 Library release and is intended to fast-forward the same `main` branch after the release gate passes.
- `/WorldWideGames` remains the persistent packaged-release archive; GitHub remains the durable complete-source mirror.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Fresh connector checks in this v31 work session still return **403 Forbidden** for deployment enumeration and cannot fetch the protected production origin through the current Vercel authorization.
- This is treated as connector/project-scope authorization failure, not evidence that the project is missing. No duplicate Vercel project is created.
- Production-origin verification therefore remains pending until connector access is extended to this established project.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and must be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than rebuilding from an older source.

## Next high-value priorities

1. Complete **both Emberdeck Pilgrim routes** from clean profiles and verify dual-route mastery persistence.
2. Complete all **three Ashfall Caravan road contracts** and exercise distinct endings from clean saves.
3. Deep-run **Atlas Below**, **Bastion Bloom**, and **Fluxward Conclave** across additional build/route combinations.
4. Continue catalog expansion only after long-form progression remains proportionate to catalog growth.
5. Verify and update the established Vercel production project when project-scoped connector access becomes available.
