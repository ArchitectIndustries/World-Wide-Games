# WorldWideGames Test Report — v64

Date: 2026-10-05
Owner/operator: Architect Industries
Candidate: **v64 — Hexbound Tactics 1.1: True Stalemate**
Status: **PASS — release gate independently verified.**

The v64 archives were verified against their SHA-256 record and the release-critical suite was rerun from the exact persisted source package.

- `node tests/v64_static.js` — PASS
- `python3 tests/v64_hexbound.py` — PASS
- `node tests/smoke.js` — PASS, 82/82 game boots
- `python3 tests/v60_full_catalog_fast.py` — PASS, 82/82 interaction audits with zero runtime/page/missing-reference/mobile-overflow/invalid-visible-state failures
- `python3 tests/v59_platform_gate.py` — PASS, 82/82 rendered detail/objective/control pages and 54/54 remappable profiles
- `python3 tests/v32_http.py` — PASS, 172/172 local paths HTTP 200

Hexbound regression evidence confirms unequal-overkill mutual destruction resolves to STALEMATE, false local win/telemetry updates are blocked, legitimate victory/defeat and turn-limit ties remain correct, card/lane interaction works, and the 390×844 layout remains usable.

Two BrokenPipe traces from the temporary Python HTTP server occurred after completed client requests closed their connections; the HTTP gate itself succeeded and every asserted path returned 200.
