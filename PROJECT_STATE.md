# WorldWideGames Project State

Last updated: 2026-10-01
Owner/operator: Architect Industries
Current verified source release: **v26**
Status: **65-game** playable static browser-gaming platform with **105 genre tags**, **84 achievements**, **38 remappable releases**, persistent local player data, PWA/offline support, GitHub source continuity, and an established Vercel production target.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, favorites, ratings, Play Later, achievements, Daily/Weekly challenge activity, completion milestones, direction-aware best scores, scored-run history, discovery mixes, accessibility/audio preferences, keyboard mapping, and game-specific saves.
- Discovery supports search, **105 genre tags**, input capability, Solo / Local Multiplayer modes, curated collections, player-status filters, shareable query state, sorting, recommendations, Daily Pick, Surprise Me, and three-game mixes.
- Homepage personalization includes Continue Playing and Recently Updated; Release History exposes the six latest release summaries locally.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer; **38 releases** currently adopt it.
- Score metadata supports higher-is-better and lower-is-better records; six current titles use lower-is-better scoring.
- `wwg-v26` service worker caches the complete 65-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v26 production work

### New release

- **Strata Cipher** — featured six-site archaeology/excavation strategy puzzle. Players survey hidden strata, use artifact-signal counts to plan digs, recover three fragments per site, avoid fault pockets, and preserve integrity. Includes deterministic authored sites, persistent best expedition records, shared keyboard remapping, touch/pointer controls, gamepad support, and completion/delicate-excavation events.

### Major existing-game upgrade

- **Ashfall Caravan 2.0** — expanded from eight to twelve crossings with Parts as a fifth managed resource, three persistent road contracts, contract mastery across repeated runs, additional road scenes, revised scoring, retained Chronicle trait/backward-meta compatibility, gamepad support, and shared remappable Primary/Secondary decisions.

### Platform upgrades

- Added **Field Studies** curated discovery.
- Added Field Archaeologist, Delicate Hands, and Road Contract Master achievements, bringing the total to **84**.
- Shared keyboard-remapping coverage rises from 36 to **38 games**.
- Release History advances to v26 through v21.
- Featured PWA shortcut now launches Strata Cipher.
- Offline cache upgraded to `wwg-v26`.

## Validation summary

- `node tests/smoke.js`: all **65 registered games** boot and advance; homepage and reusable detail shell pass.
- `python tests/v26_static.py`: 65 unique IDs, **105 genres**, exactly one featured release, 84 achievements, 38 remappable games, complete page/cover/cache registration, and public-source branding/tooling scan across **138 files**.
- `python tests/v26_http.py`: **137/137** requested local-origin paths returned HTTP 200.
- `python tests/v26_quick.py`: 65 cards, 84 achievements, Field Studies, six-item Release History, 390 px layout with no horizontal overflow, full Strata completion, and a complete Ashfall Relief-contract journey.
- `python tests/v26_deep.py`: all six Strata sites are 6x6 with exactly three artifact fragments and four fault pockets; Ashfall defines twelve crossings, three contracts, persistent contract history, and contract-mastery events.
- `python tests/v26_remap.py`: custom I/J/K/L/F/H mapping passes across the inherited 36 supported games plus Strata Cipher and Ashfall Caravan 2.0, for **38 remappable games**.
- `python tests/v26_events.py`: Strata survey/delicate events and Ashfall journey/contract events remain numeric where scored; carried-forward/current scored-release coverage is **55 releases**.
- `node tests/v26_direction.js`: lower-is-better semantics remain correct for all six current low-score titles; high-score semantics remain correct for Strata and Ashfall.

## GitHub source continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`.

At the start of v26, GitHub `main` was the verified v25 commit `c7271ee2e3919df027e3feab8f240619a3e60296`. The v26 release is built directly from the exact v25 tree reconstructed from the persistent archive/sync records and verified against Git blob hashes before development. The post-gate GitHub synchronization fast-forwards this baseline without overwriting unrelated newer work.

## Production deployment

- Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` under Architect Industries.
- Production domain: `https://worldwidegames.vercel.app`.
- Connected Vercel deployment enumeration still returns **403 Forbidden** and `get_project` still exposes a connector schema mismatch, so connector-side production verification remains blocked.
- The user supplied an existing deployment hook for this exact project; it can be triggered only after the verified v26 GitHub release is synchronized.
- Never create a duplicate Vercel project solely because connector enumeration is unauthorized.

## Persistence and recovery

- `/WorldWideGames` is the persistent packaged-release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and should be inspected together with the Library on every run.
- When one location lags, continue from the newest fully verified release artifact rather than rebuilding from an older source.

## Next high-value priorities

1. Verify v26 on the production origin after the established Vercel hook produces a deployment.
2. Continue deliberate shared-remapping migration for suitable legacy games.
3. Deepen another long-form title such as Mosslight Vale while preserving current save compatibility.
4. Add richer local progress analytics only where they improve discovery without clutter.
5. Keep authenticated cloud leaderboards/social identity gated on abuse-resistant persistence and privacy controls.
