/* Architect Industries - Aegis Verge Flux Circuit.
 * Original optional non-scoring traversal challenge. Uses real movement through
 * existing slipways; no teleport, collision authority or combat-score access.
 */
(function(root){
'use strict';
const GATES=Object.freeze([
 Object.freeze({id:'depart-approach',track:'departure',x:0,z:-23,direction:1}),
 Object.freeze({id:'depart-clear',track:'departure',x:0,z:-16,direction:1}),
 Object.freeze({id:'return-approach',track:'return',x:0,z:29,direction:-1}),
 Object.freeze({id:'return-clear',track:'return',x:0,z:22,direction:-1})
]);
const REPAIR=18,RECHARGE=30,WIDTH=1.85;
function create(progress=0){return {progress:Number.isInteger(progress)&&progress>=0&&progress<=GATES.length?progress:0,awarded:progress===GATES.length,completedAt:null};}
function cross(state,from,to,track){
 if(!state||state.awarded||state.progress>=GATES.length||!from||!to||!track)return {crossed:false,complete:false};
 const gate=GATES[state.progress];
 if(track.id!==gate.track||!Number.isFinite(from.x)||!Number.isFinite(from.z)||!Number.isFinite(to.x)||!Number.isFinite(to.z))return {crossed:false,complete:false};
 const delta=(to.z-from.z)*gate.direction;
 if(delta<=0||!((from.z-gate.z)*gate.direction<0&&(to.z-gate.z)*gate.direction>=0))return {crossed:false,complete:false};
 const t=(gate.z-from.z)/(to.z-from.z),x=from.x+(to.x-from.x)*t;
 if(!Number.isFinite(t)||t<0||t>1||Math.abs(x-gate.x)>WIDTH)return {crossed:false,complete:false};
 state.progress++;
 if(state.progress===GATES.length)state.awarded=true;
 return {crossed:true,complete:state.awarded,progress:state.progress,gate:gate.id};
}
function reward(state,player){
 if(!state?.awarded||!player||state.rewarded)return null;
 // No score, ranked credit or enemy damage. One finite bonus per run only.
 state.rewarded=true;
 const beforeHull=player.hull,beforeEnergy=player.energy;
 player.hull=Math.min(100,Math.max(0,player.hull)+REPAIR);
 player.energy=Math.min(100,Math.max(0,player.energy)+RECHARGE);
 return {hull:player.hull-beforeHull,energy:player.energy-beforeEnergy};
}
function render(engine,low,progress=0,calm=false,elapsed=0){
 if(!engine)return;
 const gate=GATES[Math.min(GATES.length-1,Math.max(0,progress))];
 for(const g of GATES){
  const visited=progress>GATES.indexOf(g),next=progress<GATES.length&&g===gate;
  const color=visited?'#25645d':next?'#a7f3d0':'#1d6473',light=next?0.8:0.2;
  for(const side of[-1,1])engine.cube(g.x+side*WIDTH,1.25,g.z,.24,2.5,.24,color,0,light);
  engine.cube(g.x,2.6,g.z,WIDTH*2+.25,.18,.2,color,0,light);
  if(next&&!low&&!calm){engine.cube(g.x,2.3,g.z,.42,.2,.24,'#ccfbf1',elapsed,0.9);}
 }
}
const api=Object.freeze({GATES,WIDTH,REPAIR,RECHARGE,create,cross,reward,render});
root.AegisFluxCircuit=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
