# WorldWideGames Project State

Last updated: 2026-10-03
Owner/operator: Architect Industries
Current verified source release: **v45 — Lumenfall Citadel**
Release-gate status: **source QA green; GitHub release candidate prepared for atomic promotion**
Status: **75-game** static browser-gaming platform with **122 genre tags**, **120 unique achievements**, **47 remappable releases**, persistent local player data, PWA/offline support, explicit per-game objectives, universal Arrow/WASD movement for shared-input games, a dedicated classic-archetype discovery shelf, full-catalog Chromium QA, and deep campaign regressions.

## v45 production work — Lumenfall Citadel

- Added **Lumenfall Citadel 1.0**, an original side-scrolling action-exploration campaign with a continuous multi-area citadel, platforming, melee/ranged combat, gated progression, checkpoints, and a final boss.
- Three ability runes reshape traversal and combat: **Dawn Rune** unlocks dash, **Veil Rune** unlocks a second jump, and **Ember Rune** unlocks a ranged rune bolt. Three matching seals require deliberate backtracking/progression before the Bell-Warden can be challenged.
- Four Lumen Shrines act as persistent checkpoints, restore Vigor, and checkpoint score so a death/revival cannot be exploited for score farming.
- Enemy pressure mixes melee guards, airborne wisps, projectiles, pits, and the 14-Vigor **Bell-Warden** finale.
- Keyboard, touch, and gamepad controls are included, with pause/new-run flow, readable live objectives, and a narrow-screen layout validated at 390×844.
- Durable local records track clears, best completion time, best score, and maximum runes claimed.
- Platform integration adds **Citadel Restored** and **Threefold Rune** achievements, adds Lumenfall to Flagship Worlds and Long Campaigns, makes it the featured/PWA-first release, and advances the offline cache to `wwg-v45`.

### v45 validation

- `python3 tests/v45_lumenfall.py`: **PASS** — runtime boot, keyboard movement/jump, all three rune unlocks, three progression gates, dash, double jump, rune bolt, shrine checkpoint persistence, death/revival rollback, legitimate Bell-Warden completion, campaign/meta persistence, required events, and 390×844 mobile width.
- `python3 tests/v45_static.py`: **PASS** — **75 games / 122 genres / 120 achievements / 47 remappable releases**, sole featured Lumenfall Citadel, `wwg-v45` PWA/cache wiring, asset paths, release history, and public-branding hygiene.
- Full-catalog isolated Chromium release harness: **PASS — 75/75 runtime-clean** in isolated Chromium; generic interaction changes state in 72 titles. Atlas Below, Lumen Relay, and Forgeflow remain the known generic-harness exceptions with dedicated mechanic coverage.
- `node tests/smoke.js`: **75/75 registered games boot** plus homepage and game-detail shells.
- `python3 tests/v41_controls_browser.py`: **75/75** game-detail pages expose objectives/controls; **47/47** remappable releases expose the universal/current key profile.
- `python3 tests/v32_http.py`: **157/157** local-origin release paths return HTTP 200.
- v42 reliability, Vanta Frontline, Astral Menagerie, Ironlight Breach, Polyforge Studio, Ashen Covenant, Verdant Echoes, Rune Depths, Aetherstead Colony/Mosslight Vale, classics/Orbit Breaker, and retained score-direction regressions remain green.

### v45 release gate

- GitHub baseline at run start: `main` = **`adf3bcf88f033885e56ff4fc7ba36e5cea8632a9`** (finalized v44 release state).
- Complete verified v45 source commit: **`713aae06f55e86e4dfd756b771a59cfdc3dd8a4f`**.
- The release-state documentation commit is built as a child of the complete source commit and promoted to `main` only after a final concurrency check using a non-force fast-forward.
- Production deployment to the established Vercel project remains blocked by project/team authorization; the existing project is preserved and no duplicate project is created.


## v44 production work — Vanta Frontline

