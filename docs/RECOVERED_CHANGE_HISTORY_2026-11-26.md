# WorldWideGames recovered change history — November 26, 2026

## Evidence and scope

The cumulative `RELEASE_NOTES.md` recovered from the checksum-verified v496 source contains **all 424 distinct build labels from v73 through v496**, with no missing number. These are development revisions, not a count of games or completed production deployments. Detailed changes and their historical qualification limits remain in that file.

Recovery source archive SHA-256: `5cfe087b598e175cfe8a885cd734a657c4a2d51e1d884e8db4e7fc08df2f67be`.

The comparison baseline is GitHub main `8ffd27a4aa115ff4647c0946e5eea032b91504f9`, which contains the older v72 catalog plus six Arcade Nights additions. Direct file comparison found changed game implementations in **all 82 original registered game directories** in the v496 source. The two unused legacy `vector-shatter-v2` files are unchanged. The six Arcade Nights folders are absent in the v496 archive and must be retained from GitHub main. Cyber Wars is the additional registered game in the recovered sequential catalog, bringing that archive to 83; adding the six distinct Arcade Nights titles yields 89 registrations before any other additions.

This document is a recovery inventory. Production publication and final integrated validation are recorded separately by the release owner.

## Grouped changes beyond v72

### Campaign completion, scoring and progression

A broad sequence makes recorded results depend on legitimately finishing the advertised campaign. Intermediate stages, failed runs, practice, checkpoint replay, manual stage selection and terminal states no longer create premature or duplicate ranked results. Examples include Gravity Foundry (v73), Astral Menagerie (v174), Ironlight Breach (v181/v364/v492), Pulsevine Parkour (v185/v212), and the earned-completion repairs across v347–v367. Scores remain browser-local; this is not server-authoritative anti-cheat. The platform also tightened game-frame message validation (v124) and score precision (v233).

### Saved progress and platform reliability

Corrupted, malformed, unavailable or full browser storage no longer stops many game launches or silently creates invalid progress. Valid neighboring records and earned progression are retained where documented. The shared detail page gained session-only fallback (v99); imported keymaps and run-history rendering were hardened (v163/v168); saved game mastery was validated across titles, including Aegis Verge (v475), Ironlight Breach (v476), and Vector Shatter (v478). Recovered B2 adds missing schema validation to the detail-page profile loader while retaining original malformed stored values.

### Keyboard, touch and controller behavior

The revisions repair held-action release, one-action-per-press semantics, neutral-controller interference with keyboard input, sparse gamepad slots, disconnect/reconnect and focus recovery, controller-only menus and retries, and native button activation. Representative work includes Ironlight firing (v93), all-game-page control visibility (v101), Cipher Court controls (v175), Harbor Pulse routing (v188), Archive Alchemist controller expedition (v452), Cloudforge Pinball accessible flippers (v488), and Moonwake Angler replay (v495).

### Responsive and accessible presentation

Many compact mobile and landscape layouts now keep the actual playfield, Start, Replay, upgrade choices and action buttons reachable. This includes Neon Stack, Neon Serpent, Skyhook Sprint, Bastion Bloom, Tidal Foundry, Vanta Frontline, Mothlight Museum and others. The source includes readable instructions, native controls and status announcements. Historical emulation checks are not physical-device or screen-reader certification. Recovered B1 specifically removes Mosaic Memory's covered board from keyboard/accessibility navigation and restores the selected tile when resuming.

### Timing, collision and fairness

Active-play clocks pause during background/focus loss; selected motion/physics systems are stabilized across refresh rates. Examples include fair snake tail-vacating collision (v94), directed race checkpoints (v226), swept flight gates (v231), terrain-consistent chase/combat and ricochets (v234/v238/v245/v287/v291), frame-fair parkour (v296), fishing (v304), racing (v307/v403), and pinball (v398). Later revisions prevent post-death clears or repeated terminal results in Pulse Maze, Emberfield, Cinderline, Ironlight and Bastion Bloom (v485/v490–v493).

### Original gameplay depth

- **Pulsevine Parkour:** expanded from five to eight authored courses with moving rails, wind, springs and checkpoints (v167); optional personal-best movement ghost and checkpoint split feedback (v336).
- **Aegis Verge:** physical cover, swept projectile blocking, readable windups, grid navigation and richer software 3D presentation (v224), with a separately developed flagship track to be selectively integrated.
- **Vanta Frontline:** cover-aware pursuit, last-observed position and readable aim windup (v284).
- **Command Bloom:** pause, resume and single-step program debugging (v312), followed by a nonmutating route forecast before execution (v399).
- **Emberfield Survival / Mosslight Vale:** forecast boss or enemy attacks and meaningful dodge/interrupt/recovery counterplay (v302/v404).
- **Crownline Tactics:** attack and movement forecasts tied to the same deterministic planner used for resolution (v410).
- **Gravity Foundry:** six-second orbital trajectory forecast with collisions, core pickups and endpoint feedback (v436).
- **Deepwater Signal:** expanding sonar from the actual ping origin, timed relay bearings and sound-aware hunter investigation (v437).
- **Moonwake Angler:** species-specific surge rhythms and release-to-recover counterplay (v384).
- **Echo Bazaar:** standing limit buy/sell orders with escrow, refund, cancellation and expiry accounting (v448/v461).
- **Tessera Commons / Verdant Circuit / Terrace Keeper:** edge rotation and preview, full civic objectives, simultaneous ecology updates, and crop rotation/fertility systems (v374/v455–v457).
- **Hexbound Tactics:** deterministic public-board tactical rival planning, with bounded automated balance evidence (v482).

### Cyber Wars in the sequential catalog

Cyber Wars was introduced in v81 (October 8), adding the Viridia slice, exploration/combat, book-first Pilot learning, salvage objectives, community restoration, home ownership and save rules. Subsequent recorded integrations add progress and controller reliability, local/experimental presence work, Pilot ranks, terrain/cover collision, stealth, weather and wildlife through Cyber Wars 0.44 (v165). These do not establish authenticated authoritative multiplayer. The independent 0.64 river-cargo development must be selectively reconciled; the v496 catalog did not contain it.

### Offline/public delivery

v480 repairs duplicate precache entries and missing exact query-bearing shell scripts. v481 restricts caching to known public resources, skips authorization/range/no-store requests and avoids runtime cache writes. v496 adds a reproducible public-only staging process that excludes engineering/testing/backend material. Full-source root serving should not replace this isolated website output. Installed-PWA behavior still requires actual-origin validation.

## November 26 independent recovery patches

| Patch | Recovered behavior | Integration disposition |
| --- | --- | --- |
| B1 Arcade Mosaic | Covered board inert/hidden; explicit overlays receive focus; resume remembers selected tile; initial/background states do not deliberately steal focus | Apply the three game files only after the six manifest preconditions match |
| B2 Profile Recovery | Detail profile JSON schema validation; damaged record isolation; original stored bytes preserved; explicit session-only notice | Apply `js/game-page.js`; update final shell script/cache version through the integrated release |
| B3 Cold Install | Duplicate/query precache correction against old v466+B2 | Superseded by v480/v481; do not overwrite the newer service worker |
| F3D95 | Independent Aegis Verge 2.95 cumulative flagship source; most recent change fixes warning range to match real projectile lifetime/speed and cover | Selectively reconcile Aegis source and its metadata; preserve catalog-wide fixes |
| Cyber Wars 0.64 | Independently developed moving river cargo, drift/weather/eddy/collision behavior and timed delivery | Selectively reconcile Cyber Wars source and metadata; preserve other games |

B1 and B2 were applied during this recovery after their exact SHA-256 source preconditions were checked. The B2 source parent is byte-identical to v496's original `js/game-page.js`; no profile hardening was lost. Existing `js/profile-safety.js` is loaded by the homepage but was not loaded by the detail page.

## Current targeted verification

