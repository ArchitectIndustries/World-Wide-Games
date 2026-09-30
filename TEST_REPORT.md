# WorldWideGames Validation Report

Date: 2026-09-30
Release: **v21** — 59-game catalog, Kiteglass Drift + Runelight Locksmith, In progress/Uncleared discovery, Air & Altitude collection, 26-game remapping coverage, and 69 achievements

## Runtime smoke harness

`node tests/smoke.js`

- All **59 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python tests/v21_static.py`

- 59 unique game IDs and **94 distinct genre tags**.
- Exactly one featured game: Kiteglass Drift.
- Every game has score metadata, page, cover, and service-worker registration.
- `wwg-v21` cache and PWA shortcut point at the v21 release.
- **26 games** declare shared remapping.
- Air & Altitude, In progress, Uncleared, profile catalog percentages, and both v21 achievements are registered.
- Achievement total: **69**.
- Public-facing scan covered **126 files** and found no prohibited internal branding.

## HTTP origin delivery

`python tests/v21_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **127/127 paths returned HTTP 200.**

## Chromium interaction / responsive validation

`python tests/v21_quick.py`

- 59 catalog cards and 69 achievements render.
- Air & Altitude includes Kiteglass Drift and established altitude/flight content.
- In progress correctly isolates a played-but-not-cleared title in seeded local profile state.
- Profile exposes catalog explored/cleared metrics.
- 390×844 viewport has no horizontal overflow.
- Custom remapping moves Kiteglass Drift and Runelight Locksmith as intended.
- Both new releases emit numeric completion scores under focused full-completion harnesses.
- No Chromium page errors were observed in the validated paths.

## Authored-content validation

`python tests/v21_deep.py`

- Every one of the **seven Kiteglass Drift gates** is cleanly reachable at its authored centerline with no forced penalty.
- Runelight Locksmith defines **six locks**; pin count, speed arrays, and target windows are internally consistent.
- Every Runelight target window remains inside the legal track bounds.
- Final-lock tolerance is stricter than the opening lock, confirming intended difficulty escalation.

## Shared input remapping

`python tests/v21_remap.py`

- Custom I/J/K/L/F/H mapping passes across **26 supported games**.
- v21 adds direct mapping coverage for Kiteglass Drift, Runelight Locksmith, Starweaver Drift 1.1, and Windward Cargo 1.1.

## Numeric game-event regression

`python tests/v21_events.py`

- Kiteglass Drift emits numeric `course-complete` scoring.
- Runelight Locksmith emits numeric `vault-opened` scoring.
- v20 already verified **47 unchanged scored-event paths**. With the two new v21 paths, the carried-forward + current validation set covers **49 scored releases**.

## Score-direction regression

`node tests/v21_direction.js`

- Lower-is-better semantics remain correct for Lantern Line, Driftglass Links, Riftwake Regatta, Pulsevine Parkour, and new Kiteglass Drift.
- Higher-is-better semantics remain intact.

## Production-origin limitation

- The public Vercel origin could not be inspected through the available web fetch path in this run.
- Deployment enumeration for established project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` again returned **403 Forbidden**.
- Local HTTP, Chromium, runtime, static, and authored-content checks are not represented as production-origin tests.

## GitHub source synchronization

Verified v21 source is synchronized on `release-v21`, based directly on the complete v20 release branch. The branch is intended for atomic promotion to `main`; if promotion is connector-blocked, `release-v21` remains the durable verified source until a safe merge becomes available.
