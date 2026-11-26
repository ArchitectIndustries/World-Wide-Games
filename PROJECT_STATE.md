# WorldWideGames — v498 source release

**Status: VALIDATED_RELEASE_SOURCE**

Prepared November 26, 2026 (UTC) for Architect Industries.

| Project record | Value |
| --- | --- |
| Canonical repository | ArchitectIndustries/World-Wide-Games |
| Production target | https://worldwidegames.vercel.app/ |
| Existing Vercel project | prj_CgW1xTHIZOOe1R4RNzcByfvxantq |

## Release scope

v498 builds on published v497 commit `53a569bf4b8493e666298d4c702e427e2e14260d`. All 91 prior game IDs are retained. Solstice Wilds brings the catalog to **92 games and 136 genre tags**.

| Game | Version | Delivered change |
| --- | --- | --- |
| Solstice Wilds | 1.0 | New coastal exploration/action expedition: Archive puzzle, workshop salvage, bridge repair, Spire combat and lighthouse return; checkpointed practice restore/retry |
| Aegis Verge | 3.0 | Three authored industrial environments, state-driven machinery and lighting, richer enemy geometry, F3D96 Signal Forge and a compact combat HUD/guide |
| Cyber Wars | 0.65 | Richer Viridia architecture, vegetation, atmosphere and inhabitants; compact HUD and paused Field Guide; existing progression and save authority preserved |

The shared scene foundation uses pinned Three.js r187 and self-hosted materials. Aegis and Cyber Wars extend their existing engine locally. Both adapters initialize the cube VAO’s instance backing storage before optional shader compilation, including shader-rejection fallback. This resolves an inherited noninstanced-driver failure while preserving the shared engine’s allocation rules.

Cyber Wars follows the creator’s Core design bible, library collection and project notice, together with the consolidated game bible. This release develops Viridia and preserves existing canon, mission/economy rules, the rank-10 independent Pilot boundary and owned-home checkpoints.

## Completed validation

The final release suite passed 5/5 test cases, the combined 3D runner 47/47 entries, Arcade Nights 51/51 cases, profile storage 198/198 checks, specialist integration 40/40 checks and Lattice menu coverage 26/26 checks. All 90 prior flagship unit programs pass. The worker contract passed 113/113 checks and cache-fingerprint experiments passed 7/7. These units are kept separate in [TEST_REPORT.md](TEST_REPORT.md).

The built application contains 343 public files. Its 325 precache URLs cover all 92 games. The official-resource pipeline passed 9/9 tests. A separate clean run downloaded all seven approved provider resources with zero reused outputs, transferred 10,216,073 bytes and produced eight exact runtime files totaling 7,554,421 bytes.

Desktop Chrome review used software 3D rendering in a 978×550 game frame. Aegis showed its compact combat HUD, paused guide and working driving/firing; firing reduced hostiles from three to two. Cyber Wars showed compact vitals/objective, a scrolling guide with clean return focus, camera switching, movement-distance updates and the existing Pause menu. In Solstice, the corrected camera and coastal water kept the explorer and ground clear; the player walked to the Archive, read Leaf → Sun → Tide, attuned all three runes and earned the saved Archive checkpoint. Reloading and choosing Continue restored stage 2 as CHECKPOINT PRACTICE. Journal and pause controls also worked.

These observations qualify the recorded desktop interactions. Full campaigns, hardware WebGL/frame rate, physical controllers, mobile devices and other browser engines were not certified by this review.

## Durable source and published resources

The repository retains first-party application/game code, tests, build tools, licenses and provenance. `tools/asset-sources.json` pins six official Poly Haven image URLs and the official Three.js r187 npm archive. `tools/fetch-public-assets.mjs` verifies byte counts and SHA-256 hashes before preparing the runtime files. Three’s two modules are original upstream files; no esbuild dependency is needed.

Verified local resources can be reused. A clean build requires the official providers; failed status, timeout, size or hash checks stop preparation. The successful clean-provider run and controlled failure/recovery tests are recorded in TEST_REPORT.md. The published artifact includes the verified modules and images locally, so gameplay makes no runtime CDN or npm request.

The worker name includes a 12-hex content fingerprint under `wwg-v498-`. The build hashes public paths and content with a normalized worker namespace, then writes that cache name and the exact inventory. Repeated unchanged builds retain the same fingerprint; a runtime edit changes it; reverting the edit restores the original cache and public hashes. The generated `release.json` records the build’s actual Git commit, cache and public file hashes.

## Preserved recovery

v497 integrated cumulative v496 source, the six Arcade Nights additions, Mosaic B1, profile B2, Aegis F3D95 and Cyber Wars 0.64, then retained the concurrent Stormwake Rescue/Iron Meridian and Lattice/Vanta fixes. v498 preserves that result. The 424-revision index, complete historical release notes and losslessly compressed research library remain intact.

## Production identity

This document records a validated source release. After publication, the release coordinator verifies [the production receipt](https://worldwidegames.vercel.app/release.json) and executable hashes at the established domain. That runtime receipt is authoritative for the deployed commit and cache namespace. The source record does not hard-code a future commit or assert that the deployment has already changed. Optional multiplayer relays remain source components and are not activated by this static release.
