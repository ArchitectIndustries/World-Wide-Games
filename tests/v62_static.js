const fs=require('fs'),path=require('path'),vm=require('vm'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(x,m)=>{if(!x)throw new Error(m)};
const catalog=read('js/games.js'),app=read('js/app.js'),sw=read('sw.js'),index=read('index.html'),detail=read('game.html'),game=read('games/emberfield-survival/index.html'),manifest=JSON.parse(read('manifest.webmanifest'));
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(catalog,ctx);const games=ctx.window.WWG_GAMES;
const block=app.slice(app.indexOf('const achievements = ['),app.indexOf('];',app.indexOf('const achievements = ['))+2),ids=[...block.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
must(games.length===82,'game total '+games.length);must(new Set(games.flatMap(g=>g.genres)).size===129,'genre total');must(games.filter(g=>g.remappable).length===54,'remappable total');must(ids.length===152&&new Set(ids).size===152,'achievement total '+ids.length);
const ember=games.find(g=>g.id==='emberfield-survival');must(ember&&ember.version==='2.0'&&ember.updated==='2026-10-05'&&ember.featured,'Emberfield metadata');must(ember.objective.includes('Pyre Regent')&&ember.controls.some(x=>x.includes('Nova Burst')),'objective/controls');
for(const t of ['Emberfield Survival 2.0','Ash Verge','Cinderstorm','Pyre Crown','function nova()','function spawnBoss(','function completeCampaign()','wwg:emberfield-survival:progress:v2'])must(game.includes(t),'missing '+t);
for(const src of [...game.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean)){new Function(src)}
must(ids.includes('pyre-crown')&&ids.includes('nova-born'),'achievements');must(app.includes("version:'v62'")&&app.includes('Emberfield Survival 2.0: Pyre Crown'),'release history');must(sw.includes("const CACHE='wwg-v62'"),'cache');must(index.includes('js/games.js?v62')&&index.includes('js/app.js?v62'),'index cache busters');must(detail.includes('js/games.js?v62'),'detail cache buster');must(manifest.shortcuts[0]?.url==='game.html?id=emberfield-survival','PWA shortcut');
console.log(JSON.stringify({games:82,genres:129,achievements:152,remappable:54,upgrade:'emberfield-survival-2.0',cache:'wwg-v62'}));
