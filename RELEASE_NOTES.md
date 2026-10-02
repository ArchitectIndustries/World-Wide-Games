# WorldWideGames v40 — Astral Menagerie 3.0

Released 2026-10-02 by Architect Industries.

Astral Menagerie now continues after the first Atlas clear. Every habitat gains a visible field-study node with a distinct one-time attunement reward. Completing the Atlas unlocks Constellation trainer rematches; clearing a trainer rematch unlocks that habitat's higher-level Ascendant Warden. Rematches and Ascendants award persistent Starlight, and complete mastery emits durable achievement events.

The v3 save/meta schema migrates compatible v2 records, preserves the four-creature party/reserve system and five elemental techniques, and adds persistent habitat-study, rematch, Ascendant, Starlight, and mastery records. Three platform achievements—Habitat Scholar, Constellation Challenger, and Ascendant Atlas—bring the platform to 113 unique achievements. Astral Menagerie becomes the featured release/PWA shortcut and offline caching advances to `wwg-v40`.

Validation includes a deterministic full Atlas + post-Atlas mastery path, v2 migration, all three habitat study rewards, all three trainer rematches, all three Ascendant Wardens, Starlight persistence, mobile-width layout, plus the carried-forward full-catalog runtime/boot/HTTP/control gates.

---

# WorldWideGames Release Notes

## v39 — Ironlight Breach 3.0

WorldWideGames v39 keeps the catalog at **72 games / 120 genre tags / 46 remappable releases** and raises achievement coverage to **110 unique achievements** while rebuilding the software-raycast FPS flagship.

- Expanded Ironlight Breach from three to **five authored sectors**.
- Added the **Arc Lance**, a third limited-ammo weapon with long-range three-target piercing and electronic disruption.
- Added ranged **Sentry** enemies and world-space projectile pressure.
- Added cumulative-secret **cipher doors** and two optional cipher vault routes.
- Added complete retry checkpoints covering score, secrets, vaults, arsenal and ammo.
- Added v3 durable discovery records with backwards v2 meta read compatibility.
- Added visible first-person weapon silhouettes and muzzle flash.
- Added **Arc Lancer** and **Cipher Diver** achievements and corrected the duplicate Ashen achievement id.
- Featured/PWA shortcut moves to Ironlight Breach; offline cache advances to `wwg-v39`.
- Full release QA remains green: 72/72 runtime-clean, 72/72 boot, 151/151 HTTP paths, 72/72 control pages, 46/46 remappable profiles, plus deep campaign regressions.
- GitHub `main` synchronization remains blocked by the current connector safety path; v39 is packaged but not claimed fully shipped to `main`.

## v38 — Polyforge Studio 3.0

v38 keeps the catalog at **72 games / 120 genre tags / 46 remappable releases**, raises achievement coverage to **108**, and substantially deepens the 3D-design flagship instead of adding a shallow catalog entry.

### Polyforge Studio 3.0

- Added true multi-selection with Shift-click and group-aware selection behavior.
- Added persistent grouped assemblies plus Group/Ungroup controls and group-preserving duplication.
- Added Move, Rotate, and Scale gizmo modes with direct pointer-drag transforms on selected objects or assemblies.
- Selection-wide keyboard/touch transforms now move the entire active assembly while preserving snap behavior.
- Added portable scene-code Export/Import with validation, full scene/group/progression state, and undoable imports.
- Doubled undo/redo history from 40 to **80 edits**.
- Added v2 scene/meta migration into the v3 persistence keys.
- Expanded the authored certification campaign from five to **seven briefs** with **Modular Gate** and **Constellation Pavilion**.
- Preserved the original five-brief `studio-mastered` milestone and added the new seven-brief `studio-architect` completion event.
- Refreshed local cover art, featured placement, PWA shortcut, and offline cache `wwg-v38`.

### Platform

- Added **Polyforge Architect** and **Assembly Theory** achievements for **108 total**.
- Catalog/remapping counts remain **72 games / 120 genre tags / 46 remappable releases**.

### QA

