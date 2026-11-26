## 2026-11-16 v419 compact mission action

One original CSS-only media-query repair limits the mission card to the dynamic viewport, gives it internal scrolling for large-text accessibility, and simplifies typography for short landscape. The browser-emulated 320x240 baseline had the native Start Dive button y243–292, entirely below screen with an unscrollable body; repaired Start Dive is y108–152 (44px) and real Chromium emulated tap, Enter/Space Resume, R restart and pause-safe scoring are checked. No external code/assets/dependencies; the original underwater graphics, generated sound and game rules are unchanged. Research/reference: 2048 MIT source at pinned `478b6ec346e3787f589e4af751378d06ded4cbbc` (`style/main.css` blob `ea3cb19fcaf62b95379376216f643fe5e297c4b7`, `js/html_actuator.js` blob `6b31f2d10785a7149e1b2aa3123b06adc1d166c7`), plus MDN CSS viewport/max-height guides. Only general separation of modal state and responsive box constraints informed original CSS. No upstream source copied. Upstream asset/dependency rights not assumed.

# Deepwater Signal provenance
Original first-party canvas art and synthesized audio.