- Added **Vanta Frontline 1.0**, a new runtime-rendered tactical first-person shooter built entirely from local browser code with no external art or audio assets.
- Three authored operations combine uplink capture, adaptive rifle/rusher/sniper response teams, automatic pickups, armor, reload discipline, and extraction scoring.
- Modern FPS controls include pointer-lock mouse aim, ADS, sprint, crouch, vault-jump, lean, reload, plus keyboard-turn fallbacks.
- Low / Medium / High pre-deployment graphics profiles scale ray density without changing rules.
- Touch D-pad/action controls and gamepad movement/aim/fire/ADS/reload are supported.
- Persistent best score, clear count, and furthest-operation records are stored locally.
- Platform integration adds **Vanta Operator** and **Signal Sweep** achievements, moves the featured/PWA first slot to Vanta Frontline, and advances the offline cache to `wwg-v44`.

### v44 validation

- `python3 tests/v44_vanta.py`: **PASS** — three 25×18 authored operations, three uplinks per operation, graphics-profile switching, universal Arrow/WASD movement under a stored custom remap, deterministic reload/armor/shooting boundaries, death-retry score rollback, complete three-operation extraction flow, persistence, and 390×844 mobile width.
- The Vanta gate found and fixed two pre-release defects before packaging: the render loop could raycast before the first operation grid existed, and retrying after death could retain failed-attempt score. Initial operation parsing and operation-start score checkpoints now prevent both.
- full-catalog Chromium release harness: **PASS** — static release assertions confirm **74 games / 121 genres / 118 achievements / 47 remappable releases**, sole featured Vanta Frontline, v44 PWA/cache wiring, assets, release history, and achievements; the same gate is **74/74 runtime-clean** in isolated Chromium with generic interaction changing state in 71 titles. Atlas Below, Lumen Relay, and Forgeflow retain direct mechanic-specific coverage.
- `node tests/smoke.js`: **74/74 registered games boot** plus homepage and game-detail shells.
- `python3 tests/v41_controls_browser.py`: **74/74** game-detail pages retain explicit objectives/controls; **47/47** remappable releases expose the universal/current key profile.
- `python3 tests/v32_http.py`: **155/155** local-origin release paths return HTTP 200.
- `python3 tests/v42_reliability.py` and deep Ironlight 3.0, Astral 3.1, Polyforge 3.0, Ashen 2.0, Verdant 2.0, Rune Depths, Circuit Rush, Fluxward Conclave, Pulsevine Parkour, and score-direction regressions remain green.

### v44 release gate

- GitHub baseline at run start: `main` = **`d807faa1666434f76d095a512c2b3aa08391f03f`** (v43 complete source release).
- Complete verified v44 source commit: **`4904150ea55c0fd9db5537a65babb178db601310`**.
- The final release-state commit is a documentation-only child of that source commit; `main` is promoted to that child only after a last concurrency check and a non-force fast-forward.
- Vercel project visibility remains connector-limited; the established project is preserved and no duplicate project is created.

## v43 production work — Neon Stack 2.0

The falling-block classic has been rebuilt from a short endless loop into a polished three-contract release while preserving the original WorldWideGames identity and no-install browser delivery.

- **Fair seven-piece bag:** every cycle contains one of each prism before reshuffling, reducing extreme droughts while keeping runs unpredictable.
- **Hold + preview:** players can bank one prism per deployed piece and see the next piece before committing.
- **Wall-kick rotation:** clockwise/counter-clockwise turns test compact horizontal and upward kick offsets near walls and stacked cells instead of failing immediately.
- **Three contracts:** Classic 40 (clear 40 lines), Prism Sprint (clear 20 lines quickly), and Ascension (survive to level 12).
- **Scoring depth:** soft/hard-drop bonuses, multi-row scoring, combo bonuses, persistent best score/lines, sprint best time, and contract-clear records.
- **Input/accessibility:** Arrow/WASD universal movement, Up/W/X/Z rotations, Space hard drop, C/Shift hold, pause/restart, gamepad, touch controls, explicit objective/record HUD, and live announcements.
- **Platform integration:** Neon Stack 2.0 becomes the featured release and first PWA shortcut; a new **Prism Stack Master** achievement raises the catalog to **116 achievements**; offline cache advances to `wwg-v43`.

### v43 validation

