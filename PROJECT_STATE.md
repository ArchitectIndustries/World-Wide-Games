# WorldWideGames Project State

Last updated: 2026-09-30
Owner/operator: Architect Industries
Current verified source release: **v21**
Status: **59-game** playable static browser-gaming platform with 94 genre tags, 69 achievements, 26 remappable releases, persistent local player data, PWA/offline support, GitHub source continuity, and a Vercel production target.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, daily/weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **94 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, multiple sort modes, recommendations, Daily Pick, and Surprise Me.
- Player-status discovery now includes **In progress** (played but not cleared) and **Uncleared** filters.
- Profile metrics now expose **catalog explored %** and **catalog cleared %**.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **26 releases** currently adopt it.
- Score metadata supports both higher-is-better and lower-is-better records. Kiteglass Drift joins Lantern Line, Driftglass Links, Riftwake Regatta, and Pulsevine Parkour on the lower-is-better path.
- `wwg-v21` service worker caches the complete 59-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v21 production work

### New releases

- **Kiteglass Drift** — featured seven-gate gliding time trial with momentum flight, shifting crosswind, thermal columns, missed-gate penalties, gamepad support, touch controls, remappable pitch, and lower-is-better adjusted times.
- **Runelight Locksmith** — six-lock mechanical timing game. Select moving pins, read their cyan set windows, commit at the right instant, and open the Runelight vault with minimal misses. Supports remappable keyboard controls and pointer/touch play.

### Existing-game upgrades

- **Starweaver Drift 1.1** — migrated directional flight, boost, and scan actions onto the shared remapping system while preserving Arrow-key, touch, and gamepad fallbacks.
- **Windward Cargo 1.1** — migrated thrust, pitch, and boost controls onto the shared remapping system while preserving touch and gamepad play.

### Platform upgrades

- Added **In progress** discovery for games that have been played locally but have no recorded completion milestone.
- Added **Uncleared** discovery for every game without a recorded completion milestone.
- Added **Air & Altitude** curated discovery for Gliding, Flight, Climbing, Mountaineering, Space, and Sailing releases.
- Added catalog exploration and clear percentages to the local profile dashboard.
- Added **Kiteglass Pilot** and **Runelight Master** achievements, bringing the platform total to **69**.
- Shared keyboard-remapping coverage rises from 22 to **26 games**.
- Featured PWA shortcut now launches Kiteglass Drift.
- Offline cache upgraded to `wwg-v21`.

## Current catalog — 59 games

The authoritative ordered catalog is `js/games.js`. v21 adds Kiteglass Drift and Runelight Locksmith to the v20 57-game catalog.

## Validation summary

- `node tests/smoke.js`: all **59 registered games** boot and advance; platform homepage and reusable detail shell pass.
- `python tests/v21_static.py`: 59 unique IDs, **94 genres**, exactly one featured release, 69 achievements, 26 remappable games, complete page/cover/cache registration, and public-source branding scan.
- `python tests/v21_http.py`: **127/127** requested local-origin paths returned HTTP 200.
- `python tests/v21_quick.py`: 59 cards, 69 achievements, 390px layout without horizontal overflow, Air & Altitude discovery, In progress filtering, custom remapping, and scored completion for both new releases.
- `python tests/v21_deep.py`: all seven Kiteglass gates can be crossed cleanly at their authored centerlines; all six Runelight lock definitions have legal target windows and tighten tolerance across the campaign.
- `python tests/v21_remap.py`: custom I/J/K/L/F/H mapping passes across **26 supported games**, including both new releases plus Starweaver Drift 1.1 and Windward Cargo 1.1.
- `python tests/v21_events.py`: both v21 games emit numeric completion events. The 47 v20 scored-event paths are unchanged, producing **49 covered scored releases** across the carried-forward + v21 evidence set.
- `node tests/v21_direction.js`: lower-is-better semantics pass for all five current low-score titles including Kiteglass Drift.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

Verified v21 source is synchronized on `release-v21`, based directly on the complete v20 release branch. The branch is intended for atomic promotion to `main`; if promotion is connector-blocked, `release-v21` remains the durable verified source until a safe merge becomes available.

The release branch is based on the complete verified v20 branch rather than the older v15 default branch, so v16-v21 history is preserved without reconstructing from an obsolete baseline.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Last user-verified production baseline: **v15**.
- Fresh automated deployment enumeration on 2026-09-30 still returned **403 Forbidden** for this established project.
- No duplicate Vercel project was created and v21 is not represented as production-live without deployment evidence.

## Next high-value priorities

1. Promote the verified GitHub release branch to `main` when the available GitHub workflow permits the safe fast-forward/merge.
2. Deploy the newest verified source to the existing Vercel production project as soon as its deployment authorization is available, then run production-origin smoke checks.
3. Continue expanding remapping coverage into remaining action/simulation releases.
4. Add another substantial evolving game/update rather than only increasing catalog count.
5. Continue richer completion-state discovery and local progression without introducing server cost until server-backed features are justified.
