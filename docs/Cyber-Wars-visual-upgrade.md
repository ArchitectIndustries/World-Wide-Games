# Cyber Wars 0.65 — Viridia visual world

Prepared November 26, 2026, against the published World Wide Games v497 source
at `53a569bf4b8493e666298d4c702e427e2e14260d`.

## Purpose and source authority

This update develops the appearance of the existing playable Viridia district.
The game bible calls for a coherent first district containing a settlement,
library, wilderness, water, training, missions, combat and an owned home. The
current implementation already contains those gameplay systems; this change
gives their locations and inhabitants more varied three-dimensional forms.
It does not claim to implement the bible's complete seven-world game.

The creator's Core files were read directly from these sources on November 26:

| Core reference | SHA-256 of retrieved content |
| --- | --- |
| [DESIGN_BIBLE.md](https://github.com/ArchitectIndustries/Cyber-Wars/blob/main/DESIGN_BIBLE.md) | `b19f0a1176b77654add2107fe85da94b9da7884ffdc91bc484db7834e7f39ff6` |
| [LIBRARY_COLLECTION.md](https://github.com/ArchitectIndustries/Cyber-Wars/blob/main/LIBRARY_COLLECTION.md) | `e7c427a1a8c3092ead5fc86c3b838803bcb9f65615bafbfe89ddae203a6e6ba3` |
| [PROJECT_NOTICE.txt](https://github.com/ArchitectIndustries/Cyber-Wars/blob/main/PROJECT_NOTICE.txt) | `e17a7e741f8ae53a7d93972b39063385b5f9ac2fdd310796ca8333dced0c555c` |

The November 26 consolidated `Cyber_Wars_Game_Bible.md` was also inspected. Its
SHA-256 is `41e11b8195056d4876fbbde941944b8d34ee49a54af6ff9030096131260236c8`.
It contains 18 chapters; its standalone PDF has 26 pages. Those reference
documents remain outside this public app source. Their contents and the
creator's underlying IP have not been relicensed or copied into this update.

The Core collection still contains earlier rank-3/rank-6 flying language. The
consolidated companion clarifies supervised training before the rank-10
independent Pilot license. This visual update retains the published game's
stricter practical-training and rank-10 license boundary and imports no book
text. It introduces no new named characters, history, planet claims or canon.

## What appears in the district

`games/cyber-wars/viridia-world.js` builds a separate presentation layer from
the existing scenery, collision circles and interaction coordinates. Its own
seeded random stream never consumes the simulation's random stream.

- All 86 existing tree colliders receive tapered trunks, elevated branches,
  rounded faceted crowns and broad fronds. Soft fern clusters avoid interaction
  approaches. The old decorative neon mushroom slabs become small curved fungi.
- Stone gateways and the southern ruin use actual curved arches. The Vault of
  Roots has its existing solid pillars, layered overhead ribs and a leaf canopy.
  The archive has fluted posts, a vaulted roof, hanging book galleries and the
  existing archivist. The original noncolliding solid-looking building boxes
  are removed from the presentation.
- The eight existing training stations use compact instrument cabinets, small
  readouts and open luminous diagrams at their original interaction positions.
  Their former large opaque boxes no longer dominate the arrival view. These
  are stationary training displays; the update adds no usable aircraft.
- The home plot remains open and accessible. Ownership reveals a suspended
  canopy, open roof rib, light and floor treatment, preserving the same owned
  home checkpoint interaction. There are no new walls to walk through.
- Flat terrain tiles and shallow inlaid routes retain the actual walkable
  elevation. Twenty-eight distant geological forms sit entirely outside the
  playable district. They provide a horizon without introducing false slopes
  or blocking routes.
- River tiles follow the existing river boundary and leave the dry central
  bridge clear. The real simulation clock and rain intensity drive surface
  motion and sheen. Existing raft, drifting cargo, debris, currents and mission
  markers remain gameplay authoritative.
- The sky, distant haze, light direction and water appearance follow the
  existing day/night and weather state. Fronds move with the same clock. The
  new ambient animation stops when that simulation clock stops. Reduced motion
  freezes the new ambient movement.
- Residents, the player and visible peers have separate torso, head, limbs,
  feet, visor and equipment forms. Gait is derived from observed movement in a
  private presentation cache. Fauna shapes use their actual positions and
  sheltered state. Sentry silhouettes reflect their existing disabled/warden
  state. None of those render functions changes actor state.

## Compact field HUD and paused guide

The field view now shows only health, Aegis, credits and a compact current
objective. A short contextual line appears when the player is on the river,
in an active river run, under hostile investigation or observing wildlife.
Changes in river mode and hostile awareness retain a bounded polite
announcement; running timer changes do not repeatedly announce themselves.

The 28 secondary status cards, district map and complete former controls footer
are grouped in a native **Field Guide** dialog. All original status IDs remain
unique and functional. The guide includes keyboard, remapped-input, touch and
controller instructions. It opens from its 44-pixel button, the pause menu,
`?`/F1 or standard-controller Start. Escape, Return, Start or controller B close
it. Opening pauses the existing field simulation and exits pointer lock.
Closing from active play focuses the game canvas; opening from the pause menu
returns to that paused menu. Held keys and controller actions must release
before they can act in the field again.

Touch controls initially show movement, Pulse, Use, Sprint and Sneak. The
44-pixel Tools button exposes camera, parry, echo, jam, cover, observation and
tracking actions. This reduces persistent screen coverage while retaining the
existing action handlers and state. Native guide scrolling and details sections
keep the full instructions available on smaller screens.

## Local renderer

`games/cyber-wars/viridia-renderer.js` is original first-party code installed on
this game's existing engine instance. The shared `assets/wwg-webgl.js` source is
not modified by the Cyber Wars integration.

The local mesh vocabulary contains planes, boxes, columns, tapered trunks,
spires, leaves, curved arches, rounded bodies and irregular rocks. Rounded
geometry uses one bounded subdivision, producing 80 faces per primitive.
Meshes share cached unit geometry and use transforms for scale and orientation.

On WebGL2, compatible meshes are grouped into instanced draws. The adapter
preserves the engine's matrix, material, camera and light uniform contract and
restores the cube VAO after every custom draw. Its local shader adds procedural
stone/ground/foliage/cloth grain, water normal variation, reflected sky tint,
specular highlights, diffuse and ambient fill, distance fog and a procedural
cloud/sky backdrop. This is a lightweight stylized renderer, not a claim of
physically accurate rendering, ray tracing or shadow maps.

The adapter initializes one inert instance record for the shared cube VAO before
compiling its optional shaders. This addresses drivers that disable batching:
enabled instance attributes still need valid backing storage during an ordinary
cube draw. The initialization also protects the original-renderer fallback if
an optional shader is rejected. Shared instance capacity remains zero until the
shared engine performs its own normal allocation for a batch.

When WebGL2 is unavailable, the same geometry is rendered as clipped,
backface-culled, depth-sorted Canvas polygons. Water and terrain are tiled to
limit ordering artifacts. The fallback has an 18,000-face hard cap, bounded
geometry caches and distance/detail culling. It is a functional fallback, not
visual equivalence with hardware shaders. If a local WebGL shader fails to
compile, the prior cube renderer remains available and retains its original
scene objects. Local GPU resources are disposed with the parent engine.

There are no new runtime CDNs, downloaded models, textures, paid APIs or remote
generation dependencies in the Cyber Wars visual layer. All new meshes,
materials and animation calculations are part of the self-contained source.

## Preserved gameplay boundaries

The existing collision circles, ground movement, camera inputs, mission
functions, combat, rainfall effects, raft physics, fauna observations,
networking and checkpoint serializer are unchanged. Solid supports fit inside
their original collision footprints; architecture added between supports is
overhead and open. Terrain stays flat, new horizon geometry stays outside the
playable clamp, and low undergrowth does not imply a new blocking wall.

The exact integer economy remains authoritative: 21.000 starting credits,
10.000 ordinary mission payment, 100.000 home price and 1,000.000 ship price.
The ten-rank Pilot progression and free license at completion remain intact.
The update grants no progress, money, ownership, license or saved checkpoint
merely by rendering or exploring the new scenery. A strategic checkpoint still
requires the owned home. Existing local/shared-world authority limits remain
unchanged.

## Executed verification

Run the focused checks from the repository root:

```sh
node tests/dynamic-3d/cyber-visuals.cjs
node tests/dynamic-3d/cyber-instance-storage.cjs
node tests/dynamic-3d/cyber-field-guide.cjs
node tests/dynamic-3d/cyber-behavior-equivalence.cjs
```

The visual suite passed 1,295 assertions covering finite mesh topology and
normals, clipping, transform scale, deterministic scenery, frozen input data,
solid-footprint containment, horizon placement, bridge/water boundaries,
reduced motion, rain/day/night response, GL state restoration, instancing and
GPU resource disposal. Its actual-game VM exercises twelve weather/lighting
draw combinations without changing the complete exposed gameplay snapshot,
collision map or storage writes. The final arrival fixture drew 4,479 visible
software faces, below its hard cap. The GL recorder verifies command contracts;
it does not compile shaders on a real graphics driver.

The instance-storage suite passed 14 additional checks using the actual shared
Engine with the release's modeled WebGL driver fixture. It first reproduces the
inherited empty-buffer failure, then verifies the local repair, legacy and
custom ordinary draws, instanced draws, capacity reallocation, shader-rejection
fallback, restoration of the original VAO and resource disposal. This fixture
checks enabled vertex-attribute storage at draw time and is shared with the
Aegis regression suite; it is not a real GPU execution claim.

The compact HUD/Field Guide suite passed 14 additional grouped checks using the
actual game handlers. It verifies preservation and uniqueness of all previous
status IDs, compact document structure, reversible touch expansion, guide
opening/cancellation/closing, focus destinations, frozen simulation and save
writes, keyboard release requirements, native button activation, returning to
an already paused menu, and controller Start/B boundaries without leaked field
actions. The browser coordinator separately verifies actual rendered sizes,
scrolling, visible world area and native focus behavior.

The behavior comparison executes the published 0.64 executable and current
0.65 executable with the same modeled environment. It compares full exposed
gameplay snapshots and collision maps at eight checkpoints:

| Checkpoint | Integer credits | Pilot rank | Mission stage |
| --- | ---: | ---: | ---: |
| Initial state | 21000 | 0 | 0 |
| Walking | 21000 | 0 | 0 |
| Rain and night drawing | 21000 | 0 | 0 |
| Manual and salvage mission | 31000 | 1 | 2 |
| Obelisks restored | 31000 | 1 | 3 |
| Warden defeated | 106000 | 1 | 4 |
| Home purchased | 6000 | 1 | 5 |
| Owned-home checkpoint | 6000 | 1 | 5 |

All eight states and actual solid maps match. The saved checkpoint keys and
serialized bytes also match exactly. The test pins the published commit;
`CW_BASELINE_HTML` may instead identify an independently retrieved copy of that
executable in a checkout without the historical git object.

The tests use a Node VM, modeled DOM and modeled Canvas. They do not establish
real controller/phone behavior, hardware performance, real-driver shader
success or an uninterrupted human playthrough. Polygon captures were inspected
for composition as internal renderer output. Browser appearance and input
verification are part of the enclosing release review and must be reported
separately from these software-state checks.
