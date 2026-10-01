# WorldWideGames Validation Report

Date: 2026-10-01
Release: **v27** — full 65-game catalog quality audit and six legacy correctness/coherence upgrades

## Audit objective

This release deliberately prioritizes whether the existing catalog is actually coherent and playable over adding another title. Every registered game was loaded independently and checked for runtime errors. Common controls were exercised broadly, generic-input outliers received direct mechanic-specific checks, and smaller/older titles received visual/source review where implementation brevity warranted skepticism.

The audit establishes representative functionality and coherence; it does not claim exhaustive human mastery of every level/path or every browser/OS/gamepad combination.

## Full-catalog Chromium audit

`python tests/v27_catalog_audit.py`

- **65/65 registered games** loaded independently in Chromium with isolated state.
- **0 page/runtime errors** in the completed catalog pass.
- Generic keyboard/pointer activity produced observable state change in 62 titles in the audit pass.
- Geometry/mechanic-specific generic outliers were not classified as broken; they received direct interaction coverage in `v27_fixes.py` and targeted source/visual review.
- Result: **all 65 games runtime-clean**.

## Defect and targeted interaction regression

`python tests/v27_fixes.py`

Passed assertions for:

- Glyphsmith finite rune inventory, spent-rune lockout, and Backspace return.
- Echo Bazaar forward-looking rumor applied on the subsequent day.
- Signal Choir transition input lock after a wrong note.
- Pulse Archive visible final score matching emitted standardized score.
- Lumen Relay completed-run rotation-total reset.
- Hushwave Operator cumulative sample telemetry.
- Direct Lumen Relay mirror rotation.
- Direct Hushwave frequency adjustment.
- Direct Crownline operative selection.
- Direct Atlas Below cavern movement with expected oxygen consumption.
- Direct Forgeflow routing-tile rotation through the actual pointer handler.

## Runtime smoke harness

`node tests/smoke.js`

- All **65 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python tests/v27_static.py`

- 65 unique game IDs and **105 distinct genre tags**.
- Exactly one featured game remains Strata Cipher.
- Every game has score metadata, at least three documented controls, a substantive description, a local page, cover asset, and service-worker registration.
- `wwg-v27` cache is registered.
- **38 games** declare shared remapping.
- Six corrected legacy titles are marked version 1.1 with the v27 update date.
- Achievement total remains **84**.
- Public-facing scan covered **138 files** and found no prohibited internal branding/tool references.

## HTTP origin delivery

`python tests/v27_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **137/137 paths returned HTTP 200.**

## Shared input remapping

`python tests/v26_remap.py`

- The complete custom I/J/K/L/F/H regression remains green across all **38 supported releases**.
- v27 did not add remapping declarations, so the inherited full-coverage remap test is the applicable regression suite.

## Numeric game-event regression

`python tests/v26_events.py`

- Carried-forward/current validation remains green across **55 scored releases**.
- Hushwave's event schema remains numeric while its `samples` metadata now accumulates the full run correctly.

## Score-direction regression

`node tests/v26_direction.js`

- Lower-is-better semantics remain correct for all six current low-score titles.
- Higher-is-better semantics remain intact for the general platform.

## Targeted visual/source review

The concise/older games most likely to be mistaken for filler were inspected in addition to automated boot coverage. Circuit Rush, Railspire Dispatch, Harbor Pulse, Orbit Breaker, Cipher Court, Crownline Tactics, Atlas Below, and Forgeflow were retained because their code and rendered state implement coherent gameplay loops rather than placeholder screens. The six titles with genuine inconsistencies were fixed rather than removed.

See `CATALOG_AUDIT.md` for the per-game ledger.

## Production-origin limitation

- The evidence above consists of local HTTP validation, self-contained Chromium/runtime harnesses, static checks, and source/visual review.
- Connected Vercel deployment enumeration for established project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` has most recently returned **403 Forbidden**, so these checks are not represented as production-origin verification.

## GitHub continuity

- GitHub `main` began this release at verified v26 commit `062c484b366e0a920a2ec1839f2483c38ea06ed9`.
- v27 is eligible for synchronization only after the complete release gate above remains green.