- Pre-release Neon Stack contract harness: seven-bag integrity, hold lock, wall kicks, universal movement under a saved custom remap, pause/restart, all three legitimate completion events, persistence, and 390×844 mobile width pass.
- Static release assertions: **73 games / 121 genres / 116 achievements / 47 remappable releases**, featured Neon Stack, v43 cache/PWA shortcut, source invariants, asset paths, and public-branding scan pass.
- `node tests/smoke.js`: **73/73 registered games boot** plus homepage/detail shells.
- `python3 tests/v41_controls_browser.py`: **73/73** detail pages retain explicit objectives/controls and **47/47** remappable profiles.
- `python3 tests/v41_catalog_audit.py`: **73/73 runtime-clean** in isolated Chromium.
- v42 reliability, v41 classics/Orbit Breaker, and deep Ironlight/Astral/Polyforge/Ashen/Verdant/Rune Depths/Circuit/Fluxward/Pulsevine/score-direction regressions remain green.
- `python3 tests/v32_http.py`: **153/153** local-origin release paths return HTTP 200.

### v43 release gate

- GitHub baseline at run start: `main` = `0393a86790cbe3b5cfc32161d27e8e1d08c6b0c7` (v42 release state).
- Complete verified v43 source release commit: **`d807faa1666434f76d095a512c2b3aa08391f03f`**.
- `main` was re-read immediately before promotion, still pointed at the verified v42 parent, and advanced by a **non-force fast-forward**.
- Post-write verification confirmed `main` points at the complete v43 source commit.
- A documentation-only release-state commit `7dd0401f7eeea8999086390502588e8a414a729d` was prepared but could not be promoted because the connector blocked the second ref update; `main` remains safely on the complete v43 source commit.
- Vercel remains blocked by the known connector authorization/schema limitation; no duplicate project will be created.

## v42 production work — Reliability Sweep

A catalog-wide logic audit was run after direct Orbit Breaker play feedback. Beyond the already-corrected Orbit Breaker false-loss rule, four additional reproducible gameplay/state defects were found and fixed:

- **Skyhook Sprint 1.1:** arithmetic checkpoint advancement could place `respawn` inside the 760–920 skyline void (for example around x=890), creating an endless fall/respawn loop. Checkpoints now resolve onto safe ground segments before they are stored and again before a fall respawn.
- **Crownline Tactics 1.1:** later Wardens in one enemy turn could target a squad member already reduced to 0 HP earlier in the same turn. Each Warden now rebuilds its target list from living operatives before choosing movement/attacks.
- **Vector League 1.1:** after the 90-second whistle or five-goal endpoint, the same animation frame continued simulating movement and goals after the final event was emitted. Terminal state now freezes immediately before any further ball/AI simulation.
- **Windward Cargo 1.2:** the final delivery could emit both `route-complete` and `route-ended` if fuel/cargo integrity hit zero in the same frame. Resource failure now resolves before route pickup/delivery scoring, guaranteeing exactly one terminal result.

### v42 validation

- `python3 tests/v42_reliability.py`: safe Skyhook checkpoints/respawns, Crownline living-target AI, Vector post-whistle freeze, and Windward single-terminal-event semantics all pass.
- `python3 tests/v42_static.py`: v42 cache, corrected game version metadata, and fix-source invariants pass.
- `python3 tests/v41_catalog_audit.py`: **73/73 runtime-clean** in isolated Chromium.
- `node tests/smoke.js`: **73/73 registered games boot** plus the platform shells.
- `python3 tests/v41_controls_browser.py`: **73/73** detail pages retain explicit objectives/controls; **47/47** remappable releases retain the universal/current key profile.
- `python3 tests/v41_classics.py` and `tests/v41_orbit_breaker.py`: Snake/Pulse Maze and Orbit Breaker correctness remain green.
- Deep regressions remain green for Ironlight 3.0, Astral Menagerie 3.1, Polyforge 3.0, Ashen Covenant 2.0, Verdant Echoes 2.0, Rune Depths, Circuit Rush, Fluxward Conclave, Pulsevine Parkour, v27 correctness, and score-direction semantics.

## v41 production work — Playability & Classic Vault

### Astral Menagerie 3.1 reliability fix

Direct reproduction found two concrete input defects behind the reported playability problem:

1. When a player already had a custom `wwg:keymap`, the shared input layer stopped accepting normal Arrow/WASD fallbacks. Astral therefore appeared unresponsive unless the player remembered the custom keys.
2. Astral used **E** for habitat Study while the platform also used E as the default Secondary action. The generic input handler consumed E before Study could execute outside battle.

