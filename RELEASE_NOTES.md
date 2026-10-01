# WorldWideGames Release Notes

## v29 — Long-Form Depth Pass

WorldWideGames v29 keeps the catalog at **66 games / 106 genre tags** and spends the release on deeper campaign play. Achievement coverage rises to **89**, shared remapping to **40 games**, and the PWA cache advances to `wwg-v29`.

### Aetherstead Colony 2.0

- Rebuilt the original single-scenario colony game into a persistent **three-charter / 36-turn campaign**.
- Added six upgradeable structure classes, adjacency bonuses, charter-specific policies, deterministic crises, charter seals, legacy bonuses, autosave/resume, and lifetime clear/best-score records.
- Added standardized charter completion/failure events plus scored full-campaign completion.
- Added shared remappable keyboard control alongside pointer/touch input.
- Verified all three charters through a legitimate construction/economy path with mid-campaign save/reload.

### Mosslight Vale 1.8

- Extended the six-region RPG arc with milestone autosaves and a true post-restoration finale.
- Added the **Starshade Warden** final boss after Starbloom Canopy and a final Ranger Elian return.
- Added backward-compatible durable epilogue state, campaign clears/best score, and scored campaign completion.
- Verified the complete six-region sequence, both boss battles, intermediate autosave/reload, and completed-campaign reload.

### Platform and QA

- Added a **Long Campaigns** curated collection.
- Added **Six-Region Warden** and **Sky-City Architect** achievements.
- Added `LONGFORM_AUDIT.md` and permanent `v29_longform.py` coverage.
- Full regression remains green: 66/66 runtime-clean, 66/66 smoke boots, 139/139 local-origin HTTP paths, 40 remappable releases, 56 scored-release event coverage, and correct score-direction semantics.

## v28 — Fluxward Conclave / Circuit Rush 2.0

WorldWideGames v28 expands the Architect Industries browser arcade to **66 games**, **106 genre tags**, **87 achievements**, and **39 remappable releases** while substantially upgrading one of the oldest racing titles.

### New game: Fluxward Conclave

- Original three-arena territory strategy built around connected expansion, cell charging, tactical pulse conversion, relay bonus actions, and positional control.
- Solo campaign against a deterministic tactical rival plus Local Multiplayer pass-and-play duel mode.
- Pointer/touch, remappable keyboard, and gamepad support.
- Persistent local records and standardized campaign/win/triple-crown events.
- New featured release and PWA shortcut target.

### Circuit Rush 2.0

- Rebuilt the original concise racer into a three-lap competition with **three live AI rivals**.
- Added ordered eight-gate checkpoint progression, live place tracking, cyan boost gates, off-track grip loss, pause/resume, best-time/place persistence, and race-win events.
- Preserves instant browser launch, touch, gamepad, and shared keyboard remapping.

### Platform and QA

- Added Circuit Champion, Fluxward Victor, and Triple Crown achievements for **87 total**.
- Remapping coverage rises to **39 games**.
- Scored-release event coverage rises to **56 releases**.
- Release History advances to v28 through v23.
- Offline cache upgraded to `wwg-v28` and includes Fluxward Conclave.
- **66/66** catalog runtime-clean pass.
- **66/66** all-game boot smoke pass.
- **139/139** local HTTP paths returned 200.
- Fluxward and Circuit Rush both pass direct mechanic-specific regression suites.

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
