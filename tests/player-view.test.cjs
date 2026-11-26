const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/player-view.js'),'utf8');

// Execute the actual layout controller. This fixture tests lifecycle behavior;
// browser QA separately checks the rendered layout and real iframe focus.
function fixture({width=1363,height=907,world=true,saved=null,denyStorage=false,fullscreen}={}){
  class Element{
    constructor(){this.events=new Map();this.attributes=new Map();this.values=new Map();this.hidden=true;this.textContent='';this.focuses=0;this.scrolls=0;this.top=180;this.style={setProperty:(k,v)=>this.values.set(k,v),removeProperty:k=>this.values.delete(k),getPropertyValue:k=>this.values.get(k)||''};}
    addEventListener(k,fn){if(!this.events.has(k))this.events.set(k,new Set());this.events.get(k).add(fn)}
    removeEventListener(k,fn){this.events.get(k)?.delete(fn)}
    async emit(k){for(const fn of this.events.get(k)||[])await fn({type:k})}
    setAttribute(k,v){this.attributes.set(k,v)}
    getBoundingClientRect(){return{top:this.top}}
    focus(){this.focuses++}
    scrollIntoView(){this.scrolls++}
  }
  const ids=['gameFrameWrap','expandPlayButton','gameInfoButton','returnToGameButton','gameInfoCard','gameInfoHeading','fullscreenButton','playerViewStatus','storageNotice'];
  const el=Object.fromEntries(ids.map(id=>[id,new Element()]));
  const frame=new Element();let writes=0;
  Object.defineProperty(frame,'src',{get:()=>'/running-game.html',set:()=>writes++});
  if(fullscreen)el.gameFrameWrap.requestFullscreen=fullscreen;
  const classes=new Set(),body={dataset:{},classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k)}};
  const doc=new Element();Object.assign(doc,{body,getElementById:id=>el[id]||null,querySelector:()=>null});
  const win=new Element(),queue=new Map();let next=0;
  Object.assign(win,{innerWidth:width,innerHeight:height,scrollY:0,visualViewport:new Element(),requestAnimationFrame:fn=>{const id=++next;queue.set(id,fn);return id},cancelAnimationFrame:id=>queue.delete(id)});
  win.visualViewport.height=height;
  const prefs=new Map(saved===null?[]:[['wwg:play-view',saved]]),stored=[];
  const storage={getItem:k=>{if(denyStorage)throw Error('denied');return prefs.get(k)??null},setItem:(k,v)=>{if(denyStorage)throw Error('denied');prefs.set(k,v);stored.push([k,v])}};
  const context=vm.createContext({window:win,document:doc});vm.runInContext(source,context);
  const controller=win.WWG_PLAYER_VIEW.mount({frame,game:{presentation:world?'world':undefined},storage});
  const flush=()=>{for(const [id,fn]of [...queue]){queue.delete(id);fn()}};flush();
  return{el,win,doc,frame,body,prefs,stored,controller,flush,get writes(){return writes}};
}
test('world view expands on desktop, honors a saved standard choice, and does not force compact screens',()=>{
  const desktop=fixture();assert.equal(desktop.body.dataset.playerView,'expanded');assert.equal(desktop.el.gameFrameWrap.values.get('--wwg-play-height'),'715px');assert.equal(desktop.stored.length,0);
  assert.equal(fixture({saved:'standard'}).body.dataset.playerView,'standard');
  assert.equal(fixture({width:390}).body.dataset.playerView,'standard');
  assert.equal(fixture({world:false}).body.dataset.playerView,'standard');
  assert.equal(fixture({width:390,saved:'expanded'}).body.dataset.playerView,'expanded');
  assert.equal(fixture({denyStorage:true}).body.dataset.playerView,'expanded');
});
test('view changes and info navigation preserve the iframe and restore focus deliberately',async()=>{
  const f=fixture(),frame=f.frame;
  await f.el.expandPlayButton.emit('click');f.flush();
  assert.equal(f.body.dataset.playerView,'standard');assert.equal(f.prefs.get('wwg:play-view'),'standard');assert.equal(f.el.expandPlayButton.attributes.get('aria-pressed'),'false');assert.equal(f.el.gameFrameWrap.values.has('--wwg-play-height'),false);
  await f.el.expandPlayButton.emit('click');f.flush();
  assert.equal(f.body.dataset.playerView,'expanded');assert.equal(f.el.expandPlayButton.attributes.get('aria-pressed'),'true');
  await f.el.gameInfoButton.emit('click');assert.equal(f.el.gameInfoCard.scrolls,1);assert.equal(f.el.gameInfoHeading.focuses,1);
  await f.el.returnToGameButton.emit('click');assert.equal(f.el.gameFrameWrap.scrolls,1);assert.equal(frame.focuses,1);assert.equal(f.frame,frame);assert.equal(f.writes,0);
});
test('fullscreen refusal falls back to a usable expanded layout with no unhandled rejection',async()=>{
  const f=fixture({saved:'standard',fullscreen:async()=>{throw Error('browser denied fullscreen')}});
  await f.el.fullscreenButton.emit('click');f.flush();
  assert.equal(f.body.dataset.playerView,'expanded');assert.match(f.el.playerViewStatus.textContent,/could not open fullscreen/);assert.equal(f.writes,0);
});
test('expanded height follows viewport changes; disposal removes pending work and listeners',async()=>{
  const f=fixture();f.win.visualViewport.height=620;await f.win.visualViewport.emit('resize');f.flush();assert.equal(f.el.gameFrameWrap.values.get('--wwg-play-height'),'428px');
  f.win.scrollY=400;f.el.gameFrameWrap.top=-220;await f.win.emit('resize');f.flush();assert.equal(f.el.gameFrameWrap.values.get('--wwg-play-height'),'428px');
  await f.win.emit('resize');f.controller.dispose();f.controller.dispose();f.flush();await f.el.expandPlayButton.emit('click');assert.equal(f.body.dataset.playerView,'expanded');assert.equal(f.stored.length,0);
});

