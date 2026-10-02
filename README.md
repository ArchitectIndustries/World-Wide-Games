# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v36** with **72 games across 120 genre tags**, **104 achievements**, and **46 remappable releases**.

## v36 — Astral Menagerie 2.0

Astral Menagerie is now a deeper creature-collection campaign. The roster expands from ten to **fifteen original Astral species**, captured creatures fill a four-member field party and then move into a persistent reserve, and players can switch active party members during battle. Each elemental family now has a distinct technique — Scorch, Snare, Mend, Static, or Guard — adding status, recovery, and defensive decisions to the turn loop.

Each of the three habitats now has a proper field quest: earn two wild victories, defeat a named trainer's two-Astral gauntlet, then challenge the habitat Warden. Active expedition progress autosaves locally; lifetime records track Atlas clears, best score, trainer victories, and Codex mastery. The platform adds **Trainer Constellation** and **Living Atlas** achievements, promotes Astral Menagerie to featured/PWA-shortcut status, and advances offline caching to `wwg-v36`.

The v35 **Verdant Echoes 2.0**, v34 **Ironlight Breach 2.0**, and v33 **Polyforge Studio 2.0** depth passes remain intact and regression-tested.

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