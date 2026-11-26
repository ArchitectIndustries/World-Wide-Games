# v498 release verification

Date: November 26, 2026 (UTC)

Status: **VALIDATED_RELEASE_SOURCE**

The checks below were completed for the v498 source with the final original Three.js modules. Automated tests, modeled drivers and actual Chrome observations are recorded separately. Production receipt verification follows publication.

## Release and compatibility checks

| Check | Result | Scope |
| --- | ---: | --- |
| `npm run test:release` | 5/5 test cases | All 92 registrations, executable/cover presence, release hashes, public-only output, cache inventory and executable syntax |
| `npm run test:3d` | 47/47 runner entries | Node test cases and script-level programs; the focused assertions below are embedded evidence, not extra runner entries |
| `npm run test:arcade` | 51/51 test cases | Six Arcade Nights games and their model/input/result contracts |
| Profile storage | 198/198 checks | Persisted profile validation, corruption handling and storage behavior |
| Specialist integration | 40/40 checks | Existing runtimes under modeled DOM/canvas, saves, launch/reset, private state and river cargo physics |
| Lattice menu | 26/26 checks | Visibility, launch/resume/pause controls and interaction guards |
| Prior flagship unit programs | 90/90 programs | Fresh sweep passed 89; the affected F3D80 program passed 16/16 after its cache-name predicate accepted the fingerprint suffix with behavior assertions retained |
| Worker contract | 113/113 checks | 325 precache URLs covering all 92 combined catalog registrations, exact shell queries, atomic install failure, owned-cache cleanup and offline/public fetch boundaries |
| Asset preparation | 9/9 test cases | Clean preparation, verified reuse, corruption recovery, rejected sources/archives/responses, timeout and publication exclusion |
| Cache fingerprint experiments | 7/7 checks | Unchanged builds are stable; a runtime edit creates a new cache key; reverting restores the original cache and all public hashes |
| Official-resource identities | 8/8 outputs | Exact sizes and SHA-256 hashes match the pinned manifest; 7,554,421 runtime bytes |
| Published-baseline catalog retention | 91/91 existing IDs | Evaluated v497 and current registries; Solstice Wilds is the sole added ID |

The build contains **343 public files**. Counts above retain their actual units; cases, assertions, grouped checks, compared states and executable programs are not summed into a synthetic total.

## Focused game checks

| Check | Result | Scope |
| --- | ---: | --- |
| Solstice deterministic model | 20/20 test cases | Seeded movement/action route, rune ordering, collision, salvage, bridge prerequisites, attacks, checkpoints, practice restores and fresh completion |
| Solstice input handlers | 9/9 test cases | Actual handlers with modeled DOM: keyboard/gamepad edges, held-input rearming, shortcuts, multi-pointer release, focus and pause |
| Solstice world/camera geometry | 4/4 test cases | Actual Three geometry and shared software renderer; camera clearance, visible-triangle budget and ocean triangles outside the inland traversal surface |
| Aegis world | 65/65 checks | Mesh geometry/budgets, driving/camera exclusion, state-driven scenery, shader fallback, VAO/lighting state, disposal and modeled launch/render/movement/pause |
| Aegis F3D96 Signal Forge | 295/295 assertions | Restored uplink presentation and the existing 30-energy, six-second, single-use contract |
| Aegis instance storage | 14/14 checks | Actual shared Engine with modeled driver: inherited backing-storage failure, local repair, shader rejection, normal draws and instanced reallocation |
| Aegis compact HUD/guide | 38/38 checks | Actual modeled handlers, critical HUD structure, retained briefing/status IDs, guide pause/focus/Escape/Resume and frozen clock |
| Cyber Wars visual/state isolation | 1,295/1,295 assertions | Mesh topology, clipping, transforms, original solid bounds, deterministic scenery, weather/reduced motion, GL state/disposal and modeled render purity |
| Cyber Wars instance storage | 14/14 checks | Actual shared Engine with modeled driver, local repair, custom/base draws, shader rejection, instanced reallocation and disposal |
| Cyber Wars compact HUD/Field Guide | 14/14 grouped checks | Unique retained status IDs, two core cards, paused guide, focus/held-input boundaries, touch expansion, context brief and controller isolation |
| Cyber Wars published-baseline comparison | 8/8 progression states | Full exposed gameplay snapshots and collision maps match v497/CW 0.64; owned-home checkpoint keys and serialized bytes match exactly |

