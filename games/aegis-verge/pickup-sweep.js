/* Architect Industries — Aegis Verge 2.71: physical salvage pickups.
 * First-party MIT-compatible XZ swept-path test, not an aim assist or homing loot.
 * Only successful collision-resolved vehicle motion is accepted. Zero dependencies.
 */
(function(root){
'use strict';
const RADIUS=2.1, FLASH=.68;
function valid(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.z)}
function closest(a,b,p){
 if(!valid(a)||!valid(b)||!valid(p))return null;
 const dx=b.x-a.x,dz=b.z-a.z,d2=dx*dx+dz*dz;
 const t=d2<1e-12?0:Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/d2));
 return {x:a.x+t*dx,z:a.z+t*dz,t,distance:Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)};
}
function crosses(q,paths,cover=[],firstCover){
 if(!valid(q)||!Array.isArray(paths))return false;
 for(const segment of paths){
  if(!Array.isArray(segment)||segment.length!==2)continue;
  const near=closest(segment[0],segment[1],q);
  if(!near||near.distance>RADIUS)continue;
  // A pickup across an intact barrier cannot be vacuumed through that wall.
  // The current authoritative cover list contains only live collision solids.
  if(typeof firstCover==='function'&&firstCover(near.x,near.z,q.x,q.z,cover,.08))continue;
  return true;
 }
 return false;
}
function collect(pickups,paths,cover,firstCover,now,receive){
 if(!Array.isArray(pickups)||typeof receive!=='function')return 0;
 const segments=Array.isArray(paths)?paths:[];const end=segments.length?segments[segments.length-1]?.[1]:null;
 let count=0;
 for(const q of pickups){
  if(!q||q.collected||!Number.isFinite(q.life)||q.life<=0)continue;
  // Drops created later in the same simulation step must not receive a
  // retroactive swept traversal. They are still collectible at the endpoint.
  const recent=Number.isFinite(q.spawnedAt)&&q.spawnedAt>=now-1e-8;
  const sampled=recent?(valid(end)?[[end,end]]:[]):segments;
  if(crosses(q,sampled,cover,firstCover)){receive(q);count++;}
 }
 return count;
}
function create(){return {flashes:[],totalSweeps:0,totalCollected:0};}
function mark(state,pickup){if(!state||!valid(pickup))return;state.flashes.push({x:pickup.x,z:pickup.z,type:pickup.type==='repair'?'repair':'energy',left:FLASH});if(state.flashes.length>4)state.flashes.shift();state.totalCollected++;}
function tick(state,dt){if(!state||!Number.isFinite(dt)||dt<=0)return;for(const f of state.flashes)f.left-=dt;state.flashes=state.flashes.filter(f=>f.left>0);}
function render(engine,state,low=false,calm=false){if(!engine||!state?.flashes?.length)return 0;let drawn=0;for(const f of state.flashes){const fade=Math.max(0,f.left/FLASH),n=low||calm?3:7;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=1.1+(1-fade)*1.45;engine.cube(f.x+Math.sin(a)*r,.18+fade*.8,f.z+Math.cos(a)*r,.23,.10,.42,f.type==='repair'?'#86efac':'#e879f9',a,calm?.55:fade);drawn++;}}return drawn;}
const api=Object.freeze({RADIUS,FLASH,valid,closest,crosses,collect,create,mark,tick,render});root.AegisPickupSweep=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
