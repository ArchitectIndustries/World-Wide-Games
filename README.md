# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built as a self-contained, progressively expanding catalog of original games that launch directly in modern browsers.

## Current release

**v55 — Ironlight Breach 4.0**
Catalog: **82 games / 128 genre tags / 140 achievements / 54 remappable releases**

Ironlight Breach 4.0 is the current featured release. Its five-sector retro corridor-FPS campaign now includes elite Wardens, a shielded final Overseer, boss spread-fire, core-gated armor, combat-chain scoring, persistent streak/boss records, pause support, gamepad play, touch/keyboard/mouse controls, checkpoint retries, secret/cipher routes, three weapons, and synthesized local audio.

## Platform capabilities

- Data-driven catalog, search, tags, collections, featured/recent/popular discovery, favorites, achievements, saves, release history, and update badges.
- Keyboard, touch, gamepad, fullscreen, and saved control-remap support where appropriate.
- Installable PWA/offline caching for core platform/game assets.
- Local-first/self-contained runtime assets for current flagship games; no paid runtime API is required for gameplay.
- Shared procedural 3D runtime with WebGL2-first rendering and Canvas2D compatibility fallback.
- Architect Industries public branding and original game identities/assets.

## Run locally

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Current verification

```sh
node tests/v55_static.js
python3 tests/v55_ironlight.py
python3 tests/v39_ironlight.py
python3 tests/v54_aegis_relay_salvage.py
python3 tests/v53_aetherfoil.py
python3 tests/v50_skyvault.py
python3 tests/v49_procedural_worlds.py
node tests/smoke.js
python3 tests/v41_catalog_audit.py
python3 tests/v32_http.py
```

See `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md`, `CATALOG_AUDIT.md`, `LONGFORM_AUDIT.md`, and `THIRD_PARTY_NOTICES.md` for current release state and verification details.

Copyright © Architect Industries.
