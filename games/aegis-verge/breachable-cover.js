/* Architect Industries — first-party, deterministic breachable-cover state.
 * Original cover records remain immutable; one authoritative live collision list
 * is shared by projectile sightlines, pathfinding, motion and 3D presentation.
 */
(function(root){
'use strict';
const BREACHABLE_IDS=Object.freeze([0,3,5]);
function create(base){
 const source=Array.isArray(base)?base.slice():[];
 const health=new Map();
 for(const b of source)if(BREACHABLE_IDS.includes(b.id))health.set(b.id,5);
 return {source,health,breaches:0};
}
function status(state,id){
 if(!state||!state.health.has(id))return null;
 const hp=state.health.get(id);
 return {hp,max:5,breached:hp<=0};
}
function snapshot(state){return BREACHABLE_IDS.map(id=>state?.health?.has(id)?state.health.get(id):5);}
// Checkpoint restoration is all-or-nothing and changes the same authoritative cover map.
function restore(state,hp){
 if(!state||!Array.isArray(hp)||hp.length!==BREACHABLE_IDS.length||
   !BREACHABLE_IDS.every((_,i)=>Object.prototype.hasOwnProperty.call(hp,i)&&Number.isSafeInteger(hp[i])&&hp[i]>=0&&hp[i]<=5)||
   !BREACHABLE_IDS.every(id=>state.health.has(id)))return false;
 BREACHABLE_IDS.forEach((id,i)=>state.health.set(id,hp[i]));
 state.breaches=hp.filter(n=>n===0).length;return true;
}
function live(state){return state.source.filter(b=>!state.health.has(b.id)||state.health.get(b.id)>0)}
function strike(state,id,amount=1){
 if(!state||!state.health.has(id))return {hit:false,breached:false};
 const before=state.health.get(id);
 if(before<=0||!Number.isFinite(amount)||amount<=0)return {hit:false,breached:false};
 const hp=Math.max(0,before-Math.min(amount,10));
 state.health.set(id,hp);
 const breached=before>0&&hp===0;
 if(breached)state.breaches++;
 return {hit:true,breached,before,hp};
}
root.AegisBreachableCover={BREACHABLE_IDS,create,status,live,strike,snapshot,restore};
if(typeof module==='object'&&module.exports)module.exports=root.AegisBreachableCover;
})(typeof window==='object'?window:globalThis);
