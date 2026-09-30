# WorldWideGames Validation Report

Date: 2026-09-30
Release: v20 — 57-game catalog, Mirrormesh Relay + Hushwave Operator, three-game discovery mixes, Signals & Circuits collection, 22-game remapping coverage, and 67 achievements

## Runtime smoke harness

`node tests/smoke.js`

- All **57 registered games** boot and advance under the isolated runtime harness.
- Platform homepage and reusable game-detail shell pass.
- Result: **All smoke harness checks passed.**

## Static/code checks

`python tests/v20_static.py`

- 57 unique game IDs and **90 distinct genre tags**.
- Exactly one featured game: Mirrormesh Relay.
- Every game has score metadata, page, cover, and service-worker registration.
- `wwg-v20` cache and PWA shortcut point at the v20 release.
- **22 games** declare shared remapping.
- Signals & Circuits, mix controls, and all three v20 achievements are registered.
- Achievement total: **67**.
- Public-facing scan covered **122 files** and found no prohibited internal branding.

## HTTP origin delivery

`python tests/v20_http.py`

- Fresh local HTTP server requested platform pages/assets plus every registered game page and cover.
- **123/123 paths returned HTTP 200.**

## Chromium interaction / responsive validation

`python tests/v20_quick.py`

- 57 catalog cards and 67 achievements render.
- Signals & Circuits returns both new releases.
- Skill & Timing retains Pulsevine Parkour.
- 390×844 viewport has no horizontal overflow.
- Pulsevine and Tessera prior v19 interactions remain green.
- Full authored completion paths emit numeric scores for Mirrormesh Relay and Hushwave Operator.
- Make 3-game mix populates the persistent Play Later queue.
- Share discovery control remains regression-covered.

## Shared input remapping

`python tests/v20_remap.py`

- Custom I/J/K/L/F/H mapping passes across **22 supported games**.
- New coverage verifies mapped mirror rotation in Mirrormesh Relay and mapped frequency adjustment in Hushwave Operator.

## Numeric game-event regression

`python tests/v20_events.py`

- **47 games** emit numeric completion/score events under focused completion harnesses.
- v20 adds `mirrormesh-relay:mesh-complete` and `hushwave-operator:band-decoded` coverage.

## Deep authored-content validation

`python tests/v20_deep.py`

- Independently enumerates mirror orientations and proves every one of the **six Mirrormesh relays** has at least one valid solution touching all required beacons and reaching the receiver.
- Confirms **six Hushwave targets**, all parameters within the legal 0–100 range, and the intended 86% completion threshold.

## Known test-environment limitation

- Production-origin deployment/log verification remains blocked by the connected Vercel authorization for the established project. Local HTTP, Chromium, runtime, static, and authored-content checks are not represented as production-origin tests.
