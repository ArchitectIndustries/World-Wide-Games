/* Architect Industries: original active-time, collision-tested holographic lure.
 * Temporary combat state only; never trusted for score or checkpoint persistence.
 */
(function(root){
'use strict';
const COST=38, DURATION=5.5, COOLDOWN=10, RANGE=10, HITS=2, RADIUS=1.25, LURE=29;
function create(){return {x:0,z:0,left:0,cooldown:0,hp:0};}
function visible(d){return !!d&&d.hp>0&&d.left>0;}
function ready(d,energy,playing){return !!d&&!!playing&&!visible(d)&&d.cooldown<=0&&Number.isFinite(energy)&&energy>=COST;}
function deploy(d,player,blocks,tactics,energy,playing){
 if(!ready(d,energy,playing)||!player||!Array.isArray(blocks)||!tactics)return false;
 if(!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Number.isFinite(player.yaw))return false;
 let point=null;
 for(let distance=RANGE;distance>=4;distance--){
  const x=player.x+Math.sin(player.yaw)*distance,z=player.z+Math.cos(player.yaw)*distance;
  if(tactics.free(x,z,blocks,1)&&!tactics.firstCover(player.x,player.z,x,z,blocks,.28)){point={x,z};break;}
 }
 if(!point)return false;
 d.x=point.x;d.z=point.z;d.left=DURATION;d.cooldown=COOLDOWN;d.hp=HITS;
 return true;
}
function tick(d,dt){
 if(!d||!Number.isFinite(dt)||dt<=0)return false;
 const time=Math.min(dt,.25);
 d.cooldown=Math.max(0,d.cooldown-time);
 if(d.left>0){d.left=Math.max(0,d.left-time);if(d.left<=0)d.hp=0;}
 return visible(d);
}
function target(d,enemy){
 if(!visible(d)||!enemy||enemy.dead||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z))return null;
 return Math.hypot(enemy.x-d.x,enemy.z-d.z)<=LURE?{x:d.x,z:d.z}:null;
}
function hitTime(d,ax,az,bx,bz,tactics){
 if(!visible(d)||!tactics||![ax,az,bx,bz].every(Number.isFinite))return null;
 return tactics.segmentCircle(ax,az,bx,bz,d.x,d.z,RADIUS);
}
function absorb(d){if(!visible(d))return false;d.hp--;if(!d.hp)d.left=0;return true;}
const api=Object.freeze({COST,DURATION,COOLDOWN,RANGE,HITS,RADIUS,LURE,create,visible,ready,deploy,tick,target,hitTime,absorb});
root.AegisTacticalDecoy=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
