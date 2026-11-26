# v497 integrated recovery verification

Date: November 26, 2026

## Fresh non-browser checks

| Check | Outcome | Scope |
|---|---:|---|
| Release/package tests | 5/5 | 91 registrations, executable/cover paths, exact file hashes, public-only staging, query/cache inventory, earned arcade events and all JS/inline syntax |
| Arcade suite | 51/51 test entries | Six additions; includes 1,635 hockey assertions, 33 hoops assertions, 40 catalog integration checks |
| Aegis flagship unit suites | 90/90 | Recovered F3D95 modules with catalog safeguards retained |
| Specialist integration | 40/40 | Original first-party runtime under a modeled DOM/canvas: saves, launch/reset, private state, real river physics, cargo delivery/spill/retrieval |
| Lattice Armada picker regression | 26/26 | Actual launch/pause/resume/restart/focus handlers with modeled DOM/canvas; explicit hidden-menu CSS and pointer guards, no unearned score or persistence |
| Concurrent campaigns | 70/70 | Stormwake Rescue and Iron Meridian actual runtime under modeled DOM/canvas: movement/combat/rescue, stage transitions, retry, earned completion and rejection of loss completion |
| Profile B2 regression | 198/198 assertions | Malformed shapes/JSON/reserved keys, exact damaged-byte preservation, valid fractional scores, storage denial and session fallback |
| Worker public boundary | 323/323 | Final built worker, 303 exact precache URLs, no arbitrary private/API/runtime caching |
| Worker atomic precache | 105/105 | Missing-resource failure, complete install, owned-cache cleanup, exact query shell scripts and modeled offline routes |
| Runtime asset references | 174 checked, zero missing | HTML/CSS/module references, zero external runtime dependencies |

Historical v481 fault injection was adapted in memory from its obsolete v259 query to v497 for the worker qualification; no behavioral assertion was removed. One F3D80 test now accepts canonical numeric cache namespaces with an optional isolated-branch suffix.

These are explicitly not physical-hardware, screen-reader or browser-engine certifications. Model tests are labeled as such. Historical candidate counts in archived documents were not added to these fresh results.

## Fresh browser observations

The final 91-game preview was checked through every catalog card URL in the supported cloud browser. All 91 detail pages rendered their game iframe content with no first-party error logs observed during these bounded initial loads. Stormwake Rescue and Iron Meridian also passed native Launch → Pause → Resume checks. This is a launch audit, not a claim that every full campaign was played.

The initial real preview rendered 89 catalog games, all six Arcade Nights cards, the upgraded Cyber Wars 0.64/Aegis 2.95/Mosaic 1.1 cards and release v497. The six new game detail pages load their actual iframe games with objectives and controls. Aurora, Lightline and Orchard start and pause. Mosaic enters the board, moves focus with arrows, focuses Resume on pause, restores the selected tile on resume, and focuses Enter after restart. Tabletop Commons completes an actual local Noughts & Crosses win through five native board clicks. Lattice Armada launch hides the picker (measured zero width and height), Pause reopens it and Resume hides it again.

Skyline Hoops completes a shot, enables Next shot, and advances to the next ready position. An earlier timed observation did not establish completion; a fresh native interaction subsequently did. Aegis Verge deploys the rig into an active encounter using the software 3D fallback in this browser. Cyber Wars enters Viridia, removes its entry overlay, renders the world and exposes the starting 21-credit HUD and river systems. No first-party page errors were observed in these bounded checks. Browser observations do not imply uninterrupted campaigns, hardware WebGL qualification or full-device performance testing.

Recovered standalone Python browser fixtures were not run successfully: launch stopped before test execution because the local Chromium wrapper had no binary. Browser work uses the supported cloud browser instead; no passing result is claimed for those fixtures.

## Production qualification

Before the combined release, the concurrent f33d5ffd production deployment was verified directly in the browser: Lattice Armada Launch and Resume both hid its menu with a zero-width/zero-height layout box; Pause reopened it.

The publication workflow must verify the final commit in live release.json, catalog count, new executable paths, Lattice picker fix and file hashes at the established production domain. A generic game.html?id=... response is not sufficient proof that a game exists.
