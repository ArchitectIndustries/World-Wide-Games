const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/games.js'), 'utf8'), ctx);
const games = ctx.window.WWG_GAMES;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
assert(games.length === 74, `expected 74 games, got ${games.length}`);
assert(new Set(games.map(g => g.id)).size === 74, 'duplicate game id');
assert(new Set(games.flatMap(g => g.genres)).size === 121, 'genre total mismatch');
assert(games.filter(g => g.remappable).length === 47, 'remappable total mismatch');
assert(JSON.stringify(games.filter(g => g.featured).map(g => g.id)) === JSON.stringify(['vanta-frontline']), 'featured mismatch');
const vanta = games.find(g => g.id === 'vanta-frontline');
assert(vanta && vanta.version === '1.0', 'Vanta metadata missing');
assert(vanta.scoreMeta?.direction === 'high', 'Vanta score metadata missing');
for (const g of games) {
  assert(fs.existsSync(path.join(root, g.path)), `missing game path: ${g.id}`);
  assert(fs.existsSync(path.join(root, g.cover)), `missing cover: ${g.id}`);
}
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const achievementBlock = app.slice(app.indexOf('const achievements = ['), app.indexOf('];', app.indexOf('const achievements = [')) + 2);
const ids = [...achievementBlock.matchAll(/\{id:'([^']+)'/g)].map(m => m[1]);
assert(ids.length === 118 && new Set(ids).size === 118, 'achievement total mismatch');
assert(ids.includes('vanta-operator') && ids.includes('signal-sweep'), 'Vanta achievements missing');
assert(app.includes("{version:'v44',title:'Vanta Frontline'"), 'v44 release history missing');
assert(sw.includes("wwg-v44"), 'cache version mismatch');
assert(sw.includes('./games/vanta-frontline/index.html'), 'Vanta runtime not cached');
assert(sw.includes('./covers/vanta-frontline.svg'), 'Vanta cover not cached');
const shortcuts = (manifest.shortcuts || []).map(x => x.url).slice(0, 3);
assert(JSON.stringify(shortcuts) === JSON.stringify(['game.html?id=vanta-frontline','game.html?id=neon-stack','game.html?id=pulse-maze']), 'PWA shortcut mismatch');
for (const doc of ['PROJECT_STATE.md','TEST_REPORT.md','RELEASE_NOTES.md','README.md']) {
  assert(fs.readFileSync(path.join(root, doc), 'utf8').toLowerCase().includes('v44'), `${doc} missing v44`);
}
assert(fs.readFileSync(path.join(root, 'games/vanta-frontline/index.html'), 'utf8').toUpperCase().includes('ARCHITECT INDUSTRIES'), 'Vanta branding missing');
assert(fs.readFileSync(path.join(root, 'covers/vanta-frontline.svg'), 'utf8').toUpperCase().includes('ARCHITECT INDUSTRIES'), 'Vanta cover branding missing');
console.log(JSON.stringify({games:74,genres:121,achievements:118,remappable:47,featured:'vanta-frontline',cache:'wwg-v44',pwaShortcut:'vanta-frontline'}));