const page=fs.readFileSync(path.join(root,'js/game-page.js'),'utf8');
const clockStart=page.indexOf('  function createPlayClock('),clockEnd=page.indexOf('  const today=new Date()',clockStart);
assert(clockStart>=0&&clockEnd>clockStart);
const clockCode=page.slice(clockStart,clockEnd);
function clockFixture({hidden=false,initial={}}={}){
  const records=new Map(Object.entries(initial).map(([k,v])=>[k,JSON.stringify(v)])),events=new Map();let time=0;
  const document={visibilityState:hidden?'hidden':'visible'};
  const ctx=vm.createContext({document,performance:{now:()=>time},game:{id:'test'},load:(k,f)=>records.has(k)?JSON.parse(records.get(k)):f,storage:{setItem:(k,v)=>records.set(k,v)},addEventListener:(k,fn)=>events.set(k,fn)});
  vm.runInContext(clockCode,ctx);
  return{advance:ms=>time+=ms,emit:k=>events.get(k)?.(),visibility:value=>{document.visibilityState=value;events.get('visibilitychange')()},read:k=>records.has(k)?JSON.parse(records.get(k)):null};
}
test('background intervals and later pagehide do not inflate visible playtime or session lengths',()=>{
  const f=clockFixture({initial:{'wwg:playtime':{test:100},'wwg:sessions':{test:{count:2,last:5,longest:10}}}});
  f.advance(1250);f.visibility('hidden');f.advance(30*60*1000);f.emit('pagehide');
  assert.equal(f.read('wwg:playtime').test,101);assert.deepEqual(f.read('wwg:sessions').test,{count:3,last:1,longest:10});
  f.visibility('visible');f.advance(750);f.visibility('hidden');
  assert.equal(f.read('wwg:playtime').test,102);assert.deepEqual(f.read('wwg:sessions').test,{count:3,last:2,longest:10});
  assert.equal(Object.values(f.read('wwg:daily-playtime'))[0],2);assert.equal(Object.values(f.read('wwg:daily-game-playtime'))[0].test,2);
});
test('frequent short visibility changes retain fractional active time without counting away time',()=>{
  const f=clockFixture();for(let n=0;n<10;n++){f.advance(125);f.visibility('hidden');f.advance(5000);f.visibility('visible')}
  f.emit('pagehide');assert.equal(f.read('wwg:playtime').test,1);assert.equal(f.read('wwg:sessions').test.last,1);
});
test('initially hidden pages start counting only when visible',()=>{
  const f=clockFixture({hidden:true});f.advance(90000);f.emit('pagehide');assert.equal(f.read('wwg:playtime'),null);
  f.visibility('visible');f.advance(2000);f.emit('pagehide');assert.equal(f.read('wwg:playtime').test,2);
});
test('page-cache restore resumes the same session and repeated lifecycle events never double-count',()=>{
  const f=clockFixture();f.advance(2000);f.emit('pagehide');f.emit('pagehide');f.advance(60000);f.emit('pageshow');f.emit('pageshow');f.advance(3000);f.emit('pagehide');
  assert.equal(f.read('wwg:playtime').test,5);assert.deepEqual(f.read('wwg:sessions').test,{count:1,longest:5,last:5});
});
