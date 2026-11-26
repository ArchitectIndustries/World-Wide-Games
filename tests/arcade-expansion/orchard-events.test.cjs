// Execute production finish() and the production event sender against a small
// DOM boundary. Terminal states are produced by the real engine, never forced.
// This checks controller semantics, not browser rendering or physical input.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Engine = require('../../games/orchard-slice/engine.js');
const source = fs.readFileSync(path.resolve(__dirname, '../../games/orchard-slice/game.js'), 'utf8');
const common = fs.readFileSync(path.resolve(__dirname, '../../assets/arcade-commons.js'), 'utf8');
const finishStart = source.indexOf('function finish()');
const finishEnd = source.indexOf('function hit(', finishStart);
const sendStart = common.indexOf('function send(game,event,score)');
const sendEnd = common.indexOf('root.WWGArcade=', sendStart);
assert.ok(finishStart >= 0 && finishEnd > finishStart, 'production finish boundary exists');
assert.ok(sendStart >= 0 && sendEnd > sendStart, 'production event sender boundary exists');
const finishSource = source.slice(finishStart, finishEnd);
const sendSource = common.slice(sendStart, sendEnd);

function terminalRun(mode, hitHazards = false) {
  const run = new Engine.Run(mode, 13);
  let firstFruitCut = false, hazardHits = 0, steps = 0;
  while (!run.over && steps++ < 7500) {
    run.step(1 / 120);
    if (!firstFruitCut && run.time < 3) {
      const fruit = run.items.find(item => !item.cut && item.kind !== 'hazard' && item.y < 540);
      if (fruit) { run.slice(fruit.x, fruit.y, fruit.x, fruit.y); firstFruitCut = true; }
    }
    if (hitHazards) {
      const mine = run.items.find(item => !item.cut && item.kind === 'hazard' && item.y > 0 && item.y < 540);
      if (mine) hazardHits += run.slice(mine.x, mine.y, mine.x, mine.y).filter(item => item.kind === 'hazard').length;
    }
  }
  assert.equal(run.over, true, 'engine reached a terminal state');
  assert.equal(firstFruitCut, true, 'run includes an actual scored fruit cut');
  if (hitHazards) {
    assert.equal(hazardHits, 3, 'exactly three real hazard contacts ended the run');
    assert.equal(run.lives, 0);
    assert.ok(run.time < 60);
  } else {
    assert.equal(run.time, 60);
    assert.equal(run.lives, 3);
  }
  return run;
}

function fixture(run) {
  const sent = [], shown = [], elements = new Map();
  let clears = 0, syncs = 0, focuses = 0;
  const $ = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', focus() { focuses++; } });
    return elements.get(id);
  };
  const context = {
    run, phase: 'playing', reported: false, $,
    clearInput() { clears++; }, sync() { syncs++; }, show(...args) { shown.push(args); },
    bestKey: () => 'wwg:orchard-slice:' + run.mode + ':best',
    A: { store: { best(key, score) { assert.equal(key, 'wwg:orchard-slice:' + run.mode + ':best'); return score; } } },
    window: {}, location: { origin: 'https://worldwidegames.example' },
    parent: { postMessage(message, targetOrigin) { sent.push({ ...message, targetOrigin }); } }
  };
  vm.createContext(context);
  vm.runInContext(sendSource + '\nA.send=send;\n' + finishSource, context);
  return { context, sent, shown, counts: () => ({ clears, syncs, focuses }) };
}

function assertOnce(fixture) {
  const before = fixture.sent.length;
  fixture.context.finish();
  assert.equal(fixture.sent.length, before, 'finishing again cannot duplicate events');
  assert.equal(fixture.context.phase, 'over');
  assert.deepEqual(fixture.counts(), { clears: 1, syncs: 1, focuses: 1 });
  assert.equal(fixture.shown.length, 1, 'only one results panel was shown');
  assert.ok(fixture.sent.every(message => message.targetOrigin === 'https://worldwidegames.example'));
}

test('Classic survival at 60 seconds reports points and an unscored clear exactly once', () => {
  const run = terminalRun('classic'), f = fixture(run);
  f.context.finish();
  assert.deepEqual(f.sent.map(message => message.event), ['harvest-complete', 'harvest-survived']);
  assert.equal(f.sent[0].score, run.score);
  assert.ok(run.score > 0);
  assert.equal(Object.hasOwn(f.sent[1], 'score'), false, 'survival event does not score again');
  assertOnce(f);
});

test('Classic failure on the third hazard reports points without a survival clear', () => {
  const run = terminalRun('classic', true), f = fixture(run);
  f.context.finish();
  assert.deepEqual(f.sent.map(message => message.event), ['harvest-complete']);
  assert.equal(f.sent[0].score, run.score);
  assert.equal(Number.isFinite(f.sent[0].score), true);
  assertOnce(f);
});

test('Zen completion emits only an unscored local mode event', () => {
  const run = terminalRun('zen'), f = fixture(run);
  f.context.finish();
  assert.deepEqual(f.sent.map(message => message.event), ['zen-complete']);
  assert.equal(Object.hasOwn(f.sent[0], 'score'), false, 'Zen never sends a platform score');
  assertOnce(f);
});