- New `tests/v38_polyforge.py` validates grouping, selection-wide transforms, real pointer-drag gizmo movement, scene-code round-trip, 80-step history cap, all seven authored briefs, compatibility with the original five-brief mastery milestone, persistence/meta, and mobile layout.
- New `tests/v38_static.py` validates catalog totals, featured/version metadata, achievement totals, cache/manifest/release-history state, cover metadata, and public-branding hygiene.
- 72/72 runtime-clean, 72/72 smoke boot, 151/151 local HTTP paths, 72/72 detail control pages, and 46/46 remappable profiles remain green.
- Ashen Covenant, Astral Menagerie, Verdant Echoes, Ironlight Breach, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, correctness, and score-direction regressions remain green.

## v37 — Ashen Covenant 2.0

v37 keeps the catalog at **72 games / 120 genre tags** and spends the release on turning Ashen Covenant from a short boss rush into a longer traversal-and-boss action RPG.

### Ashen Covenant 2.0

- Three pre-boss traversal paths: **Charred Causeway**, **Cinder Cloister**, and **Dawnless Court**.
- Three Ember Sigils per path plus a clear-all-path-foes requirement before the Lord gate opens.
- Three non-boss enemy classes: Hounds, Pilgrims, and ranged Ash Archers.
- Dual weapon loop: fast Emberblade and long-range Ash Pike, each with light/heavy stamina, reach, and damage identities.
- Ember Shrine progression with persistent three-tier weapon forging and maximum-Vigor binding.
- Distinct Bell, Cross, and Sun Covenant Lord attack patterns.
- Active pilgrimage autosave for stage/phase/Ash/weapon/tiers/Vigor/sigils/defeated foes.
- Durable lifetime meta for clears, best score, Lords defeated, death-mark recoveries, and upgrades.
- Death marks retain the original deliberate leave-and-return recovery identity without erasing path progression.
- Refreshed cover art, featured placement, Long Campaigns inclusion, PWA shortcut, and offline cache `wwg-v37`.

### Platform

- Added **Covenant Pilgrim** and **Ash Reclaimer** achievements for **106 total**.
- Catalog/remapping counts remain **72 games / 120 genre tags / 46 remappable releases**.

### QA

- New deterministic Ashen regression validates traversal gating, all three enemy archetypes, Blade/Pike identities, forging, all three Lord patterns, death-mark recovery mastery, persistence, complete pilgrimage events/meta, and mobile overflow.
- 72/72 runtime-clean, 72/72 smoke boot, 151/151 local HTTP paths, 72/72 detail control pages, and 46/46 remappable profiles remain green.
- Astral Menagerie, Verdant Echoes, Ironlight Breach, Polyforge Studio, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions remain green.

## v36 — Astral Menagerie 2.0 — 2026-10-02

WorldWideGames v36 keeps the catalog at **72 games / 120 genre tags / 46 remappable releases** and raises achievement coverage to **104** while substantially deepening Astral Menagerie.

### Astral Menagerie 2.0

- Expanded the original ten-species roster to **15 original Astral species** across Ember, Grove, Tide, Storm, and Stone families.
- Added a four-creature field party plus persistent reserve captures and out-of-battle reserve swapping.
- Added explicit **mid-battle party switching** with automatic healthy-party fallback after a knockout.
- Added five type techniques: **Scorch**, **Snare**, **Mend**, **Static**, and **Guard**, including persistent turn effects, healing, interruption, and damage mitigation.
- Added one named two-Astral **trainer gauntlet per habitat**.
- Added habitat field quests requiring two wild resolutions plus the trainer victory before each Warden unlocks.
- Added v1-save migration into the v2 autosave schema plus durable lifetime clears, best score, trainer victories, and Codex mastery.
- Added standardized `trainer-defeated`, `trainer-triad`, `habitat-quest-complete`, `habitat-mastered`, `codex-master`, and existing Atlas/capture events.
- Added **Trainer Constellation** and **Living Atlas** achievements.
- Promoted Astral Menagerie to the featured release and PWA shortcut; offline cache advances to `wwg-v36`.
- Refreshed local vector cover art for the 2.0 party-quest identity.

### QA

- Dedicated `tests/v36_astral.py` validates 15-species architecture, party/reserve behavior, switching, Scorch and Mend technique behavior, v1 capture compatibility, Codex mastery, all three trainer gauntlets, all three habitat quests, all three Wardens, Atlas completion, autosave/meta, and 390×844 overflow.
- `tests/v36_static.py` validates 72 games, 120 genres, 104 achievements, 46 remappable releases, sole featured Astral Menagerie 2.0, `wwg-v36`, manifest shortcut, release history, cover metadata, and public-branding hygiene.
- Full catalog/runtime/HTTP/control/remapping gates plus Verdant, Ironlight, Polyforge, Rune Depths, long-form, Fluxward/Circuit, v27 correctness, and score-direction regressions remain green.

