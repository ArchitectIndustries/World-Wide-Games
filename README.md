# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified release is **v28** with **66 games across 106 genre tags**.

v28 adds **Fluxward Conclave**, a three-arena territory strategy game with Solo and Local Multiplayer play, and rebuilds **Circuit Rush 2.0** into a fuller three-lap race against three active AI rivals with ordered checkpoints, boost gates, position tracking, persistence, and standardized race events.

Platform highlights include **87 local achievements**, Daily/Weekly challenges, Daily Pick, favorites, ratings, Play Later, Continue Playing, Recently Updated, Release History, recommendations, curated discovery collections, shareable discovery state, three-game mixes, local scoring/history, profile backup/restore, PWA/offline support, and **39 games** using the shared remappable keyboard layer.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. HTTP serving is recommended for service-worker/PWA behavior.

## Validation

Versioned tests live under `tests/`. The v28 release gate includes a **66-game Chromium catalog audit**, all-game boot smoke coverage, direct Fluxward and Circuit Rush mechanic tests, static catalog/cache/PWA consistency, **139 local-origin HTTP requests**, **39-game input-remapping regression**, scored completion events, retained v27 defect regressions, and score-direction behavior.

The gate provides representative interaction and targeted deep review. It does not claim exhaustive mastery of every branch/level or every browser, OS, physical gamepad, and touch device combination.

## Source continuity

The canonical source mirror is `ArchitectIndustries/World-Wide-Games`. `/WorldWideGames` remains the persistent packaged-release archive. Use the newest fully verified release when the two temporarily differ.

## Deployment

`vercel.json` targets static hosting. Production should update the existing Architect Industries WorldWideGames Vercel project rather than create a duplicate. Deployment hooks and protection-bypass secrets are credentials and must never be committed to the repository.

## Ownership

WorldWideGames and its original bundled game content are developed and operated by Architect Industries. See `THIRD_PARTY_NOTICES.md` for attribution information.
