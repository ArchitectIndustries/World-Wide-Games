# WorldWideGames

Original, instant-play browser games by **Architect Industries**.

## Current source release: v498 — Dynamic 3D Worlds

November 26, 2026. **92 games, 136 genre tags.** The complete 91-game v497 catalog is retained, with a new exploration game and substantial upgrades to two existing 3D worlds.

- **Solstice Wilds 1.0** is a new third-person coastal expedition. Read the Archive's rune sequence, recover workshop salvage, repair the river crossing, defeat the Spire's guardians and return the restored light to the Dawn Lighthouse. Weather, an orbit camera, articulated characters and checkpoints connect the route. Continued or retried expeditions remain unranked practice.
- **Aegis Verge 3.0 — Industrial Frontiers** places its three-operation vehicle campaign among sculpted basins, causeways, working cranes, reactors and monumental arrays. Installations react to actual mission state. The latest F3D96 Signal Forge presentation is also integrated, retaining the uplink's 30-energy, six-second, single-use rules. A compact combat HUD keeps the world visible while a paused guide retains detailed systems and controls.
- **Cyber Wars 0.65** gives Viridia rounded forest canopies, curved stone gateways, open archive galleries, richer inhabitants, and simulation-driven sky, rain and river surfaces. Its compact HUD and paused Field Guide retain every original status field and full controls. Missions, collision, the exact economy, ten-rank Pilot progression and owned-home checkpoints remain intact.

These games use actual 3D geometry with bounded software fallback paths. The new Solstice renderer uses self-hosted Three.js r187 and licensed material resources. Aegis and Cyber Wars retain their original engine with game-local mesh and material extensions.

**Source status: `VALIDATED_RELEASE_SOURCE`.** Automated release, gameplay, asset and cache checks have passed. Desktop Chrome checks also exercised all three worlds, including Solstice’s Archive puzzle and checkpoint restoration. See [TEST_REPORT.md](TEST_REPORT.md) for the observed scope. Production publication is verified separately through the live release receipt.

## Play and verify publication

- [WorldWideGames](https://worldwidegames.vercel.app/)
- [Production release receipt](https://worldwidegames.vercel.app/release.json)

The build receipt identifies the actual source commit, game count, content-fingerprinted worker namespace and public file hashes. Confirm the receipt and executable bytes on the production domain after publication.

## Build

Requires Node.js 22 or later. `tools/asset-sources.json` records the approved URLs, byte counts and SHA-256 hashes, and `tools/fetch-public-assets.mjs` prepares the files. Seven source downloads—six official Poly Haven images and the official npm package archive for Three.js r187—produce eight runtime files totaling 7,554,421 bytes. The build verifies the resources before staging them and fails on a missing or mismatched resource. There is no esbuild transformation or dependency in the final resource pipeline.

```sh
npm run build
npm run test:release
npm run test:assets
npm run test:3d
npm run test:arcade
node tests/recovery_b2_profile_storage.cjs
node tests/recovery-specialist/integration.cjs
node tests/recovery-specialist/lattice-menu.cjs
```

A clean build needs access to those official resource providers. Published games load the staged files from this site; they make no runtime CDN or npm request. A provider outage can block a clean rebuild, while an already published deployment keeps its own resource files.

The build writes **dist/** and includes only public game/runtime files and required notices. Tests, source history, internal records and optional relay service code remain outside public output. The source repository retains the original first-party code, resource download/verification logic, pinned manifest, licenses and provenance. Third-party asset bytes are recovered from their verified official sources during the build.

When changing runtime files, run `node tools/build-public.mjs --update-cache` to refresh the source worker inventory. Each build independently regenerates the published inventory and uses a content-derived name such as `wwg-v498-<12 hex characters>`, so a changed runtime receives a new cache namespace.

The Cyber Wars comparison tests require the published v497 Git object. A source-only checkout may provide its verified executable through `CW_BASELINE_HTML` instead.

## Preserved recovery history and validation

v497 recovered the cumulative v73–v496 game/platform changes, the six Arcade Nights additions, Stormwake Rescue and Iron Meridian, Mosaic Memory 1.1, the profile-storage repair, and the Lattice Armada menu fix. Those changes remain in this source. **Build numbers identify revisions, not game counts.**

The [recovered change index](docs/RECOVERED_CHANGE_HISTORY_2026-11-26.md) preserves all 424 revisions from v73 through v496. The complete historical notes and compressed research library retain their recorded hashes. See [source recovery scope](docs/SOURCE_RECOVERY_SCOPE_2026-11-26.md), [PROJECT_STATE.md](PROJECT_STATE.md), [TEST_REPORT.md](TEST_REPORT.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Browser-local scores and saves remain local. Optional multiplayer relay implementations remain in source; this static release does not activate a hosted relay.
