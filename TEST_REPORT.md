# WorldWideGames Test Report — v72

Date: 2026-10-06
Owner/operator: Architect Industries
Candidate: **v72 — Harbor Pulse 1.1: Full Shift**
Status: **PASS — READY FOR RELEASE TASK**

## Targeted regression

`python tests/v72_harbor_pulse.py` — PASS. Real Chromium evidence covers the historical failure path (reputation 0 before the timer), legitimate 90-second survival, explicit `shift-failed` / `shift-cleared` outcomes, score and `wwg:harbor-best` isolation, restart, real pointer routing to a matching berth, 390×844 mobile layout, and platform clear/milestone semantics. Failed and neutral telemetry cannot clear Harbor Pulse or earn Daily Circuit milestone credit; `shift-cleared` can.

## Bounded platform regression

- `python tests/v72_platform_gate.py` — PASS: 82/82 detail/objective pages, 54/54 remappable profiles, 82/82 mobile homepage cards, zero tested page errors.
- `python tests/v72_full_catalog_fast.py` — PASS: 82/82 catalog games; no detected runtime/unhandled-rejection failures, missing local references, narrow-layout overflow, or invalid visible numeric state in the exercised states.
- `python tests/v72_http.py` — PASS: 178/178 local-origin paths returned HTTP 200. The local test server logged isolated client-close connection resets only after asserted responses completed; asserted path results remained 178/178.
- `python tests/v71_vector_league.py`, `v68_riftwake.py`, `v67_solar_loom.py`, `v66_pulse_archive.py`, `v65_parallax.py`, `v64_hexbound.py`, `v63_command_bloom.py`, and `v60_verdant_boss_persistence.py` — PASS.

## Static/release validation

`node tests/v72_static.js` is the candidate static gate and verifies catalog totals, Harbor Pulse 1.1 metadata/objective/score semantics, 126 milestone events, 79 completion events, clear-only Harbor classification, v72 state/release records, cache/query metadata, manifest shortcut, and service-worker asset existence.

## Evidence boundary

Browser checks use local Chromium harnesses; HTTP coverage uses a local server. No production deployment or live-production claim is part of this Build & QA task.

## Packaging / persistence

The initial verified v72 source, records, and checksum artifacts were uploaded successfully to `/WorldWideGames`. After the persistence result was added to the records, the archives were rebuilt and rechecked; two overwrite attempts for this final record-refresh build failed with transient `container_session_unavailable`. The durable Library copy therefore has the same runtime/gameplay/test payload but older persistence-status text and earlier archive hashes. The exact final handoff archives in this run remain the authoritative Build & QA package.