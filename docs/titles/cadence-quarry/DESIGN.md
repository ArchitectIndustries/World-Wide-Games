# Cadence Quarry — Design Brief (milestone a)

Status: **in development, milestone (a) design brief**. Not in the catalog; registered in `js/games.js` only at launch (milestone e).
Created by the daily studio automation, 2026-11-03.

## Why this title
The catalog has 82 games but only one Rhythm title and two Music-tagged titles, against 24 Puzzle and 16 Simulation. A rhythm game with a light progression layer fills the widest genre gap without duplicating an existing loop.

## Pitch
You run a one-person stone quarry where the rock only yields to a steady hand. Seams of ore pulse in time with a work song; strike them on the beat to split the stone cleanly, chain clean strikes to dig deeper, and reach the bottom of each shaft before your pick's temper runs out.

Genres: Rhythm, Music, Arcade, Score Attack.

## Core loop (one shaft, about 90–120 seconds)
1. A synthesized work song plays at a fixed BPM per shaft (start 92 BPM, rising across shafts).
2. Seams scroll up from the bottom of the rock face in **three lanes** (left wall, center, right wall). Each seam reaches the strike line on a beat or half-beat.
3. The player strikes the matching lane. Timing grades: **Clean** (±45 ms), **Rough** (±90 ms), **Miss**.
4. Clean strikes split the stone and add **Depth**; Rough strikes add half; Misses chip the pick's **Temper** meter.
5. Every 8 consecutive Clean strikes triggers a **Fault Line**: the next bar's seams are worth double depth and reveal a gem.
6. Shaft ends in success when Depth reaches the shaft's target before the song ends; failure when Temper hits zero or the song ends short.

Only a successful shaft is a completion and submits a score; a failed shaft emits neutral telemetry (consistent with the platform's existing clear/fail separation).

## Progression (milestone c scope)
- Five shafts with distinct songs (procedurally composed from a seeded motif, rising BPM and lane density).
- Gems unlock **pick heads** that change feel, not power: wider Rough window with lower Clean bonus, or tighter window with higher bonus.
- Per-shaft best score and best accuracy saved under one versioned localStorage key.

## Controls
- Keyboard: **Left / A**, **Down / S**, **Right / D** for the three lanes (remappable through `assets/wwg-input.js`); **P** pause, **R** restart.
- Touch: three full-height lane zones along the bottom third of the screen.
- Gamepad: D-pad or face buttons map to lanes.
- Calibration screen sets an audio/visual offset in ms, saved with progress.

## Art and audio direction
- Flat 2D canvas: layered stone strata in warm ochres and slate blues, seams as glowing veins, dust particles on Clean strikes. All drawn procedurally at runtime.
- Audio fully synthesized with Web Audio (drum, pick-strike, bass drone, a simple melodic motif). No samples, no external music.
- Accessibility: high-contrast lane mode, reduced-motion mode (no screen shake, no dust), optional visual-only beat pulse for players who play muted.

## Technical notes
- Single `games/cadence-quarry/index.html`, dependency-free, matching existing catalog games.
- Timing uses `AudioContext.currentTime` as the clock, not `requestAnimationFrame` deltas, so frame drops never shift judgments.
- Deterministic test API on `window.__cadenceQuarry` (state, seek, strike at time) so headless tests can verify grading and win/fail without real-time play.

## Scope and milestones
| Milestone | Deliverable |
|---|---|
| a. Design brief | This document |
| b. Prototype | One shaft, three lanes, timing grades, Depth/Temper, win/fail, test API, headless test + smoke run |
| c. Content and progression | Five shafts, pick heads, save data |
| d. Polish | Calibration, accessibility modes, touch/gamepad, mobile layout, performance check |
| e. Launch | Catalog registration, cover, event rules, service-worker inventory, platform gates |

## Originality and licensing
Original WorldWideGames concept, name, and mechanics. No characters, songs, charts, art, or code from any existing game. All art and audio generated in code; nothing to license beyond the repository's own MIT license.
