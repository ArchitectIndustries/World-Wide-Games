# WorldWideGames Full Catalog Quality Audit

Date: 2026-10-02
Release: **v36 — Astral Menagerie 2.0**
Owner/operator: Architect Industries

## v36 release result

- **72/72 games** loaded without page/runtime errors in isolated Chromium.
- **151/151** local-origin platform/game/cover paths returned HTTP 200.
- **72/72** detail pages expose authored controls; **46/46** remappable releases expose current/default key profiles.
- Catalog totals remain **72 games / 120 genre tags**, with **104 achievements** after adding Trainer Constellation and Living Atlas.
- Astral Menagerie 2.0 received dedicated regression coverage for 15 species, four-member party + reserve, battle switching, five elemental techniques/status effects, three trainer gauntlets, three field quests, three Wardens, autosave/meta persistence, and 390×844 mobile overflow.
- Generic catalog interaction shows observable state change in 68 titles; Astral Menagerie starts behind an intentional starter-choice gate, while Atlas Below, Lumen Relay, and Forgeflow retain direct mechanic-specific regressions.
- v35 Verdant Echoes, v34 Ironlight, v33 Polyforge, Rune Depths, Aetherstead/Mosslight, Fluxward/Circuit, v27 correctness, remapping, controls, HTTP, and score-direction regressions remain green.

## v36 flagship

| Game | Version | Primary identity | Focused validation |
|---|---:|---|---|
| Astral Menagerie | 2.0 | Creature-collection RPG | 15 species, party/reserve, switching, five techniques, trainers, habitat quests, Wardens, autosave/meta, mobile |
| Verdant Echoes | 2.0 | Action adventure | Rootvault campaign, equipment, quest and bosses |
| Ironlight Breach | 2.0 | FPS | weapons, sealed doors, secrets, sentinels |
| Polyforge Studio | 2.0 | 3D design | materials, transforms, undo/redo, certification briefs |

---

## v32 flagship additions

| Game | Identity | Focused validation |
|---|---|---|
| Ironlight Breach | Original software-raycast FPS | Rifle/scattergun combat, keycard doors, secret caches, three sentinel classes, reachable three-core sectors, runtime render |
| Verdant Echoes | Original top-down fantasy action-adventure | v35: two-area Rootvault campaign, Mira quest, three Moon Seeds, Barkguard/Moonsteel progression, Wisp projectiles, Hollow Stag + Thorn Regent gating, autosave/meta, mobile layout |
| Ashen Covenant | Original stamina/action-RPG boss pilgrimage | stamina-spending attack, death drop, leave-and-return Ash recovery |
| Astral Menagerie | Original creature-collection RPG | starter choice, battle damage, deterministic capture path |
| Polyforge Studio | Original 3D construction/design game | v33: five materials, snap levels, rotate/scale, undo/redo, autosave, and legitimate completion of all five certification briefs |
| Neon Serpent: Gridfall | Original three-contract serpent arcade | steering, contract 2 hazards, persistent contract architecture |

## Per-game release ledger

