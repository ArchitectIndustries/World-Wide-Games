# WorldWideGames Release Notes

## v25 — Echofall Caverns / Rune Depths 2.0

WorldWideGames v25 expands the Architect Industries browser arcade to **64 games**, **103 genre tags**, **81 achievements**, and **36 remappable releases**.

### New game

- **Echofall Caverns** — featured six-chamber echolocation exploration puzzle with sonar reveal, three resonators per chamber, remappable controls, touch/gamepad support, reduced-motion-aware presentation, and lower-is-better echo-cost scoring.

### Major upgrade

- **Rune Depths 2.0** — rebuilt into a five-depth deterministic procedural dungeon campaign with four sigils per floor, Shade/Wisp/Brute enemies, three relic families, potions, persistent best-depth/relic progress, full-run mastery, touch/gamepad support, and shared remapping.

### Platform

- Added **Deep Expeditions** curated discovery.
- Added Echo Cartographer, Five Depths, and Relic Triad achievements.
- Remapping coverage increased to **36 games**.
- Release History advances to v25 through v20.
- Updated featured PWA shortcut and `wwg-v25` offline cache.

### Validation

- 64/64 game boot smoke pass.
- 135/135 local HTTP paths returned 200.
- 64-card / 81-achievement Chromium UI pass with 390 px responsive width, Deep Expeditions, full Echofall completion, and a full five-depth Rune Depths mastery path.
- 36-game shared-remap regression pass.
- 54-release carried-forward + current numeric scoring coverage.
- Deep validation proves all six Echofall chamber routes and Rune Depths' five-floor / three-relic / three-enemy-family campaign structure.
- QA fixed a disconnected Echofall resonator route and a sonar-ripple negative-radius rendering defect before release.

## v24 — Starfall Observatory / Emberdeck Pilgrim 1.3

WorldWideGames v24 expands the Architect Industries browser arcade to **63 games**, **101 genre tags**, **78 achievements**, and **34 remappable releases**.

### New game

- **Starfall Observatory** — featured six-target astronomy/observation game with azimuth/altitude aiming, Blue/Gold/Infrared spectral filters, touch/pointer scope control, shared remapping, progressively tighter acquisition tolerances, and numeric survey scoring.

### Major upgrade

- **Emberdeck Pilgrim 1.3** — expanded to a five-gate deckbuilding pilgrimage with a route choice, route-specific foes, three relics, expanded cards, persistent Glass/Iron mastery, shared remapping, and a dual-route mastery milestone.

### Platform

- Added **Release History** with six recent version summaries.
- Added **Science & Discovery** curated discovery.
- Added Sky Surveyor, Dual Pilgrim, and Release Archivist achievements.
- Remapping coverage increased to **34 games**.
- Updated the featured PWA shortcut and `wwg-v24` offline cache.

### Validation

- 63/63 game boot smoke pass.
- 133/133 local HTTP paths returned 200.
- 63-card / 78-achievement Chromium UI pass with 390 px responsive width, Release History, Science & Discovery, and both v24 completion paths.
- 34-game shared-remap regression pass.
- 53-release carried-forward + current numeric scoring coverage.
- Deep validation confirms all six Starfall targets and Emberdeck's five-gate / three-relic / six-foe route-mastery structure.

### Release continuity

- Restored the complete v23 source and records archives to `/WorldWideGames`.
- GitHub `main` remains on verified v21 because the atomic v24 tree write was blocked before any ref movement; no partial v24 state was promoted.
- Vercel production access remains authorization-blocked with 403 deployment enumeration, so the last user-verified production baseline remains v15.

## v23 — Prismweave Atelier / Bastion Bloom 1.5

WorldWideGames v23 expands the Architect Industries browser arcade to **62 games**, **100 genre tags**, **75 achievements**, and **32 remappable releases**.

### New game

- **Prismweave Atelier** — featured six-commission weaving/logic game. Shift entire rows or columns to restore textile patterns in par-efficient moves using remappable keyboard controls or pointer/touch play.

### Major upgrade

- **Bastion Bloom 1.5** — expanded into a ten-wave garden-defense campaign with three tower classes, four enemy archetypes, tower upgrades, boss waves, pause, 1x/2x speed, shared remapping, touch play, and campaign-completion scoring.

### Platform

- Added **Recently Updated** homepage discovery for upgraded releases.
- Added **Craft & Create** curated discovery.
- Added Atelier Weaver, Garden Warden, and Update Explorer achievements.
- Remapping coverage increased to **32 games**.
- Updated the featured PWA shortcut and `wwg-v23` offline cache.

### GitHub continuity

- Created `release-v23-verified` from the verified v21 `main` baseline.
- A single new v23 regression file was accepted, but existing-file/tree writes were then blocked by the connected GitHub write safety gate. The partial branch was not promoted to `main` and is not treated as the v23 source of truth.
- The complete v23 package remains authoritative until full GitHub synchronization succeeds.

### Validation

- 62/62 game boot smoke pass.
- 133/133 local HTTP paths returned 200.
- 62-card / 75-achievement Chromium UI pass with 390 px responsive width, Recently Updated, Craft & Create, and both v23 completion paths.
- 32-game shared-remap regression pass.
- 52-release carried-forward + current numeric scoring coverage.
- Deep validation independently solves all six Prismweave commissions and exercises Bastion's ten-wave structure, enemy archetypes, boss waves, and completion path.

## v22 — Blackglass Watch / Tetherline Salvage

- Added Blackglass Watch and Tetherline Salvage.
- Added Continue Playing, Fresh Genre, Night Shift, and expanded profile progress metrics.
- Migrated Deepwater Signal and Rift Relay to shared remapping.
- Reached 61 games, 97 genres, 72 achievements, and 30 remappable releases.

## v21 — Kiteglass Drift / Runelight Locksmith

- Added Kiteglass Drift and Runelight Locksmith.
- Added In progress, Uncleared, and Air & Altitude discovery.
- Migrated Starweaver Drift and Windward Cargo to shared remapping.
