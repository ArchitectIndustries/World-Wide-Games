const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/games.js'), 'utf8'), ctx);
const games = ctx.window.WWG_GAMES;
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
assert(games.length === 75, `expected 75 games, got ${games.length}`);
assert(new Set(games.map(g => g.id)).size === 75, 'duplicate game id');
assert(new Set(games.flatMap(g => g.genres)).size === 122, 'genre total mismatch');
assert(games.filter(g => g.remappable).length === 48, 'remappable total mismatch');
assert(JSON.stringify(games.filter(g => g.featured).map(g => g.id)) === JSON.stringify(['lumenfall-citadel']), 'featured mismatch');
const lumen = games.find(g => g.id === 'lumenfall-citadel');
assert(lumen && lumen.version === '1.0', 'Lumenfall metadata missing');
assert(lumen.scoreMeta?.direction === 'high' && lumen.scoreMeta?.unit === 'lumen', 'Lumenfall score metadata missing');
assert(lumen.controls.some(x=>/Arrow keys or WASD/.test(x)), 'universal controls metadata missing');
for (const g of games) {
  assert(fs.existsSync(path.join(root, g.path)), `missing game path: ${g.id}`);
  assert(fs.existsSync(path.join(root, g.cover)), `missing cover: ${g.id}`);
}
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const achievementBlock = app.slice(app.indexOf('const achievements = ['), app.indexOf('];', app.indexOf('const achievements = [')) + 2);
const ids = [...achievementBlock.matchAll(/\{id:'([^']+)'/g)].map(m => m[1]);
assert(ids.length === 120 && new Set(ids).size === 120, `achievement total mismatch: ${ids.length}`);
assert(ids.includes('citadel-rekindled') && ids.includes('glass-counter'), 'Lumenfall achievements missing');
assert(app.includes("{version:'v45',title:'Lumenfall Citadel'"), 'v45 release history missing');
assert(app.includes("'lumenfall-citadel':'Precision Action RPG'"), 'classic archetype missing');
assert(sw.includes("wwg-v45"), 'cache version mismatch');
assert(sw.includes('./games/lumenfall-citadel/index.html'), 'Lumenfall runtime not cached');
assert(sw.includes('./covers/lumenfall-citadel.svg'), 'Lumenfall cover not cached');
const shortcuts = (manifest.shortcuts || []).map(x => x.url).slice(0, 3);
assert(JSON.stringify(shortcuts) === JSON.stringify(['game.html?id=lumenfall-citadel','game.html?id=vanta-frontline','game.html?id=neon-stack']), 'PWA shortcut mismatch');
for (const f of ['games/lumenfall-citadel/index.html','covers/lumenfall-citadel.svg']) {
  assert(fs.readFileSync(path.join(root, f), 'utf8').toUpperCase().includes('ARCHITECT INDUSTRIES'), `${f} branding missing`);
}
const badPublic = ['CHATGPT','OPENAI','INTERNAL AGENT','HIDDEN TOOLING'];
for (const f of ['index.html','game.html','js/games.js','js/app.js','games/lumenfall-citadel/index.html']) {
  const txt=fs.readFileSync(path.join(root,f),'utf8').toUpperCase();
  for (const term of badPublic) assert(!txt.includes(term), `${term} leaked into ${f}`);
}
console.log(JSON.stringify({games:75,genres:122,achievements:120,remappable:48,featured:'lumenfall-citadel',cache:'wwg-v45',pwaShortcut:'lumenfall-citadel'}));
