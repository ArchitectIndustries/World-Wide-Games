const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'js/games.js'),'utf8'),ctx);
const games=ctx.window.WWG_GAMES,assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(games.length===79,`expected 79 games, got ${games.length}`);
assert(new Set(games.map(g=>g.id)).size===79,'duplicate game id');
assert(new Set(games.flatMap(g=>g.genres)).size===125,'genre total mismatch');
assert(games.filter(g=>g.remappable).length===51,'remappable total mismatch');
assert(JSON.stringify(games.filter(g=>g.featured).map(g=>g.id))===JSON.stringify(['cinderline-velocity']),'featured mismatch');
const cv=games.find(g=>g.id==='cinderline-velocity'),ga=games.find(g=>g.id==='glasswild-ascent'),pa=games.find(g=>g.id==='parallax-accord');
assert(cv&&cv.version==='1.0'&&cv.genres.includes('Racing')&&cv.genres.includes('3D')&&cv.remappable,'Cinderline metadata missing');
assert(ga&&ga.version==='1.0'&&ga.genres.includes('Platformer')&&ga.genres.includes('3D')&&ga.remappable,'Glasswild metadata missing');
assert(pa&&!pa.featured&&pa.version==='1.0','Parallax continuity mismatch');
for(const g of games){assert(fs.existsSync(path.join(root,g.path)),`missing game path: ${g.id}`);assert(fs.existsSync(path.join(root,g.cover)),`missing cover: ${g.id}`)}
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8'),gp=fs.readFileSync(path.join(root,'js/game-page.js'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),engine=fs.readFileSync(path.join(root,'assets/wwg-webgl.js'),'utf8'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const ab=app.slice(app.indexOf('const achievements = ['),app.indexOf('];',app.indexOf('const achievements = ['))+2),ids=[...ab.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert(ids.length===128&&new Set(ids).size===128,`achievement total mismatch ${ids.length}`);
for(const id of ['cinderline-champion','clean-line','glasswild-ascendant','voidless-path'])assert(ids.includes(id),`achievement missing ${id}`);
assert(app.includes("{version:'v49',title:'Procedural Worlds'"),'v49 release history missing');
assert(gp.includes('e.data.game||e.data.gameId'),'event compatibility gate missing');
assert(sw.includes("wwg-v49"),'cache version mismatch');
for(const asset of ['./assets/wwg-webgl.js','./games/cinderline-velocity/index.html','./games/glasswild-ascent/index.html'])assert(sw.includes(asset),`cache missing ${asset}`);
for(const token of ["getContext('webgl2'",'#version 300 es','uFogNear','canvas2d','nearestOnSegment'])assert(engine.includes(token),`engine token missing ${token}`);
const shortcuts=(manifest.shortcuts||[]).map(x=>x.url).slice(0,3);
assert(JSON.stringify(shortcuts)===JSON.stringify(['game.html?id=cinderline-velocity','game.html?id=glasswild-ascent','game.html?id=parallax-accord']),'PWA shortcut mismatch');
for(const id of ['cinderline-velocity','glasswild-ascent']){const src=fs.readFileSync(path.join(root,`games/${id}/index.html`),'utf8'),cover=fs.readFileSync(path.join(root,`covers/${id}.svg`),'utf8');assert(src.toUpperCase().includes('ARCHITECT INDUSTRIES')&&cover.toUpperCase().includes('ARCHITECT INDUSTRIES'),`${id} branding missing`);assert(src.includes('gameId:'),`${id} dual event id payload missing`);for(const bad of ['ChatGPT','OpenAI'])assert(!src.includes(bad)&&!cover.includes(bad),`prohibited public branding: ${bad}`)}
console.log(JSON.stringify({games:79,genres:125,achievements:128,remappable:51,featured:'cinderline-velocity',cache:'wwg-v49',webglEngine:'present'}));
