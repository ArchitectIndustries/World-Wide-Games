# WorldWideGames

Original, instant-play browser games by **Architect Industries**.

## Current source release: v499 — Worlds in Motion

November 26, 2026. **92 games, 136 genre tags.** This release retains the full v498 catalog and deepens three existing 3D worlds.

- **Solstice Wilds 1.1 — Working Tideworks:** recover four real salvage parts, install the workshop counterweight, align the sluice with the Archive’s first rune, and operate the winch. Both bridge leaves lower over active simulation time and become traversable only when locked. The Spire warden guards its core until a missed charge opens a damage window. Controller menus, old checkpoint compatibility and browser-history restoration are covered.
- **Aegis Verge 3.1 — Articulated Combat Rigs:** the Vesper and four hostile classes use original sculpted hulls, weapon assemblies, traction belts, wheels, canopies and material separation. Actual movement, steering and weapon states drive the poses. The exact F3D97 pointer-release fix and a separate stale-keyboard-repeat repair prevent abandoned holds from reviving after interruption.
- **Cyber Wars 0.66 — Canopy Archive:** an approachable archivist and three physical lecterns open selected original Core readings. The existing Pilot manual remains a separate practical skill path. Briefings now focus their Continue control and close before field input resumes. Named obelisk objectives, state-derived district changes, focus-safe controller menus and local co-presence restoration complete the update.
- **More room to play:** the three worlds default to an expanded desktop play area. Standard view, Game info and Back to game preserve the running iframe. Fullscreen refusal falls back to expanded view. Visible-page playtime excludes background intervals and retains fractional time across lifecycle events; reduced-motion navigation stays immediate.

These are actual geometry and gameplay changes. Solstice uses the self-hosted Three.js foundation; Aegis and Cyber Wars use game-local mesh extensions to their established engine. The broader seven-world Cyber Wars RPG and final production graphics remain a continuing project.

**Source status: `VALIDATED_RELEASE_SOURCE`.** Release, gameplay, asset, cache and platform checks pass. Chrome playthroughs exercised the new Tideworks sequence and warden exposure, Aegis driving/firing/focus, and the physical Canopy Archive with reading and deliberate Pilot study. Exact scope and software-rendering limitations are recorded in [TEST_REPORT.md](TEST_REPORT.md). Production identity is verified separately through the live receipt.

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
npm run test:player
npm run test:arcade
node tests/recovery_b2_profile_storage.cjs
node tests/recovery-specialist/integration.cjs
node tests/recovery-specialist/lattice-menu.cjs
```

A clean build needs access to those official resource providers. Published games load the staged files from this site; they make no runtime CDN or npm request. A provider outage can block a clean rebuild, while an already published deployment keeps its own resource files.

The build writes **dist/** and includes only public game/runtime files and required notices. Tests, source history, internal records and optional relay service code remain outside public output. The source repository retains the original first-party code, resource download/verification logic, pinned manifest, licenses and provenance. Third-party asset bytes are recovered from their verified official sources during the build.

When changing runtime files, run `node tools/build-public.mjs --update-cache` to refresh the source worker inventory. Each build independently regenerates the published inventory and uses a content-derived name such as `wwg-v499-<12 hex characters>`, so a changed runtime receives a new cache namespace.

The Cyber Wars comparison tests require the published v498 Git object. A source-only checkout may provide its verified executable through `CW_BASELINE_HTML` instead.

## Preserved recovery history and validation

v497 recovered the cumulative v73–v496 game/platform changes, the six Arcade Nights additions, Stormwake Rescue and Iron Meridian, Mosaic Memory 1.1, the profile-storage repair, and the Lattice Armada menu fix. Those changes remain in this source. **Build numbers identify revisions, not game counts.**

The [recovered change index](docs/RECOVERED_CHANGE_HISTORY_2026-11-26.md) preserves all 424 revisions from v73 through v496. The complete historical notes and compressed research library retain their recorded hashes. See [source recovery scope](docs/SOURCE_RECOVERY_SCOPE_2026-11-26.md), [PROJECT_STATE.md](PROJECT_STATE.md), [TEST_REPORT.md](TEST_REPORT.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Browser-local scores and saves remain local. Optional multiplayer relay implementations remain in source; this static release does not activate a hosted relay.
