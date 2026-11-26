const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../games/solstice-wilds/model.js'),'utf8');
const model=import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const seconds=(m,s,n,input={})=>{for(let i=0;i<Math.round(n*60);i++)m.stepExpedition(s,input,1/60);};
function place(s,p,dz=0){s.player.x=p.x;s.player.z=p.z+dz;}
function finishArchive(m,s){
  place(s,m.TABLET,2);assert.equal(m.interact(s),true);assert.equal(s.modal,'archive');m.closeModal(s);
  for(const rune of s.sequence){place(s,m.PILLARS.find(p=>p.rune===rune),2);assert.equal(m.interact(s),true);}
  assert.equal(s.completed.archive,true);
}
function grantCollectedParts(s,n=4){for(let i=0;i<n;i++){s.crates[i].hp=0;s.crates[i].collected=true;}s.salvage=n;}
function finishBridge(m,s){if(!s.completed.archive)finishArchive(m,s);grantCollectedParts(s);place(s,m.SITES.bridge);assert.equal(m.interact(s),true);}
function finishSpire(m,s){if(!s.completed.bridge)finishBridge(m,s);for(const e of s.enemies)if(e.site==='spire'){e.hp=0;e.phase='dead';}place(s,m.SITES.spire);assert.equal(m.interact(s),true);}

