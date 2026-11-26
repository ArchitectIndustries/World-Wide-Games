/* Architect Industries / Aegis Verge F3D78: first-party tactical crossfire forecast.
 * Forecast ONLY, derived from current locked hostile volley lanes and real sweep
 * functions. Actors may move before impact. No ballistics, score or AI mutation.
 * Browser/CommonJS, no assets, dependencies or paid services; MIT compatible.
 */
(function(root){
'use strict';
const RANGE=34;
function observe(player,enemies,cover,firstCover,segmentCircle,telegraphs,crossfire,types,decoy=null,decoyTime=null){
 if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Array.isArray(enemies)||
    typeof segmentCircle!=='function'||!telegraphs||!crossfire||typeof firstCover!=='function')return null;
 let best=null;
 for(const source of enemies){
  if(!source||source.dead||!(source.hp>0)||source.state!=='windup'||source.siegeTarget||
     !Number.isFinite(source.aimX)||!Number.isFinite(source.aimZ)||
     Math.hypot(source.x-player.x,source.z-player.z)>RANGE)continue;
  for(const lane of telegraphs.lanes(source,cover,firstCover)){
   // The authored volley preview already clips each ray at the FIRST solid wall.
   if(!(lane.length>0.05))continue;
   const from={x:lane.x,z:lane.z},to={x:lane.endX,z:lane.endZ};
   const hit=crossfire.earliest({source,sourceIdx:source.idx},from,to,enemies,types,segmentCircle,1);
   if(!hit||hit.t>=1-1e-5)continue;
   const playerT=segmentCircle(from.x,from.z,to.x,to.z,player.x,player.z,telegraphs.PLAYER_RADIUS??1.35);
   if(playerT!==null&&playerT<=hit.t+1e-7)continue;
   // An active decoy would absorb the bolt before the ally. Never claim a
   // clear crossfire lane through an earlier decoy interception.
   if(decoy&&typeof decoyTime!=='function')continue;
   if(decoy&&typeof decoyTime==='function'){
    const t=decoyTime(decoy,from.x,from.z,to.x,to.z,segmentCircle);
    if(t!==null&&Number.isFinite(t)&&t<=hit.t+1e-7)continue;
   }
   const dist=Math.hypot(player.x-hit.enemy.x,player.z-hit.enemy.z);
   if(!best||dist<best.distance)best={source,target:hit.enemy,x:hit.x,z:hit.z,distance:dist,angle:lane.angle,laneOffset:lane.offset};
  }
 }
 return best;
}
function cue(target){return target?'CROSSFIRE OPENING · '+target.source.type.toUpperCase()+' volley lines up on another hostile · stay out of the orange lane; positions may change':'';}
function render(engine,target,low=false,calm=false){
 if(!engine||!target||!target.target||target.target.dead||target.target.hp<=0)return 0;
 const n=low||calm?4:8,r=1.25;
 for(let i=0;i<n;i++){
  const a=i*Math.PI*2/n;
  engine.cube(target.x+Math.sin(a)*r,.16,target.z+Math.cos(a)*r,.22,.10,.44,'#5eead4',a,.65);
 }
 if(!low&&!calm)engine.cube(target.x,2.65,target.z,.28,.22,.28,'#baf7ef',0,.75);
 return n+(!low&&!calm?1:0);
}
const api=Object.freeze({RANGE,observe,cue,render});
root.AegisCrossfirePreview=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
