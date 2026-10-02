# WorldWideGames

WorldWideGames is an Architect Industries browser-gaming platform built around original instant-play games. The current verified source release is **v37** with **72 games across 120 genre tags**, **106 achievements**, and **46 remappable releases**.

## v37 — Ashen Covenant 2.0

Ashen Covenant grows from a three-arena boss rush into a longer stamina-action RPG pilgrimage. Each Covenant Lord now has an authored traversal path before its arena: bind three **Ember Sigils**, survive Hounds, Pilgrims, and ranged Ash Archers, and then open the Lord gate. The game supports two distinct weapon identities — the fast **Emberblade** and longer-range **Ash Pike** — with separate stamina/damage profiles, weapon switching, heavy attacks, and persistent three-tier forging.

Ash can now be spent at Ember Shrines to forge weapons or bind more maximum Vigor. Path progress, upgrades, Ash, sigils, defeated path foes, and lifetime records persist locally. Death still drops carried Ash, but the recovery system now coexists with traversal/checkpoint progression instead of resetting the whole pilgrimage. The three Lords use distinct Bell, Cross, and Sun pressure patterns. The platform adds **Covenant Pilgrim** and **Ash Reclaimer** achievements, promotes Ashen Covenant to featured/PWA-shortcut status, adds it to Long Campaigns, and advances offline caching to `wwg-v37`.

The v36 **Astral Menagerie 2.0**, v35 **Verdant Echoes 2.0**, v34 **Ironlight Breach 2.0**, v33 **Polyforge Studio 2.0**, and other established campaign depth passes remain regression-tested.

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