## v35 — Verdant Echoes 2.0

v35 keeps the catalog at **72 games / 120 genre tags**, raises achievements to **102**, and spends the release on a deeper connected action-adventure campaign rather than another shallow catalog addition.

### Verdant Echoes 2.0

- Added the connected **Rootvault** dungeon, unlocked after collecting two Echo Relics in Echo Grove.
- Added **Rootkeeper Mira** and a three-Moon-Seed quest that persists through the campaign save.
- Added permanent equipment progression: **Moonsteel** doubles sword damage; **Barkguard Charm** raises maximum health from 5 to 7.
- Enemy roster now includes Briars, Crawlers, and ranged Wisps with projectile attacks.
- Added the **Hollow Stag** dungeon boss and Rootsigil requirement before the existing Thorn Regent finale.
- Bombs retain cracked-wall utility and now also damage enemies/bosses.
- Added active-campaign autosave/resume plus durable best score, campaign clears, Rootvault clears, and quest-completion records.
- Death respawns inside the current campaign area while retaining progression.
- Added standardized quest/seed/Rootvault/forging/equipment/relic/campaign events.

### Platform

- Added **Rootvault Warden** and **Moonsteel Oath** achievements for **102 total**.
- Added Verdant Echoes to the **Long Campaigns** collection.
- Verdant Echoes becomes the sole featured release and PWA shortcut.
- Offline cache advances to `wwg-v35`.
- Catalog/remapping counts remain **72 games / 120 genre tags / 46 remappable releases**.

### QA

- New deterministic Verdant regression validates the complete two-area quest/equipment/boss arc, active autosave contents, meta progression, double Moonsteel damage, legacy bomb/dash behavior, and 390×844 mobile overflow.
- 72/72 runtime-clean, 72/72 smoke boot, 151/151 local HTTP paths, 72/72 detail control pages, and 46/46 remappable profiles remain green.
- v32 six-flagship mechanic/remap tests pass; the inherited Ironlight ammo assertion was updated for its v34 rifle/scattergun ammo object.
- Ironlight, Polyforge, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions remain green.

## v34 — Ironlight Breach 2.0

v34 keeps the catalog at **72 games / 120 genre tags** and spends the release on a deeper first-person campaign upgrade plus a QA hardening pass.

### Ironlight Breach 2.0

- Three sectors expand from the original 16×16 layouts to **19×18** authored combat spaces.
- Added a two-weapon loop: precision **Ironlight rifle** plus close-range multi-target **scattergun**, with keyboard and touch switching.
- Added keycards and sealed doors with automatic approach interaction.
- Added two optional secret caches per sector plus ammo and med-gel recovery pickups.
- Sentinel roster expands to distinct **Guard, Brute, and Drone** classes with different durability, speed, pressure, and silhouettes.
- Added persistent local best score, campaign clears, and lifetime secret-cache finds.
- Fixed the retry path so a death/restart returns to the same sector and restores the sector-entry score instead of advancing or permitting score farming.
- Refreshed cover art, featured placement, PWA shortcut, and offline cache to `wwg-v34`.

### QA

- New reachability gate proves every core, exit, keycard, sealed door, scattergun, secret cache, ammo pickup, and med-gel pickup is reachable in all three sectors while respecting keycard gating.
- Direct Chromium validation covers rifle ammo, keycard-door consumption, scattergun multi-target damage, Drone sector presence, secret persistence/recovery rewards, retry semantics, campaign meta persistence, event emission, and 390×844 mobile overflow.
- 72/72 runtime-clean, 72/72 smoke boot, 151/151 local HTTP paths, 72/72 detail control pages, and 46/46 remappable profiles remain green.
- The v32 remap regression was hardened against a Neon Serpent animation-loop timing race and passes deterministically.
- Polyforge, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions remain green.

## v33 — Polyforge Studio 2.0

v33 keeps the catalog at **72 games / 120 genre tags** and spends the release on making the 3D design flagship meaningfully deeper instead of adding another thin title.

