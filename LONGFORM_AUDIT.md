# WorldWideGames Long-form / Regression Audit — v66

Date: 2026-10-06
Owner/operator: Architect Industries

The v66 run deliberately prioritized a false-success defect in an existing rhythm game rather than catalog growth. Pulse Archive 1.1 treated elapsed song time as success regardless of accuracy; a zero-hit run could produce the same `archive-cleared` completion signal as skilled play.

Pulse Archive 1.2 separates run completion from successful synchronization. The song may end at any accuracy, but only 70% or better yields `archive-cleared`; lower results emit `archive-desynced` and display a failure state. Existing keyboard, touch, gamepad, scoring, replay, and procedural audio behavior remains intact.

Regression coverage retains recent rules/progression repairs for Parallax Accord, Hexbound Tactics, Command Bloom, Emberfield Survival, Orbit Breaker, and Verdant Echoes, plus the bounded 82-title interaction baseline and local HTTP path validation.
