# WorldWideGames

Original, instant-play browser games by **Architect Industries**.

## Current source release: v497 — November 26, 2026

The consolidated source contains **91 games**, with **136 genre tags**. This release restores the accumulated work that had remained in saved build candidates instead of reaching the canonical repository and production site.

- All 82 original catalog games retain the cumulative improvements through v496.
- Cyber Wars joins the catalog with the recovered **0.64** Viridia slice.
- **Aurora Hockey, Skyline Hoops, Lightline Circuit, Orchard Slice, Mosaic Memory, and Tabletop Commons** remain integrated from the Arcade Nights merge.
- **Stormwake Rescue** and **Iron Meridian**, added concurrently to main, remain integrated with their shared campaign engine.
- Aegis Verge is upgraded to **2.95 / F3D95**, preserving newer catalog save and focus fixes.
- Mosaic Memory **1.1** repairs covered-board focus, pause, resume and restart behavior.
- The game-detail page now isolates damaged local profile records without overwriting their original stored values.
- Lattice Armada includes the v100 picker correction: the sector menu is actually hidden after launch rather than remaining over the playfield.

**Build numbers identify revisions, not game counts.** The complete [recovered change history](docs/RECOVERED_CHANGE_HISTORY_2026-11-26.md) indexes all 424 revisions from v73 through v496 and groups their player-facing changes. Earlier v71–v72 work is also included through the canonical Git base.

## Play and verify publication

- [WorldWideGames](https://worldwidegames.vercel.app/)
- [Production release receipt](https://worldwidegames.vercel.app/release.json)

The receipt is generated at build time and contains the actual commit, release, game count and public file hashes. A source commit or successful preview alone does not establish that the production alias has updated.

## Build

Requires Node.js 22 or later. There are no application package dependencies.

```sh
npm run build
npm run test:release
npm run test:arcade
node tests/recovery_b2_profile_storage.cjs
node tests/recovery-specialist/integration.cjs
node tests/recovery-specialist/lattice-menu.cjs
```

The build writes **dist/** and stages only public game/runtime files. Tests, source history, internal records and optional relay service code stay outside the public output. Vercel uses this same build and output directory in the existing project.

When changing runtime files, run `node tools/build-public.mjs --update-cache` to refresh the source worker inventory. Every ordinary build independently regenerates the published worker inventory, including exact query variants and all specialist game modules.

## Source and validation

See [source recovery scope](docs/SOURCE_RECOVERY_SCOPE_2026-11-26.md), [PROJECT_STATE.md](PROJECT_STATE.md), [TEST_REPORT.md](TEST_REPORT.md), and [DEVELOPMENT_STANDARDS.md](DEVELOPMENT_STANDARDS.md). Historical records retain their original build-only status as evidence of what was known at that time; they do not describe the publication status of v497.

Browser-local scores and saves remain local. Optional multiplayer relay implementations are preserved in source; this static release does not provision an online relay service.
