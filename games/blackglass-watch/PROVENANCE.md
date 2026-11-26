# Blackglass Watch 1.5 — Provenance and QA

## v421 BUILD ONLY — Blackglass Watch 1.5: Actionable Surveillance Desk (2026-11-16)

**One priority-1 objective:** repair unplayable first-view mobile surveillance controls without changing the game's underlying seven-anomaly score/stress and earned progression. In original sealed v420 headless Chromium the actual Begin button began at y1226 on 320×240, y1139 on 568×320 and y1111 on 390×844; classification was likewise offscreen. Original first-party responsive CSS now puts live six-camera selection, all four report classifications, and Begin/Report in view simultaneously: at 320×240 Start is y29–73; at 568×320 y29–73; portrait 390×844 y417–461. All controls are real existing native 44px buttons, not fake overlays. A short-landscape split desk keeps the camera and accessible text clue visible, while secondary commands/status remain in a independently scrollable panel. Standard portrait gets an above-the-fold action grid. No gameplay JS, timer, score, generation, input mapping, controller, storage or asset logic was modified.

**Exact source archive parent:** `WorldWideGames_v420.zip` SHA-256 `826a07704ac849b9083f788082ee5a807e6535249ce59941ab8071413dc2038a`; archive ancestry is NOT a Git merge base. Historical canonical `main` read-only `37f48c6ab75c47e89050ec7ee467cc87c0e8258a`; no GitHub branch/PR/tag/main write, no Vercel production action. All 82 unrelated game executables including Cyber Wars stay byte-identical. Flagship 3D and Cyber Wars candidate tracks not merged or touched. No paid services, external code/assets/dependencies added.

**Research mechanism / rights:** pinned `gabrielecirulli/2048@478b6ec346e3787f589e4af751378d06ded4cbbc/style/main.css` blob `ea3cb19fcaf62b95379376216f643fe5e297c4b7` separates responsive game surface from action controls (MIT LICENSE blob `b0dbfa4d7526587bcc21a4883222b20805d5c065`). Pinned `phoboslab/underrun@f933e29152d7fc1ca61d4b3eaa8b29551d7d7a62/source/terminal.js` blob `61e6d92b0865b1f544a47affa400293dbf1842bb` shows separate textual notice state and viewport drawing (MIT LICENSE blob `c8c1de312641d9f322cafcb811f411abd4c96a00`); its asynchronous text-animation/innerHTML implementation was deliberately NOT reused. Two further leads Kart Royale and Suroi plus the asset-dependent q3js port reviewed at metadata/README level only this cycle; no measured star-growth claim or demo execution. Reused code/assets: **none**, third-party asset/dependency reuse: **not authorized**, added cost **$0**. Source → understood separation → original CSS two-pane and portrait grid → before/after Chromium coordinates and earned seven-report flow → no rights imports. The Radiant/X, Pengsonal/X and supplied YouTube remain unverified leads.

**Working-source evidence:** first-party Chromium focused `117/117` and adjusted historic Blackglass full-play/randomness `156/156`, with native tap, mouse and keyboard, deterministic failure/victory, score event exactly once, screenshot and three before/after viewports. Previous v405 harness assumed title 1.4 (four stale assertions); version-specific copied test checks 1.5 without altering gameplay expectations. Final extracted-artifact QA is a separate report. No real installed offline PWA, hardware touch/gamepad, Safari/Firefox, screen-reader user or unassisted human play session certified.

**Release boundary:** BUILD ONLY, NOT READY FOR RELEASE TASK; canonical main and Vercel production unchanged, and independently reconciled Flagship/Cyber Wars patch integration is outstanding.

# Blackglass Watch 1.3 — Provenance and QA

WorldWideGames creator-owned game by Architect Industries. All game visuals, DOM, CSS geometry, levels, core logic and control behavior in v278 are original first-party assets/code. No third-party source code or external assets were imported.

## Single change: fair active night watch

The prior 1.2 countdown could end an entirely unplayed watch and was not keyboard-focus safe. v278 adds an explicit ready / active / paused / done lifecycle, foreground-only escalation, accessible anomaly evidence, keyboard/pointer/touch controls and synthetic-controller input; holds the original seven-shift, stress and score rules. No Cyber Wars or other game executable modified.

## Research provenance

- `phoboslab/underrun@f933e29152d7fc1ca61d4b3eaa8b29551d7d7a62`: inspected `source/game.js` blob `1e25ada8c57b597b2f27230d5e03fc545872a0d1` (free-running time; explicitly rejected) and `source/terminal.js` blob `61e6d92b0865b1f544a47affa400293dbf1842bb` (readable console feedback). Pinned README MIT, root license unavailable; Sonant-X music library zlib; asset/music provenance not independently cleared, **zero imports**.
- `jakesgordon/javascript-state-machine@2ae84bbbaad13103be43b3e0a24c077002e2301a`: inspected `src/jsm.js` blob `f83c8dec6bc238873d2b8c9f6f766549e1718e94` and pinned MIT LICENSE blob `b01dd40697c1d7e1b941c6681f179093e1087b09` (invalid transition rejection). Code studied, not used.
- `kaplayjs/kaplay@974a222c4552afd5b36318b82459f923910d3fc8`: repository located only, not source-inspected, rejected engine migration as outside objective.

## QA bounds

Parent reproduction 3/3, working 61/61 real Chromium first-party script checks, desktop and mobile emulation. Controlled seven-success score exactly once, seven-wrong loss unranked, clock freezing, accessible clues, touch and synthetic controller edge tests. These are not unassisted full playthrough or physical device / offline PWA qualification. See `TEST_REPORT.md` and `tests/v278_blackglass_browser.py`.
