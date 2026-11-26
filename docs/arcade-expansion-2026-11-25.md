# Arcade Nights expansion — November 25, 2026

## Delivery and integration state

This change adds **six original WorldWideGames catalog entries** with playable keyboard and touch controls, original covers, clear objectives, replay, and browser-local records. Tabletop Commons contains four separate classic rule sets.

Two source baselines must remain distinct:

| Baseline | Before | With this additive expansion | Meaning |
| --- | ---: | ---: | --- |
| Recovered v496 source package | 83 games | **89 games** | Development and integration baseline used for this expansion. |
| Canonical GitHub `main` at `37f48c6ab75c47e89050ec7ee467cc87c0e8258a` | 82 games | **88 games** | Expected total when applying the additive feature branch to historical main. |

The verified v496 parent archive SHA-256 is `5cfe087b598e175cfe8a885cd734a657c4a2d51e1d884e8db4e7fc08df2f67be`. Its archive lineage is not a Git merge base. Applying these additions to historical main does not reconcile the intervening recovery work, separate flagship work, Cyber Wars work, or existing open pull requests.

This is an additive feature branch prepared against the exact canonical-main commit above, with a draft pull request. The release record is in the pull request. Production publication is **blocked** because the current Vercel connection cannot resolve the original project, `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`. That observation does not establish that the project was deleted. No replacement hosting project is part of this change. The expansion is a tested development candidate; no production release is claimed.

## New catalog entries

| Game | Playable experience | Inputs and records |
| --- | --- | --- |
| **Aurora Hockey** | First-to-seven air hockey; moving-striker physics, goalposts, bank shots, three AI settings, and local two-player play. | Pointer/touch or directional keys; pause/restart; separate local multiplayer behavior. |
| **Skyline Hoops** | Ten varied basketball shots with an accurate trajectory guide, rim and backboard collisions, downward-only basket detection, and bank/long-range bonuses. | Labeled angle/power sliders, keyboard aiming, swipe shooting, pause/resume, and complete-course scores. |
| **Lightline Circuit** | Five light-trail arenas against three AI riders, three paces, simultaneous crash resolution, finite boost, round standings, and match results. | Arrows/WASD, direction buttons or swipes, Space/Boost, pause; personal bests separated by pace. |
| **Orchard Slice** | A 60-second fruit-slicing score attack with swept blade hits, five-step combos, marked hazards, and fruit-only Zen play. | Pointer/touch swipes or keyboard blade movement; Classic and Zen bests stored separately. |
| **Mosaic Memory** | Three galleries containing 6, 8, and 10 pairs, with original shape labels, optional peeks, and active-time scoring. | Click/tap, Tab/arrow navigation, Enter/Space activation, pause, and one complete-expedition result. |
| **Tabletop Commons** | Four in a Row, Noughts & Crosses, English Checkers, and Domino Draw; computer opponents and local two-player matches. | Native keyboard/pointer controls; explicit ambiguous Checkers route choices; private local Domino handoffs; computer-win records. |

Tabletop's Checkers rules include mandatory captures, complete multi-hop sequences, kings, promotion ending the turn, no-legal-move losses, position repetition, and a no-progress draw. When two routes share a final landing, the player chooses which landing sequence and pieces to capture before the board changes. Domino Draw uses a conserved double-six set, legal end orientation, drawing until a move exists, blocked passes, and pip-total results.

The new runtime paths are `games/aurora-hockey/`, `games/skyline-hoops/`, `games/lightline-circuit/`, `games/orchard-slice/`, `games/mosaic-memory/`, and `games/tabletop-commons/`, with matching files in `covers/`. `js/arcade-expansion.js` registers them additively and presents an Arcade Nights section. The main catalog retains its existing entries. Load order is existing game metadata, event rules, the expansion, then the platform application or game-page script.

## Reference inspection and existing counterparts

