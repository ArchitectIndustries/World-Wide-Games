'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'../..');
const O=require(path.join(ROOT,'games/orchard-slice/engine.js'));
const M=require(path.join(ROOT,'games/mosaic-memory/engine.js'));
const T=require(path.join(ROOT,'games/tabletop-commons/engine.js'));
const fruit=(id,x,y,kind=0)=>({id,x,y,kind,r:30,vx:0,vy:0,angle:0,spin:0,cut:false});
const copy=v=>JSON.parse(JSON.stringify(v));

test('Orchard swept blade catches mid-segment fruit, misses distant fruit, and cannot double cut',()=>{
  const r=new O.Run('classic',7);r.items=[fruit(1,150,100),fruit(2,250,100),fruit(3,200,180)];
  const hits=r.slice(0,100,400,100);assert.deepEqual(hits.map(f=>f.id),[1,2]);assert.equal(r.sliced,2);assert.equal(r.score,30);assert.equal(r.combo,2);
  assert.deepEqual(r.slice(400,100,0,100),[]);assert.equal(r.score,30);assert.equal(r.sliced,2);assert.equal(r.items[2].cut,false);
  assert.equal(O.segmentDistance(5,5,0,0,0,0),Math.sqrt(50));assert.equal(O.segmentDistance(100,100,0,100,200,100),0);
});
test('Orchard zero-length cut hits its radius and invalid coordinates have no effect',()=>{
  const r=new O.Run();r.items=[fruit(1,100,100),fruit(2,300,300)];assert.equal(r.slice(100,100,100,100).length,1);const before=copy(r.items);const score=r.score;
  for(const n of [NaN,Infinity,-Infinity])assert.deepEqual(r.slice(n,0,300,300),[]);assert.deepEqual(copy(r.items),before);assert.equal(r.score,score);
});
test('Orchard lethal hazard terminates the sweep before later fruit can award points',()=>{
  const r=new O.Run();r.score=40;r.lives=1;r.items=[fruit(1,100,100,'hazard'),fruit(2,200,100)];
  assert.equal(r.slice(0,100,300,100).length,1);assert.equal(r.lives,0);assert.equal(r.score,0);assert.equal(r.over,true);assert.equal(r.items[1].cut,false);
  const terminal=copy({time:r.time,score:r.score,items:r.items});r.step(.05);assert.deepEqual(r.slice(0,100,300,100),[]);assert.deepEqual(copy({time:r.time,score:r.score,items:r.items}),terminal);
});
test('Orchard active-time combos expire without relying on a wall clock',()=>{
  const r=new O.Run();r.spawnAt=100;r.items=[fruit(1,100,100)];r.slice(100,100,100,100);assert.equal(r.combo,1);
  for(let i=0;i<14;i++)r.step(.05);assert.equal(r.combo,0);r.items=[fruit(2,200,100)];r.slice(200,100,200,100);assert.equal(r.combo,1);assert.equal(r.score,20);
  const snapshot=copy({time:r.time,score:r.score,combo:r.combo});for(const dt of [0,-1,NaN,Infinity])r.step(dt);assert.deepEqual(copy({time:r.time,score:r.score,combo:r.combo}),snapshot);
});
test('Orchard 60-second expiry is terminal before the final tick can add a cut',()=>{
  const r=new O.Run();r.spawnAt=100;r.time=59.99;r.items=[fruit(1,100,100)];r.step(.02);assert.equal(r.time,60);assert.equal(r.over,true);assert.deepEqual(r.slice(0,100,200,100),[]);assert.equal(r.score,0);
});
test('Orchard zen spawns are safe and seeded physics stays finite across a complete run',()=>{
  for(const mode of ['classic','zen']){
    const a=new O.Run(mode,42),b=new O.Run(mode,42);let hazards=0;
    for(let i=0;i<7300&&!a.over;i++){a.step(1/120);b.step(1/120);for(const item of a.items){if(item.kind==='hazard')hazards++;assert.ok(Number.isFinite(item.x)&&Number.isFinite(item.y));}if(mode==='zen')assert.ok(a.items.every(item=>item.kind!=='hazard'));}
    assert.equal(a.time,60);assert.equal(a.over,true);assert.deepEqual(copy(a.items),copy(b.items));if(mode==='classic')assert.ok(hazards>0);
  }
});

