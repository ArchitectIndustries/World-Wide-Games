'use strict';
// Actual local rig modules, actual shared Engine in its GL contract fixture,
// and actual game code in a modeled DOM/canvas. No browser or GPU claim.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const M=require('../../games/aegis-verge/environment-mesh.js');
require('../../games/aegis-verge/enemy-armor-wear.js');
const R=require('../../games/aegis-verge/combat-rigs.js');
const PC=require('../../games/aegis-verge/player-chassis.js');
const ES=require('../../games/aegis-verge/enemy-silhouettes.js');
const W=require('../../games/aegis-verge/worldscape.js');
const {fixture}=require('./aegis-instance-storage.cjs');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
let passed=0;const checks=[],budgets=[];
const check=(name,test)=>{test();checks.push(name);passed++;};
const json=x=>JSON.stringify(x),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const vehicle={x:4,z:-2,yaw:.75,hull:100,energy:56,hitbox:1.15,score:400};
const rig={distance:4,motion:.8,steer:.6,contact:.2};
const player=(v=vehicle,r=rig,o={})=>R.playerParts(v,r,o,PC.parts(v,r,o));
const enemy=(type,extra={})=>({type,x:-4,z:6,yaw:.65,size:({skirmisher:1.4,lancer:1.7,bulwark:2.1,warden:2.4})[type],hp:8,max:8,idx:2,state:'seek',windup:0,windupTotal:.9,cycles:0,cool:0,flash:0,motionRate:.7,travelDistance:5,...extra});
const hostile=(e,q='full',time=5,calm=false)=>R.enemyParts(e,q,time,calm,ES.parts(e,q,time,calm));
const named=(items,name)=>items.find(p=>p.name===name);
const K=R.meshes();
check('immutable mesh identities reused, with a fixed sixteen-object library',()=>{assert.equal(R.meshes(),K);assert(Object.isFrozen(K));assert.equal(Object.keys(K).length,16);});
check('five authored hulls have distinct actual geometry',()=>assert.equal(new Set(['vesper','skirmisher','lancer','bulwark','warden'].map(k=>hash(K[k].triangles))).size,5));
check('all mesh buffers are finite, normalized and have unit face normals',()=>{
 for(const m of Object.values(K)){assert(m.vertices.length>=8);assert(m.trianglesCount>10);assert.equal(m.triangles.length%18,0);assert(m.triangles.every(Number.isFinite));assert(m.vertices.every(v=>v.every(n=>Math.abs(n)<=.501)));assert(m.faces.every(f=>Math.abs(Math.hypot(...f.n)-1)<1e-8));}
});
check('open belts and bored cannons retain actual interior surfaces',()=>{
 assert(K.track.faces.some(f=>f.n[1]>.8)&&K.track.faces.some(f=>f.n[1]<-.8));
 assert(K.tube.vertices.some(v=>Math.abs(v[2]-.12)<1e-9));
 assert(K.tube.vertices.filter(v=>Math.abs(v[2]-.5)<1e-9).length===16);
});
check('original vehicle hull has sloped shoulders and a tapered front',()=>{assert(K.vesper.faces.some(f=>Math.abs(f.n[0])>.1&&Math.abs(f.n[1])>.1));assert(K.vesper.vertices.filter(v=>v[2]===.5).every(v=>Math.abs(v[0])<=.15));});
check('metal, painted armor, glass and rubber use distinct surface responses',()=>{
 const p=player(),gun=named(p,'cannon-barrel').material,armor=named(p,'top-armor').material,glass=named(p,'cockpit').material,rubber=named(p,'traction-pod').material;
 assert(gun.metal>armor.metal);assert(glass.rough<armor.rough);assert(rubber.rough>.9&&rubber.metal<.05);assert([gun,armor,glass,rubber].every(m=>(m.alpha??1)===1));
});
check('mesh poses and materials have finite, positive dimensions and safe colors',()=>{
 for(const low of[false,true])for(const hull of[100,30,10])for(const parts of[player({...vehicle,hull},rig,{low,shield:true,dash:true,muzzle:.07}),...['skirmisher','lancer','bulwark','warden'].map(t=>hostile(enemy(t,{hp:2,state:'windup',windup:.2}),low?'lite':'full'))]){
  assert(parts.every(p=>Object.values(p.pose).every(Number.isFinite)&&p.pose.w>0&&p.pose.h>0&&p.pose.d>0&&/^#[a-f\d]{6}$/i.test(p.material.color)));
 }
});
for(const low of[false,true]){
 const p=player(vehicle,rig,{low}),tris=p.reduce((n,p)=>n+p.mesh.trianglesCount,0);
 budgets.push({model:'vesper',tier:low?'lite':'full',draws:p.length,triangles:tris});
 check(`Vesper ${low?'lite':'full'} stays within explicit draw/geometry budget`,()=>{assert(p.length<=(low?24:44));assert(tris<=(low?1700:2900));});
}
for(const type of['skirmisher','lancer','bulwark','warden']){
 for(const quality of['full','lite']){
  const p=hostile(enemy(type),quality),tris=p.reduce((n,p)=>n+p.mesh.trianglesCount,0);
  budgets.push({model:type,tier:quality,draws:p.length,triangles:tris});
  check(`${type}/${quality} retains its unique hull and bounded draw budget`,()=>{assert.equal(named(p,'keel').mesh,K[type]);assert(p.length<=(quality==='lite'?15:23));assert(tris<=(quality==='lite'?900:1350));});
 }
 check(`${type} preserves real battle-wear asymmetry and exposed conduit`,()=>{
  const healthy=hostile(enemy(type)),damaged=hostile(enemy(type,{hp:4}));
  const removed={skirmisher:'swept-fin',lancer:'prong',bulwark:'shield-shoulder',warden:'arm'}[type];
  assert(healthy.some(p=>p.name===removed&&p.pose.r>0));assert(!damaged.some(p=>p.name===removed&&p.pose.r>0));assert(named(damaged,'exposed-conduit').pose.r>0);
 });
 check(`${type} retains charge and stagger communication with calm effects`,()=>{
  const base=hostile(enemy(type),'lite',0,true),charge=hostile(enemy(type,{state:'windup',windup:.2}),'lite',20,true),stagger=hostile(enemy(type,{state:'stagger'}),'lite',50,true);
  assert.notEqual(named(base,'core').material.color,named(charge,'core').material.color);assert(named(charge,'charging-core'));assert(named(stagger,'exposed-core'));assert.equal(named(stagger,'core').material.color,'#67e8f9');
 });
}
check('warden rear reactor remains behind the hull, with a visible cyan optic',()=>{const p=hostile(enemy('warden'),'lite');assert(named(p,'rear-reactor').pose.f<named(p,'reactor-frame').pose.f);assert.equal(named(p,'rear-reactor').material.color,'#67e8f9');});
check('severely damaged skirmisher does not regrow its removed port through new detail',()=>{for(const q of['full','lite']){const p=hostile(enemy('skirmisher',{hp:1}),q);assert(!p.some(p=>p.name==='nozzle-glow'&&p.pose.r<0));}});
check('actual vehicle travel drives wheel rotation and contact drives suspension',()=>{
 assert.notEqual(named(player(),'road-wheel').pose.pitch,named(player(vehicle,{...rig,distance:4.5}),'road-wheel').pose.pitch);
 assert.notEqual(named(player(),'suspension-link').pose.y,named(player(vehicle,{...rig,contact:1}),'suspension-link').pose.y);
});
check('blocked vehicle with no new travel does not rotate its wheels',()=>{const r=PC.create();PC.advance(r,0,.1,1,true);assert.equal(named(player(vehicle,r),'road-wheel').pose.pitch,0);});
check('calm freezes wheel spin and suspension travel but keeps low-hull warning',()=>{
 assert.equal(named(player(vehicle,rig,{calm:true}),'road-wheel').pose.pitch,0);
 assert.equal(json(player(vehicle,rig,{calm:true})),json(player(vehicle,{...rig,distance:900,contact:.9},{calm:true})));
 assert.notEqual(named(player(vehicle,rig,{calm:true}),'side-stripe').material.color,named(player({...vehicle,hull:10},rig,{calm:true}),'side-stripe').material.color);
});
check('the actual muzzle timer drives Vesper cannon recoil without shifting aim yaw',()=>{const a=named(player(),'cannon-barrel'),b=named(player(vehicle,rig,{muzzle:.07}),'cannon-barrel');assert(b.pose.f<a.pose.f);assert.equal(a.pose.yaw,b.pose.yaw);assert.equal(a.pose.w,b.pose.w);});
check('calm retains a real muzzle cue without moving the barrel',()=>{const a=player(vehicle,rig,{calm:true}),b=player(vehicle,rig,{calm:true,muzzle:.07});assert.equal(named(a,'cannon-barrel').pose.f,named(b,'cannon-barrel').pose.f);assert(named(b,'barrel-optic'));});
check('hostile cannon recoil requires a real fired cycle and recovery timer',()=>{
 const e=enemy('lancer',{state:'recover',cool:1.31,cycles:1}),idle=named(hostile({...e,cycles:0}),'lance'),shot=named(hostile(e),'lance');
 assert(shot.pose.f<idle.pose.f);assert.equal(named(hostile({...e,cool:0}),'lance').pose.f,idle.pose.f);
 assert.equal(named(hostile({...e,cycles:0,flash:.12}),'lance').pose.f,idle.pose.f);
});
check('hostile wheel rotation uses actual distance and calm suppresses it',()=>{const e=enemy('bulwark');assert.notEqual(named(hostile(e),'drive-wheel').pose.pitch,named(hostile({...e,travelDistance:7}),'drive-wheel').pose.pitch);assert.equal(named(hostile(e,'full',5,true),'drive-wheel').pose.pitch,0);});
check('presentation remains deterministic and does not write authoritative inputs',()=>{
 const e=enemy('lancer',{state:'windup',windup:.2,hp:2}),before=json([vehicle,rig,e]);
 const a=player(),b=hostile(e);assert.equal(json(a),json(player()));assert.equal(json(b),json(hostile(e)));assert.equal(json([vehicle,rig,e]),before);
});
check('world transforms preserve the real actor yaw and forward weapon axis',()=>{
 const p={...vehicle,x:10,z:20,yaw:Math.PI/2},draws=[];PC.render({mesh:(...a)=>{draws.push(a);return true;}},p,rig,{low:true});
 const source=player(p,rig,{low:true}),i=source.findIndex(p=>p.name==='cannon-barrel'),pose=draws[i][1];assert(Math.abs(pose.x-(10+source[i].pose.f))<1e-8);assert(Math.abs(pose.z-(20-source[i].pose.r))<1e-8);assert.equal(pose.yaw,Math.PI/2);
});
check('all base presentation pieces stay within their existing local dimensions',()=>{
 for(const type of['skirmisher','lancer','bulwark','warden']){
  const e=enemy(type,{state:'windup',windup:.3}),base=ES.parts(e,'full',5,false),parts=hostile(e);
  for(let i=0;i<base.length;i++){assert.equal(parts[i].pose.w,base[i].w);assert.equal(parts[i].pose.h,base[i].h);assert.equal(parts[i].pose.d,base[i].d);}
 }
});
check('a renderer without mesh support retains the complete legacy actor path',()=>{let n=0;const p=PC.render({cube(){n++;}},vehicle,rig,{low:true});assert.equal(n,p);assert.equal(n,PC.parts(vehicle,rig,{low:true}).length);});
check('mesh allocation refusal falls back to a visible primitive for every piece',()=>{let n=0;const total=PC.render({mesh:()=>false,cube(){n++;}},vehicle,rig,{low:true});assert.equal(n,total);assert.equal(total,player(vehicle,rig,{low:true}).length);});

for(const reject of[false,true]){
 const f=fixture(),e=f.engine;f.driver.rejectShader=reject;M.install(e);e.batchEnabled=true;let refused=0;const mesh=e.mesh;e.mesh=(...a)=>{const result=mesh(...a);if(result===false&&a[2]?.pattern!==9&&(a[2]?.alpha??1)===1)refused++;return result;};
 for(let cycle=0;cycle<2;cycle++)for(const low of[false,true])for(let op=0;op<3;op++){
  const ctx={op,low,elapsed:cycle*9,relay:2,calm:false,player:{x:0,z:-27},enemies:[],cover:[],relays:[[-22,-13],[20,-8],[0,17]],muzzle:0,pulse:0,dash:0};
  W.frame(e,ctx);f.begin();W.render(e,ctx);W.animate(e,ctx);PC.render(e,vehicle,rig,{low,shield:true,dash:true,muzzle:.07});
  for(const type of['skirmisher','lancer','bulwark','warden'])for(const hp of[8,4,1])ES.render(e,enemy(type,{hp,state:'windup',windup:.1,weakpointFlash:.1}),low?'lite':'full',cycle*9,false);
 }
 const stats=e.environmentStats();
 check(`shader ${reject?'fallback':'enhanced'}: complete worlds, both rig tiers and all damage states fit the existing cache`,()=>{assert.equal(refused,0);assert(stats.meshes<=96);assert(stats.bytes<13000000);assert(f.driver.draws>0);});
 const before=e.environmentStats();f.begin();for(let i=0;i<12;i++){PC.render(e,vehicle,rig,{low:false,shield:true,muzzle:.07});ES.render(e,enemy('warden',{hp:1,state:'windup'}),'full',i,false);}
 check(`shader ${reject?'fallback':'enhanced'}: repeated actor poses cannot grow GPU mesh storage`,()=>assert.deepEqual(e.environmentStats(),before));
 check(`shader ${reject?'fallback':'enhanced'}: articulated draw restores original cube VAO`,()=>e.cube(0,1,0,1,1,1,'#ffffff'));
 e.dispose();check(`shader ${reject?'fallback':'enhanced'}: every owned mesh allocation is released`,()=>assert.equal(e.environmentStats().meshes,0));
 budgets.push({renderer:reject?'fallback':'enhanced',meshes:stats.meshes,vertexBytes:stats.bytes});
}

const live=boot('aegis-verge'),legacy=boot('aegis-verge');legacy.context.AegisCombatRigs=null;
for(const r of[live,legacy])r.byId.get('start').click();
for(const [width,height] of[[978,550],[1320,740],[740,390]]){
 live.context.innerWidth=width;live.context.innerHeight=height;const c=live.byId.get('c');c.clientWidth=width;c.clientHeight=height;live.context.render();
 const faces=live.context.engine.softwareFaces,calls=live.context.engine.calls;
 check(`actual ${width}×${height} fallback scene retains bounded geometry and live rig integration`,()=>{assert.equal(c.getAttribute('data-aegis-rigs'),'articulated-31');assert(faces>800&&faces<3800);assert(calls<450);});
 budgets.push({viewport:[width,height],softwareFaces:faces,draws:calls});
}
const state=()=>json(live.context.__aegisVerge.state()),before=state(),writes=live.writes.length,messages=live.messages.length;
for(let i=0;i<5;i++)live.context.render();
check('actual repeated renders cannot alter game state, persistence or platform events',()=>{assert.equal(state(),before);assert.equal(live.writes.length,writes);assert.equal(live.messages.length,messages);});
for(const r of[live,legacy])r.dispatch('keydown',{key:'w',code:'KeyW',repeat:false});
for(let i=0;i<80;i++)for(const r of[live,legacy]){r.context.update(.025);if(i%10===0)r.context.render();}
check('actual movement, AI, resources and score remain identical with new rigs present or absent',()=>assert.equal(state(),json(legacy.context.__aegisVerge.state())));
live.context.togglePause();const paused=state(),clock=live.context.elapsed,draws=[],original=live.context.engine.mesh;
live.context.engine.mesh=(mesh,pose,material)=>{if(mesh.id.startsWith('rig-'))draws.push([mesh.id,pose,material]);return original(mesh,pose,material);};
live.context.render();const first=json(draws);draws.length=0;live.context.update(.25);live.context.render();
check('actual pause freezes every articulated pose and the simulation clock',()=>{assert.equal(state(),paused);assert.equal(live.context.elapsed,clock);assert.equal(json(draws),first);});
{
 const r=boot('aegis-verge');r.byId.get('start').click();r.context.meta.unlocked=3;r.context.resetOperation(2);r.context.relay=2;r.context.spawnWave();
 r.context.innerWidth=1320;r.context.innerHeight=740;r.byId.get('c').clientWidth=1320;r.byId.get('c').clientHeight=740;
 r.context.player.x=0;r.context.player.z=-8;r.context.player.yaw=0;
 r.context.enemies.forEach((e,i)=>{e.x=-8+i*5;e.z=8;e.state='windup';e.windup=.15;e.windupTotal=1.1;e.hp=1;});r.context.render();
 check('wide fallback also bounds the final four-hostile wave with visible worn charging rigs',()=>{assert.equal(r.context.enemies.length,4);assert.equal(r.context.enemies.filter(e=>e.type==='warden').length,2);assert(r.context.engine.softwareFaces<3800);assert(r.context.engine.calls<470);});
 budgets.push({viewport:[1320,740],scenario:'staged final four-hostile wave',softwareFaces:r.context.engine.softwareFaces,draws:r.context.engine.calls});
}
console.log(JSON.stringify({passed,total:passed,scope:'Node geometry, modeled GL driver and actual game modules in modeled DOM/canvas; no browser/GPU claim.',budgets,checks},null,2));
