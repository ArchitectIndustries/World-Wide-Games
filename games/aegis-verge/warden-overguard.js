/* Architect Industries — Aegis Verge F3D54 Warden Overguard.
 * First-party tactical support link: a Warden protects nearby, cover-visible
 * allies against one point of direct player cannon damage every six seconds.
 * Cannon collision/kill/scoring remain authoritative in the host game.
 * No random rolls, no new entities, no linked support through cover.
 */
(function(root){
'use strict';
const RANGE=16,COOLDOWN=6,MAX_ABSORB=1;
const finite=Number.isFinite;
function validEnemy(e){return !!e&&!e.dead&&finite(e.hp)&&e.hp>0&&finite(e.x)&&finite(e.z);}
function source(target,actors,cover,firstCover,jammed=false){
 if(jammed||!validEnemy(target)||target.type==='warden'||target.state==='stagger'||!Array.isArray(actors))return null;
 let best=null,bestDist=RANGE;
 for(const actor of actors){
  if(actor===target||actor.type!=='warden'||!validEnemy(actor)||actor.state==='stagger')continue;
  const d=Math.hypot(target.x-actor.x,target.z-actor.z);
  if(d>bestDist)continue;
  if(typeof firstCover==='function'&&firstCover(actor.x,actor.z,target.x,target.z,cover||[],.08))continue;
  best=actor;bestDist=d;
 }
 return best;
}
function ready(target,now){return validEnemy(target)&&finite(now)&&now>=Math.max(0,finite(target.wardenLinkNextAt)?target.wardenLinkNextAt:0);}
function apply(target,actors,cover,firstCover,jammed,now,rawDamage){
 const damage=finite(rawDamage)?Math.max(0,rawDamage):0;
 const protector=ready(target,now)?source(target,actors,cover,firstCover,jammed):null;
 if(!protector||damage<=0)return {damage,absorbed:0,protector:null};
 const absorbed=Math.min(MAX_ABSORB,damage);
 target.wardenLinkNextAt=now+COOLDOWN;
 return {damage:damage-absorbed,absorbed,protector};
}
function links(actors,cover,firstCover,jammed,now){
 if(!Array.isArray(actors)||jammed)return [];
 const out=[];
 for(const enemy of actors){
  if(!ready(enemy,now))continue;
  const protector=source(enemy,actors,cover,firstCover,false);
  if(protector)out.push({target:enemy,protector});
 }
 return out;
}
function render(engine,connections,low=false,calm=false,clock=0){
 if(!engine||!Array.isArray(connections))return 0;
 let calls=0;
 for(const {target,protector} of connections){
  const dx=target.x-protector.x,dz=target.z-protector.z,len=Math.hypot(dx,dz);
  if(len<.1)continue;
  const yaw=Math.atan2(dx,dz),p=calm?0:Math.sin(clock*4)*.15;
  // A physical-looking overhead energy bridge plus distinctive target brackets.
  engine.cube((target.x+protector.x)/2,2.45+p,(target.z+protector.z)/2,.12,.14,len,'#67e8f9',yaw,.6);calls++;
  engine.cube(target.x,2.9,target.z,1.75,.12,1.75,'#a5f3fc',0,.78);calls++;
  if(!low){
   engine.cube(target.x-1,1.45,target.z,.12,1.7,.22,'#22d3ee',0,.7);calls++;
   engine.cube(target.x+1,1.45,target.z,.12,1.7,.22,'#22d3ee',0,.7);calls++;
  }
 }
 return calls;
}
const api=Object.freeze({RANGE,COOLDOWN,MAX_ABSORB,source,ready,apply,links,render});
root.AegisWardenOverguard=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
