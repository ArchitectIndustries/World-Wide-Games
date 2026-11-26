# Canonical source recovery scope — November 26, 2026

This recovery brings the accumulated WorldWideGames application and game changes into one maintainable source tree. Build numbers identify development revisions; they do not count games or successful production deployments. The reconciled catalog contains 91 registered games, including the six Arcade Nights additions and the two games subsequently added to main.

## What the canonical repository retains

- Every path already tracked on the verified current main baseline, commit `f33d5ffd014f132af21c24eef730c2de122e9535`. This recovery does not remove existing main files as a cleanup step.
- Complete current game implementations and their assets, covers, shared platform code, optional Cyber Wars relay service, requirements, and public-build tools. The public website remains a generated subset of this source; engineering files and the relay source are not public website assets.
- The complete cumulative release history, indexed by `RELEASE_NOTES.md` and preserved in ordered readable parts under `docs/release-history/`, including all 424 recorded revisions from v73 through v496 plus the current integrated release notes. `RECOVERED_CHANGE_HISTORY_2026-11-26.md` provides the grouped explanation and complete revision index.
- License and third-party notices, per-game provenance, the Cyber Wars notices and integration handoff, and the full structured source research in the lossless `docs/research/GAME_SOURCE_LIBRARY.json.gz` archive. Its README gives the exact decompression command and original checksum.
- The 90 flagship unit tests, the existing main test files, Arcade Nights regressions, current recovery and specialist integration tests, Cyber Wars 0.64 cargo tests, and selected recent catalog/cache/public-staging regressions. Retained historical browser fixtures are test source, not claims that they ran successfully in the current environment.

The source selection is based on paths and current contents. It does not replace a complete game with an older archived version, remove game features to reduce upload size, or alter the public build merely to match an archive revision label.

## Historical material retained in recovery archives

The complete, unfiltered v496 source archive remains preserved as:

`WorldWideGames_v496.zip`

SHA-256: `5cfe087b598e175cfe8a885cd734a657c4a2d51e1d884e8db4e7fc08df2f67be`

That archive preserves the original historical test programs, JSON results, logs, screenshots, per-build file manifests, packaging receipts, research narratives and handoff records. Independent flagship, Cyber Wars and November 26 recovery packages retain the provenance of their separately reconciled changes. Those packages are development evidence; their existence alone does not prove a production deployment or current test result.

The canonical source import omits newly recovered duplicate historical evidence and superseded test variants from its active tree. In particular, it does not bulk-import thousands of old test outputs or repeated source-hash inventories. The large narrative research exports `FRONTIER_GAME_TECH.md`, `GAME_SOURCE_LIBRARY.md`, `SOURCE_RESEARCH_PLAYBOOK.md` and `SOURCE_STUDY_NOTES.md` remain in the preserved archive; the complete structured source library (losslessly compressed), licenses, per-game provenance, complete release-note parts and revision index remain in the repository. Existing main paths are retained even when they contain older test evidence.

These omissions concern repository organization and historical evidence, not gameplay or application source. A complete historical reproduction can begin with the corresponding preserved archive and its checksum. Current reproducible builds should use this canonical tree and its documented build commands.

## Release traceability

The preparation manifest records the exact selected paths, content sizes, SHA-256 hashes and Git blob identities, together with the verified remote baseline. It is generated from the reconciled working tree before immutable Git objects are uploaded. Unchanged baseline objects are reused; changed objects are assembled into the final source tree without deleting the complete local recovery.

Final release receipts, test reports and deployment verification are recorded separately. Historical tests and archive checksums must not be presented as fresh browser, physical-device, installed-PWA or production verification.
