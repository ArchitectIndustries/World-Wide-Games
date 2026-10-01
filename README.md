# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified release is **v26** with **65 games across 105 genre tags**.

Highlights include Strata Cipher, Ashfall Caravan 2.0, Echofall Caverns, Rune Depths 2.0, **84 local achievements**, Daily/Weekly challenges, Daily Pick, favorites, ratings, Play Later, Continue Playing, Recently Updated, Release History, recommendations, Field Studies and other curated discovery collections, shareable discovery state, three-game mixes, local scoring/history, profile backup/restore, and **38 games** using the shared remappable keyboard layer.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. HTTP serving is recommended for service-worker/PWA behavior.

## Validation

Versioned tests live under `tests/`. The v26 release gate covers all-game runtime boot checks, static catalog/cache consistency, **137 local-origin HTTP requests**, Chromium interaction/responsive checks, authored-content invariants, **38-game input-remapping regression**, scored completion events, and score-direction behavior.

## Source continuity

The canonical source mirror is `ArchitectIndustries/World-Wide-Games`. `/WorldWideGames` remains the persistent packaged-release archive. Use the newest fully verified release when the two temporarily differ.

## Deployment

`vercel.json` targets static hosting. Production should update the existing Architect Industries WorldWideGames Vercel project rather than create a duplicate.

## Ownership

WorldWideGames and its original bundled game content are developed and operated by Architect Industries. See `THIRD_PARTY_NOTICES.md` for attribution information.