function memoryBoard(){const b=new M.Board(3,()=>.5);b.cards=[{value:0,matched:false},{value:1,matched:false},{value:0,matched:false},{value:2,matched:false},{value:1,matched:false},{value:2,matched:false}];return b;}
test('Mosaic rejects duplicate flips, locks mismatches, and reveals exactly the next legal pair',()=>{
  const b=memoryBoard();assert.equal(b.flip(0),'first');assert.equal(b.flip(0),'rejected');assert.equal(b.moves,0);assert.equal(b.flip(1),'mismatch');assert.equal(b.moves,1);assert.equal(b.flip(2),'rejected');assert.deepEqual(b.open,[0,1]);
  for(let i=0;i<10;i++)b.step(.1);assert.equal(b.lock,0);assert.deepEqual(b.open,[]);assert.equal(b.flip(0),'first');assert.equal(b.flip(2),'match');assert.equal(b.matches,1);assert.equal(b.cards[0].matched,true);assert.equal(b.cards[2].matched,true);assert.equal(b.flip(0),'rejected');
});
test('Mosaic hints block flips, consume one penalty per accepted hint, and expire in active time',()=>{
  const b=memoryBoard();assert.equal(b.hint(),true);assert.equal(b.hints,1);assert.equal(b.visible(5),true);assert.equal(b.flip(0),'rejected');assert.equal(b.hint(),false);assert.equal(b.hints,1);
  for(let i=0;i<19;i++)b.step(.1);assert.equal(b.peek,0);assert.equal(b.visible(5),false);assert.equal(b.flip(0),'first');assert.equal(b.flip(1),'mismatch');assert.equal(b.hint(),false);
  const clean=memoryBoard(),helped=memoryBoard();helped.hint();assert.equal(clean.points()-helped.points(),150);
});
test('Mosaic completion freezes state and score, and invalid flips do not increase moves',()=>{
  const b=memoryBoard();for(const n of [-1,6,0.5,NaN])assert.equal(b.flip(n),'rejected');
  for(const pair of [[0,2],[1,4],[3,5]]){b.flip(pair[0]);b.step(.1);assert.equal(b.flip(pair[1]),'match');}
  assert.equal(b.done,true);assert.equal(b.matches,3);assert.equal(b.moves,3);const points=b.points(),elapsed=b.elapsed;for(let i=0;i<50;i++)b.step(.1);assert.equal(b.elapsed,elapsed);assert.equal(b.points(),points);assert.equal(b.flip(0),'rejected');assert.equal(b.hint(),false);
  b.moves=1000;b.elapsed=1000;b.hints=1000;assert.equal(b.points(),100);
});
test('Mosaic shuffle preserves pair counts without mutating the source collection',()=>{
  const source=[1,2,3,4];const shuffled=M.shuffle(source,()=>.1);assert.deepEqual(source,[1,2,3,4]);assert.deepEqual([...shuffled].sort(),source);for(const pairs of [6,8,10]){const b=new M.Board(pairs,()=>.5),counts=new Map();for(const c of b.cards)counts.set(c.value,(counts.get(c.value)||0)+1);assert.equal(counts.size,pairs);assert.ok([...counts.values()].every(n=>n===2));}
});

