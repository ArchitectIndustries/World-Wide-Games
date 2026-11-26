# v498 — November 26, 2026: Dynamic 3D Worlds

**92 games.** Adds Solstice Wilds 1.0 and substantially expands the visual worlds of Aegis Verge 3.0 and Cyber Wars 0.65, while retaining the full 91-game v497 recovery.

- **Solstice Wilds:** explore the coastal valley, read the Archive's rune sequence, recover workshop salvage, repair the river crossing, confront telegraphed guardians and return the light to the lighthouse. Checkpoints preserve earned resources; continued or retried runs remain unranked practice.
- **Aegis Verge:** drive through authored industrial basins, causeways, cranes, reactors and arrays. Machinery and lighting respond to the real mission clock and relay state. The latest F3D96 Signal Forge cues are integrated without changing their energy/duration rules.
- **Cyber Wars:** explore richer Viridia forest, stone arches, archive galleries, temple forms and an owned-home canopy. Rounded and articulated inhabitants, sky, rain and river appearance follow existing state. Missions, economy, Pilot progression and owned-home saves retain their published behavior.
- **Clearer field views:** Aegis and Cyber Wars keep essential vitals/objectives visible and put detailed systems and full controls in paused guides. Cyber Wars' extra touch tools expand on demand.
- **Self-hosted resources and reliable updates:** the new scene foundation uses pinned Three.js r187 and CC0 materials. Clean builds verify downloads from official sources before publishing local runtime files. The worker cache includes a content fingerprint so later v498 fixes receive a new asset namespace.

**Source status: `VALIDATED_RELEASE_SOURCE`.** Automated release/gameplay checks, clean official-resource preparation, cache behavior and scoped desktop Chrome play checks are complete. Chrome play included the Solstice Archive puzzle and checkpoint restoration. The live release is identified and verified separately through the production `release.json` receipt.

## v497 — November 26, 2026: complete recovery release

91 games. Restores cumulative v73–v496 game and platform improvements, preserves all six Arcade Nights games and the concurrent Stormwake Rescue/Iron Meridian campaigns, integrates Aegis Verge 2.95 and Cyber Wars 0.64, and includes profile B2 and Mosaic B1 repairs. Lattice Armada retains its corrected menu visibility, pointer guard and reachable launch controls.

## Complete release history

The original cumulative release notes are preserved, in order, across the following readable files. Concatenating them reproduces the complete original document byte for byte, including its current release introduction and every historical revision. The [grouped recovery index](docs/RECOVERED_CHANGE_HISTORY_2026-11-26.md) lists all 424 revisions from v73 through v496.

- [Part 1 — v497 through v413](docs/release-history/part-01.md)
- [Part 2 — v412 through v328](docs/release-history/part-02.md)
- [Part 3 — v327 through v230](docs/release-history/part-03.md)
- [Part 4 — v229 through v138](docs/release-history/part-04.md)
- [Part 5 — v137 through v309](docs/release-history/part-05.md)

Original complete-document SHA-256: `2f4b4186b645516cae6cabe7c5910956df01565503efb8ada58617629fcd091c`

```sh
cat docs/release-history/part-*.md | sha256sum
```

These historical notes retain their original development-time status. The current production release is identified by the live `release.json` receipt.
