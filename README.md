# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform focused on original, instant-play games that run directly in modern browsers.

## v15 snapshot

- **47 playable games** across **76 genre tags**.
- Featured release: **Driftglass Links**.
- New v15 releases: Driftglass Links and Tideglass Surveyor.
- Prism Duel 1.1 adds persistent VS AI play while preserving same-device two-player competition.
- Local discovery includes search, genre, input, **Solo / Local Multiplayer mode**, status, curated collections, recommendations, Surprise Me, and several sort modes.
- Local score handling supports both higher-is-better and lower-is-better records.
- Optional local keyboard remapping is available in **9 compatible games** through the reusable shared input layer.
- Persistent local favorites, ratings, **50 achievements**, completion count, scores, run history, sessions, playtime, challenges, accessibility/audio preferences, profile backup/restore, and game-specific progression.
- PWA manifest and `wwg-v15` service worker cache the complete catalog for static/offline-capable hosting.
- No build step and no required third-party runtime framework dependencies.

## Running locally

Serve the folder with any static web server, for example:

`python -m http.server 8000`

Then open the served origin in a modern browser. Direct `file://` use is not recommended because service workers require HTTP(S).

## Verification

Run the included release checks from the project root:

- `node tests/smoke.js`
- `python tests/v15_static.py`
- `python tests/v15_http.py`
- `python tests/v15_quick.py`
- `python tests/v15_events.py`
- `python tests/v15_remap.py`
- `node tests/v15_direction.js`
- `python tests/v15_shots.py`

## Privacy

Player state and analytics remain local to the browser in v15. WorldWideGames does not require a cloud account.

## Branding

WorldWideGames is owned and operated by Architect Industries.
