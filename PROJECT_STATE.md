# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v29**
Status: **66-game** playable static browser-gaming platform with **106 genre tags**, **89 achievements**, **40 remappable releases**, persistent local player data, PWA/offline support, durable GitHub/Library continuity, a full-catalog quality audit, and a dedicated long-form campaign-depth audit.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **106 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, three-game mixes, and the new **Long Campaigns** collection.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **40 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; six current titles use lower-is-better scoring.
- `wwg-v29` service worker caches the complete catalog/covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

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

- GitHub `main` began this production pass at verified v27 commit `1c6650e83eee4d441cd900fe1b93ae013e1db8f8`.
- `/WorldWideGames/WorldWideGames_v28.zip` was independently verified and used as the v29 development baseline because it was newer than GitHub and had passed its embedded/re-run release gate.
- The v29 synchronization process preserves v28 as its own verified Git history step before the v29 long-form release, rather than collapsing the two releases into a misleading single change.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Connected Vercel deployment enumeration has most recently returned **403 Forbidden**, and project lookup has exposed a connector schema mismatch.
- The user supplied an existing deployment hook for this exact project; treat the hook as a secret and never commit or expose it in public source.
- Never create a duplicate Vercel project solely because connector enumeration is unauthorized.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and must be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than rebuilding from an older source.

## Next high-value priorities

1. Deep-run **Rune Depths** across multiple complete relic builds and verify full-run save/meta boundaries.
2. Complete **both Emberdeck Pilgrim routes** from clean profiles and verify dual-route mastery persistence.
3. Complete all **three Ashfall Caravan road contracts** and exercise distinct endings from clean saves.
4. Continue expansion only after long-form progression remains proportionate to catalog growth.
5. Verify the newest tested release on the production origin when Vercel deployment visibility becomes available.
