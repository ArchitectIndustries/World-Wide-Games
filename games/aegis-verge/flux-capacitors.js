/* Architect Industries — Aegis Verge F3D50: Flux Capacitor Counterplay.
 * First-party, non-scoring cannon targets. A player must land two unobstructed
 * real cannon impacts on the current powered shutter node to disable it.
 * Disabling ends local split-record eligibility; waiting/shielding remain valid.
 */
(function(root){
'use strict';
const HP=2,RADIUS=1.0;
const NODES=Object.freeze([
 Object.freeze({id:'departure',x:3.2,z:-19.3,progress:1}),
 Object.freeze({id:'return',x:-3.2,z:25.3,progress:3})
]);
function create(){return {hp:[HP,HP],hits:0,disabled:0,last:null};}
function disabled(state,id){const i=NODES.findIndex(n=>n.id===id);return !!state&&i>=0&&state.hp[i]===0;}
function intercept(state,progress,armed,ax,az,bx,bz,segmentCircle){
 if(!state||!armed||typeof segmentCircle!=='function'||![ax,az,bx,bz].every(Number.isFinite))return null;
 let best=null;
 NODES.forEach((n,i)=>{
  if(n.progress!==progress||state.hp[i]<=0)return;
  const t=segmentCircle(ax,az,bx,bz,n.x,n.z,RADIUS);
  if(t!==null&&Number.isFinite(t)&&t>=0&&t<=1&&(!best||t<best.t))
   best={id:n.id,index:i,t,x:ax+(bx-ax)*t,z:az+(bz-az)*t};
 });
 return best;
}
function hit(state,contact){
 if(!state||!contact||!Number.isInteger(contact.index))return null;
 const n=NODES[contact.index];
 if(!n||n.id!==contact.id||state.hp[contact.index]<=0)return null;
 state.hp[contact.index]=Math.max(0,state.hp[contact.index]-1);state.hits++;
 const down=state.hp[contact.index]===0;
 if(down)state.disabled++;
 state.last={id:n.id,down,hp:state.hp[contact.index],x:contact.x,z:contact.z};
 return state.last;
}
function render(engine,state,progress,calm=false){
 if(!engine||!state)return 0;
 let count=0;
 for(const n of NODES){
  const off=disabled(state,n.id),armed=progress===n.progress&&!off;
  const col=off?'#34d399':armed?'#f59e0b':'#52718a';
  const lit=off?.6:armed?.85:.24;
  // Compact elevated reactor node with two solid pylons and a clear hit center.
  for(const dz of [-.65,.65]){engine.cube(n.x,.55,n.z+dz,.47,1.1,.4,'#293c51',0,.12);count++;}
  engine.cube(n.x,1.3,n.z,1.3,.7,.9,col,0,lit);count++;
  engine.cube(n.x,1.87,n.z,.7,.19,.7,col,0,lit);count++;
  engine.cube(n.x,.07,n.z,2,.12,1.8,col,0,lit*.5);count++;
  if(armed&&!calm){for(const dz of [-.35,.35]){engine.cube(n.x,2.15,n.z+dz,.15,.32,.19,'#fef08a',0,.7);count++;}}
  if(off){engine.cube(n.x,2.2,n.z,1.35,.15,.2,'#86efac',0,.75);count++;}
 }
 return count;
}
const api=Object.freeze({HP,RADIUS,NODES,create,disabled,intercept,hit,render});
root.AegisFluxCapacitors=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
