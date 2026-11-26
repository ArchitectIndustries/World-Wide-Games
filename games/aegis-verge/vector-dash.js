/* Architect Industries original Aegis Verge vector dash. The gameplay loop owns collision;
 * this module owns bounded movement duration, resource cost and cooldown only.
 * No invulnerability; velocity is applied in discrete collision-tested segments.
 */
(function(root){
'use strict';
const COST=28,COOLDOWN=2.8,DURATION=.34,SPEED=18,SEGMENT=.25;
function create(){return {remaining:0,cooldown:0,direction:1};}
function ready(s,energy,active){return !!active&&s.remaining<=0&&s.cooldown<=0&&energy>=COST;}
function start(s,energy,active,direction=1){
 if(!ready(s,energy,active))return false;
 s.remaining=DURATION;s.cooldown=COOLDOWN;s.direction=direction<0?-1:1;
 return true;
}
function step(s,dt,move,angle){
 if(!Number.isFinite(dt)||dt<=0)return {moved:0,blocked:false};
 dt=Math.min(.25,dt);
 s.cooldown=Math.max(0,s.cooldown-dt);
 const duration=Math.min(s.remaining,dt);
 if(duration<=0)return {moved:0,blocked:false};
 s.remaining=Math.max(0,s.remaining-duration);
 let left=SPEED*duration,moved=0,blocked=false;
 while(left>1e-8){
  const length=Math.min(left,SEGMENT),dx=Math.sin(angle)*length*s.direction,dz=Math.cos(angle)*length*s.direction;
  if(move(dx,dz)){blocked=true;s.remaining=0;break;}
  left-=length;moved+=length;
 }
 return {moved,blocked};
}
const api=Object.freeze({COST,COOLDOWN,DURATION,SPEED,SEGMENT,create,ready,start,step});
root.AegisVectorDash=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
