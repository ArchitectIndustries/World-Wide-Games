# WorldWideGames Release Notes

## v56 — Vector Shatter 2.0: Prism Reactor — 2026-10-04

- Upgrades **Vector Shatter to 2.0** with a chargeable Prism Reactor and deliberate Secondary/E/gamepad-B/mobile activation.
- Reactor Surge creates multiball, temporary pierce, and time dilation for six seconds.
- Sector five now exposes a moving 14-HP **Prism Core** after the lattice is cleared; destroying it is required to complete the campaign.
- Adds v1→v2 record migration with mirrored compatibility saves, reactor/core persistence, and gameplay telemetry.
- Adds **Prism Ignition** and **Core Shatter** achievements; platform total is now 142.
- Promotes Vector Shatter as featured and advances PWA shortcuts/cache/cache-busters to v56.
- Hardens the control-page regression harness for versioned catalog scripts.
- Revalidates v55 Ironlight 4.0 plus Aegis, Aetherfoil, Skyvault, shared procedural worlds, full boot, control/objective, isolated runtime, and 172-path HTTP coverage.
- Complete verified source/test commit: `590f94afd5921e21f5fc2d234185d7ed03a10162`.

### Release gate status

v56 is verified and staged but not fully shipped. The connector accepted immutable commit creation while blocking the ref update before GitHub accepted it. Canonical `main` and Vercel production therefore remain v55; no force update or duplicate Vercel project was attempted.

