# v498 dynamic 3D implementation checkpoint

Date: November 26, 2026  
Project: WorldWideGames / Architect Industries  
Production baseline: `53a569bf4b8493e666298d4c702e427e2e14260d` (v497, 91 games)  
Recovery branch: `work/dynamic-3d-v498-recovery`

## Status and purpose

The user authorized richer, more dynamic 3D games guided by the game bible, research and resource creation, and continued implementation/publication in the existing app. Three parallel implementations were completed in the development workspace. The execution environment became unavailable before final integration, browser review, source synchronization and publication.

**This branch initially preserves the recovery record only. It is not a complete v498 source release and must not be promoted to production as one.** The changed game files were not yet committed or pushed when the workspace disconnected. Do not claim they have been durably recovered until their actual contents are present and verified. Main was rechecked after disconnection and remained the production baseline above.

## Design source

The actual reference is *Cyber Wars Game Bible*, consolidated edition 1, November 26, 2026, by Stevens Cadet: a 26-page, 18-chapter production reference. The immediate Cyber Wars target is a complete Viridia district; the long-term design remains seven distinct worlds. Browser presentation is scalable; native UE5 photorealism is a separate implementation target, not a claim about this release.

Relevant directions: ancient architecture within future cultures; distinct materials and silhouettes; terrain, water, vegetation, original environment kits, readable landmarks, articulated characters, state-driven weather/time, and dependable gameplay. The authoritative canon remains ArchitectIndustries/Cyber-Wars. No major lore/economy changes were approved or introduced by these presentation changes.

## Implemented in the unavailable workspace

### Solstice Wilds 1.0 — new original catalog game

Owned files: `games/solstice-wilds/{index.html,style.css,model.js,scene.js,main.js,PROVENANCE.md}`, `covers/solstice-wilds.svg`, `tests/dynamic-3d/solstice-model.cjs`, `docs/Solstice-Wilds.md`.

A third-person coastal-valley expedition:
1. Read the seeded Archive inscription and activate three rune pillars in order.
2. Fight workshop scouts, break crates, collect four salvage parts and repair the river bridge.
3. Cross north, defeat two ranged sentinels and a telegraphed melee warden, and activate the Spire.
4. Return to Dawn Lighthouse for the actual win.

Original terrain, river/coastal water, arches, lighthouse, armillary, vegetation, articulated actors, wind/rain/daylight, orbit camera, keyboard/remap/touch/gamepad input, interruption pause, and checkpoint progression. Continued/retried runs are unranked practice. Completion is emitted once; only eligible fresh completion includes score.

Reported fresh checks: **20/20 deterministic model tests**, including the full route through ordinary movement and action inputs without injecting progression flags/resources. ES modules parse; cover SVG is valid XML. Actual browser appearance/input remains unverified.

Catalog metadata: id `solstice-wilds`; version `1.0`; added/updated `2026-11-26`; genres `3D, Exploration, Adventure, Action, Puzzle, Combat`; Solo; remappable; accent `#b6dcac`; score unit `pts`, high, label `Expedition score`. Tagline: “Read the ruins. Restore the crossing. Bring the light home.”

Earned milestones: `archive-restored`, `bridge-repaired`, `spire-restored`, `campaign-complete`. Only `campaign-complete` is completion. The partially edited root event registry used a provisional `site-restored` key and needs correction to these actual events.

### Aegis Verge 3.0 — worldscape upgrade

New runtime: `games/aegis-verge/environment-mesh.js`, `worldscape.js`. Bounded changes to `index.html`, `rendering.js`, `enemy-silhouettes.js`, `signal-uplink.js`, `PROVENANCE.md`. New tests: `tests/dynamic-3d/aegis-world.cjs`, `aegis-signal-forge.cjs`. Notes: `docs/Aegis-3D-upgrade.md`.

Salt Bastion gains an arched causeway, crane, moving carrier, turbines and basin. Relay Scar gains reactor/pressure-vessel/pipe landmarks. Null Crown gains tilted arrays, pylons and animated core. Local mesh materials, contact shadows, terrain/cliffs/water/foundations and relay-driven environmental motion preserve collision, save and ranking authority. Tall landmarks clear the tactical camera envelope.

F3D96 Signal Forge was selectively incorporated from the exact F3D95 patch (SHA-256 `770bfc79ae0bf426ad62dec7403f04679e2586fdf5b5601a0507f1daa0cc1666`); its existing 30-energy, six-second, single-use activation is preserved.

Reported fresh checks: **65/65 new world/lifecycle checks; 295/295 Signal Forge assertions; 40/40 existing specialist integration checks; 88/90 legacy unit programs**. The two remaining legacy failures are title predicates hardcoded to 2.x in `tests/flagship_f3d58_compact_unit.js` and `tests/flagship_f3d79_decoy_forecast_unit.js`; update them to accept 3+ without weakening behavioral checks.

Full-tier static geometry: approximately 21–25k triangles in eight material meshes; fallback approximately 3.7–3.9k triangles. These are source/model counts, not measured physical-device performance. Actual WebGL shader execution and browser composition remain unverified.

### Cyber Wars 0.65 — Viridia presentation

Owned files: `games/cyber-wars/index.html`, new `viridia-renderer.js` and `viridia-world.js`, updated `PROVENANCE.md`, `docs/Cyber-Wars-visual-upgrade.md`, `tests/dynamic-3d/cyber-visuals.cjs`, and `cyber-behavior-equivalence.cjs`.

