# WorldWideGames Release Notes

## v57 — Glasswing Polo 2.0: Grand Circuit — 2026-10-04

- Glasswing Polo 2.0 adds a three-rival Grand Circuit, first-to-three 60-second rounds, and distinct defensive, pressing, and predictive opponents.
- Wingdrive turns bank play into a charge-and-spend system: touches and wall banks build energy, then Secondary/E/gamepad B/mobile activates a four-second surge.
- Local two-player keyboard routing is corrected so Player 2 owns Arrow movement while Player 1 retains WASD/remapped movement.
- Persistent circuit records, bank-goal and Wingdrive telemetry, pause, touch, dual-gamepad support, synthesized feedback, and refreshed Architect Industries artwork are included.
- Grand Circuit Crown and Bank Artist raise the platform to 144 achievements; Glasswing Polo becomes featured and offline/cache metadata advances to v57.
- QA is green across the dedicated Glasswing suite and the existing Vector, Ironlight, Aegis, Aetherfoil, Skyvault, procedural-world, catalog, control, runtime, and local HTTP regressions.

### Release gate status

Verified v57 source commit: `2ad2ef9d7eb04334afe21c4e165a02816652672f` on `release/v57-source`, 13 commits ahead and 0 behind canonical main. Vercel preview `dpl_A7ChUGpSW213V7EncQ3fDh4gVtmY` is READY on that exact source. Canonical main remains verified v55 because the required non-force ref update was not accepted; no force update was attempted. Library archive upload is also unavailable in this run because the container-to-Library bridge returned `container_session_unavailable`.

## v56 — Vector Shatter 2.0: Prism Reactor — 2026-10-04

- Upgrades **Vector Shatter to 2.0** with a chargeable Prism Reactor and deliberate Secondary/E/gamepad-B/mobile activation.
- Reactor Surge creates multiball, temporary pierce, and time dilation for six seconds.
- Sector five now exposes a moving 14-HP **Prism Core** after the lattice is cleared; destroying it is required to complete the campaign.
- Adds v1→v2 record migration with mirrored compatibility saves, reactor/core persistence, and gameplay telemetry.
- Adds **Prism Ignition** and **Core Shatter** achievements; platform total is now 142.
- Promotes Vector Shatter as featured and advances PWA shortcuts/cache/cache-busters to v56.
- Hardens the control-page regression harness for versioned catalog scripts.
- Revalidates v55 Ironlight 4.0 plus Aegis, Aetherfoil, Skyvault, shared procedural worlds, full boot, control/objective, isolated runtime, and 172-path HTTP coverage.
- Complete verified source/test commit: `a65803e9f0c96ffe63aec93a121d7c3a66941a88`.

### Release gate status

v56 is verified and staged but not fully shipped. The complete lineage is preserved on recovery branch `release/v56-staged` at `425a6d4011c668284029e2b76dc783594841c464`. The required non-force canonical `main` promotion remains blocked before acceptance, so Vercel production remains v55; no force update or duplicate Vercel project was attempted. The v56 source and records archives are persisted in `/WorldWideGames`.

