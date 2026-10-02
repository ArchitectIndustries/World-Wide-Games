# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v39** with **72 games across 120 genre tags**, **110 unique achievements**, and **46 remappable releases**.

## v39 — Ironlight Breach 3.0

Ironlight Breach is now a five-sector software-raycast FPS campaign. The original rifle/scattergun loop gains the **Arc Lance**, a long-range piercing weapon that can hit up to three aligned targets and temporarily disrupt drones and ranged sentries. A new Sentry enemy fires visible world-space projectiles, making cover, corridor geometry, and line-of-sight management matter during combat.

Secrets now change route structure instead of only awarding score. Sector four contains a cipher route requiring three cumulative secrets; sector five requires five. Each optional route protects a high-value cipher vault, and opening both in one campaign records vault mastery. Sector retries restore an explicit checkpoint snapshot for score, secrets, vaults, weapon unlocks, ammo, and active weapon, preventing failed-attempt farming while preserving completed-sector progression.

The platform adds **Arc Lancer** and **Cipher Diver** achievements, fixes a duplicate achievement identifier, promotes Ironlight to the featured/PWA shortcut position, refreshes cover art, and advances offline caching to `wwg-v39`. The full 72-game runtime/boot/HTTP/control gates and the established flagship campaign regressions remain green.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a modern browser. No package installation, paid API, remote runtime asset service, or external game engine is required for the bundled catalog.

## Project structure

- `index.html` — discovery/home experience
- `game.html` — reusable game-detail shell
- `js/games.js` — data-driven game catalog
- `js/app.js` — discovery/profile/achievement logic
- `assets/wwg-input.js` — shared keyboard-remapping helper
- `games/` — self-contained game releases
- `covers/` — local cover artwork
- `tests/` — release gates and regression coverage
- `CATALOG_AUDIT.md` / `LONGFORM_AUDIT.md` — quality/depth evidence
- `PROJECT_STATE.md` / `TEST_REPORT.md` / `RELEASE_NOTES.md` — durable release continuity

## Branding

WorldWideGames is owned and operated by **Architect Industries**.
