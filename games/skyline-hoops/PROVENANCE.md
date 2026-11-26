# Skyline Hoops provenance

Created for WorldWideGames / Architect Industries on November 25, 2026.

Skyline Hoops is an original basketball precision game. Exit13's publicly listed basketball genre was a research reference; no Exit13 code, imagery, branding, audio, characters, or protected game content was imported.

## Original work

- `index.html`, `style.css`, and `game.js`: original implementation, interface, scoring rules, fixed-step ball physics, ten-position course, accessibility controls, and integration logic.
- Court, skyline, basketball, player silhouette, net, and effects: original artwork drawn procedurally with Canvas2D.
- `../../covers/skyline-hoops.svg`: original vector artwork.
- Sound effects: synthesized at runtime with the browser's Web Audio API; no recordings or sampled music.

## Dependencies and assets

No third-party source files, packages, fonts, images, audio, models, or runtime network dependencies are included. Only standard browser APIs and system fonts are used. No new third-party licensing obligations are introduced. Repository licensing applies to the original project work.

## Evidence boundary

The source-executed physics and DOM-simulation tests are in `../../tests/arcade-expansion/hoops.test.cjs`. Browser and device verification is tracked separately by the integrating release owner.
