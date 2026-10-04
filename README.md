# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built as a self-contained, progressively expanding catalog of original games that launch directly in modern browsers.

## Current release

**v54 — Aegis Relay Salvage**  
Catalog: **82 games / 128 genre tags / 138 achievements / 54 remappable releases**

Aegis Verge 1.2 is the current featured game. Its three-operation hover-combat campaign combines relay assaults, four hostile roles, continuous shielding, deterministic repair/energy salvage, extraction objectives, persistent progression, touch/gamepad play, and local generated audiovisuals. Aetherfoil Circuit remains available as a three-rival fencing campaign with stamina footwork, timed parries, and ripostes.

## Platform capabilities

- Data-driven game catalog, search, tags, collections, featured/recent/popular discovery, favorites, achievements, saves, release history, and update badges.
- Keyboard, touch, gamepad, fullscreen, and saved control-remap support where appropriate.
- Installable PWA/offline caching for core platform/game assets.
- Local-first/self-contained runtime assets for the current flagship games; no paid runtime API is required for gameplay.
- Shared procedural 3D runtime with WebGL2-first rendering and Canvas2D compatibility fallback.
- Architect Industries public branding and original game identities/assets.

## Run locally

Serve the project root over HTTP, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Verification

Run the current release checks from the project root:

```sh
node tests/v54_static.js
python3 tests/v54_aegis_relay_salvage.py
python3 tests/v52_aegis_relayfront.py
python3 tests/v52_aegis_salvage.py
python3 tests/v53_aetherfoil.py
python3 tests/v50_skyvault.py
node tests/smoke.js
python3 tests/v41_controls_browser.py
python3 tests/v41_catalog_audit.py
python3 tests/v32_http.py
```

See `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md`, `CATALOG_AUDIT.md`, and `THIRD_PARTY_NOTICES.md` for release state and verification details.

Copyright © Architect Industries. All original WorldWideGames game identities, platform code, and first-party assets are provided as part of this project subject to the repository license/notice terms.
