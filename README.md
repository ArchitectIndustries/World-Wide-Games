# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around instant-play original games. The current verified release is **v21** with **59 games across 94 genre tags**.

## Current highlights

- Featured release: **Kiteglass Drift**, a seven-gate gliding time trial.
- New in v21: **Runelight Locksmith**, a six-lock mechanical timing game.
- 69 local achievements, Daily/Weekly challenge systems, Daily Pick, favorites, ratings, Play Later, recommendations, shareable discovery state, three-game mixes, persistent local scoring, playtime/activity history, and profile backup/restore.
- Discovery supports genre, input, play mode, curated collection, Unplayed, In progress, Uncleared, Favorites, Cleared, and Play Later filters.
- 26 releases use the shared user-remappable keyboard layer.
- PWA/offline cache covers the full registered catalog.
- No installation is required for normal browser play.

## Run locally

Serve this folder from a local HTTP origin, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

Opening individual HTML files directly may work for some games, but HTTP serving is recommended for service-worker/PWA and browser-origin behavior.

## Validation

The current release includes versioned tests under `tests/`. The v21 release gate covers runtime boot checks, static registry/cache consistency, 127 local-origin HTTP requests, Chromium interaction/responsive checks, authored-content invariants, 26-game remapping regression, scored game events, and lower-is-better score direction.

## Deployment

`vercel.json` is included for static Vercel hosting. The intended production project is the existing Architect Industries WorldWideGames project rather than a duplicate deployment target.

## Ownership

WorldWideGames and its original game content are developed and operated by Architect Industries. See `THIRD_PARTY_NOTICES.md` for dependency and attribution information.
