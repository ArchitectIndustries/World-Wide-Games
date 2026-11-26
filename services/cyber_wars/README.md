## Cyber Wars 0.27: coalesced presence snapshots (BUILD ONLY, 2026-10-13)

**Single objective:** In a room with multiple moving guests, a healthy but moderately constrained recipient could accumulate twelve obsolete positional updates and be disconnected with 1013 even though newer updates superseded the old ones. The v0.26 relay delivered every pose FIFO. v0.27 retains its bounded per-socket send worker, 0.35-second timeout, 12-slot limit, origin/room/protocol and invalid-message checks, but supersedes *queued, unsent* `peer` snapshots of the same ID within each uninterrupted pose segment. Each immutable `signal-state`, `peer-left`, and other control event is an ordering barrier and always delivered FIFO. In-flight frames are never rewritten. On genuine saturation by distinct events, the existing bounded 1013 close remains.

A controlled finite-speed receiver (~40ms per send) received the newest of 105 emitted position updates across distinct segments with both co-op signal revisions in order and no unnecessary disconnect. The unchanged v0.26 relay reproduced the early 1013 disconnect in this test. This is an **anonymous opt-in ephemeral co-presence** improvement, not logged-in, authenticated or persistent multiplayer. The experiment has no shared currency, combat authority, save storage, voting, or verified human identity. No software/content dependencies added. Run `python tests/cw_027_pose_coalescing.py` and inherited relay tests; production hosting remains disabled.

# Cyber Wars network presence and co-op relay (v89 opt-in prototype)

An original Python/asyncio WebSocket relay for **cross-device, real-network
co-presence and a first zero-reward cooperative world interaction in Viridia**. This is **NOT a multiplayer RPG**:
the only authoritative world action is a temporary two-station signal puzzle; there is no server-authoritative combat, credits, inventories, saves,
contributions, building, world mutations, elections, or registered player identity system. A server-issued guest capability allows ephemeral reconnection only.
Nothing is written to disk. Offline owned-home checkpoints remain local.
Do not expose this service as a finished online RPG.

## Cyber Wars 0.26 — Slow-recipient isolation (BUILD ONLY, 2026-10-13)

The experimental relay now maintains one bounded FIFO outbound queue per connected guest
(maximum 12 queued co-op or presence messages), and a single asynchronous sender per
recipient. A slow socket's writes time out after 0.35 seconds; exhausted queues trigger
a 1013 slow-recipient close, while healthy guests continue receiving room broadcasts.
This stops one stalled client from stalling all other peers in the room or accumulating
unbounded queued position updates. Ordering of signal-state revisions is preserved for
healthy peers. Queued presence is ephemeral and is NOT persistent progression data.

Test with `python tests/cw_026_relay_slow_client.py` and the preexisting v83/v84/v86/
v87/v89 multi-client relay and browser suites. Loopback and simulated-stall results
are not production-WAN latency evidence. This is still a single-process, optional,
unauthenticated presence and zero-reward cooperative interaction relay; **no internet
RPG persistence or economy authority is claimed**.

## Local test

Requires Python 3.11+ and `websockets==16.0` (BSD-3-Clause, externally installed).

```sh
python -m pip install -r services/cyber_wars/requirements.txt
# Terminal A
python services/cyber_wars/relay.py --allow-origin http://localhost:8000
# Terminal B (separate terminal)
python -m http.server 8000
```

In the Cyber Wars game, the signed-off relay endpoint must be set in the
`<meta name="cyber-wars-relay" content="">` tag to an approved
`ws://127.0.0.1:8765/ws` URL for local development. The browser uses the
existing BroadcastChannel-only local mode if no endpoint is configured or
if the relay is unreachable. QA `?qa=1&relay=...` override is accepted only
in localhost or about:blank contexts, never on a public production domain.

## Production requirements (not configured/deployed by Build)

- Deploy separately on a trusted WebSocket-capable host or port the protocol
  to a Cloudflare Durable Object. The existing static Vercel site **does not**
  host a persistent WebSocket server.
- Terminate TLS at a trusted reverse proxy (`wss://.../ws`); do not expose
  `ws://` from an HTTPS page. Set an exact `--allow-origin` for the
  WorldWideGames deployment. Never enable `--allow-null-origin` publicly.
- Configure the approved `wss://` relay URL in the game's meta tag at release
  time only after a real endpoint and multi-client production test exist.
- Rate limits and bounded rooms are safeguards, not an authentication or
  anti-cheat system. Add authenticated identities, gateway protections,
  moderation/abuse controls, metrics, idle-room lifecycle, horizontal scaling,
  and authoritative durable transactions BEFORE connecting RPG progression.
- Current process-memory rooms aren't distributed/persistent. A single relay
  process is only a functional networking vertical slice; it is not an MMO.

## Wire contract

Client sends `{"type":"join","protocol":1,"world":"VIRIDIA"}` then
`{"type":"pose","x":0,"z":3,"yaw":0}` up to ten times per second.
Server assigns a random non-auth identity and replies with `welcome`, and
broadcasts `peer` and `peer-left` packets to that one world. Incoming custom
reward/mutation packet types or extra fields are rejected, not forwarded.
World codes are 1–12 uppercase alphanumeric characters. Rooms are limited to
24 players (configurable) and 128 worlds, pose positions to ±61m (same as browser movement clamp), packets to
512 bytes, with movement plausibility and origin checks. Browsers reconnect
with bounded exponential backoff and resume local-only co-presence if offline.

