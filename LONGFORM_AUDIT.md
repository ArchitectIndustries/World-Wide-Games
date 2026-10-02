# WorldWideGames Long-Form Game Audit

**v36 continuity note — 2026-10-02:** Astral Menagerie 2.0 is now a campaign-scale creature-collection title rather than a short three-Warden loop. A deterministic Chromium path validates a four-Astral party plus reserve, mid-battle switching, five elemental techniques/status effects, twelve-species Codex mastery, two-wild-win field requirements, all three two-Astral trainer gauntlets, all three habitat quests, all three Wardens, active autosave, lifetime meta progression, standardized completion events, and final Atlas completion.

The v35 Verdant Echoes, v34 Ironlight Breach, v33 Polyforge Studio, Rune Depths, Aetherstead Colony, Mosslight Vale, Fluxward Conclave, Circuit Rush, v27 correctness, remapping, and score-direction regressions remain green.

---

**v35 continuity note — 2026-10-02:** Verdant Echoes 2.0 is now a genuine two-area campaign rather than a short Grove-only adventure. A deterministic Chromium path validates the two-relic Rootvault gate, Rootkeeper Mira quest, all three Moon Seeds, Barkguard and Moonsteel equipment progression, Hollow Stag/Rootsigil, Thorn Regent availability, autosave/meta progression, and final campaign completion. v34 Ironlight, v33 Polyforge, Rune Depths, Aetherstead Colony, Mosslight Vale, Fluxward Conclave, Circuit Rush, the v27 correctness suite, and score-direction regressions remain green.

---

Date: 2026-10-01
Baseline: v28
Result: v29 Long-Form Depth Pass
Owner/operator: Architect Industries

## Objective

This pass evaluated the catalog titles intended to sustain play beyond a short arcade or puzzle session. The goal was not to add another game, but to determine whether campaign-oriented releases actually provide meaningful progression, persistence, replay structure, and a coherent ending.

## Long-form candidates reviewed

| Game | Existing depth | v29 disposition |
|---|---|---|
| Mosslight Vale | Six linked regions, NPC quest arcs, combat, collectibles, persistent quest state | **Substantially upgraded** — added milestone autosaves, post-restoration Starshade finale, durable campaign completion, meta clears/best score, and reload-safe ending state |
| Aetherstead Colony | One 16-turn colony scenario with six structures | **Rebuilt into 2.0** — persistent three-charter / 36-turn campaign with policies, crises, adjacency systems, structure upgrades, charter seals, autosave/resume, legacy bonuses, and real campaign completion |
| Rune Depths | Five-depth dungeon campaign, four sigils per floor, three enemy archetypes, autosaved active delves, persistent best score/clears, three pure relic mastery paths | v31 deep-validated: full Heart, Edge, and Flask mastery clears completed against the authored enemy populations; reload/failure/corrupt-save boundaries verified |
| Emberdeck Pilgrim | Five gates, branching Glass/Iron routes, deck progression, three relics, persistent route mastery | Retained; already has meaningful branching and replay progression |
| Atlas Below | Procedural cave runs with three distinct contracts, rank-shaped generation, oxygen/resources, caches, and contract mastery | Retained; contract selection and persistent mastery provide repeatable long-run structure |
| Ashfall Caravan | Twelve crossings, resource management, three persistent road contracts, Chronicle traits, route variants, distinct endings | Retained; campaign length and contract mastery are already substantial |
| Bastion Bloom | Ten-wave tower-defense campaign, three tower classes, upgrades, four enemy archetypes, bosses on waves 5 and 10 | Retained; campaign arc and upgrade pressure are coherent and complete |
| Fluxward Conclave | Three-arena tactical campaign plus local duel mode, persistent campaign/win records | Retained; multi-arena progression and replay modes are sufficient for its strategy scope |
| Verdant Echoes | Two connected action-adventure regions, four Echo Relics, Rootkeeper quest, Moon Seeds, equipment, two bosses, active autosave/meta | **v35 deep-validated** — complete Rootvault quest/equipment/boss chain plus finale gating, autosave/meta, and mobile layout |

## Aetherstead Colony 2.0 — deep validation

Aetherstead was the clearest long-form weakness in v28: the underlying colony systems were coherent, but a single 16-turn scenario did not justify treating it as a campaign game.

