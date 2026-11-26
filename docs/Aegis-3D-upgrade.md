# Aegis Verge 3.1 — Industrial Frontiers

## Articulated combat machines in 3.1

The Vesper Runner and all four hostile classes now use an original polygon kit through Aegis's local mesh/material API. Each class has a different lofted hull, with sloped shoulders, a shaped belly and a tapered prow. The Vesper has an inset dark canopy, open traction belts, visible spoked road wheels, suspension links, rear cooling grilles and bored cannon/exhaust tubes. Skirmishers keep their swept delta profile; Lancers carry a long rail assembly above compact tracks; Bulwarks combine heavy drive units, a turret and separate opening shoulder armor; Wardens retain their elevated command crown, drive pylons and rear reactor.

The authored geometry separates painted armor, metal hardware, rubber belts and tinted canopy surfaces. The material shader supplies different roughness and metal responses. All actor materials remain opaque, so both the software painter and the original-shader fallback can draw the complete machine without depending on transparent glass or a new external asset. The shared engine is unchanged.

Wheel rotation samples distance actually traveled. Player suspension samples existing steering, contact and motion values. Weapon rails and shoulder poses retain the genuine charge/stagger descriptors; player recoil reads the actual muzzle timer, and hostile recovery recoil requires an actual completed firing cycle and its recovery timer. Incoming hit flashes remain separate from outgoing recoil. Calm mode removes continuous wheel motion, suspension movement and recoil displacement while retaining meaningful charge, damage, shield, warning and firing cues. Pause freezes the simulation inputs and every articulated pose.

Battle wear still removes the real right-side outer plate at the established HP threshold. The exposed right conduit and Warden's rear cyan reactor retain their positions and directions. New detail does not regrow a severed Skirmisher exhaust, cover the conduit with an extra armor plate, move an aim direction or change a hit radius. The original pure chassis/silhouette descriptors remain the compatibility path when mesh rendering is absent. A refused mesh allocation draws a bounded primitive instead of making the actor disappear.

### Actor geometry and storage budgets

The sixteen shared mesh objects occupy 61,344 bytes of vertex data. Their identities do not change with HP, animation phase, operation or detail tier. The following counts describe intact base poses; shield, muzzle and wear cues add bounded existing or state-dependent pieces.

| Model | Full draws | Full triangles | Reduced draws | Reduced triangles |
|---|---:|---:|---:|---:|
| Vesper Runner | 40 | 2,656 | 22 | 1,504 |
| Skirmisher | 12 | 688 | 10 | 584 |
| Lancer | 16 | 1,168 | 10 | 808 |
| Bulwark | 17 | 1,160 | 12 | 832 |
| Warden | 20 | 1,112 | 13 | 764 |

Loading all three environments, both detail tiers, every hostile class and all wear stages used 79 of the existing 96 mesh-cache entries and 6,000,480 vertex bytes in the modeled enhanced renderer. The original-shader fallback used 75 entries and 5,914,656 bytes because unsupported atmosphere meshes are skipped. Repeated animated poses did not allocate additional mesh storage; disposal released all owned allocations.

The actual software renderer in the DOM/canvas model submitted 348 draws and 1,866 visible polygons at both 978×550 and 1320×740. A staged final four-hostile Null Crown wave, including two damaged charging Wardens placed visibly ahead, submitted 424 draws and 2,203 visible polygons at 1320×740. These figures qualify geometry growth and wider-view compatibility; they are not hardware, browser FPS or memory measurements.

## Recovered F3D97 and keyboard ownership

The module-only `WorldWideGames_FLAGSHIP_F3D97_V498_MODULE_HANDOFF.zip` has SHA-256 `b5a408ec492144ff3c1d88d2f893e239b68102b641d47135fe603b9dfc2e1f6b`. Its two stated base Git blobs matched the published v498 files exactly: `touch-steering.js` was `529eb13ae9ee5ef82095592c2ae82453261413c7`, and `combat-holds.js` was `9d50c7b93c20b245ead0111c625953ea79d8f3e9`.

