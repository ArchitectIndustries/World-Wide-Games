const fs=require('fs'),path=require('path'),vm=require('vm'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(x,m)=>{if(!x)throw new Error(m)};
const catalog=read('js/games.js'),app=read('js/app.js'),game=read('games/parallax-accord/index.html'),sw=read('sw.js'),index=read('index.html'),detail=read('game.html'),standards=read('DEVELOPMENT_STANDARDS.md'),record=JSON.parse(read('RELEASE_RECORD.json')),manifest=JSON.parse(read('manifest.webmanifest'));
const box={window:{}};vm.createContext(box);vm.runInContext(catalog,box);const games=box.window.WWG_GAMES||[];
const block=app.slice(app.indexOf('const achievements = ['),app.indexOf('];',app.indexOf('const achievements = ['))+2),ids=[...block.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
must(games.length===82,'catalog game count');must(new Set(games.flatMap(g=>g.genres)).size===129,'genre count');must(ids.length===152&&new Set(ids).size===152,'achievement count '+ids.length);must(games.filter(g=>g.remappable).length===54,'remappable count');
const parallax=games.find(g=>g.id==='parallax-accord');must(parallax&&parallax.version==='1.1'&&parallax.updated==='2026-10-06','Parallax metadata');must(parallax.objective.includes('deadlock')&&parallax.controls.some(x=>x.includes('1-1-1')),'Parallax objective/controls');
for(const t of ["st.won=you>=2;st.draw=!st.won&&ai<2","post(st.draw?'match-deadlocked':'match-ended'","Accord deadlocked","The Accord requires two district wins","draw:st.draw"])must(game.includes(t),'missing '+t);
for(const src of [...game.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean)){new Function(src)}
must(app.includes("version:'v65'")&&app.includes('Parallax Accord 1.1: True Majority'),'release history');
console.log(JSON.stringify({games:82,genres:129,achievements:152,remappable:54,fix:'parallax-1.1'}));
