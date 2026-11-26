# Solstice Wilds — v1.0

Original World Wide Games 3D exploration/action expedition by Architect Industries.

## Playable expedition

A coastal valley connects the southern Dawn Lighthouse, the Western Archive, the Tide Workshop and the northern Solstice Spire. The player controls an articulated explorer carrying a field lantern and pulse instrument.

1. **Western Archive:** read the entrance tablet, then interact with the Sun, Tide and Leaf pillars in the seeded order recorded in the journal. A wrong selection resets the sequence. The completed Archive grants a checkpoint and restores health and sprint energy.
2. **Tide Workshop and bridge:** evade or quiet the workshop sentinels, break wooden crates with pulses, and walk over the golden salvage. Bring four parts to the bridge mechanism on the south riverbank. The Archive must be restored before the bridge can be repaired. Repair spends the parts once, creates the only river crossing, and saves the second checkpoint.
3. **Solstice Spire:** cross north, fight two ranged sentinels and a heavier melee warden, then activate the central armillary. Amber ground warnings announce locked attack targets. Movement and sprinting let the explorer evade strikes. The Spire requires all three guardians defeated and both earlier sites complete.
4. **Return:** carry the restored light back across the bridge and interact at the Dawn Lighthouse. Only this completed return produces a campaign completion. A fresh run submits a score based on restored sites, defeated guardians, recovered salvage, active completion time and remaining health.

The world includes a mesh terrain surface, coastal water and river, textured masonry, arches and columns, procedural vegetation, a timber workshop, an animated observatory, an original animated explorer, guardians with articulated attacks, moving clouds, wind, rain and changing daylight. Rain and wind use the same active simulation clock as combat; pausing, reading and terminal results stop it.

## Controls and accessibility

| Input | Movement | Pulse | Interact | Sprint | Camera / pause |
|---|---|---|---|---|---|
| Keyboard | WASD or arrows; saved remaps also work | Space / mapped primary | E / mapped secondary | Shift | Drag to orbit; P or Escape pauses |
| Touch | Left virtual stick | Pulse button, hold to repeat | Interact button | Hold Sprint | Drag the world to orbit; top pause button |
| Standard gamepad | Left stick | A, hold to repeat | X | B or left trigger | Right stick orbits; Start pauses |

The standard controller must return to neutral after launch, pause or focus interruption before it controls gameplay. Losing focus or hiding the document pauses the expedition and clears held keys, touch pointers and controller state. Keyboard auto-repeat cannot rearm a cleared key; a fresh press is required. Browser modifier shortcuts keep their normal behavior. Multi-pointer touch actions remain held until their last pointer releases. Overlay controls receive focus when they open; hidden overlays have no display or pointer interception.

The game honors the shell's `muted`, `volume`, `motion=reduce` and `contrast=high` URL preferences. A literal volume of zero remains silent. The title options can additionally show touch controls, reduce motion/weather animation or mute this session. The journal records the route and any discovered rune sequence. Local text, health, active objective, interaction prompt, site markers and a compact map provide guidance without a console or debug panel.

## Checkpoints and score integrity

`wwg:solstice-wilds:checkpoint:v1` stores a small, validated checkpoint only when a site is completed. It contains the seed, completed site flags, rune-reading state, carried salvage, crate states, defeated guardian IDs, earned score and active time. It excludes transient attacks, current injury and arbitrary object data. Completed dependencies and salvage accounting are validated before restore.

Restore preserves collected crates and defeated enemies, preventing resource duplication. Retry returns to the last completed boundary with a full lantern. Both checkpoint restore and retry are explicitly **expedition practice** and omit scores from the terminal message. A new expedition resets the world and requires confirmation before replacing an existing checkpoint. Finishing removes the checkpoint when storage permits. Malformed, oversized and denied storage are handled without breaking gameplay.

Only `campaign-complete` on a fresh completed run carries a numeric score. Partial milestones, attacks, deaths, retries and restored practice completions never submit scores. Terminal completion is emitted once per run.

## Integration contract

