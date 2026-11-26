/* Aegis Verge 2.32 Kinetic Signals: authored, state-driven articulated enemy rig poses.
 * Preserves the original F3D26 silhouettes and real combat authority.
 * No runtime imports, third-party meshes, new collisions, or render timers.
 * Pose time comes from actual simulation movement/windup; pause freezes it.
 * Reduced-motion freezes repetitive motion but retains telegraphed state.
 *
 * Original F3D26: original class-specific 3D enemy silhouette kit.
 * Author: Architect Industries. MIT, consistent with the parent project.
 * Pure geometric descriptors; all live combat/collision/HP remain authoritative
 * in index.html. Does not grant damage, immunity, rewards, or AI decisions.
 */
(function(root){
'use strict';
const PALETTE=Object.freeze({
 skirmisher:'#dbeafe',lancer:'#fde68a',bulwark:'#fca5a5',warden:'#c4b5fd'
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Local model coordinates: right, vertical, forward, widths, solid color, emissive.
function parts(enemy,quality='full',time=0,calm=false){
 const type=Object.hasOwn(PALETTE,enemy.type)?enemy.type:'skirmisher';
 const size=clamp(Number(enemy.size)||1.4,.8,3),
       pulse=calm?0:Math.sin((Number(time)||0)*3+(Number(enemy.idx)||0))*.08,
       flash=enemy.flash>0,charged=enemy.state==='windup',exposed=enemy.state==='stagger';
 const paint=flash?'#ffffff':PALETTE[type],
       core=exposed?'#67e8f9':charged?'#ffbd59':paint;
 const geometry=[];
 // The pose is driven by actual simulation distance, not wall-clock time.
 // A charge always conveys the remaining genuine hostile windup timer.
 const speed=clamp(Number(enemy.motionRate)||0,0,1),
       stride=Number.isFinite(enemy.travelDistance)?Math.max(0,enemy.travelDistance):0,
       gait=calm?0:Math.sin(stride*6+(Number(enemy.idx)||0)*.7)*speed,
       charge=charged?clamp(1-(Number(enemy.windup)||0)/Math.max(.1,Number(enemy.windupTotal)||.7),0,1):0,
       split=(exposed?.36:0)+(charged?.14+charge*.32:0),
       recoil=clamp((Number(enemy.flash)||0)/.12,0,1);
 const p=(name,r,y,f,w,h,d,color=paint,em=0)=>{
  geometry.push({name,r:r*size,y:y*size,f:f*size,w:w*size,h:h*size,d:d*size,color,em});
 };
 // Every class retains an unmistakable hull even when effects or detail are reduced.
 p('keel',0,.48,0,1.1,.26,1.2,'#1b3345');
 p('armor',0,.76,0,.78,.3,.85,paint,.12);
 p('core',0,.87,.42,.29,.24,.2,core,charged||exposed?.95:.48);
 if(type==='skirmisher'){
  // Swift delta / swept fins / low cockpit: never resembles a heavy shield rig.
  p('needle',0,.67,.79,.15,.15,.78,'#b9f4ff',.35);
  for(const side of[-1,1])p('swept-fin',side*.73,.59,-.15,.69,.09,.45,'#6d91ab',.08);
  if(quality==='full'){
   p('sensor',0,1.10,-.18,.2,.24,.2,paint,.55);
   for(const side of[-1,1])p('thruster',side*.36,.59,-.65,.18,.21,.28,'#38bdf8',.85);
  }
 }else if(type==='lancer'){
  // Very long central rail and parallel forward prongs, visible before windup.
  p('lance',0,.91,.76,.22,.2,1.4,paint,.22);
  for(const side of[-1,1])p('prong',side*.39,.65,.66,.14,.15,1.18,'#fee6a3',.42);
  if(quality==='full'){
   p('backsight',0,1.35,-.27,.23,.72,.26,'#59667c',.1);
   for(const side of[-1,1])p('capacitor',side*.48,.96,-.30,.19,.28,.45,charged?'#fbbf24':'#7d8796',charged?.9:.2);
  }
 }else if(type==='bulwark'){
  // Wide armored shoulders, imposing physical-looking slab prow and low turret.
  for(const side of[-1,1])p('shield-shoulder',side*.74,.91,.18,.49,.78,.91,'#a55765',.08);
  p('ram-plate',0,.73,.69,1.05,.51,.25,paint,.12);
  if(quality==='full'){
   p('turret',0,1.28,-.18,.51,.4,.53,'#5b4056');
   p('gunport',0,1.36,.35,.25,.2,.68,core,.72);
   for(const side of[-1,1])p('rear-strut',side*.60,.52,-.73,.22,.32,.3,'#645767');
  }
 }else{ // warden
  // Tall command obelisk with split elevated outriggers and a lit crown.
  p('spire',0,1.53,-.19,.40,1.07,.41,'#7864a8',.25);
  p('crown',0,2.12,-.19,.82,.23,.68,paint,.56);
  // Rear-facing cyan reactor port is legible without full detail or VFX.
  p('reactor-frame',0,.92,-.69,.62,.47,.2,'#342d55',.1);
  p('rear-reactor',0,.96,-.82,.34,.29,.16,enemy.reactorFlash>0?'#ffffff':'#67e8f9',enemy.reactorFlash>0?1:.86);
  for(const side of[-1,1])p('arm',side*.85,1.17,.12,.36,.23,.81,'#b3a0d0',.18);
  if(quality==='full'){
   p('beacon',0,2.39,-.19,.27,.32,.27,core,.85);
   for(const side of[-1,1]){
    p('antenna',side*.80,1.76,-.27,.12,.96,.12,'#798bb6',.2);
    p('nacelle',side*.92,.91,-.43,.35,.32,.56,'#51476d',.1);
   }
  }
 }
 // Local-space articulated rig posing: individual armor segments retain
 // their original names/size/identity; no physical hitbox moves or expands.
 // Motion responds to distance actually travelled; blocked enemies do not
 // appear to sprint in place. Weapon rails extend across the real charge.
 for(const q of geometry){
  if(q.name==='keel'){q.y+=gait*.024*size;}
  if(q.name==='armor'){q.y+=gait*.07*size;q.f-=recoil*.08*size;}
  if(q.name==='core'){
   q.y+=charge*.11*size;q.w*=1+charge*.28;
   if(charged)q.em=.6+charge*.4;
  }
  if(q.name==='swept-fin'){q.r+=Math.sign(q.r)*(.10*speed+.12*split)*size;q.f-=gait*.09*size;}
  if(q.name==='needle'){q.f+=charge*.28*size;}
  if(q.name==='thruster'){q.d*=1+speed*.8;q.em=Math.max(q.em,.55+speed*.45);}
  if(q.name==='lance'||q.name==='prong'){q.f+=charge*.34*size;q.d*=1+charge*.30;}
  if(q.name==='backsight'){q.y+=charge*.25*size;}
  if(q.name==='capacitor'){q.r+=Math.sign(q.r)*charge*.12*size;q.color=charged?'#fbbf24':q.color;}
  if(q.name==='shield-shoulder'){q.r+=Math.sign(q.r)*split*.31*size;q.y+=gait*.03*size;}
  if(q.name==='ram-plate'){q.f+=charge*.15*size;q.y-=charge*.12*size;}
  if(q.name==='gunport'){q.f+=charge*.25*size;}
  if(q.name==='rear-strut'){q.y+=gait*.035*size;}
  if(q.name==='spire'){q.y+=charge*.14*size;}
  if(q.name==='crown'||q.name==='beacon'){q.y+=charge*.23*size;}
  if(q.name==='arm'||q.name==='nacelle'){q.r+=Math.sign(q.r)*split*.23*size;q.y+=gait*.035*size;}
  if(q.name==='antenna'){q.r+=Math.sign(q.r)*split*.16*size;q.y+=charge*.08*size;}
 }
 // Genuine state drives geometry, not arbitrary random animation.
 if(exposed)p('exposed-core',0,1.1+pulse,.50,.48,.3,.32,'#67e8f9',1);
 else if(charged)p('charging-core',0,1.12+pulse,.50,.4,.18,.3,'#fbbf24',.9);
 return root.AegisEnemyArmorWear ? root.AegisEnemyArmorWear.decorate(geometry,enemy,quality,calm) : geometry;
}
function render(engine,e,quality='full',time=0,calm=false){
 const a=Number(e.yaw)||0,s=Math.sin(a),c=Math.cos(a),list=parts(e,quality,time,calm);
 for(const part of list){
  const x=e.x+part.r*c+part.f*s,z=e.z-part.r*s+part.f*c;
  engine.cube(x,part.y,z,part.w,part.h,part.d,part.color,a,part.em);
 }
 return list.length;
}
const api=Object.freeze({parts,render,PALETTE});
root.AegisEnemySilhouettes=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
