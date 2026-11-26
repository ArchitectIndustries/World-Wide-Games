# WorldWideGames — v497 integrated source

Date: November 26, 2026 (America/New_York)
Owner/operator: Architect Industries
Canonical repository: ArchitectIndustries/World-Wide-Games
Production target: https://worldwidegames.vercel.app/
Existing Vercel project: prj_CgW1xTHIZOOe1R4RNzcByfvxantq

## Recovery scope

The starting canonical main was `8ffd27a4aa115ff4647c0946e5eea032b91504f9`, containing the old 82-game base and six Arcade Nights additions. Public production still loaded v70 and 82 catalog entries. Its newest added-game date was October 4.

This source integrates the complete v496 cumulative game source, the current six additions, Mosaic B1, profile B2, Aegis F3D95 and Cyber Wars 0.64. During publication, main advanced to `f33d5ffd014f132af21c24eef730c2de122e9535`, adding Stormwake Rescue and Iron Meridian and publishing Lattice/Vanta repairs. Those concurrent changes are preserved. All original games remain. The result is **91 catalog entries**, not 497 games. The B3 worker was deliberately excluded because its fixes were superseded by v480–v481 and it would have regressed the cache boundary.

The current user explicitly authorized integration and production publication; previous build-only task restrictions describe their earlier scope. No replacement project, billing change, force push or new relay hosting is part of this recovery.

## Live-specific report

The user reported that Lattice Armada’s option picker obstructs gameplay. Public source confirmed that `.menu{display:grid}` overrode the hidden attribute. The missing `.menu[hidden]{display:none!important}` correction first appeared in v100 on October 10 and was retained in this integrated release. Current browser launch and resume remove the picker from both the accessibility layout and its measured bounding box. A 26-check regression also covers pause, keyboard actions, restart, focus changes and score integrity.

## Source integrity and verification

See RELEASE_RECORD.json for provenance and TEST_REPORT.md for exact verification scope. The production build emits release.json with the built commit and file hashes. Publication is established by checking that live receipt and executable bytes after Git synchronization; historical successful preview deployments are insufficient.

## Remaining platform limits

Physical devices/controllers, screen readers, all browser engines and uninterrupted full campaigns have not been exhaustively certified. Fresh Node checks cover the integrated logic and package; current browser interactions cover representative launch and control flows. Optional online relay activation remains separate.
