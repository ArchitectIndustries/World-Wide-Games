# WorldWideGames Validation Report

Date: 2026-10-01
Release: **v26** — 65-game catalog, Strata Cipher, Ashfall Caravan 2.0, Field Studies, 38-game remapping coverage, and 84 achievements

## Runtime smoke harness

`node tests/smoke.js`

- All **65 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python tests/v26_static.py`

- 65 unique game IDs and **105 distinct genre tags**.
- Exactly one featured game: Strata Cipher.
- Every game has score metadata, a local page, cover asset, and service-worker registration.
- `wwg-v26` cache and PWA shortcut point at the v26 release.
- **38 games** declare shared remapping.
- Field Studies and all three v26 achievements are registered.
- Achievement total: **84**.
- Public-facing scan covered **138 files** and found no prohibited internal branding/tool references.

## HTTP origin delivery

`python tests/v26_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **137/137 paths returned HTTP 200.**

## Chromium interaction / responsive validation

`python tests/v26_quick.py`

- 65 catalog cards and 84 achievements render.
- Release History shows six recent releases headed by v26.
- Field Studies includes Strata Cipher and Starfall Observatory.
- 390×844 viewport has no horizontal overflow.
- Full Strata Cipher completion recovers all eighteen fragments and emits numeric survey/delicate-excavation events.
- Full Ashfall Caravan Relief contract path completes all twelve crossings and emits numeric journey scoring with contract mastery.
- No tested page errors occurred.

## Shared input remapping

`python tests/v26_remap.py`

- The complete v25 custom I/J/K/L/F/H regression remains green across its 36 supported releases.
- Strata Cipher and Ashfall Caravan 2.0 pass direct custom-mapping checks.
- Total shared-remapping coverage: **38 games**.

## Numeric game-event regression

`python tests/v26_events.py`

- Strata Cipher emits numeric `survey-complete` scoring plus a `delicate-excavation` milestone.
- Ashfall Caravan 2.0 retains numeric `journey-complete` scoring and adds `contract-mastered` progression.
- The carried-forward + current validation set covers **55 scored releases**.

## Deep authored-content validation

`python tests/v26_deep.py`

- All **six Strata Cipher sites** are exactly 6×6, contain exactly three artifact fragments and four fault pockets, and share deterministic signal rules.
- Ashfall Caravan 2.0 defines **12 crossings**, **3 persistent contracts**, backward-compatible Chronicle metadata, and a three-contract mastery event.

## Score-direction regression

`node tests/v26_direction.js`

- Lower-is-better semantics remain correct for all six current low-score titles.
- Higher-is-better semantics remain intact for the general platform plus Strata Cipher and Ashfall Caravan.

## Production-origin limitation

- Fresh deployment enumeration for established Vercel project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` still returns **403 Forbidden** through the connected Vercel app, and project lookup still exposes a connector input mismatch.
- Local HTTP, Chromium, runtime, static, remapping, score-event, and authored-content checks are not represented as production-origin tests.

## GitHub continuity

- GitHub `main` began this release at verified v25 commit `c7271ee2e3919df027e3feab8f240619a3e60296`.
- v26 was built from the exact reconstructed v25 source tree and is synchronized only after this release gate passes.
