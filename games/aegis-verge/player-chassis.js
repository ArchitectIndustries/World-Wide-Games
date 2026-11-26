/* Aegis Verge 2.33 - Vesper Runner, original first-party player vehicle model.
 * Geometry is cosmetic and intentionally has no collision, physics, weapon,
 * save, score, or ranking authority. Visual travel is sampled from actual
 * collision-tested displacement, not real time or input alone. MIT.
 */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const create=()=>({distance:0,motion:0,steer:0,contact:0});
function advance(rig,delta,dt,turn=0,blocked=false){
 const distance=clamp(delta,0,100),step=clamp(dt,0,1/4);
 rig.distance+=distance;
 rig.motion=step>0?clamp(distance/(12*step),0,1):0;
 rig.steer=clamp(turn,-1,1);
 rig.contact=blocked?1:Math.max(0,rig.contact-step*3);
 return rig;
}
function parts(vehicle,rig,opts={}){
 const calm=!!opts.calm,low=!!opts.low,
       hull=clamp(vehicle.hull??100,0,100),
       severe=hull<=35,critical=hull<=15,
       phase=calm?0:Math.sin(clamp(rig.distance,0,1e8)*3.8),
       speed=clamp(rig.motion,0,1),
       bank=calm?0:clamp(rig.steer,-1,1)*Math.min(speed,.8)*.13,
       hop=calm?0:phase*speed*.035,
       contact=calm?0:clamp(rig.contact,0,1)*.075,
       shield=!!opts.shield,
       dash=!!opts.dash,
       accent=typeof opts.accent==='string'&&/^#[0-9a-fA-F]{6}$/.test(opts.accent)?opts.accent:'#67e8f9',
       lit=critical?'#f87171':severe?'#fbbf24':accent,
       plating=severe?'#876d70':'#8eafc1',
       paint=critical?'#7d4b55':'#dbe7ec',
       out=[];
 const p=(name,r,y,f,w,h,d,color=paint,em=0,yaw=0)=>out.push({name,r,y:y+hop-contact+bank*r,f,w,h,d,color,em,yaw});
 // Vesper Runner: low armored wedge, inset cockpit, twin traction runners.
 // Local R = starboard; F = forward. Both orientations rotate with player yaw.
 p('keel',0,.66,0,1.78,.43,3.25,'#20384a');
 p('top-armor',0,.99,-.10,1.48,.20,2.75,paint,.12);
 p('fore-wedge',0,.79,1.31,1.25,.22,.95,plating,.1);
 p('cockpit',0,1.21,.12,.98,.35,1.16,'#122b42',.23);
 p('canopy-ridge',0,1.43,.1,.58,.10,1.0,'#5e96ac',.35);
 p('nose-sensor',0,.88,1.85,.58,.18,.19,lit,.9);
 p('rear-deck',0,1.06,-1.17,1.4,.27,.65,paint,.12);
 for(const side of [-1,1]){
  p('traction-pod',side*1.18,.49,-.09,.55,.48,2.65,'#263a48');
  p('pod-armor',side*1.2,.80,-.13,.63,.18,1.89,plating,.08);
  p('side-stripe',side*1.52,.72,.18,.09,.12,1.48,lit,.6);
  p('thruster',side*.60,.84,-1.76,.36,.31,.22,dash?'#99f6e4':speed>.08?'#38bdf8':'#547b97',dash?1:speed>.08?.85:.24);
 }
 if(!low){
  for(const side of [-1,1]){
   p('fore-cheek',side*.68,.94,1.20,.36,.22,.73,paint,.14);
   p('rear-fin',side*.67,1.28,-1.13,.12,.52,.71,plating,.12);
   p('suspension-guard',side*1.17,.40,phase*.09*speed,.52,.18,.48,'#56778a',.12);
   p('side-light',side*1.32,1.01,.97,.20,.13,.26,lit,.83);
  }
  p('reactor-spine',0,1.39,-.82,.34,.16,.49,lit,shield?.95:.35);
  p('cannon-mount',0,1.48,.95,.38,.25,.54,'#617e91');
  p('cannon-barrel',0,1.49,1.56,.23,.23,1.52,'#cbd5e1',.2);
 }else{
  p('cannon-barrel',0,1.38,1.35,.25,.22,1.0,'#cbd5e1',.15);
 }
 if(severe){ // Actual hull damage, not a random decorative explosion.
  p('damaged-port',-.57,1.12,.33,.45,.08,.63,'#633e39',.1);
  if(!low)p('thermal-warning',.35,1.15,-.75,.26,.12,.36,lit,.82);
 }
 if(shield){p('aegis-emitter',0,1.64,-.16,.74,.16,.47,'#bef264',.85);}
 if(dash&&!calm){p('vector-nozzle',0,.65,-1.92,.78,.19,.49,'#5eead4',.9);}
 return out;
}
function render(engine,vehicle,rig,opts={}){
 const a=Number(vehicle.yaw)||0,co=Math.cos(a),si=Math.sin(a),list=parts(vehicle,rig,opts);
 if(root.AegisCombatRigs&&typeof engine.mesh==='function')return root.AegisCombatRigs.player(engine,vehicle,rig,opts,list);
 for(const v of list){
  const x=vehicle.x+co*v.r+si*v.f,z=vehicle.z-si*v.r+co*v.f;
  const shape=({keel:"hull","top-armor":"hull","fore-wedge":"hull",cockpit:"canopy","pod-armor":"runner"})[v.name];
  if(shape&&engine.faceted)engine.faceted(shape,x,v.y,z,v.w,v.h,v.d,v.color,a+v.yaw,v.em);
  else engine.cube(x,v.y,z,v.w,v.h,v.d,v.color,a+v.yaw,v.em);
 }
 return list.length;
}
const api=Object.freeze({create,advance,parts,render});
root.AegisPlayerChassis=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
