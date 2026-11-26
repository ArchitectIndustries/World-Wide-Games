/* Architect Industries — Aegis Verge Flux Slipways.
 * Original first-party, deterministic, finite ground corridor mechanics.
 * Does not own collision, scoring, enemy movement, or rank authority.
 */
(function(root){
'use strict';
const RATE=1.5, COST=23, MIN_ENERGY=12, MIN_SPEED=1.3, ALIGN=.84;
const TRACKS=Object.freeze([
 Object.freeze({id:'departure',x:0,z:-20,length:18,width:4.6,direction:1}),
 Object.freeze({id:'return',x:0,z:26,length:16,width:4.6,direction:-1})
]);
function create(){return {active:null,entries:0,distance:0,energySpent:0};}
function sample(player,headingX,headingZ,moving,enabled=true){
 if(!enabled||!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Number.isFinite(player.energy)||player.energy<MIN_ENERGY||!Number.isFinite(moving)||moving<MIN_SPEED)return null;
 for(const r of TRACKS){
  if(Math.abs(player.x-r.x)<=r.width/2 && Math.abs(player.z-r.z)<=r.length/2 && headingZ*r.direction>=ALIGN && Math.abs(headingX)<=Math.sqrt(1-ALIGN*ALIGN)+.0001)
   return r;
 }
 return null;
}
function advance(state,track,dt,travel,player){
 if(!state||!player)return {entered:false,active:false,spent:0};
 const started=!!track&&Number.isFinite(travel)&&travel>.00001&&Number.isFinite(dt)&&dt>0;
 const entered=started&&state.active!==track.id;
 state.active=started?track.id:null;
 if(!started)return {entered:false,active:false,spent:0};
 const spent=Math.min(Math.max(0,player.energy),Math.min(.25,dt)*COST);
 player.energy=Math.max(0,player.energy-spent);
 state.energySpent+=spent;state.distance+=Math.max(0,travel);
 if(entered)state.entries++;
 return {entered,active:true,spent};
}
// Original inlaid induction-road geometry. All top faces sit below y=0;
// TRACKS alone defines the footprint, and T.move remains collision authority.
const DECKS=Object.freeze([
 Object.freeze({bed:'#334b56',panel:'#47646d',edge:'#657f83'}),
 Object.freeze({bed:'#503642',panel:'#75515b',edge:'#a17878'}),
 Object.freeze({bed:'#3d3659',panel:'#5e527b',edge:'#8980a4'})
]);
function surface(op=0,low=false){
 const p=DECKS[op]||DECKS[0],out=[];
 for(const r of TRACKS){
  const part=(x,z,sx,sz,color)=>out.push({x,y:-.062,z,sx,sy:.08,sz,color,yaw:0,em:0});
  const shoulder=.46,inner=r.width-2*shoulder;
  // Separate, non-overlapping shoulder and induction panels. Small seams
  // on high detail reveal the original arena floor, never add a collider.
  for(const side of [-1,1])part(r.x+side*(r.width-shoulder)/2,r.z,shoulder,r.length,p.edge);
  const count=low?1:6,span=r.length/count,gap=low?0:.06;
  for(let i=0;i<count;i++)part(r.x,r.z-r.length/2+(i+.5)*span,inner,span-gap,i%2?p.bed:p.panel);
 }
 return out;
}
function render(engine,low,active,calm,elapsed=0){
 if(!engine)return;
 for(const r of TRACKS){
  const chosen=active===r.id,lit=chosen?'#b7f7ee':'#2fa0a1',edge=chosen?'#ccfbf1':'#1d6b77';
  for(const side of[-1,1])engine.cube(r.x+side*(r.width/2-.07),.055,r.z,.14,.1,r.length,edge,0,chosen?.65:.32);
  const count=low?5:10;
  for(let i=0;i<count;i++){
   const z=r.z-r.length*.45+(i+.5)*r.length*.9/count;
   // The forward ends meet on the center line in the track's permitted
   // direction; previously side*yaw pointed the arrow backwards.
   for(const side of[-1,1])engine.cube(r.x+side*.55,.085,z,.15,.08,1.8,lit,-side*.65*r.direction,chosen?.9:.5);
  }
  engine.cube(r.x,.045,r.z-r.direction*(r.length*.5-.1),3.4,.075,.2,'#81b5b5',0,.5);
  engine.cube(r.x,.045,r.z+r.direction*(r.length*.5-.1),3.4,.075,.2,'#395661',0,.25);
  if(chosen&&!calm)engine.cube(r.x,.12,r.z,1.8,.08,.35,'#a7f3d0',0,.9);
 }
}
const api=Object.freeze({RATE,COST,MIN_ENERGY,TRACKS,create,sample,advance,surface,render});
root.AegisFluxSlipways=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
