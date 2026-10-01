# WorldWideGames Validation Report

Date: 2026-10-01
Release: **v25** — 64-game catalog, Echofall Caverns, Rune Depths 2.0, Deep Expeditions, 36-game remapping coverage, and 81 achievements

## Runtime smoke harness

`node tests/smoke.js`

- All **64 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python tests/v25_static.py`

- 64 unique game IDs and **103 distinct genre tags**.
- Exactly one featured game: Echofall Caverns.
- Every game has score metadata, a local page, cover asset, and service-worker registration.
- `wwg-v25` cache and PWA shortcut point at the v25 release.
- **36 games** declare shared remapping.
- Deep Expeditions and all three v25 achievements are registered.
- Achievement total: **81**.
- Public-facing scan covered **136 files** and found no prohibited internal branding/tool references.

## HTTP origin delivery

`python tests/v25_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **135/135 paths returned HTTP 200.**

## Chromium interaction / responsive validation

`python tests/v25_quick.py`

- 64 catalog cards and 81 achievements render.
- Release History shows six recent releases headed by v25.
- Deep Expeditions includes Echofall Caverns and Rune Depths.
- 390×844 viewport has no horizontal overflow.
- Full real movement/completion path seals all six Echofall chambers and emits numeric lower-is-better scoring.
- Full real movement/relic path clears all five Rune Depths floors and emits both `depths-mastered` and `relic-triad` progression.
- No tested page errors occurred.

## Shared input remapping

`python tests/v25_remap.py`

- The complete v24 custom I/J/K/L/F/H regression remains green across its 34 supported releases.
- Echofall Caverns and Rune Depths 2.0 pass direct custom-mapping checks.
- Total shared-remapping coverage: **36 games**.

## Numeric game-event regression

`python tests/v25_events.py`

- Echofall Caverns emits numeric `atlas-complete` scoring.
- Rune Depths 2.0 emits numeric `depths-mastered` scoring and `relic-triad` progression.
- The carried-forward + current validation set covers **54 scored releases**.

## Deep authored-content validation

`python tests/v25_deep.py`

- All **six Echofall Caverns maps** are exactly 15×15, contain one player start, three resonators, and one exit, and have a valid traversable P→1→2→3→E sequence.
- Rune Depths 2.0 defines **5 depths**, **3 relic families**, and **3 enemy archetypes**, plus persistent Relic Triad mastery.

## Score-direction regression

`node tests/v25_direction.js`

- Lower-is-better semantics remain correct for Lantern Line, Driftglass Links, Riftwake Regatta, Pulsevine Parkour, Kiteglass Drift, and Echofall Caverns.
- Higher-is-better semantics remain intact.

## Defects found and fixed before release

- The fifth Echofall chamber initially isolated resonator 3 from the playable connected component. The map was redesigned and deep-path validation rerun successfully.
- Initial sonar reveal could briefly calculate a negative canvas ripple radius; reveal lifetime is now clamped before rendering.

## Production-origin limitation

- Fresh deployment enumeration for established Vercel project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` returned **403 Forbidden**.
- Local HTTP, Chromium, runtime, static, remapping, score-event, and authored-content checks are not represented as production-origin tests.

## GitHub continuity

- GitHub `main` began this release at verified v21 commit `30af009479282d3f450ab8d3fce67f6343453aa9`.
- The complete verified v24 conversation artifact supplied the v25 baseline.
- The v25 package remains authoritative until post-gate GitHub synchronization can complete without leaving a partial release tree.

## Library persistence

- The v25 source and records archives are produced only after the full release gate and ZIP integrity checks.
- Library upload status is finalized after packaging; do not infer persistence from local file creation alone.
