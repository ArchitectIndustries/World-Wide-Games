/* Architect Industries | Aegis Verge 2.29 | Reactor Flank
 * First-party finite directional damage check against a genuine Warden hull hit.
 * Never authorizes an impact: projectileHit first performs swept collision and
 * solid-cover precedence. Reflections, other classes and invalid vectors gain no bonus.
 */
(function(root){
'use strict';
const THRESHOLD=.65;
function evaluate(enemy,shot,base){
 const damage=Number.isFinite(base)&&base>0?base:0;
 if(!enemy||enemy.dead||enemy.type!=='warden'||!shot||shot.reflected||!Number.isFinite(enemy.yaw)||!Number.isFinite(shot.vx)||!Number.isFinite(shot.vz))return {damage,bonus:0};
 const mag=Math.hypot(shot.vx,shot.vz);if(mag<1e-6)return {damage,bonus:0};
 const alignment=(shot.vx*Math.sin(enemy.yaw)+shot.vz*Math.cos(enemy.yaw))/mag;
 const bonus=alignment>THRESHOLD?1:0;
 return {damage:damage+bonus,bonus};
}
const api=Object.freeze({THRESHOLD,evaluate});
root.AegisReactorFlank=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
