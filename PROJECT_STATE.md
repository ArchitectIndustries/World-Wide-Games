# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v27**
Status: **65-game** playable static browser-gaming platform with **105 genre tags**, **84 achievements**, **38 remappable releases**, persistent local player data, PWA/offline support, GitHub source continuity, and a completed full-catalog quality audit.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **105 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, and three-game mixes.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **38 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; six current titles use lower-is-better scoring.
- `wwg-v27` service worker caches the complete 65-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v27 production work — full catalog quality audit

v27 is intentionally a quality release rather than a catalog-growth release. Every one of the 65 registered games was loaded independently in Chromium with isolated state and runtime errors captured. Common controls were exercised across the catalog; concise/older implementations and generic-input outliers received targeted visual/source review and direct interaction checks. `CATALOG_AUDIT.md` records the per-game disposition and audit limits.

### Correctness/coherence upgrades

- **Glyphsmith 1.1** — the rune bank is now true finite inventory. A rune cannot be reused after being spent; Backspace returns the last rune and Clear returns the complete entry to the bank.
- **Echo Bazaar 1.1** — the market rumor is now genuinely forward-looking. The displayed rumor predicts the next day's pressure, which is applied only when the player advances the day.
- **Signal Choir 1.1** — input is locked during a wrong-note replay and between completed rounds, preventing accidental extra strikes during transition timing.
- **Pulse Archive 1.1** — the visible end score now includes the same accuracy bonus emitted to standardized WorldWideGames scoring.
- **Lumen Relay 1.1** — accumulated rotations reset after the completed six-stage run, preventing the prior run from contaminating replay scores.
- **Hushwave Operator 1.1** — completion telemetry now reports samples across the full six-signal band rather than only attempts on the final signal.

### Retained after targeted review

Several concise legacy games were explicitly reviewed because implementation size alone could make them appear suspicious. They were retained because they have coherent, playable loops rather than placeholder behavior: Circuit Rush (three-lap racer), Railspire Dispatch (switch-routing network), Harbor Pulse (timed berth management), Orbit Breaker (space shooter), Cipher Court (four-case deduction), Crownline Tactics (turn-based squad tactics), Atlas Below (procedural mining/extraction contracts), and Forgeflow (timed ore-routing factory puzzle).

### Platform/release updates

- Added `CATALOG_AUDIT.md` as a durable per-game audit ledger.
- Added v27 repeatable catalog-audit and defect-specific regression tests.
- Release History advances to **v27 through v22**.
- Offline cache upgraded to `wwg-v27`.
- Catalog size, achievements, genres, featured title, and remapping coverage intentionally remain unchanged.

## Validation summary

- `python tests/v27_catalog_audit.py`: **65/65 games runtime-clean** in isolated Chromium; generic input produced observable state changes in 62 and the remaining geometry/mechanic-specific cases were covered by direct checks.
- `python tests/v27_fixes.py`: passes all six defect regressions plus direct interactions for Lumen Relay, Hushwave Operator, Crownline Tactics, Atlas Below, and Forgeflow.
- `node tests/smoke.js`: all **65 registered games** boot and advance; homepage and reusable detail shell pass.
- `python tests/v27_static.py`: 65 unique IDs, **105 genres**, exactly one featured release, **84 achievements**, **38 remappable games**, complete page/cover/cache registration, six audited version bumps, and public-source branding/tooling scan across **138 files**.
- `python tests/v27_http.py`: **137/137** requested local-origin paths returned HTTP 200.
- `python tests/v26_remap.py`: custom I/J/K/L/F/H regression remains green across all **38 remappable games**.
- `python tests/v26_events.py`: carried-forward/current numeric scored-release coverage remains **55 releases**.
- `node tests/v26_direction.js`: lower-is-better semantics remain correct for all six low-score titles; high-score semantics remain intact.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

v27 was built directly from verified v26 GitHub `main` commit `062c484b366e0a920a2ec1839f2483c38ea06ed9` and the matching `/WorldWideGames/WorldWideGames_v26.zip`. The release must be synchronized as a fast-forward without overwriting unrelated newer user work.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Connected Vercel deployment enumeration has most recently returned **403 Forbidden**, and project lookup has exposed a connector schema mismatch.
- The user supplied an existing deployment hook for this exact project; treat the hook as a secret and never commit or expose it in public source.
- Never create a duplicate Vercel project solely because connector enumeration is unauthorized.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and should be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than rebuilding from an older source.

## Next high-value priorities

1. Continue depth-focused audits of long-form games by completing representative full runs rather than growing the catalog reflexively.
2. Expand explicit per-game completion-path regression coverage beyond the current numeric-event set.
3. Continue deliberate shared-remapping migration only where keyboard remapping makes sense for the title.
4. Verify the newest tested release on the production origin when Vercel deployment visibility becomes available.
5. Keep authenticated cloud leaderboards/social identity gated on abuse-resistant persistence and privacy controls.