Public entry: `games/solstice-wilds/index.html`
Cover: `covers/solstice-wilds.svg`
Version: `1.0`
Modes: `Solo`
Suggested genres: `3D`, `Exploration`, `Adventure`, `Action`, `Puzzle`, `Combat`
Suggested accent: `#b6dcac`
Score metadata: `{unit:'pts', direction:'high', label:'Expedition score'}`

The iframe publishes same-origin messages with `type: 'wwg:game-event'`, `game: 'solstice-wilds'` and these event names:

| Event | Meaning | Catalog rule |
|---|---|---|
| `archive-restored` | Correct ordered rune sequence completed | Milestone |
| `bridge-repaired` | Archive restored and four parts spent on the crossing | Milestone |
| `spire-restored` | Three Spire guardians defeated and armillary activated | Milestone |
| `campaign-complete` | All three sites restored and player returned to lighthouse | Completion and milestone |

`campaign-complete` includes active `duration` and a detail object with site count, practice/fresh status and damage taken. Its numeric `score` is present only for a fresh eligible run.

## Implementation and verification

`model.js` is deterministic and DOM-free. It bounds foreground catch-up to 0.25 seconds and subdivides simulation into steps no larger than 1/60 second. Movement uses swept small substeps against river boundaries, foundations, columns, pillars, tree trunks, crates and world bounds. The renderer imports the root-owned shared Three.js r187 foundation; the software tier renders the same meshes with lower terrain/prop detail and nearby culling.

The starting orbit looks past the lighthouse. A raycast against actual terrain, landmarks, rocks and tree geometry shortens the follow camera when a solid object would hide the explorer, including during later orbit changes. Transparent clouds, water effects and light beams do not pull the camera forward.

`tests/dynamic-3d/solstice-model.cjs` covers seeded state, bounded movement, collision boundaries, stamina, rune discovery/order/reset, actual crate damage/pickup, pulse occlusion, repair prerequisites, telegraphed attacks and dodging, projectiles, death, paused clocks, final prerequisites, one-time score delivery, checkpoint resource preservation, practice retries and malformed/denied storage. Its end-to-end case drives the real movement/action model through the complete route and wins without setting progression flags or injecting resources.

The modeled-runtime input suite, `tests/dynamic-3d/solstice-input.cjs`, executes the real game handlers with a modeled DOM and the real deterministic game model. It covers sustained keys/pulses, interaction edges, interruption clearing, keyboard shortcuts, controller edges and neutral rearming, touch cancellation and multiple pointers, camera drag bounds, pause/journal transitions and saved remaps. It adds no debug hooks to the shipped game.

`tests/dynamic-3d/solstice-scene.cjs` uses actual Three geometry and the shared software projection pipeline with modeled canvas drawing. Its four cases check that the follow camera clears the lighthouse, ruins, workshop, trees and terrain; that representative software views stay within 3,000 visible triangles; and that coastal ocean triangles remain outside the inland traversal surface. The ocean geometry was corrected after desktop review found it painting over inland terrain. These modeled geometry checks do not measure browser frame rate or claim pixel verification.

Fresh verification is run with `node --test tests/dynamic-3d/solstice*.cjs`. The three ES-module source files also pass Node syntax checks. The SVG cover parses as valid XML. These checks are separate from real-browser visual/play evidence.

The final focused suites pass **33/33 test cases**: 20 deterministic model, nine modeled-runtime input and four scene/camera cases.

### Desktop browser verification

The release coordinator reviewed cloud Chrome with software 3D rendering in a 978×550 game frame. The corrected spawn camera and ocean geometry left the explorer and ground clearly visible. Actual play reached the Archive, read the Leaf → Sun → Tide clue, attuned the three pillars in that order and received the Archive-restored checkpoint plus the next workshop objective. Reloading and selecting Continue restored stage 2 with CHECKPOINT PRACTICE. Journal opening/closing and P pause were also verified.

That observation covers the recorded desktop route and restore behavior. The deterministic model test separately completes the whole expedition. This review does not establish a complete browser-played campaign, hardware frame rate, physical controller or mobile-device qualification. The deployed source identity is recorded by the production `release.json` after publication.
