// Exercise the actual game-page storage and record loader in an isolated VM.
// This is a non-browser regression; DOM layout and focus require browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.WWG_ROOT || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/game-page.js'), 'utf8');
const begin = source.indexOf('  const volatileRecords=');
const end = source.indexOf("  const prefs=load(");
assert(begin >= 0 && end > begin, 'game-page storage section must be available');
const storageCode = source.slice(begin, end);
let checks = 0;
function equal(actual, expected, name) { checks++; assert.equal(actual, expected, name); }
function jsonEqual(actual, expected, name) { equal(JSON.stringify(actual), JSON.stringify(expected), name); }
function fixture(initial = {}, options = {}) {
  const records = new Map(Object.entries(initial));
  const notice = {hidden: true, textContent: ''};
  const localStorage = {
    getItem(key) { if(options.denyRead) throw new Error('storage denied'); return records.has(key) ? records.get(key) : null; },
    setItem(key, value) { if(options.denyWrite) throw new Error('quota'); records.set(key, String(value)); },
    removeItem(key) { if(options.denyWrite) throw new Error('quota'); records.delete(key); }
  };
  const window = {};
  Object.defineProperty(window, 'localStorage', {get() {
    if(options.denyGetter) throw new Error('SecurityError');
    return localStorage;
  }});
  const context = vm.createContext({window, $: () => notice});
  vm.runInContext(`${storageCode}\nglobalThis.api={load,storage};`, context);
  return {records, notice, ...context.api};
}
const corrupt = [
  ['wwg:prefs', null, {muted: false}],
  ['wwg:prefs', {muted: 'false'}, {muted: false}],
  ['wwg:prefs', {volume: '0.7'}, {volume: 0.7}],
  ['wwg:keymap', [], {}],
  ['wwg:plays', null, {}],
  ['wwg:recent', {}, []],
  ['wwg:favorites', ['neon-serpent', 2], []],
  ['wwg:play-later', false, []],
  ['wwg:ratings', {test: '4'}, {}],
  ['wwg:scores', {test: Number.MAX_SAFE_INTEGER + 1}, {}],
  ['wwg:sessions', {test: 3}, {}],
  ['wwg:sessions', {test: {count: '3'}}, {}],
  ['wwg:daily', {today: {unique: 'test'}}, {}],
  ['wwg:daily', {today: {plays: null}}, {}],
  ['wwg:daily-game-playtime', {today: {test: '10'}}, {}],
  ['wwg:score-runs', {test: {score: '42'}}, {}],
  ['wwg:run-history', {id: 'test', score: 42}, []],
  ['wwg:run-history', [{id: 'test', score: null}], []],
  ['wwg:events', {constructor: 42}, {}]
];
for (const [key, invalid, fallback] of corrupt) {
  const raw = JSON.stringify(invalid);
  const f = fixture({[key]: raw, 'wwg:ratings': key === 'wwg:ratings' ? raw : '{"neighbor":4}'});
  jsonEqual(f.load(key, fallback), fallback, `${key}: safe fallback`);
  equal(f.notice.hidden, false, `${key}: recovery notice`);
  equal(f.notice.textContent.includes('original stored values are preserved'), true, `${key}: notice describes preservation`);
  equal(f.storage.setItem(key, JSON.stringify(fallback)), false, `${key}: repair stays in session`);
  equal(f.records.get(key), raw, `${key}: original damaged bytes retained`);
  jsonEqual(f.load(key, fallback), fallback, `${key}: session value usable`);
  if(key !== 'wwg:ratings') {
    jsonEqual(f.load('wwg:ratings', {}), {neighbor: 4}, `${key}: neighbor remains valid`);
    equal(f.storage.setItem('wwg:ratings', '{"neighbor":5}'), true, `${key}: valid neighbor persists`);
    equal(f.records.get('wwg:ratings'), '{"neighbor":5}', `${key}: neighbor write retained`);
  }
}
for (const raw of ['{broken', '{"__proto__":2}', '{"prototype":2}']) {
  const f = fixture({'wwg:scores': raw});
  jsonEqual(f.load('wwg:scores', {}), {}, 'invalid serialized score data rejected');
  f.storage.setItem('wwg:scores', '{"test":10}');
  equal(f.records.get('wwg:scores'), raw, 'invalid serialized score bytes preserved');
}
const precise = 1234567890123.125;
const valid = fixture({
  'wwg:scores': JSON.stringify({test: precise}),
  'wwg:favorites': '["test"]',
  'wwg:run-history': '[{"id":"test","score":0}]',
  'wwg:sessions': '{"test":{"count":3,"last":123,"longest":12.5}}',
  'wwg:daily': '{"today":{"plays":2,"unique":["test"],"eventKeys":["complete"]}}'
});
equal(valid.load('wwg:scores', {}).test, precise, 'large finite fractional score remains exact');
jsonEqual(valid.load('wwg:favorites', []), ['test'], 'valid favorites retained');
equal(valid.load('wwg:run-history', [])[0].score, 0, 'valid zero score retained');
equal(valid.load('wwg:sessions', {}).test.longest, 12.5, 'valid nested session retained');
equal(valid.load('wwg:daily', {}).today.plays, 2, 'valid daily profile retained');
equal(valid.notice.hidden, true, 'valid records show no false recovery notice');
equal(valid.storage.setItem('wwg:scores', '{"test":0}'), true, 'valid score writes persist');
for (const options of [{denyGetter: true}, {denyRead: true, denyWrite: true}, {denyWrite: true}]) {
  const f = fixture({}, options);
  jsonEqual(f.load('wwg:favorites', []), [], 'denied storage keeps default usable');
  equal(f.storage.setItem('wwg:favorites', '["test"]'), false, 'denied storage write is reported');
  jsonEqual(f.load('wwg:favorites', []), ['test'], 'failed writes remain usable in this session');
  equal(f.records.has('wwg:favorites'), false, 'denied storage does not claim durable changes');
  equal(f.notice.textContent.includes('storage is unavailable'), true, 'denied storage notice');
}
const missing = fixture();
jsonEqual(missing.load('wwg:recent', []), [], 'absent record starts cleanly');
equal(missing.notice.hidden, true, 'absent record is not corruption');
console.log(JSON.stringify({passed: checks, total: checks, scope: 'Actual game-page storage/loader code in Node VM; no browser or installed-PWA claim'}));
