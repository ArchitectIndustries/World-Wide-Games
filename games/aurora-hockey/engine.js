// Original WorldWideGames air-hockey simulation. No rendering or browser state.
export const W = 600, H = 860;
export const RINK = Object.freeze({ left: 36, right: 564, top: 36, bottom: 824, middle: 430, goalLeft: 208, goalRight: 392 });
export const DIFFICULTIES = Object.freeze({
  easy: { name: 'Breeze', speed: 330, reaction: 0.22, error: 48 },
  normal: { name: 'Current', speed: 460, reaction: 0.14, error: 24 },
  hard: { name: 'Tempest', speed: 590, reaction: 0.085, error: 7 }
});
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const PLAYER_SPEED = 860, PUCK_MAX = 1180;
export const STEP = 1 / 120;

export function reflectedX(value, left = RINK.left + 14, right = RINK.right - 14) {
  const range = right - left, n = ((value - left) % (range * 2) + range * 2) % (range * 2);
  return left + (n <= range ? n : range * 2 - n);
}

export function makeMatch(mode = 'cpu', difficulty = 'normal') {
  const state = {
    mode: mode === 'local' ? 'local' : 'cpu', difficulty: DIFFICULTIES[difficulty] ? difficulty : 'normal',
    phase: 'serve', serveLeft: 1.35, serveSide: 0, activeTime: 0, points: [0, 0],
    puck: { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 14, lastHit: -1 },
    paddles: [
      { x: 300, y: 690, vx: 0, vy: 0, r: 31 },
      { x: 300, y: 170, vx: 0, vy: 0, r: 31 }
    ],
    ai: { x: 300, y: 145, clock: 0 }, events: [], rally: 0, longestRally: 0,
    strikes: 0, maxSpeed: 0, hitCooldown: 0, winner: null
  };
  return state;
}

function bounds(player, r) {
  return { x1: RINK.left + r, x2: RINK.right - r,
    // Leave one puck diameter between the two striker reach limits: opposing
    // strikers cannot pin the puck in an impossible overlap at the center line.
    y1: player === 0 ? RINK.middle + r + 16 : RINK.top + r,
    y2: player === 0 ? RINK.bottom - r : RINK.middle - r - 16 };
}

function movePaddle(state, index, input, dt, speed) {
  const pad = state.paddles[index], box = bounds(index, pad.r);
  let tx = pad.x, ty = pad.y;
  if (input && Number.isFinite(input.dx) && Number.isFinite(input.dy) && (input.dx || input.dy)) {
    const length = Math.hypot(input.dx, input.dy);
    tx += input.dx / length * speed * dt;
    ty += input.dy / length * speed * dt;
  } else if (input && Number.isFinite(input.x) && Number.isFinite(input.y)) {
    tx = input.x; ty = input.y;
  }
  tx = clamp(tx, box.x1, box.x2); ty = clamp(ty, box.y1, box.y2);
  const dx = tx - pad.x, dy = ty - pad.y, dist = Math.hypot(dx, dy), move = Math.min(speed * dt, dist);
  const oldX = pad.x, oldY = pad.y;
  if (dist > 0.00001) { pad.x += dx / dist * move; pad.y += dy / dist * move; }
  pad.vx = (pad.x - oldX) / dt; pad.vy = (pad.y - oldY) / dt;
}

function aiInput(state, dt) {
  const level = DIFFICULTIES[state.difficulty], ai = state.ai, p = state.puck;
  ai.clock -= dt;
  if (ai.clock <= 0) {
    ai.clock = level.reaction;
    const error = Math.sin(state.activeTime * 2.2 + state.points[0] * 1.7) * level.error;
    if (p.vy < -30 && p.y > 145) {
      const time = Math.min(1.4, Math.max(0, (p.y - 135) / -p.vy));
      ai.x = reflectedX(p.x + p.vx * time) + error;
      ai.y = 130;
    } else if (p.y < RINK.middle - 24 && (p.vy > -110 || p.y < 170)) {
      // Get behind the puck, then push toward the far goal. Imperfect by design.
      const aligned = Math.abs(state.paddles[1].x - p.x) < 42;
      ai.x = p.x + error * 0.35;
      ai.y = aligned ? p.y + 12 : p.y - 55;
    } else {
      ai.x = 300 + (p.x - 300) * 0.45 + error * 0.3; ai.y = 145;
    }
  }
  return { x: ai.x, y: ai.y };
}

function capPuck(p) {
  const speed = Math.hypot(p.vx, p.vy);
  if (speed > PUCK_MAX) { p.vx *= PUCK_MAX / speed; p.vy *= PUCK_MAX / speed; }
  // A slight vertical bias avoids permanent perfectly horizontal rallies.
  if (Math.abs(p.vy) < 42 && Math.abs(p.vx) > 150) p.vy = (p.vy >= 0 ? 1 : -1) * 42;
}

