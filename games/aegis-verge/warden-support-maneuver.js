/* Architect Industries — Aegis Verge F3D57 Warden Rescue Priority (extends F3D56 flank).
 * Deterministic collision-constrained tactical support positioning.
 * No teleport, damage, scoring, new actor or network dependency.
 */
(function(root){
'use strict';
const SEARCH_RADIUS=29, LINK_RANGE=16, REFORM_AT=13.5, UPDATE_PERIOD=.7, BLOCKED_RETRY=1.4;
const valid=e=>!!e&&!e.dead&&Number.isFinite(e.x)&&Number.isFinite(e.z)&&Number.isFinite(e.hp)&&e.hp>0;
function select(warden,actors,jammed=false,cover=[],firstCover=null){
 if(jammed||!valid(warden)||warden.type!=='warden'||warden.state==='stagger'||!Array.isArray(actors))return null;
 let best=null,bestDist=SEARCH_RADIUS;
 for(const ally of actors){
  if(ally===warden||!valid(ally)||ally.type==='warden'||ally.state==='stagger')continue;
  const d=Math.hypot(ally.x-warden.x,ally.z-warden.z);
  // A close ally BEHIND intact cover cannot receive Overguard. A real Warden
  // must go around the barricade; proximity alone is not a valid link.
  // Conversely, never chase an already visible, in-range ally.
  if(d>=bestDist)continue;
  if(d<=LINK_RANGE&&(!firstCover||!firstCover(warden.x,warden.z,ally.x,ally.z,cover,.08)))continue;
  best=ally;bestDist=d;
 }
 return best;
}
// An inaccessible nearer ally must not monopolize a Warden's assistance.
// Remember failed routes for a bounded simulation interval, but invalidate the
// failure if cover, the ally, or the Warden moves substantially. No wall bypass.
function clear(warden){warden.supportActive=false;warden.supportFlank=false;warden.supportTargetIndex=null;warden.supportPath=[];}
function steer(warden,actors,cover,tactics,navClock,jammed=false){
 const obstacles=Array.isArray(cover)?cover:[];
 if(jammed||!valid(warden)||warden.type!=='warden'||warden.state==='stagger'||!Array.isArray(actors)||!tactics||typeof tactics.firstCover!=='function'||typeof tactics.path!=='function'||!Number.isFinite(navClock)){
  if(warden)clear(warden);return null;
 }
 // A change to a destructible barricade invalidates previous route failure.
 const signature=obstacles.map(b=>[b.id,b.x,b.z,b.w,b.d].join(':')).join('|');
 if(warden.supportCoverSignature!==signature){warden.supportBlocked=[];warden.supportCoverSignature=signature;warden.supportPath=[];}
 const candidates=[];
 for(const ally of actors){
  if(ally===warden||!valid(ally)||ally.type==='warden'||ally.state==='stagger')continue;
  const dist=Math.hypot(ally.x-warden.x,ally.z-warden.z);
  if(dist>=SEARCH_RADIUS||dist<.01)continue;
  const flank=!!tactics.firstCover(warden.x,warden.z,ally.x,ally.z,obstacles,.08);
  if(!flank&&dist<=LINK_RANGE&&(dist<=REFORM_AT||warden.supportTargetIndex!==ally.idx))continue;
  candidates.push({ally,dist,flank});
 }
 candidates.sort((a,b)=>a.dist-b.dist||(a.ally.idx??0)-(b.ally.idx??0));
 for(const {ally,dist,flank} of candidates){
  let route=[],recalculated=false;
  if(flank){
   const failure=(warden.supportBlocked||[]).find(f=>f.idx===ally.idx);
   if(failure&&navClock<failure.until&&Math.hypot(failure.x-ally.x,failure.z-ally.z)<1&&Math.hypot(failure.wx-warden.x,failure.wz-warden.z)<2)continue;
   // Never reuse a route aimed at a different ally (nor one past its repath period).
   if(warden.supportTargetIndex===ally.idx&&Array.isArray(warden.supportPath)&&warden.supportPath.length&&navClock<(warden.supportRepathAt||0)&&Math.hypot(ally.x-(warden.supportAimX??ally.x),ally.z-(warden.supportAimZ??ally.z))<1)route=warden.supportPath;
   else {route=tactics.path(warden.x,warden.z,ally.x,ally.z,obstacles,1.55);recalculated=true;}
   if(!route.length){
    warden.supportBlocked=(warden.supportBlocked||[]).filter(f=>f.idx!==ally.idx);
    warden.supportBlocked.push({idx:ally.idx,x:ally.x,z:ally.z,wx:warden.x,wz:warden.z,until:navClock+BLOCKED_RETRY});
    continue;
   }
   while(route.length&&Math.hypot(route[0].x-warden.x,route[0].z-warden.z)<.7)route.shift();
   if(!route.length)continue;
  }
  const target=flank?route[0]:ally,vx=target.x-warden.x,vz=target.z-warden.z,mag=Math.hypot(vx,vz);
  if(mag<.03)continue;
  warden.supportFlank=flank;warden.supportActive=true;warden.supportTargetIndex=ally.idx;
  warden.supportPath=flank?route:[];
  if(recalculated){warden.supportRepathAt=navClock+UPDATE_PERIOD;warden.supportAimX=ally.x;warden.supportAimZ=ally.z;}
  return {mx:vx/mag,mz:vz/mag,target:ally,dist};
 }
 clear(warden);return null;
}
function render(engine,actors,low=false,calm=false,clock=0){
 if(!engine||!Array.isArray(actors))return 0;
 let draws=0;
 for(const warden of actors){
  if(!valid(warden)||warden.type!=='warden'||!warden.supportActive)continue;
  const ally=actors.find(e=>e.idx===warden.supportTargetIndex&&valid(e));
  if(!ally)continue;
  const dx=ally.x-warden.x,dz=ally.z-warden.z,dist=Math.hypot(dx,dz);
  if(dist>=SEARCH_RADIUS||(dist<=REFORM_AT&&!warden.supportFlank))continue;
  const p=calm?0:Math.sin(clock*5)*.12;
  // Amber signal is distinct from the cyan *active* overguard beam.
  engine.cube(warden.x,3.35+p,warden.z,1.9,.16,1.9,'#fbbf24',0,.5);draws++;
  if(!low){engine.cube(warden.x,2.9,warden.z,.18,.5,.18,'#fde68a',0,.6);draws++;}
  // Distinct forward-facing amber bar means *blocked support line*, not shield.
  if(warden.supportFlank){engine.cube(warden.x,3.63+p,warden.z,.22,.1,1.65,'#fb923c',warden.yaw||0,.55);draws++;}
 }
 return draws;
}
const api=Object.freeze({SEARCH_RADIUS,LINK_RANGE,REFORM_AT,UPDATE_PERIOD,BLOCKED_RETRY,select,steer,render});
root.AegisWardenSupport=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
