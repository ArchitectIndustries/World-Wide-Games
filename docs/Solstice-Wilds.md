# Solstice Wilds — v1.1

Original World Wide Games 3D exploration/action expedition by Architect Industries.

## Playable expedition

A coastal valley connects the southern Dawn Lighthouse, the Western Archive, the Tide Workshop and the northern Solstice Spire. The player controls an articulated explorer carrying a field lantern and pulse instrument.

1. **Western Archive:** read the entrance tablet, then interact with the Sun, Tide and Leaf pillars in the seeded order recorded in the journal. A wrong selection resets the sequence. The completed Archive grants a checkpoint and restores health and sprint energy.
2. **Tideworks restoration:** evade or quiet the workshop sentinels, break wooden crates with pulses, and walk over the golden salvage. Install four parts at the counterweight bench on the workshop’s south side. At the river, turn the separate three-position sluice dial to the **first rune in the Archive inscription**, then operate the bridge winch. The waterwheel turns, a counterweight descends, and two raised bridge leaves lower over 3.6 seconds of active simulation. Their locks must engage before collision permits the crossing. The installation consumes the parts once; the completed crossing awards the site and saves the second checkpoint.
3. **Solstice Spire:** cross north, fight two ranged sentinels and the bronze-plated warden, then activate the central armillary. Sentinel ground rings announce their targets. The warden guards its core, marks a locked-direction charge lane for 1.35 seconds, and commits to the charge. Walk or sprint sideways out of its lane. A missed charge or collision with cover overextends it, opening the plates for a 2.05-second recovery window; pulse the exposed core. A charge that connects keeps the plates closed during its shorter reset. Stationary pulse damage racing cannot defeat it on an open approach. The Spire requires all three guardians defeated and both earlier sites complete.
4. **Return:** carry the restored light back across the bridge and interact at the Dawn Lighthouse. Only this completed return produces a campaign completion. A fresh run submits a score based on restored sites, defeated guardians, recovered salvage, active completion time and remaining health.

The world includes a mesh terrain surface, coastal water and river, textured masonry, arches and columns, procedural vegetation, a timber workshop, a waterwheel and sluice, a counterweight gantry, an animated observatory, an original articulated explorer, moving clouds, wind, rain and changing daylight. Restored ground conduits and path beacons connect the Archive, workshop, crossing and Spire; after the Spire is restored, a light trail leads back to the lighthouse. The mechanism’s moving geometry reads the same state that controls the crossing’s collision. Decorative motion, weather, attacks and mechanism timers use active model time; pausing, reading and terminal results stop them.

## Controls and accessibility

| Input | Movement | Pulse | Interact | Sprint | Camera / pause |
|---|---|---|---|---|---|
| Keyboard | WASD or arrows; saved remaps also work | Space / mapped primary | E / mapped secondary | Shift | Drag to orbit; P or Escape pauses |
| Touch | Left virtual stick | Pulse button, hold to repeat | Interact button | Hold Sprint | Drag the world to orbit; top pause button |
| Standard gamepad | Left stick | A, hold to repeat | X | B or left trigger | Right stick orbits; View opens journal; Start pauses |

The standard controller must return to neutral after launch, pause or focus interruption before it controls gameplay. Losing focus or hiding the document pauses the expedition and clears held keys, touch pointers and controller state. Keyboard auto-repeat cannot rearm a cleared key; a fresh press is required. Browser modifier shortcuts keep their normal behavior. Multi-pointer touch actions remain held until their last pointer releases. Overlay controls receive focus when they open; hidden overlays have no display or pointer interception.

Controller overlays use D-pad or left-stick navigation, A to activate the focused button/checkbox, and B to go back. The same flow reaches title options, pause journal, restart confirmation, results and return to title. Confirmation initially focuses the safe cancel choice. Focused options scroll into view in short frames. Active-device prompts show A/X and stick controls after controller activity, then return to saved keyboard labels after keyboard input. Held navigation repeats after a delay; confirm and interaction remain edge-triggered.

When a browser retains the page in its back/forward cache, the expedition pauses and cancels its animation loop while retaining the world, renderer and resize observer. A persisted return resets the frame-time baseline and schedules one drawing loop, leaving gameplay paused until explicit resume. Cleared keys require a fresh press and controllers require neutral again. Repeated lifecycle events cannot duplicate loops or disposal. A non-persisted exit performs the full resource teardown once.

