# Arcade Nights live-site addition — November 26, 2026

## Scope

Add six original games to the existing WorldWideGames catalog: Aurora Hockey, Skyline Hoops, Lightline Circuit, Orchard Slice, Mosaic Memory, and Tabletop Commons. Tabletop Commons contains Four in a Row, Noughts & Crosses, English Checkers, and Domino Draw.

This is the additive release in PR #7. It does not reconcile the recovered v496 runtime, add Cyber Wars from that archive, replace existing games, or import a new build/deployment system.

## Verified live site and source baseline

The user supplied https://worldwidegames.vercel.app/game.html?id=parallax-accord. A real browser successfully opened that game and its live library. The homepage served to the browser displayed 82 games and 129 genres; it loaded the v70 shell script URLs. The exact live-alias commit is unproven. The recovery archive label v496 is a build version, not a catalog size.

Canonical main was re-read at `37f48c6ab75c47e89050ec7ee467cc87c0e8258a`. Its 82-game catalog receives six additive registrations, giving **88 games**. PR #7's gameplay commit is `fefaf53b2cbbeabdc8c68cba55c850c5f5d579a3`.

A Git tree comparison shows that the gameplay patch adds 37 public files, eight test files, and its handoff. Existing runtime changes are limited to one expansion script insertion in each shell and the service-worker asset/cache update. No legacy game file or `js/games.js` blob changes. No existing path is deleted.

## Validation

The additive-main fixture passed **51/51 Node test entries**, with 82 base entries, 88 expanded entries, and 212 unique precache URLs. All 37 new public files match the gameplay-QA source byte-for-byte (219,188 bytes). The fixture is not a fresh manual replay of all legacy games.

The new games were previously exercised in the managed Chromium preview, including earned basketball scores, slicing interaction, a completed memory gallery, board-game wins, Checkers input/focus and Domino handoff, start/pause/restart behavior, and narrow CSS viewport layouts. Full details and evidence limits remain in [the arcade handoff](arcade-expansion-2026-11-25.md).

Every original service-worker asset URL is retained. The update removes duplicate entries, includes the new runtime files and exact shell queries, advances the cache version, and limits retired-cache deletion to WorldWideGames cache names. Original install/fetch behavior is retained. Production-origin/offline installation remains to be checked after publication.

## Deployment observations

The established site is live. Both historical v70 and v72 commits have successful Vercel status records under the original Architect Industries / worldwidegames project. A successful status does not by itself establish the production alias's current commit.

The connected deployment tool currently cannot resolve the original project. PR #7's attempted Git preview reported a private-organization-repository/Hobby-plan rejection. Similar initial status errors on historical commits were followed by successful deployments, so the rejection is an observed integration failure, not proof that the site is down or that every existing deployment route requires an upgrade.

The browser available to this session opens the Vercel dashboard at a sign-in page. The user's separately opened Vercel session is not shared with it. Use the existing project's authorized access path to publish this additive source and verify the new live game routes. No duplicate project, paid upgrade, repository visibility change, or broader recovery overwrite is part of this task.

## Release status

Source validation is complete. The PR/merge record is authoritative for canonical synchronization. The six additions are not claimed live until the production origin displays them and a game launches successfully.
