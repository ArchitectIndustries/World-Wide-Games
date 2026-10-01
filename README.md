# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified release is **v31** with **66 games across 106 genre tags**.

v31 is a **Rune Depths Mastery Pass**. **Rune Depths 2.1** now autosaves active delves, resumes exact run state after reload, tracks best scores and clears, and adds three complete pure-relic mastery paths (Heart, Edge, Flask) with persistent mastery progression. Combat pacing was also tuned around bounded aggro, one incoming hit per player turn, sigil healing, and stronger Heart sustain so every mastery path can complete the real five-depth dungeon.

v30 is a **Pulsevine Expansion & Explicit Controls** release. **Pulsevine Parkour 2.0** now has five progressively harder courses with persistent unlocks/best times, and every game detail page explicitly states its controls; remappable titles show the player's current key map plus W/A/S/D, Space, and E defaults.

v29 is a **Long-Form Depth Pass** rather than a catalog-growth release. **Aetherstead Colony 2.0** is now a persistent three-charter / 36-turn city-building campaign with policies, crises, upgrades, adjacency systems, charter seals, autosave/resume, and legacy progression. **Mosslight Vale 1.8** now has milestone autosaves, a post-six-region Starshade finale, and durable campaign completion.

Platform highlights include **94 local achievements**, Daily/Weekly challenges, Daily Pick, favorites, ratings, Play Later, Continue Playing, Recently Updated, Release History, recommendations, curated discovery collections including **Long Campaigns**, shareable discovery state, three-game mixes, local scoring/history, profile backup/restore, PWA/offline support, and **40 games** using the shared remappable keyboard layer.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a modern browser.

No package installation, build system, remote game engine, paid API, or external runtime asset service is required for the bundled catalog.

## Project structure

- `index.html` — discovery/home experience
- `game.html` — reusable game-detail shell
- `js/games.js` — data-driven game catalog
- `js/app.js` — platform discovery/profile/achievement logic
- `assets/wwg-input.js` — shared keyboard-remapping helper
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — regression and release-gate coverage
- `CATALOG_AUDIT.md` — full-catalog functionality/coherence ledger
- `LONGFORM_AUDIT.md` — campaign-depth review and deep-run evidence
- `PROJECT_STATE.md` / `TEST_REPORT.md` / `RELEASE_NOTES.md` — durable release continuity

## Long-form quality direction

Catalog growth is not treated as a substitute for depth. Campaign-oriented releases are expected to have meaningful progression, persistence where appropriate, a coherent ending or mastery target, and repeatable validation of legitimate play-state transitions. v29 established this standard with full representative campaign paths for Aetherstead Colony and Mosslight Vale, and v31 extends it with three complete Rune Depths relic-master runs against the authored enemy populations. Emberdeck Pilgrim and Ashfall Caravan are now the next priority route/ending validation targets, followed by Atlas Below, Bastion Bloom, and Fluxward Conclave.

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
