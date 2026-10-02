# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v35** with **72 games across 120 genre tags**, **102 achievements**, and **46 remappable releases**.

## v35 — Verdant Echoes 2.0

v35 turns **Verdant Echoes** into a substantially deeper two-area action-adventure campaign. Echo Grove now leads into the **Rootvault** dungeon after two relics, where Rootkeeper Mira's Moon Seed quest, ranged Wisps, the Barkguard Charm, the Hollow Stag boss, and the Rootsigil build toward a forged **Moonsteel** blade and the final Thorn Regent encounter. Active campaign state autosaves locally, durable meta tracks clears/best score/Rootvault progress, and deaths resume inside the current area while retaining progression.

The platform also adds **Rootvault Warden** and **Moonsteel Oath** achievements, promotes Verdant Echoes to featured/PWA-shortcut status, and advances offline caching to `wwg-v35`. The v34 **Ironlight Breach 2.0** and v33 **Polyforge Studio 2.0** depth passes remain intact and fully regression-tested.

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
