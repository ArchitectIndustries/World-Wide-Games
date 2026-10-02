# WorldWideGames Project State

Last updated: 2026-10-02
Owner/operator: Architect Industries
Current verified source release: **v40 — Astral Menagerie 3.0**
Release-gate status: **source QA green; GitHub `main` promotion blocked by the current connector safety path**
Status: **72-game** static browser-gaming platform with **120 genre tags**, **113 unique achievements**, **46 remappable releases**, persistent local player data, PWA/offline support, full-catalog Chromium QA, and deep campaign regressions.

## v40 production work — Astral Menagerie 3.0

Astral Menagerie advances from its v36 three-habitat Atlas into a replayable post-campaign mastery RPG while preserving the original party, reserve, capture, type, trainer, and Warden systems:

- Added one visible **field-study node per habitat**: Canopy Well, Lumen Pool, and Cinder Lens. Each can be attuned once per expedition and grants a distinct reward: party restoration/capsules, technique refresh/XP insight, or permanent +2 maximum HP for the current party.
- Completing all three studies emits durable **Habitat Scholar** mastery and contributes to Atlas score.
- Completing the first Atlas now unlocks **Atlas Mastery Trials** rather than ending replay depth.
- Added three **Constellation trainer rematches**. Each is a three-opponent gauntlet using the habitat trainer team plus its Warden, at higher levels than the original campaign.
- Clearing a trainer rematch unlocks that habitat's **Ascendant Warden** trial.
- Trainer rematches award 2 persistent Starlight; Ascendant Wardens award 3. Lifetime Starlight contributes to the score and persists independently of an expedition reset.
- Clearing all trainer rematches emits `mastery-triad`; clearing all three Ascendant Wardens emits `constellation-master` and records permanent mastery.
- Added v3 save/meta keys with compatible migration from v2 expedition/meta records, including nested defaults for new attunement/rematch/Ascendant structures.
- Added E habitat-study and T Atlas-Trials keyboard paths, panel controls, visible study markers, Starlight HUD, and mastery-aware battle presentation.
- Added three platform achievements: **Habitat Scholar**, **Constellation Challenger**, and **Ascendant Atlas**.
- Astral Menagerie becomes the sole featured release and first PWA shortcut; offline cache advances to `wwg-v40`.
- Long Campaigns now explicitly includes Astral Menagerie.

## Validation

Focused and release-wide checks executed on the final v40 runtime source:

- `python3 tests/v40_astral.py`: v2→v3 migration, three authored study nodes/rewards, original trainer/Warden Atlas loop, three trainer rematches, three Ascendant Wardens, Starlight totals/persistence, mastery events, autosave, and 390×844 no-overflow validation pass.
- `python3 tests/v40_static.py`: **72 games / 120 genres / 113 unique achievements / 46 remappable games**, sole featured Astral Menagerie 3.0, `wwg-v40`, release history, PWA shortcut, cover, public-branding and asset-path checks pass.
- `python3 tests/v36_astral.py`: original fifteen-species party/reserve, switching, five techniques/statuses, capture, trainer gauntlets, quests, Wardens, autosave/meta, and mobile layout remain green on v3.
- `python3 tests/v39_ironlight.py`: five-sector Ironlight campaign, three weapons, sentry projectiles, ciphers/vaults, and checkpoint semantics remain green.
- `python3 tests/v38_polyforge.py`: grouped assemblies, gizmo drag, scene code, seven briefs, 80-step history, legacy mastery, and mobile layout remain green.
- `python3 tests/v37_ashen.py`: three Ashen paths, enemies, weapons, sigils, forging, death recovery, three Lord patterns, persistence, and mobile layout remain green.
- `python3 tests/v35_verdant.py`: two-area Verdant quest/equipment/boss campaign remains green.
- `python3 tests/v31_rune_depths.py`: Rune Depths pure-path mastery and persistence remains green.
- `python3 tests/v32_catalog_audit.py`: **72/72 games runtime-clean** in isolated Chromium; representative interaction observes state change in 68 titles, with Astral and other gated titles covered by dedicated tests.
- `node tests/smoke.js`: **72/72 registered games boot**, plus homepage and reusable detail shell.
- `python3 tests/v32_http.py`: **151/151** local-origin pages/assets returned HTTP 200.
- `python3 tests/v32_controls_browser.py`: **72/72** detail pages expose controls; **46/46** remappable releases expose explicit current/default keyboard profiles.
- `python3 tests/v32_remap.py`: custom remap and six-new-game remap compatibility pass.
- `python3 tests/v27_fixes.py`, `node tests/v26_direction.js`, `python3 tests/v28_circuit.py`, `python3 tests/v28_game.py`, and `python3 tests/v30_pulsevine.py`: carried-forward correctness, score-direction, racing/strategy, and platformer regressions pass.
- The comprehensive batch reached the execution timeout only after the catalog/boot/HTTP/control gates had already printed green results; remaining targeted regressions were then run separately. A legacy `v31_static.py` count assertion is obsolete against the 72-game catalog and is not a current release gate.

## GitHub continuity

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- GitHub `main` was re-inspected before work and remains coherent at verified v36 release-state commit **`b8a1b15ad43139942b325b469eaaf6ddb2246da7`**.
- `automation/v37-release` remains one commit ahead / zero behind `main` with the complete verified v37 delta. `automation/v38-release` and the pre-existing `automation/v40-release` currently mirror that same v37 delta; `automation/v40-sync` is identical to `main`.
- Before creating v40, the run attempted the mandatory catch-up path: a non-force fast-forward of `main` to the verified v37 commit and a fallback pull request. Both authorized mutations were blocked by the current connector safety layer before any write completed.
- The complete v36→v40 file delta has been prepared for atomic Git-tree staging. If non-default branch Git-object writes are accepted later in this run, the staged commit/branch will be recorded below; default-branch promotion must still pass an immediate `main` re-read and non-force update.
- No partial default-branch update has been made. v40 must **not** be described as fully shipped to GitHub `main` until that release gate completes.

## Production deployment

- Canonical Vercel project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`; intended team: `team_wwOmTAdrfPwvTGNSLU1VarOy`; domain: `https://worldwidegames.vercel.app`.
- Fresh 2026-10-02 deployment enumeration returns **403 Forbidden** for the exact project/team pair.
- Project lookup still encounters the connector/backend argument mismatch, and authenticated Vercel fetch reports that the connected account cannot access the deployment's protection-bypass metadata.
- Direct web-origin access also reports the production URL inaccessible from the current web environment. This is treated as an authorization/visibility limitation, not evidence the project is absent.
- No duplicate Vercel project is created and no v40 production deployment is claimed.

## Next high-value priorities

1. **GitHub release catch-up first:** promote the newest complete verified source to `main` as soon as the connector safety/write path permits it.
2. Add optional post-pilgrimage mastery contracts/rematches to **Ashen Covenant** without invalidating v2 saves.
3. Add optional mastery rematches and grove challenge contracts to **Verdant Echoes** while preserving its v2 campaign migration.
4. Deep-validate **Emberdeck Pilgrim** route mastery and **Ashfall Caravan** contract/end-state variants through legitimate state transitions.
5. Deploy the newest GitHub-verified release to the established Vercel project when project-scoped authorization becomes available.
