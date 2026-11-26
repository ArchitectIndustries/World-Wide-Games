# Railspire Dispatch 1.5 — original WorldWideGames game

All game logic, CSS, text, procedural trains, track rendering and controls in this package are authored for Architect Industries. This change addresses measured touch target dimensions in compact viewports (the Pause/Restart controls measured 37x28px and Help 35x22px in the v422 parent Chromium 320x240 view).

No additional code, game art, audio, models, textures, libraries, paid services or dependencies were imported for v423. Source reference inspection, not reuse:

- phoboslab/underrun, f933e29152d7fc1ca61d4b3eaa8b29551d7d7a62, source/terminal.js, blob 61e6d92b0865b1f544a47affa400293dbf1842bb: game notices/controls can be visually distinct from the playable canvas; root MIT code, audio/third-party assets NOT independently cleared.
- fazal305/raceforge, 6a8a74989115bcafb1d14ca0e8e03a27d5dc4605, src/game/engine/raceProgress.js, blob 803d860237e15df6aa2065e5d4587a6fb5e3d73f: tracking completed play state distinct from HUD; root MIT code, assets/dependencies NOT cleared.
- https://surfd.net/ (2026-11-16): first-party live site HTML exposes explicit movement, settings and record controls, but no comparison of actual browser runtime, legality of third-party maps, user activity, or hardware performance made; no software/assets copied.

General ideas -> original implementation -> test: maintain the already working deterministic dispatch and terminal eligibility while reserving touch-safe 44 CSS px action targets and accessible labels. No third-party source/adoption license obligations were added. Original sibling game executables including Cyber Wars are untouched.
