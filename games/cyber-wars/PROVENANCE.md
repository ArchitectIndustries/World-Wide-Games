# Cyber Wars 0.65 — Viridia visual world, November 26, 2026

The published 0.64 gameplay receives an original local mesh/material adapter
and a read-only Viridia presentation layer. Rounded forest vegetation, curved
stone gateways, open archive and temple architecture, compact training
instruments, an owned-home canopy, distant geology, articulated inhabitants,
and simulation-driven water/sky/rain appearance replace coarse visual shells.
The new scripts are `viridia-renderer.js` and `viridia-world.js`; this integration
does not modify the shared engine source or import external runtime assets.

The creator's current Core design bible, library collection and project notice,
plus the November 26 consolidated game bible, were inspected before the update.
No private bible text or new canon is copied into the app. The exact references,
source hashes, implementation boundaries and validation are recorded in
[the visual upgrade record](../../docs/Cyber-Wars-visual-upgrade.md).

Focused tests verify geometry, rendering state isolation and the original
collision boundaries. A paired execution against published v497 commit
`53a569bf4b8493e666298d4c702e427e2e14260d` matches eight complete exposed gameplay
states through owned-home saving and produces identical checkpoint bytes.
Those Node VM checks are distinct from real browser, controller, mobile and
hardware performance verification.

The local renderer also initializes backing storage for the original cube VAO
on drivers with batching disabled, including optional-shader rejection. A
modeled driver running the actual shared Engine verifies the failure and fix,
later instanced reallocation, restored VAO state and disposal. The shared engine
file and its allocation rules remain unchanged.

The field HUD is compacted to vitals, credits and the current objective. Its
28 secondary status cards, complete controls and map remain available through
an accessible, paused Field Guide; touch tools can be expanded on demand.
Focused handler tests verify modal pause, focus, status-ID preservation and
held keyboard/controller boundaries without progression or save changes.

## Cyber Wars 0.64 — prior catalog recovery

Recovered the existing WorldWideGames Browser Edition runtime from the immutable
October 23 Cyber Wars 0.64 isolated patch. This integrates prior completed work;
it does not create a new game, change creator canon, or publish the separate
Unreal Edition.

- Source: `CyberWars_064_AGAINST_WWG_v223_ISOLATED_PATCH.zip`.
- Archive SHA-256: `069c702878d9bafd8ae0136bce6c1fd5d8ac8124c6a9f4cf1563fdeb852ac52e`.
- Recovered `index.html` SHA-256:
  `0a7cce271e7f9129b147be6df7592f68045f15e0643da7ea224c9fe42898ea24`.
- All 17 file hashes in the isolated patch manifest were verified before
  integration. Only this game's executable and its two existing gameplay test
  scripts were copied from the patch; older catalog, cache, shell, and release
  records were not copied.
- The prior v496 Cyber Wars executable matched the independently preserved 0.44
  baseline byte for byte. The shared input and rendering scripts remain unchanged.

## Recovered gameplay

The river expedition includes moving cargo driven by current, rainfall, inertia,
eddies, and driftwood contact. Players collect three moving pods, pass three
ordered beacons, and land on the north bank within 75 active seconds. A timber
collision can spill collected cargo, which remains physically recoverable.
Wildlife tracks and last-known sightings remain part of the recovered exploration
runtime. Optional river delivery grants no currency, skill ranks, or strategic
save, and it creates no network authority.

## Integration verification

`node tests/recovery-specialist/integration.cjs` executes the original game
runtime in a Node VM with a modeled DOM and canvas. The preserved steering
fixture physically collects and delivers three pods in 18.48 simulation seconds,
with no timber contacts. Separate fixtures exercise a real collision, spill,
steered retrieval, and incomplete delivery. They also verify 21.000 starting
credits, no free house or Pilot rank, no unsolicited save, and no public QA
controls even with `?qa=1`.

These are software-state checks, not browser rendering, real controller or phone
testing, a hardware performance claim, or an uninterrupted human playthrough.
The original Core economy, owned-home checkpoint rule, ten-rank Pilot progression,
local authority, original procedural artwork, and existing licensing remain
unchanged. No external code, assets, paid service, or new network host was added.
