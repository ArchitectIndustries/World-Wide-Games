# WorldWideGames Full Catalog Quality Audit

Date: 2026-10-01
Baseline: v26 (65 games)
Result: v27 quality release

## Method

- Loaded every registered game individually in Chromium with isolated browser state.
- Captured page/console errors and exercised common keyboard controls plus a visible control where available.
- Ran direct, game-specific interaction checks for geometry/slider titles that generic input could not meaningfully hit.
- Reviewed the smallest/oldest implementations by source and visual output to distinguish concise games from shallow or incoherent ones.
- Re-ran platform/static/HTTP/remapping/event/score-direction regression after fixes.

## Findings

- No registered game was a placeholder, TODO, fake/demo-only page, or runtime-crashing shell.
- Six older games had concrete coherence/correctness defects and were upgraded in v27.
- The remaining catalog stays intact; concise titles were retained where their mechanics and presentation formed a coherent playable loop.

## Per-game review ledger

| Game | Result | Review note |
|---|---|---|
| Strata Cipher | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Echofall Caverns | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Starfall Observatory | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Prismweave Atelier | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Blackglass Watch | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Tetherline Salvage | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Kiteglass Drift | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Runelight Locksmith | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Mirrormesh Relay | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Hushwave Operator | Improved v27 | v27 fix: full-band sample telemetry |
| Pulsevine Parkour | Expanded v30 | Five-course progression, persistent unlocks/bests, real-physics 5/5 reachability, safer respawns, explicit controls |
| Tessera Commons | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Glasswing Polo | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Rootsong Architect | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Stoneveil Ascent | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Tidal Foundry | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Riftwake Regatta | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Archive Alchemist | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Driftglass Links | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Tideglass Surveyor | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Spanwright | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Lantern Line | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Frostline Rescue | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Signal Choir | Improved v27 | v27 fix: transition input lock |
| Terrace Keeper | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Chronofold Courier | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Hearthline Kitchen | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Spectra Safari | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Ashfall Caravan | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Twinforge Expedition | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Mothlight Museum | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Windward Cargo | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Cipher Court | Functional | visual/code review; coherent four-case deduction loop; retained |
| Moonwake Angler | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Deepwater Signal | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Emberdeck Pilgrim | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Command Bloom | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Railspire Dispatch | Functional | visual/code review; coherent switch-routing loop; retained |
| Glyphsmith | Improved v27 | v27 fix: finite rune inventory + reversible undo |
| Solar Loom | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Atlas Below | Functional | direct cavern movement/oxygen check + source review; coherent contracts/mining/extraction; retained |
| Aetherstead Colony | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Prism Duel | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Crownline Tactics | Functional | targeted interaction + visual/code review; retained |
| Echo Bazaar | Improved v27 | v27 fix: rumor now forecasts next-day pressure |
| Lumen Relay | Improved v27 | v27 fix: full-run rotation total resets |
| Starweaver Drift | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Pulse Archive | Improved v27 | v27 fix: displayed final score matches emitted score |
| Verdant Circuit | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Quiet Protocol | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Forgeflow | Functional | direct pointer rotation + source review; coherent ore-routing/processor/quota loop; retained |
| Cloudforge Pinball | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Mosslight Vale | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Gravity Foundry | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Hexbound Tactics | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Harbor Pulse | Functional | visual/code review; coherent timed berth-management loop; retained |
| Rift Relay | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Skyhook Sprint | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Neon Stack | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Circuit Rush | Functional | visual/code review; coherent 3-lap racer; retained |
| Bastion Bloom | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Emberfield Survival | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Vector League | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |
| Orbit Breaker | Functional | visual/code review; coherent shooter loop; retained |
| Rune Depths | Functional | Runtime-clean catalog smoke; advertised controls/loop present; retained |

## v27 defect fixes

- **Glyphsmith 1.1:** rune buttons are consumable inventory now; keyboard input cannot reuse a spent rune, and Backspace/Clear correctly return runes.
- **Echo Bazaar 1.1:** market rumors are generated before the price move they predict, making the information strategically usable.
- **Signal Choir 1.1:** input is locked during wrong-note replay and between completed rounds, preventing accidental extra strikes.
- **Pulse Archive 1.1:** the displayed end score now includes the same accuracy bonus emitted to WorldWideGames scoring.
- **Lumen Relay 1.1:** total rotations reset after a completed six-stage run, so replay scores do not inherit the previous run.
- **Hushwave Operator 1.1:** completion telemetry now reports total samples across all six signals instead of only the final signal.

## Scope boundary

This audit proves boot/runtime cleanliness, representative interaction, direct checks for identified edge cases, and targeted visual/code review of the weakest-looking legacy titles. It does not claim exhaustive human mastery of every possible level/path or every gamepad/browser/OS combination.

## v28 follow-up — 2026-10-01

The v28 release re-ran the isolated Chromium catalog audit after adding Fluxward Conclave and rebuilding Circuit Rush. **66/66 registered games loaded without page/runtime errors**. Generic input produced observable state changes in 63 titles; Atlas Below, Lumen Relay, and Forgeflow remain geometry/mechanic-specific generic-input exceptions with direct regressions retained from v27.

- **Fluxward Conclave — New v28:** direct pointer expansion, pulse conversion, keyboard remapping, Local Multiplayer handoff, campaign milestones, mobile width, boot/runtime, HTTP delivery, cache registration, and cover/catalog integration all pass.
- **Circuit Rush — Improved v28 / version 2.0:** direct ordered-checkpoint traversal, three AI rivals, steering/throttle, pause/resume, boost behavior, three-lap completion, win/completion events, boot/runtime, HTTP delivery, and catalog integration all pass.

This follow-up supplements the v27 per-game ledger rather than rewriting its historical findings.

## v29 long-form follow-up

The v27 catalog-wide audit established that the registered games were functional and coherent at representative interaction depth. v29 follows that work by completing legitimate long-form paths rather than relying on boot checks for campaign-oriented releases.

- **Aetherstead Colony 2.0:** upgraded and completed through a legal three-charter / 36-turn campaign, including save/reload and persistent legacy state.
- **Mosslight Vale 1.8:** completed through all six regions, both campaign bosses, milestone autosaves, final campaign event, and completed-save reload.
- **Rune Depths, Emberdeck Pilgrim, Atlas Below, Ashfall Caravan, Bastion Bloom, and Fluxward Conclave:** reviewed as the remaining principal campaign titles; their existing structures were retained for future route/build/contract-specific deep runs.

See `LONGFORM_AUDIT.md` for the detailed campaign-depth evidence and next targets.

## v30 controls and Pulsevine follow-up

Pulsevine Parkour received a full depth expansion from one circuit to five courses. All five were validated through the real movement/collision/checkpoint loop after respawn and hazard placement were tuned from playtest findings.

The platform also added a universal exact-key presentation layer. Every registered game retains its authored control list; remappable games additionally expose the active key profile and defaults so labels such as Primary or Secondary no longer require player inference.
