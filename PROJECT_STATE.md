# WorldWideGames Project State

Last updated: 2026-10-02
Owner/operator: Architect Industries
Current verified source release: **v35**
Status: **72-game** static browser-gaming platform with **120 genre tags**, **102 achievements**, **46 remappable releases**, persistent local player data, PWA/offline support, full-catalog Chromium QA, and deep regression coverage for established campaign titles.

## v35 production work — Verdant Echoes 2.0

Verdant Echoes advances from 1.0 to **2.0** as a substantially deeper two-area action-adventure campaign:

- Added the connected **Rootvault** dungeon beyond Echo Grove, unlocked after two Echo Relics.
- Added **Rootkeeper Mira**, a quest chain around three Moon Seeds, Rootvault exploration, and equipment forging.
- Added permanent equipment progression: the **Moonsteel** blade doubles sword damage and the **Barkguard Charm** raises maximum health from 5 to 7.
- Enemy roster now includes Briars, tougher Crawlers, and ranged Wisps with projectile pressure.
- Added the **Hollow Stag** Rootvault boss and Rootsigil prerequisite before the existing Thorn Regent finale.
- Bombs retain cracked-wall utility and now also damage enemies and bosses.
- Added active-campaign autosave/resume plus durable best score, campaign clears, Rootvault clears, and quest-completion meta.
- Death now respawns inside the current campaign area while preserving progression instead of discarding the run.
- Added standardized quest, seed, Rootvault, forging, equipment, relic, and campaign events.
- Verdant Echoes becomes the sole featured release and PWA shortcut; the offline cache advances to `wwg-v35`.
- Added two achievements: **Rootvault Warden** and **Moonsteel Oath**.

## Validation

- `python3 tests/v35_verdant.py`: two-area traversal, Mira quest, 2-relic Rootvault gate, ranged Wisp projectiles, Barkguard health increase, all three Moon Seeds, sanctum opening, Hollow Stag defeat/Rootsigil, Moonsteel forging, autosave contents, remaining relics, Thorn Regent availability, double Moonsteel damage, campaign completion/meta, legacy bomb/dash behavior, and 390×844 layout all pass.
- `python3 tests/v35_static.py`: 72 games, 120 genres, 102 achievements, 46 remappable games, Verdant Echoes 2.0 metadata, sole featured release, `wwg-v35`, manifest/history/public-source checks.
- `python3 tests/v32_catalog_audit.py`: **72/72 games runtime-clean** in isolated Chromium.
- `node tests/smoke.js`: **72/72 registered games** boot; platform homepage/detail shell pass.
- `python3 tests/v32_http.py`: **151/151** local-origin pages/assets HTTP 200.
- `python3 tests/v32_controls_browser.py`: **72/72** detail pages expose controls; **46/46** remappable titles expose explicit current/default keyboard profiles.
- `python3 tests/v32_remap.py`: custom I/J/K/L/F/H mappings pass across the six v32 flagship releases.
- `python3 tests/v32_new_games.py`: all six flagship mechanic paths remain green after hardening its Ironlight ammunition assertion for the v34 two-weapon ammo object.
- v34 Ironlight, v33 Polyforge, v31 Rune Depths, v29 Aetherstead/Mosslight, v28 Fluxward/Circuit, v27 correctness, and v26 score-direction regressions remain green.

## GitHub continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- GitHub `main` was re-inspected at the start of this session and remained at verified v31 commit `68059dd5ac9a9bf10c7e6acc4cb9e663d32e69c8`; no newer concurrent user commit was found.
- The existing `automation/v34-sync` branch was verified identical to `main` before v35 synchronization, so it is safe as an isolated staging branch.
- v35 is synchronized only after the release gate is green. The complete staged source is verified before `main` is advanced; no force update is permitted.
- GitHub staging branch `automation/v34-sync` is intentionally **not merged** because the complete release could not be transferred through the current connector in this session. It is eight commits ahead of `main` and contains only a verified subset: `README.md`, the Ashen/Astral/Ironlight/Verdant covers, `js/games.js`, the discovery-collection portion of `js/app.js`, and the manifest shortcut. The connector intermittently rejected later write calls before the full 36-file v31→v35 delta could be staged.
- `main` therefore remains safely at verified v31 commit `68059dd5ac9a9bf10c7e6acc4cb9e663d32e69c8`; no knowingly partial release was merged. Future runs should continue or rebuild the isolated staging sync from the complete v35 package, verify the branch against the package, and only then fast-forward `main`.

## Production deployment

- Canonical Vercel project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`.
- Intended Architect Industries team: `team_wwOmTAdrfPwvTGNSLU1VarOy`.
- Production domain: `https://worldwidegames.vercel.app`.
- Fresh connector checks still return **403 Forbidden** for deployment enumeration; project lookup still exposes the connector/schema mismatch, and the Vercel fetch path still cannot see the project through the current authorization.
- A direct web-origin check on 2026-10-02 also could not access the production URL from the available web fetch environment.
- These are treated as authorization/visibility limitations, not evidence the project is absent. No duplicate Vercel project is created and v35 is not claimed live until production-origin verification succeeds.

## Persistence and recovery

- `/WorldWideGames/WorldWideGames_v35.zip` and `/WorldWideGames/WorldWideGames_v35_records.zip` were successfully uploaded after the verified artifacts were exported into the active file-service session, so v35 is now the newest durable packaged release in the Library.
- The older top-level mutable Library copies of `PROJECT_STATE.md`, `TEST_REPORT.md`, and companion docs could not be canonically replaced in this run because that shared-file replacement call was blocked by the connector safety gate; future runs should prefer the v35 package/records over those stale loose copies until they are refreshed.
- GitHub remains the desired durable complete-source mirror. The partial isolated staging branch is deliberately not treated as authoritative until all v35 files are present and reverified.

## Next high-value priorities

1. Extend **Astral Menagerie** with party switching, status effects, more species, trainer encounters, and habitat quests.
2. Expand **Ashen Covenant** beyond boss arenas with traversal areas, weapon/build choices, more enemy archetypes, and deeper death-recovery progression.
3. Grow **Polyforge Studio** with grouping/multi-select, scene-code import/export, transform gizmos, and advanced briefs.
4. Add further **Ironlight Breach** sectors, weapon archetypes, authored secret routes, and enemy projectile behavior while retaining deterministic reachability checks.
5. Add additional Verdant Echoes NPC arcs, optional Rootvault rooms, equipment choices, and post-campaign mastery without invalidating v2 saves.
6. Verify and deploy the newest release to the established Vercel project when project-scoped write access is available.
