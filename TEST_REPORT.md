# v499 release verification

Date: November 26, 2026

Status: **VALIDATED_RELEASE_SOURCE**

Published baseline: v498 commit `e08e18a641dde60183f01737ba3fa50b732e10a5`. Automated checks, modeled rendering/input and actual browser observations are recorded separately. The live receipt and bytes are verified after publication.

## Final release checks

| Check | Result | Scope |
| --- | ---: | --- |
| Combined dynamic 3D runner | 82/82 entries | Model cases and script-level programs; embedded assertions below are separate units |
| Player layout and visible-time clock | 8/8 cases | Same-iframe toggles, stored preferences, focus routes, fullscreen refusal, resize/disposal, background exclusion, fractional time and history restore |
| Release staging | 5/5 cases | 92 unique registrations, target versions, complete public hashes, excluded engineering files, exact cache queries and executable parsing |
| Arcade Nights | 51/51 cases | Existing six-game model/input/result contracts, rerun during v499 integration |
| Profile storage | 198/198 checks | Original malformed records preserved; valid neighbors and session-only fallback remain usable |
| Specialist integration | 40/40 checks | Existing Aegis save/menu and Cyber Wars river progression/authority contracts |
| Lattice menu | 26/26 checks | Picker visibility, launch/retry/resume, focus and score guards |
| Flagship programs | 91/91 programs | Existing 90 plus the exact F3D97 test; fresh complete sweep |
| Worker contract | 114/114 checks | 331 unique precache URLs, all 92 games, exact shell queries, atomic failure, owned-cache cleanup and public boundaries |
| Asset preparation | 9/9 cases | Verified preparation/reuse, bounded failure/recovery and output exclusion |
| Cache fingerprint experiments | 7/7 checks | Stable unchanged build; edited runtime creates a different cache; exact revert restores all original hashes |

The built output contains **348 public files**, totaling **11,365,758 bytes** before `release.json`. The receipt itself is generated separately. All eight prepared upstream resource outputs were independently hash-verified in the isolated cache test. The provider manifest/pipeline are unchanged from v498; the recorded v498 clean network download is historical evidence, not a new v499 transfer claim.

## Focused checks

| Area | Result | Evidence |
| --- | ---: | --- |
| Solstice model | 23/23 cases | Full input-driven campaign; operated Tideworks; single spending; locked crossing; v1.0 migration; guarded warden, walking evasion and one-time fresh scores |
| Solstice runtime/input | 13/13 cases | Keyboard/touch/controller machinery, overlay menus, focus, neutral rearm, persisted page exit/return and one-time teardown |
| Solstice geometry | 5/5 cases | Shared geometry/collision bridge width and deployment; camera clearance; budget at 1000×600 and 1320×720; ocean exclusion |
| Shared Solstice renderer | 6/6 cases | Clipping, transforms, hidden/instanced meshes, material state, resize bounds and disposal |
| Aegis articulated rigs | 54/54 checks | Real geometry, materials, weakpoint/aim alignment, travel/recoil, pure rendering, allocations and final-wave bounds |
| Aegis integrated input | 34/34 checks | Reproduced old stale-repeat defect, fixed ownership, interruption and exact pointer modules |
| Exact F3D97 module test | 22/22 assertions | Owned-pointer release outside controls and capture-loss/cancel scenarios |
| Aegis established checks | 65 world; 295 Signal Forge; 14 Engine; 38 HUD | All pass; original gameplay, shader fallback, instance storage and guide contracts retained |
| Cyber Wars archive | 18/18 cases | Exact canonical texts, actual walking approaches to all lecterns, reading/manual separation, pause/focus, named targets and state-derived consequences |
| Cyber Wars lifecycle | 7/7 cases | Hidden/unfocused modal input, neutral return, suspended callbacks, guide buttons, idempotent local channel restore and no automatic Internet join |
| Cyber Wars established checks | 1,295 visual; 14 guide; 14 Engine | All pass; renderer state and existing guide boundaries retained |
| Cyber Wars published comparison | 8/8 states | Full gameplay snapshots, solid maps and owned-home checkpoint bytes match published v498/CW 0.65 |

An independent reviewer reproduced the original Cyber Wars background-A and closed-channel defects, then reran those same reproductions successfully after the fixes. Aegis’s persisted-navigation review retained its engine and explicit resume behavior. These are source/model observations, not native BFCache or physical-controller certification.

## Actual Chrome observations

Environment: cloud Chrome with software 3D. Expanded frame **1322×737**; standard frame **978×550**; expanded frame after a view status message **1322×706**.

**Solstice Wilds:** Continued an earned v1.0 Archive checkpoint as practice. Walked to the workshop, pulsed crates and sentinels, physically collected four parts and installed the counterweight. Matched the sluice to Leaf, operated the winch and paused during lowering. Standard/expanded layout changes preserved the paused runtime. After resume, the crossing locked and saved a checkpoint. The player crossed north; the warden showed the marked charge and charging states, missed after a sideways dodge, opened its core and took visible pulse damage. This was not a full browser campaign win.

**Aegis Verge:** Deployed Salt Bastion, observed the Vesper and distinct hostile rigs, drove/steered and fired, paused with P and changed camera through Settings. Game info followed by Back to game produced the focus-pause notice and required explicit resume. Native capture-refusal and stale OS-repeat scenarios remain modeled evidence.

**Cyber Wars:** The steward briefing focused Continue, blocked held W and closed cleanly with P. Walked to the right-hand lectern and opened The Hundred-Credit Roof; used text sizing, All readings, the Lake reading and keyboard Right to the Beetle reading. The Pilot manual handoff retained its deliberate Rank 1 study: the next page enabled study, and the resulting briefing focused Continue. Credits stayed 21.000. Walking around existing columns reached the archivist; E opened the catalogue showing Pilot Rank 1/10. P closed the catalogue and restored canvas focus; Pause opened the established field menu.

**Shell:** Expanded desktop default, 978×550 standard mode, info navigation, Back to game and restoration of the expanded view were exercised without reloading the game. The automated clock suite separately verifies hidden-time exclusion and fractional accumulation. No elapsed playtime precision claim relies solely on screenshots.

## Material performance limits

Very slow software rendering exposed inherited frame-dependent slowing. Cyber Wars accepts at most 35 ms per rendered callback; Solstice accepts 250 ms. These caps are unchanged from v498. The exact native frame rate was not measured and is not claimed. A deterministic Solstice probe showed that a 12-second unobstructed walk covers 63.6 m at 4–60 callbacks/second, 31.8 m at 2, and 15.9 m at 1 because excess wall time is discarded. The new scenery remains within its declared geometry budget, but that alone does not qualify performance.

The next rendering milestone should profile projection/shading, camera tests, Canvas calls and HUD work, then add adaptive software resolution/detail and earlier visibility rejection. Simply raising a catch-up cap would leave rendering delay unresolved. No 60 FPS, hardware WebGL, mobile-device, physical-controller, screen-reader or other-engine certification is claimed here.

## Publication gate

After a clean source commit, rebuild and compare production `release.json` with its exact commit, v499 version, 92-game catalog, 3.1/0.66/1.1 game versions and generated worker cache. Verify every staged public file’s SHA-256 at the established domain and confirm engineering routes stay excluded. Actual live launch/focus/picker checks follow that byte verification. The machine-verifiable live receipt is the deployment identity authority.
