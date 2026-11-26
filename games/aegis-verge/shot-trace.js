/* Aegis Verge F3D30 — first-party, read-only cannon line preview.
 * Uses the same swept cover/enemy/mine priority as live projectileHit.
 * A snapshot is not an aim assist, homing weapon, or future prediction.
 */
(function(root){
'use strict';
const RANGE=38*1.35;
const TYPES=Object.freeze({skirmisher:1.4,lancer:1.7,bulwark:2.1,warden:2.4});
function trace(player,cover,enemies,mines,relay,tactics,maxDistance=RANGE,capacitor=null){
 if(!player||![player.x,player.z,player.yaw,maxDistance].every(Number.isFinite)||maxDistance<=0||!tactics||!Array.isArray(cover)||!Array.isArray(enemies))return null;
 const ax=player.x,az=player.z,bx=ax+Math.sin(player.yaw)*maxDistance,bz=az+Math.cos(player.yaw)*maxDistance;
 const wall=tactics.firstCover(ax,az,bx,bz,cover,.08);
 let hit=wall?{kind:'cover',t:wall.t,target:wall.block?.id??null}:{kind:'clear',t:1,target:null};
 for(const enemy of enemies){
  if(!enemy||enemy.dead||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z)||!TYPES[enemy.type])continue;
  const t=tactics.segmentCircle(ax,az,bx,bz,enemy.x,enemy.z,TYPES[enemy.type]*.8);
  if(t!==null&&t<hit.t)hit={kind:'hostile',t,target:enemy.type};
 }
 if(mines&&Number.isInteger(relay)&&relay>=0&&relay<3&&mines.hp?.[relay]>0){
  const site=mines.sites?.[relay];
  if(site&&Number.isFinite(site.x)&&Number.isFinite(site.z)){
   const t=tactics.segmentCircle(ax,az,bx,bz,site.x,site.z,1.35);
   if(t!==null&&t<hit.t)hit={kind:'mine',t,target:relay};
  }
 }
 // The actual 2D swept cannon uses this same occlusion ordering, so aim
 // preview identifies an unobstructed powered Flux node but never shoots it.
 if(capacitor?.cap?.intercept){
  const sight=capacitor.cap.intercept(capacitor.state,capacitor.progress,capacitor.armed,ax,az,bx,bz,tactics.segmentCircle);
  if(sight&&sight.t<hit.t)hit={kind:'flux-capacitor',t:sight.t,target:sight.id};
 }
 const d=hit.t*maxDistance;
 return Object.freeze({...hit,x:ax+Math.sin(player.yaw)*d,z:az+Math.cos(player.yaw)*d,distance:d});
}
function label(hit){
 if(!hit)return 'LINE UNAVAILABLE';
 if(hit.kind==='hostile')return 'LINE '+String(hit.target).toUpperCase()+' '+Math.round(hit.distance)+'m';
 if(hit.kind==='cover')return 'LINE BLOCKED · COVER '+Math.round(hit.distance)+'m';
 if(hit.kind==='mine')return 'LINE CAPACITOR '+Math.round(hit.distance)+'m';
 if(hit.kind==='flux-capacitor')return 'LINE FLUX NODE '+String(hit.target).toUpperCase()+' '+Math.round(hit.distance)+'m · 2 SHOTS / PRACTICE';
 return 'LINE CLEAR · NO TARGET';
}
function marker(engine,hit,calm){
 if(!engine||!hit||hit.kind==='clear'||!Number.isFinite(hit.distance))return 0;
 const col=hit.kind==='cover'?'#fbbf24':hit.kind==='mine'?'#fdba74':hit.kind==='flux-capacitor'?'#f59e0b':'#67e8f9';
 const count=calm?2:4,span=hit.kind==='hostile'?1.3:.85;
 for(let i=0;i<count;i++){
  const a=(i+.5)*Math.PI*2/count;
  engine.cube(hit.x+Math.sin(a)*span,.18,hit.z+Math.cos(a)*span,.28,.09,.48,col,a,.8);
 }
 return count;
}
const api=Object.freeze({RANGE,trace,label,marker});
root.AegisShotTrace=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