`node tests/recovery_b2_profile_storage.cjs` passed **198/198 assertions** by executing the actual profile loader/storage functions in an isolated Node VM. It covers malformed shapes/types, bad JSON, reserved keys, valid neighboring data, preservation of original damaged bytes, fractional/zero score precision and unavailable storage. This is not browser or installed-PWA qualification.

The recovered `recovery_b1_mosaic_focus.py` and `recovery_b2_profile_shell.py` browser suites are retained for a suitable environment. Their attempted local launches exited before any tests ran because the Chromium executable was absent. No passing browser result is claimed here; the release owner handles browser checks through the supported preview.

## Complete recorded build index: v73–v496

The titles below are taken from the recovered cumulative release notes. They identify the individual changes; the corresponding section in `RELEASE_NOTES.md` contains the full reasoning, source lineage and historical test scope.

| Build | Recorded title |
| --- | --- |
| v73 | v73 — Gravity Foundry 1.1: Four-Field Finish — 2026-10-07 |
| v74 | v74 — Atlas Below 1.5: Honest Extraction — 2026-10-07 |
| v75 | v75 — Aetherstead Colony 2.1: Honest Charters — 2026-10-07 |
| v76 | v76 — Tetherline Salvage 1.1: Honest Recovery — 2026-10-07 |
| v77 | v77 — Emberdeck Pilgrim 1.4: Honest Defeat — 2026-10-07 |
| v78 | v78 — Deepwater Signal 1.2: Honest Return — 2026-10-07 |
| v79 | v79 — Crownline Tactics 1.2: Honest Sector — 2026-10-07 |
| v80 | v80 — Signal Choir 1.2: Honest Harmony — 2026-10-07 |
| v81 | v81 — Cyber Wars 0.1: Viridia Protocol — 2026-10-08 |
| v82 | v82 — Cyber Wars 0.2: Remembered Salvage — 2026-10-08 |
| v83 | v83 — Cyber Wars 0.3: Real Rooms (Presence) — 2026-10-08 |
| v84 | v84 — Cyber Wars 0.4: True Room Presence — 2026-10-08 |
| v85 | v85 — Cyber Wars 0.5: Controller-Safe Frontier — 2026-10-08 |
| v86 | v86 — Cyber Wars 0.6: Twin Signal Link — 2026-10-08 |
| v87 | v87 — Cyber Wars 0.7: Guest Continuity — 2026-10-08 |
| v88 | v88 - Cyber Wars 0.8: Living Canopy - 2026-10-08 |
| v89 | v89 - Cyber Wars 0.9: Verified Spawn - 2026-10-08 |
| v90 | v90 - Cyber Wars 0.10: Instanced Canopy - 2026-10-09 |
| v91 | v91 — Cyber Wars 0.11: The Patient Sky — 2026-10-09 |
| v92 | v92 — Astral Menagerie 3.2: Faithful Expeditions — 2026-10-09 |
| v93 | v93 — Ironlight Breach 4.1: Responsive Fire — 2026-10-09 |
| v94 | v94 — Neon Serpent 3.1: True Coil — 2026-10-09 |
| v95 | v95 — Blackglass Watch 1.1: Earned Vigil — 2026-10-09 (BUILD candidate, NOT RELEASED) |
| v96 | v96 + Cyber Wars 0.12 — Viridia Pilot Ground Stabilizer integration — 2026-10-09 (isolated BUILD candidate, NOT RELEASED) |
| v97 | v97 — Aetherstead Colony 2.2: Durable Charters — 2026-10-09 (BUILD candidate, NOT RELEASED) |
| v98 | Cyber Wars 0.13 — Viridia Storage-Safe Entry (isolated v98 integration candidate, 2026-10-10) |
| v99 | v99 — Game Detail Platform: Storage-Safe Play — 2026-10-10 (BUILD ONLY) |
| v100 | v100 — Lattice Armada 1.1: Fair Sector Records — 2026-10-10 (BUILD ONLY) |
| v101 | WorldWideGames v101 — Honest Controls on All Game Pages (BUILD CANDIDATE; 2026-10-10) |
| v102 | WorldWideGames v102 — Vector Shatter 2.1: Earned Sector Results (BUILD ONLY; 2026-10-10) |
| v103 | WorldWideGames v103 — Cyber Wars 0.15 Catalog Integration (BUILD ONLY, 2026-10-10) |
| v104 | Cyber Wars 0.16 — Pilot Rank 5 Dock Examination (WorldWideGames v104 isolated candidate; 2026-10-10) |
| v105 | WorldWideGames v105 — Cyber Wars 0.16 Integrated (2026-10-10; BUILD CANDIDATE ONLY) |
| v106 | Cyber Wars 0.17 — The Narrow Sky (2026-10-11; v106 isolated BUILD, not released) |
| v107 | WorldWideGames v107 — Cyber Wars 0.17 Integrated (2026-10-11; BUILD ONLY) |
| v108 | Cyber Wars 0.18 — Trust but Verify / Pilot Rank 7 (v108 isolated build, 2026-10-11) |
| v109 | Release candidate v109 — Cyber Wars 0.18 Verified Patch Integration (2026-10-11; BUILD ONLY) |
| v110 | Cyber Wars 0.19 — The Safe Divert / Pilot Rank 8 (v110 isolated candidate; 2026-10-11) |
| v111 | v111 — Cyber Wars 0.19: Emergency Recovery Integration — 2026-10-11 |
| v112 | WorldWideGames v112 — Circuit Rush 2.2: Honest Racing (BUILD CANDIDATE) |
| v113 | Cyber Wars 0.20 — Rank 9 Shared Skies (v113 isolated candidate; BUILD ONLY) |
| v114 | WorldWideGames v114 — Cyber Wars 0.20 Pilot Rank 9 Integration (BUILD ONLY) |
| v115 | WorldWideGames v115 — Frostline Rescue 1.1: Honest District Outcomes (BUILD CANDIDATE) |
| v116 | WorldWideGames v116 - Verified Cyber Wars Pilot Rank 10 Integration (2026-10-12; BUILD ONLY) |
| v117 | WorldWideGames v117 — Bastion Bloom 1.6 Honest Garden Outcomes (2026-10-12; BUILD ONLY) |
| v118 | Cyber Wars 0.22 / v118 isolated candidate - debt checkpoint and knockout integrity (2026-10-12) |
| v119 | WorldWideGames v119 — Cyber Wars 0.22 Safe Recovery Integration (2026-10-12; BUILD ONLY) |
| v120 | WorldWideGames v120 — Moonwake Angler 1.1 (BUILD ONLY; 2026-10-12) |
| v121 | WorldWideGames v121 — Hearthline Kitchen 1.1 Honest Dinner Rush (2026-10-12; BUILD ONLY) |
| v122 | Cyber Wars 0.23 on v122 — verification and handoff, 2026-10-12 |
| v123 | v123 — Cyber Wars 0.23: Verified Field Survey Catalog Integration (2026-10-12; BUILD ONLY) |
| v124 | WorldWideGames v124 — Strict Local Scoring Boundary (2026-10-13; BUILD ONLY) |
| v125 | WorldWideGames v125 - Cyber Wars 0.24 Scanner Integration (BUILD ONLY; 2026-10-13) |
| v126 | WorldWideGames v126 — Pulse Archive 1.3: Honest Rhythm Records (2026-10-13; BUILD ONLY) |
| v127 | WorldWideGames v127 - Catalog acceptance of Cyber Wars 0.27 (2026-10-13; BUILD ONLY) |
| v128 | WorldWideGames v128 — Skyhook Sprint 1.3 Reliable Records (2026-10-13, BUILD ONLY) |
| v129 | WorldWideGames v129 - Cyber Wars 0.28 Recovery Integrity (2026-10-13; BUILD ONLY) |
| v130 | WorldWideGames v130 — Ashen Covenant 2.1 storage-resilient play (2026-10-13; BUILD ONLY) |
| v131 | WorldWideGames v131 + Cyber Wars 0.30 — Physical Projectile Cover (2026-10-14; BUILD ONLY) |
| v132 | WorldWideGames v132 - Cyber Wars 0.30 projectile-cover integration (2026-10-14; BUILD ONLY) |
| v133 | WorldWideGames v133 — Neon Serpent 3.2: Reliable Crown Coil (2026-10-14; BUILD ONLY) |
| v134 | WorldWideGames v134 — Polyforge Studio 3.1: Reliable 3D Studio (2026-10-14; BUILD ONLY) |
| v135 | v135 — Cyber Wars 0.31 cover-aware enemy tactics (2026-10-14; BUILD ONLY) |
| v136 | WorldWideGames v136 — Hexbound Tactics 1.2 win-event durability (2026-10-14; BUILD ONLY) |
| v137 | v137 QA and build boundary (2026-10-14) |
| v138 | WorldWideGames v138 — Orbit Breaker 2.1 storage-denial launch resilience (2026-10-14; BUILD ONLY) |
| v139 | WorldWideGames v139 — Cyber Wars 0.33 deliberate stealth (2026-10-14; BUILD ONLY) |
| v140 | v140 — Vanta Frontline 1.1: Storage-Safe Deployment — 2026-10-14 |
| v141 | WorldWideGames v141 — Fluxward Conclave 1.1 result integrity (2026-10-14; BUILD ONLY) |
| v142 | v142 — Cyber Wars 0.34 Controller-Context Safety Integration — 2026-10-15 |
| v143 | WorldWideGames v143 — Pulse Maze 1.1 Campaign Integrity — 2026-10-15 |
| v144 | WorldWideGames v144 — Cyber Wars 0.35 Integration (2026-10-15; BUILD ONLY) |
| v145 | WorldWideGames v145 — Parallax Accord 1.2 Safe Match Results (2026-10-15; BUILD ONLY) |
| v146 | WorldWideGames v146 - Ashfall Caravan 2.2 Input Integrity (2026-10-15; BUILD ONLY) |
| v147 | WorldWideGames v147 — Orbit Breaker 2.2 Safe Objective Help (2026-10-15; BUILD ONLY) |
| v148 | WorldWideGames v148 — Cyber Wars 0.36 Catalog Integration (2026-10-15; BUILD ONLY) |
| v149 | WorldWideGames v149 - Moonwake Angler 1.2 deliberate bite input (2026-10-16; BUILD ONLY) |
| v150 | WorldWideGames v150 — Neon Serpent 3.3 fair overlay/retry transitions (2026-10-16; BUILD ONLY) |
| v151 | WorldWideGames v151 — Pulsevine Parkour 2.1 Save Integrity (2026-10-16; BUILD ONLY) |
| v152 | v152 — Catalog-Safe Integration of Cyber Wars 0.38 (2026-10-16; BUILD ONLY) |
| v153 | v153 — Emberdeck Pilgrim 1.5 Save & Progression Integrity (2026-10-16; BUILD ONLY) |
| v154 | v154 — Atlas Below 1.6: Expedition Progress Safety — 2026-10-16 (BUILD ONLY) |
| v155 | WorldWideGames v155 — Riftwake Regatta 1.2 (BUILD CANDIDATE, NOT DEPLOYED) |
| v156 | WorldWideGames v156 — Cyber Wars 0.39 catalog-safe focus/visibility integration (2026-10-16; BUILD ONLY, NOT DEPLOYED) |
| v157 | WorldWideGames v157 — Aetherstead Colony 2.3 (2026-10-16; BUILD ONLY) |
| v158 | WorldWideGames v158 — Lattice Armada 1.2 save integrity (2026-10-16; BUILD ONLY) |
| v159 | WorldWideGames v159 — Rune Depths 2.3 local-run checkpoint integrity (2026-10-16; BUILD ONLY — NOT DEPLOYED) |
| v160 | WorldWideGames v160 — Skyvault Cartographer 1.1 survey-record safety (2026-10-16; BUILD ONLY — NOT DEPLOYED) |
| v161 | WorldWideGames v161 — Cyber Wars 0.42 verified integration (2026-10-17; BUILD ONLY — NOT DEPLOYED) |
| v162 | WorldWideGames v162 — Glasswing Polo 2.1 honest Circuit scores (2026-10-17; BUILD ONLY — NOT DEPLOYED) |
| v163 | WorldWideGames v163 — Local Run-History Rendering Security (2026-10-17; BUILD ONLY — NOT DEPLOYED) |
| v164 | v164 — Quiet Protocol 2.1: Earned Extraction — 2026-10-17 (BUILD ONLY) |
| v165 | WorldWideGames v165 — Cyber Wars 0.44 Integration (2026-10-17; BUILD ONLY) |
| v166 | v166 — Neon Serpent 3.4: Earned Crown Coil Records — 2026-10-17 (Build Only) |
| v167 | WorldWideGames v167 - Pulsevine Parkour 2.2: Eight-Course Moving-Rail Circuit (2026-10-17; BUILD ONLY) |
| v168 | WorldWideGames v168 — Safe Imported Keymaps — 2026-10-17 (BUILD ONLY) |
| v169 | WorldWideGames v169 — Solar Loom 1.2 Earned System Records — 2026-10-18 (BUILD ONLY) |
| v170 | WorldWideGames v170 — Vanta Frontline 1.2: Earned Campaign Results (2026-10-18; BUILD CANDIDATE ONLY) |
| v171 | WorldWideGames v171 — Cinderline Velocity 1.1: safe campaign record restoration (2026-10-18; BUILD ONLY) |
| v172 | WorldWideGames v172 — Cinderline Velocity 1.2: earned championship scoring (BUILD CANDIDATE ONLY, 2026-10-18) |
| v173 | WorldWideGames v173 — Cinderline Velocity 1.3: playable low-tier circuit view (BUILD ONLY, 2026-10-18) |
| v174 | v174 — Astral Menagerie 3.3: Earned Atlas & Constellation Score Integrity — 2026-10-18 (BUILD ONLY) |
| v175 | v175 — Cipher Court 1.1: Keyboard and Controller Deduction Gameplay — 2026-10-18 (BUILD ONLY) |
| v176 | WorldWideGames v176 — Mosslight Vale 2.0 Earned Campaign Scoring (2026-10-18; BUILD ONLY) |
| v177 | WorldWideGames v177 — Lattice Armada 1.3: Earned Championship Scores (2026-10-18; BUILD ONLY) |
| v178 | WorldWideGames v178 — Aetherfoil Circuit 1.1 earned championship score integrity (2026-10-18; BUILD ONLY) |
| v179 | WorldWideGames v179 - Tidal Foundry 1.1 keyboard activation integrity (2026-10-19; BUILD ONLY) |
| v180 | WorldWideGames v180 — Tidal Foundry 1.2 earned six-commission rankings (2026-10-19; BUILD ONLY) |
| v181 | WorldWideGames v181 — Ironlight Breach 4.2 earned five-sector rankings (2026-10-19; BUILD ONLY) |
| v182 | WorldWideGames v182 — Aegis Verge 1.3 (2026-10-19; candidate only) |
| v183 | WorldWideGames v183 — Cloudforge Pinball 1.2 mixed-input flipper integrity (2026-10-19; BUILD ONLY) |
| v184 | WorldWideGames v184 — Rift Relay 2.2 honest six-arena rankings (2026-10-19; BUILD CANDIDATE, NOT RELEASED) |
| v185 | WorldWideGames v185 — Pulsevine Parkour 2.3 earned eight-course circuit (2026-10-19; BUILD CANDIDATE, NOT RELEASED) |
| v186 | v186 — Moonwake Angler 1.3: Accessible Cast & Reel — 2026-10-19 (BUILD ONLY) |
| v187 | WorldWideGames v187 — Harbor Pulse 1.2 storage-safe earned shift (2026-10-19; BUILD ONLY) |
| v188 | WorldWideGames v188 — Harbor Pulse 1.3: keyboard, native buttons and controller routing (2026-10-19; BUILD ONLY) |
| v189 | WorldWideGames v189 — Starweaver Drift 1.2: zero-fuel emergency return (2026-10-19; BUILD ONLY) |
| v190 | WorldWideGames v190 — Strata Cipher 1.1: six-site completion integrity (2026-10-20; BUILD ONLY) |
| v191 | WorldWideGames v191 — Fluxward Conclave 1.2 scored-outcome integrity (2026-10-20; BUILD ONLY) |
| v192 | WorldWideGames v192 — Skyvault Cartographer 1.2 earned-only atlas ranking (2026-10-20; DEVELOPMENT CANDIDATE) |
| v193 | WorldWideGames v193 — Emberfield Survival 2.1 ranked Pyre campaign integrity (2026-10-20; BUILD CANDIDATE ONLY) |
| v194 | WorldWideGames v194 — Neon Stack 2.1 earned-contract ranking integrity (2026-10-20; BUILD ONLY) |
| v195 | WorldWideGames v195 — Parallax Accord 1.3 earned campaign integrity (2026-10-20; BUILD ONLY) |
| v196 | WorldWideGames v196 — Stoneveil Ascent 1.1 earned summit scoring (2026-10-20; BUILD ONLY) |
| v197 | WorldWideGames v197 — Lantern Line 1.1: Honest Six-Stop Shift — 2026-10-20 (BUILD ONLY) |
| v198 | WorldWideGames v198 — Spectra Safari 1.1 shutter reliability (2026-10-20; BUILD CANDIDATE ONLY) |
| v199 | WorldWideGames v199 — Hushwave Operator 1.2: Accessible One-Action Radio Samples (2026-10-20; BUILD ONLY) |
| v200 | v200 — Atlas Below 1.7: Solvable Crystal Census — 2026-10-20 (BUILD ONLY) |
| v201 | v201 — Starfall Observatory 1.1: One Capture Per Press — 2026-10-21 (BUILD ONLY) |
| v202 | v202 — Glasswild Ascent 1.1: Earned Three-Course Ranking — 2026-10-21 (BUILD ONLY) |
| v203 | v203 — Runelight Locksmith 1.1: deliberate input parity (2026-10-21, BUILD ONLY) |
| v204 | v204 — Quiet Protocol 2.2: Controller Start Can Resume (2026-10-21, BUILD ONLY) |
| v205 | v205 — Windward Cargo 1.4: focus-safe delivery flights (2026-10-21; BUILD ONLY) |
| v206 | v206 — Moonwake Angler 1.4: Fair Active Fishing Clock — 2026-10-21 (BUILD ONLY) |
| v207 | v207 — Skyhook Sprint 1.4: Fair Active Speedrun Clock — 2026-10-21 (BUILD ONLY) |
| v208 | v208 — Railspire Dispatch 1.2: Fair Active Dispatch Shift (2026-10-21, BUILD ONLY) |
| v209 | v209 — Cloudforge Pinball 1.3: Safe App Switching (2026-10-21, BUILD ONLY) |
| v210 | v210 — Neon Serpent 3.5: Fair Ready and Focus-Safe Snake (2026-10-21, BUILD ONLY) |
| v211 | v211 — Tetherline Salvage 1.2: Fair Active Salvage Shift (2026-10-21, BUILD ONLY) |
| v212 | v212 — Pulsevine Parkour 2.4: Fair Eight-Course Speedrun Timing (2026-10-22, BUILD ONLY) |
| v213 | v213 — Signal Choir 1.3: Honest Replay Scoring (2026-10-22, BUILD ONLY) |
| v214 | v214 — Lumen Relay 1.2: All Six Routes Now Winnable (2026-10-22, BUILD ONLY) |
| v215 | v215 — Mirrormesh Relay 1.1: Genuine Six-Stage Completion Scoring (2026-10-22; BUILD ONLY) |
| v216 | v216 — Command Bloom 1.2: Earned Core Credits and Reliable Program Cancellation (2026-10-22; BUILD ONLY) |
| v217 | v217 — Prismweave Atelier 1.1: Stable Commission Transitions — 2026-10-22 (BUILD ONLY) |
| v218 | WorldWideGames v218 — Starfall Observatory 1.2 (2026-10-22; BUILD ONLY — NOT PUBLISHED) |
| v219 | WorldWideGames v219 — Pulse Archive 1.4 (2026-10-22; BUILD ONLY, NOT RELEASED) |
| v220 | WorldWideGames v220 — Glasswing Polo 2.2: Deliberate Serve & Fair Matches (2026-10-22; BUILD ONLY) |
| v221 | WorldWideGames v221 — Harbor Pulse 1.4 (2026-10-23; BUILD ONLY) |
| v222 | WorldWideGames v222 — Echo Bazaar 1.2: Keyboard-Accessible Trading (2026-10-23; BUILD ONLY) |
| v223 | v223 — Hearthline Kitchen 1.2: Fair Foreground Service — 2026-10-23 (BUILD ONLY) |
| v224 | WorldWideGames v224 - Aegis Verge 2.0: Coverfront |
| v225 | WorldWideGames v225 - Divergent v224 branch reconciliation (2026-10-23; BUILD ONLY) |
| v226 | WorldWideGames v226 - Cinderline Velocity 1.4: Directionally Validated Checkpoints (2026-10-23; BUILD ONLY) |
| v227 | WorldWideGames v227 — Emberfield Survival 2.2 Nova Burst lethal-hit resolution (2026-10-23; BUILD ONLY) |
| v228 | WorldWideGames v228 — Blackglass Watch 1.2 stable evidence controls (2026-10-23; BUILD ONLY) |
| v229 | WorldWideGames v229 — Mosslight Vale 2.1: Terrain-Consistent Pursuit (BUILD ONLY) |
| v230 | WorldWideGames v230 — Skyvault Cartographer 1.3 flight input integrity (2026-10-23; BUILD ONLY) |
| v231 | WorldWideGames v231 — Kiteglass Drift 1.1 swept gate scoring (2026-10-24; BUILD ONLY) |
| v232 | WorldWideGames v232 — Kiteglass Drift 1.2 flight integrity (2026-10-24; BUILD ONLY / RELEASE HOLD) |
| v233 | WorldWideGames v233 - Competitive score precision (2026-10-24; BUILD ONLY) |
| v234 | v234 — Ironlight Breach 4.3: Tactical enemy pursuit and readable attacks (2026-10-24; BUILD ONLY) |
| v235 | v235 — Vector League 1.3: Player-controlled kickoff and fair match clock (2026-10-24; BUILD ONLY) |
| v236 | v236 — Ashen Covenant 2.2: Earned Pilgrimage Scoring (2026-10-24; BUILD ONLY) |
| v237 | WorldWideGames v237 — Frostline Rescue 1.2: Fair Rescue Shift and Input Recovery (2026-10-24, BUILD ONLY) |
| v238 | v238 independent release hold (2026-10-24, BUILD ONLY) |
| v239 | v239 — Deepwater Signal 1.4: Fair Dive Timer (2026-10-24, candidate only) |
| v240 | WorldWideGames v240 / BUILD ONLY |
| v241 | WorldWideGames v241 / BUILD ONLY |
| v242 | WorldWideGames v242 / BUILD ONLY — 2026-10-25 |
| v243 | v243 working-source validation completed — 2026-10-25, BUILD ONLY |
| v244 | v244 independently-extracted build qualification completed (BUILD ONLY) |
| v245 | v245 — Quiet Protocol: Ghostline 2.3 — Terrain-consistent guards (BUILD ONLY, not deployed) |
| v246 | v246 — Riftwake Regatta 1.3: fair deliberate heat start + replay (BUILD ONLY; 2026-10-25) |
| v247 | 2026-10-25 / v247 — Hexbound Tactics 1.3 non-pointer tactical control integrity (BUILD ONLY) |
| v248 | 2026-10-25 / WorldWideGames v248 — Windward Cargo 1.5 active-flight fairness (BUILD ONLY) |
| v249 | Additional working-source v249 QA (actual executed checks, 2026-10-25) |
| v250 | v250 executed Build & QA evidence (2026-10-25) |
| v251 | 2026-10-26 · WorldWideGames v251 Crownline Tactics 1.3 (BUILD ONLY) |
| v252 | v252 — Forgeflow 1.1: Accessible Industrial Routing (BUILD ONLY, 2026-10-26) |
| v253 | 2026-10-26 — v253 Rune Depths 2.4: Fair Melee & Brute Counterplay (BUILD ONLY) |
| v254 | 2026-10-26 · v254 — Archive Alchemist 1.1: Honest Six-Commission Deduction (BUILD ONLY) |
| v255 | 2026-10-26 · v255 — Prism Duel 1.3 fair start / focus-safe match (BUILD ONLY) |
| v256 | v256 — 2026-10-26 — Lattice Armada 1.4: Hostile Hull Contact (BUILD ONLY) |
| v257 | v257 — 2026-10-26 — Twinforge Expedition 1.1: Ranked Result Integrity (BUILD ONLY) |
| v258 | 2026-10-26 - v258 Pulsevine Parkour 2.5: Grounded checkpoint and honest respawn (BUILD ONLY) |
| v259 | v259 - Skyhook Sprint 1.5: Supported Checkpoints and Earned Finish - 2026-10-26 (BUILD ONLY) |
| v260 | v260 - Reliable Player Profiles - 2026-10-27 (BUILD ONLY) |
| v261 | v261 — Glyphsmith 1.2: Honest Archive Sprint (BUILD ONLY) — 2026-10-27 |
| v262 | v262 — Cloudforge Pinball 1.4: Fair Nudge Circuit — 2026-10-27 (BUILD CANDIDATE) |
| v263 | v263 — Circuit Rush 2.3: Forward-Gate Racing Integrity — 2026-10-27 (BUILD CANDIDATE) |
| v264 | v264 — Service Worker Cache Isolation (BUILD ONLY, 2026-10-27) |
| v265 | v265 — Ironlight Breach 4.4: Fair Footwork — 2026-10-28 (BUILD ONLY) |
| v266 | v266 — Neon Serpent 3.6: Signaled Hunter Contact — 2026-10-28 (BUILD ONLY) |
| v267 | v267 — Ashen Covenant 2.3: Resilient Pilgrimage Saves — 2026-10-28 (BUILD ONLY) |
| v268 | v268 — Tetherline Salvage 1.3: Reliable Replay — 2026-10-28 (BUILD ONLY) |
| v269 | v269 — Moonwake Angler 1.5: Earned Night Haul — 2026-10-28 (BUILD ONLY) |
| v270 | v270 — Stoneveil Ascent 1.2 (BUILD ONLY, 2026-10-28) |
| v271 | WorldWideGames v271 - Tideglass Surveyor 1.3: Earned Atlas (BUILD ONLY) |
| v272 | WorldWideGames v272 — Signal Choir 1.4: Earned Notes (BUILD ONLY) |
| v273 | WorldWideGames v273 — Driftglass Links 1.1: Fair Replay (BUILD ONLY) |
| v274 | v274 (2026-10-29) — Prism Duel 1.4: Cover-Smart Rival — Build candidate, not released |
| v275 | WorldWideGames v275 — Cinderline Velocity 1.5: Rival Podium Challenge (BUILD ONLY) |
| v276 | WorldWideGames v276 — Frostline Rescue 1.3: Earned Evacuation (BUILD ONLY) |
| v277 | WorldWideGames v277 — Lantern Line 1.2 Fair Active Shift (BUILD CANDIDATE) |
| v278 | WorldWideGames v278 — Blackglass Watch 1.3 Fair Signal Watch (BUILD CANDIDATE) |
| v279 | WorldWideGames v279 — Atlas Below 1.9 Fair Expedition Survival (BUILD CANDIDATE) |
| v280 | WorldWideGames v280 — Command Bloom 1.3 Input-Safe Program Trace (BUILD CANDIDATE) |
| v281 | v281 — Skyhook Sprint 1.6: Precision Landings — **BUILD ONLY** (2026-10-30) |
| v282 | WorldWideGames v282 — Echo Bazaar 1.3: Earned Trading (BUILD ONLY, October 30, 2026) |
| v283 | v283 — Neon Stack 2.2 Precision Placement (BUILD candidate; not a release) |
| v284 | v284 — Vanta Frontline 1.4 Cover-Smart Pursuit (BUILD candidate; not production) |
| v285 | v285 — Cinderline Velocity 1.6 Input-Safe Racing (BUILD ONLY) |
| v286 | 2026-10-30 — v286 Gravity Foundry 1.2: fair trajectories (BUILD ONLY) |
| v287 | v287 verified local Chromium QA — October 30, 2026 |
| v288 | v288 — Glasswing Polo 2.3: Keeper-Safe Rapid Shots (BUILD ONLY, October 30, 2026) |
| v289 | v289 — Neon Serpent 3.7: Terminal Collision Integrity (BUILD ONLY, 2026-10-31) |
| v290 | v290 — Rune Depths 2.5: Threat-Resolved Gates (BUILD ONLY, October 31, 2026) |
| v291 | v291 — Mosslight Vale 2.2: Honest Blade Arcs (BUILD CANDIDATE, not released) |
| v292 | v292 — Skyhook Sprint 1.7: Frame-Fair Traversal (BUILD candidate, October 31, 2026) |
| v293 | v293 — Atlas Below 2.0: Oxygen-Safe Extraction (BUILD candidate only; October 31, 2026) |
| v294 | v294 candidate — Spanwright 1.1: Honest Roadbed Convoys (BUILD ONLY, October 31, 2026) |
| v295 | v295 — Signal Choir 1.5: Focus-Safe Playback (BUILD CANDIDATE; NOT DEPLOYED) |
| v296 | v296 — Pulsevine Parkour 2.6: Frame-Fair Momentum (BUILD ONLY; NOT RELEASED) |
| v297 | v297 — 2026-11-01: Quiet Protocol 2.4 cover-safe relay interactions (BUILD ONLY) |
| v298 | v298 — 2026-11-01: Tetherline Salvage 1.4 collision-resolved ranked extraction (BUILD ONLY; NOT DEPLOYED) |
| v299 | v299 — Aetherfoil Circuit 1.2: Clock-Safe Exchanges — 2026-11-01 (BUILD ONLY) |
| v300 | v300 — Driftglass Links 1.2: Contact-Clear Hazards — 2026-11-01 (BUILD ONLY) |
| v301 | v301 — Lattice Armada 1.5: Focus-Safe Formations (BUILD ONLY, 2026-11-01) |
| v302 | v302 BUILD CANDIDATE — Emberfield Survival 2.3: Readable Boss Counterplay (2026-11-01) |
| v303 | v303 — Windward Cargo 1.6: Terrain-True Ridge Flight (BUILD ONLY; 2026-11-01) |
| v304 | v304 — Moonwake Angler 1.6: Frame-Fair Fishing (BUILD ONLY, 2026-11-01) |
| v305 | v305 — Tideglass Surveyor 1.4: Fresh Uniquely Solvable Atlases (BUILD ONLY; 2026-11-02) |
| v306 | v306 — Cloudforge Pinball 1.5: True Storm Serve — 2026-11-02 (BUILD ONLY) |
| v307 | v307 — Circuit Rush 2.4: Fair Racing Clock — 2026-11-02 (BUILD ONLY) |
| v308 | v308 — Spectra Safari 1.3: Honest Field Photography (BUILD ONLY; 2026-11-02) |
| v309 | v309 — Archive Alchemist 1.2: Fresh Commission Atlas (BUILD ONLY; 2026-11-02) |
| v310 | v310 — Hushwave Operator 1.3: Signal Silhouette (BUILD ONLY; 2026-11-02) |
| v311 | v311 — Echo Bazaar 1.4: Market Ledger — 2026-11-02 (BUILD ONLY) |
| v312 | v312 — Command Bloom 1.4: Trace Stepper (BUILD ONLY; 2026-11-02) |
| v313 | v313 — Neon Stack 2.3: Clear Mobile Playfield (BUILD ONLY; 2026-11-03) |
| v314 | v314 — Pulse Maze 1.3: Reachable Signal Cache (BUILD ONLY; 2026-11-03) |
| v315 | v315 — Neon Serpent 3.8: Clear Mobile Coil (BUILD ONLY; 2026-11-03) |
| v316 | v316 — Mothlight Museum 1.2: Living Galleries — 2026-11-03 (BUILD ONLY) |
| v317 | v317 — Solar Loom 1.3: Earned Habitable System — 2026-11-03 (BUILD ONLY) |
| v318 | v318 — Signal Choir 1.6: Honest Memory Scoring — 2026-11-03 (BUILD CANDIDATE ONLY) |
| v319 | v319 — Railspire Dispatch 1.3: Honest Final Turnout — 2026-11-03 (BUILD ONLY) |
| v320 | v320 — Aetherfoil Circuit 2.2: One Touch per Exchange — 2026-11-03 (BUILD ONLY) |
| v321 | v321 — Forgeflow 1.2: Deadline-Safe Routing — 2026-11-04 (BUILD ONLY) |
| v322 | v322 — Lumen Relay 1.3: Earned Finale — 2026-11-04 (BUILD ONLY) |
| v323 | v323 — Frostline Rescue 1.4: Clear Mobile Evacuation (BUILD ONLY; 2026-11-04) |
| v324 | v324 — Echofall Caverns 1.1: Unobstructed Expedition (BUILD ONLY; 2026-11-04) |
| v325 | v325 — Vector League 1.4: Keyboard-Ready Kick (BUILD ONLY; 2026-11-04) |
| v326 | v326 — Skyhook Sprint 1.8: One Tap, One Grapple (BUILD ONLY; 2026-11-04) |
| v327 | v327 — Neon Stack 2.4: Focus-Safe Mobile Controls (build-only candidate) |
| v328 | WorldWideGames v328 — Strata Cipher 1.2: Unobstructed Mobile Excavation |
| v329 | WorldWideGames v329 — Cloudforge Pinball 1.6: One Tap, One Serve |
| v330 | WorldWideGames v330 — Glasswing Polo 2.4: Deliberate Circuit Serves |
| v331 | WorldWideGames v331 — Lattice Armada 1.6: Readable Attack Signals |
| v332 | v332 — Moonwake Angler 1.7: Release Means Release — 2026-11-05 |
| v333 | v333 — Quiet Protocol 2.5: True Hold-to-Hack (2026-11-05 · BUILD ONLY; NOT RELEASED) |
| v334 | v334 — Riftwake Regatta 1.4: Honest Rival Splits (2026-11-05, BUILD ONLY) |
| v335 | v335 — 2026-11-05 — Frostline Rescue 1.5: Warned Firelines (BUILD ONLY; NOT RELEASED) |
| v336 | v336 — Pulsevine Parkour 2.7: Personal-Best Echo (2026-11-05 · BUILD ONLY · NOT RELEASED) |
| v337 | v337 — Verdant Circuit 1.1: Earned Ecosystem Victory (2026-11-05 · BUILD ONLY · NOT RELEASED) |
| v338 | WorldWideGames v338 — Ashen Covenant 2.4: No Phantom Lords |
| v339 | WorldWideGames v339 — Rift Relay 2.3: Focus-Safe Circuits |
| v340 | v340 — Aetherstead Colony 2.4: Focus-Safe Charters (2026-11-06, BUILD ONLY) |
| v341 | WorldWideGames v341 — Hushwave Operator 1.4: Accessible Signal Tuning (BUILD ONLY, 2026-11-06) |
| v342 | v342 — Mothlight Museum 1.3: Unobstructed Galleries — 2026-11-06 (BUILD ONLY) |
| v343 | v343 — Cipher Court 1.2: Evidence-Bound Dockets — 2026-11-06 (BUILD ONLY) |
| v344 | v344 BUILD ONLY — Gravity Foundry 1.3: Accessible Launch Console — 2026-11-06 |
| v345 | WorldWideGames v345 BUILD ONLY — Driftglass Links 1.3: Intent-Safe Shot Controls — 2026-11-06 |
| v346 | WorldWideGames v346 BUILD ONLY — Strata Cipher 1.3: Readable Excavation Grid — 2026-11-07 |
| v347 | WorldWideGames v347 BUILD ONLY — Parallax Accord 1.4: No Production Auto-Win Controls — 2026-11-07 |
| v348 | v348 (BUILD ONLY) — Quiet Protocol 2.6: Earned Infiltration — 2026-11-07 |
| v349 | v349 (BUILD ONLY) — Neon Serpent 3.9: Earned Crown Coil — 2026-11-07 |
| v350 | v350 BUILD CANDIDATE — Fluxward Conclave 1.3: Earned Territory Victories — 2026-11-07 |
| v351 | WorldWideGames v351 — Circuit Rush 2.5: Earned Circuit Victory — 2026-11-07 (BUILD ONLY) |
| v352 | WorldWideGames v352 — Vector Shatter 2.2: Earned Prism Core — 2026-11-07 (BUILD ONLY) |
| v353 | WorldWideGames v353 — Vanta Frontline 1.5: Earned Extraction — BUILD ONLY — 2026-11-07 |
| v354 | WorldWideGames v354 — Vanta Frontline 1.6: Reachable Deployment — BUILD ONLY — 2026-11-08 |
| v355 | v355 — Lattice Armada 1.7: Earned Armada Championship (2026-11-08, BUILD ONLY) |
| v356 | v356 — Emberfield Survival 2.4: Earned Pyre Crown (2026-11-08, BUILD ONLY) |
| v357 | v357 — Rift Relay 2.4: Earned Six-Arena Circuit (2026-11-08, BUILD ONLY) |
| v358 | v358 — Glasswild Ascent 1.2: Earned Summit (BUILD ONLY; RELEASE BLOCKED) — 2026-11-08 |
| v359 | v359 — Glasswild Ascent 1.3: Reachable Expedition Launch (BUILD ONLY, not deployed) — 2026-11-08 |
| v360 | v360 — Glasswing Polo 2.5: Earned Circuit Championship (BUILD ONLY, not deployed) — 2026-11-08 |
| v361 | v361 — Cinderline Velocity 1.7: Private Race Progression (BUILD ONLY; RELEASE BLOCKED) — 2026-11-08 |
| v362 | v362 — Cinderline Velocity 1.8: Reachable Touch Race Launch (BUILD ONLY; RELEASE QUALIFICATION CANDIDATE) — 2026-11-09 |
| v363 | v363 — Skyvault Cartographer 1.4: Earned Survey Circuit (BUILD ONLY, release qualification candidate) — 2026-11-09 |
| v364 | v364 — Ironlight Breach 4.5: Earned Five-Sector Run (BUILD ONLY) — 2026-11-09 |
| v365 | v365 — Aetherfoil Circuit 2.3: Earned Three-Bout Championship (BUILD ONLY, 2026-11-09) |
| v366 | v366 — Runelight Locksmith 1.2: Visible Pin-Timing Touch Controls (BUILD ONLY, 2026-11-09) |
| v367 | v367 — Aegis Verge 2.1: Private Three-Operation Championship (BUILD ONLY, 2026-11-09) |
| v368 | v368 — Aegis Verge 2.2: Results overlay reset integrity (BUILD ONLY, 2026-11-09) |
| v369 | v369 — Lantern Line 1.3: Compact Touch Targets (BUILD ONLY; 2026-11-09) |
| v370 | v370 — Vector Shatter 2.3: Compact Touch Arena (BUILD ONLY; 2026-11-10) |
| v371 | v371 — Lattice Armada 1.8: Readable Formation Volleys (BUILD ONLY; 2026-11-10) |
| v372 | v372 — Crownline Tactics 1.4: Compact Command Grid (BUILD ONLY; 2026-11-10) |
| v373 | v373 — Frostline Rescue 1.6: Compact Rescue Controls (BUILD ONLY; 2026-11-10) |
| v374 | v374 — Tessera Commons 1.1: Four-Face Civic Edgeworks (BUILD CANDIDATE; 2026-11-10) |
| v375 | v375 — Signal Choir 1.7: Compact Touch Choir (BUILD ONLY; 2026-11-10) |
| v376 | v376 — Neon Serpent 4.0: Compact Landscape Coil (BUILD ONLY; 2026-11-10) |
| v377 | v377 — Kiteglass Drift 1.3: Compact Flight Controls (BUILD ONLY; 2026-11-10) |
| v378 | v378 — Starweaver Drift 1.3: Focus-Safe Survey (BUILD ONLY; 2026-11-11) |
| v379 | v379 - Hushwave Operator 1.5: Compact Signal Console (BUILD ONLY; 2026-11-11) |
| v380 | v380 — Emberdeck Pilgrim 1.6: Fair Active-Time Ranking (BUILD ONLY; 2026-11-11) |
| v381 | v381 — Command Bloom 1.5: Compact Live Debugger (BUILD ONLY; 2026-11-11) |
| v382 | v382 — Rift Relay 2.5: Fair Sweep Hazards (BUILD CANDIDATE; 2026-11-11) |
| v383 | v383 — Tideglass Surveyor 1.5: Evidence Lens (BUILD CANDIDATE; 2026-11-11) |
| v384 | v384 — Moonwake Angler 1.8: Species Surge Reading (BUILD ONLY; 2026-11-11) |
| v385 | v385 — Rootsong Architect 1.1: Stage-Transition Integrity (BUILD ONLY; 2026-11-11) |
| v386 | v386 — Railspire Dispatch 1.4: Mobile Route Sightlines (Build candidate; 2026-11-12) |
| v387 | v387 — Strata Cipher 1.4: Fair Retry Survey Accounting (BUILD candidate; 2026-11-12) |
| v388 | v388 — Pulse Maze 1.4: Fair Retry Score Checkpoint (BUILD candidate; 2026-11-12) |
| v389 | v389 (BUILD ONLY) — Pulse Maze 1.5 compact Start and result controls  /  2026-11-12 |
| v390 | v390 (BUILD ONLY) — Pulse Maze 1.6 session-only save visibility  /  2026-11-12 |
| v391 | v391 (BUILD ONLY) — Windward Cargo 1.7 compact flight sightlines  /  2026-11-12 |
| v392 | v392 — Neon Stack 2.5: Compact Start/Retry Reachability (BUILD ONLY; 2026-11-12) |
| v393 | v393 (BUILD ONLY; 2026-11-12) — Skyhook Sprint 1.9 compact landscape unobstructed controls |
| v394 | v394 (BUILD ONLY; 2026-11-13) — Glasswing Polo 2.6 compact court & two-player touch |
| v395 | v395 (BUILD ONLY; 2026-11-13) — Emberfield Survival 2.5 compact level-up selection |
| v396 | v396 measured results (working tree; independently extracted final artifact is a separate gate) |
| v397 | v397 (BUILD ONLY; 2026-11-13) — Hexbound Tactics 1.4 reachable terminal Replay |
| v398 | v398 — Cloudforge Pinball 1.7 fixed-step fairness (BUILD ONLY, 2026-11-13) |
| v399 | v399 (BUILD ONLY, 2026-11-13) — Command Bloom 1.6: Route Forecast |
| v400 | v400 (BUILD ONLY, 2026-11-13) — Tidal Foundry 1.3: Compact Landscape Workbench |
| v401 | WorldWideGames v401 — BUILD CANDIDATE ONLY (2026-11-13) |
| v402 | v402 — Forgeflow 1.3: Compact Factory Console (BUILD ONLY; 2026-11-14) |
| v403 | v403 — Cinderline Velocity 1.9: Refresh-Independent Driving (BUILD ONLY, 2026-11-14) |
| v404 | v404 (BUILD ONLY; 2026-11-14) — Mosslight Vale 2.3: Readable Enemy Strikes |
| v405 | v405 (BUILD ONLY; 2026-11-14) — Blackglass Watch 1.4: Balanced Shifting Patrols |
| v406 | v406 (BUILD ONLY; 2026-11-14) — Lattice Armada 1.9: Compact Flight Console |
| v407 | v407 — Spectra Safari 1.4: Compact Survey Access (BUILD ONLY; 2026-11-14) |
| v408 | v408 — Chronofold Courier 1.2: Compact Loop Console (BUILD ONLY; 2026-11-14) |
| v409 | v409 (BUILD ONLY; 2026-11-14) — Atlas Below 2.1: Compact Exploration Console |
| v410 | v410 — Crownline Tactics 1.5: Tactical Warden Forecast — 2026-11-15 (BUILD ONLY) |
| v411 | v411 BUILD ONLY — Tetherline Salvage 1.5: Compact Navigation Chart (2026-11-15) |
| v412 | v412 BUILD ONLY — Ashen Covenant 2.5 Compact Combat View (2026-11-15) |
| v413 | v413 BUILD ONLY — Bastion Bloom 1.7 Tactical Touch Command (2026-11-15) |
| v414 | v414 BUILD ONLY — Riftwake Regatta 1.5: Short-Landscape Navigation (2026-11-15) |
| v415 | v415 BUILD ONLY — Starweaver Drift 1.4: Compact Survey Flight (2026-11-15) |
| v416 | v416 BUILD ONLY — Aetherfoil Circuit 2.4: Compact Duel Start (2026-11-15) |
| v417 | v417 BUILD ONLY — Riftwake Regatta 1.6: Penalty-adjusted Rival Standing (2026-11-15) |
| v418 | v418 BUILD ONLY — Kiteglass Drift 1.4: Accessible Short-Landscape Pitch (2026-11-16) |
| v419 | v419 BUILD ONLY — Deepwater Signal 1.5: Compact Dive Start (2026-11-16) |
| v420 | v420 BUILD ONLY — Vanta Frontline 1.7: Launch-first Compact Deployment (2026-11-16) |
| v421 | v421 BUILD ONLY — Blackglass Watch 1.5: Actionable Surveillance Desk (2026-11-16) |
| v422 | v422 BUILD ONLY - Ashen Covenant 2.6: Committed Strikes (2026-11-16) |
| v423 | v423 BUILD ONLY — Railspire Dispatch 1.5: Reachable Dispatch Commands (2026-11-16) |
| v424 | v424 BUILD ONLY — Lattice Armada 2.0 — Deliberate Phase Burst (2026-11-16) |
| v425 | v425 BUILD ONLY — Hushwave Operator 1.7 — Phase-Accurate Signal Lock (2026-11-17) |
| v426 | v426 BUILD ONLY — Neon Serpent 4.2: Precision Brake Works Across Render Frames (2026-11-17) |
| v427 | v427 BUILD ONLY — Glasswild Ascent 1.4: First-View Expedition Launch (2026-11-17) |
| v428 | v428 BUILD ONLY — Hearthline Kitchen 1.3: First-Touch Mobile Service (2026-11-17) |
| v429 | v429 BUILD ONLY — Cloudforge Pinball 1.8: Drains Across the Whole Lower Table (2026-11-17) |
| v430 | v430 BUILD ONLY — Runelight Locksmith 1.3: Fair Active-Time Pin Timing (2026-11-17) |
| v431 | v431 BUILD ONLY — Emberdeck Pilgrim 1.7: Deliberate Card Keyboard Controls (2026-11-17) |
| v432 | v432 BUILD ONLY — Chronofold Courier 1.3: Fair Active-Play Archive Clock (2026-11-17) |
| v433 | v433 BUILD ONLY — Strata Cipher 1.5: deliberate keyboard/gamepad excavation and survey (2026-11-18) |
| v434 | v434 — Mothlight Museum 1.4: Visible Compact Galleries (BUILD ONLY, 2026-11-18) |
| v435 | v435 — Vector League 1.5: Independent Controller Pause (BUILD ONLY, 2026-11-18) |
| v436 | v436 — Gravity Foundry 1.4: Collision-True Orbital Forecast (BUILD ONLY, 2026-11-18) |
| v437 | v437 — Deepwater Signal 1.6: Sonar Echo Bearings (BUILD ONLY, 2026-11-18) |
| v438 | v438 — Kiteglass Drift 1.5: Frame-rate-stable gliding (BUILD ONLY, 2026-11-18) |
| v439 | v439 (2026-11-18) — Riftwake Regatta 1.7: next-gate compass and edge pointer (BUILD ONLY) |
| v440 | v440 (2026-11-18) — Signal Choir 1.8: Controller-Only Six-Round Access (BUILD ONLY) |
| v441 | v441 (2026-11-19) — Starfall Observatory 1.3: compact instrument deck (BUILD ONLY) |
| v442 | v442 (2026-11-19) — Tideglass Surveyor 1.6: controller-only six-chart campaign (BUILD ONLY) |
| v443 | v443 (2026-11-19) — Stoneveil Ascent 1.3: frame-fair summit timing (BUILD ONLY) |
| v444 | v444 — Aetherstead Colony 2.5 (BUILD candidate, 2026-11-19) |
| v445 | v445 (2026-11-19) — Lumen Relay 1.4: six-stage controller-only circuit (BUILD ONLY) |
| v446 | v446 (2026-11-19) — Neon Serpent 4.3: earned-only combo score (BUILD ONLY) |
| v447 | v447 (2026-11-19) — Solar Loom 1.4: proven three-transition habitat (BUILD ONLY) |
| v448 | v448 (2026-11-19) — Echo Bazaar 1.5: one-unit standing limit orders (BUILD ONLY) |
| v449 | v449 (2026-11-20) — Mothlight Museum 1.5: fair active-time search ranking (BUILD ONLY) |
| v450 | v450 — Vanta Frontline 1.8: Honest Final Retry — 2026-11-20 |
| v451 | v451 (2026-11-20) — Twinforge Expedition 1.2: live two-player forge input (BUILD ONLY) |
| v452 | v452 (2026-11-20) — Archive Alchemist 1.4: complete controller-only six-formula expedition (BUILD ONLY) |
| v453 | v453 (2026-11-20) — Ashfall Caravan 2.4: reject unfunded repair decisions (BUILD ONLY) |
| v454 | v454 (2026-11-20) — Command Bloom 1.7: foreground-only program execution and fair score clock (BUILD ONLY) |
| v455 | v455 (2026-11-20) — Tessera Commons 1.2: honest four-symbol civic charter (BUILD ONLY) |
| v456 | v456 (2026-11-20) — Verdant Circuit 1.2: simultaneous ecology turns (BUILD ONLY) |
| v457 | v457 (2026-11-21) — Terrace Keeper 1.2: living soil, crop rotation and a reachable 12-day contract (BUILD ONLY) |
| v458 | v458 (2026-11-21) — Cipher Court 1.3: prevent involuntary gamepad accusations after reconnect/focus loss (BUILD ONLY) |
| v459 | v459 — Hearthline Kitchen 1.4: Controller Service (2026-11-21, BUILD CANDIDATE ONLY) |
| v460 | v460 — Windward Cargo 1.8: Consistent Physics and Flight Clock (2026-11-21, BUILD CANDIDATE ONLY) |
| v461 | v461 — Echo Bazaar 1.6: Keyboard-Safe Standing Orders (2026-11-21, BUILD ONLY) |
| v462 | v462 — 2026-11-21 · BUILD ONLY (NOT RELEASED): Railspire Dispatch 1.6 |
| v463 | v463 — 2026-11-21 · BUILD ONLY (NOT DEPLOYED): Lantern Line 1.4 |
| v464 | v464 — 2026-11-21 · BUILD ONLY (NOT RELEASED): Pulse Maze 1.7 |
| v465 | v465 — 2026-11-22 · BUILD ONLY (NOT RELEASED): Ashfall Caravan 2.5 |
| v466 | v466 — 2026-11-22 · BUILD ONLY (NOT RELEASED): Blackglass Watch 1.6 |
| v467 | v467 — 2026-11-22 · BUILD ONLY (NOT RELEASED): Aetherfoil Circuit 2.5 |
| v468 | WorldWideGames v468 · 2026-11-22 · BUILD CANDIDATE ONLY |
| v469 | v469 — 2026-11-22 · BUILD ONLY (NOT RELEASED): Neon Stack 2.6 |
| v470 | 2026-11-22 — v470 Rift Relay 2.6 foreground simulation fairness (BUILD ONLY) |
| v471 | v471 — Emberfield Survival 2.6: controller upgrade menu (BUILD ONLY, 2026-11-22) |
| v472 | 2026-11-22 — v472 Neon Serpent 4.4: do not erase earned contracts when a legacy unlock is corrupted (BUILD ONLY) |
| v473 | 2026-11-23 — v473 Tetherline Salvage 1.7: foreground clock and physics fairness (BUILD ONLY) |
| v474 | 2026-11-23 — v474 Glasswing Polo 2.7 saved-record integrity (BUILD ONLY) |
| v475 | 2026-11-23 — v475 Aegis Verge 2.3: sanitize untrusted saved operation records (BUILD ONLY) |
| v476 | 2026-11-23 — v476 Ironlight Breach 4.6: validated saved mastery (BUILD ONLY) |
| v477 | 2026-11-23 — v477 Quiet Protocol 2.7: complete gamepad-only outcome navigation (BUILD ONLY) |
| v478 | 2026-11-23 — v478 Vector Shatter 2.4 validated saved mastery (BUILD ONLY) |
| v479 | 2026-11-23 — v479 Vanta Frontline 1.9: fair foreground simulation in tactical FPS (BUILD ONLY) |
| v480 | 2026-11-23 — v480 cold offline platform shell repair (BUILD ONLY) |
| v481 | 2026-11-24 — v481 public offline cache boundary (BUILD ONLY) |
| v482 | 2026-11-24 — v482 Hexbound Tactics 1.5: tactical rival (BUILD ONLY) |
| v483 | 2026-11-24 — v483 Lantern Line 1.5 native button control integrity (BUILD ONLY) |
| v484 | 2026-11-24 — v484 Rootsong Architect 1.2: native garden and replay controls (BUILD ONLY) |
| v485 | 2026-11-24 — v485 Pulse Maze 1.8: fatal collision precedes maze clear (BUILD ONLY) |
| v486 | 2026-11-24 — v486 Skyhook Sprint 2.0: controller replay (BUILD ONLY) |
| v487 | 2026-11-24 — v487 Driftglass Links 1.4: reliable cup capture (BUILD ONLY) |
| v488 | 2026-11-24 — v488 Cloudforge Pinball 1.9: accessible flippers (BUILD ONLY) |
| v489 | 2026-11-25 — v489 Neon Serpent 4.5: controller slot integrity (BUILD ONLY) |
| v490 | 2026-11-25 — v490 Emberfield Survival 2.7: terminal-state integrity (BUILD ONLY) |
| v491 | 2026-11-25 — v491 Cinderline Velocity 2.0: race-result lifecycle integrity (BUILD ONLY) |
| v492 | 2026-11-25 — v492 Ironlight Breach 4.7: sector-result integrity (BUILD ONLY) |
| v493 | 2026-11-25 — v493 Bastion Bloom 1.8: terminal defense integrity (BUILD ONLY) |
| v494 | 2026-11-25 — v494 Lantern Line 1.6: input-neutral braking score (BUILD ONLY) |
| v495 | 2026-11-25 — v495 Moonwake Angler 1.9: controller-only replay (BUILD ONLY) |
| v496 | 2026-11-25 — v496 public-only recovery staging (BUILD ONLY) |
