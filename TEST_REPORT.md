# WorldWideGames Validation Report

Date: 2026-09-30
Release: v15 — 47-game catalog, Driftglass Links + Tideglass Surveyor, Prism Duel AI, play-mode discovery, 9-game remapping coverage, and 50 achievements

## Passed static/code checks

- `js/games.js`, `js/app.js`, `js/game-page.js`, `assets/wwg-input.js`, and `sw.js` pass syntax/runtime bootstrap checks.
- Inline JavaScript compiles and boots for all **47 game pages** under the runtime smoke harness.
- Catalog contains exactly **47 unique game IDs** and **76 distinct genre tags**.
- Exactly one featured release is registered: **Driftglass Links**.
- Every catalog item has score metadata, a local game page, and a cover asset.
- The `wwg-v15` service worker includes every registered game page and cover.
- The PWA shortcut targets Driftglass Links.
- Shared keyboard remapping is declared on **9 games**.
- Lower-is-better score metadata is active for Driftglass Links and Lantern Line.
- Public-facing source scan covered **102 files** with no `ChatGPT`, `OpenAI`, or internal-agent branding.

## Runtime smoke harness

`node tests/smoke.js`

- All 47 games initialize and advance animation/update frames without uncaught exceptions in the runtime harness.
- Platform homepage boot passes.
- Reusable game-detail shell boot passes.

## HTTP delivery

`python tests/v15_http.py`

- Fresh local threaded HTTP server returned **200 across 105 paths**.
- Coverage includes the homepage, game shell, manifest, service worker, shared assets, every game page, and every cover.

## Chromium interaction checks

`python tests/v15_quick.py`

- Homepage renders **47 cards** and reports a 47-game catalog.
- Player profile renders **50 achievements**.
- Aim & Arc collection includes Driftglass Links and existing compatible games.
- Local Multiplayer filter exposes Prism Duel and Twinforge Expedition while excluding solo-only Driftglass Links.
- Solo filter includes both Driftglass Links and dual-mode Prism Duel.
- Remappable filter includes newly migrated Circuit Rush and Orbit Breaker.
- 390×844 viewport reports no horizontal document overflow.
- Driftglass Links keyboard aim + shot input was exercised before numeric course completion validation.
- Tideglass Surveyor keyboard cursor movement and final chart completion were exercised.
- Prism Duel's actual HUD mode toggle was clicked and an AI victory path produced `ai-duel-won` scoring metadata.
- Custom remapped keyboard inputs were exercised in Circuit Rush and Orbit Breaker.
- No tested page/script errors occurred.

## Shared remapping regression

`python tests/v15_remap.py`

Custom I/J/K/L/F/H mapping was exercised in **9 games**:

- Frostline Rescue
- Atlas Below
- Quiet Protocol
- Skyhook Sprint
- Mosslight Vale
- Lantern Line
- Chronofold Courier
- Circuit Rush
- Orbit Breaker

## Score-event regression

`python tests/v15_events.py`

- Numeric completion-score events validated across **37 representative games**.
- New v15 coverage includes `driftglass-links:course-complete` and `tideglass-surveyor:survey-complete`.
- Prism Duel's legacy local-versus `duel-complete` event remains intact.

## Direction-aware best-score regression

`node tests/v15_direction.js`

- Lantern Line: stored 30 sec best rejects 40 sec and accepts 18 sec.
- Driftglass Links: stored 22-stroke best rejects 29 strokes and accepts 17 strokes.

## Visual checks

`python tests/v15_shots.py`

Generated release screenshots for:

- full v15 homepage/catalog
- Driftglass Links
- Tideglass Surveyor
- Prism Duel VS AI

Screenshots were inspected for readable HUDs, coherent rendering, control visibility, and obvious layout breakage.

## Real-origin browser limitation

A dedicated Chromium test attempted to load the same local HTTP server by URL. The environment blocked loopback navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. This is recorded as an environment limitation, not as a passing origin test. Real HTTP status validation and Chromium behavior validation therefore remain separate in this release.

## Deployment verification

- Architect Industries Vercel team inspection returned **0 projects**.
- `deploy_to_vercel` was retried and failed before build creation with `Tool deploy_to_vercel not found`.
- No deployment ID, URL, build log, runtime log, or verified public origin exists for v15.
- Production deployment is **not claimed**.