v41 fixes both paths. Arrow keys and W/A/S/D are permanent directional aliases even with a custom remap; custom movement keys remain additional aliases. Astral handles contextual **E = Study** before generic Secondary input when not in battle, while E/Secondary continues to capture weakened wild Astrals during battle. A live `Next` objective HUD and `? · Objective` guide now state the immediate and campaign-level goals.

### Clear objectives platform-wide

- `game.html` now has a dedicated **Objective** section separate from About and Controls.
- `js/game-page.js` renders `How to win:` for every catalog entry using authored `objective` metadata first and a goal-aware fallback otherwise.
- Full-size discovery cards show a visible `Goal:` line.
- Weak/ambiguous legacy objectives were explicitly upgraded for Quiet Protocol, Hushwave Operator, Runelight Locksmith, Tidal Foundry, Terrace Keeper, Railspire Dispatch, and Pulsevine Parkour.
- All **73/73** game detail pages are regression-tested for non-empty objective presentation.

### Universal movement controls

- `assets/wwg-input.js` now keeps **Arrow Up/Down/Left/Right and W/A/S/D** active for shared directional movement regardless of saved custom remapping.
- Custom I/J/K/L-style mappings remain valid at the same time.
- The detail-page keyboard profile explicitly explains that custom movement mappings are additive.
- Shared-action bindings such as Primary/Secondary retain the selected remap behavior.

### Classics, Reimagined

A new discovery collection exposes familiar high-level game archetypes using original WorldWideGames identities and original code/assets. The collection currently labels **15 archetypes**, including:

- Ironlight Breach — Retro Corridor FPS
- Neon Serpent — Classic Snake
- Pulse Maze — Maze Chase
- Neon Stack — Falling Blocks
- Orbit Breaker — Space-Rock Shooter
- Cloudforge Pinball — Pinball
- Verdant Echoes — Top-Down Adventure
- Astral Menagerie — Creature Collection RPG
- Skyhook Sprint — Platformer
- Circuit Rush — Arcade Racing
- Bastion Bloom — Tower Defense
- Emberfield Survival — Arena Survival
- Quiet Protocol — Stealth Maze
- Prism Duel — Arcade Duel
- Pulse Archive — Rhythm Arcade

The homepage highlights six of these immediately, and the full discovery filter exposes the complete collection.

### Neon Serpent 2.0

- Contract 1 is now **Classic Snake**: no drones and no relay gates; eat cyan sparks, grow, and avoid the serpent body.
- Three additional contracts progressively add drones, relay gates, faster cadence, and higher growth targets.
- Expanded from three to **four** contracts with persistent unlocks/bests.
- Added objective guide, pause flow, number-key selection 1–4, and standardized `classic-cleared` event.

### Orbit Breaker 1.1 collision fix

Direct play feedback exposed a false-loss rule in Orbit Breaker: every asteroid that simply passed below the screen removed one shield point, even when it never touched the ship. The game had no ship/asteroid collision test at all. v41 corrects that contract:

- Shield now decreases **only on a physical asteroid/ship collision**.
- Asteroids that leave the bottom of the playfield are removed without damaging the player.
- Horizontal wrap-aware collision math prevents edge-of-screen misses.
- A 1.05-second post-hit invulnerability window prevents overlapping asteroids from draining multiple shields in one instant.
- The objective/help copy explicitly explains the survival rule, and a persistent local best is now displayed.

### New game — Pulse Maze 1.0

- Three original 21×21 maze layouts.
- Collect-all-shards maze-chase loop with four Prism Hunters using distinct pursuit targets.
- Four pulse nodes per maze temporarily reverse the hunt and allow hunter defeats for combo score.
- Fruit bonus, three lives, escalating stage speed, persistent best score/unlocked stage/clear records.
- Keyboard, touch, and gamepad movement; permanent Arrow/WASD aliases.
- Standard `maze-complete` and `campaign-complete` events.
- A pre-release QA pass caught and fixed an initialization defect where the first render could run before a player state existed.

### Platform/release changes

- Catalog: **73 games / 121 genres / 115 unique achievements / 47 remappable releases**.
- New achievements: **Classic Serpent** and **Pulse Maze Master**.
- Pulse Maze becomes the sole featured release.
- PWA shortcuts surface Pulse Maze, Neon Serpent, and Ironlight Breach.
- Offline cache advances to `wwg-v42`.
- Local-origin release path count rises to **153**.

