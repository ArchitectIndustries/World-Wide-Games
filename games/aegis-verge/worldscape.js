/* Aegis Verge 3.0 — original authored industrial landscapes.
 * Architect Industries, MIT. All geometry is locally generated once per tier.
 * Terrain and installations are outside the traversable square or below it.
 * Animation observes actual simulation time / relay state; it cannot move a
 * collider, change an enemy, advance a timer, save a record or award a score.
 */
(function(root){
'use strict';
const M=root.AegisEnvironmentMesh||(typeof require==='function'?require('./environment-mesh.js'):null);
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),cache=new Map(),primitiveCache=new Map();
const THEMES=Object.freeze([
 {name:'salt-causeway',sky:'#173750',horizon:'#abc4ca',fog:'#809fab',sun:'#ffe3b6',rock:'#71818b',deck:'#344c5c',metal:'#567282',trim:'#c0b6a2',dark:'#223b4a',accent:'#70e7ec',water:'#315b70'},
 {name:'scar-reactor',sky:'#302a41',horizon:'#c6a69b',fog:'#957f85',sun:'#ffd6ac',rock:'#8c6c68',deck:'#51444c',metal:'#876a69',trim:'#d6b5a0',dark:'#3d3547',accent:'#ffad86',water:'#566779'},
 {name:'crown-array',sky:'#17233e',horizon:'#899bbd',fog:'#637895',sun:'#d9dfff',rock:'#626780',deck:'#3e4861',metal:'#75839e',trim:'#c5c6db',dark:'#2d3755',accent:'#c7b0ff',water:'#3e587f'}
]);
function primitives(low){
 if(primitiveCache.has(!!low))return primitiveCache.get(!!low);
 const n=low?6:14;
 const result={
  block:low?M.geometry('world-block-low',[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]):M.bevel('world-block-'+n,1,1,1,.13),
  pillar:M.lathe('world-pillar-'+n,low?[[0,.60],[.12,.48],[.87,.34],[1,.54]]:[[0,.56],[.06,.68],[.12,.48],[.84,.34],[.91,.54],[1,.54]],n),
  tank:M.lathe('world-tank-'+n,low?[[-.5,.34],[-.35,.5],[.34,.5],[.5,.26]]:[[-.5,.34],[-.43,.49],[-.32,.5],[.33,.5],[.43,.39],[.5,.26]],n),
  pipe:M.lathe('world-pipe-'+n,[[-.5,.5],[.5,.5]],n),
  arch:M.arch('world-arch-'+n,28,11,1.5,4,low?8:20),
  ring:M.torus('world-ring-'+n,1,.075,low?10:36,low?3:8),
  rock:M.lathe('world-rock-'+n,[[0,.52],[.23,.58],[.76,.32],[1,.03]],low?5:7),
  smoke:M.sphere('world-steam-'+n,low?6:10,low?4:6),
  sky:M.sphere('world-sky-'+n,24,12,true),
  crystal:M.lathe('world-crystal-'+n,[[-.5,.02],[-.26,.46],[.28,.34],[.5,.02]],low?6:10),
  blade:M.geometry('world-airfoil',[[0,0,-.14],[-.35,1,-.13],[-.67,6,-.04],[.2,7,.02],[.57,2,.13],[.28,0,.14]],[[0,1,2,3,4,5],[5,4,3,2,1,0]])
 };primitiveCache.set(!!low,result);return result;
}
function terrain(op,low){
 const sides=low?8:16,radii=low?[42,49,61,81,112,160]:[42,46,52,61,72,86,104,128,160],v=[],f=[],n=sides*4;
 for(const r of radii)for(let i=0;i<n;i++){
  const a=i*TAU/n,co=Math.cos(a),si=Math.sin(a),k=Math.max(Math.abs(co),Math.abs(si)),x=co/k*r,z=si/k*r,t=(r-42)/118;
  const valley=Math.min(1,t/.20),soft=valley*valley*(3-2*valley),ridge=Math.pow(Math.max(0,(t-.22)/.78),.7),peaks=24+34*(.5+.5*Math.sin(a*3+op*.8)*Math.cos(a*7-.3+op));
  const y=-.65-13*soft+ridge*peaks+Math.sin(a*11+op)*Math.min(3,t*8);
  v.push([x,y,z]);
 }
 for(let j=0;j<radii.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=b+n,d=a+n;f.push([a,b,c],[a,c,d]);}
 return M.geometry('terrain-'+op+'-'+Number(low),v,f);
}
function makeScene(op=0,low=false){
 op=clamp(Math.floor(op)||0,0,2);const key=op+'/'+Number(low);if(cache.has(key))return cache.get(key);
 const t=THEMES[op],p=primitives(low),groups=new Map(),parts=[];let districtX=0,districtZ=0;
 const material={rock:{color:t.rock,rough:.94,metal:0,pattern:2,ground:true},deck:{color:t.deck,rough:.8,metal:.16,pattern:3,ground:true},metal:{color:t.metal,rough:.46,metal:.62},trim:{color:t.trim,rough:.36,metal:.52},dark:{color:t.dark,rough:.65,metal:.46},light:{color:t.accent,rough:.35,metal:.30,emissive:.55},water:{color:t.water,rough:.16,metal:.35,pattern:4},glass:{color:'#35586c',rough:.18,metal:.42}};
 function add(mesh,pose,kind='metal',tag='perimeter'){
  pose={...pose,x:(pose.x||0)+districtX,z:(pose.z||0)+districtZ};
  const k=kind,group=groups.get(k)||[];group.push({mesh,pose});groups.set(k,group);parts.push({mesh,pose,kind,tag});
 }
 const block=(x,y,z,w,h,d,kind='metal',yaw=0)=>add(p.block,{x,y,z,sx:w,sy:h,sz:d,yaw},kind);
 const pipe=(a,b,r,kind='metal')=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz);add(p.pipe,{x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,z:(a[2]+b[2])/2,sx:r*2,sy:length,sz:r*2,yaw:Math.atan2(dx,dz),pitch:Math.acos(dy/length)},kind);};
 const beam=(a,b,w=.45,d=w,kind='metal')=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz);add(p.block,{x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,z:(a[2]+b[2])/2,sx:w,sy:length,sz:d,yaw:Math.atan2(dx,dz),pitch:Math.acos(dy/length)},kind);};
 add(terrain(op,low),{},'rock','terrain');
 add(M.geometry('drive-deck',[[-42,-.095,-42],[-42,-.095,42],[42,-.095,42],[42,-.095,-42]],[[0,1,2,3]]),{},'deck','drive-plane');
 // The floor is an industrial platform supported over a sculpted basin.
 // Buttresses remain beyond the collision boundary, and the foundation's
 // entire top remains below the existing driving / projectile plane.
 for(const side of[-1,1]){
  block(side*41.5,-4.2,0,1,8,84,'dark');block(0,-4.2,side*41.5,82,8,1,'dark');
  for(let k=-35;k<=35;k+=14){block(side*43,-3.7,k,3.5,7,2.4,'metal');block(k,-3.7,side*43,2.4,7,3.5,'metal');}
  for(let k=-36;k<=36;k+=12){block(side*40.6,.58,k,.24,1.35,.25,'trim');block(k,.58,side*40.6,.25,1.35,.24,'trim');}
  beam([side*40.6,1.18,-39],[side*40.6,1.18,39],.12,.15,'trim');beam([-39,1.18,side*40.6],[39,1.18,side*40.6],.12,.15,'trim');
 }
 // Water occupies the basin below the arena; it is never a traversable route.
 add(M.geometry('basin',[[-130,-9.5,-130],[-130,-9.5,130],[130,-9.5,130],[130,-9.5,-130]],[[0,1,2,3]]),{},'water','below-arena');
 const rocks=low?10:22;
 for(let i=0;i<rocks;i++){const a=i*TAU/rocks+.17,rad=76+(i%3)*7,x=Math.sin(a)*rad,z=Math.cos(a)*rad,h=10+(i%5)*3.3;add(p.rock,{x,y:-9,z,sx:7+(i%4),sy:h,sz:6+(i%3),yaw:a,pitch:Math.sin(i)*.09,roll:Math.cos(i)*.08},'rock');}
 // An authored western crane and eastern processing works give the arena
 // orientation landmarks even when the player looks away from the objective.
 // The tall districts also clear the full 15m tactical camera boom outside
 // the playable boundary, so decorative structures cannot swallow the camera.
 districtX=-14;
 add(p.pillar,{x:-59,y:-8,z:-10,sx:5,sy:27,sz:5},'metal');
 block(-59,19.6,-10,6,2.2,5,'dark');block(-59,21.2,-10,4.4,1,4.2,'trim');
 beam([-74,21,-10],[-44,21,-10],1.1,1.2,'trim');beam([-59,27,-10],[-74,21,-10],.18,.18,'dark');beam([-59,27,-10],[-44,21,-10],.18,.18,'dark');beam([-59,19,-10],[-59,27,-10],.35,.35,'metal');
 block(-60,18,-8,3.1,2.5,2.4,'glass');
 districtX=14;
 for(const side of[-1,1]){
  add(p.tank,{x:54+side*5,y:5.3,z:-24,sx:7,sy:13,sz:7},'metal');
  for(const y of[1,7,10.2])add(p.ring,{x:54+side*5,y,z:-24,sx:3.6,sy:3.6,sz:3.6},'trim');
  pipe([54+side*5,10.4,-24],[54+side*5,10.4,-34],.55,'dark');
 }
 block(54,-.9,-24,19,1.8,16,'dark');block(54,4.4,-34,16,8,4,'metal');
 for(let i=0;i<5;i++){block(48+i*3,6.2,-36.1,1.4,1.9,.12,'glass');block(48+i*3,1.8,-36.1,1.4,.25,.13,'light');}
 add(p.pillar,{x:62,y:-3,z:-34,sx:3,sy:31,sz:3},'trim');
 districtX=0;districtZ=14;
 if(op===0){
  // Salt Bastion: a complete three-span causeway, not a row of towers.
  for(const x of[-28,0,28])add(p.arch,{x,y:-3,z:52},'trim');
  block(0,9.2,52,87,1.5,6,'metal');block(0,10.05,52,87,.18,5.4,'dark');
  for(const x of[-43,-14,14,43])add(p.pillar,{x,y:-12,z:52,sx:3.8,sy:21,sz:4.6},'metal');
  for(const z of[49.3,54.7]){
   beam([-43,11.4,z],[43,11.4,z],.2,.2,'trim');
   for(let x=-42;x<=42;x+=7){block(x,10.8,z,.18,1.3,.18,'trim');if(!low&&x<42)beam([x,10.2,z],[x+7,11.4,z],.11,.11,'metal');}
  }
  for(const rawX of[-53,52]){const x=rawX+Math.sign(rawX)*14;add(p.pillar,{x,y:-8,z:23,sx:2.3,sy:34,sz:2.3},'trim');add(p.tank,{x,y:26.3,z:23,sx:2.4,sy:4,sz:2.4,pitch:Math.PI/2},'metal');}
  block(-49,2,53,7,5.5,12,'metal');block(49,2,53,7,5.5,12,'metal');
 }else if(op===1){
  // Relay Scar: an open circular reactor with flanking pressure vessels.
  block(0,.4,57,36,2.2,15,'dark');
  add(p.ring,{x:0,y:19,z:58,sx:15,sy:15,sz:15,pitch:Math.PI/2},'trim');
  add(p.ring,{x:0,y:19,z:58,sx:12.9,sy:12.9,sz:12.9,pitch:Math.PI/2},'dark');
  for(const x of[-28,28]){
   add(p.tank,{x,y:6,z:55,sx:10,sy:18,sz:10},'metal');
   for(const y of[0,8,13])add(p.ring,{x,y,z:55,sx:5.1,sy:5.1,sz:5.1},'trim');
   pipe([x,12,55],[x,12,45],.7,'trim');pipe([x,12,45],[x*.6,12,45],.7,'trim');
  }
  for(const x of[-13,13])add(p.pillar,{x,y:1,z:58,sx:4,sy:18,sz:5},'metal');
  for(const x of[-59,59]){add(p.pillar,{x,y:-8,z:31,sx:5,sy:37,sz:5},'metal');add(p.ring,{x,y:28,z:31,sx:3.2,sy:3.2,sz:3.2},'light');}
 }else{
  // Null Crown: paired tilted octagonal arrays and a suspended crystal.
  for(const x of[-29,29]){
   add(p.pillar,{x,y:-8,z:58,sx:6,sy:37,sz:6},'metal');
   add(p.crystal,{x,y:31,z:58,sx:6,sy:10,sz:6,yaw:x*.01},'trim');
   beam([x,25,58],[x*.58,33,58],.65,1,'dark');
  }
  add(p.ring,{x:0,y:26,z:61,sx:19,sy:19,sz:19,pitch:Math.PI/2,yaw:.22},'trim');
  add(p.ring,{x:0,y:26,z:61,sx:16.4,sy:16.4,sz:16.4,pitch:Math.PI/2,yaw:-.25},'metal');
  block(0,1,58,36,3.5,14,'dark');
  for(let x=-14;x<=14;x+=7)add(p.crystal,{x,y:5.5,z:52,sx:2.8,sy:5.5,sz:2.8},'trim');
  for(const x of[-67,67]){add(p.pillar,{x,y:-8,z:16,sx:3.5,sy:30,sz:3.5},'metal');add(p.ring,{x,y:22,z:16,sx:6,sy:6,sz:6},'trim');}
 }
 districtZ=0;
 // A few long outer conduits connect authored buildings without crossing a
 // player's collision path. Their valves and collars provide real silhouettes.
 for(const x of[-47,47]){pipe([x,2,-36],[x,2,36],.6,'dark');for(let z=-30;z<=30;z+=15){add(p.ring,{x,y:2,z,sx:.78,sy:.78,sz:.78,pitch:Math.PI/2},'trim');block(x,-1,z,2.2,5,1.4,'metal');}}
 const meshes=[...groups].map(([kind,list])=>({mesh:M.merge('world-'+key+'-'+kind,list),material:material[kind]}));
 const scene={op,low,theme:t,primitives:p,meshes,parts,triangleCount:meshes.reduce((n,q)=>n+q.mesh.trianglesCount,0),vertexBytes:meshes.reduce((n,q)=>n+q.mesh.triangles.byteLength,0)};
 cache.set(key,scene);return scene;
}
function frame(engine,context){
 const op=clamp(Math.floor(context.op)||0,0,2),t=THEMES[op],time=Number.isFinite(context.elapsed)?Math.max(0,context.elapsed):0,relay=clamp(Math.floor(context.relay)||0,0,3);
 const boxes=(context.cover||[]).filter(b=>[b.x,b.z,b.w,b.d,b.h].every(Number.isFinite)&&b.h>0).map(b=>({x:b.x,z:b.z,w:b.w,d:b.d,h:b.h}));
 const contacts=[];if(context.player)contacts.push({x:context.player.x,z:context.player.z,radius:1.65,height:1.1});
 for(const e of context.enemies||[])if(!e.dead&&contacts.length<8)contacts.push({x:e.x,z:e.z,radius:e.type==='warden'?2.3:e.type==='bulwark'?2:1.35,height:1.45});
 const lights=[];for(let i=0;i<Math.min(3,(context.relays||[]).length);i++){const p=context.relays[i];if(i<=relay)lights.push({x:p[0],y:3.5,z:p[1],radius:12,color:i<relay?'#74f2bd':context.warning?'#ffcc78':t.accent,power:i<relay?1.4:2});}
 if(context.player&&(context.muzzle>0||context.pulse>0||context.dash>0))lights.push({x:context.player.x,y:1.8,z:context.player.z,radius:context.pulse>0?12:7,color:context.muzzle>0?'#fff0bc':'#8cf3ff',power:2.3});
 engine.environmentFrame={sky:t.sky,horizon:t.horizon,fog:t.fog,sunColor:t.sun,time,calm:!!context.calm,boxes,contacts,lights};
 if(engine.canvas?.getAttribute?.('data-aegis-scene')!==t.name)engine.canvas?.setAttribute?.('data-aegis-scene',t.name);
 engine.fog=[parseInt(t.fog.slice(1,3),16)/255,parseInt(t.fog.slice(3,5),16)/255,parseInt(t.fog.slice(5,7),16)/255];
 engine.fogNear=48;engine.fogFar=220;engine.far=360;
 if(engine.sun){engine.sun.x=.42;engine.sun.y=-.86;engine.sun.z=.29;}
 if(engine.mode==='webgl2'&&engine.batchEnabled===false)engine.quality=.75;
 return{op,time,relay,calm:!!context.calm,warning:!!context.warning};
}
function render(engine,context){
 if(typeof engine?.mesh!=='function')return 0;
 const low=!!context.low||engine.batchEnabled===false,scene=makeScene(context.op,low),{theme:t,primitives:p}=scene;
 engine.mesh(p.sky,{y:-18,sx:285,sy:285,sz:285},{color:t.sky,pattern:9});
 for(const q of scene.meshes)engine.mesh(q.mesh,{},q.material);
 return scene.meshes.length+1;
}
function motion(context){
 const time=context.calm?0:Math.max(0,Number(context.elapsed)||0),relay=clamp(Math.floor(context.relay)||0,0,3),power=relay/3;
 return{phase:time*(.19+power*.13),trolley:Math.sin(time*.09)*10,cargoHeight:10+Math.sin(time*.14)*2,coreTurn:time*.13,steamPhase:time*.23,power};
}
function animate(engine,context){
 if(typeof engine?.mesh!=='function')return 0;
 const low=!!context.low||engine.batchEnabled===false,scene=makeScene(context.op,low),{theme:t,primitives:p}=scene,s=motion(context),relay=clamp(Math.floor(context.relay)||0,0,3),lit=relay>=3?'#9df3c7':context.warning?'#ffc579':t.accent;
 let calls=0;const draw=(mesh,pose,material)=>{engine.mesh(mesh,pose,material);calls++;};
 // Crane trolley, actual hanging cable, and a chamfered cargo container.
 const trolleyX=-73+s.trolley;
 draw(p.block,{x:trolleyX,y:20.5,z:-10,sx:2.6,sy:1,sz:3.2},{color:t.trim,metal:.65,rough:.38});
 draw(p.pipe,{x:trolleyX,y:(20+s.cargoHeight)/2,z:-10,sx:.09,sy:20-s.cargoHeight,sz:.09},{color:t.dark,metal:.7});
 draw(p.block,{x:trolleyX,y:s.cargoHeight-1.2,z:-10,sx:4.4,sy:2.4,sz:3.1},{color:t.metal,metal:.55,rough:.4});
 for(const side of[-1,1])draw(p.block,{x:trolleyX+side*1.6,y:s.cargoHeight-1.2,z:-11.5,sx:.14,sy:2.2,sz:.16},{color:t.trim,metal:.6});
 if(scene.op===0){
  for(const x of[-67,66]){
   draw(p.tank,{x,y:26.3,z:34.6,sx:2.2,sy:1.4,sz:2.2,pitch:Math.PI/2},{color:t.dark,metal:.6});
   for(let j=0;j<3;j++)draw(p.blade,{x,y:26.3,z:34.1,roll:s.phase+j*TAU/3},{color:t.trim,rough:.45,metal:.38});
  }
  const carrierX=context.calm?0:Math.sin((Number(context.elapsed)||0)*.055)*35;
  draw(p.block,{x:carrierX,y:11.2,z:66,sx:5,sy:2.1,sz:3.1},{color:t.metal,rough:.42,metal:.5});
  draw(p.block,{x:carrierX,y:11.5,z:64.45,sx:3.7,sy:.8,sz:.08},{color:lit,rough:.16,metal:.45,emissive:.3});
 }else if(scene.op===1){
  draw(p.ring,{x:0,y:19,z:71.1,sx:10.8,sy:10.8,sz:10.8,pitch:Math.PI/2,roll:s.coreTurn},{color:lit,metal:.4,rough:.27,emissive:.45+s.power*.4});
  draw(p.crystal,{x:0,y:19,z:71,sx:9,sy:14,sz:9,yaw:s.coreTurn},{color:t.metal,metal:.72,rough:.24});
  for(let j=0;j<6;j++){const a=s.coreTurn+j*TAU/6;draw(p.block,{x:Math.sin(a)*10.9,y:19+Math.cos(a)*10.9,z:70.7,sx:1.4,sy:2.6,sz:.65,roll:-a},{color:t.trim,metal:.7,rough:.3});}
 }else{
  draw(p.crystal,{x:0,y:26,z:75,sx:9,sy:20,sz:9,yaw:s.coreTurn},{color:lit,metal:.6,rough:.2,emissive:.18+s.power*.35});
  draw(p.ring,{x:0,y:26,z:75,sx:12,sy:12,sz:12,pitch:.65,roll:s.phase},{color:lit,metal:.55,rough:.24,emissive:.48});
  for(const x of[-67,67])draw(p.ring,{x,y:23,z:30,sx:5,sy:5,sz:5,pitch:.25*Math.sin(s.phase),roll:.28*Math.cos(s.phase)},{color:lit,metal:.5,rough:.32,emissive:.4});
 }
 // Windows and world conduits power up only after a real relay is secured.
 for(let i=0;i<3;i++){
  const on=i<relay,color=on?'#8ef2c2':i===relay?lit:'#455b70';
  draw(p.block,{x:-10+i*10,y:scene.op===0?10:3.4,z:scene.op===0?62.95:64.6,sx:5.6,sy:.25,sz:.12},{color,emissive:on?.8:.25,rough:.4,metal:.2});
  const r=context.relays?.[i];if(r){const zEnd=38,dx=0,dz=zEnd-r[1],distance=Math.abs(dz);draw(p.block,{x:r[0],y:-.035,z:(r[1]+zEnd)/2,sx:.12,sy:.025,sz:distance},{color:on?'#4ba98b':'#4f626f',emissive:on?.45:0,rough:.7});}
 }
 // Bounded translucent geometry, simulation-time driven and frozen in Calm.
 // Steam sits beyond the arena; no opaque sheet can conceal a combat telegraph.
 const plumes=low?2:5;
 for(let i=0;i<plumes;i++){
  const phase=context.calm?i/plumes:(s.steamPhase+i/plumes)%1,size=1.4+phase*3.2;
  draw(p.smoke,{x:76+phase*5,y:28+phase*12,z:-34+phase*2,sx:size,sy:size*.72,sz:size},{color:t.horizon,rough:1,metal:0,alpha:(1-phase)*.13,emissive:.12});
 }
 return calls;
}
const api=Object.freeze({THEMES,terrain,makeScene,frame,render,motion,animate});
root.AegisWorldscape=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
