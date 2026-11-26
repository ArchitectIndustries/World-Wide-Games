# WorldWideGames Development Standards

WorldWideGames is an Architect Industries browser-gaming platform. The goal is not merely to increase catalog size; the goal is to increase the number and quality of games that are genuinely worth playing.

## Current operating principle
This is an established catalog, not an early prototype. Inspect `README.md`, `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md`, current game folders, catalog metadata and recent Git history before deciding what to change.

Production project:
- GitHub: `ArchitectIndustries/World-Wide-Games`
- Vercel project: `prj_CgW1xTHIZOOe1R4RNzcByfvxantq`
- Production: `https://worldwidegames.vercel.app`

Never create a duplicate production project merely because deployment access is inconvenient.

## Mission
Continuously improve WorldWideGames as a polished, reliable, broad-genre browser game destination owned and operated by Architect Industries.

Balance four responsibilities:
1. repair and polish existing games
2. improve platform UX/discovery/accessibility/performance
3. create original high-quality games in underrepresented genres
4. release only verified builds

## Catalog quality standard
Every listed game should:
- start correctly
- explain its objective
- expose understandable controls
- accept the documented inputs
- provide a coherent playable loop
- trigger loss/win conditions only when legitimate
- avoid obvious soft-locks
- restart/reset correctly
- preserve progression/state correctly where applicable
- avoid game-breaking console/runtime errors
- work at supported viewport/input modes
- present enough feedback that the player understands important events

Prefer Arrow Keys and/or WASD for directional movement when appropriate. Support remapping, controller and touch where they materially improve the title.

## Game creation
Expand genre breadth with original WorldWideGames IP and mechanics. It is fine to learn from broad genres such as arcade, snake-style games, FPS, Doom-like shooters, action RPGs, souls-like combat, adventure, creature collection, racing, puzzle, strategy, simulation, sports, survival, roguelikes, rhythm, tower defense and 3D exploration.

Do not copy protected characters, names, maps, storylines, art, audio or proprietary code from commercial games. Do not create shallow reskins merely to inflate the catalog.

## Quality gate
A game is not release-ready because it loads.

For changed games/features validate, as applicable:
- boot/loading
- actual menu-to-gameplay transitions: click the launch/continue control, verify hidden overlays have no layout box or pointer interception, then verify gameplay input, pause/resume and retry
- console/runtime errors
- keyboard/controller/touch input
- objective and control text
- core gameplay loop
- collision and boundaries
- enemy/AI state
- win/loss conditions
- scoring/progression
- pause/restart/game-over
- save/persistence
- narrow/mobile layouts
- assets and links
- catalog registration
- PWA/service-worker paths
- representative regression games

Use real browser and interactive checks where available. Distinguish browser evidence from static or mocked checks.

## Prioritization
When significant known defects exist, stabilize them before uncontrolled catalog expansion.

Priority order:
1. production outages or broken launches
2. game-breaking gameplay bugs
3. false loss/win conditions and soft-locks
4. input/control inconsistencies
5. save/progression defects
6. unclear objectives/instructions
7. platform regressions
8. accessibility/mobile/controller gaps
9. gameplay depth and presentation upgrades
10. new games/genres

## Responsibility coverage
Development should always account for these areas:

### Game Design & Development
New games, mechanics, level design, enemies, progression, difficulty, replayability, controls and game feel. Favor complete, differentiated experiences over catalog-count inflation.

### Catalog QA
Whole-catalog defect discovery: launch failures, false loss/win states, soft-locks, collision faults, broken input, unclear objectives, persistence defects and representative regression testing.

### Platform & Discovery
Library/search/categories, game pages, recommendations, favorites/ratings/play-later, achievements/challenges, PWA/offline behavior, performance, navigation, metadata and responsive layout.

### Input, Accessibility & Compatibility
Keyboard/WASD/arrow consistency, remapping, controller support, touch/mobile behavior, fullscreen, reduced-motion/accessibility preferences, readable instructions and cross-browser/device compatibility evidence.

### Art, Audio & Asset Provenance
Covers, visual/audio coherence, asset optimization and third-party provenance. Use original, public-domain or legally compatible assets/code and maintain notices.

### Release & Deployment
Candidate integrity, canonical GitHub `main`, Vercel production promotion, production smoke tests, rollback readiness and release records. Feature creation and final release approval should remain independently validated.

### Performance & Reliability
Load time, memory/runtime behavior, service-worker/cache correctness, asset delivery, console/runtime errors, error recovery and browser-appropriate performance budgets.

### Technology & Genre Research
Evaluate current browser-game technology, permissive engines/libraries/assets and underrepresented genre opportunities. Adoption must be legally compatible, maintainable and materially useful.

When responsibilities conflict, player-facing correctness and verified release evidence take priority over shipping speed or catalog growth.

## Release discipline
Preferred pipeline:

**Inspect -> Build/Fix -> Test -> Package Candidate -> Release Gate -> GitHub Main -> Vercel -> Production Smoke Test -> Record State**

Do not call a version fully shipped unless the complete verified source is synchronized to canonical `main` and the corresponding production deployment is verified.

Before updating `main`, re-read it for concurrent changes. Never overwrite unrelated newer work.

Public-facing branding should identify Architect Industries where appropriate.

## Change boundaries
Routine reversible development, debugging, tests, documentation, legal/open asset integration, repository updates and deployment to the established project are allowed when the release gate passes.

Do not:
- create paid commitments without approval
- expose secrets
- accept incompatible/new license obligations
- delete substantial unrelated work
- force-push over concurrent changes
- create duplicate production infrastructure without a documented technical necessity

## Operating loop
1. Inspect actual repository and release state.
2. Review known defects and test evidence.
3. Select one bounded high-impact objective.
4. Implement it completely.
5. Run targeted QA plus a bounded platform regression suite.
6. Fix attributable regressions.
7. Update release/state/test records.
8. Hand verified candidates to the release gate.
9. Verify GitHub and Vercel production state when releasing.
10. Record the next concrete action.

## Reporting
For each substantial work cycle record:
- starting/resulting version
- objective
- games/platform areas changed
- files changed
- tests executed and exact outcomes
- catalog totals when changed
- candidate/release status
- GitHub commit/main state
- Vercel deployment/production status when applicable
- blockers
- next concrete action

Never fabricate tests, gameplay verification, commits, releases, deployment state or catalog totals.
