# WorldWideGames Test Report

Date: 2026-10-02
Release candidate: **v36 — Astral Menagerie 2.0**
Owner/operator: Architect Industries

## Release gate

- PASS — `python3 tests/v36_astral.py`: 15 species; four-member party + reserve; reserve swap; mid-battle switch; Scorch/Snare/Mend/Static/Guard techniques; capture compatibility; Codex mastery event; three trainer gauntlets; three habitat field quests; three Wardens; autosave; lifetime meta; 390×844 overflow.
- PASS — `python3 tests/v36_static.py`: 72 games, 120 genre tags, 104 achievements, 46 remappable titles, Astral featured/PWA metadata, `wwg-v36` cache, 152 public files scanned for prohibited internal branding.
- PASS — `python3 tests/v32_catalog_audit.py`: 72/72 games runtime-clean in isolated Chromium. Generic representative input changed state in 68 titles; Astral Menagerie is intentionally starter-gated and has dedicated v36 coverage; Atlas Below, Lumen Relay, and Forgeflow retain direct mechanic tests.
- PASS — `node tests/smoke.js`: all 72 registered game boots plus homepage and game-detail shell.
- PASS — `python3 tests/v32_http.py`: 151/151 local HTTP paths returned 200. A post-response client-reset traceback from Python's development server did not alter the completed 151/151 result.
- PASS — `python3 tests/v32_controls_browser.py`: 72/72 detail pages expose authored controls; 46/46 remappable releases expose active/default profiles.
- PASS — `python3 tests/v32_remap.py`: custom I/J/K/L/F/H mapping works across the flagship/remappable regression set.
- PASS — `python3 tests/v32_new_games.py`: six flagship boot/mechanic regression suite, including Astral Menagerie's starter/battle/capture compatibility path.
- PASS — `python3 tests/v35_verdant.py`: Verdant Echoes 2.0 campaign regression.
- PASS — `python3 tests/v34_ironlight.py`: Ironlight Breach 2.0 campaign/mechanic regression.
- PASS — `python3 tests/v33_polyforge.py`: Polyforge Studio 2.0 certification regression.
- PASS — `python3 tests/v31_rune_depths.py`: Rune Depths mastery/save/meta regression.
- PASS — `python3 tests/v29_longform.py`: Aetherstead Colony + Mosslight Vale deep campaigns.
- PASS — `python3 tests/v28_game.py`, `tests/v28_circuit.py`, `tests/v27_fixes.py`: prior release correctness remains green.
- PASS — `node tests/v26_direction.js`: low-score and high-score semantics unchanged.

The first attempt to run every long-form browser regression in one shell exceeded the execution window after the v32 suite; remaining tests were then rerun in smaller batches and each passed.

## Visual QA

Astral Menagerie 2.0 was rendered at desktop and 390×844 mobile widths. The mobile pass exposed excess vertical separation above the canvas; the responsive canvas position was tightened to 38% and the dedicated mobile-overflow regression was rerun green.

## Production-origin status

Local/source validation is complete. Vercel deployment inspection remains blocked by connector visibility: deployment listing returns 403, project lookup exposes a connector/backend schema mismatch, and deployment fetch cannot see the established project. No duplicate project was created and this report does not claim v36 is production-deployed.
