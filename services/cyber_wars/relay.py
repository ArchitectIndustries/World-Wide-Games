"""Cyber Wars opt-in WebSocket relay for presence and a zero-reward co-op signal.

The two-node signal is server-validated and room-local, but neither it nor player
positions grant credits, items, saves, combat outcomes, progress or identity.
Protocol 2 grants short-lived server-issued guest rejoin tickets while a room
remains active. All protocols begin with a verified server-owned spawn pose: the
first client update cannot arbitrarily teleport to a cooperative station. These are NOT account authentication or proof of distinct humans.
This is NOT an authenticated or persistent RPG server. TLS is external.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import hashlib
import math
import re
import secrets
import time
from dataclasses import dataclass, field

from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosed

WORLD_PATTERN = re.compile(r"[A-Z0-9]{1,12}\Z")
RESUME_PATTERN = re.compile(r"[a-f0-9]{48}\Z")
GUEST_GRACE_SECONDS = 90.0  # only in-memory and while another room member remains
GUEST_CACHE_FACTOR = 3  # strict bound on expired/offline guest records per live room
COLORS = ("#7fffd2", "#70b7ff", "#ff85da", "#ffd77a")
WORLD_BOUND = 61.0  # equals the client player clamp; neither side may disagree
SPAWN_X, SPAWN_Z = 0.0, 3.0  # server owns first accepted pose
MAX_JSON_BYTES = 512
# An overloaded receiver must not hold healthy co-op peers hostage.
# This is a session-only relay; it never retries stale positional snapshots.
SEND_DRAIN_TIMEOUT = 0.35
MAX_PENDING_BROADCASTS = 12  # bounded per-recipient queue, FIFO for co-op state
MAX_PLAYERS_DEFAULT = 24
MAX_WORLDS_DEFAULT = 128
MIN_POSE_INTERVAL = 0.055  # at most ~18 accepted updates per second
MAX_SPEED = 14.0  # meters/sec, generous margin above player's intended sprint
# Fixed, ordinary field equipment, independent of Viridia quest obelisks.
# Recreating this state after the last player leaves is intentional.
SIGNAL_NODES = ((-12.0, 8.0), (12.0, 8.0))
SIGNAL_RADIUS = 3.3



def json_message(obj: object) -> str:
    return json.dumps(obj, separators=(",", ":"), allow_nan=False)


@dataclass
class Participant:
    socket: object
    id: str
    color: str
    x: float = 0.0
    z: float = 3.0
    yaw: float = 0.0
    last_pose: float = 0.0
    has_pose: bool = True  # fresh players start at SPAWN_X/SPAWN_Z with real server authority
    bad_packets: int = 0
    guest: "Guest | None" = None

    def snapshot(self) -> dict:
        return {"id": self.id, "x": round(self.x, 3), "z": round(self.z, 3),
                "yaw": round(self.yaw, 4), "color": self.color}


@dataclass
class Guest:
    """Ephemeral, server-issued bearer capability, NOT a registered human account."""
    id: str
    color: str
    token_digest: str
    socket: object | None = None
    expires_at: float = 0.0
    x: float = SPAWN_X
    z: float = SPAWN_Z
    yaw: float = 0.0
    has_pose: bool = True



@dataclass
class SignalRoom:
    holders: list[str | None] = field(default_factory=lambda: [None, None])
    complete: bool = False
    revision: int = 0

    def snapshot(self) -> dict:
        # Expose only occupancy; no identity/credit authority is implied.
        return {"stations": [holder is not None for holder in self.holders],
                "complete": self.complete, "revision": self.revision}


@dataclass
class OutboundFrame:
    """Queued wire frame; only pending presence snapshots may be superseded.

    A mutable frame lets repeated poses for one peer reuse a queue slot. An
    immutable co-op/leave event forms an ordering barrier. In-flight writes
    have been removed from the index and are never mutated.
    """
    wire: str
    peer_id: str | None = None


class Relay:
    def __init__(self, max_players: int = MAX_PLAYERS_DEFAULT, max_worlds: int = MAX_WORLDS_DEFAULT):
        self.rooms: dict[str, dict[object, Participant]] = {}
        self.signals: dict[str, SignalRoom] = {}
        self.guests: dict[str, dict[str, Guest]] = {}
        self.max_players = max_players
        self.max_worlds = max_worlds
        self._outboxes: dict[object, asyncio.Queue[OutboundFrame]] = {}
        self._pending_poses: dict[object, dict[str, OutboundFrame]] = {}
        self._senders: dict[object, asyncio.Task] = {}
        self._send_locks: dict[object, asyncio.Lock] = {}
        self._slow_sockets: set[object] = set()

    def allocate_guest(self, world: str, socket: object, resume: str | None) -> tuple[Guest, str, bool]:
        """Look up a *server-issued* session token, or mint a fresh one.

        A stale but syntactically valid ticket is rotated, never accepted as
        client-chosen identity. The plaintext token is never kept in room state.
        """
        guests = self.guests.setdefault(world, {})
        now = time.monotonic()
        # Cache cannot grow indefinitely under repeated anonymous joins.
        for digest, old in list(guests.items()):
            if old.socket is None and old.expires_at <= now:
                del guests[digest]
        digest = hashlib.sha256(resume.encode()).hexdigest() if resume else None
        guest = guests.get(digest) if digest else None
        if guest is not None and guest.socket is not None:
            raise ValueError('guest-already-connected')
        if guest is not None:
            guest.socket = socket
            guest.expires_at = 0
            return guest, resume, True
        # Evict oldest *offline* capabilities if the bounded cache is full.
        limit = max(4, self.max_players * GUEST_CACHE_FACTOR)
        if len(guests) >= limit:
            offline = [(key, value.expires_at) for key, value in guests.items() if value.socket is None]
            for key, _ in sorted(offline, key=lambda pair: pair[1])[:len(guests)-limit+1]:
                del guests[key]
        if len(guests) >= limit:
            raise ValueError('guest-capacity')
        ticket = secrets.token_hex(24)
        digest = hashlib.sha256(ticket.encode()).hexdigest()
        peer_id = secrets.token_hex(8)
        guest = Guest(peer_id, COLORS[int(peer_id[-1], 16) % len(COLORS)], digest, socket=socket)
        guests[digest] = guest
        return guest, ticket, False

    async def _bounded_send(self, socket: object, payload: str) -> bool:
        # Direct responses and queued broadcasts share a per-connection lock;
        # a slow peer cannot block independent recipients or accumulate poses.
        lock = self._send_locks.setdefault(socket, asyncio.Lock())
        try:
            async with lock:
                await asyncio.wait_for(socket.send(payload), timeout=SEND_DRAIN_TIMEOUT)
            return True
        except (asyncio.TimeoutError, ConnectionClosed, OSError):
            return False

    async def _close_slow(self, socket: object) -> None:
        self._slow_sockets.add(socket)
        try:
            await asyncio.wait_for(socket.close(code=1013, reason="slow recipient"),
                                   timeout=SEND_DRAIN_TIMEOUT)
        except (asyncio.TimeoutError, ConnectionClosed, OSError):
            pass

    async def send(self, socket: object, obj: dict) -> None:
        # Welcome/error replies may block the offending recipient, never a room.
        if not await self._bounded_send(socket, json_message(obj)):
            await self._close_slow(socket)

    async def _sender(self, socket: object, queue: asyncio.Queue[OutboundFrame]) -> None:
        try:
            while True:
                payload = await queue.get()
                pending = self._pending_poses.get(socket)
                if pending is not None and payload.peer_id is not None and pending.get(payload.peer_id) is payload:
                    pending.pop(payload.peer_id, None)
                if not await self._bounded_send(socket, payload.wire):
                    await self._close_slow(socket)
                    break
        except asyncio.CancelledError:
            raise
        finally:
            # Preserve the failure marker until the connection handler exits.
            if self._outboxes.get(socket) is queue:
                self._outboxes.pop(socket, None)
                self._pending_poses.pop(socket, None)
            if self._senders.get(socket) is asyncio.current_task():
                self._senders.pop(socket, None)

    async def broadcast(self, world: str, obj: dict, exclude: object | None = None) -> None:
        # Control events (signal-state, peer-left, etc.) are NEVER coalesced.
        # Within each uninterrupted run of peer snapshots, replace pending
        # stale poses by peer ID. This limits queues during crowded movement
        # without increasing MAX_PENDING_BROADCASTS or losing control ordering.
        peer = obj.get("peer") if obj.get("type") == "peer" else None
        peer_id = peer.get("id") if isinstance(peer, dict) else None
        peer_id = peer_id if isinstance(peer_id, str) else None
        wire = json_message(obj)
        for socket in list(self.rooms.get(world, {})):
            if socket is exclude or socket in self._slow_sockets:
                continue
            queue = self._outboxes.get(socket)
            if queue is None:
                queue = asyncio.Queue(maxsize=MAX_PENDING_BROADCASTS)
                self._outboxes[socket] = queue
                self._pending_poses[socket] = {}
                self._senders[socket] = asyncio.create_task(self._sender(socket, queue))
            pending = self._pending_poses[socket]
            if peer_id is not None:
                existing = pending.get(peer_id)
                if existing is not None:
                    existing.wire = wire
                    continue  # newest pose replaces a not-yet-sent stale pose
            else:
                pending.clear()  # control events are strict FIFO barriers
            payload = OutboundFrame(wire, peer_id)
            try:
                queue.put_nowait(payload)
                if peer_id is not None:
                    pending[peer_id] = payload
            except asyncio.QueueFull:
                self._slow_sockets.add(socket)
                sender = self._senders.get(socket)
                if sender is not None:
                    sender.cancel()  # no stale queued presence survives saturation
                # Closing happens independently of healthy room fanout.
                asyncio.create_task(self._close_slow(socket))
        await asyncio.sleep(0)  # begin fanout without awaiting slow consumers

    async def signal_changed(self, world: str) -> None:
        signal = self.signals.get(world)
        if signal is not None:
            await self.broadcast(world, {"type": "signal-state", **signal.snapshot()})

    async def drop_inactive_holders(self, world: str) -> None:
        signal, room = self.signals.get(world), self.rooms.get(world)
        if signal is None or room is None or signal.complete:
            return
        members = {p.id: p for p in room.values()}
        changed = False
        for station, owner_id in enumerate(signal.holders):
            if owner_id is None:
                continue
            owner = members.get(owner_id)
            sx, sz = SIGNAL_NODES[station]
            if owner is None or not owner.has_pose or math.hypot(owner.x - sx, owner.z - sz) > SIGNAL_RADIUS:
                signal.holders[station] = None
                changed = True
        if changed:
            signal.revision += 1
            await self.signal_changed(world)

    async def activate_signal(self, world: str, member: Participant, station: int) -> None:
        if type(station) is not int or station not in (0, 1):
            await self.invalid(member, "invalid-signal")
            return
        sx, sz = SIGNAL_NODES[station]
        if not member.has_pose:
            await self.invalid(member, "signal-pose-required")
            return
        if math.hypot(member.x - sx, member.z - sz) > SIGNAL_RADIUS:
            await self.invalid(member, "signal-out-of-range")
            return
        signal = self.signals[world]
        if signal.complete or signal.holders[station] == member.id:
            # Replayed messages are idempotent; no repeated completion event.
            await self.send(member.socket, {"type": "signal-state", **signal.snapshot()})
            return
        if signal.holders[station] is not None:
            await self.send(member.socket, {"type": "error", "code": "signal-occupied"})
            return
        if member.id in signal.holders:
            # One connection cannot hold both nodes; authentication is a future
            # requirement before this could ever confer a competitive reward.
            await self.send(member.socket, {"type": "error", "code": "signal-second-player"})
            return
        signal.holders[station] = member.id
        if all(signal.holders):
            signal.complete = True
        signal.revision += 1
        await self.signal_changed(world)

    async def invalid(self, member: Participant, reason: str) -> None:
        member.bad_packets += 1
        await self.send(member.socket, {"type": "error", "code": reason})
        if member.bad_packets >= 3:
            await member.socket.close(code=1008, reason="protocol violation")

    async def handler(self, socket) -> None:
        world = None
        member = None
        if socket.request.path != "/ws":
            await socket.close(code=1008, reason="unknown endpoint")
            return
        try:
            try:
                raw = await asyncio.wait_for(socket.recv(), timeout=5)
                packet = self.parse(raw)
            except (ValueError, asyncio.TimeoutError):
                await socket.close(code=1008, reason="join required")
                return
            protocol = packet.get("protocol")
            legacy = type(protocol) is int and protocol == 1 and set(packet) == {"type", "world", "protocol"}
            resumable = type(protocol) is int and protocol == 2 and set(packet) in (
                {"type", "world", "protocol"}, {"type", "world", "protocol", "resume"})
            if packet.get("type") != "join" or not (legacy or resumable):
                await socket.close(code=1008, reason="unsupported join")
                return
            if resumable and "resume" in packet and (not isinstance(packet["resume"], str) or
                    not RESUME_PATTERN.fullmatch(packet["resume"])):
                await socket.close(code=1008, reason="malformed guest ticket")
                return
            world = packet["world"]
            if not isinstance(world, str) or not WORLD_PATTERN.fullmatch(world):
                await socket.close(code=1008, reason="invalid world")
                return
            if world not in self.rooms and len(self.rooms) >= self.max_worlds:
                await socket.close(code=1013, reason="world capacity")
                return
            room = self.rooms.setdefault(world, {})
            signal = self.signals.setdefault(world, SignalRoom())
            if len(room) >= self.max_players:
                await socket.close(code=1013, reason="room capacity")
                return
            guest, ticket, resumed = None, None, False
            if resumable:
                try:
                    guest, ticket, resumed = self.allocate_guest(world, socket, packet.get("resume"))
                except ValueError as error:
                    await socket.close(code=1008, reason=str(error))
                    return
                member = Participant(socket, guest.id, guest.color, x=guest.x, z=guest.z,
                                     yaw=guest.yaw, has_pose=True, guest=guest)
                member.last_pose = time.monotonic()
            else:
                peer_id = secrets.token_hex(8)
                member = Participant(socket, peer_id, COLORS[int(peer_id[-1], 16) % len(COLORS)],
                                     x=SPAWN_X, z=SPAWN_Z, has_pose=True,
                                     last_pose=time.monotonic())
            room[socket] = member
            welcome = {"type": "welcome", "protocol": protocol, "id": member.id,
                       "world": world, "peers": [p.snapshot() for s, p in room.items() if s is not socket],
                       "features": (["cooperative-signal-v1", "guest-resume-v1", "verified-spawn-v1"] if resumable
                                    else ["cooperative-signal-v1", "verified-spawn-v1"]), "signal": signal.snapshot()}
            if resumable:
                welcome.update({"resumeToken": ticket, "resumed": resumed,
                                "selfPose": member.snapshot()})
            await self.send(socket, welcome)
            await self.broadcast(world, {"type": "peer", "peer": member.snapshot()}, exclude=socket)
            async for raw in socket:
                try:
                    packet = self.parse(raw)
                except ValueError:
                    await self.invalid(member, "invalid-json")
                    continue
                if packet.get("type") == "signal" and set(packet) == {"type", "station"}:
                    await self.activate_signal(world, member, packet["station"])
                    continue
                if set(packet) != {"type", "x", "z", "yaw"} or packet.get("type") != "pose":
                    await self.invalid(member, "presence-only")
                    continue
                values = [packet[k] for k in ("x", "z", "yaw")]
                if any(type(v) not in (float, int) or not math.isfinite(v) for v in values):
                    await self.invalid(member, "invalid-position")
                    continue
                x, z, yaw = map(float, values)
                if abs(x) > WORLD_BOUND or abs(z) > WORLD_BOUND or abs(yaw) > 10000:
                    await self.invalid(member, "out-of-bounds")
                    continue
                now = time.monotonic()
                dt = now - member.last_pose
                if member.has_pose and dt < MIN_POSE_INTERVAL:
                    # Normal 10Hz clients won't hit this. Drop, don't reward spam.
                    continue
                if member.has_pose and math.hypot(x - member.x, z - member.z) > MAX_SPEED * min(dt, 0.5) + 0.8:
                    await self.invalid(member, "implausible-motion")
                    continue
                # Every member starts at a server-owned pose; speed limits apply
                # to the FIRST pose as well as all subsequent poses.
                member.x, member.z, member.yaw, member.last_pose, member.has_pose = x, z, yaw, now, True
                await self.broadcast(world, {"type": "peer", "peer": member.snapshot()}, exclude=socket)
                await self.drop_inactive_holders(world)
        except ConnectionClosed:
            pass
        finally:
            # Cancel the per-socket delivery pump even if no room remains.
            sender = self._senders.pop(socket, None)
            if sender is not None:
                sender.cancel()
            self._outboxes.pop(socket, None)
            self._pending_poses.pop(socket, None)
            self._send_locks.pop(socket, None)
            self._slow_sockets.discard(socket)
            if world is not None and member is not None:
                room = self.rooms.get(world)
                if room is not None:
                    room.pop(socket, None)
                    if room:
                        await self.broadcast(world, {"type": "peer-left", "id": member.id})
                        await self.drop_inactive_holders(world)
                    else:
                        self.rooms.pop(world, None)
                        self.signals.pop(world, None)
                        self.guests.pop(world, None)
                if member.guest is not None and world in self.guests:
                    guest = member.guest
                    # Do not clear a newly attached socket if an old handler is exiting.
                    if guest.socket is socket:
                        guest.socket = None
                        guest.expires_at = time.monotonic() + GUEST_GRACE_SECONDS
                        guest.x, guest.z, guest.yaw, guest.has_pose = (
                            member.x, member.z, member.yaw, member.has_pose)

    @staticmethod
    def parse(raw) -> dict:
        if not isinstance(raw, str) or len(raw.encode("utf-8")) > MAX_JSON_BYTES:
            raise ValueError("oversized or binary frame")
        try:
            packet = json.loads(raw)
        except (ValueError, TypeError) as exc:
            raise ValueError("invalid json") from exc
        if not isinstance(packet, dict):
            raise ValueError("expected object")
        return packet


async def run_server(host: str, port: int, allowed_origins: list[str], allow_null_origin: bool,
                     max_players: int, max_worlds: int) -> None:
    relay = Relay(max_players, max_worlds)
    # None allows CLI/test WebSocket clients without an Origin header; browser
    # requests always carry Origin and must match the explicit exact allowlist.
    origins: list[str | None] = [None, *allowed_origins]
    if allow_null_origin:
        origins.append("null")
    async with serve(relay.handler, host, port, origins=origins, max_size=MAX_JSON_BYTES,
                     compression=None, ping_interval=20, ping_timeout=20, max_queue=8):
        print(f"Cyber Wars presence relay listening at {host}:{port} (rooms: {max_worlds}, players/room: {max_players})", flush=True)
        await asyncio.Future()


def main():
    parser = argparse.ArgumentParser(description="Cyber Wars opt-in presence and zero-reward co-op signal relay")
    parser.add_argument("--host", default="127.0.0.1", help="bind to loopback by default; use TLS reverse proxy for public access")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--allow-origin", action="append", default=[], help="allowed browser origin; repeat for each exact https:// domain")
    parser.add_argument("--allow-null-origin", action="store_true", help="ONLY for local browser tests (disallow in production)")
    parser.add_argument("--max-players", type=int, default=MAX_PLAYERS_DEFAULT)
    parser.add_argument("--max-worlds", type=int, default=MAX_WORLDS_DEFAULT)
    args = parser.parse_args()
    if args.max_players < 2 or args.max_players > 128 or args.max_worlds < 1 or args.max_worlds > 1024:
        parser.error("max-players 2..128 and max-worlds 1..1024 required")
    asyncio.run(run_server(args.host, args.port, args.allow_origin, args.allow_null_origin,
                           args.max_players, args.max_worlds))


if __name__ == "__main__":
    main()
