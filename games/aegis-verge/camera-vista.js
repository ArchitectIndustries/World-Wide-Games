/* Architect Industries original Aegis Verge F3D36: optional cover-safe tactical camera.
 * All camera data is read-only. No collision, aiming, scoring or AI authority. */
(function(root){
'use strict';
const MODES=Object.freeze(['chase','tactical']);
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z);
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});
function create(){return {mode:'chase',eye:null,target:null,transitions:0,occlusionSnaps:0};}
function toggle(state){state.mode=state.mode==='chase'?'tactical':'chase';state.transitions++;return state.mode;}
function reset(state){state.eye=null;state.target=null;}
function follow(state,desired,player,cover,camera,dt,calm=false){
 if(!finite(desired?.eye)||!finite(desired?.target))return null;
 const focus={x:Number(player?.x)||0,y:1.55,z:Number(player?.z)||0};
 if(!finite(state.eye)||!finite(state.target)){state.eye={...desired.eye};state.target={...desired.target};}
 else if(dt>0){
  const amount=calm?1:Math.min(1,1-Math.exp(-Math.min(.08,Math.max(0,dt))*9));
  let eye=lerp(state.eye,desired.eye,amount);
  const drift=Math.hypot(eye.x-desired.eye.x,eye.y-desired.eye.y,eye.z-desired.eye.z);
  // Collision first, even during a cinematic change. Large lag teleports to a
  // collision-verified goal instead of allowing the avatar to leave view.
  if(drift>4.5||camera.first(focus,eye,cover)){eye={...desired.eye};state.occlusionSnaps++;}
  // If an invalid intermediate is attempted, only an already verified goal
  // is accepted (CAM.resolve searches above or shortens behind real cover).
  if(camera.first(focus,eye,cover))throw new Error('Camera goal occluded');
  state.eye=eye;state.target=lerp(state.target,desired.target,amount);
 }
 return {eye:{...state.eye},target:{...state.target},mode:desired.mode,profile:state.mode,occluder:desired.occluder};
}
const api=Object.freeze({MODES,create,toggle,reset,follow});
root.AegisCameraVista=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
