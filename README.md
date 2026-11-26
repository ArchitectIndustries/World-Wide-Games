# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform focused on original, polished, no-install games across a broad range of genres.

## Current source update

**Arcade Nights — six original additions**

Aurora Hockey, Skyline Hoops, Lightline Circuit, Orchard Slice, Mosaic Memory, and Tabletop Commons extend the existing catalog. Tabletop Commons includes Four in a Row, Noughts & Crosses, English Checkers, and Domino Draw.

The source catalog contains **88 games: 82 existing entries plus six additions**. The existing catalog and legacy game files remain intact. The new games provide original covers, objectives, keyboard/pointer controls, replay, browser-local records, and earned-result event handling.

This source update and production publication are tracked separately. The existing WorldWideGames site is live; the additions require a verified deployment to that same project. See [the current integration record](docs/arcade-live-update-2026-11-26.md) for exact source, tests, and deployment observations.

## Catalog and platform

- 88 source catalog entries
- Responsive homepage, discovery, categories, favorites, ratings, and local stats
- PWA/offline support and controller/touch support where appropriate
- Arcade Nights discovery shelf and six original game covers

## Development and release quality

See `DEVELOPMENT_STANDARDS.md` for the development, QA, and release-quality contract. The dated v72 project/test/release records describe the prior base; the current arcade record above documents this additive change.

Run the portable expansion tests with:

```sh
node --test tests/arcade-expansion/*.cjs tests/arcade-expansion/*.mjs
```

## Ownership

WorldWideGames is owned and operated by **Architect Industries**.
