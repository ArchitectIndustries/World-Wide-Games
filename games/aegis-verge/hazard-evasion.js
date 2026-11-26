/* Architect Industries — original light-drone mine awareness (F3D13).
 * Tactical decision and obstacle-safe displacement. No teleports, invulnerability,
 * scoring or physics overrides. Heavy drones / committed windups stay vulnerable.
 */
(function(root){
'use strict';
const REACT=['skirmisher','lancer'],BUFFER=.3,RESPONSE=1.12;
const OFFSETS=[0,Math.PI/4,-Math.PI/4,Math.PI/2,-Math.PI/2];
function evade(e,type,mines,relay,dt,blocks,tactics,mineAPI){
 if(!e||e.dead||!REACT.includes(type)||!mines||!tactics||!mineAPI||!Array.isArray(blocks)||
    !Number.isSafeInteger(relay)||relay<0||relay>=mineAPI.COUNT||
    mines.phase?.[relay]!=='warning'||!Number.isFinite(dt)||dt<=0||dt>1/30||
    e.state==='windup'||e.state==='stagger')return false;
 const site=mines.sites?.[relay];if(!site||![site.x,site.z,e.x,e.z].every(Number.isFinite))return false;
 const dx=e.x-site.x,dz=e.z-site.z,r=Math.hypot(dx,dz);
 if(r>mineAPI.BLAST+BUFFER||r<.0001)return false;
 // Real cover already protects the drone from the blast; do not take an
 // artificial escape path through a wall or spend work on protected actors.
 if(tactics.firstCover(site.x,site.z,e.x,e.z,blocks,.08))return false;
 const qspeed=type==='skirmisher'?4.3:3.5,speed=qspeed*RESPONSE,theta=Math.atan2(dx,dz);
 const step=Math.min(dt,1/30)*speed,radius=type==='skirmisher'?.91:1.105;
 let best=null,bestGain=0;
 for(const offset of OFFSETS){
  const a=theta+offset,body={x:e.x,z:e.z};
  tactics.move(body,Math.sin(a)*step,Math.cos(a)*step,blocks,radius);
  const gain=Math.hypot(body.x-site.x,body.z-site.z)-r;
  if(gain>bestGain+1e-7){best={x:body.x,z:body.z};bestGain=gain;}
 }
 if(!best||bestGain<step*.1)return false;
 e.x=best.x;e.z=best.z;e.yaw=Math.atan2(dx,dz);e.state='evade';
 e.path=[];e.navAt=0;
 return true;
}
const api=Object.freeze({REACT,BUFFER,RESPONSE,evade});
root.AegisHazardEvasion=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
