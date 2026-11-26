/* Architect Industries / Aegis Verge F3D74 — authoritative projectile lifetime.
 * Swept collision covers only the distance a real projectile can still travel.
 * Retains the FULL frame displacement for temporally correct shot-vs-bolt
 * interception, bounded by each projectile's actual flight fraction.
 * Original first-party MIT-compatible source; no external dependencies.
 */
(function(root){
'use strict';
function advance(p,dt){
 if(!p||![p.x,p.z,p.vx,p.vz,p.life,dt].every(Number.isFinite)||dt<=0||p.life<=0){
  if(p){p.flightFraction=0;p.flightDt=0;p.life=0;}
  return false;
 }
 const fraction=Math.max(0,Math.min(1,p.life/dt));
 p.prevX=p.x;p.prevZ=p.z;
 p.fullX=p.x+p.vx*dt;p.fullZ=p.z+p.vz*dt;
 p.x+=p.vx*dt*fraction;p.z+=p.vz*dt*fraction;
 p.flightFraction=fraction;p.flightDt=dt*fraction;
 p.life=Math.max(0,p.life-dt);
 return true;
}
const api=Object.freeze({advance});
root.AegisProjectileLifetime=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
