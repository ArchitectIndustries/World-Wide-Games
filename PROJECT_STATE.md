# WorldWideGames Project State

Last updated: 2026-10-02
Owner/operator: Architect Industries
Current verified source release: **v37**
Status: **72-game** static browser-gaming platform with **120 genre tags**, **106 achievements**, **46 remappable releases**, persistent local player data, PWA/offline support, full-catalog Chromium QA, and deep regression coverage for established campaign titles.

## v37 production work — Ashen Covenant 2.0

Ashen Covenant advances from 1.0 to **2.0** as a substantially deeper stamina-action RPG pilgrimage:

- Three authored traversal paths — Charred Causeway, Cinder Cloister, and Dawnless Court — now precede the existing Covenant Lords.
- Every path requires binding three **Ember Sigils** and clearing its path foes before the Lord gate can open.
- Enemy roster expands beyond bosses to **Hounds, Pilgrims, and ranged Ash Archers** with distinct durability/range/pressure behavior.
- Added two weapon identities: fast **Emberblade** and long-reach **Ash Pike**, each with separate light/heavy stamina, range, and damage profiles.
- Ember Shrines restore the player and spend Ash on persistent three-tier weapon forging or additional maximum Vigor.
- The three Lords now use distinct **Bell, Cross, and Sun** attack patterns, including projectile pressure in later encounters.
- Active pilgrimage state persists locally: stage, phase, Ash, weapon choice, weapon tiers, maximum Vigor, bound sigils, and defeated path foes.
- Death marks continue the original deliberate leave-and-return recovery identity while preserving path/checkpoint progression.
- Durable meta tracks pilgrimage clears, best score, Lords defeated, recoveries, and upgrades.
- Added standardized foe, sigil, forge, recovery, gate, Lord, and pilgrimage events.
- Added **Covenant Pilgrim** and **Ash Reclaimer** achievements for **106 total**.
- Ashen Covenant becomes the sole featured release, joins Long Campaigns, and becomes the PWA shortcut; offline cache advances to `wwg-v37`.

## Validation

- `python3 tests/v37_ashen.py`: three paths, all three enemy archetypes, Blade/Pike profile differences, weapon forging, three Ember Sigils, traversal-to-Lord gate, all three Lord patterns, death-mark leave/return recovery, recovery mastery, full pilgrimage completion, active save/meta persistence, and 390×844 no-overflow validation pass.
- `python3 tests/v37_static.py`: 72 games, 120 genres, 106 achievements, 46 remappable games, Ashen Covenant 2.0 metadata, sole featured release, `wwg-v37`, manifest/history/public-source checks pass.
- `python3 tests/v32_catalog_audit.py`: **72/72 games runtime-clean** in isolated Chromium; generic interaction observes state change in 68 titles, with campaign-gated titles covered by dedicated tests.
- `node tests/smoke.js`: **72/72 registered games** boot; platform homepage/detail shell pass.
- `python3 tests/v32_http.py`: **151/151** local-origin pages/assets HTTP 200.
- `python3 tests/v32_controls_browser.py`: **72/72** detail pages expose controls; **46/46** remappable titles expose explicit current/default keyboard profiles.
- `python3 tests/v32_remap.py` and `python3 tests/v32_new_games.py`: shared remapping and the original v32 flagship contracts remain green, including Ashen stamina/death-recovery compatibility.
- v36 Astral Menagerie, v35 Verdant Echoes, v34 Ironlight, v33 Polyforge, v31 Rune Depths, v29 Aetherstead/Mosslight, v28 Fluxward/Circuit, v27 correctness, and v26 score-direction regressions remain green.
- Headless Chromium desktop/mobile visual inspection confirmed coherent Ashen path HUD/canvas/control layout with no horizontal overflow.

## GitHub continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- GitHub `main` was inspected at the start of this run at verified v36 release-state commit `b8a1b15ad43139942b325b469eaaf6ddb2246da7`.
- Repository permissions report push/admin access.
- v37 GitHub synchronization is a mandatory release gate and must atomically fast-forward `main` only after the complete verified tree is staged and the current head is re-checked.
- Final v37 commit SHA is recorded after that release-gate operation completes.

## Production deployment

- Canonical Vercel project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`; intended team `team_wwOmTAdrfPwvTGNSLU1VarOy`; domain `https://worldwidegames.vercel.app`.
- Fresh connector checks still return **403 Forbidden** for deployment enumeration and Vercel-authenticated fetch. Project lookup still hits the connector/backend schema mismatch (`idOrName` expected). Ordinary web access to the production origin is also unavailable from the current web environment.
- These remain authorization/visibility limitations, not evidence the project is absent. No duplicate Vercel project is created and no production deployment is claimed.

## Next high-value priorities

1. Grow **Polyforge Studio** with grouping/multi-select, scene-code import/export, transform gizmos, and advanced briefs.
2. Add further **Ironlight Breach** sectors, weapon archetypes, authored secret routes, and enemy projectile behavior while retaining deterministic reachability checks.
3. Add post-Atlas Astral mastery challenges, trainer rematches, more habitat interactions, and richer creature techniques without invalidating v2 saves.
4. Deep-validate **Emberdeck Pilgrim** route mastery and **Ashfall Caravan** contract/end-state variants through legitimate state transitions.
5. Verify and deploy the newest release to the established Vercel project when project-scoped authorization becomes available.