test('seeded worlds and weather are deterministic and numerical input is bounded',async()=>{
  const m=await model,a=m.createExpedition(831),b=m.createExpedition(831);
  assert.deepEqual(a,b);assert.equal(new Set(a.sequence).size,3);
  for(const t of [0,30,70,110,150,900]){const w=m.weatherAt(t);assert.ok(w.rain>=0&&w.rain<=1);assert.ok(w.day>=.44&&w.day<=1);}
  assert.equal(m.weatherAt(0).rain,0);assert.equal(m.weatherAt(80).rain,1);assert.equal(m.weatherAt(150).rain,0);
  assert.deepEqual(m.createExpedition(0),m.createExpedition(7331));
  const start={...a.player};m.stepExpedition(a,{mx:Infinity,mz:NaN},.25);
  assert.equal(a.player.x,start.x);assert.equal(a.player.z,start.z);
  assert.ok(Math.abs(a.elapsed-.25)<1e-12);const elapsed=a.elapsed;m.stepExpedition(a,{mx:1},Infinity);assert.equal(a.elapsed,elapsed);
  m.stepExpedition(a,{mx:1},20);assert.ok(a.player.x-start.x<2);assert.ok(a.elapsed<.501);
});
test('movement has a fixed speed, clamps diagonals and is partition stable',async()=>{
  const m=await model,a=m.createExpedition(3),b=m.createExpedition(3),c=m.createExpedition(3);
  seconds(m,a,1,{mx:1});seconds(m,b,1,{mx:1,mz:1});for(let i=0;i<4;i++)m.stepExpedition(c,{mx:1},.25);
  assert.ok(Math.abs(Math.hypot(b.player.x,b.player.z-35)-5.3)<1e-8);
  assert.ok(Math.abs(a.player.x-5.3)<1e-8);assert.ok(Math.abs(a.player.x-c.player.x)<1e-8);
});
test('river, foundations, crates and world edge remain solid even at a long frame',async()=>{
  const m=await model,s=m.createExpedition(4);
  place(s,{x:20,z:-12});seconds(m,s,2,{mz:-1,sprint:true});assert.ok(s.player.z>-14);
  for(const x of [-45,0,20,45])assert.equal(m.canOccupy(s,x,-18),false);
  assert.equal(m.canOccupy(s,0,42),false);assert.equal(m.canOccupy(s,23,17),false);assert.equal(m.canOccupy(s,50,0),false);
  finishBridge(m,s);assert.equal(m.canOccupy(s,20,-18),true);assert.equal(m.canOccupy(s,10,-18),false);
  place(s,{x:20,z:-12});seconds(m,s,2,{mz:-1,sprint:true});assert.ok(s.player.z<-22);
});
test('sprint spends a finite resource and recovers after releasing the sprint',async()=>{
  const m=await model,s=m.createExpedition(5);seconds(m,s,2,{mx:1,sprint:true});
  assert.ok(s.player.stamina>49&&s.player.stamina<51);assert.ok(s.player.x>16);
  seconds(m,s,4,{});assert.equal(s.player.stamina,100);
});
test('a fresh Archive cannot be completed by approaching a pillar or by guessing without reading',async()=>{
  const m=await model,s=m.createExpedition(81);place(s,m.PILLARS[0],2);assert.equal(m.interact(s),false);
  assert.equal(s.archiveStep,0);assert.equal(s.completed.archive,false);assert.equal(s.score,0);
});
test('Archive reading pauses clocks, correct order advances, and a wrong rune resets honestly',async()=>{
  const m=await model,s=m.createExpedition(82);place(s,m.TABLET,2);m.interact(s);
  const clock=s.elapsed;seconds(m,s,2,{mx:1,pulse:true});assert.equal(s.elapsed,clock);assert.equal(s.pulses,0);
  m.closeModal(s);const correct=m.PILLARS.find(p=>p.rune===s.sequence[0]);place(s,correct,2);m.interact(s);assert.equal(s.archiveStep,1);
  const wrong=m.PILLARS.find(p=>p.rune!==s.sequence[1]);place(s,wrong,2);m.interact(s);assert.equal(s.archiveStep,0);assert.equal(s.score,0);
  for(const rune of s.sequence){place(s,m.PILLARS.find(p=>p.rune===rune),2);m.interact(s);}
  assert.equal(s.completed.archive,true);assert.equal(s.score,300);assert.ok(m.validateCheckpoint(s.checkpoint));
  m.interact(s);assert.equal(s.score,300);assert.equal(m.takeEvents(s).filter(e=>e.event==='archive-restored').length,1);
});
test('pulse requires active play and cooldown; visible targets take real damage before salvage exists',async()=>{
  const m=await model,s=m.createExpedition(4);place(s,{x:26,z:27});s.enemies.forEach(e=>{e.hp=0;});
  assert.equal(m.pulse(s),true);assert.equal(s.crates[1].hp,1);assert.equal(m.pulse(s),false);assert.equal(s.salvage,0);
  seconds(m,s,.35);assert.equal(m.pulse(s),true);assert.equal(s.crates[1].hp,0);assert.equal(s.salvage,0);
  place(s,s.crates[1]);seconds(m,s,.05);assert.equal(s.salvage,1);seconds(m,s,2);assert.equal(s.salvage,1);
  m.setPaused(s,true);assert.equal(m.pulse(s),false);
});
test('stone foundations occlude pulse targeting, and empty pulses never create rewards',async()=>{
  const m=await model,s=m.createExpedition(4);s.crates.forEach(c=>{c.hp=0;c.collected=true;});s.enemies.forEach(e=>{e.hp=0;});
  const enemy=s.enemies[0];Object.assign(enemy,{x:0,z:46,hp:3,phase:'patrol'});place(s,{x:0,z:36});
  m.pulse(s);assert.equal(enemy.hp,3);assert.equal(s.score,0);assert.equal(s.salvage,0);
});
test('bridge repair requires the Archive and four actually carried parts, spends once',async()=>{
  const m=await model,s=m.createExpedition(4);grantCollectedParts(s);place(s,m.SITES.bridge);assert.equal(m.interact(s),false);
  finishArchive(m,s);s.salvage=3;place(s,m.SITES.bridge);assert.equal(m.interact(s),false);assert.equal(s.completed.bridge,false);
  s.salvage=4;assert.equal(m.interact(s),true);assert.equal(s.salvage,0);assert.equal(s.completed.bridge,true);assert.equal(s.score,600);
  m.interact(s);assert.equal(s.score,600);assert.equal(s.salvage,0);assert.equal(m.takeEvents(s).filter(e=>e.event==='bridge-repaired').length,1);
});
test('enemy melee announces a windup, locks its target, and can be dodged',async()=>{
  const m=await model,s=m.createExpedition(4);const e=s.enemies[0];place(s,{x:18,z:13});e.x=20;e.z=13;e.cooldown=0;
  seconds(m,s,.04);assert.equal(e.phase,'windup');assert.ok(e.target);assert.equal(s.player.hp,100);
  const target={...e.target};seconds(m,s,.7,{mx:-1,sprint:true});assert.deepEqual(e.target,target);seconds(m,s,.2,{mx:-1});assert.equal(s.player.hp,100);
});
test('standing in a telegraphed strike causes finite damage and the loss transition freezes play',async()=>{
  const m=await model,s=m.createExpedition(4),e=s.enemies[0];place(s,{x:18,z:13});Object.assign(e,{x:20,z:13,cooldown:0});
  seconds(m,s,1);assert.equal(s.player.hp,82);assert.ok(s.player.invulnerable>0);
  s.player.hp=10;s.player.invulnerable=0;e.phase='windup';e.clock=1;e.windup=.8;e.target={x:s.player.x,z:s.player.z};
  seconds(m,s,.05);assert.equal(s.mode,'dead');assert.equal(s.player.hp,0);const before=JSON.stringify(s);
  seconds(m,s,20,{mx:1,pulse:true,interact:true});assert.equal(JSON.stringify(s),before);
  assert.equal(m.takeEvents(s).filter(e=>e.event==='campaign-complete').length,0);
});
test('northern sentinels launch bounded projectiles, which damage and expire',async()=>{
  const m=await model,s=m.createExpedition(6);finishBridge(m,s);place(s,{x:-7,z:-28});
  const e=s.enemies.find(e=>e.id==='spire-west');e.x=-7;e.z=-35;e.cooldown=0;seconds(m,s,1.15);assert.ok(s.projectiles.length>0);
  seconds(m,s,.6);assert.ok(s.player.hp<100);seconds(m,s,4,{mx:-1});assert.ok(s.projectiles.every(q=>q.ttl>0&&q.ttl<=2.3));
});
test('pause and journal stop simulation, attacks, weather, effects and resource clocks',async()=>{
  const m=await model,s=m.createExpedition(4);m.pulse(s);m.setPaused(s,true);const before=JSON.stringify(s);seconds(m,s,20,{mx:1,pulse:true,interact:true});assert.equal(JSON.stringify(s),before);
  m.setPaused(s,false);m.openJournal(s);const journal=JSON.stringify(s);seconds(m,s,20,{mx:1,pulse:true});assert.equal(JSON.stringify(s),journal);m.closeModal(s);seconds(m,s,.1);assert.ok(s.elapsed>0);
});
test('Spire and extraction are protected by all prerequisite flags and live guardians',async()=>{
  const m=await model,s=m.createExpedition(5);place(s,m.SITES.spire);assert.equal(m.interact(s),false);
  finishBridge(m,s);place(s,m.SITES.spire);assert.equal(m.interact(s),false);assert.equal(s.completed.spire,false);
  for(const e of s.enemies)if(e.site==='spire'&&e.type!=='warden')e.hp=0;
  assert.equal(m.interact(s),false);place(s,{x:0,z:37.8});m.interact(s);assert.equal(s.mode,'playing');
  finishSpire(m,s);assert.equal(s.mode,'playing');place(s,{x:0,z:37.8});m.interact(s);assert.equal(s.mode,'won');
});
test('completion emits one eligible score, and later actions never duplicate a reward',async()=>{
  const m=await model,s=m.createExpedition(9);finishSpire(m,s);place(s,{x:0,z:37.8});m.interact(s);
  const events=m.takeEvents(s),completion=events.filter(e=>e.event==='campaign-complete');assert.equal(completion.length,1);assert.equal(completion[0].score,s.score);assert.ok(Number.isFinite(completion[0].score));
  assert.ok(events.filter(e=>e.event!=='campaign-complete').every(e=>!Object.hasOwn(e,'score')));
  for(let i=0;i<10;i++){m.interact(s);m.pulse(s);m.stepExpedition(s,{interact:true},.1);}assert.equal(m.takeEvents(s).length,0);
});
test('checkpoint resumes preserve collected/defeated world state and cannot submit a score',async()=>{
  const m=await model,s=m.createExpedition(18);s.crates[0].hp=0;s.crates[0].collected=true;s.salvage=1;s.enemies[0].hp=0;s.score=85;finishArchive(m,s);
  const resumed=m.restoreCheckpoint(s.checkpoint);assert.ok(resumed);assert.equal(resumed.ranked,false);assert.equal(resumed.salvage,1);assert.equal(resumed.crates[0].collected,true);assert.equal(resumed.enemies[0].hp,0);
  place(resumed,resumed.crates[0]);seconds(m,resumed,.1);assert.equal(resumed.salvage,1);
  finishSpire(m,resumed);place(resumed,{x:0,z:37.8});m.interact(resumed);const win=m.takeEvents(resumed).find(e=>e.event==='campaign-complete');assert.ok(win);assert.equal(Object.hasOwn(win,'score'),false);
});
test('retry restores the saved boundary, resets transient threats and is always practice',async()=>{
  const m=await model,s=m.createExpedition(13);finishArchive(m,s);const oldScore=s.score;s.player.hp=0;s.mode='dead';s.salvage=5;s.projectiles.push({ttl:2});
  const retry=m.retryExpedition(s);assert.equal(retry.mode,'playing');assert.equal(retry.player.hp,100);assert.equal(retry.score,oldScore);assert.equal(retry.salvage,0);assert.equal(retry.ranked,false);assert.equal(retry.projectiles.length,0);assert.deepEqual(retry.completed,{archive:true,bridge:false,spire:false});
  const freshRetry=m.retryExpedition(m.createExpedition(4));assert.equal(freshRetry.ranked,false);assert.equal(freshRetry.completed.archive,false);
});
test('malformed saves, forged dependencies and inconsistent inventories are rejected',async()=>{
  const m=await model,s=m.createExpedition(31);finishArchive(m,s);const valid=m.makeCheckpoint(s);assert.ok(m.validateCheckpoint(valid));
  const cases=[null,[],{}, {...valid,schema:2},{...valid,seed:Infinity},{...valid,score:-1},{...valid,elapsed:NaN},{...valid,salvage:999},{...valid,salvage:1},{...valid,archiveRead:false},{...valid,completed:{archive:false,bridge:true,spire:false}},{...valid,completed:{archive:true,bridge:false,spire:true}},{...valid,defeated:['not-a-guardian']},{...valid,defeated:['workshop-1','workshop-1']},{...valid,crates:[{hp:0,collected:true}]},{...valid,crates:valid.crates.map((c,i)=>i?c:{hp:2,collected:true})}];
  for(const bad of cases){assert.equal(m.validateCheckpoint(bad),null);assert.equal(m.restoreCheckpoint(bad),null);}
  const clean=m.validateCheckpoint({...valid,evil:'ignored'});assert.equal('evil'in clean,false);
});
test('denied, malformed and oversized browser storage are safe',async()=>{
  const m=await model,s=m.createExpedition(9);finishArchive(m,s);const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');},removeItem(){throw Error('denied');}};
  assert.equal(m.readCheckpoint(denied),null);assert.equal(m.writeCheckpoint(denied,s.checkpoint),false);assert.equal(m.clearCheckpoint(denied),false);
  for(const raw of ['{','null','[]','x'.repeat(5000)])assert.equal(m.readCheckpoint({getItem:()=>raw}),null);
  let raw=null;const memory={getItem:()=>raw,setItem(k,v){raw=v;},removeItem(){raw=null;}};
  assert.equal(m.writeCheckpoint(memory,s.checkpoint),true);assert.deepEqual(m.readCheckpoint(memory),s.checkpoint);assert.equal(m.clearCheckpoint(memory),true);assert.equal(m.readCheckpoint(memory),null);
});
test('an actual input-driven expedition can solve, salvage, cross, fight and return',async()=>{
  const m=await model,s=m.createExpedition(20261126);
  function walk(x,z,pulse=false){
    let stalled=0;
    for(let i=0;i<1800;i++){
      const dx=x-s.player.x,dz=z-s.player.z,d=Math.hypot(dx,dz);if(d<.42)return;
      const old={x:s.player.x,z:s.player.z};m.stepExpedition(s,{mx:dx/d,mz:dz/d,sprint:true,pulse},1/60);
      assert.equal(s.mode,'playing',`Expedition failed while walking to ${x},${z}`);
      if(Math.hypot(old.x-s.player.x,old.z-s.player.z)<.001)stalled++;else stalled=0;
      assert.ok(stalled<120,`Route blocked near ${s.player.x.toFixed(2)},${s.player.z.toFixed(2)} toward ${x},${z}`);
    }
    assert.fail(`Route timed out to ${x},${z}`);
  }
  for(const [x,z]of[[-12,27],[-23,18],[-31,9]])walk(x,z);assert.equal(m.interact(s),true);m.closeModal(s);walk(-28,9);walk(-28,4);
  for(const rune of s.sequence){const p=m.PILLARS.find(p=>p.rune===rune);walk(p.x,p.z+2.3);assert.equal(m.interact(s),true);}
  assert.equal(s.completed.archive,true);
  for(const [x,z]of[[-28,3],[-28,9],[-31,10],[-19,13],[-8,16],[3,23],[15,26],[25,27]])walk(x,z,true);
  for(const index of [1,2,3,4]){
    const c=s.crates[index];walk(c.x,c.z+2.3,true);
    for(let i=0;i<360&&c.hp>0;i++)m.stepExpedition(s,{pulse:true},1/60);
    assert.equal(c.hp,0);walk(c.x,c.z,true);
  }
  assert.ok(s.salvage>=4);
  for(const [x,z]of[[28,2],[20,-10]])walk(x,z,true);assert.equal(m.interact(s),true);assert.equal(s.completed.bridge,true);
  walk(20,-25,true);walk(10,-31,true);
  for(let lap=0;lap<3&&s.enemies.some(e=>e.site==='spire'&&e.hp>0);lap++)for(const [x,z]of[[12.5,-31],[12.5,-47.8],[-10,-47.8],[-12,-33],[4,-28],[10,-31]])walk(x,z,true);
  assert.ok(s.enemies.filter(e=>e.site==='spire').every(e=>e.hp===0));walk(2,-33,true);walk(2,-34.9,true);assert.equal(m.interact(s),true);assert.equal(s.completed.spire,true);
  for(const [x,z]of[[10,-31],[20,-25],[20,-10],[20,6],[15,26],[5,31],[0,37.8]])walk(x,z);assert.equal(m.interact(s),true);assert.equal(s.mode,'won');
  const events=m.takeEvents(s);assert.equal(events.filter(e=>e.event==='campaign-complete').length,1);assert.equal(events.filter(e=>e.event==='checkpoint').length,3);assert.ok(s.player.hp>0);
});