### Polyforge Studio 2.0

- Five distinct materials with material-colored 3D rendering.
- Selectable 0.25 / 0.50 / 1.00 grid snapping.
- Object rotation, scaling, X/Y/Z movement, duplicate, and delete.
- 40-step undo/redo history with keyboard shortcuts.
- Autosaved scene/campaign state plus explicit Save/Load.
- Certification campaign expanded from three count-only briefs to **five** briefs with spatial, material, transform, and layout requirements.
- Persistent best score, highest blueprint, and mastery count.
- Refreshed cover, sole featured placement, and PWA shortcut.

### QA

- All five certifications completed in deterministic Chromium coverage.
- 72/72 runtime-clean, 72/72 smoke boot, 151/151 local HTTP paths.
- 72/72 control pages and 46/46 remappable profiles remain green.
- Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions remain green.

## v32 — Flagship Genre Expansion

WorldWideGames v32 raises the quality/depth emphasis by adding six original games aimed at major genre families requested for the platform. These are genre-inspired experiences with original identities, worlds, code, art, mechanics, and names rather than copies of protected franchises.

### New flagship releases

- **Ironlight Breach 1.0** — three-sector software-raycast FPS with core recovery, sentinel combat, extraction, mouse look, touch, and remapping.
- **Verdant Echoes 1.0** — top-down fantasy action-adventure with sword, dash, bombs, cracked passages, four relics, and Thorn Regent finale.
- **Ashen Covenant 1.0** — stamina-based three-Lord action RPG with dodge i-frames, heavy/light attacks, flasks, persistent Ash, and deliberate death-mark recovery.
- **Astral Menagerie 1.0** — ten-species creature-collection RPG with type matchups, capture, leveling, four-creature party, three habitats, and Wardens.
- **Polyforge Studio 1.0** — browser 3D design/construction game with primitives, projection, selection/transforms, orbit/zoom, scene persistence, and three blueprint certifications.
- **Neon Serpent: Gridfall 1.0** — three-contract serpent arcade with combo scoring, drones, relay portals, phase ability, persistent unlocks, and local bests.

### Platform

- Catalog: **72 games / 120 genre tags**.
- Achievements: **100**.
- Shared remapping: **46 games**.
- Added **Flagship Worlds** collection.
- Ironlight Breach is the featured release and PWA shortcut.
- Offline cache advances to `wwg-v32`.

### QA

- 72/72 game boot smoke.
- 72/72 isolated Chromium runtime-clean.
- 151/151 local HTTP paths.
- 72/72 detail control lists and 46/46 remappable keyboard profiles.
- Six-game focused mechanics test and six-game custom remap test pass.
- Prior Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, and score-direction regressions pass.

## v31 — Rune Depths Mastery Pass

WorldWideGames v31 keeps the catalog at **66 games / 106 genre tags**, raises achievements to **94**, and deepens Rune Depths into a more persistent, replayable five-floor roguelite campaign.

### Rune Depths 2.1

- Active delves now autosave locally after meaningful actions and resume on the exact saved tile, floor, relic state, enemies, sigils, score, potions, and phase after a reload.
- Run saves are deliberately separate from durable meta progression; completing a run, dying, or explicitly starting fresh clears the active run without deleting best score, clear count, best depth, or mastery records.
- Added three pure relic mastery paths: **Heart Rune**, **Edge Rune**, and **Flask Rune**. A mastery requires choosing the same relic family at all four between-floor choices and clearing all five depths.
- Added persistent three-path mastery tracking plus path-specific completion events and a final triple-mastery event.
- Added four achievements: **Heartbound Delver**, **Edgeforged Delver**, **Flaskbound Delver**, and **Triune Delver**.
- Combat pacing is fairer without removing danger: authored enemy counts now rise from 4 to 8 across the five depths, enemies only pursue within a bounded aggro radius, at most one incoming enemy hit can land per player turn, sigils restore health, and Heart Rune provides stronger sustain.
- Heart Rune now grants +2 maximum HP, heals 4, and grants a potion; Heart-aligned sigil pickups restore an extra point of health.
- The cover has been refreshed around the new **Delve • Forge • Master** identity.

### Validation

