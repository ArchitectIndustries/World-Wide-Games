/* Architect Industries — Aegis Verge F3D24 Clearview camera boom.
 * Original first-party code. 3D swept camera/cover test: no image-space trick,
 * teleport, gameplay movement, or change to authoritative collision geometry.
 */
(function(root){
'use strict';
const NEAR_RADIUS=.34, FOLLOW=11, BASE_HEIGHT=8, MAX_HEIGHT=16, STEP=1.0;
function finite(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z);}
// Segment versus a vertically bounded, expanded AABB. No false 2D obstruction
// for elevated sightlines that actually pass OVER the roof of a barricade.
function cast(a,b,block,r=NEAR_RADIUS){
 if(!finite(a)||!finite(b)||!block||!Number.isFinite(block.h))return null;
 let enter=0,exit=1;
 for(const [start,end,lo,hi] of [
  [a.x,b.x,block.x-block.w/2-r,block.x+block.w/2+r],
  [a.y,b.y,-r,block.h+r],
  [a.z,b.z,block.z-block.d/2-r,block.z+block.d/2+r]]){
  const d=end-start;
  if(Math.abs(d)<1e-9){if(start<lo||start>hi)return null;continue;}
  let x=(lo-start)/d,y=(hi-start)/d;if(x>y)[x,y]=[y,x];
  enter=Math.max(enter,x);exit=Math.min(exit,y);if(enter>exit)return null;
 }
 return enter>=0&&enter<=1?enter:null;
}
function first(a,b,cover){let hit=null;
 for(const block of Array.isArray(cover)?cover:[]){const t=cast(a,b,block);
  if(t!==null&&(!hit||t<hit.t))hit={t,blockId:block.id};
 }return hit;
}
function resolve(player,blocks,profile="chase"){
 const tactical=profile==="tactical",follow=tactical?15:FOLLOW,base=tactical?11:BASE_HEIGHT,max=tactical?21:MAX_HEIGHT;
 const yaw=Number.isFinite(player?.yaw)?player.yaw:0;
 const x=Number.isFinite(player?.x)?player.x:0,z=Number.isFinite(player?.z)?player.z:0;
 const fX=Math.sin(yaw),fZ=Math.cos(yaw),focus={x,y:1.55,z};
 const target={x:x+fX*(tactical?11:7),y:.8,z:z+fZ*(tactical?11:7)};
 for(let y=base;y<=max+1e-6;y+=STEP){
  const eye={x:x-fX*follow,y,z:z-fZ*follow};
  if(!first(focus,eye,blocks))return{eye,target,mode:y===base?(tactical?'tactical':'normal'):'elevated',height:y,occluder:null};
 }
 // If a close vertical obstruction cannot be cleared by raising the boom,
 // shorten the boom before the first real 3D collision (with a safe margin).
 const desired={x:x-fX*follow,y:base,z:z-fZ*follow};
 const hit=first(focus,desired,blocks);
 const t=hit?Math.max(0,hit.t-.055):1;
 if(t>.20){const eye={x:focus.x+(desired.x-focus.x)*t,y:focus.y+(desired.y-focus.y)*t,z:focus.z+(desired.z-focus.z)*t};
  if(!first(focus,eye,blocks))return{eye,target,mode:'shortened',height:eye.y,occluder:hit?.blockId??null};
 }
 // Look straight down from above the avatar if a solid high wall lies too
 // close behind to sustain a readable third-person boom.
 const eye={x,y:max+2,z};
 return{eye,target,mode:'overhead',height:eye.y,occluder:hit?.blockId??null};
}
const api=Object.freeze({cast,first,resolve,NEAR_RADIUS,FOLLOW,BASE_HEIGHT,MAX_HEIGHT});
root.AegisCameraOcclusion=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
