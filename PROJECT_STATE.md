# WorldWideGames Project State

Last updated: 2026-10-05
Owner/operator: Architect Industries
Current verified release candidate: **v62 — Emberfield Survival 2.0: Pyre Crown**
Catalog: **82 games / 129 genre tags / 152 achievements / 54 remappable releases**
Handoff status: **READY FOR RELEASE TASK**

## v62 objective

v62 is a bounded quality-and-depth release that upgrades **Emberfield Survival 1.0 → 2.0** into a three-phase survival campaign while preserving the full-catalog reliability baseline from v60 and the Orbit Breaker 2.0 regression line from v61.

## Emberfield Survival 2.0

- Three connected phases: **Ash Verge**, **Cinderstorm**, and **Pyre Crown**.
- Drifters, armored Brutes, ranged Wraiths, enemy projectiles, healing salvage, and escalating spawn pressure.
- Six level-up build choices: damage, fire rate, orbit flames, max-health recovery, magnet range, and Ember Core tuning.
- A **0–100 Ember Core** charged through combat. At 100%, Secondary/E/gamepad-B/touch Nova triggers **Nova Burst**, clearing nearby projectiles and heavily damaging threats and bosses.
- Two Cinder Warden checkpoints and a final **850-HP Pyre Regent** encounter. Boss health persists across real animation frames.
- Persistent v2 records at `wwg:emberfield-survival:progress:v2` for best score, clears, highest level, and Nova uses.
- Remappable keyboard controls, gamepad support, touch controls, pause/restart, synthesized audio honoring WorldWideGames preferences, telemetry, and responsive mobile layout.
- Two new platform achievements: **Pyre Crown** and **Nova Born**.

## Verification

**PASS — verified Build & QA release candidate.**

- `node tests/v62_static.js` — PASS: 82 games, 129 genre tags, 152 unique achievements, 54 remappable releases, Emberfield 2.0 metadata/code/PWA wiring, v62 cache and cache-busters.
- `python3 tests/v62_emberfield.py` — PASS: persistence, all upgrade families, Nova gating/effects/telemetry, multi-frame boss-health durability, phase progression, Pyre Regent completion, remapped Secondary, restart safety, and 390px mobile touch layout.
- `node tests/smoke.js` — PASS: **82/82** registered game scripts plus platform shells boot.
- `python3 tests/v60_full_catalog_fast.py` — PASS: **82/82 interaction-level Chromium audit** after the Emberfield upgrade; zero runtime/page/console errors, missing local references, mobile overflow, or invalid visible numeric state.
- `python3 tests/v59_platform_gate.py` — PASS: **82/82** detail/objective/control pages, **54/54** remappable profiles, 82-card 390px homepage, zero page errors.
- `python3 tests/v32_http.py` — PASS: **172/172** local release paths returned HTTP 200.
- `python3 tests/v61_orbit_breaker.py`, `python3 tests/v60_verdant_boss_persistence.py`, `python3 tests/v41_astral_controls.py`, and `python3 tests/v42_reliability.py` — PASS.
- Desktop and 390px mobile Emberfield screenshots were visually inspected; no clipping or horizontal overflow was observed.

## Source continuity

Canonical GitHub repository: `ArchitectIndustries/World-Wide-Games`.

- Canonical `main` inspected at build start: **`332abd9028ad4d4fdc5ef123108aaf837944d81e` (v58)**.
- Newer verified release line inspected: **`release/v60-safe` at `8e2e2f34f6de28691ad864f12b350d6a996e217f`**.
- v62 was built from the complete verified v61 package available from the preceding Build & QA handoff, itself derived from Library v60.
- This Build & QA task intentionally does **not** update canonical `main` and does **not** deploy production.

## Release handoff

The complete tested v62 source package, matching release-record package, and SHA-256 record are the authoritative handoff artifacts. Release & Deploy should verify their integrity, reconcile the complete tree with the latest verified repository state without overwriting unrelated work, satisfy the canonical `main` gate, and only then deploy/promote the exact v62 commit to the established WorldWideGames Vercel project.