See `tests/v84_relay.py` for real WebSocket, multi-client, room separation,
reconnect, invalid-movement/forged-reward, capacity, origin, and teardown QA.

## v86 cooperative signal contract (opt-in, non-economic)

After `join` succeeds, `welcome` includes `features:["cooperative-signal-v1"]` and
`signal:{stations:[false,false],complete:false,revision:0}`. A player stands
within 3.3m of **one** of the fixed, independent field nodes at `(-12,8)` or
`(12,8)` and presses E/Secondary/USE. The client sends
`{"type":"signal","station":0}` (or 1). The server uses its last accepted
presence pose to check distance. The two stations must be held by **two distinct
live connection IDs**. The server broadcasts `signal-state` containing only the
occupied booleans, `complete` and increasing `revision`. After both stations
are held simultaneously, the signal remains linked for the active room,
including late joiners. An incomplete held node releases if the member moves
away or disconnects; the entire signal resets when the room empties.

Clients negotiate this optional capability from `welcome.features`. Older
clients remain compatible with the extended welcome and older presence-only
servers never activate the UI. The co-op signal **does not award credits,
items, achievements, quests, ownership, strategic saves, votes, or scores**. The
pose channel is anonymous, but initial positions are server-owned; later client movement proposals remain only bounds/speed checked. Two
connections can belong to the same human; therefore this is a demonstrator,
not secure anti-cheat or evidence of two authenticated users. Its effects
are process-memory/session-only and cannot claim durable world persistence.

Tests: `python tests/v86_coop_relay.py` uses real independent WebSocket clients;
`python tests/v86_coop_browser.py` drives real Chromium clients and a local
relay, including keyboard/mouse/mobile touch, late joins, invalid packets,
room isolation and offline fallback. Production hosting remains disabled.

## v87 protocol-2 anonymous guest continuity

The current game client uses `{"type":"join","protocol":2,"world":"VIRIDIA"}`. If previously issued a secret for that world, it may include `"resume":"<48 lowercase hex>"` in the **first WebSocket message** (not the URL). The server replies `welcome` with `protocol:2`, `features` containing `guest-resume-v1`, an unpredictable server-issued `resumeToken`, a `resumed` boolean and `selfPose` (last accepted pose when resuming). Tickets are 192 random bits; the relay stores only SHA-256 digests, and the game caches the ticket in `sessionStorage` where available, with an in-tab memory fallback. The token is never broadcast to room peers. Legacy `protocol:1` remains accepted for old clients/tests but does not provide resumption. The new client **requires protocol 2** for an online welcome.

After a disconnection, a guest remains eligible to recover the *same transient public peer ID and pose* for up to 90 seconds **only while at least one participant still holds the room open**. Incomplete co-op station occupancy is released on disconnect. Last-player departure erases the room, station progress and all guest tickets; a stale ticket on an empty/recreated room is silently replaced with a new one. Resuming a guest that is still connected is rejected with WebSocket policy close 1008. Offline guest entries are bounded to at most 3× the configured player capacity and expire/evict when later joins occur. No tokens appear in the URL, service logs or peer snapshots.

These tokens are **anonymous bearer credentials, not account identity or proof of distinct people**. Someone can still open multiple independent sessions (or steal a token), and fresh initial positions are server-controlled, but authenticated accounts and genuinely server-simulated movement are not implemented. Persistent homes, player inventory, credits, progression, combat, elections, anti-cheat, IP/device identity and shared online saves are NOT provided. The offline owned-home save gate is unchanged. Do not connect any economy/reward to this service or deploy publicly before strong authenticated identity, server-owned movement/action simulation, abuse protections, trusted WSS, deployment and cost review, and end-to-end production QA. Browser tab `sessionStorage` can be cloned into opener-created windows; duplicate-live-ticket rejection prevents the exact same bearer from occupying two simultaneous room slots, not the creation of another unrelated guest.

Test with `python tests/v87_guest_relay.py` (real sockets), `python tests/v87_guest_browser.py` (real Chromium / real socket relay), plus prior v86/v85 co-op/gamepad regressions. Historical v85/v86 QA fixtures were updated for verified initial-position authority and now move to co-op stations via legitimate movement. v87 rejoin retains the last server-accepted pose.

## v89 verified fresh spawn and compatibility

All fresh guests (including legacy protocol-1 clients) begin at the relay's fixed Viridia spawn `(0,3)`; `Participant.has_pose` is pre-initialized so the FIRST `pose` packet receives the same strict speed/displacement validation as every subsequent packet. A rejected spoof emits `implausible-motion`, accumulates protocol violations and may close the socket after repeated invalids. New clients require `verified-spawn-v1` plus server-issued `selfPose` in the welcome message and synchronize their online position to it on both fresh join and resume. A v89 browser will NOT connect to a pre-v89 relay missing this handshake; this fail-closed protocol upgrade is intentional. Resumed guests retain the last accepted location. Offline owned-home checkpoints and story/economy are not changed by online spawn assignment.

**Not anti-cheat:** the server enforces a verified origin and plausible bounded movement, not authoritative player physics or verified unique humans. An attacker can move within allowed rate; exploit-resistant shared rewards/inventory/building are not implemented. This remains optional local-test co-op; do not enable a public WSS endpoint without identities, server-side action simulation, moderation, runtime metrics and cost controls. New socket regression: `python tests/v89_spawn_authority.py` plus updated real Chromium co-op fixtures.

## v90 rendering boundary

The v90 Viridia instanced scenery upgrade is browser-only. No co-op server protocol, authenticated identities, world authority, WSS hosting or online progression changed. Hardware GPU FPS is not certified.