- Completed **three full five-depth clears** through the real dungeon loop and real enemy populations: one pure Heart build, one pure Edge build, and one pure Flask build.
- Verified exact-position autosave/resume, completion/death save cleanup, corrupt-save recovery, persistent mastery meta, path events, and triple-mastery completion.
- Full-catalog release gates remain green: **66/66 runtime-clean**, **66/66 smoke boot**, and **139/139 HTTP paths**.
- v30 explicit-control regressions, v29 long-form campaigns/remapping, v28 direct-game regressions, v27 defect fixes, and v26 score-direction semantics remain green.

## v30 — Pulsevine Expansion & Explicit Controls

WorldWideGames v30 keeps the catalog at **66 games / 106 genre tags**, raises achievements to **90**, and turns a user-favorite title into a larger progression game while making control instructions explicit platform-wide.

### Pulsevine Parkour 2.0

- Five distinct courses replace the original single rooftop circuit.
- New mechanics include launch pads, crosswind zones, longer checkpoint chains, denser thorn timing, and progressively harder elevation changes.
- Persistent local course unlocks and per-course best times.
- Five-course best-total scoring and a `campaign-complete` event.
- Safer post-checkpoint respawns with actual run-up space after falls.
- Exact keyboard controls: **A/D or Left/Right move; Space/Up jump; R restart; 1-5 select unlocked courses; N advances after a clear**. Gamepad and touch actions are also listed explicitly.

### Explicit controls everywhere

- Game-detail pages now render a dedicated current keyboard-map panel on every remappable title.
- The panel names **Up, Down, Left, Right, Primary, Secondary** and their current keys, with **W/A/S/D, Space, E** shown as defaults.
- Authored control lines automatically expand abstract action labels with the concrete key mapping.
- All 66 games retain their title-specific pointer/touch/gamepad/keyboard instructions.

### Validation

- Pulsevine: **5/5 courses** passed real-physics reachability plus keyboard input/course-selection tests.
- Control UI: **66/66 game detail pages** render control instructions; **40/40 remappable titles** render explicit keyboard profiles.
- Full catalog: **66/66 runtime-clean**, **66/66 smoke boot**, **139/139 HTTP paths**.
- v29 long-form, v28 direct game/events, v27 defect fixes, remapping, and score-direction regressions remain green.

## v29 — Long-Form Depth Pass

WorldWideGames v29 keeps the catalog at **66 games / 106 genre tags** and spends the release on deeper campaign play. Achievement coverage rises to **89**, shared remapping to **40 games**, and the PWA cache advances to `wwg-v29`.

### Aetherstead Colony 2.0

- Rebuilt the original single-scenario colony game into a persistent **three-charter / 36-turn campaign**.
- Added six upgradeable structure classes, adjacency bonuses, charter-specific policies, deterministic crises, charter seals, legacy bonuses, autosave/resume, and lifetime clear/best-score records.
- Added standardized charter completion/failure events plus scored full-campaign completion.
- Added shared remappable keyboard control alongside pointer/touch input.
- Verified all three charters through a legitimate construction/economy path with mid-campaign save/reload.

### Mosslight Vale 1.8

- Extended the six-region RPG arc with milestone autosaves and a true post-restoration finale.
- Added the **Starshade Warden** final boss after Starbloom Canopy and a final Ranger Elian return.
- Added backward-compatible durable epilogue state, campaign clears/best score, and scored campaign completion.
- Verified the complete six-region sequence, both boss battles, intermediate autosave/reload, and completed-campaign reload.

### Platform and QA

- Added a **Long Campaigns** curated collection.
- Added **Six-Region Warden** and **Sky-City Architect** achievements.
- Added `LONGFORM_AUDIT.md` and permanent `v29_longform.py` coverage.
- Full regression remains green: 66/66 runtime-clean, 66/66 smoke boots, 139/139 local-origin HTTP paths, 40 remappable releases, 56 scored-release event coverage, and correct score-direction semantics.

## v28 — Fluxward Conclave / Circuit Rush 2.0

WorldWideGames v28 expands the Architect Industries browser arcade to **66 games**, **106 genre tags**, **87 achievements**, and **39 remappable releases** while substantially upgrading one of the oldest racing titles.

### New game: Fluxward Conclave

