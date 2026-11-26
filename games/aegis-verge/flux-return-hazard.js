/* Architect Industries — Aegis Verge F3D53 Phase Reversal Integrity.
 * Previously cleared shutter planes remain hazardous on real backtracking.
 * Only swept, post-cover-collision rig motion qualifies. Never grants scores.
 */
(function(root){
'use strict';
const COOLDOWN=.75;
const finite=Number.isFinite;
function create(){return {hits:0,guards:0,lastAt:-Infinity,last:null};}
function inspect(state,from,to,progress,elapsed,startedAt,resolved,capacitors,shielded,phase){
 if(!state||!from||!to||!phase||!finite(elapsed)||!finite(startedAt)||elapsed<startedAt||
  ![from.x,from.z,to.x,to.z].every(finite)||!Number.isInteger(progress)||!Array.isArray(resolved))return null;
 if(elapsed-state.lastAt<COOLDOWN)return null;
 for(let i=0;i<phase.SCREENS.length;i++){
  const s=phase.SCREENS[i];
  if(progress<=s.progress||resolved[i]!==true||capacitors?.hp?.[i]===0)continue;
  // Any genuine crossing of an already completed screen, in either direction.
  const a=from.z-s.z,b=to.z-s.z;
  if(!(a<0&&b>=0||a>0&&b<=0))continue;
  const t=(s.z-from.z)/(to.z-from.z),x=from.x+(to.x-from.x)*t;
  if(!finite(t)||t<0||t>1||!finite(x)||Math.abs(x)>phase.WIDTH)continue;
  if(phase.phase(s,elapsed,startedAt)!=='live')continue;
  const kind=shielded?'guard':'hit';
  state.lastAt=elapsed;state.last={kind,id:s.id,x,z:s.z,direction:Math.sign(to.z-from.z)};
  if(kind==='hit')state.hits++;else state.guards++;
  return state.last;
 }
 return null;
}
function activeScreens(progress,resolved,elapsed,startedAt,phase,capacitors){
 if(!phase||!Array.isArray(resolved))return [];
 return phase.SCREENS.filter((s,i)=>progress>s.progress&&resolved[i]===true&&capacitors?.hp?.[i]!==0&&phase.phase(s,elapsed,startedAt)==='live');
}
const api=Object.freeze({COOLDOWN,create,inspect,activeScreens});
root.AegisFluxReturnHazard=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