Only those two runtime modules and the portable unit test were copied, byte for byte. The new SHA-256 values are `6a9918446aae4cc70a81169686a179bb09acb211c5a5e612f5bdf91d4dc606c5` for touch steering, `1a124e3a00ce58343cd676732ae4fa5e7ce0a79e4d3852592e194ac88e74905b` for combat holds, and `1b269cc4bb0e6d71628f510de5d4aa08af0b2d3d6d2125134e216ff9a2cc4a7a` for the unit test. No historical HTML, catalog, worker or release metadata was imported.

F3D97 observes owned pointer IDs on the document when explicit capture fails or a contact releases outside its original button. Release, cancellation, capture loss, document exit and a missing primary mouse button clear only that pointer's contribution. Independent touch contacts and keyboard holds remain independent. Reset discards old pointer ownership so a stale movement event cannot revive it.

A separate defect reproduced in the canonical game let a held OS keyboard repeat reacquire movement after blur, deliberate resume and cleared controls. The key handler now accepts a repeat only when that action still has keyboard ownership. A release followed by a fresh keydown rearms normally. The same protection covers direction, fire and shield after focus loss, visibility interruption, pause and restart. Existing deliberate resume and gamepad-neutral behavior remain in force.

## Delivered experience

Aegis Verge's existing three-operation vehicle campaign now occupies an authored industrial landscape. Salt Bastion has a supported three-span causeway, moving bridge carrier, working crane and paired turbines. Relay Scar has a large open reactor, pressure vessels and service pipes. Null Crown has paired monumental arrays and a suspended geometric core. A sculpted basin, layered ridges, rock formations, water and the arena's visible foundations provide depth beyond the original combat deck.

The player still drives on the existing flat collision plane. The surrounding land and installations are actual locally generated polygon meshes, with full and reduced geometry tiers. They do not create additional invisible obstacles or pretend to be traversable terrain. All above-ground static installation vertices remain outside the legal ±38-unit driving square. Tall districts also clear the full 15-unit tactical camera boom envelope, so decorative structures cannot swallow the camera near an arena edge. Foundation and basin surfaces beneath the arena remain below gameplay height.

The world responds to actual mission state. Secured relays power installation lights and ground conduits; the active warning changes the corresponding illumination. Turbines, crane trolley, suspended cargo, bridge carrier, reactor and atmosphere observe the game's simulation clock. Pausing freezes that clock. Calm mode freezes continuous environmental motion while retaining meaningful relay and warning states. Existing enemy rigs now use bounded faceted hull, armor and silhouette pieces without changing their real hitboxes or poses.

## Rendering architecture

`games/aegis-verge/environment-mesh.js` provides original mesh generators, static mesh merging, model and normal transforms, and an opt-in local WebGL material program. It preserves the shared engine's existing shader attribute/uniform contract and `cube`, `cubeBatch`, `faceted`, `begin` and `dispose` behavior. The shared `assets/wwg-webgl.js` is unchanged by this work.

The material program adds roughness-dependent highlights, metal tint, hemisphere fill, local relay/weapon illumination, water surface variation, tone mapping, a sun/cloud sky dome and distance/height atmosphere. Ground lighting includes directional occlusion from the actual live cover boxes and soft actor contact footprints. These are bounded analytic shadows, not a shadow-map or ray-traced lighting implementation. Destroyed cover disappears from the lighting input when it disappears from the authoritative cover list. The local enhanced program replaces obsolete rectangular actor shadow geometry where its contact shadows are active.

Static architecture is merged by material into eight meshes per operation. GPU buffers upload once per mesh object and are reused. Shared primitive objects are reused across operations and quality tiers. The local renderer limits its GPU mesh cache to 96 entries and deletes every owned buffer/VAO on disposal. Mesh calls restore the original cube VAO, and translucent steam restores depth writing and blending before existing gameplay draws continue.