## Validation

Executed on the final v41 runtime source:

- `python3 tests/v41_astral_controls.py`: reproduces a stored I/J/K/L/F/H remap and proves ArrowRight, D, and the custom L mapping all move; verifies E Study conflict is fixed, live objectives advance, guide text renders, and 390×844 layout has no horizontal overflow.
- `python3 tests/v40_astral.py`: complete Astral 3.0 study/trainer/rematch/Ascendant/Starlight campaign and v2 migration remain green on 3.1.
- `python3 tests/v41_classics.py`: Neon Serpent Classic contract is hazard-free, universal movement works under custom remap, `classic-cleared` emits, Pulse Maze power collision works, and all three maze completion/campaign events persist.
- `python3 tests/v41_orbit_breaker.py`: missed asteroids cause zero shield damage, direct collisions remove exactly one shield, post-hit invulnerability blocks chain damage, and wrap-edge collision math is correct.
- `python3 tests/v41_static.py`: **73 games / 121 genres / 115 unique achievements / 47 remappable games**, sole featured Pulse Maze, classic discovery/PWA paths, v41 cache, objective UI, universal movement source, asset paths, and public-branding scan pass.
- `python3 tests/v41_controls_browser.py`: **73/73** detail pages expose controls plus a `How to win` objective; **47/47** remappable releases expose the universal/current keyboard profile.
- `python3 tests/v41_catalog_audit.py`: **73/73 runtime-clean** in isolated Chromium; generic interaction changes state in 70 titles, with Atlas Below, Lumen Relay, and Forgeflow retaining dedicated mechanic coverage.
- `node tests/smoke.js`: **73/73 registered games boot**, plus homepage and detail shell.
- `python3 tests/v32_http.py`: **153/153** local-origin pages/assets return HTTP 200.
- `python3 tests/v32_remap.py`: legacy custom remap regression remains green.
- Deep regressions remain green for Ironlight 3.0, Polyforge 3.0, Ashen Covenant 2.0, Verdant Echoes 2.0, Rune Depths, v27 correctness, score-direction semantics, Circuit Rush, Fluxward Conclave, and Pulsevine Parkour.

The requested `agent-browser` executable is unavailable in the current runtime, and direct Playwright navigation to localhost is administratively blocked. Browser validation therefore uses the project's established self-contained Chromium/Playwright harness plus local HTTP delivery tests; those evidence types are recorded separately rather than represented as production-origin testing.

## GitHub continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- v42 baseline was the finalized v41 `main` commit **`8ded69db99ad6d99b6bb0d17693d0b3d1d461460`**.
- Complete verified v42 source release commit: **`f9d27674227fb04173fe7459aa129645673c1d95`**.
- `main` was re-read immediately before promotion, still pointed at the verified v41 parent, and advanced by a **non-force fast-forward**.
- Post-write verification confirmed `main` points at the complete v42 source commit before release-state documentation finalization.
- Release-state documentation was finalized on `main` at **`0393a86790cbe3b5cfc32161d27e8e1d08c6b0c7`** and re-verified there.

## Production deployment

Canonical Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`, Architect Industries team `team_wwOmTAdrfPwvTGNSLU1VarOy`, production domain `https://worldwidegames.vercel.app`.

- Fresh post-GitHub checks remain blocked by connector authorization: deployment enumeration returns **403 Forbidden**, authenticated production fetch is denied at protection-bypass metadata, and `get_project` still hits the known connector/schema mismatch.
- This is treated as an authorization/visibility limitation, not evidence that the established project is absent.
- No duplicate Vercel project was created and no v42 production deployment is claimed.

## Next high-value priorities

1. Continue expanding **Classics, Reimagined** with original high-quality archetypes where the catalog still has a real mechanical gap rather than duplicating an existing game.
2. Deep-play the new Pulse Maze difficulty curves with longer non-deterministic human-like runs and tune hunter speed/maze pressure if needed.
3. Continue objective-copy review for older concise games using direct player comprehension as the criterion.
4. Deploy the newest GitHub-verified release to the established Vercel project when project-scoped authorization permits it.