function contact(state, cx, cy, radius, vx = 0, vy = 0, player = -1) {
  const p = state.puck, dx = p.x - cx, dy = p.y - cy, distance = Math.hypot(dx, dy), combined = p.r + radius;
  if (distance >= combined) return;
  let nx = distance > 0.0001 ? dx / distance : 0;
  let ny = distance > 0.0001 ? dy / distance : (player === 0 ? -1 : 1);
  p.x = cx + nx * (combined + 0.03); p.y = cy + ny * (combined + 0.03);
  const normalVelocity = (p.vx - vx) * nx + (p.vy - vy) * ny;
  if (normalVelocity >= 0) return;
  p.vx -= 1.93 * normalVelocity * nx; p.vy -= 1.93 * normalVelocity * ny;
  capPuck(p);
  if (player >= 0 && state.hitCooldown <= 0) {
    p.lastHit = player; state.rally++; state.strikes++;
    state.longestRally = Math.max(state.longestRally, state.rally);
    state.maxSpeed = Math.max(state.maxSpeed, Math.hypot(p.vx, p.vy));
    state.events.push({ type: 'strike', x: p.x, y: p.y, player }); state.hitCooldown = 0.045;
  } else if (player < 0 && state.hitCooldown <= 0) {
    state.events.push({ type: 'wall', x: p.x, y: p.y }); state.hitCooldown = 0.025;
  }
}

function point(state, scorer) {
  state.points[scorer]++;
  state.events.push({ type: 'goal', scorer });
  state.rally = 0;
  if (state.points[scorer] >= 7) {
    state.phase = 'over'; state.winner = scorer;
    state.puck.vx = 0; state.puck.vy = 0;
    state.events.push({ type: 'complete', winner: scorer });
    return;
  }
  state.phase = 'serve'; state.serveLeft = 1.5; state.serveSide = 1 - scorer;
  Object.assign(state.puck, { x: W / 2, y: H / 2, vx: 0, vy: 0, lastHit: -1 });
  Object.assign(state.paddles[0], { x: 300, y: 690, vx: 0, vy: 0 });
  Object.assign(state.paddles[1], { x: 300, y: 170, vx: 0, vy: 0 });
  state.ai.clock = 0;
}

function physics(state, inputs, dt) {
  state.activeTime += dt; state.hitCooldown = Math.max(0, state.hitCooldown - dt);
  movePaddle(state, 0, inputs[0], dt, PLAYER_SPEED);
  if (state.mode === 'cpu') movePaddle(state, 1, aiInput(state, dt), dt, DIFFICULTIES[state.difficulty].speed);
  else movePaddle(state, 1, inputs[1], dt, PLAYER_SPEED);
  if (state.phase === 'serve') {
    state.serveLeft = Math.max(0, state.serveLeft - dt);
    if (state.serveLeft <= 0) {
      state.phase = 'playing';
      const angle = Math.sin((state.points[0] + state.points[1] + 1) * 2.1) * 0.45;
      state.puck.vx = Math.sin(angle) * 385;
      state.puck.vy = Math.cos(angle) * 385 * (state.serveSide === 0 ? 1 : -1);
      state.events.push({ type: 'serve' });
    }
    return;
  }
  const p = state.puck;
  p.x += p.vx * dt; p.y += p.vy * dt;
  p.vx *= Math.pow(0.99, dt); p.vy *= Math.pow(0.99, dt);
  for (let i = 0; i < 2; i++) { const pad = state.paddles[i]; contact(state, pad.x, pad.y, pad.r, pad.vx, pad.vy, i); }
  for (const x of [RINK.goalLeft, RINK.goalRight]) for (const y of [RINK.top, RINK.bottom]) contact(state, x, y, 7);
  let wall = false;
  if (p.x < RINK.left + p.r) { p.x = RINK.left + p.r; if (p.vx < 0) { p.vx *= -0.98; wall = true; } }
  if (p.x > RINK.right - p.r) { p.x = RINK.right - p.r; if (p.vx > 0) { p.vx *= -0.98; wall = true; } }
  const throughMouth = p.x > RINK.goalLeft + p.r && p.x < RINK.goalRight - p.r;
  if (!throughMouth) {
    if (p.y < RINK.top + p.r) { p.y = RINK.top + p.r; if (p.vy < 0) { p.vy *= -0.98; wall = true; } }
    if (p.y > RINK.bottom - p.r) { p.y = RINK.bottom - p.r; if (p.vy > 0) { p.vy *= -0.98; wall = true; } }
  } else {
    if (p.y < RINK.top - p.r) { point(state, 0); return; }
    if (p.y > RINK.bottom + p.r) { point(state, 1); return; }
  }
  capPuck(p);
  if (wall && state.hitCooldown <= 0) { state.events.push({ type: 'wall', x: p.x, y: p.y }); state.hitCooldown = 0.025; }
}

export function advance(state, inputs = [null, null], elapsed = STEP) {
  if (!['serve', 'playing'].includes(state.phase) || !Number.isFinite(elapsed) || elapsed <= 0) return;
  // Even maximum puck + paddle relative motion is below half a puck radius per substep.
  const bounded = Math.min(0.05, elapsed), count = Math.ceil(bounded / (1 / 360)), dt = bounded / count;
  for (let i = 0; i < count && state.phase !== 'over'; i++) physics(state, inputs, dt);
}

export function drainEvents(state) { const events = state.events; state.events = []; return events; }
