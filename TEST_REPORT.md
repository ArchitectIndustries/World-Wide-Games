# WorldWideGames Validation Report

Date: 2026-10-01
Release: **v29 — Long-Form Depth Pass**

## Release objective

v29 deliberately prioritizes campaign depth over catalog growth. The release deeply validates and expands two of the catalog's principal long-form games while preserving the broader 66-game runtime, input, scoring, and delivery regressions.

The evidence below consists of local/self-contained Chromium/runtime testing, local HTTP validation, source/static checks, and persistent-storage reload tests unless explicitly marked otherwise. It does not claim exhaustive coverage of every optional route, procedural seed, hardware/browser combination, or physical gamepad/touch device.

## Aetherstead Colony 2.0 deep-run validation

`python3 tests/v29_longform.py`

- Completed all **three 12-turn charters (36 authored turns)** through legitimate construction, upgrades, resource flow, policies, crises, and end-turn logic.
- No success flag or artificial resource injection is used by the completion path.
- Verified three charter completion events followed by `aetherstead-colony:colony-campaign-complete`.
- Verified all three persistent charter seals, one campaign clear, and stored best score.
- Saved during an in-progress charter, reloaded into a new page context, and continued the same campaign.
- Verified custom I/J/K/L/F/H remap behavior for the new platform cursor/build/cycle control contract.
- Verified 390x844 layout without horizontal overflow.

## Mosslight Vale 1.8 deep-run validation

`python3 tests/v29_longform.py`

- Progressed through the actual six-region quest/combat state machine: Elder/Moonshards, original Warden, Memory Garden, Silverfen, Sunfall Reach, Moonroot Hollow, Starbloom Canopy, Starshade Warden, final Ranger Elian return.
- Verified exact milestone event order: `vale-restored`, `memory-garden-restored`, `silverfen-restored`, `sunfall-restored`, `moonroot-restored`, `starbloom-restored`, `starshade-defeated`, `campaign-complete`.
- Defeated both campaign bosses through the real attack path.
- Reloaded a mid-campaign Silverfen autosave and continued successfully.
- Reloaded the final completed campaign and verified durable epilogue/final-boss/completion state.
- Verified persistent campaign clear/best-score meta.

## Full-catalog Chromium audit

`python3 tests/v29_catalog_audit.py`

- **66/66 registered games** loaded independently in isolated Chromium state.
- **0 page/runtime errors** in the completed catalog pass.
- Generic interaction produced observable state changes in 63 titles; Atlas Below, Lumen Relay, and Forgeflow retain their direct mechanic-specific coverage from the v27 audit.

## Runtime smoke harness

`node tests/smoke.js`

- All **66 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python3 tests/v29_static.py`

- 66 unique game IDs and **106 distinct genre tags**.
- Exactly one featured game remains Fluxward Conclave.
- Achievement total: **89**.
- Shared-remapping coverage: **40 games**.
- Aetherstead Colony version 2.0 and Mosslight Vale version 1.8 metadata verified.
- Long Campaigns collection and six-entry v29→v24 Release History verified.
- `wwg-v29` cache registered.
- Public-facing source scan remains clear of prohibited internal branding/tool references.

## HTTP origin delivery

`python3 tests/v29_http.py`

- **139/139 requested local-origin paths returned HTTP 200.**

## Shared input remapping

`python3 tests/v29_remap.py`

- Inherited full regression remains green for 39 prior remappable releases.
- Aetherstead's new custom mapping passes using I/J/K/L/F/H.
- Total declared remappable releases: **40**.

## Prior-release regressions retained

- `python3 tests/v28_game.py`: Fluxward Conclave pointer expansion, pulse conversion, remapped keyboard, local turn flow, campaign events, and mobile layout pass.
- `python3 tests/v28_circuit.py`: Circuit Rush ordered checkpoints, rivals, boost, pause, and podium event pass.
- `python3 tests/v27_fixes.py`: all six v27 coherence/correctness fixes plus targeted Lumen/Hushwave/Crownline/Atlas/Forgeflow interactions pass.
- `python3 tests/v28_events.py`: numeric scored-release coverage remains **56 releases**.
- `node tests/v26_direction.js`: all six lower-is-better titles retain correct semantics; general high-score semantics remain intact.

## Long-form scope boundary

This release proves legitimate full representative campaigns for Aetherstead Colony and Mosslight Vale. `LONGFORM_AUDIT.md` records why the other campaign-oriented titles were retained without redesign. It does not claim every optional build, route, relic combination, contract variation, seed, browser/OS, or physical controller has been exhausted.

## Production-origin limitation

The connected Vercel app has most recently returned 403 Forbidden for deployment enumeration on the established project and a schema mismatch for project lookup. Accordingly, the evidence above is not represented as production-origin verification. No duplicate Vercel project should be created to work around connector authorization.
