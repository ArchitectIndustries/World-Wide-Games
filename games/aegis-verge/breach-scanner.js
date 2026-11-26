/* Architect Industries — Aegis Verge F3D81 targeted cover integrity indicator.
 * Read-only forecast of the EXISTING first swept cannon collision. It neither
 * targets, damages nor alters cover. Enemy/mine/flux occlusion is inherited from
 * the authoritative shot-trace first-hit ordering; intact cover remains solid.
 * Original first-party source, no asset or runtime dependency.
 */
(function(root){
'use strict';
function inspect(shot,barriers,breach){
 if(!shot||shot.kind!=='cover'||!Number.isInteger(shot.target)||
    !Number.isFinite(shot.x)||!Number.isFinite(shot.z)||
    !Number.isFinite(shot.distance)||shot.distance<0||!breach||typeof breach.status!=='function')return null;
 const state=breach.status(barriers,shot.target);
 if(!state||!Number.isInteger(state.hp)||state.hp<=0||state.hp>5||state.max!==5)return null;
 const block=barriers?.source?.find(b=>b.id===shot.target);
 if(!block||![block.x,block.z,block.h].every(Number.isFinite))return null;
 return Object.freeze({id:shot.target,hp:state.hp,max:5,x:block.x,z:block.z,y:block.h+.56,distance:shot.distance});
}
function label(item){return item?`BREACHABLE BARRICADE ${item.id+1} · ARMOR ${item.hp}/${item.max} · ${Math.ceil(item.distance)}m`:'';}
function render(engine,item,low=false,calm=false){
 if(!engine||!item)return 0;
 // Five rigid 3D material-coded blocks correspond to five REAL cover hitpoints.
 // A compact static display in reduced-effects mode avoids gratuitous motion.
 const width=2.8,step=width/5,baseY=item.y+(calm?0:0.05);
 engine.cube(item.x,baseY,item.z,width+.28,.18,.54,'#102938',0,.3);
 let count=1;
 for(let i=0;i<5;i++){
  engine.cube(item.x+(i-2)*step,baseY+.19,item.z,step*.82,.20,.35,i<item.hp?'#fbbf24':'#374151',0,i<item.hp?.85:.08);count++;
 }
 // Show the target physically; no change to collision or occlusion.
 if(!low&&!calm){engine.cube(item.x,baseY+.43,item.z,.22,.18,.22,'#fde68a',0,.55);count++;}
 return count;
}
const api=Object.freeze({inspect,label,render});
root.AegisBreachScanner=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
