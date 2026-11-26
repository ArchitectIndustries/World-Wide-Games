/* Architect Industries - Aegis Verge F3D42: bounded 3D cover sightline.
 * World units: cover is a standing axis-aligned box [x +/-w/2, 0..h, z +/-d/2].
 * The same live cover records drive collisions and rendering. No GPU dependency.
 * Invalid/missing wall height is treated as infinitely tall, never free cover.
 * First-party MIT project code. Only the live airborne Counterpulse uses this
 * elevated sightline; all ordinary ground combat continues using AegisTactics.
 */
(function(root){
'use strict';
const validPoint=p=>p&&[p.x,p.y,p.z].every(Number.isFinite);
function intersect(from,to,b,margin=0){
 if(!validPoint(from)||!validPoint(to)||!b||
    ![b.x,b.z,b.w,b.d].every(Number.isFinite)||b.w<=0||b.d<=0||
    !Number.isFinite(margin)||margin<0)return null;
 const height=Number.isFinite(b.h)&&b.h>0?b.h:Infinity;
 const ranges=[
  [from.x,to.x-from.x,b.x-b.w/2-margin,b.x+b.w/2+margin],
  [from.y,to.y-from.y,0,height],
  [from.z,to.z-from.z,b.z-b.d/2-margin,b.z+b.d/2+margin]
 ];
 let enter=0,exit=1;
 for(const [start,delta,min,max] of ranges){
  if(Math.abs(delta)<1e-10){if(start<min||start>max)return null;continue;}
  let near=(min-start)/delta,far=(max-start)/delta;
  if(near>far)[near,far]=[far,near];
  enter=Math.max(enter,near);exit=Math.min(exit,far);
  if(enter>exit)return null;
 }
 return enter<=1&&exit>=0?enter:null;
}
function blocked(from,to,cover,margin=.08){
 if(!validPoint(from)||!validPoint(to)||!Array.isArray(cover))return null;
 let closest=null;
 for(const block of cover){
  const t=intersect(from,to,block,margin);
  if(t!==null&&(!closest||t<closest.t))closest={block,t,
   x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,z:from.z+(to.z-from.z)*t};
 }
 return closest;
}
const api=Object.freeze({intersect,blocked});
root.AegisElevatedCover=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
