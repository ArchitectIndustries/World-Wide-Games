# WorldWideGames Project State

Last updated: 2026-10-02
Owner/operator: Architect Industries
Current verified source release: **v36 — Astral Menagerie 2.0**
Catalog: **72 games / 120 genre tags / 104 achievements / 46 remappable releases**

## v36 production work

Astral Menagerie has been expanded from its original compact three-Warden loop into a deeper creature-collection campaign while preserving backwards-compatible battle/capture behavior.

- Roster expanded from 10 to **15 original Astral species** across Grove Reach, Tidelume Basin, and Emberfall Ridge.
- Captures fill a **four-creature field party** first and then persistent reserve slots.
- Added explicit **mid-battle switching** and reserve-to-party swaps outside battle.
- Added five elemental techniques with cooldown/status behavior: **Scorch, Snare, Mend, Static, Guard**.
- Added named two-Astral trainer gauntlets: Scout Lyra, Tidekeeper Orrin, Ridge Guide Sera.
- Each habitat now requires **two wild field wins + trainer defeat** before its Warden unlocks.
- Added active expedition autosave, legacy v1 save migration, lifetime clear/best/trainer/Codex meta, party wipe recovery, standardized progression events, updated touch UI, and mobile layout refinement.
- Platform integration: Astral Menagerie is featured/PWA shortcut; release history advances to v36; achievements increase from 102 to **104** with Trainer Constellation and Living Atlas; service-worker cache advances to `wwg-v36`.

## Verification

Executed release gate:
- PASS: `tests/v36_astral.py`
- PASS: `tests/v36_static.py`
- PASS: 72/72 isolated-Chromium runtime-clean catalog
- PASS: 72/72 game boots plus homepage/detail shell
- PASS: 151/151 local HTTP paths
- PASS: 72/72 authored control pages; 46/46 remappable profiles
- PASS: shared remapping regression
- PASS: six flagship compatibility regression
- PASS: Verdant Echoes 2.0, Ironlight Breach 2.0, Polyforge Studio 2.0, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions
- PASS: 390×844 Astral mobile overflow after responsive refinement

The first attempt to run every long-form browser regression in one shell exceeded the execution window after the v32 suite; remaining tests were rerun in smaller batches and each passed.

## GitHub release gate

Canonical repository: `ArchitectIndustries/World-Wide-Games`
Default branch: `main`
Prior verified main: v35 commit `118cdf67b6d4d1163939fe1ea2fb46ac7f1c3246`
v36 source release commit: **`9c5b055c77021d5258a2fba226581f299139a9eb`**

The v36 source tree was built from verified v35 main on an isolated staging branch and contains the complete v36 delta before main promotion. The final release commit adds this state record on top of the source release commit. Main must only be fast-forwarded after confirming it has not changed concurrently.

## Library continuity

The verified v36 source/package is derived from durable v35 Library state. The run should persist `WorldWideGames_v36.zip` and `WorldWideGames_v36_records.zip` to `/WorldWideGames`. Loose top-level Library markdown files may lag packaged release records and should not supersede a newer versioned archive.

## Vercel production

Established production project:
- Project: `worldwidegames`
- Project ID: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`
- Team: `team_wwOmTAdrfPwvTGNSLU1VarOy`
- Domain: `https://worldwidegames.vercel.app`

Current connector status remains blocked: deployment listing returns 403 Forbidden; project lookup exposes a connector/backend argument mismatch; authenticated Vercel fetch cannot access the deployment. This is treated as authorization/visibility failure, not evidence the project is absent. No duplicate project was created and v36 is not claimed as deployed until production-origin verification succeeds.

## Next priorities

1. Restore Vercel project/team authorization, deploy the newest verified GitHub release to the existing project, and perform production-origin smoke tests.
2. Continue flagship-depth work; prioritize another underdeveloped campaign/system title rather than increasing catalog count for its own sake.
3. Keep GitHub synchronization as a mandatory same-run release gate for every subsequent version.
