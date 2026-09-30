# WorldWideGames Project State

Last updated: 2026-09-30
Owner/operator: Architect Industries
Current source release: v15
Status: **47-game** playable static browser-gaming platform; deployment-ready; not yet verified on a public production origin.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, longest sessions, total/daily/per-game playtime, recent games, favorites, ratings, achievements, Daily/Weekly Circuit activity, completion milestones, direction-aware best scores, rolling scored-run history, accessibility/audio preferences, keyboard mapping, profile backup/restore, and game-specific saves.
- Discovery combines search, **76 genre tags**, input capability, **Solo / Local Multiplayer play-mode filtering**, curated collections, player status, sort modes, recommendations, and Surprise Me.
- `assets/wwg-input.js` provides the reusable keyboard-remapping layer. Nine releases now adopt it: Frostline Rescue, Chronofold Courier, Atlas Below, Quiet Protocol, Skyhook Sprint, Mosslight Vale, Lantern Line, Circuit Rush, and Orbit Breaker.
- Score metadata supports higher-is-better and lower-is-better records. Lantern Line and Driftglass Links exercise the lower-is-better path.
- `wwg-v15` service worker caches every registered game page and cover plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v15 production work

### New releases

- **Driftglass Links** — featured six-hole physics/golf game with drag-to-shoot aiming, ricochet walls, sand, water hazards, keyboard, touch/pointer, gamepad support, and lower-is-better stroke records.
- **Tideglass Surveyor** — six-chart cartography/logic game. Players triangulate hidden waymarks from three lighthouse distance readings, manage four probes per chart, and seal a scored atlas using pointer/touch or keyboard play.

### Prism Duel 1.1

- Added a **VS AI** mode while preserving the original same-device two-player mode.
- AI turns, advances, fires on alignment, navigates around arena cover, and participates in the same first-to-five rules.
- Mode can be toggled from the HUD or with `M`; the selected mode persists locally.
- Added `ai-duel-won` scored completion metadata for solo victories while retaining `duel-complete` for local-versus play.
- Registry now advertises Prism Duel as both **Solo** and **Local Multiplayer**.

### Platform upgrades

- Added **play-mode filtering** for Solo and Local Multiplayer games.
- Game cards and game-detail capability badges now expose play modes alongside input capabilities.
- Added **Aim & Arc** curated discovery for golf, precision, pinball, physics, and sports games.
- Expanded shared keyboard remapping to **Circuit Rush** and **Orbit Breaker**, bringing compatible releases to **9**.
- Fixed Orbit Breaker's initial shot cooldown so the first remapped fire input works immediately after launch.
- Added profile **games cleared** progression based on unique completion-event games.
- Added five achievements: Links Finisher, Tide Cartographer, Prism Soloist, Twenty Clears, and Catalog Master, bringing the platform total to **50**.
- Updated featured PWA shortcut to Driftglass Links and upgraded offline cache to `wwg-v15` for the complete 47-game catalog.

## Current catalog — 47 games