The Solstice suites total 33 test cases. Its model route completes the expedition through actual movement/actions, without setting progression flags or injecting resources. This deterministic completion is separate from the partial route exercised in Chrome.

## Actual browser observations

Cloud Chrome used the software 3D fallback in a **978×550 game frame**. The release coordinator observed the following interactions in the final reviewed build.

**Aegis Verge:** the world remained visible behind a slim Hull/Aegis/hostile display and short objective. The guide opened and paused the game; Resume closed it. Driving and firing worked, with hostiles decreasing from three to two. P opened pause, and changing the camera in Settings changed the view.

**Cyber Wars:** only core vitals and the compact objective persisted over the world. The Field Guide scrolled, closed and returned focus. C switched camera views, movement changed the objective distance, and Pause opened the existing menu.

**Solstice Wilds:** the corrected spawn camera and coastal ocean geometry left the explorer and inland ground clearly visible. The player walked to the Archive, read the Leaf → Sun → Tide clue, physically attuned all three pillars and received “Archive restored,” “checkpoint saved” and the next workshop objective. Reloading and selecting Continue restored stage 2 with CHECKPOINT PRACTICE. Journal opening/closing and P pause also worked.

This review did not certify complete browser-played campaigns, hardware WebGL, hardware frame rate, physical controllers, mobile devices, screen readers or other browser engines. Modeled DOM/canvas, driver contracts and triangle budgets are separate evidence from the actual browser observations.

## Asset preparation and clean build

`tools/fetch-public-assets.mjs` reads the exact approved URLs, sizes and SHA-256 hashes in `tools/asset-sources.json`. Six Poly Haven images and the official Three.js r187 npm archive produce eight same-origin runtime resources. Three’s `three.core.js` and `three.module.js` are original upstream modules; no minifier or esbuild dependency is used.

The nine preparation tests cover clean fixture reconstruction, verified-cache reuse, corrupt-cache recovery with prior output preserved, bad/missing responses and length/hash failures, invalid/duplicate/traversing source declarations, strict tar rejection, bounded timeout, output symlinks and exclusion of build inputs from the published app.

A separate real clean run began with no generated resource files. It fetched **all seven official sources**, reused **zero outputs**, and downloaded **10,216,073 bytes**. It produced all eight exact files totaling **7,554,421 bytes** in **9.28 seconds**. That duration describes this single observed run, not a build-time guarantee. All eight current outputs were independently rehashed against the manifest.

Clean builds require official-provider availability. Retrieval or integrity failures stop preparation. Already verified files can be reused, and the published game serves its own local copies without runtime provider requests.

## Cache and publication boundary

The cache namespace is `wwg-v498-<12 lowercase hexadecimal characters>`. The 113 worker checks executed the real worker under a strict CacheStorage model, including missing-resource atomic-install failure, current shell query keys, owned-cache cleanup and public fetch boundaries. The seven fingerprint checks established unchanged-build stability, a new key after a runtime edit and complete restoration after reverting it.

The generated `release.json` identifies the actual built Git commit, cache namespace, game versions and public SHA-256 hashes. A working-tree receipt is local build evidence. After publication, verify the established production domain’s receipt and executable bytes against the committed source. This is the only outstanding publication verification; the local release checks and scoped desktop review above are complete.

## Reproduce the automated suites

```sh
npm run build
npm run test:release
npm run test:3d
npm run test:arcade
npm run test:assets
node tests/recovery_b2_profile_storage.cjs
node tests/recovery-specialist/integration.cjs
node tests/recovery-specialist/lattice-menu.cjs
node tests/v481_precache_contract.js dist
```

The Cyber Wars historical comparison needs published commit `53a569bf4b8493e666298d4c702e427e2e14260d`. A source-only checkout may set `CW_BASELINE_HTML` to its verified original executable.
