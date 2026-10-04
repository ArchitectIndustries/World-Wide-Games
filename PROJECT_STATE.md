# WorldWideGames Project State

Last updated: 2026-10-04
Owner/operator: Architect Industries
Current verified release candidate: **v54 — Aegis Relay Salvage**
Release status: **verified and staged; canonical GitHub main promotion is blocked, so v54 is not fully shipped**
Catalog: **82 games / 128 genre tags / 138 achievements / 54 remappable releases**

## v54 — Aegis Relay Salvage

WorldWideGames v54 reconciles the two verified Aegis Verge 1.1 development lines instead of discarding either one. The production/GitHub Relayfront line contributed relay assaults, four enemy roles, continuous shielding, extraction objectives, and v1 save continuity; the Library Salvage line contributed deterministic repair/energy drops and pickup telemetry. Aegis Verge 1.2 now combines both into one three-operation campaign.

### Aegis Verge 1.2

- Three operations with three stabilized relays per operation and an extraction gate.
- Four hostile roles: skirmisher, lancer, bulwark, and warden.
- Continuous Aegis shielding on Secondary/E with energy drain and shield-block telemetry.
- Deterministic field salvage: repair pickups restore hull and energy pickups recharge the Aegis system; dropped salvage expires when ignored.
- Preserves the `wwg:aegis-verge:meta-v1` save schema and legacy progression/event compatibility.
- Keyboard, touch, gamepad, saved remaps, synthesized audio, procedural 3D geometry, and Canvas2D fallback remain local/self-contained.

### Additional shipped work

- Preserves **Aetherfoil Circuit 1.0**, the three-rival fencing campaign introduced in the verified v53 candidate, including stamina footwork, timed parries, ripostes, touch/gamepad support, persistence, and telemetry.
- Keeps explicit semantic version metadata across all 82 catalog entries.
- Adds achievements **Relay Reclaimer** and **Aegis Wall**.
- Fixes a Skyvault Cartographer recovery defect where a checkpoint respawn could immediately trigger a second collision; recovery now has a short collision grace window.
- Offline cache advances to `wwg-v54`; PWA shortcuts prioritize Aegis Verge, Aetherfoil Circuit, then Skyvault Cartographer.

## Verification

The verified source package passed:

- `node tests/v54_static.js` — 82 games, 128 genres, 138 achievements, 54 remappable releases, v54 cache/metadata/branding invariants.
- `python3 tests/v54_aegis_relay_salvage.py` — relay campaign, four hostile roles, continuous shield, repair/energy salvage, save migration, telemetry, persistence, and 390px mobile layout.
- `python3 tests/v52_aegis_relayfront.py` — production Relayfront compatibility regression.
- `python3 tests/v52_aegis_salvage.py` — salvage-line compatibility regression.
- `python3 tests/v51_aegis.py` — legacy Aegis campaign compatibility regression.
- `python3 tests/v53_aetherfoil.py` — parry/riposte loop, three-bout campaign, persistence, telemetry, pause/restart, and mobile layout.
- `python3 tests/v50_skyvault.py` — 3 routes / 15 beacons, control fallbacks, campaign, persistence, telemetry; includes the repeated-impact regression fix.
- `python3 tests/v49_procedural_worlds.py` — Cinderline/Glasswild shared-3D regression.
- `node tests/smoke.js` — 82/82 registered games boot plus homepage/detail shell.
- `python3 tests/v41_controls_browser.py` — 82/82 objective/control pages; 54/54 remappable profiles.
- `python3 tests/v41_catalog_audit.py` — 82/82 isolated Chromium runtime-clean.
- `python3 tests/v32_http.py` — 172/172 local-origin release paths returned HTTP 200.

The current Chromium environment exposes the shared Canvas2D renderer, so browser campaign QA does not claim GPU-rendered WebGL2 validation.

## Source-of-truth reconciliation

At the start of this run, canonical GitHub `main` and Vercel production both pointed to v52 **Aegis Relayfront** commit `2543a3f2a21120c48f8edc100f9f6c1f8db82192`. The Library also contained a separately verified v52 **Aegis Salvage** package, while the conversation artifact contained verified v53 **Aetherfoil Circuit** work. v54 deliberately merges those useful verified lines rather than reverting current production or dropping v53 catalog work.

## Release gate

Canonical repository: `ArchitectIndustries/World-Wide-Games`, default branch `main`.

- Base/main observed before v54 synchronization: `2543a3f2a21120c48f8edc100f9f6c1f8db82192` (v52 Aegis Relayfront).
- v54 verified source commit: `ae69f62dbd9056f91a99f7cc5ecd8edae46e8441`.
- Verified release branch: `release/v54-aegis-relay-salvage`.
- Canonical `main` remains `2543a3f2a21120c48f8edc100f9f6c1f8db82192` because both the non-force `main` ref update and PR-creation fallback were blocked before GitHub accepted them.
- v54 therefore remains a verified staged release, not a fully shipped release. GitHub `main` catch-up is the first release-management priority on the next run.

## Vercel production target

Project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq` (`worldwidegames`) under Architect Industries, domain `https://worldwidegames.vercel.app`.

Production deployment `dpl_69am1zSFShKSRwmgf7R76shQsFD3` remains READY on canonical `main` commit `2543a3f2a21120c48f8edc100f9f6c1f8db82192` (v52 Aegis Relayfront). Vercel automatically built v54 source commit `ae69f62dbd9056f91a99f7cc5ecd8edae46e8441` as READY preview deployment `dpl_3BPVLymHbQiXpoB3jvrxcN7ZyKX1` at `worldwidegames-px3bk6h3z-architect-industries.vercel.app`. The attempted production promotion was blocked before Vercel accepted it, so production remains v52.

## Next priorities

1. Promote the verified v54 release branch to canonical `main` without force as soon as the current write-policy blocker clears; do not start v55 first when practical.
2. Promote the READY v54 Vercel preview to production after the canonical-main gate clears, then smoke-test the public origin.
3. v53 source/record archives are persisted under `/WorldWideGames`; persist v54 source/record archives when the container-to-Library bridge is available.
4. Run GPU-capable WebGL2 visual/performance QA on production-class hardware.
