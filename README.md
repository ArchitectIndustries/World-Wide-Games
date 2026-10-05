# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform focused on instant-play original games, broad genre variety, responsive desktop/mobile play, local progression, and increasingly ambitious campaign releases.

## Current verified candidate

**v60 — Catalog Reliability Audit**

v60 prioritizes catalog credibility over new content. A completed 82-game interaction sweep now exercises every registered title for runtime errors, local asset integrity, keyboard/pointer input, pause/restart safety, narrow/mobile overflow, and invalid visible state. The audit uncovered and fixes a real Verdant Echoes 2.0 defect that recreated active bosses at full health every animation frame; Verdant Echoes 2.1 now preserves Hollow Stag and Thorn Regent damage across real combat frames. Historical regression harnesses were refreshed so current catalog growth and modern game APIs no longer create false failures.

## Catalog

- 82 registered games
- 129 genre/tag values
- 148 achievements
- 54 remappable releases
- 82/82 explicit semantic game versions
- Touch/pointer support throughout the catalog where appropriate
- Gamepad support on an expanding set of releases
- Installable/offline-capable PWA shell
- Local favorites, ratings, play-later queue, scores, achievements, challenges, playtime, recommendations, and accessibility preferences

## Run locally

Serve the repository over a local HTTP server and open `index.html`, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`.

See `PROJECT_STATE.md`, `TEST_REPORT.md`, `RELEASE_NOTES.md`, and `THIRD_PARTY_NOTICES.md` for current details.

© 2026 Architect Industries.
