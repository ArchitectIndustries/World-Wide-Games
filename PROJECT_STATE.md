# WorldWideGames Project State

Last updated: 2026-10-03
Owner/operator: Architect Industries
Current verified source candidate: **v48 — Parallax Accord**
Release-gate status: **source QA green; complete v48 source synchronized and hash-verified on `release/v48-parallax-accord`; GitHub `main` promotion remains blocked by repository write-safety authorization**
Status: **77 games / 125 genre tags / 124 achievements / 49 remappable releases**

## v48 — Parallax Accord

WorldWideGames adds **Parallax Accord 1.0**, an original turn-based card-and-board strategy campaign designed to deepen the Board & Tabletop and Strategy Desk catalog instead of repeating another action loop.

- Three rival delegations: Steward Ilyr, Artificer Vey, and Curator Senn.
- Three simultaneous districts with distinct laws: Harbor rewards the first commitment, Foundry rewards high-base-power envoys, and Archive rewards low-base-power envoys.
- Six original envoy archetypes: Anchor, Envoy, Warden, Bloom, Prism, and Architect.
- Growing round energy supports multi-card turns and six-round match planning.
- Rival AI evaluates lane deficits, district laws, opponent-specific preferences, energy cost, and card synergies.
- Campaign scoring carries between successful delegations; retry restores the delegation-start checkpoint.
- Persistent best score, campaign clears, furthest delegation, and sweep records.
- Pointer/touch play, compact keyboard shortcuts, and gamepad district/action support.
- Dual `game` + `gameId` telemetry keeps compatibility with the v46 event bridge.
- Original local HTML/CSS/SVG/runtime audio only; no paid service or external runtime asset dependency.

## Platform work

- Catalog expands to **77 games / 125 genre tags / 124 achievements / 49 remappable releases**.
- Added achievements **Accord Keeper** and **District Sweep**.
- Parallax Accord becomes the sole featured release and first PWA shortcut.
- Added Parallax Accord to **Long Campaigns** while it is automatically discoverable under **Strategy Desk** and **Board & Tabletop** from its genre metadata.
- Offline cache advances to `wwg-v48`.
- Retained the v47 canonical catalog cleanup and v46 `game`/`gameId` telemetry bridge.

## Verification

- `python3 tests/v48_parallax_accord.py`: **PASS** — three delegations, three districts, six card types, keyboard district/card play, real energy-consuming commit, adaptive AI round, retry checkpoint, full three-match campaign, sweep/campaign telemetry, persistence, and 390x844 mobile width.
- `node tests/v48_static.js`: **PASS** — 77 games, 125 genres, 124 achievements, 49 remappable releases, sole featured Parallax Accord, cache/PWA wiring, assets, release history, and public-branding checks.
- Visual browser review: **PASS** — desktop 1180x820 and mobile 390x844 screenshots inspected; interface remains readable and responsive without root overflow.
- `node tests/smoke.js`: **77/77 registered games boot** plus homepage and reusable game-detail shell.
- `python3 tests/v41_controls_browser.py`: **77/77** detail pages expose objectives/controls; **49/49** remappable releases expose the universal/current keyboard profile.
- `python3 tests/v41_catalog_audit.py`: **77/77 runtime-clean** in isolated Chromium.
- `python3 tests/v32_http.py`: **161/161** local-origin release paths return HTTP 200. Benign client-disconnect BrokenPipe logs occurred after successful responses and did not alter assertions.
- v47 Lattice Armada, v46 Rift Relay/event bridge, v45 Vector Shatter, v44 Vanta Frontline, v42 reliability, and v41 Classics regressions all remain green.

## GitHub continuity and mandatory release gate

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- Verified `main` remains **v44 release state `adf3bcf88f033885e56ff4fc7ba36e5cea8632a9`**.
- Verified v45 release-state branch `release/v45-vector-shatter-final` remains exactly two commits ahead and zero behind `main`, targeting **`3878589d1efabe308320543ed4909d585a7efb55`**.
- At the start of this run, the required non-force `main` fast-forward to verified v45 state was re-attempted after a fresh compare. That write was blocked by the connector safety layer before mutation, so `main` remained unchanged.
- The complete v48 source was then assembled as a Git tree on `release/v48-parallax-accord` from verified v45 release state `3878589d1efabe308320543ed4909d585a7efb55`, producing verified source commit **`cf38aa08c714797329a4710eb2b1aab2857818b3`**.
- Branch verification shows v48 is exactly one commit ahead and zero behind verified v45. All **26 changed/added file blob SHAs** were independently compared against the final local release tree with **0 mismatches**.
- Immediately before the final `main` promotion attempt, a fresh compare showed `main` at v44 `adf3bcf88f033885e56ff4fc7ba36e5cea8632a9` and the v48 branch exactly three commits ahead / zero behind. The non-force `main` update was blocked by the connector safety layer before mutation. A pull-request fallback was also blocked before creation.
- Because `main` synchronization is a required release gate, **v48 remains a verified release candidate, not a fully shipped release**, even though the complete verified source is now safely present on the release branch.

## Library persistence

- The previously blocked v47 source and records archives were successfully persisted to `/WorldWideGames` during this run, restoring Library continuity through v47.
- Complete v48 source and records ZIPs were built, ZIP-integrity tested, and successfully persisted to `/WorldWideGames`. v48 is now the newest verified Library package.

## Production deployment

Canonical Vercel target: project `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`, project name `worldwidegames`, Architect Industries team `team_wwOmTAdrfPwvTGNSLU1VarOy`, domain `https://worldwidegames.vercel.app`.

- Exact project lookup still returns `404 Project not found` in the current connector context.
- Deployment enumeration still returns `403 Forbidden` / insufficient permission.
- These remain connector authorization/visibility limitations, not evidence the established project is absent.
- No duplicate Vercel project was created and no v48 production deployment is claimed.

## Next priorities

1. Fast-forward `main` to verified v48 commit `cf38aa08c714797329a4710eb2b1aab2857818b3` when the repository write-safety path permits it; re-read `main` immediately before the ref update and never force.
2. Deploy that same GitHub-verified source to the established Vercel project when project-scoped authorization allows writes, then perform production-origin smoke tests.
3. Deep-play Parallax Accord with longer varied drafts to tune AI preferences, low-cost Archive strategies, Architect scaling, and comeback-card balance.
4. Continue targeted reliability audits and add mechanically distinct genres rather than low-depth clones.