The user supplied [EXIT13](https://exit13grooming.com/) as a reference. Its publicly served client catalog contained 28 entries, including air hockey, basketball, light trails, pinball, rhythm, survival, racing, memory, slicing, and classic board/card/word games. Relevant public evidence included the catalog module at `https://exit13grooming.com/assets/chunk-games-fLJZtmsF.js` and its publicly served game UI modules.

The browser's visit to `/games` redirected to `/auth`. These findings establish public catalog and UI-text inspection; **the EXIT13 games were not played or gameplay-verified**. Advertised capabilities were not treated as proven behavior. No public reuse license or source repository was established by the inspection. The expansion uses independently written code, names, graphics, audio, and layouts; no EXIT13 code or assets were imported.

Several reference categories already had relevant WorldWideGames games:

| Reference category | Existing WorldWideGames counterpart |
| --- | --- |
| Pinball | Cloudforge Pinball |
| Rhythm and musical patterns | Pulse Archive; Signal Choir |
| Racing | Circuit Rush; Cinderline Velocity |
| Snake | Neon Serpent: Crown Coil |
| Falling blocks | Neon Stack |
| Space shooters | Lattice Armada; Orbit Breaker |
| Survival waves | Emberfield Survival |
| Vertical traversal | Glasswild Ascent; Stoneveil Ascent; Pulsevine Parkour |
| Word games | Glyphsmith |
| Arena sports | Vector League; Glasswing Polo |

These are genre or mechanic comparisons, not claims of identical features. The delivered expansion introduces the six entries above. It does not add a chess implementation, a branded commercial card-game clone, or an external multiplayer service.

## Final automated validation

Run all portable expansion checks from the repository root:

```sh
node --test tests/arcade-expansion/*.cjs tests/arcade-expansion/*.mjs
```

The observed run passed **51 of 51 Node test entries** in approximately 4.3 seconds. Several entries are script-level suites that report their own inner assertions/scenarios:

| Suite | Observed result | Evidence scope |
| --- | --- | --- |
| `engines.test.cjs` | 25 passing tests | Orchard collision/timing/terminal state; Mosaic locks/hints/scoring; board-game legality and AI; storage, event, and audio helpers. Includes 25 complete seeded Domino games conserving all 28 tiles. |
| `tabletop-focus.test.cjs` | 8 passing tests | Production focus and route-selection functions against a minimal DOM boundary: turn restoration, selector protection, replay focus, enabled Checkers targets, and explicit/stale capture choices. |
| `lightline.test.cjs` | 11 passing tests | Simultaneous collisions, bounds, trails, finite boost, input cleanup, score idempotence, and 50 seeded five-round circuits without stalls or invalid coordinates. |
| `aurora-physics.test.mjs` | 1,635 inner assertions passed | Goal-mouth and goalpost behavior, capped motion, striker contact, legal goals, terminal state, AI limits, and sustained simulation. |
| `aurora-events.test.mjs` | Passing controller suite | Real terminal win/loss/local states through the production controller and same-origin event sender; scored results do not falsely mark losses cleared. |
| `orchard-events.test.cjs` | 3 passing tests | Real surviving Classic, failed Classic, and Zen end states through the production finish function and sender; correct scored versus unscored events and duplicate guards. |
| `integration.test.cjs` | 43 passing checks | Additive registration, event integrity, existing metadata preservation, all runtime paths, exact-query caches, legacy compatibility, public staging, and baseline game fingerprints. |
| `hoops.test.cjs` | 33 inner scenarios passed | Reachable shots at all ten positions; bank/long bonuses; scoring direction; collision/preview consistency; course completion; pause/input/storage/audio contracts. |

Additional direct source checks verified 89 unique IDs in the recovered catalog, all six game and cover paths, required metadata, registered completion events, and idempotent repeated loading of the expansion. JavaScript syntax checks passed for the new or changed game/helper files checked during implementation.

The shared sound helper was separately checked in four parent-mute or zero-volume scenarios, including direct toggle-callback attempts. Lightline's own sound implementation was checked in three such scenarios. A parent `muted=1` or zero-volume setting prevents audio initialization and cannot be enabled by the game sound button.

These checks distinguish engine execution and lightweight DOM simulation from real browser, device, assistive-technology, and audible-output evidence. Browser observations are recorded below. Touch input handlers have source tests; no physical touchscreen was used. No physical-device, cross-browser, installed-PWA, or production verification is asserted by these Node results.

## Release handoff

1. Retain the recovered v496 baseline and the additive delta without overwriting unrelated work.
2. Record the final feature-branch commit and draft PR, including the historical-main versus recovered-catalog totals above.
3. Add final browser findings and confirm game launches, controls, pause/replay, legitimate outcomes, and mobile layouts after the final source edits.
4. Rebuild the public-only payload and preserve the source/archive checksums.
5. Reconcile the original Vercel project's ownership/access and the required release gates before any production promotion.

## Browser evidence and practical limits

The managed Chromium preview exercised the recovered 89-game build. The homepage renders all six Arcade Nights cards and launches the game wrapper. Narrow games were inspected in 320px and 390px CSS viewport iframes. This is responsive browser QA, not physical-device certification.

- Aurora Hockey: start, running match, pause/resume overlay, and corrected 320/390px rink/scoreboard sizing. Both measured body widths equal their scroll widths after fixing intrinsic grid expansion.
- Skyline Hoops: a direct basket earned 100 points, a bank shot earned 150, and restarting reset the course. 320/390px layouts fit after the narrow header wrap correction. All ten shot positions are reachable in the separate physics suite.
- Lightline Circuit: start/countdown, directional control, pause/resume overlay, and bounded 320/390px arena sizing. Five-round termination and collisions are engine-tested; a full manual five-round run was not claimed.
- Orchard Slice: a real pointer swipe earned 10 points, the timer advanced, pause displayed the frozen-run overlay, restart reset the score, and Zen started with the appropriate state. Narrow rendering preserves the field aspect ratio so fruit stays round; the menu remains readable.
- Mosaic Memory: Peek revealed the board and decremented its allowance, a legitimate matching pair incremented pairs and moves, all six pairs completed the first gallery with an earned score, and Next gallery opened the eight-pair board. P worked with a card focused and covered the paused board. The 320px HUD uses two columns.
- Tabletop Commons: local Four in a Row and Noughts & Crosses wins reached the correct terminal/replay state without incrementing computer-win records. Checkers selection and a legal move triggered an AI reply and preserved keyboard focus; selected pieces and legal landings have explicit accessible labels. Domino play hid the incoming local hand, Reveal hand exposed the correct next player and focused the first tile. Distinct capture-route choice and stale callbacks are covered by the controller tests.

No application-origin console errors were reported in the sampled browser log checks. Testing found and corrected real mobile grid overflow, a narrow header overflow, tabletop focus/route-choice issues, and false completion aliases. Some remote animation timing was throttled; these observations are not a frame-rate benchmark. Physical touch hardware, assistive technology, other browser engines, installed/disconnected PWA behavior, and the production origin remain unverified.

## Source and publication boundaries

The additive GitHub payload includes only the six new games, six original covers, shared helpers, expansion registry, tests, this handoff, and minimal integration edits to canonical main's own `index.html`, `game.html`, and `sw.js`. The service-worker edit adds the new assets, preserves exact queried shell scripts, deduplicates its inventory, and limits retired-cache deletion to WorldWideGames versioned caches. It does not replace historical main with the recovered v496 runtime.

The distributable public preview is built from the recovered v496 candidate plus this expansion, so it contains 89 games. Its public-file staging excludes internal recovery history and test fixtures. The additive branch has 88 entries against the historical 82-entry main. Reconciliation of the recovered baseline and the original hosting connection is required before production promotion. The current expansion is **not live on the production site**.