The game honors the shell's `muted`, `volume`, `motion=reduce` and `contrast=high` URL preferences. A literal volume of zero remains silent. The title options can additionally show touch controls, reduce motion/weather animation or mute this session. Reduced motion suppresses decorative wheel rotation and windup shaking and makes warnings steady; essential bridge deployment and committed enemy movement remain visible. The journal records the route, discovered rune sequence and the Tideworks operation. Local text, health, active objective, contextual machinery state, site markers, a compact map and a text/shape/pose warden warning provide guidance without a console or debug panel.

## Checkpoints and score integrity

`wwg:solstice-wilds:checkpoint:v1` retains schema 1 and stores a small, validated checkpoint only when a site is completed. It contains the seed, completed site flags, rune-reading state, counterweight installation and sluice setting, carried salvage, crate states, defeated guardian IDs, earned score and active time. It excludes transient attacks, current injury and arbitrary object data. Completed dependencies and salvage accounting are validated before restore. Installing parts or turning the dial does not create an extra strategic checkpoint: retry returns to the last completed site.

Existing v1.0 checkpoints have no machinery field. Validation derives the installed counterweight and correct locked setting for an already restored bridge; that bridge remains traversable, without spending parts or awarding its score again. Earlier Archive saves retain their unspent parts and begin with the sluice closed. Continued and retried runs remain practice. Malformed machinery state and inconsistent spent-part accounting are rejected.

Restore preserves collected crates and defeated enemies, preventing resource duplication. Retry returns to the last completed boundary with a full lantern. Both checkpoint restore and retry are explicitly **expedition practice** and omit scores from the terminal message. A new expedition resets the world and requires confirmation before replacing an existing checkpoint. Finishing removes the checkpoint when storage permits. Malformed, oversized and denied storage are handled without breaking gameplay.

Only `campaign-complete` on a fresh completed run carries a numeric score. Partial milestones, attacks, deaths, retries and restored practice completions never submit scores. Terminal completion is emitted once per run.

## Integration contract

Public entry: `games/solstice-wilds/index.html`
Cover: `covers/solstice-wilds.svg`
Version: `1.1`
Modes: `Solo`
Suggested genres: `3D`, `Exploration`, `Adventure`, `Action`, `Puzzle`, `Combat`
Suggested accent: `#b6dcac`
Score metadata: `{unit:'pts', direction:'high', label:'Expedition score'}`

The iframe publishes same-origin messages with `type: 'wwg:game-event'`, `game: 'solstice-wilds'` and these event names:

| Event | Meaning | Catalog rule |
|---|---|---|
| `archive-restored` | Correct ordered rune sequence completed | Milestone |
| `bridge-repaired` | Counterweight installed, correct flow selected, and bridge leaves fully locked | Milestone |
| `spire-restored` | Three Spire guardians defeated and armillary activated | Milestone |
| `campaign-complete` | All three sites restored and player returned to lighthouse | Completion and milestone |

`campaign-complete` includes active `duration` and a detail object with site count, practice/fresh status and damage taken. Its numeric `score` is present only for a fresh eligible run.

Counterweight, sluice, deployment and warden feedback events stay internal. They do not add platform milestones or scores. The four existing platform event names are unchanged.

## Implementation and verification

`model.js` is deterministic and DOM-free. It bounds foreground catch-up to 0.25 seconds and subdivides simulation into steps no larger than 1/60 second. Movement uses swept small substeps against river boundaries, foundations, columns, pillars, tree trunks, crates and world bounds. The renderer imports the root-owned shared Three.js r187 foundation; the software tier renders the same meshes with lower terrain/prop detail and nearby culling.

The starting orbit looks past the lighthouse. A raycast against actual terrain, landmarks, rocks and tree geometry shortens the follow camera when a solid object would hide the explorer, including during later orbit changes. Transparent clouds, water effects and light beams do not pull the camera forward.

