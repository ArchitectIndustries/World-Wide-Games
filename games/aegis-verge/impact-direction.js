/* Architect Industries — Aegis Verge F3D66 directional hull impact awareness.
 * First-party realtime geometry derived only from actual hull-damaging game events.
 * Tactical feedback; neither input, collision, health nor score authority.
 */
(function(root){
'use strict';
const DURATION=1.1;
const SECTORS=Object.freeze(['FRONT','FRONT RIGHT','RIGHT','REAR RIGHT','REAR','REAR LEFT','LEFT','FRONT LEFT']);
const create=()=>({remaining:0,relative:0,world:0,amount:0,sector:'',events:0});
function register(state,player,source,amount){
 if(!state||!player||!source||!Number.isFinite(player.x)||!Number.isFinite(player.z)||
 !Number.isFinite(player.yaw)||!Number.isFinite(source.x)||!Number.isFinite(source.z)||
 !Number.isFinite(amount)||amount<=0)return false;
 const dx=source.x-player.x,dz=source.z-player.z;
 if(Math.hypot(dx,dz)<.2)return false; // a coincident blast has no truthful bearing
 const a=Math.atan2(dx*Math.cos(player.yaw)-dz*Math.sin(player.yaw),dx*Math.sin(player.yaw)+dz*Math.cos(player.yaw));
 const sector=(Math.round(a/(Math.PI/4))+8)%8;
 state.remaining=DURATION;state.relative=a;state.world=Math.atan2(dx,dz);state.amount=amount;state.sector=SECTORS[sector];state.events=(state.events||0)+1;
 return true;
}
function tick(state,dt){if(state&&Number.isFinite(dt)&&dt>0)state.remaining=Math.max(0,state.remaining-dt);}
function label(state){return state?.remaining>0&&state.sector?'HULL IMPACT \u00b7 '+state.sector+' \u00b7 '+Math.round(state.amount)+' DAMAGE':'';}
function geometry(state,player,low=false,calm=false){
 if(!state||state.remaining<=0||!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Number.isFinite(player.yaw))return [];
 const a=state.world,count=calm?2:low?3:5,remaining=Math.min(1,state.remaining/DURATION),out=[];
 for(let i=0;i<count;i++){
  const spread=(i-(count-1)/2)*.13,radius=i%2?2.9:2.55,theta=a+spread;
  out.push({x:player.x+Math.sin(theta)*radius,z:player.z+Math.cos(theta)*radius,
   y:.38+(i%2)*.25,w:.21,h:.48,d:.39,yaw:theta,
   color:i===Math.floor(count/2)?'#fff4c2':'#fb923c',em:calm?.6:.45+remaining*.55});
 }
 return out;
}
function render(engine,state,player,low=false,calm=false){
 if(!engine||typeof engine.cube!=='function')return 0;
 const marks=geometry(state,player,low,calm);
 for(const q of marks)engine.cube(q.x,q.y,q.z,q.w,q.h,q.d,q.color,q.yaw,q.em);
 return marks.length;
}
const api=Object.freeze({DURATION,SECTORS,create,register,tick,label,geometry,render});
root.AegisImpactDirection=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
