# Solstice Wilds — asset provenance

All game code, world layout, characters, animation rigs, terrain, ruins, armillary, lighthouse, plants, props, original synth tones and the SVG cover were created for World Wide Games by Architect Industries. The geometry is constructed locally in `scene.js`; no models, illustrations, fonts or sound files are fetched from an external service.

The game imports the repository's self-hosted Three.js r187 and shared scene renderer through `../../assets/wwg-three-scene.js`. The pinned upstream engine retains its MIT license at `assets/vendor/three-r187/LICENSE` and its source record at `assets/vendor/three-r187/PROVENANCE.md`.

Ground and masonry use the shared local forest and rock surface materials supplied by the release's shared renderer. Their Poly Haven CC0 source, checksum and license records belong to `assets/materials/PROVENANCE.md`. The game requests only those local files; it does not call a provider API or CDN.

The cover is `covers/solstice-wilds.svg`, an original vector composition. No commercial game characters, worlds, names or proprietary assets are used.
