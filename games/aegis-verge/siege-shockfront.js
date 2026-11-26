/* Architect Industries — Aegis Verge F3D43: physical Skyburst shockfront.
 * Reuses the authoritative battlefield LOS and swept collision controller.
 * No invented damage, additional player score, or third-party assets.
 */
(function(root){
'use strict';
const DURATION=.34, MAX_BURSTS=6, MAX_RADIUS=4.2;
const finite=p=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
function begin(body,origin,range=MAX_RADIUS,kind='player'){
 if(!finite(body)||!finite(origin)||!Number.isFinite(range)||range<=0||body.dead)return false;
 const dx=body.x-origin.x,dz=body.z-origin.z,d=Math.hypot(dx,dz);
 if(d>range)return false;
 // A centered impact uses the actor's own forward bearing; never NaN.
 const ux=d>1e-7?dx/d:Math.sin(Number.isFinite(body.yaw)?body.yaw:Math.PI/2);
 const uz=d>1e-7?dz/d:Math.cos(Number.isFinite(body.yaw)?body.yaw:Math.PI/2);
 const mass=kind==='bulwark'?.4:kind==='warden'?.55:kind==='lancer'?.7:kind==='skirmisher'?.95:1;
 const speed=(9+7*(1-d/range))*mass;
 body.skyburstShock={ux,uz,speed,left:DURATION};return true;
}
function advance(body,dt,blocks,move,radius){
 const state=body&&body.skyburstShock;
 if(!state||!Number.isFinite(dt)||dt<=0||typeof move!=='function')return {moved:0,blocked:false,active:!!state};
 const step=Math.min(dt,state.left),scale=Math.max(0,state.left/DURATION),dx=state.ux*state.speed*scale*step,dz=state.uz*state.speed*scale*step;
 const x=body.x,z=body.z,blocked=!!move(body,dx,dz,blocks,radius),moved=Math.hypot(body.x-x,body.z-z);
 state.left=Math.max(0,state.left-step);
 if(blocked||state.left<=1e-7)body.skyburstShock=null;
 return {moved,blocked,active:!!body.skyburstShock};
}
function emit(list,origin,calm){if(!Array.isArray(list)||!finite(origin))return;
 list.push({x:origin.x,z:origin.z,left:.48,low:!!calm});
 if(list.length>MAX_BURSTS)list.splice(0,list.length-MAX_BURSTS);
}
function tick(list,dt){if(!Array.isArray(list)||!Number.isFinite(dt)||dt<=0)return;
 for(let i=list.length-1;i>=0;i--){list[i].left-=dt;if(list[i].left<=0)list.splice(i,1);}
}
function render(engine,list,low,calm){if(!engine||!Array.isArray(list))return;
 for(const burst of list){const age=1-Math.max(0,burst.left)/.48,n=low||calm?6:12,r=.7+MAX_RADIUS*age;
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n;
   engine.cube(burst.x+Math.sin(a)*r,.2+age*.16,burst.z+Math.cos(a)*r,.32,.12,.7,'#fdba74',a,Math.max(.15,.82-age*.52));
  }
 }
}
const api=Object.freeze({DURATION,MAX_BURSTS,MAX_RADIUS,begin,advance,emit,tick,render});
root.AegisSiegeShockfront=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
