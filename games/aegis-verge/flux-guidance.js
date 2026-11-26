/* Architect Industries — Aegis Verge Flux Circuit Guide.
 * First-party advisory pathfinder for the existing physical four-gate course.
 * Route points are checked by Wayfinder/Tactics against current live cover;
 * the guide never moves the player, grants resources, scores or completes gates.
 */
(function(root){
'use strict';
const APPROACH=2.35;
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
function create(wayfinder){return {enabled:false,nav:wayfinder.create(),route:null,goal:null,gateId:null};}
function destination(gates,progress){
 if(!Array.isArray(gates)||!Number.isSafeInteger(progress)||progress<0||progress>=gates.length)return null;
 const g=gates[progress];if(!g||!Number.isFinite(g.x)||!Number.isFinite(g.z)||![1,-1].includes(g.direction))return null;
 return {x:g.x,z:g.z-g.direction*APPROACH,gateId:g.id,progress};
}
function update(state,player,gates,progress,cover,tactics,wayfinder,elapsed,live){
 if(!state||!state.enabled||!live||!finite(player)){
  if(state){state.route=null;state.goal=null;state.gateId=null;}return null;
 }
 const target=destination(gates,progress);
 if(!target){state.route=null;state.goal=null;state.gateId=null;return null;}
 state.goal=target;state.gateId=target.gateId;
 // An independent cached Wayfinder state prevents perturbing mission routing.
 state.route=wayfinder.update(state.nav,player,target,cover,tactics,elapsed,true,'flux-'+progress,0);
 return state.route;
}
function bearing(state,player){
 if(!state?.enabled||!state.goal||!finite(player))return null;
 const route=state.route;
 const marker=route?.points?.find(p=>Math.hypot(p.x-player.x,p.z-player.z)>.75)||state.goal;
 const distance=route?.distance??Math.hypot(state.goal.x-player.x,state.goal.z-player.z);
 if(!Number.isFinite(distance)||!finite(marker))return null;
 const heading=Math.atan2(marker.x-player.x,marker.z-player.z),yaw=Number.isFinite(player.yaw)?player.yaw:0;
 const delta=Math.atan2(Math.sin(heading-yaw),Math.cos(heading-yaw));
 const turn=Math.abs(delta)<.35?'AHEAD':Math.abs(delta)>2.6?'BEHIND':delta>0?'RIGHT':'LEFT';
 return {distance,turn,route:!!route,gateId:state.gateId};
}
function render(engine,state,markers,low,calm,elapsed=0){
 if(!engine||!state?.enabled||!state.route||typeof markers!=='function')return 0;
 const points=markers(state.route),count=Math.min(points.length,low?7:14);
 for(let i=0;i<count;i++){
  const p=points[i];if(!finite(p))continue;
  const glow=calm?0.45:0.55+0.2*Math.sin(elapsed*3+i*.7);
  // Teal navigation studs and plum vertical flags: distinguish course from cyan mission path.
  engine.cube(p.x,.13,p.z,.55,.12,.55,'#d8b4fe',0,glow);
  if(i===count-1)engine.cube(p.x,1,p.z,.25,1.55,.25,'#a78bfa',0,glow);
 }
 return count;
}
const api=Object.freeze({APPROACH,create,destination,update,bearing,render});
root.AegisFluxGuidance=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
