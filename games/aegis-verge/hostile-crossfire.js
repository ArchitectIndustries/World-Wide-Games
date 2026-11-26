/* Architect Industries / Aegis Verge F3D72 — original hostile crossfire collision.
 * A hostile bolt can strike another living hostile on its genuine 2D swept
 * path; never grants the player a kill, salvage, score or mission reward.
 * Player, decoy, solid cover and live cannon interceptions retain their
 * original first-hit priority in the simulation integrator.
 */
(function(root){
'use strict';
function earliest(bolt,from,to,enemies,types,segmentCircle,maxT=1){
 if(!bolt||!from||!to||!Array.isArray(enemies)||typeof segmentCircle!=='function'||
  ![from.x,from.z,to.x,to.z,maxT].every(Number.isFinite)||maxT<0)return null;
 let result=null;
 for(const e of enemies){
  if(!e||e.dead||!(e.hp>0)||!Number.isFinite(e.x)||!Number.isFinite(e.z)||
     e===bolt.source||(!bolt.source&&e.idx===bolt.sourceIdx))continue;
  const size=types?.[e.type]?.size;
  if(!Number.isFinite(size)||size<=0)continue;
  const radius=Math.max(.8,size*.65);
  const t=segmentCircle(from.x,from.z,to.x,to.z,e.x,e.z,radius);
  if(t===null||!Number.isFinite(t)||t<0||t>maxT+1e-9||result&&t>=result.t)continue;
  result={enemy:e,t,x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t};
 }
 return result;
}
const api=Object.freeze({earliest});
root.AegisHostileCrossfire=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
