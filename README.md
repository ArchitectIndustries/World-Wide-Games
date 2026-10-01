# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified release is **v25** with **64 games across 103 genre tags**.

Highlights include Echofall Caverns, Rune Depths 2.0, 81 local achievements, Daily/Weekly challenges, Daily Pick, favorites, ratings, Play Later, Continue Playing, Recently Updated, Release History, recommendations, Fresh Genre and curated discovery, shareable discovery state, three-game mixes, local scoring/history, profile backup/restore, and **36 games** using the shared remappable keyboard layer.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. HTTP serving is recommended for service-worker/PWA behavior.

## Validation

Versioned tests live under `tests/`. The v25 release gate covers all-game runtime boot checks, static catalog/cache consistency, 135 local-origin HTTP requests, Chromium interaction/responsive checks, authored-content invariants, 36-game input-remapping regression, scored completion events, and score-direction behavior.

## Source continuity

The canonical source mirror is `ArchitectIndustries/World-Wide-Games`. `/WorldWideGames` remains the persistent packaged-release archive. Use the newest fully verified release when the two temporarily differ.

## Deployment

`vercel.json` targets static hosting. Production should update the existing Architect Industries WorldWideGames Vercel project rather than create a duplicate.

## Ownership

WorldWideGames and its original bundled game content are developed and operated by Architect Industries. See `THIRD_PARTY_NOTICES.md` for attribution information.