`tests/dynamic-3d/solstice-model.cjs` covers seeded state, bounded movement, collision boundaries, stamina, rune discovery/order/reset, actual crate damage/pickup, pulse occlusion, physical machinery prerequisites and timing, telegraphed attacks and dodging, projectiles, death, paused clocks, final prerequisites, one-time score delivery, checkpoint resource preservation, v1.0 migration, practice retries and malformed/denied storage. It reproduces the former stationary warden damage-racing approach and verifies that guarded pulses cannot win; a separate case demonstrates a normal walking dodge and its damage window. Its end-to-end case drives the real movement/action model through the complete upgraded route and wins without setting progression flags or injecting resources.

The modeled-runtime input suite, `tests/dynamic-3d/solstice-input.cjs`, executes the real game handlers with a modeled DOM and the real deterministic game model. It covers sustained keys/pulses, interaction edges, interruption clearing, keyboard shortcuts, controller edges and neutral rearming, complete controller overlay flows and active-device prompts, touch cancellation and multiple pointers, camera drag bounds, pause/journal transitions and saved remaps. Keyboard, touch and controller each operate the complete machinery sequence through the actual input handlers, including protection against repeated installation or held valve interactions. Its page-cache regression follows persisted hide/show cycles, checks frozen time and position, retained resources, explicit resume, fresh/neutral input, a single pending animation callback and one-time final teardown. It adds no debug hooks to the shipped game.

`tests/dynamic-3d/solstice-scene.cjs` uses actual Three geometry and the shared software projection pipeline with modeled canvas drawing. Its five cases check that the follow camera clears the lighthouse, ruins, machinery, trees and terrain; that representative software views at 1000×600 and 1320×720 camera aspects stay within 3,000 visible triangles; that both bridge leaves, counterweight and collision agree through deployment/pause/lock; and that coastal ocean triangles remain outside the inland traversal surface. The ocean geometry was corrected during v1.0 after desktop review found it painting over inland terrain. These modeled geometry checks do not measure browser frame rate or claim pixel verification.

Fresh verification is run with `node --test tests/dynamic-3d/solstice*.cjs`. The three ES-module source files also pass Node syntax checks. The SVG cover parses as valid XML. These checks are separate from real-browser visual/play evidence.

The current focused suites pass **41/41 test cases**: 23 deterministic model, 13 modeled-runtime input and five scene/camera cases. Running those together with `tests/dynamic-3d/scene-renderer.test.cjs` passes **47/47**, including the six shared renderer cases. This is executed local evidence for the v1.1 source; production identity and actual browser qualification belong to the integrated release report.

### Browser evidence boundary

The earlier v1.0 release coordinator reviewed cloud Chrome with software 3D rendering in a 978×550 game frame. The corrected spawn camera and ocean geometry left the explorer and ground clearly visible. Actual play reached the Archive, read the Leaf → Sun → Tide clue, attuned the three pillars in that order and received the Archive-restored checkpoint plus the next workshop objective. Reloading and selecting Continue restored stage 2 with CHECKPOINT PRACTICE. Journal opening/closing and P pause were also verified.

For v1.1, the release coordinator also performed normal play in cloud Chrome with software 3D rendering, initially in a **1322×737 expanded frame** and later **1322×706** after the shell’s status message appeared. Continue loaded the real v1.0 Archive checkpoint as practice. The player walked to the workshop, pulsed crates and sentinels, collected four parts, installed the counterweight, selected the recorded Leaf rune at the sluice, and operated the winch.

During bridge lowering, the player paused and switched the shell between **978×550 standard view and the 1322-pixel expanded view**. The same running expedition retained its paused deployment state. After resuming, the bridge locked, the checkpoint was saved, and the player walked north across it. The shell’s expanded view, Game info and Back to game controls were also observed to preserve the running game.

At the Spire, the player reached the warden, observed **CHARGE MARKED → WARDEN CHARGING**, moved sideways out of the lane, and then saw **CORE EXPOSED** and the “Charge evaded” feedback. Pulses visibly damaged the exposed warden. This bounded browser observation establishes the played machinery, view-switch continuity, legacy continuation and encounter response; it does **not** claim a complete browser-played v1.1 campaign win. The deterministic model test separately completes that campaign.

Measured hardware frame rate, physical controller qualification and real mobile-device qualification remain outside this evidence. The deployed source identity is recorded by production `release.json` after publication.
