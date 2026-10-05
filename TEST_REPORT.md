# WorldWideGames Test Report — v63

Date: 2026-10-05
Owner/operator: Architect Industries
Candidate: **v63 — Command Bloom 1.1: Six-Map Integrity**
Status: **PASS — release gate independently verified.**

The v63 archives were verified against their SHA-256 record and the release-critical suite was rerun from the exact source package.

- `node tests/v63_static.js` — PASS
- `python3 tests/v63_command_bloom.py` — PASS
- `node tests/smoke.js` — PASS, 82/82 game boots
- `python3 tests/v60_full_catalog_fast.py` — PASS, 82/82 interaction audits with zero runtime/page/missing-reference/mobile-overflow/invalid-visible-state failures
- `python3 tests/v59_platform_gate.py` — PASS, 82/82 rendered detail/objective/control pages and 54/54 remappable profiles
- `python3 tests/v32_http.py` — PASS, 172/172 local paths HTTP 200

Command Bloom regression evidence confirms all six maps are solvable, stage-6-first no longer completes the campaign, six unique clears are required, cleared stages lock, exactly one completion event fires, Escape resets the completed campaign, and the 390×844 layout remains usable.

Two BrokenPipe traces from the temporary Python HTTP server occurred after completed client requests closed their connections; the HTTP gate itself succeeded and every asserted path returned 200.