1. **Driftglass Links** — Golf / Sports / Physics / Precision
2. **Tideglass Surveyor** — Cartography / Logic / Puzzle / Exploration
3. **Spanwright** — Construction / Engineering / Physics / Puzzle
4. **Lantern Line** — Vehicle Simulation / Transit / Logistics / Simulation
5. **Frostline Rescue** — Rescue / Emergency / Action / Strategy
6. **Signal Choir** — Memory / Music / Puzzle / Relaxing
7. **Terrace Keeper** — Farming / Agriculture / Management / Relaxing
8. **Chronofold Courier** — Time Loop / Puzzle / Strategy / Experimental
9. **Hearthline Kitchen** — Cooking / Time Management / Management / Arcade
10. **Spectra Safari** — Photography / Nature / Exploration / Relaxing
11. **Ashfall Caravan** — Narrative / Adventure / Management / Interactive Fiction
12. **Twinforge Expedition** — Co-op / Multiplayer / Exploration / Survival
13. **Mothlight Museum** — Hidden Object / Mystery / Puzzle / Observation
14. **Windward Cargo** — Flight / Delivery / Physics / Arcade
15. **Cipher Court** — Deduction / Mystery / Logic / Puzzle
16. **Moonwake Angler** — Fishing / Relaxing / Simulation
17. **Deepwater Signal** — Underwater / Stealth / Exploration / Simulation
18. **Emberdeck Pilgrim** — Deckbuilder / Card / Roguelike / Strategy
19. **Command Bloom** — Programming / Logic / Puzzle
20. **Railspire Dispatch** — Logistics / Strategy / Puzzle
21. **Glyphsmith** — Word / Typing / Puzzle
22. **Solar Loom** — Sandbox / Experimental / Simulation / Strategy
23. **Atlas Below** — Exploration / Survival / Crafting
24. **Aetherstead Colony** — City Builder / Colony / Simulation / Strategy
25. **Prism Duel** — Multiplayer / Competitive / Arena / Physics
26. **Crownline Tactics** — Tactical / Strategy / Turn-Based
27. **Echo Bazaar** — Economy / Simulation / Management / Strategy
28. **Lumen Relay** — Logic / Puzzle / Board
29. **Starweaver Drift** — Space / Exploration / Simulation
30. **Pulse Archive** — Rhythm / Music / Arcade
31. **Verdant Circuit** — Ecology / Strategy / Simulation / Board
32. **Quiet Protocol** — Stealth / Puzzle / Action
33. **Forgeflow** — Automation / Strategy / Simulation / Puzzle
34. **Cloudforge Pinball** — Pinball / Physics / Arcade
35. **Mosslight Vale** — RPG / Adventure / Exploration
36. **Gravity Foundry** — Physics / Puzzle / Simulation
37. **Hexbound Tactics** — Card / Strategy / Board
38. **Harbor Pulse** — Simulation / Management / Arcade
39. **Rift Relay** — Co-op / Multiplayer / Arcade
40. **Skyhook Sprint** — Platformer / Action / Speedrun
41. **Neon Stack** — Puzzle / Arcade
42. **Circuit Rush** — Racing / Arcade / Time Trial
43. **Bastion Bloom** — Strategy / Tower Defense
44. **Emberfield Survival** — Survival / Action / Roguelite
45. **Vector League** — Sports / Competitive / Arcade
46. **Orbit Breaker** — Space / Shooter / Arcade
47. **Rune Depths** — Dungeon / Roguelite / Adventure

## Validation completed on 2026-09-30

See `TEST_REPORT.md` for exact coverage and limitations.

- All **47 game scripts** boot and advance under the runtime harness.
- Registry contains 47 unique game IDs, **76 distinct genre tags**, one featured release, normalized score metadata on every game, and 9 remappable releases.
- All registered game pages/covers exist and are included in the `wwg-v15` service worker.
- Fresh local HTTP delivery returned **200 across 105 tested paths**.
- Chromium in-memory browser checks confirmed 47 catalog cards, **50 achievements**, Aim & Arc filtering, Solo/Local Multiplayer filtering, Remappable filtering, 390 px mobile width without horizontal overflow, direct interaction/scoring for both new games, Prism Duel AI mode, and custom remapped input in Circuit Rush and Orbit Breaker.
- Shared-remap regression is green across **9 compatible games**.
- Standardized numeric score-event suite is green across **37 representative games**.
- Dedicated direction-aware record tests verify worse low scores are rejected and better low scores are accepted for both Lantern Line and Driftglass Links.
- Public-facing source scan covered **102 files** and found no prohibited internal branding.
- A real-origin Chromium smoke attempt against the local HTTP server was blocked by the execution environment with `net::ERR_BLOCKED_BY_ADMINISTRATOR`; HTTP delivery and browser behavior were therefore validated separately rather than claimed as one end-to-end origin test.

## Vercel state

- Connected team: Architect Industries (`architect-industries`).
- Team ID: `team_wwOmTAdrfPwvTGNSLU1VarOy`.
- Fresh workspace inspection returned **0 projects**.
- The exposed `deploy_to_vercel` action was retried during v15 release work and failed before build creation with `Tool deploy_to_vercel not found`.
- No project-creation action is currently exposed through the connected Vercel toolset.
- No preview/production deployment, build log, runtime log, or verified public URL exists for v15. No deployment is claimed until a writable path succeeds and the live origin is browser-smoke-tested.

## Known issues / limitations

- Browser behavior and real HTTP delivery are validated separately in this environment; the release has not yet received an end-to-end smoke test against a public production origin.
- All player identity, saves, scores, and analytics remain local-only. Cloud leaderboards/accounts require an authenticated backend before they can be added safely.
- Nine games currently consume the shared keyboard mapping layer; remaining legacy releases keep their established controls until migrated deliberately.

## Next high-value priorities

- Establish the first verified Vercel deployment as soon as project/deployment write capability becomes available.
- Continue migrating suitable legacy action/racing games to the shared remapping layer without changing established control feel.
- Deepen Prism Duel AI with difficulty selection and stronger cover tactics, or expand another long-form title such as Mosslight Vale.
- Add richer player-mode metadata where future games support both solo and local-co-op/competitive play.
- Add cloud leaderboards/social identity only when authenticated storage can be introduced without compromising local-first reliability.
