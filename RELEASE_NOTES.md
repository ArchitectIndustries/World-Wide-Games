# WorldWideGames Release Notes

## v20 — 2026-09-30

WorldWideGames v20 expands the Architect Industries browser arcade to **57 games**, **90 genre tags**, **67 achievements**, and **22 remappable releases**.

### New games

- **Mirrormesh Relay** — six-stage optics puzzle with live beam tracing, beacon routing, mirror rotation, efficient-turn scoring, remappable keyboard controls, and pointer/touch play.
- **Hushwave Operator** — six-signal radio-tuning puzzle with frequency/phase/gain controls, live oscilloscope feedback, narrowing lock tolerances, diagnostics, remappable keyboard controls, and touch/pointer sliders.

### Platform

- Added **Make 3-game mix**, which respects the current discovery filters and queues up to three eligible, less-played games into Play Later.
- Added **Signals & Circuits** curated discovery.
- Added Mesh Closer, Quiet Band, and Mix Curator achievements.
- Updated featured PWA shortcut and `wwg-v20` offline cache.

### Validation

- 57/57 game boot smoke pass.
- 123/123 local HTTP paths returned 200.
- 57-card / 67-achievement Chromium UI pass, including 390 px responsive width and mix behavior.
- 22-game shared remap regression pass.
- 47-game numeric score-event regression pass.
- All six Mirrormesh boards independently proven solvable; Hushwave targets and completion threshold independently validated.
