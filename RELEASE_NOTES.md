# WorldWideGames Release Notes

## v54 — Aegis Relay Salvage — 2026-10-04

- Upgraded **Aegis Verge to 1.2**, combining the current Relayfront campaign architecture with deterministic field salvage instead of choosing one divergent line over the other.
- Added four hostile roles, three relay stabilizations per operation, extraction objectives, continuous Aegis shielding, repair salvage, energy salvage, expiry behavior, and expanded combat telemetry.
- Preserved `wwg:aegis-verge:meta-v1` progression plus compatibility hooks/events used by earlier Aegis releases.
- Retained **Aetherfoil Circuit 1.0** and catalog-wide explicit semantic version metadata from the verified v53 candidate.
- Added **Relay Reclaimer** and **Aegis Wall** achievements; catalog totals are now 82 games / 128 genre tags / 138 achievements / 54 remappable releases.
- Fixed Skyvault Cartographer checkpoint chain-collision damage with a recovery collision-grace window.
- Advanced offline cache to `wwg-v54` and reordered PWA shortcuts to Aegis Verge, Aetherfoil Circuit, and Skyvault Cartographer.
- Full local/source QA is green across Aegis 1.2, Relayfront compatibility, Salvage compatibility, legacy Aegis, Aetherfoil, Skyvault, Procedural Worlds, smoke, controls, runtime audit, and 172-path HTTP coverage.

# WorldWideGames v53 - Aetherfoil Circuit

Released 2026-10-04 by Architect Industries.

WorldWideGames adds **Aetherfoil Circuit 1.0**, an original three-opponent fencing campaign with stamina-based footwork, timed parries, riposte windows, first-to-three-touch bouts, adaptive rival styles, persistent progression, touch controls, gamepad support, remappable keyboard play, synthesized audiovisual feedback, and original local artwork.

Platform integration makes Aetherfoil Circuit the featured release and first PWA shortcut, adds **Circuit Foil** and **Riposte Artist** achievements, advances the offline cache to `wwg-v53`, and normalizes 28 legacy catalog entries so all 82 games now expose explicit semantic version metadata.

Release verification: **82/82 registered games boot, 82/82 runtime-clean, 82/82 game-detail objective/control pages, 54/54 remappable profiles, and 172/172 local-origin paths pass**. Dedicated Aetherfoil QA validates parry/riposte behavior, all three bouts, persistence, telemetry, pause/restart, and 390px mobile layout. Canonical GitHub `main` remains v50 because the available main-ref and PR mutation paths are safety-blocked; no partial v53 branch was created. Vercel project reads are restored by omitting redundant team scoping, but the verified-v51 promotion write was likewise safety-blocked, so production remains v50.

---

# WorldWideGames v52 - Aegis Salvage

Prepared on 2026-10-04 by Architect Industries.

Aegis Verge 1.1 turns field recovery into a real combat system. Eligible destroyed interceptors now deterministically drop green repair salvage or violet pulse-energy salvage. Repair cores restore hull, energy cores recharge Aegis Pulse, drops expire if ignored, and collection awards score plus dedicated gameplay telemetry.

The platform adds two connected achievements - **Field Technician** for collecting repair salvage and **Pulse Siphon** for collecting pulse-energy salvage - while preserving the existing three-operation campaign, nine shield pylons, autonomous interceptor combat, Bastion Core finales, persistent progression, touch controls, gamepad support, remappable driving, and local generated audiovisuals.

Release verification is green: **81/81 registered games boot, 81/81 runtime-clean, 81/81 objective/control pages, 53/53 remappable profiles, and 170/170 local-origin paths**, with dedicated v52 salvage, v51 Aegis campaign, v50 Skyvault, and v49 Procedural Worlds regressions green. The available Chromium runtime used the Canvas2D compatibility renderer; WebGL2 remains source-validated but not GPU-runtime-validated in this environment.

The complete v52 source and release-record archives are persisted under `/WorldWideGames`. Canonical GitHub `main` remains verified v50. A byte-matched corrected v51 release commit is preserved on `release/v51-verified`, but the final non-force main promotion and PR path are still authorization-blocked; WorldWideGames therefore treats v52 as a verified release candidate rather than a fully shipped main-branch release. The established Vercel project also remains inaccessible to the connected project/deployment inspection path, so production is not claimed to be updated.
