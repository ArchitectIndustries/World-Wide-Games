# WorldWideGames Release Notes

## v15 — 2026-09-30

Catalog expanded from 45 to **47 playable games** across **76 genre tags**.

### New games

- **Driftglass Links** — featured six-hole golf/physics game with drag-to-shoot aiming, ricochet walls, sand, water hazards, touch/pointer controls, keyboard and gamepad support, and lower-is-better stroke records.
- **Tideglass Surveyor** — six-chart cartography logic game built around lighthouse distance triangulation, four-probe budgets, keyboard/touch play, correction penalties, and scored atlas completion.

### Prism Duel 1.1

- Added persistent **VS AI** mode while keeping the original same-device two-player duel.
- Added AI steering, pursuit, cover navigation behavior, and firing alignment.
- Added HUD/M-key mode toggle and `ai-duel-won` score event for solo victories.
- Registered Prism Duel as both Solo and Local Multiplayer for discovery.

### Platform upgrades

- Added **Solo / Local Multiplayer** play-mode filtering and mode badges.
- Added **Aim & Arc** curated discovery.
- Extended shared keyboard remapping to Circuit Rush and Orbit Breaker for **9 compatible games**.
- Fixed Orbit Breaker's initial shot cooldown so first fire input is immediately responsive.
- Added games-cleared progression to the local profile.
- Added five achievements for **50 total**.
- Upgraded offline cache to `wwg-v15` and updated the featured PWA shortcut to Driftglass Links.

### Validation

- All 47 game scripts boot and advance under the runtime harness.
- All registered pages/covers exist and are cached.
- Fresh HTTP server returned 200 across **105 tested paths**.
- Chromium checks passed for 47 cards, 50 achievements, Aim & Arc, Solo/Local Multiplayer filtering, 390 px mobile width, both new games, Prism Duel AI mode, and new remapping migrations.
- Shared remap regression passes across **9 games**.
- Standardized numeric score-event suite passes across **37 representative games**.
- Dedicated low-score tests confirm worse records are rejected and better records accepted for both Driftglass Links and Lantern Line.
- A real-origin Chromium loopback attempt was blocked by environment policy; HTTP delivery and browser behavior were validated separately.

### Deployment

Architect Industries Vercel inspection still returns zero projects. The deployment action was retried and still fails before build creation with `Tool deploy_to_vercel not found`. v15 is static-deployment-ready but is not claimed as publicly live until a real deployment and production-origin browser validation succeed.

---

## v14 — 2026-09-30

Catalog expanded from 43 to **45 playable games** across **73 genre tags**.

### New games

- **Spanwright** — featured five-blueprint construction/engineering puzzle with budgeted beam placement, structural load-path checks, convoy certification, touch/pointer controls, keyboard shortcuts, and scored completion.
- **Lantern Line** — city-loop vehicle simulation with throttle/braking, passenger comfort, schedule timing, six station stops, touch/gamepad/remappable keyboard support, and the platform's first **lower-is-better** personal record.

### Mosslight Vale 1.6

- Added **Moonroot Hollow**, the fifth linked region beyond Sunfall Reach.
- Added Keeper Nera, three Dusk Orchids, new terrain and enemies, a fifth quest arc, Hollowglass V, extra health/coin/potion progression, a fourth fast-travel destination, and persistent `hollowStage` save data.
- Added numeric `moonroot-restored` completion scoring and backward-compatible loading for older saves.

### Platform upgrades

- Added **Build & Operate** curated discovery.
- Added direction-aware local best handling for both higher-is-better and lower-is-better games.
- Recent-run summaries now calculate best and trend using each game's score direction.
- Local Best Scores show ↑/↓ semantics and are ordered by recent record activity instead of comparing unlike raw score units.
- Extended shared keyboard remapping to Lantern Line for **7 compatible games**.
- Added three achievements for **45 total**.
- Upgraded offline cache to `wwg-v14` and updated the featured PWA shortcut to Spanwright.

### Validation

- All 45 game scripts boot and advance under the runtime harness.
- All registered pages/covers exist and are cached.
- Fresh HTTP server returned 200 across **101 tested paths**.
- Chromium checks passed for 45 cards, 45 achievements, Build & Operate/Remappable filtering, 390px mobile width, both new games, Moonroot Hollow progression/save behavior, and all seven remappable games.
- Standardized numeric score-event suite passes across **35 representative games**.
- Dedicated score-direction test confirms worse low scores are rejected and better low scores replace the personal best.

### Deployment

The Architect Industries Vercel workspace remains connected for inspection but still reports zero projects. The deployment action was retried and still fails before build creation with `Tool deploy_to_vercel not found`. v14 is static-deployment-ready but is not claimed as publicly live until a real deployment and production-origin browser validation succeed.

---


## v13 — 2026-09-30

Catalog expanded from 40 to **43 playable games** across **69 genre tags**.

### New games

- **Frostline Rescue** — featured real-time emergency rescue/action-strategy game with spreading fire, six residents, water and hydrant management, escorting, safe-zone extraction, procedural audio, touch controls, gamepad support, remappable keyboard input, and scored completion.
- **Signal Choir** — six-round audiovisual memory game with five tonal channels, escalating sequences, replay penalties, streak scoring, three lives, procedural audio, and visual feedback that remains playable while muted.
- **Terrace Keeper** — twelve-day farming/management simulation with three crops, watering, harvest timing, weather, frost/rain effects, a seasonal contract, cistern and windglass upgrades, and pointer/touch play.

### Platform upgrades

- Added reusable `assets/wwg-input.js` keyboard-remapping layer for Up / Down / Left / Right / Primary / Secondary actions.
- Added keyboard-map controls to the local player profile.
- Added **Remappable keyboard** discovery filtering and capability badges.
- Adopted shared remapping in six games: Frostline Rescue, Chronofold Courier, Atlas Below, Quiet Protocol, Skyhook Sprint, and Mosslight Vale.
- Added **Hands & Heart** curated collection.
- Added four achievements, increasing the platform total to **42**.
- Upgraded offline cache to `wwg-v13` for all 43 games/covers plus the new shared input asset.
- Updated the featured PWA shortcut to Frostline Rescue.

### Emberdeck Pilgrim 1.2

- Added branching Glass Garden / Iron Kiln middle routes.
- Added route-specific enemies, attack patterns, reward pools, and scored route metadata.
- Added Legacy-gated Glassbolt, Ironhide, and Cinderstep cards.
- Added persistent Legacy boon choice at three clears: Coalheart, Quicksteel, or Lantern.
- Later Legacy thresholds now modify starter-deck composition and run setup.

### Validation

- All 43 game scripts boot and advance under the runtime harness.
- All 43 registered pages/covers exist and are cached.
- Fresh HTTP server returned 200 across 97 tested paths.
- Chromium checks passed for 43 cards, 42 achievements, keyboard-map persistence, Remappable and Hands & Heart filters, 390px mobile width, all three new games, Emberdeck branching, and custom remapped movement in all six compatible games.
- Standardized numeric score-event suite passes across 32 representative games.
- Frostline mutable-state defect discovered by smoke QA was fixed before packaging.

### Deployment

The Architect Industries Vercel workspace remains connected for inspection but the final v13 recheck returned zero projects. The nominal deployment action still fails before build creation with `Tool deploy_to_vercel not found`, and no project-creation action is exposed. v13 is static-deployment-ready but is not claimed as publicly live until a real deployment and production-origin browser validation succeed.
