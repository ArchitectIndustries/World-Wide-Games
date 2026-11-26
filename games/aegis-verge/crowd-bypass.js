/* Architect Industries / Aegis Verge F3D76 - original living-rig tactical bypass.
 * Deterministic, bounded look-ahead that steers a moving hostile around a
 * stationary/slow ally. Existing swept contact and cover remain authoritative.
 * No new attacks, damage, scoring, pickups, hitboxes, or dependencies.
 */
(function(root){
'use strict';
const FLASH=.30,LOOK=3.0;
function radius(e,types){const s=types?.[e?.type]?.size;return Number.isFinite(s)&&s>0?s*.65:0;}
function live(e){return !!e&&!e.dead&&Number.isFinite(e.hp)&&e.hp>0&&Number.isFinite(e.x)&&Number.isFinite(e.z);}
function steer(e,mx,mz,all,types,cover,T){
 const speed=Math.hypot(mx,mz),own=radius(e,types);
 if(!live(e)||!own||speed<1e-8||!Array.isArray(all))return {mx,mz,avoiding:false};
 const ux=mx/speed,uz=mz/speed,px=-uz,pz=ux;
 const peers=all.filter(o=>o!==e&&live(o)&&radius(o,types)>0);
 let chosen=null,project=Infinity,side=0;
 for(const o of peers){
  const dx=o.x-e.x,dz=o.z-e.z,forward=dx*ux+dz*uz,lateral=dx*px+dz*pz;
  const sum=own+radius(o,types);
  // Keep a chosen lane until fully past the body; don't oscillate as
  // lateral clearance changes while driving along its side.
  const latched=e.bypassTarget===o.idx&&e.bypassSign;
  if(latched){if(forward>=-sum*.75&&Math.hypot(dx,dz)<=sum+LOOK+3){chosen=o;side=e.bypassSign;project=-Infinity;break;}}
  if(forward>=-.1&&forward<=sum+LOOK&&Math.abs(lateral)<sum+.5&&forward<project){
   chosen=o;project=forward;
   side=Math.abs(lateral)>.12?(lateral>0?-1:1):((Math.abs(e.idx||0)%2)===0?1:-1);
  }
 }
 if(!chosen){e.bypassTarget=null;e.bypassSign=0;return {mx,mz,avoiding:false};}
 const test=(sign)=>{
  const bx=ux*.48+px*sign*.88,bz=uz*.48+pz*sign*.88,mag=Math.hypot(bx,bz),nx=bx/mag,nz=bz/mag;
  return {mx:nx*speed,mz:nz*speed,valid:!T?.free||T.free(e.x+nx*1.5,e.z+nz*1.5,cover,own)};
 };
 let solution=test(side);
 if(!solution.valid){const reverse=test(-side);if(reverse.valid){side=-side;solution=reverse;}else {e.bypassTarget=null;e.bypassSign=0;return {mx,mz,avoiding:false};}}
 e.bypassTarget=chosen.idx;e.bypassSign=side;e.bypassFlash=FLASH;
 return {mx:solution.mx,mz:solution.mz,avoiding:true,target:chosen.idx,side};
}
function tick(all,dt){if(!Array.isArray(all)||!Number.isFinite(dt)||dt<=0)return;for(const e of all)if(e&&e.bypassFlash>0)e.bypassFlash=Math.max(0,e.bypassFlash-dt);}
function render(engine,e,low=false,calm=false){
 if(!engine||!live(e)||!(e.bypassFlash>0)||!e.bypassSign)return 0;
 const n=low||calm?2:4,opacity=Math.min(.85,.35+e.bypassFlash/FLASH*.4);
 for(let i=0;i<n;i++){
  const side=e.bypassSign,dir=e.yaw||0,ox=Math.cos(dir)*side,oz=-Math.sin(dir)*side;
  engine.cube(e.x+ox*(1.15+i*.15),.4+i*.14,e.z+oz*(1.15+i*.15),.22,.13,.34,'#5eead4',dir,opacity);
 }
 return n;
}
const api=Object.freeze({FLASH,LOOK,radius,live,steer,tick,render});
root.AegisCrowdBypass=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
