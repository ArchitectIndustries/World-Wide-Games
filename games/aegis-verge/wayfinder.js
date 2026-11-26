/* Architect Industries — Aegis Verge F3D23 Wayfinder. Original first-party source.
 * Reuses authoritative collision/obstacle A*; never draws through solid cover.
 * This advisory overlay cannot steer, score, collide, change saves or complete objectives.
 */
(function(root){
'use strict';
const RADIUS=1.15,INTERVAL=.8,DISPLACEMENT=2.4,MAX_MARKERS=14;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
const blocked=(a,b,cover,tactics)=>!!tactics.firstCover(a.x,a.z,b.x,b.z,cover,RADIUS);
function calculate(start,goal,cover,tactics,arrivalRadius=0){
 if(!finite(start)||!finite(goal)||!Array.isArray(cover)||!tactics||
    !tactics.free(start.x,start.z,cover,RADIUS))return null;
 // Beacons are capture ZONES, not exact collision destinations. A relay can be
 // directly behind (or even within) genuine hard cover. Never point players
 // into that wall; guide them to a reachable point inside the capture radius.
 const candidates=[];
 if(tactics.free(goal.x,goal.z,cover,RADIUS))candidates.push({x:goal.x,z:goal.z});
 if(arrivalRadius>0){const ring=Math.max(.3,arrivalRadius*.78);
  for(let i=0;i<16;i++){const a=i*Math.PI/8,p={x:goal.x+Math.sin(a)*ring,z:goal.z+Math.cos(a)*ring};
   if(tactics.free(p.x,p.z,cover,RADIUS))candidates.push(p);
  }
 }
 candidates.sort((a,b)=>dist(start,a)-dist(start,b));
 function attempt(target){
  const direct=!blocked(start,target,cover,tactics);
  let points=direct?[{...target}]:tactics.path(start.x,start.z,target.x,target.z,cover,RADIUS);
  if(!Array.isArray(points)||!points.length)return null;
  points=points.map(p=>({x:p.x,z:p.z}));
  if(!direct&&dist(points[points.length-1],target)>.01)points.push({...target});
  let previous=start,total=0;
  for(const p of points){
   if(!finite(p)||!tactics.free(p.x,p.z,cover,RADIUS)||blocked(previous,p,cover,tactics))return null;
   total+=dist(previous,p);previous=p;
  }
  return Number.isFinite(total)?{points,distance:total,direct,arrival:{...target}}:null;
 }
 // Straight visible zones first, no A* needed; otherwise test at most eight
 // near candidates on the already-bounded 37x37 nav grid, not every frame.
 for(const p of candidates)if(!blocked(start,p,cover,tactics))return attempt(p);
 for(const p of candidates.slice(0,8)){const path=attempt(p);if(path)return path;}
 return null;
}
function create(){return {route:null,origin:null,goalKey:'',coverKey:'',last:-Infinity,computes:0};}
function update(state,player,goal,cover,tactics,simTime,enabled,phase,arrivalRadius=0){
 if(!enabled||!finite(goal)||!Number.isFinite(simTime)){state.route=null;return null;}
 const goalKey=String(phase)+':'+goal.x+':'+goal.z+':'+arrivalRadius;
 const coverKey=cover.map(b=>b.id+':'+b.x+':'+b.z+':'+b.w+':'+b.d).join('|');
 const changed=state.goalKey!==goalKey||state.coverKey!==coverKey;
 const stale=simTime-state.last>=INTERVAL;
 const moved=!state.origin||dist(state.origin,player)>=DISPLACEMENT;
 if(changed||stale&&moved||!state.origin){
  state.route=calculate(player,goal,cover,tactics,arrivalRadius);state.last=simTime;state.origin={x:player.x,z:player.z};
  state.goalKey=goalKey;state.coverKey=coverKey;state.computes++;
 }
 return state.route;
}
function markers(route){if(!route)return[];
 const pts=route.points;if(pts.length<=MAX_MARKERS)return pts;
 const skip=Math.max(1,Math.ceil(pts.length/MAX_MARKERS));
 const subset=pts.filter((_,i)=>i%skip===0).slice(0,MAX_MARKERS-1);
 return subset.concat([pts[pts.length-1]]);
}
const api=Object.freeze({RADIUS,INTERVAL,DISPLACEMENT,MAX_MARKERS,calculate,create,update,markers});
root.AegisWayfinder=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
