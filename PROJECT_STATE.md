# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v25**
Status: **64-game** playable static browser-gaming platform with **103 genre tags**, **81 achievements**, **36 remappable releases**, persistent local player data, PWA/offline support, GitHub source continuity, and an established Vercel production target.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **103 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, and three-game mixes.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **36 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; v25 adds Echofall Caverns as the sixth lower-is-better title.
- `wwg-v25` service worker caches the complete 64-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v25 production work

### New release

- **Echofall Caverns** — featured six-chamber echolocation exploration puzzle. Sonar pulses reveal nearby terrain; each chamber requires three resonators before exit. Includes remappable movement/actions, touch/gamepad support, reduced-motion-aware echo visualization, authored solvable maps, and lower-is-better echo-cost scoring.

### Major existing-game upgrade

- **Rune Depths 2.0** — rebuilt from a compact endless maze into a five-depth procedural dungeon campaign with deterministic per-depth mazes, four sigils per floor, Shade/Wisp/Brute enemies, Heart/Edge/Flask relic choices, potions, persistent best-depth and relic-family tracking, gamepad/touch support, shared remapping, full-run mastery scoring, and a persistent Relic Triad milestone.

### Platform upgrades

- Added **Deep Expeditions** curated discovery for Dungeon, Roguelite, Underwater, Salvage, Echolocation, and Mountaineering experiences.
- Added Echo Cartographer, Five Depths, and Relic Triad achievements, bringing the total to **81**.
- Shared keyboard-remapping coverage rises from 34 to **36 games**.
- Release History advances to v25 through v20.
- Featured PWA shortcut now launches Echofall Caverns.
- Offline cache upgraded to `wwg-v25`.

## Validation summary

- `node tests/smoke.js`: all **64 registered games** boot and advance; homepage and reusable detail shell pass.
- `python tests/v25_static.py`: 64 unique IDs, **103 genres**, exactly one featured release, 81 achievements, 36 remappable games, complete page/cover/cache registration, and public-source branding/tooling scan across **136 files**.
- `python tests/v25_http.py`: **135/135** requested local-origin paths returned HTTP 200.
- `python tests/v25_quick.py`: 64 cards, 81 achievements, Deep Expeditions, six-item Release History, 390 px layout with no horizontal overflow, full Echofall completion, and full five-depth Rune Depths mastery/relic-triad path.
- `python tests/v25_deep.py`: all six Echofall maps are 15x15, contain P/1/2/3/E exactly once, and provide a valid traversable sequence; Rune Depths defines five floors, three relic families, three enemy archetypes, and persistent triad mastery.
- `python tests/v25_remap.py`: custom I/J/K/L/F/H mapping passes across the inherited 34 supported games plus Echofall Caverns and Rune Depths, for **36 remappable games**.
- `python tests/v25_events.py`: Echofall atlas completion and Rune Depths mastery/triad events are numeric; carried-forward/current scored-release coverage is **54 releases**.
- `node tests/v25_direction.js`: lower-is-better semantics remain correct for all six current low-score titles; higher-is-better semantics remain intact.

## QA defect fixes during v25

- Deep validation found the fifth authored Echofall chamber isolated its third resonator. The chamber was redesigned and revalidated before release.
- Chromium completion testing found an initial sonar reveal could compute a negative ripple radius when the reveal lifetime exceeded the animation divisor. The ripple lifetime is now clamped before drawing.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

At the start of v25, GitHub `main` remained the verified v21 commit `30af009479282d3f450ab8d3fce67f6343453aa9`; the partial `release-v23-verified` branch remained non-authoritative. The complete v24 conversation artifact supplied the v25 development baseline. The complete v25 source package is authoritative until the post-gate GitHub synchronization step succeeds; never promote a partial tree over a complete verified release.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Last user-verified production baseline remains **v15**.
- Fresh v25 deployment enumeration again returned **403 Forbidden** from the connected Vercel API before release work began.
- Never create a duplicate Vercel project solely because connector enumeration is stale or unauthorized.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive; v23 was the newest Library package visible at the start of this run, while the verified v24 conversation artifact was available and used directly.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and should be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than reconstructing from an older source.

## Next high-value priorities

1. Synchronize the complete verified v25 source to GitHub and deploy it to the existing Vercel project as soon as connector authorization permits.
2. Continue deliberate shared-remapping migration for suitable legacy games.
3. Deepen long-form titles such as Ashfall Caravan or Mosslight Vale without sacrificing current save compatibility.
4. Expand curated discovery and local progress analysis only when it improves navigation rather than adding UI clutter.
5. Keep authenticated cloud leaderboards/social identity gated on abuse-resistant persistence and privacy controls.
