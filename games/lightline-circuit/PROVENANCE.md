# Lightline Circuit

Original game code, arena layouts, Canvas artwork, procedural audio, and cover SVG created for WorldWideGames / Architect Industries on November 25, 2026 (US Eastern).

The broad light-trail arena genre informed the mechanic. No EXIT13 code, artwork, audio, names, or level layouts were imported. This game uses only built-in browser APIs and has no runtime dependencies or external asset requests.

## Game contract

- Five rounds, four riders, three speed/AI settings.
- Arrow keys / WASD, on-screen directions, or canvas swipes turn the player. Reverse directions are rejected.
- Space or the on-screen Boost control spends a finite reserve of 16 extra movement cells per round.
- Existing trails, boundaries, and simultaneous head-on collisions use the same grid rules for every rider.
- Round wins are counted only after zero or one rider remains. Zero survivors produce a draw.
- Score: 2 per player cell moved, 100 per rival eliminated while the player remains alive, 250 per round win.
- The `circuit-complete` platform event is sent once after all five rounds. Restarted or abandoned matches do not report a completed score.
- Pause and hidden/inactive windows stop simulation and clear input. Resume provides a short countdown.
- Local best scores are isolated by difficulty. Storage failures do not block play.

## Verification

Pure engine tests cover simultaneous collisions, occupied-head swaps, arena boundaries, self-trails, boost collisions/reserve, reverse-turn prevention, interruption cleanup, deliberate lifecycle transitions, terminal-score idempotence, and AI route choices. Fifty seeded AI-controlled five-round circuits also complete without stalls or invalid coordinates.

Browser input, responsive layout, and actual audio are separate integration checks; the engine tests alone do not establish those results.