| Game | Version | Primary genre | Remappable | Runtime |
|---|---:|---|:---:|---|
| Ironlight Breach | 2.0 | FPS | Yes | Clean |
| Verdant Echoes | 2.0 | Action Adventure | Yes | Clean |
| Ashen Covenant | 1.0 | Soulslike | Yes | Clean |
| Astral Menagerie | 1.0 | Creature Collection | Yes | Clean |
| Polyforge Studio | 2.0 | 3D Design | Yes | Clean |
| Neon Serpent: Gridfall | 1.0 | Snake | Yes | Clean |
| Fluxward Conclave | 1.0 | Territory | Yes | Clean |
| Strata Cipher | 1.0 | Archaeology | Yes | Clean |
| Echofall Caverns | 1.0 | Echolocation | Yes | Clean |
| Starfall Observatory | 1.0 | Astronomy | Yes | Clean |
| Prismweave Atelier | 1.0 | Weaving | Yes | Clean |
| Blackglass Watch | 1.0 | Horror | Yes | Clean |
| Tetherline Salvage | 1.0 | Salvage | Yes | Clean |
| Kiteglass Drift | 1.0 | Gliding | Yes | Clean |
| Runelight Locksmith | 1.0 | Lockpicking | Yes | Clean |
| Mirrormesh Relay | 1.0 | Optics | Yes | Clean |
| Hushwave Operator | 1.1 | Signal | Yes | Clean |
| Pulsevine Parkour | 2.0 | Parkour | Yes | Clean |
| Tessera Commons | 1.0 | Tile Placement | Yes | Clean |
| Glasswing Polo | 1.0 | Hover Sport | Yes | Clean |
| Rootsong Architect | 1.0 | Botany | Yes | Clean |
| Stoneveil Ascent | 1.0 | Climbing | Yes | Clean |
| Tidal Foundry | 1.0 | Hydraulics | Yes | Clean |
| Riftwake Regatta | 1.0 | Sailing | Yes | Clean |
| Archive Alchemist | 1.0 | Alchemy | No | Clean |
| Driftglass Links | 1.0 | Golf | No | Clean |
| Tideglass Surveyor | 1.0 | Cartography | No | Clean |
| Spanwright | 1.0 | Construction | No | Clean |
| Lantern Line | 1.0 | Vehicle Simulation | Yes | Clean |
| Frostline Rescue | 1.0 | Rescue | Yes | Clean |
| Signal Choir | 1.1 | Memory | No | Clean |
| Terrace Keeper | 1.0 | Farming | No | Clean |
| Chronofold Courier | 1.0 | Time Loop | Yes | Clean |
| Hearthline Kitchen | 1.0 | Cooking | No | Clean |
| Spectra Safari | 1.0 | Photography | No | Clean |
| Ashfall Caravan | 2.0 | Narrative | Yes | Clean |
| Twinforge Expedition | 1.0 | Co-op | No | Clean |
| Mothlight Museum | 1.0 | Hidden Object | No | Clean |
| Windward Cargo | 1.1 | Flight | Yes | Clean |
| Cipher Court | 1.0 | Deduction | No | Clean |
| Moonwake Angler | 1.0 | Fishing | No | Clean |
| Deepwater Signal | 1.1 | Underwater | Yes | Clean |
| Emberdeck Pilgrim | 1.3 | Deckbuilder | Yes | Clean |
| Command Bloom | 1.0 | Programming | No | Clean |
| Railspire Dispatch | 1.0 | Logistics | No | Clean |
| Glyphsmith | 1.1 | Word | No | Clean |
| Solar Loom | 1.0 | Sandbox | No | Clean |
| Atlas Below | 1.4 | Exploration | Yes | Clean |
| Aetherstead Colony | 2.0 | City Builder | Yes | Clean |
| Prism Duel | 1.1 | Multiplayer | No | Clean |
| Crownline Tactics | 1.0 | Tactical | No | Clean |
| Echo Bazaar | 1.1 | Economy | No | Clean |
| Lumen Relay | 1.1 | Logic | No | Clean |
| Starweaver Drift | 1.1 | Space | Yes | Clean |
| Pulse Archive | 1.1 | Rhythm | No | Clean |
| Verdant Circuit | 1.0 | Ecology | No | Clean |
| Quiet Protocol | 1.0 | Stealth | Yes | Clean |
| Forgeflow | 1.0 | Automation | No | Clean |
| Cloudforge Pinball | 1.1 | Pinball | Yes | Clean |
| Mosslight Vale | 1.8 | RPG | Yes | Clean |
| Gravity Foundry | 1.0 | Physics | No | Clean |
| Hexbound Tactics | 1.0 | Card | No | Clean |
| Harbor Pulse | 1.0 | Simulation | No | Clean |
| Rift Relay | 1.1 | Co-op | Yes | Clean |
| Skyhook Sprint | 1.0 | Platformer | Yes | Clean |
| Neon Stack | 1.1 | Puzzle | Yes | Clean |
| Circuit Rush | 2.1 | Racing | Yes | Clean |
| Bastion Bloom | 1.5 | Tower Defense | Yes | Clean |
| Emberfield Survival | 1.0 | Survival | Yes | Clean |
| Vector League | 1.0 | Sports | Yes | Clean |
| Orbit Breaker | 1.0 | Space | Yes | Clean |
| Rune Depths | 2.1 | Dungeon | Yes | Clean |

## Scope boundary

The runtime audit proves clean loading and representative interaction, not exhaustive completion of every seed, route, build, physical controller, browser, or operating system. The six v32 additions retain focused mechanic tests; Verdant Echoes now also has a dedicated v35 campaign-depth suite, while other long-form titles retain their deeper regression coverage.