- Original three-arena territory strategy built around connected expansion, cell charging, tactical pulse conversion, relay bonus actions, and positional control.
- Solo campaign against a deterministic tactical rival plus Local Multiplayer pass-and-play duel mode.
- Pointer/touch, remappable keyboard, and gamepad support.
- Persistent local records and standardized campaign/win/triple-crown events.
- New featured release and PWA shortcut target.

### Circuit Rush 2.0

- Rebuilt the original concise racer into a three-lap competition with **three live AI rivals**.
- Added ordered eight-gate checkpoint progression, live place tracking, cyan boost gates, off-track grip loss, pause/resume, best-time/place persistence, and race-win events.
- Preserves instant browser launch, touch, gamepad, and shared keyboard remapping.

### Platform and QA

- Added Circuit Champion, Fluxward Victor, and Triple Crown achievements for **87 total**.
- Remapping coverage rises to **39 games**.
- Scored-release event coverage rises to **56 releases**.
- Release History advances to v28 through v23.
- Offline cache upgraded to `wwg-v28` and includes Fluxward Conclave.
- **66/66** catalog runtime-clean pass.
- **66/66** all-game boot smoke pass.
- **139/139** local HTTP paths returned 200.
- Fluxward and Circuit Rush both pass direct mechanic-specific regression suites.

## v27 — Full Catalog Quality Audit

WorldWideGames v27 is a quality-focused release. The catalog intentionally remains at **65 games, 105 genre tags, 84 achievements, and 38 remappable releases** while the entire game library is audited for runtime cleanliness and coherence.

### Catalog audit

- Loaded all **65 registered games** independently in Chromium with isolated state and runtime/page errors captured.
- Exercised common controls across the catalog and added direct interaction checks for mechanic-specific generic-input outliers.
- Performed targeted visual/source review of concise legacy titles most likely to be mistaken for filler.
- Added `CATALOG_AUDIT.md` with a durable per-game disposition and explicit scope boundary.
- No registered game was found to be a placeholder, TODO shell, or runtime-crashing fake page.

### Six game upgrades

- **Glyphsmith 1.1** — rune bank is now finite inventory; spent runes cannot be reused until Backspace/Clear returns them.
- **Echo Bazaar 1.1** — rumors now forecast the next day's market pressure instead of narrating the move that already happened.
- **Signal Choir 1.1** — transition input is locked during wrong-note replay and between rounds, eliminating accidental extra penalties.
- **Pulse Archive 1.1** — visible final score now matches the standardized emitted score including accuracy bonus.
- **Lumen Relay 1.1** — completed-run rotation totals reset before a replay, keeping new-run scores independent.
- **Hushwave Operator 1.1** — completion telemetry now reports total samples across all six signals.

### Platform and QA

- Added repeatable `v27_catalog_audit.py` and `v27_fixes.py` regressions.
- Release History advances to v27 through v22.
- Offline cache upgraded to `wwg-v27`.
- 65/65 catalog runtime-clean pass.
- 65/65 boot smoke pass.
- 137/137 local HTTP paths returned 200.
- 38-game shared-remap regression remains green.
- 55 scored releases remain covered by carried-forward/current numeric-event tests.
- All six lower-is-better titles retain correct score direction.

## v26 — Strata Cipher / Ashfall Caravan 2.0

WorldWideGames v26 expands the Architect Industries browser arcade to **65 games**, **105 genre tags**, **84 achievements**, and **38 remappable releases**.

- Added **Strata Cipher**, a six-site archaeology/excavation strategy puzzle.
- Expanded **Ashfall Caravan 2.0** to twelve crossings, Parts, three road contracts, contract mastery, gamepad support, and shared remapping.
- Added Field Studies, three achievements, and `wwg-v26` offline cache.

## v25 — Echofall Caverns / Rune Depths 2.0

- Added Echofall Caverns.
- Rebuilt Rune Depths as a five-depth relic campaign.
- Added Deep Expeditions, three achievements, and 36-game remapping coverage.

## v24 — Starfall Observatory / Emberdeck Pilgrim 1.3

- Added Starfall Observatory.
- Expanded Emberdeck Pilgrim to five gates with relics and dual-route mastery.
- Added Release History and Science & Discovery.

## v23 — Prismweave Atelier / Bastion Bloom 1.5

- Added Prismweave Atelier.
- Expanded Bastion Bloom to a ten-wave tower-defense campaign.
- Added Recently Updated and Craft & Create.
