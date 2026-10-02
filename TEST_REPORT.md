# WorldWideGames Validation Report

Date: 2026-10-02
Release: **v37 — Ashen Covenant 2.0**

## v37 focused validation

### Ashen Covenant 2.0

`python3 tests/v37_ashen.py`

- Three authored path definitions load cleanly: Charred Causeway, Cinder Cloister, and Dawnless Court.
- Hound, Pilgrim, and Ash Archer path-enemy archetypes are present; later paths retain scaled enemy HP while preserving type-specific speed/range/cooldown behavior.
- Emberblade and Ash Pike expose distinct light-attack range/damage/stamina profiles, and weapon switching works.
- Ember Shrine forging spends Ash and persists a higher weapon tier.
- All three Charred Causeway Ember Sigils bind through the real interaction path; after traversal foes are cleared, the Lord gate advances to the Bell Widow arena.
- Bell Widow falls through actual weapon attack resolution and advances the pilgrimage to Cinder Cloister.
- Death drops current Ash into a durable death mark; respawn plus deliberate leave-and-return recovers it. Three recoveries emit `recovery-mastery`.
- Second and third Lord encounters expose authored Cross and Sun patterns; all three Lord defeats emit normal events and the final kill emits `pilgrimage-complete`.
- Durable meta records clears, best score, Lord victories, recoveries, and upgrades; the v2 active save retains weapon-tier/progression data.
- 390×844 layout has no horizontal overflow.

## Release-wide gates

- `python3 tests/v37_static.py`: **72 games / 120 genre tags / 106 achievements / 46 remappable releases**, sole featured Ashen Covenant 2.0, `wwg-v37`, manifest/release-history/public-source checks green.
- `python3 tests/v32_catalog_audit.py`: **72/72 games runtime-clean** in isolated Chromium. Generic interaction observes state change in 68 titles; campaign/starter gates retain dedicated deep tests.
- `node tests/smoke.js`: **72/72 registered games** boot; platform homepage and reusable game-detail shell pass.
- `python3 tests/v32_http.py`: **151/151** local-origin pages/assets returned HTTP 200.
- `python3 tests/v32_controls_browser.py`: **72/72** detail pages expose controls and **46/46** remappable titles expose exact current/default mappings.
- `python3 tests/v32_remap.py`: custom I/J/K/L/F/H mappings pass across all six v32 flagship releases.
- `python3 tests/v32_new_games.py`: all six original flagship mechanic paths pass, including the legacy Ashen stamina and deliberate-death-recovery contract.

## Prior deep/regression gates rerun

- `python3 tests/v36_astral.py` — party/reserve, trainer/quest/Warden, Codex, autosave/meta remain green.
- `python3 tests/v35_verdant.py` — two-area quest/equipment/boss campaign remains green.
- `python3 tests/v34_ironlight.py` — three sectors, two weapons, gates/secrets/enemy classes/persistence remain green.
- `python3 tests/v33_polyforge.py` — materials, snap, transforms, history, autosave, five briefs remain green.
- `python3 tests/v31_rune_depths.py` — exact autosave/resume, all three pure mastery paths, cleanup and corrupt-save recovery remain green.
- `python3 tests/v29_longform.py` — Aetherstead three-charter campaign and Mosslight six-region/final-boss campaign remain green.
- `python3 tests/v28_game.py` and `tests/v28_circuit.py` — Fluxward mechanics/mobile and Circuit Rush checkpoints/rivals/boost/podium remain green.
- `python3 tests/v27_fixes.py` — catalog correctness regression remains green.
- `node tests/v26_direction.js` — all six lower-is-better score titles and high-score semantics remain green.

## Visual inspection

Headless Chromium screenshots at 1280×820 and 390×844 were inspected with a mocked local-storage origin after rendering the new Charred Causeway. The HUD, Ember Shrine, three sigil sites, mixed path enemies, Lord gate, stamina bar, Architect Industries branding, and control panels are legible. Mobile has no horizontal overflow; the smaller canvas remains readable without hiding the persistent HUD/control information.

## Production-origin verification

Production-origin validation remains blocked by current Vercel authorization/visibility: deployment enumeration returns 403, project lookup hits the connector argument/schema mismatch, the Vercel-authenticated fetch is denied at the deployment alias endpoint, and ordinary web fetch cannot access the origin. No live-production claims are made for v37.
