/* Architect Industries — Aegis Verge Skyburst Demolition (first-party).
 * Only existing damageable barricades intersecting the authoritative shell's
 * blast circle can be damaged. Original solid cover occludes each line of fire.
 * Candidate selection is pure; the game remains responsible for HP, collision,
 * fragments, navigation and checkpoint authority. No third-party assets.
 */
(function(root){
'use strict';
const DAMAGE=3;
function valid(p){return !!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);}
function impacted(shell,blocks,damageable,firstCover,radius){
 if(!valid(shell)||!Array.isArray(blocks)||typeof damageable!=='function'||typeof firstCover!=='function'||!Number.isFinite(radius)||radius<=0)return [];
 const selected=[];
 for(const b of blocks){
  if(!valid(b)||!Number.isSafeInteger(b.id)||!Number.isFinite(b.w)||!Number.isFinite(b.d)||b.w<=0||b.d<=0)continue;
  const hp=damageable(b.id);
  if(!Number.isFinite(hp)||hp<=0)continue;
  // Closest surface point gives correct circle/rectangle overlap (not a
  // generous center-radius approximation that could hit distant cover).
  const x=Math.max(b.x-b.w/2,Math.min(b.x+b.w/2,shell.x));
  const z=Math.max(b.z-b.d/2,Math.min(b.z+b.d/2,shell.z));
  const distance=Math.hypot(x-shell.x,z-shell.z);
  if(distance>radius)continue;
  // A barricade cannot occlude its own nearest surface. Every OTHER intact
  // solid obstacle, including field-cache structures, still can.
  const blockers=blocks.filter(other=>other!==b&&other.id!==b.id);
  if(firstCover(shell.x,shell.z,x,z,blockers,.08))continue;
  selected.push({block:b,distance,point:{x,z}});
 }
 return selected;
}
const api=Object.freeze({DAMAGE,impacted});
root.AegisSkyburstDemolition=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