If local shader compilation fails, the original shared shader remains usable and opaque environment meshes still render. Unsupported sky/transparent effects are omitted in that tier. Software/slow GPU batching disables the directional shadow loop and caps pixel density. Existing renderer-context recovery continues to replace the bound canvas and require deliberate combat resume.

The local adapter also initializes one inert 80-byte record for the shared cube VAO's enabled instance attributes. Some WebGL drivers require that backing storage even when the shader selects its ordinary, noninstanced path. Initialization happens before the optional shader compile, so rejection still leaves the old renderer usable. The original instance capacity remains zero, allowing the shared batch method to allocate its normal buffer on its first real instanced draw. This bounded fix is confined to Aegis's adapter.

`games/aegis-verge/rendering.js` also accepts the new geometry in its existing clipped Canvas polygon path. The fallback uses reduced meshes, the same world layout, and the established painter ordering. It uses a sky gradient in place of the GPU sky dome.

### Static geometry budgets

These counts describe the new static environment only, excluding the existing combat models, transient effects and a small number of animated world objects.

| Operation | Full-tier triangles | Reduced-tier triangles | Full vertex bytes | Reduced vertex bytes | Static material meshes |
|---|---:|---:|---:|---:|---:|
| Salt Bastion | 22,756 | 3,908 | 1,638,432 | 281,376 | 8 |
| Relay Scar | 24,604 | 3,924 | 1,771,488 | 282,528 | 8 |
| Null Crown | 21,264 | 3,728 | 1,531,008 | 268,416 | 8 |

These are geometry budgets, not measured browser frame-rate claims.

## Latest flagship recovery: F3D96 Signal Forge

This release also incorporates the latest isolated flagship improvement found during reconciliation. The source archive is `WorldWideGames_FLAGSHIP_F3D96_EXACT_F3D95_PATCH.zip`, SHA-256 `770bfc79ae0bf426ad62dec7403f04679e2586fdf5b5601a0507f1daa0cc1666`.

Its `signal-uplink.js` is restored byte for byte, SHA-256 `fd2b79821d6210f14a5b3b253616908059a5d15638fec5673de33b996a57c614`. Its specific rendering, existing status readout and screen-reader announcement changes are merged into the current game shell. The obsolete candidate catalog, cache and project documents are not applied.

Signal Forge gives the existing uplink a faceted pedestal, antenna forks, real 3.6-unit interaction perimeter, and readiness/energy/spent/jam cues. Activation still costs 30 energy, lasts six seconds and is single use per relay. Its presentation predicates use the real activation rules. The original F3D96 unit test is retained under `tests/dynamic-3d/aegis-signal-forge.cjs`, with only its module-relative require path adjusted.

## Gameplay and persistence boundaries

The environment module has no collision, scoring, navigation, enemy, storage or event authority. Existing movement, projectile sweeps, cover damage, Warden behavior, relay capture, Flux course, checkpoints, unlocks, ranked completion and parent platform events remain in their original modules. The retained damaged-save repair, record validation, context recovery, focus pause, input neutrality, deployment consent, compact controls and production debug isolation also remain active. No new visible HUD panels or buttons were added.

The architectural art direction applies the project's quality principles—readable monumental structure, modern infrastructure, distinct materials and state-driven world feedback—to Aegis's own setting. It does not transplant Cyber Wars lore or economy.

## Combat view and field guide

The active cockpit now keeps Hull, Aegis and Hostiles in one compact row. A short directive reflects the real current relay, enemy count, capture percentage or extraction goal. The existing danger selection supplies one visible contextual warning; detailed combat telemetry and the full mission briefing are available through the existing Brief disclosure, now named Field guide. The original 116 element IDs and all ability handlers remain present.

Opening the field guide calls the existing deliberate pause path, releases held controls and focuses its accessible region. Closing the disclosure with Escape leaves combat paused and returns focus to the disclosure control. Resume, or P while reading the guide, closes the disclosure and returns focus to the game canvas. Reading never advances mission time or consumes resources. The existing Pause control is always available during play; Settings contains the existing camera, mute and reduced-effects options. Touch controls retain 44-pixel targets, and the expanded guide scrolls on compact screens.