test('Four-in-row drops obey gravity, full-column rejection, and vertical/horizontal/diagonal wins',()=>{
  const b=Array(42).fill(0);for(let n=0;n<6;n++)assert.equal(T.drop(b,3,n%2+1),(5-n)*7+3);const before=[...b];for(const col of [3,-1,7,1.5])assert.equal(T.drop(b,col,1),-1);assert.deepEqual(b,before);
  for(const cells of [[35,36,37,38],[35,28,21,14],[35,29,23,17],[38,30,22,14]]){const a=Array(42).fill(0);cells.forEach(i=>a[i]=2);assert.equal(T.lineWinner(a,6,7,4),2);}const short=Array(42).fill(0);[35,36,37].forEach(i=>short[i]=1);assert.equal(T.lineWinner(short,6,7,4),0);
});
test('Four-in-row AI takes an immediate win and blocks the opponents forced win without mutation',()=>{
  for(const player of [1,2]){const b=Array(42).fill(0);for(const c of [0,1,2])T.drop(b,c,player);T.drop(b,6,3-player);const before=[...b];assert.equal(T.fourMove(b,2,4),3);assert.deepEqual(b,before);}
});
test('Tic-tac-toe AI blocks an immediate loss and keeps input state immutable',()=>{
  const b=[1,1,0,2,0,0,0,2,0],before=[...b];assert.equal(T.ticMove(b,2),2);assert.deepEqual(b,before);assert.equal(T.lineWinner([1,2,1,1,2,2,2,1,1],3,3,3),-1);assert.equal(T.ticMove([1,2,1,1,2,2,2,1,1]),-1);
});
test('Checkers starts on playable squares and mandatory capture suppresses every quiet move',()=>{
  const initial=T.checkersStart();assert.equal(initial.filter(p=>p===1).length,12);assert.equal(initial.filter(p=>p===2).length,12);initial.forEach((p,i)=>{if(p)assert.equal((Math.floor(i/8)+i%8)%2,1);});
  const b=Array(64).fill(0);b[42]=1;b[62]=1;b[33]=2;const before=[...b],moves=T.checkersMoves(b,1);assert.ok(moves.length>0);assert.ok(moves.every(m=>m.captured.length>0));assert.deepEqual(moves[0].captured,[33]);assert.equal(moves[0].to,24);assert.deepEqual(b,before);
});
test('Checkers capture must finish its multi-hop route and application does not mutate the board',()=>{
  const b=Array(64).fill(0);b[58]=1;for(const i of [49,33,19])b[i]=2;const before=[...b],moves=T.checkersMoves(b,1);assert.equal(moves.length,1);assert.deepEqual(moves[0].path,[40,26,12]);assert.deepEqual(moves[0].captured,[49,33,19]);const a=T.applyCheckers(b,moves[0]);assert.deepEqual(b,before);assert.equal(a[58],0);assert.equal(a[12],1);assert.equal(a.filter(Boolean).length,1);
});
test('Checkers crowning ends the move and kings may subsequently capture backward',()=>{
  const b=Array(64).fill(0);b[17]=1;b[10]=2;b[12]=2;const move=T.checkersMoves(b,1).find(m=>m.to===3);assert.ok(move);assert.deepEqual(move.path,[3]);assert.deepEqual(move.captured,[10]);const promoted=T.applyCheckers(b,move);assert.equal(promoted[3],3);assert.equal(promoted[12],2);assert.equal(T.owner(3),1);assert.ok(T.checkersMoves(promoted,1).some(m=>m.to===21&&m.captured.includes(12)));
  const reverse=Array(64).fill(0);reverse[26]=3;reverse[35]=2;assert.ok(T.checkersMoves(reverse,1).some(m=>m.to===44));reverse[26]=1;assert.ok(T.checkersMoves(reverse,1).every(m=>m.captured.length===0));
});
test('Checkers AI chooses a mandatory capture and enumeration leaves no temporary edits',()=>{
  const b=Array(64).fill(0);b[17]=2;b[26]=1;b[3]=2;const before=[...b],move=T.checkersAI(b,2,3);assert.ok(move);assert.ok(move.captured.length>0);assert.ok(move.captured.includes(26));assert.deepEqual(b,before);
});
test('Checkers preserves distinct capture routes that share a final landing',()=>{
  const b=Array(64).fill(0);b[51]=1;for(const i of [42,26,44,28])b[i]=2;
  const moves=T.checkersMoves(b,1).filter(m=>m.from===51&&m.to===19);
  assert.equal(moves.length,2);assert.deepEqual(moves.map(m=>m.path),[[33,19],[37,19]]);assert.deepEqual(moves.map(m=>m.captured),[[42,26],[44,28]]);
  const left=T.applyCheckers(b,moves[0]),right=T.applyCheckers(b,moves[1]);assert.equal(left[42],0);assert.equal(left[44],2);assert.equal(right[42],2);assert.equal(right[44],0);
});

function dominoFixture(){return{hands:[[[3,2],[6,5],[1,1]],[[0,1],[3,4]]],deck:[[0,0]],line:[[2,5]],turn:1,passes:0,winner:0};}
test('Domino placement orients both ends correctly and rejects invalid placements without mutation',()=>{
  const left=dominoFixture();assert.equal(T.dominoPlay(left,0,'left'),true);assert.deepEqual(left.line,[[3,2],[2,5]]);assert.equal(left.turn,2);
  const right=dominoFixture();assert.equal(T.dominoPlay(right,1,'right'),true);assert.deepEqual(right.line,[[2,5],[5,6]]);
  const bad=dominoFixture(),before=copy(bad);assert.equal(T.dominoPlay(bad,2,'left'),false);assert.equal(T.dominoPlay(bad,0,'middle'),false);assert.equal(T.dominoPlay(bad,100,'right'),false);assert.deepEqual(bad,before);
});
test('Domino draw keeps the turn until a legal tile can be played and legal moves forbid drawing',()=>{
  const s={hands:[[[1,1]],[[2,3]]],deck:[[5,6],[0,0]],line:[[2,5]],turn:1,passes:0,winner:0};
  assert.equal(T.dominoDraw(s),'draw');assert.equal(s.turn,1);assert.equal(s.hands[0].length,2);assert.equal(T.dominoDraw(s),'draw');assert.equal(s.turn,1);assert.equal(s.hands[0].length,3);assert.equal(s.deck.length,0);const before=copy(s);assert.equal(T.dominoDraw(s),false);assert.deepEqual(s,before);assert.equal(T.dominoPlay(s,2,'right'),true);assert.equal(s.turn,2);
});
test('Domino empty hands end immediately; two blocked passes compare pip totals and allow ties',()=>{
  const win={hands:[[[2,4]],[[1,3]]],deck:[],line:[[5,2]],turn:1,passes:0,winner:0};assert.equal(T.dominoPlay(win,0,'right'),true);assert.equal(win.winner,1);const before=copy(win);assert.equal(T.dominoDraw(win),false);assert.equal(T.dominoPlay(win,0,'right'),false);assert.deepEqual(win,before);
  for(const [hand,winner]of[[[1,2],1],[[1,1],-1]]){const s={hands:[[[1,1]],[hand]],deck:[],line:[[6,6]],turn:1,passes:0,winner:0};assert.equal(T.dominoDraw(s),'pass');assert.equal(s.turn,2);assert.equal(s.winner,0);assert.equal(T.dominoDraw(s),'pass');assert.equal(s.winner,winner);}
});
test('Twenty-five seeded domino games conserve all 28 unique tiles and terminate with a legal chain',()=>{
  for(let seed=1;seed<=25;seed++){
    const s=T.dominoStart(O.random(seed));let actions=0;
    while(!s.winner&&actions++<100){const moves=T.dominoMoves(s);if(moves.length){const m=moves[actions%moves.length];assert.equal(T.dominoPlay(s,m.index,m.side),true);}else assert.ok(T.dominoDraw(s));
      const all=[...s.deck,...s.hands[0],...s.hands[1],...s.line];assert.equal(all.length,28);assert.equal(new Set(all.map(t=>[...t].sort((a,b)=>a-b).join('-'))).size,28);for(let i=1;i<s.line.length;i++)assert.equal(s.line[i-1][1],s.line[i][0]);
    }
    assert.ok(s.winner);assert.ok(actions<100);
  }
});

