/* Cyber Wars 0.65: Viridia's original visual district.
 * Read-only adapters consume simulation positions, weather and ownership.
 * Existing solid footprints and interaction locations remain authoritative.
 */
(function(root){
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function atmosphere(phase,rain=0){
 const solar=Math.sin(phase*TAU),day=clamp((solar+.28)*.78,0,1),storm=clamp(rain,0,1),night=[.023,.051,.092],clear=[.40,.55,.46],wet=[.20,.30,.30];
 return {day,rain:storm,fog:night.map((n,i)=>(n+(clear[i]-n)*day)*(1-storm*.68)+wet[i]*storm*.68),fogNear:27+day*14-storm*8,fogFar:91+day*39-storm*24,sun:{x:.52*Math.cos(phase*TAU),y:-(.30+day*.72),z:.28*Math.sin(phase*TAU)+.15}};
}
function waterSample(x,z,time,rain=0,reduced=false){
 const t=reduced?0:time,amplitude=.012+clamp(rain,0,1)*.009;
 return {height:.048+Math.sin(x*.72+z*1.2-t*1.4)*amplitude,sheen:.5+.5*Math.sin(x*1.8-z*2.1-t*1.7)};
}
function actorPose(distance,kind='resident',reduced=false,crouched=false){
 const stride=reduced?0:Math.sin(distance*3.4),moving=Math.abs(distance)>1e-5;
 return {stride:stride*(kind==='fauna'?.42:.38),hip:crouched?1.05:1.24,shoulder:crouched?1.64:1.97,head:crouched?2.10:2.56,moving};
}
function build({seed=1,objects=[],solids=[],interactables=[]}={}){
 const random=rng(seed^0x65f013),covered=new WeakSet(),staticMeshes=[],water=[],motion=new Map();
 const stats={sourceObjects:objects.length,staticMeshes:0,visible:0,culled:0,trees:0,ferns:0,mushrooms:0,solidSupports:0,horizonRocks:0};
 const put=(shape,x,y,z,sx,sy,sz,color,extra={})=>{const o={shape,x,y,z,sx,sy,sz,color,yaw:0,pitch:0,roll:0,em:0,surface:0,...extra,bound:Math.hypot(sx,sy,sz)*.58};staticMeshes.push(o);return o;};
 const dot=(x,y,z,sx,sy,sz,color,extra={})=>put('box',x,y,z,sx,sy,sz,color,extra);
 const column=(s,height,color)=>{stats.solidSupports++;return put('column',s.x,height*.5,s.z,s.r*1.88,height,s.r*1.88,color,{support:{x:s.x,z:s.z,r:s.r,kind:s.kind}});};
 // Replace only known presentation objects. The source array is never edited.
 for(const o of objects){
  if(o.detail==='canopy'||o.detail==='understory'||o.color==='#3d4930')covered.add(o);
  if(o.sx===132&&o.sy===1&&o.sz===132||o.sx===124&&o.sz===10&&o.sy===.12)covered.add(o);
  if(Math.abs(o.x)<15&&o.z>=28&&o.z<=48&&['#6b5a3b','#7e6843','#8c7449','#a08350','#332a24','#b39862','#65ffd0'].includes(o.color))covered.add(o);
  if(o.x>=-36&&o.x<=-22&&o.z>=-17&&o.z<=-5&&['#514738','#8d7650','#74ffd2','#302b25'].includes(o.color))covered.add(o);
  if(o.x===0&&o.z===8&&['#3a4d37','#2b6a48'].includes(o.color))covered.add(o);
  if(o.x===27&&o.z===-24&&o.sx===13&&o.sy===.3&&o.sz===12)covered.add(o);
  if(Math.abs(o.x)<=10&&o.z>=13.3&&o.z<=16.1&&['#aa8956','#d6ac69','#61ffd6','#5d624a','#9a784d','#55e6ba','#ffd18c','#72ffda'].includes(o.color))covered.add(o);
  if(o.color==='#654b3d'||o.color==='#97744a'||o.sx===28&&o.sz===20&&o.z===-39)covered.add(o);
  if(o.color==='#795f43'||o.sy===.15&&o.sx===1.8&&o.sz===1.8&&['#ff83dc','#4fffb7'].includes(o.color))covered.add(o);
  if(o.z===-9&&[-23,-16,-9,-2,5,12,19,26].includes(o.x)||o.z===-8.55&&[11,12,13].includes(o.x))covered.add(o);
 }
 // Walkable terrain stays flat at the original elevation. Color patches and
 // shallow engraved routes add detail without introducing invisible slopes.
 for(let z=-72;z<=72;z+=16)for(let x=-72;x<=72;x+=16){
  const grass=['#324a31','#3d5335','#3b5237','#40583a'][(random()*4)|0];
  put('plane',x,-.048,z,16.02,1,16.02,grass,{surface:5,ground:true});
 }
 put('plane',27,-.026,-24,13,1,12,'#6d8060',{surface:4,ground:true});
 // Weather-reactive water exactly matches the existing river and dry bridge.
 for(const [lo,hi]of [[-62,-9],[9,62]])for(let x=lo;x<hi;x+=7)for(let z=4;z<14;z+=2.5){
  const width=Math.min(7,hi-x);water.push({shape:'plane',x:x+width*.5,y:.048,z:z+1.25,sx:width+.018,sy:1,sz:2.52,color:'#226e68',yaw:0,surface:2,bound:4});
 }
 // Inlaid ground paths and bridge planks remain below the existing foot plane.
 for(let i=0;i<23;i++)dot(0,-.028,-31+i*2.7,2.9,.025,2.0,i%3?'#75816a':'#92927a',{ground:true});
 for(let i=0;i<15;i++)dot(-1.8-i*1.85,-.020,-5.2,1.65,.022,2.3,i%2?'#6c7861':'#89907a',{ground:true});
 for(let i=0;i<19;i++)dot(-8.45+i*.94,.182,9,.86,.025,13.1,i%2?'#88744d':'#776144',{surface:4});
 // The stone gateway stands on the two pre-existing collision circles.
 const gateway=solids.filter(s=>s.kind==='gateway-post');
 for(const s of gateway){column(s,5.8,'#b29b6a');put('column',s.x,5.70,s.z,s.r*2, .3,s.r*2,'#d4bd83');put('spire',s.x,6.35,s.z,1.05,1.25,1.05,'#d0b987');}
 put('arch',0,5.35,16,17,7.3,13.5,'#b5a277');
 put('arch',0,5.50,16,16.45,6.95,8.1,'#73a88c',{em:.16,surface:3});
 for(let i=0;i<9;i++){const a=.18+(Math.PI-.36)*i/8;put('orb',Math.cos(a)*8.45,5.45+Math.sin(a)*3.55,15.12,.28,.31,.20,i%2?'#e9d4a0':'#a4d6b0',{em:.45});}
 // Vault of Roots: an open colonnade with overhead ribs, no false ground wall.
 for(const s of solids.filter(s=>s.kind==='vault-post')){
  column(s,8.4,'#b69e70');
  put('column',s.x,8.35,s.z,1.25,.35,1.25,'#d4c191');
  for(let i=0;i<4;i++)put('column',s.x,.55+i*1.8,s.z,s.r*1.96,.10,s.r*1.96,'#7d7357');
 }
 for(const [width,y,z]of [[22,8.4,28],[14,8.4,28],[26,10.8,35],[20,12.0,41]]){
  put('arch',0,y,z,width,width*.33,22,'#b7a77b',{detail:'monument'});
 }
 // Suspended leaf vault and ribs preserve access beneath the monument.
 put('leaf',0,13.8,36,27,5.3,23,'#5b7852',{surface:1,detail:'monument'});
 put('leaf',0,14.25,36,22,3.6,19,'#87a16b',{surface:1,detail:'monument'});
 for(let i=-3;i<=3;i++)put('arch',i*2.45,12.5,36,2.1,3.6,95,'#d2bb81',{yaw:Math.PI/2,detail:'monument'});
 put('spire',0,16.0,39,1.6,5,1.6,'#b9dba9',{em:.14,detail:'monument'});
 // Archive: fluted real posts, a vaulted roof and hanging book galleries.
 for(const s of solids.filter(s=>s.kind==='archive-post')){
  column(s,4.9,'#bea57a');
  put('column',s.x,.20,s.z,s.r*1.96,.35,s.r*1.96,'#7c7456');
  put('column',s.x,4.75,s.z,s.r*1.96,.35,s.r*1.96,'#dbca96');
 }
 put('leaf',-29,5.7,-11,17,3.3,13,'#60754c',{surface:1});
 put('arch',-29,4.8,-11,13,4.8,65,'#c7ad7b',{yaw:Math.PI/2});
 for(let i=0;i<4;i++){
  const x=-33.2+i*2.8;dot(x,3.50,-10.75,2.15,.15,.65,'#776444',{surface:4});
  for(let k=0;k<5;k++)dot(x-.72+k*.35,3.85,-10.75,.22,.58,.43,['#b6794c','#738e6e','#c3b07a','#778d9a','#b19468'][k],{surface:4,yaw:(k-2)*.035});
 }
 dot(-29,4.2,-5.7,3.6,.40,.15,'#49614b',{surface:4});
 for(let i=0;i<5;i++)dot(-30.2+i*.6,4.24,-5.59,.15,.16,.05,'#d9dfb0',{em:.35});
 // The eight existing training interactions keep their exact positions and
 // logic. Compact instruments and open diagrams replace the old opaque boxes;
 // these are stationary practice displays, never usable vehicles or licenses.
 for(const station of interactables.filter(o=>['stabilizer','hover','hazard','dock','air','nav','recovery','traffic'].includes(o.kind))){
  const {x,z}=station,warm=station.kind==='recovery'||station.kind==='hazard',trim=warm?'#c7ad7c':'#91bdb0';
  put('plane',x,-.019,z,3.8,1,3.1,'#657766',{surface:4,ground:true});
  put('trunk',x,.50,z,1.25,.98,1.05,'#60796f',{surface:3});
  put('orb',x,.14,z,1.7,.25,1.4,'#455e53',{surface:3});
  put('box',x,1.08,z+.20,1.15,.56,.10,'#24493f',{pitch:-.24,surface:3});
  for(let k=0;k<3;k++)dot(x-.36+k*.35,1.08,z+.28,.23,.23,.035,k===1?trim:'#b5cead',{em:.28,surface:3});
  put('column',x,1.52,z,.12,.23,.12,trim,{em:.22,surface:3});
  const tower=station.kind==='air',height=tower?2.72:2.22,size=tower?1.65:1.18;
  put('arch',x,height,z,size,size,1.4,trim,{em:.25,surface:3});
  put('arch',x,height,z,size,size,1.4,trim,{roll:Math.PI,em:.25,surface:3});
  put('orb',x,height,z,.24,.24,.24,'#c5e4bf',{em:.35,surface:3});
  for(let k=0;k<3;k++)put('orb',x+Math.sin(k*TAU/3)*size*.35,height+Math.cos(k*TAU/3)*size*.35,z,.13,.13,.13,warm?'#e3c69b':'#b1d7bd',{em:.3,surface:3});
 }
 // The steward's roof is open on every side; no new inaccessible enclosure.
 put('leaf',0,4.35,8,11,2.7,10,'#698b57',{surface:1});
 put('leaf',0,4.68,8,8.4,2.0,7.6,'#94a56b',{surface:1});
 // Southern ruin retains its existing four collision posts.
 for(const s of solids.filter(s=>s.kind==='ruin-post')){
  column(s,6.7,'#94816b');
  put('rock',s.x,6.9,s.z,1.7,1.1,1.8,'#c0aa80');
 }
 put('arch',0,6.0,-45,24,9.0,18,'#9e8b74');
 put('arch',0,6.0,-34,24,8.3,18,'#8c8269');
 // Obelisk widths stay within their real circular collision footprints.
 for(const s of solids.filter(s=>s.kind==='obelisk')){
  column(s,1.0,'#8b7c5e');put('spire',s.x,4.35,s.z,s.r*1.86,7.0,s.r*1.86,'#c5ac76',{support:{x:s.x,z:s.z,r:s.r,kind:s.kind}});
  put('orb',s.x,8.22,s.z,.83,.72,.83,'#b0e4ba',{em:.42,surface:3});
 }
 // Original geometry replaces the old flat rectangular tree foliage.
 for(const s of solids.filter(s=>s.kind==='jungle-trunk')){
  const old=objects.find(o=>o.color==='#3d4930'&&o.x===s.x&&o.z===s.z),height=Math.max(5.0,old?old.sy:6.2);
  put('trunk',s.x,height*.5,s.z,s.r*1.88,height,s.r*1.88,'#665e40',{support:{x:s.x,z:s.z,r:s.r,kind:s.kind},detail:'trunk'});
  for(let i=0;i<3;i++){
   const a=random()*TAU,r=1.0+random()*.9,y=height-.4+random()*1.2;
   put('column',s.x+Math.sin(a)*.48,height-1.0,s.z+Math.cos(a)*.48,.24,1.7,.24,'#706947',{yaw:a,pitch:.72,detail:'branch'});
   put('orb',s.x+Math.sin(a)*r,y,s.z+Math.cos(a)*r,4.1+random()*1.5,2.1+random()*1.2,3.7+random()*1.3,['#47754c','#557f4f','#668c55'][i],{surface:1,detail:'crown',phase:a});
  }
  for(let i=0;i<3;i++){const a=i*TAU/3+random()*.5;put('leaf',s.x+Math.sin(a)*1.2,height+.65,s.z+Math.cos(a)*1.2,2.7,.9,4.4,'#699851',{yaw:a,surface:1,detail:'frond',phase:a});}
  stats.trees++;
 }
 // Soft ankle-height understory stays clear of the interaction approach points.
 for(const o of objects.filter(o=>o.detail==='understory'&&o.color==='#366b43')){
  if(interactables.some(p=>Math.hypot(p.x-o.x,p.z-o.z)<3.0))continue;
  const size=clamp(o.sy/.62,.5,1.4);
  for(let k=0;k<5;k++){const a=o.yaw+k*TAU/5;put('leaf',o.x+Math.sin(a)*.3,.31,o.z+Math.cos(a)*.3,.46*size,.40,1.50*size,k%2?'#648c4a':'#4f7944',{yaw:a,surface:1,detail:'fern',phase:a});}
  stats.ferns++;
 }
 // The prior neon slabs become small, soft fungi. Their new silhouettes remain
 // below knee height and do not imply a new trunk collider in an open route.
 for(const o of objects.filter(o=>o.color==='#795f43')){
  if(interactables.some(p=>Math.hypot(p.x-o.x,p.z-o.z)<2.8))continue;
  const cap=objects.find(p=>p.x===o.x&&p.z===o.z&&p.sy===.15),pink=cap?.color==='#ff83dc';
  put('trunk',o.x,.24,o.z,.16,.46,.16,'#b7ad8b',{detail:'fern'});
  put('orb',o.x,.49,o.z,1.0,.28,.9,pink?'#b68ea0':'#92b89b',{em:.14,surface:1,detail:'fern'});
  for(let j=0;j<3;j++){const a=j*TAU/3;put('orb',o.x+Math.sin(a)*.54,.18,o.z+Math.cos(a)*.54,.38,.16,.36,pink?'#c19ba9':'#9cc9ae',{em:.10,surface:1,detail:'fern'});}
  stats.mushrooms++;
 }
 // Distant geology is outside the existing +/-59 playable clamp, with a
 // conservative 66m inner edge. It cannot become a decorative collision wall.
 for(let i=0;i<28;i++){
  const edge=i%4,along=-104+(i>>2)*33+random()*9,out=92+random()*12;
  const x=edge===0?-out:edge===1?out:along,z=edge===2?-out:edge===3?out:along;
  const sx=30+random()*14,sz=30+random()*14,sy=14+random()*13;
  put('rock',x,sy*.28-4,z,sx,sy,sz,['#647568','#7c8470','#586c61'][i%3],{detail:'horizon',surface:5});
  stats.horizonRocks++;
 }
 const rows=[];
 function visible(o,eye,forward,low){
  const dx=o.x-eye.x,dz=o.z-eye.z,d=Math.hypot(dx,dz),limit=o.detail==='fern'?(low?13:20):o.detail==='frond'?(low?26:43):o.detail==='crown'?(low?60:83):o.detail==='horizon'?176:125;
  if(d>limit+o.bound)return false;
  if(d>o.bound+10&&(dx*forward.x+dz*forward.z)/d+Math.min(.98,o.bound/d)<-.40)return false;
  return true;
 }
 function render(engine,eye,forward,frame){
  if(!engine.viridiaMesh)return false;
  const low=engine.mode==='canvas2d'||frame.low,time=frame.reduced?0:frame.time,rain=frame.rain||0;rows.length=0;
  for(const o of staticMeshes){
   if(!visible(o,eye,forward,low))continue;
   if(o.detail==='frond'&&!frame.reduced){const swing=Math.sin(time*.75+o.phase)*(.025+rain*.03);rows.push({...o,roll:swing});}
   else rows.push(o);
  }
  for(const o of water){if(!visible(o,eye,forward,low))continue;const sample=waterSample(o.x,o.z,time,rain,frame.reduced);rows.push({...o,y:sample.height,color:rain>.45?'#2c6463':'#2c7a70'});}
  stats.visible=rows.length;stats.culled=staticMeshes.length+water.length-rows.length;engine.viridiaBatch(rows);
  // Small, bounded fireflies at dusk. They never stand in for observed wildlife.
  if(frame.day<.50&&!frame.reduced)for(let i=0;i<9;i++){
   const x=-18+Math.sin(i*2.1)*13,z=19+Math.cos(i*1.7)*7;
   if(Math.hypot(x-eye.x,z-eye.z)<27)engine.viridiaMesh('orb',x+Math.sin(time*.5+i)*.35,1.6+Math.sin(time*.8+i)*.5,z,.055,.055,.055,'#cce7a0',0,1.5);
  }
  return true;
 }
 function pose(id,x,z,reduced,kind,crouched){
  let m=motion.get(id);if(!m){m={x,z,distance:0};motion.set(id,m);}
  const step=Math.hypot(x-m.x,z-m.z);m.distance+=step<3?step:0;m.x=x;m.z=z;
  if(motion.size>64)motion.delete(motion.keys().next().value);
  const p=actorPose(m.distance,kind,reduced,crouched);p.stride*=step>.0001?1:0;return p;
 }
 function person(engine,{id='resident',x,z,yaw=0,color='#a8c59c',reduced=false,crouched=false}){
  if(!engine.viridiaMesh)return false;
  const p=pose(id,x,z,reduced,'resident',crouched),parts=[],co=Math.cos(yaw),si=Math.sin(yaw);
  const add=(shape,lx,y,lz,sx,sy,sz,col,extra={})=>parts.push({shape,x:x+lx*co+lz*si,y,z:z-lx*si+lz*co,sx,sy,sz,color:col,yaw,em:0,...extra});
  const limb=(a,b,width,col)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);add('column',(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5,width,len,width,col,{yaw:yaw+Math.atan2(dx,dz),pitch:Math.atan2(Math.hypot(dx,dz),dy),surface:4});};
  add('orb',0,p.hip,0,.73,.50,.48,'#46513b',{surface:4});add('trunk',0,(p.hip+p.shoulder)*.5,0,.91,p.shoulder-p.hip+.17,.57,color,{surface:4});
  add('orb',0,p.head,0,.55,.65,.52,'#b8a282');add('orb',0,p.head+.21,-.055,.59,.28,.55,'#3b4737');
  add('box',0,p.head-.015,.247,.34,.10,.04,'#8da9a0',{surface:3});add('box',0,p.shoulder-.12,-.33,.51,.58,.25,'#726f50',{surface:4});
  for(const side of [-1,1]){
   const hip=[side*.22,p.hip-.1,0],knee=[side*.24,.63,side*p.stride],foot=[side*.24,.14,-side*p.stride*.85];
   limb(hip,knee,.24,'#52614a');limb(knee,foot,.20,'#4b5744');add('rock',foot[0],.12,foot[2]+.10,.29,.23,.48,'#414636');
   const shoulder=[side*.47,p.shoulder-.05,0],elbow=[side*.53,p.shoulder-.43,-side*p.stride*.45],hand=[side*.51,p.shoulder-.82,-side*p.stride*.75];
   add('orb',shoulder[0],shoulder[1],0,.31,.36,.33,color,{surface:4});limb(shoulder,elbow,.19,color);limb(elbow,hand,.16,'#60755a');add('orb',hand[0],hand[1],hand[2],.18,.22,.18,'#b8a282');
  }
  add('box',0,p.shoulder-.25,.30,.34,.08,.03,'#c2d5a0',{em:.22,surface:3});engine.viridiaBatch(parts);return true;
 }
 function home(engine,x,z){
  if(!engine.viridiaMesh)return false;
  // A lightweight suspended habitat canopy: no fabricated blocking walls or
  // pillars, and the full original home/save approach remains physically open.
  engine.viridiaBatch([
   {shape:'plane',x,y:-.018,z,sx:11,sy:1,sz:10,color:'#9a9472',surface:4,ground:true},
   {shape:'leaf',x,y:4.1,z,sx:10,sy:2.4,sz:9,color:'#76915b',surface:1},
   {shape:'leaf',x,y:4.45,z,sx:7.5,sy:1.8,sz:7,color:'#a0b475',surface:1},
   {shape:'arch',x,y:3.45,z,sx:8.6,sy:3.4,sz:38,color:'#cab58a',yaw:Math.PI/2},
   {shape:'box',x,y:3.22,z:z-2.6,sx:5.8,sy:.15,sz:.20,color:'#bdba87'},
   {shape:'orb',x,y:3.58,z:z+2.8,sx:.45,sy:.60,sz:.45,color:'#dcdfaa',em:.45}
  ]);return true;
 }
 function fauna(engine,a,frame){
  if(!engine.viridiaMesh)return false;
  const p=pose('fauna:'+a.id,a.x,a.z,frame.reduced,'fauna',false),low=a.sheltered,bodyY=low?.69:1.04,co=Math.cos(a.yaw),si=Math.sin(a.yaw),parts=[];
  const add=(shape,lx,y,lz,sx,sy,sz,color,extra={})=>parts.push({shape,x:a.x+lx*co+lz*si,y,z:a.z-lx*si+lz*co,sx,sy,sz,color,yaw:a.yaw,...extra});
  add('orb',0,bodyY,0,1.12,.90,1.75,low?'#6f8064':'#a2a782',{surface:4});add('orb',0,bodyY+.30,.84,.55,.62,.63,'#c1b58e');
  for(const side of [-1,1]){
   add('leaf',side*.30,bodyY+.62,.86,.33,.3,.68,'#8c9973',{roll:side*.40,surface:1});
   for(const front of [-1,1])add('column',side*.39,low?.22:.45,front*.55,.17,low?.30:.76,.17,'#637259',{pitch:p.stride*front*side});
  }
  add('leaf',0,bodyY+.02,-.96,.23,.22,.73,'#82956d',{pitch:-.35});
  engine.viridiaBatch(parts);return true;
 }
 function sentinel(engine,e,frame){
  if(!engine.viridiaMesh)return false;
  const w=e.warden?1.55:1,col=e.disabledFor>0?'#79929b':e.warden?'#a17aa8':'#a08d68',em=e.disabledFor>0?.06:e.warden?.38:.12,t=frame.reduced?0:frame.time,hover=Math.sin(t*1.7+e.id)*.045;
  const parts=[{shape:'rock',x:e.x,y:2.3+hover,z:e.z,sx:1.8*w,sy:.95*w,sz:1.75*w,color:col,yaw:e.yaw,surface:3},
   {shape:'orb',x:e.x,y:2.96+hover,z:e.z,sx:.78*w,sy:.56,sz:.78*w,color:e.disabledFor>0?'#7d959e':'#b7d9b3',em,surface:3}];
  for(const side of [-1,1]){const a=e.yaw+side*1.1,reach=1.22*w;parts.push({shape:'leaf',x:e.x+Math.sin(a)*reach,y:2.20+hover,z:e.z+Math.cos(a)*reach,sx:.70*w,sy:.38,sz:2.25*w,color:'#69786a',yaw:a,surface:3},{shape:'orb',x:e.x+Math.sin(a)*reach*1.37,y:2.10+hover,z:e.z+Math.cos(a)*reach*1.37,sx:.24,sy:.24,sz:.24,color:e.disabledFor>0?'#7c8b88':'#d5b989',em:.40});}
  engine.viridiaBatch(parts);return true;
 }
 stats.staticMeshes=staticMeshes.length;
 return {skip:o=>covered.has(o),render,person,home,fauna,sentinel,stats:()=>({...stats}),inspect:()=>({meshes:staticMeshes.map(o=>({...o})),water:water.map(o=>({...o}))})};
}
const api={atmosphere,waterSample,actorPose,build};root.CWViridia=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
