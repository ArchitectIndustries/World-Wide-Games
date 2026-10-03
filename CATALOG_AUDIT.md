# WorldWideGames Full Catalog Quality Audit

Date: 2026-10-03
Release: **v45 — Lumenfall Citadel**
Owner/operator: Architect Industries


## v45 current-release findings

The v45 audit adds Lumenfall Citadel and reruns the complete isolated-Chromium catalog against the 75-game source tree. Lumenfall receives a dedicated full-campaign deterministic gate covering movement, rune progression, traversal seals, checkpoints, death/revival, boss completion, persistence, events, and mobile layout. The earlier v42 terminal-state/checkpoint/AI reliability corrections remain locked by `tests/v42_reliability.py`.

## Current release result

- **75/75 games** loaded without page/runtime errors in isolated Chromium.
- Generic interaction produced observable state change in **72** titles; Atlas Below, Lumen Relay, and Forgeflow remain the three generic-harness exceptions and retain direct mechanic-specific coverage.
- Lumenfall Citadel's dedicated gate validates all three rune abilities, all three seals, four shrine/checkpoint semantics, real Bell-Warden completion, persistence/meta, and mobile-width overflow.
- Six v32 flagship releases remain runtime-clean and retain their dedicated deep regressions.
- **157/157** local-origin platform/game/cover paths returned HTTP 200.
- **75/75** game detail pages expose authored controls/objectives and **47/47** remappable releases expose the current/default keyboard profile.
- Prior deep regressions remain green for Vanta Frontline, Astral Menagerie, Ironlight Breach, Polyforge Studio, Ashen Covenant, Verdant Echoes, Rune Depths, Aetherstead Colony, Mosslight Vale, Fluxward Conclave, Circuit Rush, the v42 reliability set, classics/Orbit Breaker, and score-direction semantics.

## v32 flagship additions

| Game | Identity | Focused validation |
|---|---|---|
| Ironlight Breach | Original software-raycast FPS | **v39:** five sectors, rifle/scattergun/Arc Lance combat, keycard and secret-count cipher routes, two optional vaults, four enemy classes including projectile sentries, checkpoint retry, reachable three-core sectors, runtime render |
| Verdant Echoes | Original top-down fantasy action-adventure | v35: two-area Rootvault campaign, Mira quest, three Moon Seeds, Barkguard/Moonsteel progression, Wisp projectiles, Hollow Stag + Thorn Regent gating, autosave/meta, mobile layout |
| Ashen Covenant | Original stamina/action-RPG pilgrimage | v37: three traversal paths, Ember Sigils, Hound/Pilgrim/Archer enemies, Blade/Pike builds, persistent forging, deliberate Ash recovery, three Lord patterns, campaign persistence |
| Astral Menagerie | Original creature-collection RPG | v40: 15 species, party/reserve management, five type techniques/status, three habitat study nodes, trainer gauntlets, Wardens, post-Atlas rematches, Ascendant trials, Starlight mastery |
| Polyforge Studio | Original 3D construction/design game | **v38:** grouped multi-select assemblies, Move/Rotate/Scale drag gizmos, portable scene codes, 80-step history, v2 migration, and legitimate completion of all seven certification briefs |
| Neon Serpent: Gridfall | Original four-contract serpent arcade with a pure Classic Snake opener | steering, contract 2 hazards, persistent contract architecture |

## Per-game release ledger

| Game | Version | Primary genre | Remappable | Runtime |
|---|---:|---|:---:|---|
| Lumenfall Citadel | 1.0 | Metroidvania | No | Clean |
| Vanta Frontline | 1.0 | FPS | No | Clean |
| Ironlight Breach | 3.0 | FPS | Yes | Clean |
| Verdant Echoes | 2.0 | Action Adventure | Yes | Clean |
| Ashen Covenant | 2.0 | Soulslike | Yes | Clean |
| Astral Menagerie | 3.1 | Creature Collection | Yes | Clean |
| Polyforge Studio | 3.0 | 3D Design | Yes | Clean |
| Neon Serpent: Gridfall | 2.0 | Snake | Yes | Clean |
| Pulse Maze | 1.0 | Maze Chase | Yes | Clean |
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
| Windward Cargo | 1.2 | Flight | Yes | Clean |
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
| Crownline Tactics | 1.1 | Tactical | No | Clean |
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
| Skyhook Sprint | 1.1 | Platformer | Yes | Clean |
| Neon Stack | 1.1 | Puzzle | Yes | Clean |
| Circuit Rush | 2.1 | Racing | Yes | Clean |
| Bastion Bloom | 1.5 | Tower Defense | Yes | Clean |
| Emberfield Survival | 1.0 | Survival | Yes | Clean |
| Vector League | 1.1 | Sports | Yes | Clean |
| Orbit Breaker | 1.1 | Space | Yes | Clean |
| Rune Depths | 2.1 | Dungeon | Yes | Clean |

## Scope boundary

The runtime audit proves clean loading and representative interaction, not exhaustive completion of every seed, route, build, physical controller, browser, or operating system. The six v32 additions retain focused mechanic tests; Ironlight now has a dedicated v39 five-sector/weapon/cipher/projectile suite, alongside v38 Polyforge, v37 Ashen Covenant, v40 Astral Menagerie, v35 Verdant Echoes, v31 Rune Depths, and other long-form regression coverage.