# WorldWideGames Validation Report

Date: 2026-10-01
Release: **v28** — Fluxward Conclave / Circuit Rush 2.0

## Release objective

v28 adds one original strategy release and substantially deepens an older racer rather than simply increasing catalog count. The gate validates both new work directly, re-runs the all-game boot/runtime suite, retains v27 defect regressions, checks remapping/events/score semantics, and verifies every registered local-origin page/asset.

The evidence below is local/self-contained browser and HTTP verification unless explicitly marked otherwise. It does not claim exhaustive mastery of every path, browser/OS combination, or physical gamepad/touch device.

## Fluxward Conclave direct validation

`python3 tests/v28_game.py`

Passed checks for:

- Pointer territory expansion on the live 7x7 board.
- Pulse conversion of a weaker adjacent rival cell after charge setup.
- Shared remapping with a non-default custom key map.
- Local Multiplayer mode and explicit turn handoff.
- Campaign completion/win/triple-crown standardized events under controlled end-state conditions.
- 390 px mobile viewport with no horizontal document overflow.

A desktop and narrow mobile render were also visually reviewed during production for board readability, HUD fit, control hierarchy, and branding.

## Circuit Rush 2.0 direct validation

`python3 tests/v28_circuit.py`

Passed checks for:

- Eight ordered checkpoint gates and three active AI rivals.
- Live throttle/steering input and changing race state.
- Pause/resume behavior.
- Boost-gate velocity effect.
- Deterministic traversal through all checkpoints for three complete laps.
- `race-complete` and `race-won` standardized event emission.

## Full-catalog Chromium audit

`python3 tests/v28_catalog_audit.py`

- **66/66 registered games** loaded independently in Chromium with isolated state.
- **0 page/runtime errors** in the completed catalog pass.
- Generic keyboard/pointer activity produced observable state change in **63** titles.
- The three generic-input no-change cases were Atlas Below, Lumen Relay, and Forgeflow; all are geometry/mechanic-specific titles with direct interaction regressions retained from the v27 gate.

## Runtime smoke harness

`node tests/smoke.js`

- All **66 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python3 tests/v28_static.py`

- 66 unique game IDs and **106 distinct genre tags**.
- Exactly one featured release: **Fluxward Conclave**.
- Every game has score metadata, documented controls, substantive description, local page, cover asset, and service-worker registration.
- `wwg-v28` cache is registered.
- PWA shortcut points to Fluxward Conclave.
- **39 games** declare shared remapping.
- Circuit Rush is registered as version **2.0** with the v28 update date.
- Achievement total is **87**.
- Public-facing scan covered **140 files** and found no prohibited internal branding/tool references.

## HTTP origin delivery

`python3 tests/v28_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **139/139 paths returned HTTP 200.**

## Shared input remapping

`python3 tests/v28_remap.py`

- The complete existing 38-game custom I/J/K/L/F/H regression remains green.
- Fluxward Conclave passes the same custom remapping contract.
- Total verified shared-remap coverage: **39 games**.

## Game-event and score regressions

`python3 tests/v28_events.py`

- Fluxward campaign score/milestone events and Circuit Rush race events pass schema checks.
- Carried-forward/current numeric scored-release coverage is **56 releases**.

`python3 tests/v26_events.py`

- The existing 55-release scored-event suite remains green.

`node tests/v26_direction.js`

- Lower-is-better semantics remain correct for all six current low-score titles.
- Higher-is-better behavior remains intact for the general platform.

## Prior defect regression

`python3 tests/v27_fixes.py`

All six v27 fixes remain green: Glyphsmith finite inventory, Echo Bazaar forward rumor timing, Signal Choir transition lock, Pulse Archive display/emitted-score parity, Lumen Relay replay reset, and Hushwave cumulative telemetry. Direct interactions for Lumen Relay, Hushwave Operator, Crownline Tactics, Atlas Below, and Forgeflow also pass.

## Production-origin limitation

- The release gate above is local/self-contained Chromium, local HTTP, runtime harness, static/source checks, and targeted visual review.
- The established production target remains `https://worldwidegames.vercel.app` on Vercel project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`.
- A production deployment/live-origin pass must be recorded separately when connector authorization permits deployment inspection or update.

## GitHub continuity

- GitHub `main` began the v28 work session at verified v27 commit `1c6650e83eee4d441cd900fe1b93ae013e1db8f8`.
- v28 is eligible for fast-forward synchronization only after the complete release gate remains green and HEAD is rechecked for unrelated newer user work.
