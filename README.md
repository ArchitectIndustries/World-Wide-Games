# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified release is **v27** with **65 games across 105 genre tags**.

v27 is a catalog-quality release: all 65 registered games were independently loaded in Chromium, concise/older titles received targeted visual/source review, and six concrete coherence/correctness defects were fixed instead of simply adding more games. See `CATALOG_AUDIT.md` for the per-game review ledger.

Platform highlights include **84 local achievements**, Daily/Weekly challenges, Daily Pick, favorites, ratings, Play Later, Continue Playing, Recently Updated, Release History, recommendations, curated discovery collections, shareable discovery state, three-game mixes, local scoring/history, profile backup/restore, PWA/offline support, and **38 games** using the shared remappable keyboard layer.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. HTTP serving is recommended for service-worker/PWA behavior.

## Validation

Versioned tests live under `tests/`. The v27 release gate includes a **65-game Chromium catalog audit**, all-game boot smoke coverage, defect-specific direct interaction checks, static catalog/cache consistency, **137 local-origin HTTP requests**, **38-game input-remapping regression**, scored completion events, and score-direction behavior.

The audit provides representative interaction and targeted deep review. It does not claim exhaustive mastery of every branch/level or every browser, OS, and gamepad combination.

## Source continuity

The canonical source mirror is `ArchitectIndustries/World-Wide-Games`. `/WorldWideGames` remains the persistent packaged-release archive. Use the newest fully verified release when the two temporarily differ.

## Deployment

`vercel.json` targets static hosting. Production should update the existing Architect Industries WorldWideGames Vercel project rather than create a duplicate. Deployment hooks and protection-bypass secrets are credentials and must never be committed to the repository.

## Ownership

WorldWideGames and its original bundled game content are developed and operated by Architect Industries. See `THIRD_PARTY_NOTICES.md` for attribution information.
