# WorldWideGames agent coordination (proposal; PR only)
Three independent development tracks: Catalog Build & QA, Flagship 3D, and Cyber Wars Unified Production. This repository owns the WorldWideGames catalog, but does not become the canonical authority for Cyber Wars canon. An independent Release & Deploy workflow owns actual main promotion and Vercel deployment. Never deploy from these agent branches.

## Specialist ownership
- `catalog-qa`: game/platform QA, historical Astral Menagerie and Orbit Breaker defects, accessibility, scores, input and savings.
- `flagship-3d`: one original *non-Cyber-Wars* 3D vertical slice, dedicated renderer, assets, interaction and production pipeline. Do not use separate protected game assets or invent AAA fidelity.
- `browser-performance`: evidence-backed FPS/frame times, memory, startup, tiered fallback; no inference from script-smoke durations.
- `security-review`: persistence/input/score/release integrity and rights.

## Pilot: Flagship 3D
First validate whether Ironlight Breach or a better existing non-Cyber-Wars title has a suitable code base; then establish a 10–15 minute playable target, a scene benchmark, original/licensed asset manifest, input and accessible settings, and an incremental visual/gameplay implementation plan. Keep a single designated flagship. Treat 83 registered games in the v305 candidate as unverified by canonical main (canonical README says 82): always inspect exact candidate rather than transferring counts.

## Build-only gate
1. Read DEVELOPMENT_STANDARDS.md, current main HEAD and verified /WorldWideGames candidate, report both. Candidate archives need SHA-256 and separate merge ancestry, not guessed Git history.
2. Pick one bounded objective; use isolated worktree/branch; record owned paths and source/provenance. Each specialist owns separate files until handoff; coordinator resolves conflicts.
3. Focused real-browser input, objective, save/reload and score tests plus catalog regressions; supply visual/gameplay + measured performance evidence when relevant.
4. Independently extract full final artifact; verify hashes and isolated exact-parent patch; prepare state/release documentation.
5. Submit draft PR or isolated ZIP for human/independent review. No direct canonical main writes, release tags, production deploy or secrets in agent code.
6. Release authority is independent: existing Release & Deploy task is currently paused. CI checks are useful quality gates but do not, by themselves, configure branch protection.

## Running the pilot
Use a compatible GitHub Copilot cloud/CLI or Codex client to select a specialist profile from .github/agents; only a session with actual execution permissions can run it. The mere presence of these files and .codex/config.toml does not schedule or execute agents. Run `node tools/agent-readiness.mjs` for static agent configuration; this is not game QA.