function loadCommons({blocked=false,corrupt=false,standalone=false,origin='https://games.example',search=''}={}){
  const data=new Map(corrupt?[['broken','not-json']]:[]),messages=[],storageStatus={textContent:''},audioEvents=[];
  class Audio{constructor(){this.state='running';this.currentTime=0;this.destination={};audioEvents.push('created');}createOscillator(){return{type:'',frequency:{setValueAtTime(){}},connect(){},start(){audioEvents.push('tone');},stop(){}};}createGain(){return{gain:{setValueAtTime(n){audioEvents.push(n);},exponentialRampToValueAtTime(){}},connect(){}};}}
  const win={AudioContext:Audio},parent=standalone?win:{postMessage:(data,origin)=>messages.push({data,origin})};
  const context={window:win,parent,location:{origin,search},document:{getElementById:()=>storageStatus},localStorage:{getItem:k=>{if(blocked)throw Error('denied');return data.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('denied');data.set(k,v);}},URLSearchParams,Map,Number,JSON};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'assets/arcade-commons.js'),'utf8'),context);
  return{api:win.WWGArcade,messages,storageStatus,audioEvents,data};
}
test('Shared store survives denied storage and malformed JSON without losing session records',()=>{
  const denied=loadCommons({blocked:true});assert.equal(denied.api.store.read('missing',7),7);assert.equal(denied.api.store.available(),false);assert.match(denied.storageStatus.textContent,/Saving is unavailable/);assert.equal(denied.api.store.write('best',17),false);assert.equal(denied.api.store.read('best',0),17);assert.equal(denied.api.store.best('best',12),17);assert.equal(denied.api.store.best('best',22),22);
  const corrupt=loadCommons({corrupt:true});assert.equal(corrupt.api.store.read('broken',9),9);assert.equal(corrupt.api.store.available(),false);
});
test('Shared score events target the current origin, omit invalid numbers, and skip standalone/opaque pages',()=>{
  const c=loadCommons();c.api.send('test','done',44);c.api.send('test','done',NaN);assert.equal(c.messages.length,2);assert.equal(c.messages[0].origin,'https://games.example');assert.equal(c.messages[0].data.score,44);assert.equal(Object.hasOwn(c.messages[1].data,'score'),false);
  for(const options of [{standalone:true},{origin:'null'}]){const s=loadCommons(options);s.api.send('test','done',99);assert.equal(s.messages.length,0);}
});
test('Shared audio respects initial mute and clamps volume before creating an optional tone',()=>{
  const button=()=>({textContent:'',attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,v){this.listeners[k]=v;}});
  const muted=loadCommons({search:'?muted=1'}),b=button(),sound=muted.api.sound(b);assert.equal(b.textContent,'Sound off');sound.tone();assert.equal(muted.audioEvents.length,0);
  const loud=loadCommons({search:'?volume=999'}),c=button();loud.api.sound(c).tone();assert.ok(loud.audioEvents.includes('tone'));assert.ok(loud.audioEvents.includes(.045));assert.equal(c.attrs['aria-pressed'],'true');
});