The complete briefing is copied from the existing launch briefing into a native details disclosure. Secondary statistics retain their actual values and existing IDs inside the guide. The smaller radar, concise objective, contextual warning and reduced lower aiming strip make more of the authored environment visible. These are presentation changes: projectile, movement, collision, damage, save and ranked rules are unchanged.

## Validation

Fresh local checks on the integrated 3.1 source:

- `node tests/dynamic-3d/aegis-combat-rigs.cjs`: 54/54 checks passed for original distinct geometry, finite poses, materials, genuine animation sources, wear/weakpoint preservation, calm/pause behavior, renderer absence/allocation refusal, shared Engine compatibility, bounded storage across every world/tier, wider software views, and unchanged actual simulation/save/event results.
- `node tests/dynamic-3d/aegis-input-lifecycle.cjs`: 34/34 checks passed. The actual old key-repeat ordering defect is reproduced in a counterfixture, then the corrected focus, resume, visibility, restart, fresh press, gamepad and installed pointer paths are verified.
- `node tests/flagship_f3d97_pointer_lifecycle_unit.js`: all 22 unchanged recovered module assertions passed.
- `node tests/dynamic-3d/aegis-world.cjs`: 65/65 checks passed. These cover mesh validity and budgets, arena and camera-envelope exclusion, distinct authored geometry, nonuniform normal transforms, immutable simulation input, state-driven motion/Calm behavior, shader-failure fallback, VAO/blending/depth restoration, resource disposal, and the actual game launch/render/movement/pause paths.
- `node tests/dynamic-3d/aegis-signal-forge.cjs`: 295/295 recovered Signal Forge assertions passed.
- `node tests/dynamic-3d/aegis-instance-storage.cjs`: 14/14 assertions passed using the actual shared Engine and local adapter with a modeled WebGL VAO/storage driver. The fixture reproduces the inherited empty-buffer failure, validates ordinary cube drawing after both shader success and rejection, and verifies subsequent instanced reallocation and custom-mesh VAO restoration.
- `node tests/dynamic-3d/aegis-hud.cjs`: 38/38 checks passed for concise directives and warning text, real HTML grouping and unique IDs, complete briefing copy, 44-pixel control contracts, native summary keyboard access, and the actual deployment, field-guide, pause, Escape, Resume and timer paths in the modeled DOM.
- `node tests/recovery-specialist/integration.cjs`: 40/40 existing recovery integration checks passed.
- All 91 flagship unit programs passed in the fresh complete sweep: the previous 90 plus F3D97. Their existing behavior assertions remain intact. The prior release had already corrected historical version predicates to accept numeric major version 3 and later, and the cache-name predicate to accept the generated 12-hex runtime fingerprint.

The renderer contract checks use a GL API model, and runtime checks use the existing Node VM/DOM/canvas model. They do not substitute for real browser shader compilation, visual composition, control or device testing. The release coordinator owns real-browser visual QA, the final public build/cache registration and publication. The canvas's `data-aegis-materials` and `data-aegis-scene` attributes provide read-only inspection evidence for the active material tier and authored environment.

### Actual Chrome observations

The release coordinator separately exercised the normal Salt Bastion launch in Chrome at a 1322×737 game viewport. Driving with W, steering and firing with Space worked; the Vesper chassis and the Skirmisher/Lancer shapes were visibly distinct. The observed cannon pulses occurred with the player hull intact. The camera option in Settings and P pause also worked.

Opening the platform's Game info and returning through Back to game produced the expected focus pause. Combat required an explicit Resume before continuing. These observations qualify that normal launch, movement/fire, presentation and focus-return flow. They do not establish a complete campaign playthrough, hardware frame rate, WebGL shader tier, native pointer capture-failure recovery or the OS-repeat edge case. The latter two remain covered by the modeled regressions above.
