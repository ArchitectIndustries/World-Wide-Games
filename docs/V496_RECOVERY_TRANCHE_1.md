# v496 recovery tranche 1: Lattice Armada and Vanta Frontline

Source: saved full `WorldWideGames_v496.zip`, SHA-256 `5cfe087b598e175cfe8a885cd734a657c4a2d51e1d884e8db4e7fc08df2f67be`; source game versions Lattice Armada 2.0 and Vanta Frontline 1.9. GitHub parent `161d321addef199be98c26f15500a1e6327ec698`. Scope is two executable files plus corresponding metadata, tests and cache revision. Keep current shared input exactly (`3c038a375983c2474e34c1b8683be681f41535b0` Git blob), Vercel configuration, all other games and the newer eight titles unchanged. No archive-wide merge, new assets, dependencies or payments. Covers already match by Git blob. Aegis Verge/Flagship and Cyber Wars need independently reconciled integration; shared profile and service-worker changes remain outstanding.

- Lattice Armada: earned campaign scoring, no shipped mutable test shortcuts, warned enemy volleys, deliberate burst (no auto-spend on recharge), blur/pause recovery, compact playfield, safe records, and honest unscored defeats. Preserves the November 26 CSS hidden/pointer-events hotfix; moves launch/resume controls before the briefing and sector grid so they are reachable immediately at 320x240.
- Vanta Frontline: three operations, cover-aware enemies, controller support, compact deployment, fair foreground timing with substeps, and correct final-operation retry preserving prior earned points only.

## QA

Real headless Chromium with embedded first-party files, original runtime loops and explicitly injected test-only accessors or synthetic fixtures for selected assertions. Native launch/tap, keyboard movement, pause/resume, and overlay hit-testing were exercised. Not direct live-origin, physical devices/controllers, or full unassisted campaign completion. Existing tests/menu_visibility.py additionally passed the launch, keyboard, pause/resume and forced-sector continuation regression. The release gate uses actual GitHub branch review and Vercel status separately.

| Suite | Passed | Total |
| --- | ---: | ---: |
| lattice-burst | 36 | 36 |
| lattice-compact | 131 | 131 |
| vanta-cadence | 114 | 114 |
| vanta-retry | 42 | 42 |
| recovery-launch | 78 | 78 |
| **Selected assertions** | **401** | **401** |
