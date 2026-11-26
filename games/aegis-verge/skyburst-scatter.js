/* Architect Industries — Aegis Verge Skyburst Scatter (F3D40).
 * Exposed light skirmishers may *walk* out of another Warden's live artillery
 * warning at a bounded speed. Real T.move collision, intact cover and the
 * committed windup/stagger states remain authoritative. First-party MIT.
 */
(function(root){
'use strict';
const REACTION=.56,BUFFER=.45,BOOST=1.18,OFFSETS=[0,Math.PI/4,-Math.PI/4,Math.PI/2,-Math.PI/2];
function evade(e,shells,dt,blocks,tactics,blastRadius){
 if(!e||e.dead||e.type!=='skirmisher'||e.state==='windup'||e.state==='stagger'||
  !Array.isArray(shells)||!Array.isArray(blocks)||!tactics||
  !Number.isFinite(dt)||dt<=0||dt>1/30||!Number.isFinite(blastRadius)||blastRadius<=0)return false;
 let threat=null,remaining=Infinity;
 for(const shell of shells){
  if(!shell||![shell.x,shell.z,shell.left,e.x,e.z].every(Number.isFinite)||
   shell.left<=0||shell.left>REACTION||shell.casterIdx===e.idx)continue;
  const r=Math.hypot(e.x-shell.x,e.z-shell.z);
  if(r>blastRadius+BUFFER||tactics.firstCover(shell.x,shell.z,e.x,e.z,blocks,.08))continue;
  if(shell.left<remaining){remaining=shell.left;threat=shell;}
 }
 if(!threat)return false;
 const dx=e.x-threat.x,dz=e.z-threat.z,r=Math.hypot(dx,dz);
 // At the exact center use deterministic per-enemy bearing, not NaN.
 const theta=r>1e-7?Math.atan2(dx,dz):(Number.isSafeInteger(e.idx)?e.idx:0)*2.399963;
 const travel=4.3*BOOST*dt,radius=.91;let best=null,gain=0;
 for(const offset of OFFSETS){
  const angle=theta+offset,body={x:e.x,z:e.z};
  tactics.move(body,Math.sin(angle)*travel,Math.cos(angle)*travel,blocks,radius);
  const improvement=Math.hypot(body.x-threat.x,body.z-threat.z)-r;
  if(improvement>gain+1e-7){gain=improvement;best=body;}
 }
 if(!best||gain<travel*.1)return false;
 const moved=Math.hypot(best.x-e.x,best.z-e.z);
 e.x=best.x;e.z=best.z;e.yaw=Math.atan2(best.x-threat.x,best.z-threat.z);
 e.path=[];e.navAt=0;e.state='evade';
 e.travelDistance=(e.travelDistance||0)+moved;
 e.motionRate=Math.min(1,moved/(4.3*dt));
 return true;
}
const api=Object.freeze({REACTION,BUFFER,BOOST,evade});
root.AegisSkyburstScatter=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
