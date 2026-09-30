# WorldWideGames Project State

Last updated: 2026-09-30
Owner/operator: Architect Industries
Current source release: v20
Production release: v15 at `https://worldwidegames.vercel.app`
Canonical GitHub repository: `ArchitectIndustries/World-Wide-Games` (`main`)
Status: **57-game** playable static browser-gaming platform. v20 is validated and deployment-ready. Vercel production remains on the last user-verified v15 deployment because the connected deployment authorization still returns 403 for the established project.

## Architecture

- Static host-anywhere platform with a data-driven catalog in `js/games.js` and reusable `game.html?id=<id>` shell.
- Local browser profile tracks plays, sessions, playtime, recent games, favorites, Play Later, ratings, achievements, Daily/Weekly Circuit activity, completion milestones, direction-aware best scores, scored-run history, accessibility/audio preferences, keyboard mapping, profile backup/restore, discovery mixes, and game-specific saves.
- Discovery supports search, **90 genre tags**, input capability, Solo / Local Multiplayer filtering, curated collections, player status, sorting, recommendations, deterministic Daily Pick, shareable/bookmarkable discovery query state, and one-click three-game mixes.
- `assets/wwg-input.js` is the reusable keyboard-remapping layer. **22 releases** now adopt it.
- Score metadata supports both higher-is-better and lower-is-better records.
- `wwg-v20` service worker caches the complete 57-game catalog and covers plus shared platform assets, with network-first navigation fallback.
- `vercel.json` remains included for static Vercel deployment.

## v20 production work

### New releases

- **Mirrormesh Relay** — featured six-board optics puzzle. Rotate mirrors to steer a live beam through every beacon and into the receiver. Includes remappable keyboard controls, pointer/touch play, turn-efficient scoring, and independently verified solvability for all six authored boards.
- **Hushwave Operator** — six-signal radio-tuning puzzle/simulation. Tune frequency, phase, and gain, read the live oscilloscope, use diagnostic hints, and lock increasingly narrow hidden carriers. Includes remappable keyboard controls plus pointer/touch sliders.

### Platform upgrades

- Added **Make 3-game mix** to discovery. It respects the active search/filter/collection state, prioritizes less-played eligible releases, adds up to three titles to Play Later, and records local mix creation.
- Added **Signals & Circuits** curated discovery for Signal, Radio, Optics, Programming, Automation, and Logic releases.
- Added three achievements: Mesh Closer, Quiet Band, and Mix Curator, bringing the platform total to **67**.
- Remapping coverage rises from 20 to **22 games** with both new releases using the shared input layer.
- Featured PWA shortcut now launches Mirrormesh Relay.
- Offline cache upgraded to `wwg-v20`.

## Current catalog — 57 games

1. Mirrormesh Relay
2. Hushwave Operator
3. Pulsevine Parkour
4. Tessera Commons
5. Glasswing Polo
6. Rootsong Architect
7. Stoneveil Ascent
8. Tidal Foundry
9. Riftwake Regatta
10. Archive Alchemist
11. Driftglass Links
12. Tideglass Surveyor
13. Spanwright
14. Lantern Line
15. Frostline Rescue
16. Signal Choir
17. Terrace Keeper
18. Chronofold Courier
19. Hearthline Kitchen
20. Spectra Safari
21. Ashfall Caravan
22. Twinforge Expedition
23. Mothlight Museum
24. Windward Cargo
25. Cipher Court
26. Moonwake Angler
27. Deepwater Signal
28. Emberdeck Pilgrim v1.2
29. Command Bloom
30. Railspire Dispatch
31. Glyphsmith
32. Solar Loom
33. Atlas Below v1.4
34. Aetherstead Colony
35. Prism Duel v1.1
36. Crownline Tactics
37. Echo Bazaar
38. Lumen Relay
39. Starweaver Drift
40. Pulse Archive
41. Verdant Circuit
42. Quiet Protocol
43. Forgeflow
44. Cloudforge Pinball v1.1
45. Mosslight Vale v1.7
46. Gravity Foundry
47. Hexbound Tactics
48. Harbor Pulse
49. Rift Relay
50. Skyhook Sprint
51. Neon Stack v1.1
52. Circuit Rush
53. Bastion Bloom
54. Emberfield Survival
55. Vector League
56. Orbit Breaker
57. Rune Depths

## Validation completed on 2026-09-30

See `TEST_REPORT.md` for exact coverage and limitations.

- All **57 game scripts** boot and advance under the runtime harness.
- Registry contains 57 unique IDs, **90 distinct genre tags**, one featured release, normalized score metadata on every game, and **22 remappable releases**.
- All registered pages/covers exist and are included in `wwg-v20`.
- Fresh local HTTP delivery returned **200 across 123 tested paths**.
- Chromium interaction checks confirmed 57 catalog cards, **67 achievements**, Signals & Circuits discovery, 390 px mobile layout without horizontal overflow, three-game mix behavior, remapped input, and scored completion for both new games.
- Shared-remap regression is green across **22 compatible games**.
- Numeric score-event regression is green across **47 representative games**.
- Deep validation proves all six Mirrormesh authored relays have valid solutions and all six Hushwave targets are reachable in-domain with an 86% lock threshold.
- Public-facing source scan covered **122 files** and found no prohibited internal branding.

## GitHub state

- Repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.
- Connected GitHub authorization has push/admin repository access.
- At the beginning of the v20 run, GitHub `main` was still on v15 commit `647d291c28245e1d732aec457e84cfd39ec4d413`.
- v20 is the verified source intended for synchronization during this run. The resulting GitHub commit is recorded in the run report and should be treated as the durable source mirror once synchronization completes.

## Vercel state

- Production project: `worldwidegames`.
- Project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`.
- Team: Architect Industries / `architect-industries`, team ID `team_wwOmTAdrfPwvTGNSLU1VarOy`.
- Production domain: `https://worldwidegames.vercel.app`.
- Last user-verified live release remains **v15 / Ready**.
- Connected Vercel authorization previously returned **403 Forbidden** for deployment enumeration against the explicit project ID. Re-check on each release; when write access becomes available, deploy the newest verified release automatically to this exact project and smoke-test production. Never create a duplicate project solely because connector enumeration is stale.

## Persistence and recovery

- `/WorldWideGames` remains the persistent release archive.
- `ArchitectIndustries/World-Wide-Games` is the durable source mirror and should be consulted together with the Library on every run.
- If one location is temporarily behind, prefer the newest fully verified release rather than rebuilding from an older source.

## Next high-value priorities

- Deploy the newest verified release to the existing Vercel project when connector write access becomes available, then smoke-test the production origin and inspect logs.
- Continue deliberate remapping migration for suitable legacy games.
- Deepen a long-form title such as Emberdeck Pilgrim, Ashfall Caravan, or Mosslight Vale while maintaining catalog diversity.
- Add consistent difficulty/assist metadata only when it can be authored per-game rather than inferred from genre.
- Consider authenticated cloud scoreboards/social identity only when persistence, abuse handling, moderation, and privacy can be introduced without weakening local-first reliability.
