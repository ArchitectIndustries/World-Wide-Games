'use strict';
/* Run from any working directory: node tests/arcade-expansion/integration.test.cjs
 * Optional local evidence:
 * WWG_BASELINE_HASHES=/absolute/baseline-hashes.json verifies all prior game files.
 * WWG_LEGACY_CATALOG=/absolute/games.js and WWG_LEGACY_RULES=/absolute/event-rules.js
 * verify this additive registry against a separately retrieved older baseline.
 * WWG_PUBLIC_ROOT=/absolute/staged-public-directory verifies staged runtime files.
 * This suite executes registry/worker declarations in VM contexts. It is not browser QA.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const expansion=read('js/arcade-expansion.js');
const EXPECTED={
  'aurora-hockey':'match-won',
  'skyline-hoops':'course-complete',
  'lightline-circuit':'circuit-complete',
  'orchard-slice':'harvest-survived',
  'mosaic-memory':'expedition-complete',
  'tabletop-commons':'match-won'
};
const ids=Object.keys(EXPECTED);
let passed=0;
const evidence={};
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function plain(value){return JSON.parse(JSON.stringify(value));}
function localPath(reference,from='index.html'){
  const url=new URL(reference,new URL(from,'https://worldwidegames.invalid/'));
  assert.equal(url.origin,'https://worldwidegames.invalid','Runtime assets must remain same-origin');
  const pathname=decodeURIComponent(url.pathname);
  const relative=pathname.endsWith('/')?pathname+'index.html':pathname;
  const resolved=path.resolve(root,'.'+relative);
  assert(resolved.startsWith(root+path.sep),'Path must stay in the project');
  return {resolved,relative:path.relative(root,resolved).split(path.sep).join('/'),query:url.search};
}
function dom(home=true){
  const nodes=new Map(),inserted=[];
  class Element{
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.style={};this.attributes={};this._id='';}
    set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
    setAttribute(key,value){this.attributes[key]=value;}
    append(...children){this.children.push(...children);}
    before(element){inserted.push(element);}
  }
  if(home){const library=new Element('section');library.id='library';}
  return {document:{getElementById:id=>nodes.get(id)||null,createElement:tag=>new Element(tag)},nodes,inserted};
}
function registry(catalog=read('js/games.js'),rules=read('js/event-rules.js'),home=true){
  const view=dom(home),context=vm.createContext({window:{},document:view.document,console});
  vm.runInContext(catalog,context,{filename:'base-games.js',timeout:3000});
  vm.runInContext(rules,context,{filename:'base-event-rules.js',timeout:3000});
  const baseline=plain(context.window.WWG_GAMES);
  const baseEvents={milestone:[...context.window.WWG_EVENT_RULES.milestoneEvents],completion:[...context.window.WWG_EVENT_RULES.completionEvents]};
  const apply=()=>vm.runInContext(expansion,context,{filename:'arcade-expansion.js',timeout:3000});
  return {context,view,baseline,baseEvents,apply};
}
const registryUnderTest=registry();
const {context,view,baseline,baseEvents}=registryUnderTest;
test('Base catalog has unique game identifiers',()=>{assert(baseline.length>0);assert.equal(new Set(baseline.map(g=>g.id)).size,baseline.length);});
registryUnderTest.apply();
const games=context.window.WWG_GAMES;
const eventRules=context.window.WWG_EVENT_RULES;
evidence.baseGames=baseline.length;evidence.expandedGames=games.length;
test('Six expansion titles register exactly once',()=>{
  const missing=ids.filter(id=>!baseline.some(g=>g.id===id));
  assert.equal(games.length,baseline.length+missing.length);
  for(const id of ids)assert.equal(games.filter(g=>g.id===id).length,1,id);
});
test('Existing catalog objects retain their complete metadata',()=>{for(const old of baseline)assert.deepEqual(plain(games.find(g=>g.id===old.id)),old,old.id);});
test('Repeated expansion evaluation neither duplicates games nor the homepage shelf',()=>{
  const before=plain(games),milestones=[...eventRules.milestoneEvents],completions=[...eventRules.completionEvents];
  registryUnderTest.apply();registryUnderTest.apply();
  assert.deepEqual(plain(games),before);assert.deepEqual([...eventRules.milestoneEvents],milestones);assert.deepEqual([...eventRules.completionEvents],completions);assert.equal(view.inserted.length,1);
});
test('A pre-existing matching ID is preserved instead of overwritten',()=>{
  const existing={id:'skyline-hoops',title:'Previously registered copy',path:'games/skyline-hoops/index.html'};
  const r=registry('window.WWG_GAMES='+JSON.stringify([existing])+';',read('js/event-rules.js'),false);r.apply();r.apply();
  assert.equal(r.context.window.WWG_GAMES.length,6);assert.deepEqual(plain(r.context.window.WWG_GAMES.find(g=>g.id===existing.id)),existing);
});
for(const id of ids)test(id+' has complete catalog and score metadata',()=>{
  const game=games.find(g=>g.id===id);
  for(const key of ['id','title','tagline','description','objective','path','cover','accent','version','added','updated'])assert.equal(typeof game[key],'string',key);
  for(const key of ['title','tagline','description','objective'])assert(game[key].trim().length>=3,key);
  assert.equal(game.path,`games/${id}/index.html`);assert.equal(game.cover,`covers/${id}.svg`);
  assert.match(game.accent,/^#[0-9a-f]{6}$/i);assert.match(game.added,/^\d{4}-\d{2}-\d{2}$/);assert.match(game.updated,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(typeof game.featured,'boolean');assert.equal(typeof game.remappable,'boolean');assert(Number.isFinite(game.basePopularity));
  for(const key of ['genres','modes','controls']){assert(Array.isArray(game[key]));assert(game[key].length>0);assert(game[key].every(value=>typeof value==='string'&&value.trim()));}
  assert(game.controls.length>=3);assert(['high','low'].includes(game.scoreMeta.direction));assert(game.scoreMeta.unit&&game.scoreMeta.label);
  assert(fs.statSync(localPath(game.path).resolved).isFile());assert(fs.statSync(localPath(game.cover).resolved).isFile());
});
for(const [id,event] of Object.entries(EXPECTED))test(id+' terminal event is recognized by both rule APIs',()=>{
  const key=`${id}:${event}`;
  assert(eventRules.milestoneEvents.has(key));assert(eventRules.completionEvents.has(key));
  assert(eventRules.isMilestoneKey(key));assert(eventRules.isCompletionKey(key));
  assert(eventRules.isMilestone(id,event));assert(eventRules.isCompletion(id,event));
});
test('Existing milestone and completion rules are preserved',()=>{
  for(const key of baseEvents.milestone)assert(eventRules.isMilestoneKey(key),key);
  for(const key of baseEvents.completion)assert(eventRules.isCompletionKey(key),key);
});
test('Unknown, failed, and intermediate expansion event names do not count as clears',()=>{
  for(const id of ids)for(const event of ['failed','miss','score','round-start','paused','restarted','match-lost']){assert(!eventRules.isCompletion(id,event),`${id}:${event}`);assert(!eventRules.isMilestone(id,event),`${id}:${event}`);}
});
test('Scored hockey/harvest endings do not falsely clear losses or failed runs',()=>{
  for(const [game,event] of [['aurora-hockey','match-complete'],['orchard-slice','harvest-complete']]){
    assert(!eventRules.isCompletion(game,event));assert(!eventRules.isMilestone(game,event));
  }
});
test('Re-evaluation removes obsolete completion aliases without suppressing earned success',()=>{
  const prior=registry();
  for(const key of ['aurora-hockey:match-complete','orchard-slice:harvest-complete']){
    prior.context.window.WWG_EVENT_RULES.milestoneEvents.add(key);prior.context.window.WWG_EVENT_RULES.completionEvents.add(key);
  }
  prior.apply();
  const rules=prior.context.window.WWG_EVENT_RULES;
  for(const key of ['aurora-hockey:match-complete','orchard-slice:harvest-complete']){assert(!rules.isCompletionKey(key));assert(!rules.isMilestoneKey(key));}
  assert(rules.isCompletion('aurora-hockey','match-won'));assert(rules.isCompletion('orchard-slice','harvest-survived'));
});
test('The homepage shelf contains six discoverable cards',()=>{
  const shelf=view.nodes.get('arcade-nights');assert(shelf);assert.equal(shelf.attributes['aria-labelledby'],'arcadeNightsTitle');
  const grid=shelf.children.find(child=>child.className==='game-grid');assert(grid);assert.equal(grid.children.length,6);
  const links=grid.children.map(card=>card.children.find(child=>child.tagName==='A'));
  for(const id of ids){const link=links.find(item=>item.href===`game.html?id=${id}`);assert(link,id);assert(link.attributes['aria-label']);const image=link.children.find(child=>child.tagName==='IMG');assert.equal(image.src,`covers/${id}.svg`);assert(image.alt);}
});
for(const html of ['index.html','game.html'])test(html+' loads catalog, event rules, expansion, then its consumer',()=>{
  const scripts=[...read(html).matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1]);
  const paths=scripts.map(value=>value.split('?')[0]);
  for(const required of ['js/games.js','js/event-rules.js','js/arcade-expansion.js'])assert.equal(paths.filter(p=>p===required).length,1,required);
  const catalogIndex=paths.indexOf('js/games.js'),rulesIndex=paths.indexOf('js/event-rules.js'),expansionIndex=paths.indexOf('js/arcade-expansion.js');
  assert(catalogIndex<expansionIndex);assert(rulesIndex<expansionIndex);
  const consumer=html==='index.html'?'js/app.js':'js/game-page.js';assert(expansionIndex<paths.indexOf(consumer));
  for(const src of scripts)assert(fs.statSync(localPath(src,html).resolved).isFile(),src);
});
const sw=vm.createContext({self:{registration:{scope:'https://worldwidegames.invalid/'},addEventListener(){}},URL,console});
vm.runInContext(read('sw.js')+'\nglobalThis.__integrationAssets=ASSETS;',sw,{filename:'sw.js',timeout:3000});
const assets=Array.from(sw.__integrationAssets);
const assetSet=new Set(assets.map(asset=>{const item=localPath(asset);return item.relative+item.query;}));
evidence.serviceWorkerAssets=assets.length;
test('Every service-worker public path resolves to a real project file',()=>{for(const asset of assets)assert(fs.statSync(localPath(asset).resolved).isFile(),asset);});
test('Service-worker inventory has no duplicate exact URLs',()=>{const normalized=assets.map(asset=>new URL(asset,'https://worldwidegames.invalid/').href);assert.equal(new Set(normalized).size,normalized.length);});
for(const id of ids)test(id+' runtime and cover are included in the service-worker inventory',()=>{
  const dir=path.join(root,'games',id);
  const runtime=fs.readdirSync(dir).filter(name=>/\.(html|js|css|svg|png|webp|jpg|ogg|mp3|wav|json)$/.test(name));
  for(const name of runtime)assert(assetSet.has(`games/${id}/${name}`),`${id}/${name}`);
  assert(assetSet.has(`covers/${id}.svg`));assert(runtime.includes('index.html'));
});
test('Expansion registry and shared game assets are cached',()=>{for(const resource of ['js/arcade-expansion.js','assets/arcade-commons.js','assets/arcade-commons.css'])assert(assetSet.has(resource),resource);});
test('HTML requests with version queries are present exactly in the cache inventory',()=>{
  for(const html of ['index.html','game.html'])for(const match of read(html).matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)){const item=localPath(match[1],html);assert(assetSet.has(item.relative+item.query),match[1]);}
});
for(const id of ids)test(id+' local page links and source assets resolve',()=>{
  const entry=`games/${id}/index.html`,html=read(entry);
  assert.match(html,/<title>[^<]+<\/title>/i);assert.match(html,/<meta\b[^>]*name=["']viewport["']/i);
  for(const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
    const value=match[1];if(value.startsWith('#')||value.startsWith('data:'))continue;
    assert(!/^https?:\/\//i.test(value),'Standalone games must not need external assets');
    assert(fs.statSync(localPath(value,entry).resolved).isFile(),value);
  }
  assert(fs.statSync(path.join(root,'games',id,'PROVENANCE.md')).isFile());
  const svg=read(`covers/${id}.svg`);assert.match(svg,/<svg\b/);assert(!/<script\b|<foreignObject\b/i.test(svg));
});
if(process.env.WWG_BASELINE_HASHES)test('All pre-existing game files are byte-identical to the supplied baseline',()=>{
  const hashes=JSON.parse(fs.readFileSync(path.resolve(process.env.WWG_BASELINE_HASHES),'utf8'));
  let count=0;
  for(const [relative,expected] of Object.entries(hashes)){
    if(!relative.startsWith('games/')||ids.some(id=>relative.startsWith(`games/${id}/`)))continue;
    const file=path.resolve(root,relative);assert(file.startsWith(root+path.sep));assert(fs.statSync(file).isFile(),relative);
    const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');assert.equal(actual,expected,relative);count++;
  }
  assert(count>0);evidence.unchangedOldGameFiles=count;
});else console.log('SKIP optional baseline fingerprint (set WWG_BASELINE_HASHES).');
if(process.env.WWG_LEGACY_CATALOG||process.env.WWG_LEGACY_RULES)test('Additive registry is compatible with the supplied legacy catalog and event rules',()=>{
  assert(process.env.WWG_LEGACY_CATALOG&&process.env.WWG_LEGACY_RULES,'Supply both legacy files');
  const legacy=registry(fs.readFileSync(path.resolve(process.env.WWG_LEGACY_CATALOG),'utf8'),fs.readFileSync(path.resolve(process.env.WWG_LEGACY_RULES),'utf8'),false);
  legacy.apply();legacy.apply();
  const list=legacy.context.window.WWG_GAMES,events=legacy.context.window.WWG_EVENT_RULES;
  for(const old of legacy.baseline)assert.deepEqual(plain(list.find(game=>game.id===old.id)),old);
  for(const [id,event] of Object.entries(EXPECTED)){assert.equal(list.filter(game=>game.id===id).length,1);assert(events.isMilestone(id,event));assert(events.isCompletion(id,event));}
  assert.equal(list.length,legacy.baseline.length+ids.filter(id=>!legacy.baseline.some(game=>game.id===id)).length);
  evidence.legacyBaseGames=legacy.baseline.length;evidence.legacyExpandedGames=list.length;
});else console.log('SKIP optional legacy compatibility (supply both WWG_LEGACY_* paths).');
if(process.env.WWG_PUBLIC_ROOT)test('Staged public directory contains every cached runtime file',()=>{
  const staged=path.resolve(process.env.WWG_PUBLIC_ROOT);
  for(const asset of assets){const relative=localPath(asset).relative;const file=path.resolve(staged,relative);assert(file.startsWith(staged+path.sep));assert(fs.statSync(file).isFile(),relative);}
  for(const forbidden of ['tests','tools','baseline-hashes.json'])assert(!fs.existsSync(path.join(staged,forbidden)),`Engineering material exposed: ${forbidden}`);
  evidence.stagedPublicPathsVerified=true;
});else console.log('SKIP optional staged-public check (set WWG_PUBLIC_ROOT).');
console.log(JSON.stringify({passed,total:passed,evidence,limitations:'Source/VM/filesystem integration checks only. Real browser, device, hosting, and production state are not covered.'}));
