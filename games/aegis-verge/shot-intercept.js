/* Architect Industries / Aegis Verge: original swept projectile-vs-projectile
 * collision. Both projectiles move during the same simulation substep.
 * Only authentic player cannon shots can neutralize hostile bolts; never scores.
 */
(function(root){
'use strict';
const RADIUS=.43;
function collision(shotStart,shotEnd,boltStart,boltEnd,radius=RADIUS){
 const pts=[shotStart,shotEnd,boltStart,boltEnd];
 if(!pts.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z))||!Number.isFinite(radius)||radius<=0)return null;
 const rx=shotStart.x-boltStart.x,rz=shotStart.z-boltStart.z;
 const vx=(shotEnd.x-shotStart.x)-(boltEnd.x-boltStart.x);
 const vz=(shotEnd.z-shotStart.z)-(boltEnd.z-boltStart.z);
 const c=rx*rx+rz*rz-radius*radius;
 if(c<=0)return {t:0,x:(shotStart.x+boltStart.x)/2,z:(shotStart.z+boltStart.z)/2};
 const a=vx*vx+vz*vz;if(a<1e-12)return null;
 const b=2*(rx*vx+rz*vz),discriminant=b*b-4*a*c;
 if(discriminant<0)return null;
 const t=(-b-Math.sqrt(discriminant))/(2*a);
 if(t<0||t>1)return null;
 const sx=shotStart.x+(shotEnd.x-shotStart.x)*t,sz=shotStart.z+(shotEnd.z-shotStart.z)*t;
 const bx=boltStart.x+(boltEnd.x-boltStart.x)*t,bz=boltStart.z+(boltEnd.z-boltStart.z)*t;
 return {t,x:(sx+bx)/2,z:(sz+bz)/2};
}
function earliest(boltStart,boltEnd,shots,cover,firstCover,maxT=1){
 let result=null;
 for(const s of shots){
  if(s.collided||s.reflected||!(s.life>0||s.flightFraction>0))continue; // only an authentic flying cannon shot can intercept
  const start={x:Number.isFinite(s.prevX)?s.prevX:s.x,z:Number.isFinite(s.prevZ)?s.prevZ:s.z};
  // Both projectiles advance in physical substep time. When one expires
  // partway through the step, compare FULL-frame velocities, then reject a
  // candidate impact beyond either lifetime; do not slow the projectile.
  const shotFraction=Number.isFinite(s.flightFraction)?Math.max(0,Math.min(1,s.flightFraction)):1;
  const boltFraction=Number.isFinite(boltEnd.flightFraction)?Math.max(0,Math.min(1,boltEnd.flightFraction)):1;
  const end={x:Number.isFinite(s.fullX)?s.fullX:s.x,z:Number.isFinite(s.fullZ)?s.fullZ:s.z};
  const fullBolt={x:Number.isFinite(boltEnd.fullX)?boltEnd.fullX:boltEnd.x,z:Number.isFinite(boltEnd.fullZ)?boltEnd.fullZ:boltEnd.z};
  const hit=collision(start,end,boltStart,fullBolt);
  if(!hit||hit.t>Math.min(shotFraction,boltFraction,maxT*boltFraction)+1e-9||result&&hit.t>=result.t)continue;
  // A solid wall blocks either projectile before they reach the predicted impact.
  const boltWall=typeof firstCover==='function'?firstCover(boltStart.x,boltStart.z,hit.x,hit.z,cover,.12):null;
  const shotWall=typeof firstCover==='function'?firstCover(start.x,start.z,hit.x,hit.z,cover,.08):null;
  if(boltWall||shotWall)continue;
  result={...hit,shot:s};
 }
 return result;
}
const api=Object.freeze({RADIUS,collision,earliest});
root.AegisShotIntercept=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
