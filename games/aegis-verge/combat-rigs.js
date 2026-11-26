/* Aegis Verge 3.1 — articulated combat machines. Architect Industries, MIT.
 * Original, local polygon geometry. Read-only observers of the real chassis,
 * hostile pose, wear and weapon timers. No AI, hitbox, resource or save authority.
 */
(function(root){
'use strict';
const M=root.AegisEnvironmentMesh||(typeof require==='function'?require('./environment-mesh.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0)),TAU=Math.PI*2;
let kit=null;
const marked=new WeakSet();

// A six-sided cross-section is lofted along the weapon/vehicle forward axis.
// The changing shoulder, belly and roof lines are actual silhouette geometry.
function loft(id,sections){
 const vertices=[],faces=[];
 for(const [z,w,bottom,top,shoulder] of sections){
  vertices.push([-w,bottom,z],[w,bottom,z],[w,shoulder,z],[w*.62,top,z],[-w*.62,top,z],[-w,shoulder,z]);
 }
 const face=(ix,want)=>{
  const a=vertices[ix[0]],b=vertices[ix[1]],c=vertices[ix[2]],u=b.map((q,i)=>q-a[i]),v=c.map((q,i)=>q-a[i]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  if(n.reduce((sum,q,i)=>sum+q*want[i],0)<0)ix.reverse();faces.push(ix);
 };
 face([0,1,2,3,4,5],[0,0,-1]);
 const last=(sections.length-1)*6;face([0,1,2,3,4,5].map(i=>last+i),[0,0,1]);
 for(let k=0;k<sections.length-1;k++)for(let i=0;i<6;i++){
  const j=(i+1)%6,a=k*6,b=a+6,mid=vertices[a+i].map((v,n)=>(v+vertices[a+j][n])/2);
  face([a+i,a+j,b+j,b+i],[mid[0],mid[1],0]);
 }
 return M.geometry(id,vertices,faces);
}
function tube(id){
 const vertices=[],faces=[],n=8;
 for(const [z,r] of[[-.5,.34],[-.30,.50],[.38,.40],[.50,.46],[.50,.25],[.12,.25]])for(let i=0;i<n;i++){
  const a=i*TAU/n;vertices.push([Math.cos(a)*r,Math.sin(a)*r,z]);
 }
 faces.push(Array.from({length:n},(_,i)=>n-1-i));
 for(let k=0;k<5;k++)for(let i=0;i<n;i++){const j=(i+1)%n,a=k*n,b=a+n;faces.push([a+i,a+j,b+j,b+i]);}
 faces.push(Array.from({length:n},(_,i)=>5*n+i));
 return M.geometry(id,vertices,faces);
}
function track(){
 const vertices=[],faces=[],n=12;
 // Four rings form a real open belt. The inner wall faces into the wheel well.
 for(const [x,sy,sz] of[[-.5,.5,.5],[.5,.5,.5],[-.5,.33,.40],[.5,.33,.40]])for(let i=0;i<n;i++){
  const a=i*TAU/n;vertices.push([x,Math.sin(a)*sy,Math.cos(a)*sz]);
 }
 const face=(ix,want)=>{const a=vertices[ix[0]],b=vertices[ix[1]],c=vertices[ix[2]],u=b.map((q,i)=>q-a[i]),v=c.map((q,i)=>q-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(n.reduce((s,q,i)=>s+q*want[i],0)<0)ix.reverse();faces.push(ix);};
 for(let i=0;i<n;i++){const j=(i+1)%n,a=(i+.5)*TAU/n;
  face([i,j,n+j,n+i],[0,Math.sin(a),Math.cos(a)]);
  face([2*n+i,3*n+i,3*n+j,2*n+j],[0,-Math.sin(a),-Math.cos(a)]);
  face([i,2*n+i,2*n+j,j],[-1,0,0]);
  face([n+i,n+j,3*n+j,3*n+i],[1,0,0]);
 }
 return M.geometry('rig-open-track',vertices,faces);
}
function meshes(){
 if(kit||!M)return kit;
 const box=M.geometry('rig-detail-bar',[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]]);
 const plate=loft('rig-armored-facet',[[-.5,.36,-.4,.18,-.1],[-.28,.5,-.5,.5,.12],[.30,.45,-.4,.38,.08],[.5,.28,-.25,.1,-.05]]);
 const fin=loft('rig-swept-vane',[[-.5,.5,-.32,.22,0],[.12,.48,-.5,.5,.05],[.5,.10,-.25,.18,0]]);
 const wheelCore=M.lathe('rig-wheel-core',[[-.5,.31],[-.36,.48],[.32,.48],[.45,.32]],8);
 const wheelParts=[{mesh:wheelCore}];
 for(let i=0;i<3;i++)wheelParts.push({mesh:box,pose:{y:.47,sx:.72,sy:.05,sz:.07,yaw:i*Math.PI/3}});
 const wheel=M.merge('rig-spoked-wheel',wheelParts);
 const wheelX=M.merge('rig-road-wheel',[{mesh:wheel,pose:{roll:Math.PI/2}}]);
 const grille=M.merge('rig-vent-bank',Array.from({length:4},(_,i)=>({mesh:box,pose:{x:-.375+i*.25,sx:.10,sy:1,sz:1}})));
 kit=Object.freeze({
  vesper:loft('rig-vesper-hull',[[-.5,.28,-.30,.12,-.05],[-.31,.5,-.5,.24,-.08],[.18,.44,-.38,.5,.08],[.5,.15,-.12,.08,-.02]]),
  skirmisher:loft('rig-skirmisher-delta',[[-.5,.5,-.30,.10,-.10],[-.20,.44,-.5,.5,0],[.5,.08,-.1,.04,-.02]]),
  lancer:loft('rig-lancer-keel',[[-.5,.32,-.32,.08,-.05],[-.30,.5,-.5,.4,.05],[.24,.32,-.35,.5,.1],[.5,.15,-.18,.08,-.08]]),
  bulwark:loft('rig-bulwark-prow',[[-.5,.30,-.3,.25,-.02],[-.24,.44,-.5,.5,.15],[.28,.5,-.4,.44,.08],[.5,.39,-.32,-.05,-.12]]),
  warden:loft('rig-warden-citadel',[[-.5,.22,-.20,.12,-.02],[-.20,.5,-.5,.5,.08],[.26,.46,-.3,.35,-.05],[.5,.20,-.14,.05,-.05]]),
  canopy:loft('rig-inset-canopy',[[-.5,.32,-.5,.08,-.25],[-.2,.5,-.5,.5,-.06],[.26,.42,-.5,.32,-.14],[.5,.16,-.5,-.30,-.36]]),
  plate,fin,box,track:track(),tube:tube('rig-bored-cannon'),wheel:wheelX,grille,
  lens:M.merge('rig-forward-optic',[{mesh:M.lathe('rig-optic-lens',[[-.5,.30],[-.28,.5],[.23,.5],[.5,.32]],8),pose:{pitch:Math.PI/2}}]),
  turret:M.lathe('rig-turret-ring',[[-.5,.36],[-.31,.5],[.24,.45],[.5,.30]],10),
  crystal:M.lathe('rig-signal-crystal',[[-.5,.12],[-.24,.5],[.24,.38],[.5,.08]],6)
 });
 return kit;
}
const LUMINOUS=/core|light|sensor|stripe|reactor|beacon|conduit|spark|emitter|thermal|nozzle-glow|optic/;
const METAL=/barrel|lance|prong|needle|gunport|mount|wheel|strut|guard|link|fork|frame|intake/;
function material(part){
 const name=part.name,color=part.color||'#8095a6',emissive=clamp(part.em||0,0,1);
 if(/cockpit|canopy/.test(name))return{color,metal:.55,rough:.16,ao:.08,emissive};
 if(/traction|track/.test(name))return{color:'#182a32',metal:.02,rough:.96,ao:.22,emissive:0};
 if(/damage|scored|fractured|broken/.test(name))return{color,metal:.16,rough:.90,ao:.22,emissive};
 if(LUMINOUS.test(name))return{color,metal:.20,rough:.24,ao:0,emissive};
 if(METAL.test(name))return{color,metal:.88,rough:.29,ao:.10,emissive};
 return{color,metal:.56,rough:.50,ao:.12,emissive};
}
function item(part,mesh,changes={}){return{name:part.name,mesh,pose:{r:part.r,y:part.y,f:part.f,w:part.w,h:part.h,d:part.d,yaw:part.yaw||0,pitch:0,roll:0,...changes},material:material(part)};}
function extra(name,mesh,r,y,f,w,h,d,color,em=0,rotation={}){return item({name,r,y,f,w,h,d,color,em},mesh,rotation);}
function playerParts(vehicle,rig,opts,source){
 const K=meshes();if(!K)return[];
 const low=!!opts.low,calm=!!opts.calm,speed=clamp(rig.motion,0,1),distance=clamp(rig.distance,0,1e8),contact=calm?0:clamp(rig.contact,0,1);
 const shot=clamp((opts.muzzle||0)/.07,0,1),recoil=calm?0:shot*.14,spin=calm?0:distance/.20;
 const out=source.map(p=>{
  let shape=K.plate;
  if(/keel|top-armor|fore-wedge/.test(p.name))shape=K.vesper;
  else if(/cockpit|canopy/.test(p.name))shape=K.canopy;
  else if(p.name==='traction-pod')shape=K.track;
  else if(p.name==='cannon-mount')shape=K.turret;
  else if(p.name==='cannon-barrel'||p.name==='thruster')shape=K.tube;
  else if(LUMINOUS.test(p.name))shape=K.lens;
  else if(p.name==='rear-fin')shape=K.fin;
  const q=item(p,shape);
  if(p.name==='cannon-barrel'){q.pose.f-=recoil;q.material.rough=.21;}
  if(p.name==='thruster'){q.pose.yaw=Math.PI;q.material=material({...p,name:'exhaust-intake',em:0});}
  return q;
 });
 for(const side of[-1,1]){
  const pod=source.find(p=>p.name==='traction-pod'&&Math.sign(p.r)===side);
  for(const f of low?[-.76,.63]:[-.87,-.10,.67]){
   out.push(extra('road-wheel',K.wheel,side*1.46,(pod?.y??.49)-.015,f,.11,.34,.34,'#6b8796',0,{pitch:spin}));
  }
  if(!low){
   for(const f of[-.70,.58])out.push(extra('suspension-link',K.tube,side*.98,.63-contact*.055,f,.10,.10,.54,'#9cb4bc',0,{yaw:side*.78,roll:side*(.22+contact*.15)}));
   out.push(extra('drive-grille',K.grille,side*.57,1.20,-1.18,.40,.04,.39,'#142a38'));
  }
  const thruster=source.find(p=>p.name==='thruster'&&Math.sign(p.r)===side);
  if(thruster)out.push(extra('nozzle-glow',K.lens,thruster.r,thruster.y,-1.879,.23,.23,.035,opts.dash?'#99f6e4':speed>.08?'#38bdf8':'#345a6b',opts.dash?1:speed>.08?.8:.12));
 }
 if(shot>0)out.push(extra('barrel-optic',K.lens,0,low?1.38:1.49,(low?1.85:2.32)-recoil,.13,.13,.025,'#ffe2a6',.4+shot*.6));
 return out;
}
function enemyParts(enemy,quality,time,calm,source){
 const K=meshes();if(!K)return[];
 const type=Object.hasOwn(K,enemy.type)&&['skirmisher','lancer','bulwark','warden'].includes(enemy.type)?enemy.type:'skirmisher',low=quality!=='full',size=clamp(Number(enemy.size)||1.4,.8,3),speed=clamp(Number(enemy.motionRate)||0,0,1),distance=clamp(Number(enemy.travelDistance)||0,0,1e8);
 const charge=enemy.state==='windup'?clamp(1-(Number(enemy.windup)||0)/Math.max(.1,Number(enemy.windupTotal)||.7),0,1):0;
 // Recovery starts only after an actual volley. Hit flash is a separate cue.
 const recoverTop=(Number(enemy.weaponRate)||({skirmisher:1.15,lancer:.9,bulwark:1.35,warden:.7})[type])+.25+(Number(enemy.idx)||0)%3*.08;
 const kick=enemy.state==='recover'&&(Number(enemy.cycles)||0)>0?clamp(1-(recoverTop-(Number(enemy.cool)||0))/.16,0,1):0;
 const recoil=calm?0:kick*.12*size,spin=calm?0:distance/(.16*size),out=source.map(p=>{
  let shape=K.plate;
  if(p.name==='keel'||p.name==='armor')shape=K[type];
  else if(/lance|prong|needle|gunport/.test(p.name))shape=K.tube;
  else if(/swept-fin|arm|antenna|backsight/.test(p.name))shape=K.fin;
  else if(p.name==='turret'||p.name==='crown')shape=K.turret;
  else if(p.name==='spire'||p.name==='capacitor')shape=K.crystal;
  else if(p.name==='thruster'||p.name==='reactor-frame')shape=K.tube;
  else if(LUMINOUS.test(p.name))shape=K.lens;
  const q=item(p,shape);
  if(/lance|prong|needle|gunport/.test(p.name))q.pose.f-=recoil;
  if(p.name==='core'&&kick>0&&!enemy.flash){q.material.color='#ffdfac';q.material.emissive=.5+kick*.5;}
  if(p.name==='thruster'||p.name==='reactor-frame')q.pose.yaw=Math.PI;
  if(p.name==='swept-fin')q.pose.roll=calm?0:Math.sign(p.r)*charge*.10;
  if(p.name==='turret')q.pose.y-=recoil*.3;
  return q;
 });
 const p=(name,mesh,r,y,f,w,h,d,color,em=0,rotation={})=>out.push(extra(name,mesh,r*size,y*size,f*size,w*size,h*size,d*size,color,em,rotation));
 if(type==='skirmisher'){
  for(const side of[-1,1]){
   if(low?side<0&&source.some(p=>p.name==='reactor-breach'):!source.some(p=>p.name==='thruster'&&Math.sign(p.r)===side))continue;
   if(low)p('thruster-intake',K.tube,side*.36,.59,-.65,.21,.23,.30,'#3b5368',0,{yaw:Math.PI});
   p('nozzle-glow',K.lens,side*.36,.59,low?-.808:-.82-.08*speed,.12,.12,.035,speed>.05?'#38bdf8':'#31536c',speed>.05?.8:.2);
  }
  if(!low)p('inset-cockpit',K.canopy,0,.93,-.17,.45,.18,.47,'#152f47',.12);
 }else if(type==='lancer'||type==='bulwark'){
  const heavy=type==='bulwark',r=heavy?.48:.40;
  for(const side of[-1,1]){
   p('traction-track',K.track,side*r,.36,-.12,heavy?.34:.22,.36,heavy?1.06:.98,'#1c3037');
   for(const f of low?[-.38]:[-.42,.18])p('drive-wheel',K.wheel,side*(r+(heavy?.18:.13)),.36,f,.07,.27,.27,'#6f7c86',0,{pitch:spin});
  }
  if(heavy&&low){p('turret-mount',K.turret,0,1.23,-.18,.48,.26,.48,'#5b4056');p('gunport',K.tube,0,1.36,.35-recoil/size,.25,.20,.68,'#d2a1a7',.1);}
  if(!low)p('cooling-grille',K.grille,0,heavy?1.04:1.10,-.33,.40,.035,.29,'#162b39');
 }else{
  for(const side of[-1,1]){
   p('drive-pylon',K.plate,side*.46,.44,-.20,.26,.32,.74,'#3f3c59');
   p('drive-wheel',K.wheel,side*.60,.38,-.20,.09,.36,.36,'#8f8ab3',0,{pitch:spin});
  }
  if(!low){
   p('crown-collar',K.tube,0,2.25+charge*.23,-.19,.64,.64,.13,'#584d79',0,{pitch:Math.PI/2});
   p('crown-optic',K.crystal,0,2.25+charge*.23,-.19,.23,.22,.23,enemy.state==='windup'?'#fbbf24':'#c4b5fd',enemy.state==='windup'?.9:.4);
  }
 }
 return out;
}
function draw(engine,actor,parts){
 const yaw=Number(actor.yaw)||0,co=Math.cos(yaw),si=Math.sin(yaw);
 if(engine.canvas&&!marked.has(engine)){engine.canvas.setAttribute?.('data-aegis-rigs','articulated-31');marked.add(engine);}
 for(const p of parts){
  const q=p.pose,pose={x:actor.x+co*q.r+si*q.f,y:q.y,z:actor.z-si*q.r+co*q.f,sx:q.w,sy:q.h,sz:q.d,yaw:yaw+q.yaw,pitch:q.pitch,roll:q.roll};
  // Resource denial still leaves a visible, bounded body through the proven
  // primitive path; no shader, cache or context failure can make a rig vanish.
  if(engine.mesh(p.mesh,pose,p.material)===false)engine.cube(pose.x,pose.y,pose.z,q.w,q.h,q.d,p.material.color,pose.yaw,p.material.emissive);
 }
 return parts.length;
}
function player(engine,vehicle,rig,opts,source){return draw(engine,vehicle,playerParts(vehicle,rig,opts,source));}
function enemy(engine,e,quality,time,calm,source){return draw(engine,e,enemyParts(e,quality,time,calm,source));}
const api=Object.freeze({meshes,playerParts,enemyParts,player,enemy});
root.AegisCombatRigs=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
