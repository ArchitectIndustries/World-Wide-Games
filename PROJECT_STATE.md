# WorldWideGames Project State

Last updated: 2026-10-05
Owner/operator: Architect Industries
Current verified release candidate: **v64 — Hexbound Tactics 1.1: True Stalemate**
Catalog: **82 games / 129 genre tags / 152 achievements / 54 remappable releases**
Release status: **RELEASE GATE VERIFIED — PENDING CANONICAL MAIN / PRODUCTION**

## Objective

Repair Hexbound Tactics' false-win path without broadening catalog scope. Simultaneous citadel destruction now resolves as a stalemate and cannot inflate local wins or win telemetry.

## Verification

The v64 source and records archives match the supplied SHA-256 record. Release-critical validation passed from the exact persisted package: `node tests/v64_static.js`, `python3 tests/v64_hexbound.py`, `node tests/smoke.js`, `python3 tests/v60_full_catalog_fast.py`, `python3 tests/v59_platform_gate.py`, and `python3 tests/v32_http.py`.

Evidence includes 82/82 boots, 82/82 interaction audits, 82/82 detail/objective/control pages, 54/54 remappable profiles, and 172/172 local HTTP paths.

## Source continuity

Canonical main at v64 release preparation: `9e12d0cea6ed9d74217c520b16c73f6d30b23bad` (v63), preserving public `DEVELOPMENT_STANDARDS.md`. The v64 release branch is based directly on that head so unrelated newer work is retained.

## Release boundary

Fully shipped status requires non-force canonical-main promotion, exact-version Vercel production promotion/deployment, production smoke verification, and durable release-state recording. The v64 Library source, records, and checksum artifacts are persisted.
