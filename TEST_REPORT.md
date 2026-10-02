# WorldWideGames Validation Report

Date: 2026-10-02
Release: **v35 — Verdant Echoes 2.0**

## v35 focused validation

### Verdant Echoes 2.0

`python3 tests/v35_verdant.py`

- Legacy sword/dash/bomb behavior remains functional, including destructible cracked stone.
- Rootkeeper Mira quest state starts through real interaction and persists through the campaign save.
- Two Echo Relics legitimately unlock the Rootvault portal.
- Rootvault validates ranged Wisp projectile creation and Barkguard maximum-health progression.
- All three Moon Seeds are collected through the authored state path; the sanctum opens only after the third seed.
- Hollow Stag is defeated through the boss damage path, grants the Rootsigil, and emits `rootvault-cleared`.
- Returning to Mira after all three seeds forges Moonsteel and emits `moonsteel-forged`.
- The active autosave contains area, player, relic, seed, quest, equipment, boss, and score state and is reloadable.
- The remaining Grove relics plus Rootsigil unlock the Thorn Regent finale.
- Moonsteel directly validates double sword damage versus Reedblade.
- Campaign completion updates durable clear/best-score meta and emits the standardized `campaign-complete` event.
- 390×844 layout passes without horizontal overflow.

## Release-wide gates

- `python3 tests/v35_static.py`: **72 games / 120 genre tags / 102 achievements / 46 remappable releases**, sole featured Verdant Echoes 2.0, `wwg-v35`, manifest/release-history/public-source checks green.
- `python3 tests/v32_catalog_audit.py`: **72/72 games runtime-clean** in isolated Chromium; generic interaction changed state in 69 titles and geometry-specific outliers retain direct tests.
- `node tests/smoke.js`: **72/72 registered games** boot; platform homepage and reusable game-detail shell pass.
- `python3 tests/v32_http.py`: **151/151** local-origin pages/assets returned HTTP 200.
- `python3 tests/v32_controls_browser.py`: **72/72** detail pages expose controls and **46/46** remappable titles expose exact current/default mappings.
- `python3 tests/v32_remap.py`: custom I/J/K/L/F/H mappings pass across all six v32 flagship releases.
- `python3 tests/v32_new_games.py`: all six flagship mechanic paths pass. Its inherited Ironlight ammo assertion was updated to support the v34 rifle/scattergun ammo object instead of assuming a single numeric ammo scalar.

## Prior deep/regression gates rerun

- `python3 tests/v34_ironlight.py` — three expanded sectors, two weapons, keycard gates, secrets, pickups, Guard/Brute/Drone roster, retry semantics, persistence/events, and mobile layout remain green.
- `python3 tests/v33_polyforge.py` — five materials, three snap levels, transform history, autosave, all five briefs, mastery meta/event, and mobile layout remain green.
- `python3 tests/v31_rune_depths.py` — exact autosave/resume and all three pure five-depth mastery paths remain green.
- `python3 tests/v29_longform.py` — Aetherstead three-charter campaign and Mosslight six-region/finale path remain green.
- `python3 tests/v28_game.py` / `tests/v28_circuit.py` — Fluxward and Circuit Rush direct mechanics remain green.
- `python3 tests/v27_fixes.py` — all six v27 correctness fixes and direct interaction checks remain green.
- `node tests/v26_direction.js` — lower-is-better and higher-is-better score semantics remain correct.

## Execution note

One combined regression command exceeded its outer command timeout after the v28 Circuit Rush test had already passed; the remaining v27 correctness and v26 score-direction suites were rerun separately and both passed. No test failure remains open from that timeout.

## Verification boundary

The evidence above is local/self-contained Chromium, static/source, and local HTTP validation. It is not represented as production-origin verification. Fresh Vercel connector checks and a direct web-origin fetch remain unable to inspect the established production project, so v35 is not claimed deployed live.
