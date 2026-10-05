# WorldWideGames Release Notes


## v59 — Neon Serpent 3.0: Crown Coil — 2026-10-05

- Upgraded **Neon Serpent** into a five-contract campaign: Classic Coil, Drone Run, Relay Rush, Gridfall, and Crown Coil.
- Added deterministic seeded layouts, escalating hunter drones, paired relay gates, combo scoring, advanced-contract gold sparks, and Crown hazards.
- Added **Phase Drive**, v2→v3 save migration, synthesized audio, remapped keyboard/touch/gamepad support, telemetry, pause/restart, and mobile support.
- Hardened spawn allocation so food, gold, drones, relay endpoints, hazards, and the starting snake cannot overlap initially; Classic Coil excludes the later-contract gold bonus.
- Added **Crown Coil** and **Phase Architect**, raising the platform to **148 achievements**.
- Advanced PWA/cache integration to v59.
- Release QA passed: 82/82 game boots, 82/82 isolated runtime loads, 82/82 rendered objective/control pages, 54/54 remappable profiles, and 172/172 HTTP paths.


## v58 — Quiet Protocol 2.0: Ghostline — 2026-10-05

- Rebuilds **Quiet Protocol** into a three-mission stealth-action campaign across Glass Intake, Archive Lattice, and Crown Node.
- Adds wall-occluded patrol/camera vision, investigation behavior, shared alert/lockdown pressure, noisy sprinting, rechargeable cloak energy, and limited pulse jammers.
- Relay objectives now use hold-to-hack interactions; completed facilities unlock persistent campaign progression and clean-extraction/campaign telemetry.
- Adds touch controls, gamepad support, pause/restart, remapped keyboard movement, synthesized audio, refreshed Architect Industries cover art, and offline/PWA cache metadata for v58.
- Adds **Ghostline Complete** and **Clean Signal**, raising the platform to **146 achievements**.
- Preserves and revalidates v57 Glasswing Polo 2.0 Grand Circuit, including Wingdrive, three rival styles, local-control isolation, persistence, and its dedicated QA.
- Catalog totals: **82 games / 129 genre tags / 146 achievements / 54 remappable releases**.
- QA is green: **82/82** boots, **82/82** objective/control pages, **54/54** remappable profiles, **82/82** isolated runtime checks, and **172/172** local HTTP paths.

### Release gate status

Verified v58 source commit: `8da5e0e42356a5fd5f941ac35d3508ecfa2e2d75`, based on verified v57 release-record commit `252f29b5226c09142617434a06274fa8270a1536`. Canonical main was still verified v55 at release-gate start; v58 is not fully shipped until the required non-force main promotion succeeds. The Library container upload bridge returned `container_session_unavailable` during staging.

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