Curved stone gateways, open archive colonnades/book galleries, Vault canopy/roof ribs, rounded tree crowns/fronds/ferns/fungi, compact training consoles, distant geology, articulated inhabitants/fauna, and simulation-driven sky/water/weather. Visible routes align with existing collision footprints.

Reported fresh checks: **1,279 geometry/render/state-isolation assertions**; paired gameplay snapshots and solid maps match v497 at all **eight stages** (initial, walking, weather/night, manual/salvage, obelisks, boss, home purchase, save), and the owned-home checkpoint bytes match exactly. Final software fixture contains 4,479 visible faces. Actual browser/GPU execution remains unverified.

## Shared scene and assets

New `assets/wwg-three-scene.js` exports `THREE`, `createRenderer`, `createSkyEnvironment`, `loadSurfaceMaterial`, and tested `clipNear`. WebGL2 uses the pinned Three.js PBR/shadow path. The lower tier renders the same scene meshes through clipped, depth-sorted, lit polygons, supporting indexed geometry, instancing, transparency, vertex colors and fog. It does not claim hardware PBR or shadow maps. Six focused renderer tests passed in `tests/dynamic-3d/scene-renderer.test.cjs`.

Three.js: official `three@0.187.0`, MIT, fetched from `https://registry.npmjs.org/three/-/three-0.187.0.tgz`; archive SHA-1 `face29ee2de9bcc31a1b573a76f224e35e0b2894`. Official module/core builds minified with esbuild 0.25.12, ES2022 ESM, legal comments retained; module core import renamed locally. Files under `assets/vendor/three-r187/` include LICENSE and PROVENANCE.md.

Poly Haven Forest Ground 01 and Mossy Rock, Rob Tuytel, CC0-1.0: six original unmodified 1024×1024 JPEG color/normal/roughness maps under `assets/materials/`. Sources:
- https://polyhaven.com/a/forrest_ground_01
- https://polyhaven.com/a/mossy_rock
- https://polyhaven.com/license

Exact source links, sizes and SHA-256 values were written to `assets/materials/PROVENANCE.md`. No runtime CDN, provider API, paid service or external texture request is required.

Immutable Git blob identities prepared before disconnection:
| Path | Bytes | Git blob SHA-1 |
|---|---:|---|
| assets/vendor/three-r187/LICENSE | 1081 | 8ada2a5f982916b0ba4b7a0aa7de347587e745d7 |
| assets/vendor/three-r187/PROVENANCE.md | 883 | 9c752623a5b4f05073e4056b5c663da9afb340d6 |
| assets/vendor/three-r187/three.core.min.js | 395915 | d3225f0681565e9f081437a8fcd51bc10910b373 |
| assets/vendor/three-r187/three.module.min.js | 376437 | a773dc1c42c7f2ef28254c355e89a8d68d400054 |
| assets/materials/PROVENANCE.md | 1675 | 63f5991b5c236b982d00ecf7a3a0984d51a22e1a |
| assets/materials/forest-color.jpg | 833711 | 5a26e1289b83142150b0fbf5b20a6c4452ab2e79 |
| assets/materials/forest-normal.jpg | 1428763 | 4a57d0b430577dde209b04584058f34617456445 |
| assets/materials/forest-roughness.jpg | 257165 | ffb5a501e81ce17e020f1a455fff0c03c44a04f8 |
| assets/materials/rock-color.jpg | 1124438 | 3895ff94f6bf7077df4c15978e1c9b289c5ac30d |
| assets/materials/rock-normal.jpg | 995727 | 1e4914bc5efaf83b9a41d42fe88fb26b455221e7 |
| assets/materials/rock-roughness.jpg | 780918 | 4a3293c68d1f38dcb061ff3e29aa6ab72c28937b |

An unreferenced forest-normal blob upload was in progress when the execution cell was lost. Its completion was not acknowledged; inspect before retrying. No new game source commit was published by that operation.

## Remaining work in dependency order

1. Recover the actual workspace source; inspect all existing changes before recreating anything. Preserve the v497 baseline and source history. Do not assume this checkpoint branch contains the code.
2. Update the actual catalog to 92 games: Solstice Wilds 1.0, Aegis Verge 3.0, Cyber Wars 0.65. Put the new expedition visibly in discovery. Correct its milestone event keys.
3. Finish root release/state/test notes and fix the two legacy major-version predicates. Root package/shell query/badge/history were partially bumped to v498; shared renderer/material notices and release tests were edited. The worker has not yet been regenerated.
4. Build with `node tools/build-public.mjs --update-cache`. The prepared builder marks dirty local source in its receipt; Vercel uses the exact deployed commit. Check all relative imports/material references.
5. Run new 3D suites, legacy flagship/specialist checks, release and bounded arcade/platform regressions, service-worker atomic/public-boundary contracts. The stale v259 fault-injection URL was changed to derive the actual current game-page script.
6. When supported browser access is available, inspect all three scenes and interact with launch, movement, combat/puzzles, pause/resume, retry/checkpoints, and narrow layouts. Review actual image composition. Do not substitute model checks for this evidence.
7. Re-read remote main, reconcile concurrent changes, publish the verified source to the existing repository/project only, and verify Vercel production.
8. Check live release.json against the final commit, 92 entries, all public-file SHA-256 values, and actual game behavior.

No billing change, duplicate hosting project, force push, account migration, canon retcon or production promotion was performed by this recovery-record commit. The user's authorization to complete development and publish the verified update to the existing app remains in effect.
