# WorldWideGames v40 Test Report

Date: 2026-10-02
Owner/operator: Architect Industries
Release: **v40 — Astral Menagerie 3.0**
Overall source QA: **PASS**
GitHub release gate: **BLOCKED — default branch remains v36 due connector safety rejection**
Production deployment verification: **BLOCKED — Vercel project deployment read remains 403**

## Focused v40 validation

- `tests/v40_astral.py` — PASS
  - 15-species architecture retained.
  - Three habitat study nodes and all three distinct rewards validated.
  - Habitat Scholar event validated.
  - Original three trainer gauntlets / three Warden Atlas progression validated.
  - Three post-Atlas Constellation trainer rematches validated.
  - Rematch gating of three Ascendant Wardens validated.
  - Persistent Starlight total after one full study/rematch/Ascendant mastery path: 18.
  - `mastery-triad`, `ascendant-warden`, and `constellation-master` events validated.
  - v2 expedition/meta records migrate into v3 keys without losing campaign progression.
  - v3 autosave/meta persistence validated.
  - 390×844 layout has no horizontal overflow and no page errors.

- `tests/v40_static.py` — PASS
  - 72 unique games.
  - 120 genre tags.
  - 113 unique achievements.
  - 46 remappable games.
  - Astral Menagerie is sole featured release, version 3.0.
  - `wwg-v40` service-worker cache.
  - First PWA shortcut targets Astral Menagerie.
  - Cover, release history, public-branding, and registered asset paths validated.

## Full-catalog / platform gates

- `tests/v32_catalog_audit.py` — PASS: **72/72 runtime-clean** in isolated Chromium; 68 generic interaction state changes observed, with gated titles covered by dedicated suites.
- `tests/smoke.js` — PASS: **72/72 games boot**, homepage boots, reusable detail page boots.
- `tests/v32_http.py` — PASS: **151/151** local-origin pages/assets return HTTP 200.
- `tests/v32_controls_browser.py` — PASS: **72/72** game detail pages expose authored controls; **46/46** remappable releases expose explicit current/default mappings.
- `tests/v32_remap.py` — PASS: shared keyboard remapping and current expansion compatibility.

## Carried-forward deep regressions

- `tests/v36_astral.py` — PASS: party/reserve, switching, five elemental techniques, capture, trainers, quests, Wardens, persistence, mobile layout.
- `tests/v39_ironlight.py` — PASS: five sectors, rifle/scattergun/Arc Lance, cipher routes/vaults, sentry projectiles, checkpoint retry.
- `tests/v38_polyforge.py` — PASS: grouping, pointer gizmo drag, scene-code roundtrip, seven briefs, 80-step history, legacy mastery, mobile layout.
- `tests/v37_ashen.py` — PASS: three traversal paths, enemy classes, weapon identities, sigils, forging, death recovery, Lord patterns, persistence.
- `tests/v35_verdant.py` — PASS: Rootvault quest/equipment/boss campaign and autosave.
- `tests/v31_rune_depths.py` — PASS: pure-path mastery, autosave/resume, death/completion semantics, corrupt-save recovery.
- `tests/v27_fixes.py` — PASS: six historical correctness fixes plus direct state-change checks.
- `tests/v26_direction.js` — PASS: six lower-is-better score-direction titles and high-score semantics.
- `tests/v28_circuit.py` / `tests/v28_game.py` — PASS: Circuit Rush and Fluxward campaign/input regressions.
- `tests/v30_pulsevine.py` — PASS: five-course platformer movement/reachability.

## Notes

The large regression batch reached the runner timeout after the catalog-runtime, boot, HTTP, and browser-controls tests had already completed successfully. The remaining targeted tests above were then executed separately. `tests/v31_static.py` still asserts the historical 66-game v31 catalog and therefore fails by design against the current 72-game catalog; `tests/v40_static.py` is the current static release gate.

The Vercel checks are not production gameplay tests: deployment enumeration returns 403, project lookup still hits a connector schema/backend mismatch, authenticated deployment fetch cannot access protection-bypass metadata, and the ordinary web origin is inaccessible from the available web environment. No production success claim is made.