v29 expands it into three consecutive 12-turn charters:

1. **Founder's Ring** — establish a viable first settlement and choose between Homestead Grant and Garden Compact civic directions.
2. **Tempest Basin** — withstand deterministic weather/resource crises while specializing through Storm Coils or Emergency Reserve.
3. **Scholar's Reach** — convert the mature colony into a research/civic center through Open Academy or Civic Fellowship.

The campaign now includes six buildable structure types, three upgrade levels, farm-water adjacency, home-park synergy, lab/power research interactions, deterministic charter events, persistent charter seals, carry-forward bonuses, campaign autosave/resume, lifetime clears/best score, and standardized charter/campaign completion events.

### Legitimate completion evidence

The regression path completes all 36 authored turns through the real construction, upgrade, resource, policy, crisis, and end-turn systems. It does not set a completion flag or inject success resources. The verified run emits three `charter-complete` events followed by `colony-campaign-complete` and persists all three charter seals with one campaign clear.

A mid-charter save is reloaded into a new page context before the run continues, proving that the autosave/resume path is not only writing data but can restore a campaign and continue legitimately.

## Mosslight Vale 1.8 — deep validation

Mosslight already had more content than most titles in the catalog, but its six-region arc did not have a true ending. After restoring Starbloom, the player could continue exploring, but there was no final campaign state, no final scored event, and meaningful progress between shrine visits could be lost.

v29 adds:

- silent autosaves at major restoration milestones;
- a post-six-region **Starshade Warden** final boss in Starbloom Canopy;
- an explicit final return to Ranger Elian after the Starshade defeat;
- persistent `epilogueStage` state compatible with older saves;
- `starshade-defeated` and scored `campaign-complete` events;
- persistent campaign clear count and best score;
- durable final-boss HP/death state and completed-campaign reload behavior.

### Full progression evidence

The long-form regression executes the actual quest/combat state machine in order: Elder introduction, four Moonshards, original Warden battle, Memory Garden, Silverfen, Sunfall Reach, Moonroot Hollow, Starbloom Canopy, Starshade battle, and final Elian return. The exact verified milestone event sequence is:

1. `vale-restored`
2. `memory-garden-restored`
3. `silverfen-restored`
4. `sunfall-restored`
5. `moonroot-restored`
6. `starbloom-restored`
7. `starshade-defeated`
8. `campaign-complete`

The test also reloads a mid-campaign Silverfen autosave and the final completed campaign state, verifying persistence at both an intermediate and terminal point.

## Release-level regression

After the long-form changes, the full catalog regression remains green:

- 66 registered games runtime-clean in the isolated Chromium catalog audit.
- 66/66 games boot in the smoke harness.
- 139/139 requested local-origin pages/assets return HTTP 200.
- 40 remappable releases pass the shared remapping suite, including the new Aetherstead control contract.
- 56 scored releases remain covered by numeric event validation.
- All six lower-is-better titles retain correct score direction.
- v27 correctness fixes and v28 Fluxward/Circuit Rush regressions remain green.

## Scope boundary and next depth targets

This audit proves full representative campaign paths for Aetherstead Colony and Mosslight Vale, plus source/mechanics review of the other principal long-form titles. It does not claim every optional route, policy combination, relic path, contract variant, seed, physical controller, browser, or operating system has been exhausted.

Rune Depths and Verdant Echoes are now deep-validated across their principal mastery/campaign paths. The next highest-value deep-run targets are **Emberdeck Pilgrim** (both route mastery paths from clean profiles) and **Ashfall Caravan** (all three road contracts and ending variants), followed by **Atlas Below**, **Bastion Bloom**, and **Fluxward Conclave** for additional route/build completeness. These should continue to be validated through legitimate play-state transitions before further catalog expansion is prioritized.


## v31 Rune Depths deep-run evidence

Rune Depths 2.1 was validated beyond source inspection. A deterministic Chromium playtest agent traversed real generated mazes, collected all four sigils per floor, fought the authored enemy populations through the normal movement/combat functions, selected the requested relic after each cleared depth, and reached the real final completion state. Separate full runs mastered Heart, Edge, and Flask. The same harness also exercised exact-position save/reload, completion and failure cleanup boundaries, durable meta progression, and corrupt-save replacement. This closes the highest-priority v30 long-form validation gap.