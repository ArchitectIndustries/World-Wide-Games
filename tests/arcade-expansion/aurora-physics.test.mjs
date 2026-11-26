import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../../games/aurora-hockey/engine.js', import.meta.url), 'utf8');
const { makeMatch, advance, drainEvents, reflectedX, RINK, DIFFICULTIES, STEP } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
let assertions = 0;
function check(condition, message) { assertions++; assert.ok(condition, message); }
function playing(mode = 'local', difficulty = 'normal') { const s = makeMatch(mode, difficulty); s.phase = 'playing'; return s; }
function run(s, seconds, controls = [null, null]) { for (let i = 0; i < Math.ceil(seconds / STEP); i++) advance(s, typeof controls === 'function' ? controls(s) : controls, STEP); }

// Input and elapsed-time validation; no progress in menus or completed matches.
{
  const s = makeMatch();
  check(s.points.every(p => p === 0) && s.serveLeft > 1, 'new match waits for a serve');
  advance(s, [null, null], NaN); check(s.activeTime === 0, 'invalid elapsed time ignored');
  advance(s, [null, null], 600); check(s.activeTime <= 0.050001, 'long interruption cannot advance a whole match');
  run(s, 1.4); check(s.phase === 'playing' && s.puck.vy > 0, 'initial serve reaches player after countdown');
  s.phase = 'over'; const before = JSON.stringify(s); advance(s); check(JSON.stringify(s) === before, 'completed match is immutable under advance');
}
// Swept-by-substep collisions cannot tunnel through a stationary striker at maximum legal speed.
{
  const s = playing(); s.paddles[0].x = 300; s.paddles[0].y = 670;
  Object.assign(s.puck, { x: 300, y: 620, vx: 0, vy: 1180 });
  advance(s, [null, null], 0.05);
  check(s.puck.vy < 0, 'maximum-speed puck reflected by striker');
  check(s.puck.y < 670 - 44, 'puck separated from striker after collision');
  check(s.points[1] === 0, 'striker interception is not a goal');
  check(drainEvents(s).some(e => e.type === 'strike'), 'collision produces a strike event');
}
// Moving strikers have bounded speed and transfer momentum, with no cursor teleportation.
{
  const s = playing(); Object.assign(s.paddles[0], { x: 300, y: 700 });
  Object.assign(s.puck, { x: 300, y: 625, vx: 0, vy: 0 });
  advance(s, [{ x: 300, y: 430 }, null], 0.05);
  check(Math.abs(s.paddles[0].y - 700) <= 43.001, 'pointer movement is speed-limited');
  check(s.puck.vy < -500, 'striking a stationary puck gives it momentum');
  check(Math.hypot(s.puck.vx, s.puck.vy) <= 1180.001, 'puck maximum speed is enforced');
}
// Only the mouth admits a goal, and only once the whole puck crosses the goal line.
{
  const s = playing(); Object.assign(s.puck, { x: 300, y: 30, vx: 0, vy: -400 });
  advance(s, [null, null], 0.005); check(s.points[0] === 0, 'partial crossing is not a goal');
  run(s, 0.05); check(s.points[0] === 1 && s.phase === 'serve', 'full crossing in mouth awards one point');
  check(s.serveSide === 1, 'serve goes to conceding player');
  run(s, 0.4); check(s.points[0] === 1, 'goal cannot repeat while waiting to serve');
  for (const x of [70, 180, 420, 530]) {
    const t = playing(); Object.assign(t.puck, { x, y: 55, vx: 0, vy: -1180 }); advance(t, [null, null], 0.05);
    check(t.points[0] === 0 && t.puck.vy > 0, `rail blocks shot outside mouth at x=${x}`);
  }
  const t = playing(); Object.assign(t.puck, { x: 300, y: 830, vx: 0, vy: 500 }); run(t, 0.05);
  check(t.points[1] === 1 && t.phase === 'serve', 'lower mouth correctly awards coral');
}
// A goalpost glance is physical contact, not an automatic score.
{
  const s = playing(); Object.assign(s.puck, { x: RINK.goalLeft + 5, y: 64, vx: 0, vy: -900 });
  advance(s, [null, null], 0.04); check(s.points[0] === 0 && s.puck.vy > 0, 'goalpost blocks a grazing shot');
}
// Match finish happens exactly at seven; subsequent updates do not emit duplicate results.
{
  const s = playing(); s.points = [6, 4]; Object.assign(s.puck, { x: 300, y: 25, vx: 0, vy: -500 });
  run(s, 0.1); const events = drainEvents(s);
  check(s.phase === 'over' && s.winner === 0 && s.points[0] === 7, 'seventh point is terminal');
  check(events.filter(e => e.type === 'complete').length === 1, 'one completion event per match');
  run(s, 10); check(drainEvents(s).length === 0 && s.points[0] === 7, 'completed result cannot emit or score again');
}
// Both pointer and keyboard keep each striker in its half, including combined diagonal input.
{
  const s = playing(); run(s, 2, [{ x: -9999, y: -9999 }, { x: 9999, y: 9999 }]);
  check(s.paddles[0].x >= 67 && s.paddles[0].y >= 469, 'cyan pointer remains inside lower half');
  check(s.paddles[1].x <= 533 && s.paddles[1].y <= 391, 'coral pointer remains inside upper half');
  run(s, 2, [{ dx: 1, dy: 1 }, { dx: -1, dy: -1 }]);
  check(s.paddles[0].x <= 533 && s.paddles[0].y <= 793, 'cyan keyboard remains within rink');
  check(s.paddles[1].x >= 67 && s.paddles[1].y >= 67, 'coral keyboard remains within rink');
  const t = playing(); const x = t.paddles[0].x, y = t.paddles[0].y; advance(t, [{ dx: 1, dy: 1 }, null]);
  check(Math.hypot(t.paddles[0].x - x, t.paddles[0].y - y) <= 860 * STEP + 0.001, 'diagonal inputs do not grant faster travel');
}
// AI uses wall-folded prediction and finite reaction/speed limits at every difficulty.
{
  const s = playing(); Object.assign(s.puck, { x: 300, y: 430, vx: 0, vy: 0 });
  run(s, 2, [{ x: 300, y: 430 }, { x: 300, y: 430 }]);
  check(s.paddles[0].y - s.paddles[1].y > (31 + 14) * 2, 'opposing strikers leave enough center clearance for a puck');
  check(Math.abs(s.puck.y - 430) < 0.01, 'both players pressing toward center cannot pinch or teleport puck');
}
{
  for (const x of [-10000, -40, 50, 300, 550, 780, 10000]) check(reflectedX(x) >= 50 && reflectedX(x) <= 550, `reflection stays on rink for x=${x}`);
  for (const [difficulty, config] of Object.entries(DIFFICULTIES)) {
    const s = playing('cpu', difficulty); Object.assign(s.puck, { x: 490, y: 370, vx: 500, vy: -800 });
    const before = { ...s.paddles[1] }; advance(s, [null, null]);
    check(Math.hypot(s.paddles[1].x - before.x, s.paddles[1].y - before.y) <= config.speed * STEP + 0.001, `${difficulty} AI respects speed cap`);
    check(s.ai.clock > 0 && s.ai.clock <= config.reaction, `${difficulty} AI waits before next decision`);
  }
}
// Seeded sustained play with moving strikers: bounded, finite, legal scores and terminal events.
{
  let seed = 13; const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const s = makeMatch('cpu', difficulty);
    for (let frame = 0; frame < 120 * 180 && s.phase !== 'over'; frame++) {
      const target = { x: s.puck.x + Math.sin(s.activeTime * 0.7) * 95, y: s.puck.y > 430 ? s.puck.y + 50 : 720 };
      advance(s, [target, null], STEP);
      if (frame % 120 === 0) {
        check([s.puck.x, s.puck.y, s.puck.vx, s.puck.vy].every(Number.isFinite), `${difficulty} simulation stays finite`);
        check(s.points.every(v => v >= 0 && v <= 7), `${difficulty} legal scores`);
        check(s.paddles[0].y >= 468.99 && s.paddles[1].y <= 391.01, `${difficulty} halves remain separate`);
      }
      drainEvents(s); rand();
    }
    check(s.strikes > 5, `${difficulty} sustained simulation makes contact`);
    check(s.points[0] + s.points[1] > 0, `${difficulty} sustained simulation is not score-locked`);
  }
}
console.log(`Aurora Hockey physics: ${assertions} assertions passed.`);
