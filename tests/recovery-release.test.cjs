const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(dist,p),'utf8');
const release=JSON.parse(read('release.json'));
const ctx=vm.createContext({window:{},document:{getElementById:()=>null},console});
for(const p of ['js/games.js','js/event-rules.js','js/arcade-expansion.js'])vm.runInContext(read(p),ctx,{filename:p,timeout:3000});
const games=ctx.window.WWG_GAMES;
test('all 91 registrations and recovered tracks have executable files and covers',()=>{
  assert.equal(games.length,91);assert.equal(new Set(games.map(g=>g.id)).size,91);
  assert.equal(release.catalogCount,91);
  for(const game of games){assert.ok(fs.statSync(path.join(dist,game.path)).size>1000,game.id);assert.ok(fs.statSync(path.join(dist,game.cover)).size>0,game.id)}
  assert.equal(games.find(g=>g.id==='aegis-verge').version,'2.95');
  assert.equal(games.find(g=>g.id==='cyber-wars').version,'0.64');
  assert.equal(games.find(g=>g.id==='mosaic-memory').version,'1.1');
  for(const id of ['stormwake-rescue','iron-meridian'])assert.equal(games.find(g=>g.id===id).version,'1.0');
});
test('published files match the release receipt and exclude engineering history',()=>{
  for(const [p,hash] of Object.entries(release.sha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dist,p))).digest('hex'),hash,p);
  for(const p of ['tests','tools','services','.github','.git','README.md','PROJECT_STATE.md','TEST_REPORT.md','RELEASE_RECORD.json'])assert.equal(fs.existsSync(path.join(dist,p)),false,p);
});
test('cache inventory has unique existing paths and exact shell query variants',()=>{
  const sw=read('sw.js'),assets=JSON.parse(sw.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/)[1]);
  assert.equal(assets.length,new Set(assets).size);assert.match(sw,/wwg-v497/);
  for(const item of assets){const u=new URL(item,'https://worldwidegames.invalid/');let p=decodeURIComponent(u.pathname.slice(1));if(!p||p.endsWith('/'))p+='index.html';assert.ok(fs.existsSync(path.join(dist,p)),item)}
  for(const html of ['index.html','game.html'])for(const m of read(html).matchAll(/<script[^>]+src="([^"]+)"/g))assert.ok(assets.includes('./'+m[1]),html+' '+m[1]);
  assert.match(sw,/if\(!publicURLs\.has\(url\.href\)\)return/);
  assert.doesNotMatch(sw,/cache\.put|c\.put/);
});
test('arcade registry loads before platform boot and only earned outcomes clear games',()=>{
  for(const [html,boot] of [['index.html','js/app.js'],['game.html','js/game-page.js']]){
    const source=read(html);assert.ok(source.indexOf('js/arcade-expansion.js')<source.indexOf(boot));assert.ok(source.includes('js/arcade-expansion.js'));
  }
  for(const [id,event] of [['aurora-hockey','match-won'],['skyline-hoops','course-complete'],['lightline-circuit','circuit-complete'],['orchard-slice','harvest-survived'],['mosaic-memory','expedition-complete'],['tabletop-commons','match-won']])assert.equal(ctx.window.WWG_EVENT_RULES.isCompletion(id,event),true);
  for(const [id,event] of [['aurora-hockey','match-complete'],['orchard-slice','harvest-complete']])assert.equal(ctx.window.WWG_EVENT_RULES.isCompletion(id,event),false);
});
test('all published JavaScript and inline classic scripts parse',()=>{
  let checked=0;
  const parse=(source,filename,module=false)=>{
    if(module||/^\s*(?:export\s|import\s)/m.test(source))execFileSync(process.execPath,['--input-type=module','--check'],{input:source,stdio:['pipe','pipe','pipe']});
    else new vm.Script(source,{filename});
  };
  for(const p of Object.keys(release.sha256)){
    if(p.endsWith('.js')){parse(read(p),p);checked++}
    if(p.endsWith('.html'))for(const m of read(p).matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)){
      if(/type=["']application\/ld\+json["']/.test(m[1]))continue;
      parse(m[2],p+' inline',/type=["']module["']/.test(m[1]));checked++;
    }
  }
  assert.ok(checked>170);
});
