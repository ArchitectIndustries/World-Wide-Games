import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Execute the actual application controller in a bounded DOM/audio-free harness.
// Test access is appended only here; the public application exposes no hooks.
const engineSource = await readFile(new URL('../../games/aurora-hockey/engine.js', import.meta.url), 'utf8');
const engine = await import(`data:text/javascript;base64,${Buffer.from(engineSource).toString('base64')}`);
const appSource = await readFile(new URL('../../games/aurora-hockey/game.js', import.meta.url), 'utf8');
const sent = [], elements = new Map();
class Element {
  constructor() { this.children = []; this.style = {}; this.value = 'normal'; this.classList = { add() {}, remove() {} }; }
  setAttribute() {} addEventListener() {} focus() {} append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  getContext() { return null; }
}
const getElement = (id) => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
const context = {
  ENGINE: engine, console, URLSearchParams, HTMLElement: Element,
  document: { getElementById: getElement, querySelector: () => ({ value: 'cpu' }), querySelectorAll: () => [], createElement: () => new Element(), addEventListener() {}, hidden: false },
  window: { addEventListener() {}, parent: { postMessage(message, origin) { sent.push({ ...message, targetOrigin: origin }); } } },
  location: { search: '', origin: 'https://worldwidegames.example' },
  matchMedia: () => ({ matches: true }), localStorage: { getItem() { return null; }, setItem() {} },
  ResizeObserver: class { observe() {} }, requestAnimationFrame() {}
};
const executable = appSource.replace(/^import[^\n]+\n/, 'const { W, H, RINK, STEP, DIFFICULTIES, makeMatch, advance, drainEvents } = ENGINE;\n');
vm.runInNewContext(executable + '\nglobalThis.harness = { load(s) { match=s; completionSent=false; }, consume() { handleEvents(); } };', context);

function finishLegitimately(mode, winner) {
  const state = engine.makeMatch(mode); state.phase = 'playing';
  state.points = winner === 0 ? [6, 2] : [2, 6];
  Object.assign(state.puck, { x: 300, y: winner === 0 ? 25 : 835, vx: 0, vy: winner === 0 ? -500 : 500 });
  engine.advance(state, [null, null], 0.05);
  assert.equal(state.phase, 'over'); assert.equal(state.winner, winner);
  context.harness.load(state); sent.length = 0; context.harness.consume();
  return sent;
}

let messages = finishLegitimately('cpu', 0);
assert.deepEqual(messages.map(m => m.event), ['match-complete', 'match-won']);
assert.equal(messages[0].score, 1200);
assert.ok(!Object.hasOwn(messages[1], 'score'), 'clear event is unscored');
assert.ok(messages.every(m => m.targetOrigin === context.location.origin), 'events target the current origin');
context.harness.consume(); assert.equal(sent.length, 2, 'a consumed completion cannot repeat');

messages = finishLegitimately('cpu', 1);
assert.deepEqual(messages.map(m => m.event), ['match-complete'], 'solo defeat never emits match-won');
assert.equal(messages[0].score, 200, 'solo defeat retains its earned-point telemetry');
context.harness.consume(); assert.equal(sent.length, 1);

for (const winner of [0, 1]) {
  messages = finishLegitimately('local', winner);
  assert.deepEqual(messages.map(m => m.event), ['local-match-complete']);
  assert.ok(!Object.hasOwn(messages[0], 'score'), 'local results never report a platform score');
  context.harness.consume(); assert.equal(sent.length, 1, 'local completion cannot repeat');
}
console.log('Aurora Hockey event semantics: solo win, solo loss, both local winners, and duplicate consumption passed. Controller harness; not a browser run.');
