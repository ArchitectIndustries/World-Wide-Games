# Cyber Wars 0.66 — Canopy Archive and district feedback

Prepared November 26, 2026, against the published World Wide Games v498 source
at `e08e18a641dde60183f01737ba3fa50b732e10a5`. The earlier 0.65 visual-world
record is retained below as release history.

## Source authority and selected readings

The current Core repository was checked at commit
`c3f8c5055a7f0087c382b226c6d58905ad3f03e3`. These are hashes of the exact
upstream file bytes; the earlier 0.65 retrieval added one final newline to each
local reference copy, which explains the different historical hashes below.

| Core reference at the checked revision | Git blob | SHA-256 |
| --- | --- | --- |
| [DESIGN_BIBLE.md](https://github.com/ArchitectIndustries/Cyber-Wars/blob/c3f8c5055a7f0087c382b226c6d58905ad3f03e3/DESIGN_BIBLE.md) | `3eca78aba99e23914796215e9735de595ee4821d` | `4f6c98b5aaec1f2019e3071eb119413f28490ed5e11d34566d29ca28b08eb448` |
| [LIBRARY_COLLECTION.md](https://github.com/ArchitectIndustries/Cyber-Wars/blob/c3f8c5055a7f0087c382b226c6d58905ad3f03e3/LIBRARY_COLLECTION.md) | `36da1e827fb48c6cd66e880c3695533914285bac` | `447d39d52b57cf30469292878300912f1d997d1632f8cdd4318c24ad7e59343c` |
| [PROJECT_NOTICE.txt](https://github.com/ArchitectIndustries/Cyber-Wars/blob/c3f8c5055a7f0087c382b226c6d58905ad3f03e3/PROJECT_NOTICE.txt) | `cb1167e754e91351b3d0820c53132e1d44cf5e1a` | `e5e86a0ad37b14e11262be7a3b9d16ba55ea2c583cf7544e74ad216e428d7aa8` |

The creator authorized a small selection of the existing library for this game.
`games/cyber-wars/archive-collection.js` contains exactly these three works and
their existing classification and attribution. The titles, authors and prose
are taken from the checked collection; no new story or named character is
introduced. The full private library and design bible remain outside the app.
The creator retains the underlying writing and Cyber Wars rights.

| Reading | Category | Attribution | Shelf |
| --- | --- | --- | --- |
| The Lake Beneath the Library | Wilderness / Folktale | Ilex | Viridian |
| The Beetle That Kept Time | Insects / Naturalist fiction | The Viridian field circle | Viridian |
| The Hundred-Credit Roof | In-world economics | The Commons Exchange | Shared archive |

The test pins each selected work's paragraph text to a SHA-256 derived from
the verified Core source. This checks exact wording while avoiding publication
of the source documents themselves. These are readable works, separate from
the implemented Pilot skill manual. Opening a story does not complete study,
award a rank, grant a license or create a checkpoint.

## A usable archive in the existing world

The existing archivist at `(-31, -8)` now opens a catalogue. The three books
occupy post-mounted lecterns at `(-34, -10.25)`, `(-31.5, -10.25)` and
`(-26.5, -10.25)`. Covers, angled pages, ink marks and brackets make them
recognizable within the open archive. The brackets fit the existing post
footprints; no new invisible obstacle or collision circle is added. Nearby
interaction prompts name the actual book or archivist.

The catalogue presents three readings and a separate Pilot manual action.
The reader shows the selected title, category, author and Viridian/shared
origin; Previous/Next and Left/Right browse the works, All readings returns
to the catalogue, and A−/A+ changes type size between 90% and 135%.
The reading area scrolls independently, and native buttons have at least
44-pixel targets. Layouts flex within the existing standard player frame,
the expanded player view and compact-width frames.

The reader stores only the current reading, type size and opened-this-visit
markers in memory. It writes no local storage and makes no progression calls.
Choosing the Pilot manual opens the existing manual UI: the original page
visits and explicit Study action still determine the first rank, and all
later practical training and license requirements remain authoritative.

## Briefings, controls and focus

The former steward overlay could remain visible after P unpaused the world.
The new briefing is a native modal dialog with initial focus on Continue.
P, Escape, Continue and native cancellation close the dialog before returning
control. A briefing opened from an already paused menu returns to that pause
state. Incomplete tasks receive readable steps derived from the actual mission
flags, without issuing a second mission payment.

Archive and briefing entry share the existing pause boundary: they clear field
inputs, exit pointer lock and pause the simulation. Closing restores the game
canvas or the previously paused menu and requires held keys, controller axes
and buttons to release before field actions resume. Controller samples held
when a dialog opens are absorbed; closing with Start cannot also open the
Field Guide. Standard-controller navigation, activation, reading scroll and
Back/Start closing are handled within the archive. Keyboard browser shortcuts
remain available, and native Tab/Enter/Space operation is retained.

Controller focus checks run before modal or Field Guide actions. While the
document is unfocused or hidden, button samples are absorbed without opening
readings or dismissing a briefing. Returning requires all held directions and
buttons to become neutral before a new press can act. Blur and hidden-page
events also set this boundary when the browser suspends animation callbacks,
so a held input cannot become an unintended first action after return.

Touch movement, field actions and touch camera gestures are inactive while
paused, unfocused or in these dialogs. Touch Use can open the archive, and the
reader's native controls remain usable. The modeled tests cover keyboard,
touch and standard-controller paths separately; this is not a real-device
qualification claim.

All three existing solar objectives now have explicit names: Solar Obelisk 1,
2 and 3. Their positions and restoration requirements are unchanged. This
fixes the reproduced `undefined` compass label after initiation.

## Readable inhabitants and visible aftermath

The existing steward and archivist turn toward a nearby player and use local
reading/attending poses with an open book or ledger. Their clothing and limbs
remain articulated, with a subtle breathing motion derived from the active
simulation clock. New ambient animation freezes during pause and reduced
motion. No actor or mission state is changed by drawing a pose.

The presentation reads existing mission flags to make progress visible:

- Recovered-core lights above the steward reflect the current core count.
- Each restored obelisk opens its crown. Restored links illuminate shallow
  inlays and paired solar rings at the Vault of Roots.
- Defeating the Warden reveals calm ground glyphs at the southern ruin.
- An owned home with the completed foothold flag gains a warm recorded-home
  lamp.
- The current nearby interaction gains shallow focus brackets.

These effects are original local geometry. They do not award progress, add
collision, consume simulation randomness or create a save. Their geometry uses
the existing local WebGL and Canvas fallback paths; no shared renderer change,
runtime CDN, remote model, texture or paid service is needed for this update.

## Gameplay and save compatibility

The exact integer economy remains 21.000 starting credits, 10.000 ordinary
mission payment, 100.000 home price and 1,000.000 ship price. The published
ten-rank Pilot progression and free license at completion are retained. The
owned home remains the authority for a strategic checkpoint.

The paired executable comparison now uses published 0.65 as the baseline.
Eight exposed gameplay states match through walking, weather, manual study,
salvage, obelisks, Warden defeat, home purchase and home saving. Actual solid
maps, checkpoint keys and serialized checkpoint bytes match exactly. Library
navigation and presentation state are deliberately absent from that existing
save format.

The existing page-hide handler closed local co-presence transport without a
page-return restoration. A persisted browser-history return now recreates one
same-origin BroadcastChannel for the current world. Repeated return events
do not create duplicate channels; failed sends or channel construction remain
contained. No automatic Internet relay join is added. The current public
build configures no relay; restoring an optional online session is outside
this local channel repair. Returning neither creates a checkpoint nor changes
the player's position, economy, ranks or mission state.

## Executed 0.66 verification

```sh
node --test tests/dynamic-3d/cyber-*.cjs
node tests/recovery-specialist/integration.cjs
```

The Cyber Wars runner passed **29 of 29 entries**. These comprise 18 new
archive/briefing cases, seven lifecycle cases and four existing test programs;
the following
component counts describe their own units and must not be added together as
one assertion total.

| Component | Result | Main coverage |
| --- | --- | --- |
| Archive and briefing | 18/18 test cases | Both reproduced bugs; actual reader, manual, steward, keyboard, touch and modeled controller handlers; physical book routes; canonical text; state-derived effects |
| Focus and page lifecycle | 7/7 test cases | Background modal/guide controls, neutral rearming with suspended callbacks, bounded local channel restoration, failure handling and no automatic online rejoin |
| Existing visual suite | 1,295/1,295 assertions | Geometry, collision containment, simulation isolation, weather, materials, software fallback and modeled GL contracts |
| Field Guide | 14/14 grouped checks | Preserved status IDs, focus, pause, input rearming and controller boundaries |
| Actual Engine instance storage | 14/14 checks | Enabled-attribute backing storage, shader rejection, ordinary/instanced draws and disposal |
| Published executable comparison | 8/8 paired states | Economy, progression, collision maps and exact checkpoint bytes |
| Specialist integration | 40/40 checks | Existing river cargo, rewards, rank and owned-home save behavior, plus its companion Aegis integration |

The final software arrival capture contains 4,511 visible faces, below the
existing 18,000-face cap. This is a geometry count, not a browser frame-rate
measurement. The new route test walks the actual player around the existing
archive posts to all three correct book targets. Geometry checks keep lecterns
within their mounted footprints and verify that rendering leaves input state
unchanged.

These checks run actual runtime handlers in a Node VM with modeled DOM,
Canvas, controller and GL interfaces. They do not establish real hardware
shader behavior, phone/controller compatibility, a complete human campaign
or frame-rate performance. Actual rendered layout, focus and play observations
belong to the enclosing v499 browser review and are reported separately.

### Actual browser observations

The release coordinator exercised normal play in Chrome's software 3D path
at an expanded game-frame size of **1322 × 737**. The steward briefing focused
Continue, held the world still while W was pressed and closed cleanly with P.

The player walked to the physical right-hand lectern and opened **The
Hundred-Credit Roof**. Its native modal was readable; A+ changed the type size,
All readings returned to the catalogue, selecting **The Lake Beneath the
Library** opened that work, and keyboard Right advanced to **The Beetle That
Kept Time**. The player also walked around the archive columns to the actual
archivist prompt and used E to open the catalogue.

The catalogue's Pilot manual action opened the original manual. Next page
enabled Study Rank 1; studying opened the correct **Pilot manual discovered**
briefing with focus on Continue. Credits remained **21.000**, and reopening
the catalogue showed **Pilot Rank 1/10**. P closed the catalogue cleanly and
focused the canvas; Pause then opened the existing field menu.

These observations qualify those rendered keyboard/mouse paths. They do not
establish a full mission chain, home purchase/save playthrough, later Pilot
ranks, phone or physical-controller behavior, native page-cache restoration
or hardware rendering performance. Controller and page-cache boundaries are
covered by the separate modeled lifecycle checks above.

The browser reviewer observed slow travel in the software fallback. A separate
timing reproduction confirmed the inherited frame cap: each rendered frame
advances at most 35 milliseconds of simulation. Six frames spaced 500
milliseconds apart therefore move a walking player 1.071 metres over three
wall-clock seconds; the intended speed remains 5.1 metres per simulation
second, or 8.2 while sprinting. The same cap is present in the published v498
source. This update does not alter movement balance or compensate for low
rendering rates, so software frame rate can still slow the entire simulation.

## Prior release: Cyber Wars 0.65 — Viridia visual world

Prepared November 26, 2026, against the published World Wide Games v497 source
at `53a569bf4b8493e666298d4c702e427e2e14260d`.

### Purpose and source authority

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

### What appears in the district

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

### Compact field HUD and paused guide

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

### Local renderer

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

### Preserved gameplay boundaries

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

### Executed verification

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
