# WorldWideGames Release Notes

## v27 — Full Catalog Quality Audit

WorldWideGames v27 is a quality-focused release. The catalog intentionally remains at **65 games, 105 genre tags, 84 achievements, and 38 remappable releases** while the entire game library is audited for runtime cleanliness and coherence.

### Catalog audit

- Loaded all **65 registered games** independently in Chromium with isolated state and runtime/page errors captured.
- Exercised common controls across the catalog and added direct interaction checks for mechanic-specific generic-input outliers.
- Performed targeted visual/source review of concise legacy titles most likely to be mistaken for filler.
- Added `CATALOG_AUDIT.md` with a durable per-game disposition and explicit scope boundary.
- No registered game was found to be a placeholder, TODO shell, or runtime-crashing fake page.

### Six game upgrades

- **Glyphsmith 1.1** — rune bank is now finite inventory; spent runes cannot be reused until Backspace/Clear returns them.
- **Echo Bazaar 1.1** — rumors now forecast the next day's market pressure instead of narrating the move that already happened.
- **Signal Choir 1.1** — transition input is locked during wrong-note replay and between rounds, eliminating accidental extra penalties.
- **Pulse Archive 1.1** — visible final score now matches the standardized emitted score including accuracy bonus.
- **Lumen Relay 1.1** — completed-run rotation totals reset before a replay, keeping new-run scores independent.
- **Hushwave Operator 1.1** — completion telemetry now reports total samples across all six signals.

### Platform and QA

- Added repeatable `v27_catalog_audit.py` and `v27_fixes.py` regressions.
- Release History advances to v27 through v22.
- Offline cache upgraded to `wwg-v27`.
- 65/65 catalog runtime-clean pass.
- 65/65 boot smoke pass.
- 137/137 local HTTP paths returned 200.
- 38-game shared-remap regression remains green.
- 55 scored releases remain covered by carried-forward/current numeric-event tests.
- All six lower-is-better titles retain correct score direction.

## v26 — Strata Cipher / Ashfall Caravan 2.0

WorldWideGames v26 expands the Architect Industries browser arcade to **65 games**, **105 genre tags**, **84 achievements**, and **38 remappable releases**.

- Added **Strata Cipher**, a six-site archaeology/excavation strategy puzzle.
- Expanded **Ashfall Caravan 2.0** to twelve crossings, Parts, three road contracts, contract mastery, gamepad support, and shared remapping.
- Added Field Studies, three achievements, and `wwg-v26` offline cache.

## v25 — Echofall Caverns / Rune Depths 2.0

- Added Echofall Caverns.
- Rebuilt Rune Depths as a five-depth relic campaign.
- Added Deep Expeditions, three achievements, and 36-game remapping coverage.

## v24 — Starfall Observatory / Emberdeck Pilgrim 1.3

- Added Starfall Observatory.
- Expanded Emberdeck Pilgrim to five gates with relics and dual-route mastery.
- Added Release History and Science & Discovery.

## v23 — Prismweave Atelier / Bastion Bloom 1.5

- Added Prismweave Atelier.
- Expanded Bastion Bloom to a ten-wave tower-defense campaign.
- Added Recently Updated and Craft & Create.

## v22 — Blackglass Watch / Tetherline Salvage

- Added Blackglass Watch and Tetherline Salvage.
- Added Continue Playing, Fresh Genre, Night Shift, and expanded profile progress metrics.
