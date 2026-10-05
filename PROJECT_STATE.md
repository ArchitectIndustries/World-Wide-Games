# WorldWideGames Project State

Last updated: 2026-10-04
Owner/operator: Architect Industries
Current verified release candidate: **v55 — Ironlight Breach 4.0**
Catalog: **82 games / 128 genre tags / 140 achievements / 54 remappable releases**

## v55 — Ironlight Breach 4.0

WorldWideGames v55 substantially upgrades Ironlight Breach while preserving its established five-sector corridor-FPS campaign, three-weapon loadout, secrets, keycards, checkpoints, score loop, touch play, mouse turning, and universal keyboard fallbacks.

- Elite **Wardens** now pressure sectors three and four with pursuit, ranged fire, higher durability, and Arc Lance disruption.
- Sector five adds a shielded **Overseer** with 18 HP and three-projectile spread volleys. Damage is reduced until all three breach cores are secured, and extraction stays locked until the Overseer is defeated.
- Timed **combat-chain scoring** increases rewards for fast eliminations; an eight-enemy chain emits a milestone event.
- The v4 local record persists best streak and Overseer defeats while retaining v3/v2 migration.
- Gamepad support covers movement, turning, fire, sprint, and weapon cycling. P pauses the simulation.
- Synthesized combat feedback, Threat/Streak HUD readouts, boss visuals, and updated objective copy improve moment-to-moment clarity.
- Two achievements, **Overseer Down** and **Breach Chain**, raise the platform total to 140.

## Platform and reliability work

- Ironlight Breach is the current featured release.
- PWA shortcuts now prioritize Ironlight Breach, Aegis Verge, and Aetherfoil Circuit.
- Offline cache advances to `wwg-v55`.
- Homepage/detail bundle cache-busters advance from v52 to v55 so browsers receive current catalog/application code.
- v55 static checks enforce control/objective metadata across all 82 games.

## Verification

The verified source passed:

- `node tests/v55_static.js` — 82 games, 128 genres, 140 achievements, 54 remappable releases, control/objective metadata, feature/cache/PWA/cache-buster invariants.
- `python3 tests/v55_ironlight.py` — five-sector map, two Wardens, final Overseer, spread-volley/core-gate/combat-chain/pause/persistence source invariants.
- Pre-package browser scenario validation — Overseer armor before core completion, normal damage afterward, three-shot boss volley, eight-kill combat chain, boss-gated extraction, pause/resume, v4 persistence, and 390px layout all passed.
- `python3 tests/v39_ironlight.py` — legacy Ironlight campaign/weapon/secret/sentry/vault compatibility.
- `python3 tests/v54_aegis_relay_salvage.py` — Aegis 1.2 regression.
- `python3 tests/v53_aetherfoil.py` — Aetherfoil regression.
- `python3 tests/v50_skyvault.py` — Skyvault regression.
- `python3 tests/v49_procedural_worlds.py` — shared procedural-3D regression.
- `node tests/smoke.js` — 82/82 registered games boot plus homepage/detail shell.
- `python3 tests/v41_catalog_audit.py` — 82/82 isolated Chromium runs runtime-clean.
- `python3 tests/v32_http.py` — 172/172 local-origin release paths returned HTTP 200.

The older sequential interaction-heuristic `full_catalog_fast.py` reaches 73 titles before the available single-process execution window expires. This is recorded as a harness-duration limitation, not a game failure, because the complete boot, isolated-runtime, metadata, and HTTP suites pass.

The available Chromium environment uses the shared Canvas2D compatibility renderer for procedural-3D regression; GPU-rendered WebGL2 performance remains a production-hardware follow-up.

## Release continuity

The previous v54 release gate was recovered before v55 work began. Canonical GitHub `main` safely fast-forwarded to verified v54 commit `7a7bdd928af84323f905c5036edb1a8d9eaea944`, and Vercel built that exact head as READY production deployment `dpl_Cx3jdz24LRR5CfKuDqW2aF29C32H`.

## v55 release gate

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- Verified base: `7a7bdd928af84323f905c5036edb1a8d9eaea944`.
- v55 local/source QA: **PASS**.
- v55 release source commit: **pending immutable Git commit creation**.
- v55 `main` promotion: **pending final no-divergence check**.
- Vercel v55 production deployment: **pending GitHub release gate**.

v55 is not considered fully shipped until the verified source is committed, canonical `main` is re-read and safely advanced without divergence, and the established Vercel project is verified on the matching release line.

## Vercel target

Project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` (`worldwidegames`), domain `https://worldwidegames.vercel.app`.

