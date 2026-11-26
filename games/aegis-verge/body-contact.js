/* Architect Industries / Aegis Verge: first-party, bounded swept chassis contacts.
 * Resolves solid living vehicle silhouettes in the arena XZ plane; the existing
 * terrain/cover collision remains authoritative. No damage, points or resources.
 * Browser + CommonJS, no package/runtime dependencies. MIT compatible.
 */
(function(root){
'use strict';
const PLAYER_RADIUS=1.15, EPS=.003;
function valid(p){return !!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);}
function circleTime(a,b,o,r){
 const dx=b.x-a.x,dz=b.z-a.z,ox=a.x-o.x,oz=a.z-o.z;
 const A=dx*dx+dz*dz,C=ox*ox+oz*oz-r*r;
 if(C<0)return 0;
 if(A<1e-12)return null;
 const B=2*(ox*dx+oz*dz),D=B*B-4*A*C;
 if(D<0)return null;
 const t=(-B-Math.sqrt(D))/(2*A);
 return t>=0&&t<=1?t:null;
}
function enemyRadius(e,sizes){
 const size=Number.isFinite(e?.size)&&e.size>0?e.size:sizes?.[e?.type]?.size;
 return Number.isFinite(size)&&size>0?size*.65:0;
}
function clip(body,from,others,radius,cover,free,sizes=null){
 if(!valid(body)||!valid(from)||!Number.isFinite(radius)||radius<=0||!Array.isArray(others))return {hit:false};
 const obstacles=others.filter(o=>o&&!o.dead&&o.hp>0&&valid(o)&&enemyRadius(o,sizes)>0);
 let start={x:from.x,z:from.z},end={x:body.x,z:body.z},hit=false,obstacle=null;
 if(!obstacles.length)return {hit:false};
 // The game already moves in <=1/60s physics steps. Two passes permit gentle
 // tangential sliding but cannot bypass a second body or physical cover.
 for(let pass=0;pass<3;pass++){
  let closest=null,first=Infinity;
  for(const o of obstacles){
   const sum=radius+enemyRadius(o,sizes),dist=Math.hypot(start.x-o.x,start.z-o.z);
   if(dist<sum-EPS){
    // Recover from pre-existing overlaps only by moving outward; never trap
    // a respawning actor in an overlap or invent a teleport.
    const away=(end.x-start.x)*(start.x-o.x)+(end.z-start.z)*(start.z-o.z);
    if(away>EPS && Math.hypot(end.x-o.x,end.z-o.z)>dist+EPS)continue;
    if(0<first){first=0;closest=o;}continue;
   }
   const t=circleTime(start,end,o,sum);
   if(t===null)continue;
   if(t<EPS && (end.x-start.x)*(start.x-o.x)+(end.z-start.z)*(start.z-o.z)>=-EPS)continue;
   if(t<first){first=t;closest=o;}
  }
  if(!closest)break;
  hit=true;obstacle=closest;
  const t=Math.max(0,first-EPS),at={x:start.x+(end.x-start.x)*t,z:start.z+(end.z-start.z)*t};
  const dist=Math.hypot(at.x-closest.x,at.z-closest.z)||1;
  const nx=(at.x-closest.x)/dist,nz=(at.z-closest.z)/dist;
  let rx=end.x-at.x,rz=end.z-at.z;
  const inward=rx*nx+rz*nz;
  if(inward<0){rx-=inward*nx;rz-=inward*nz;}
  const slide={x:at.x+rx,z:at.z+rz};
  const allow=typeof free!=='function'||free(slide.x,slide.z,cover,radius);
  start=at;
  // Only accept a slide if it stays out of the colliding body and cover.
  end=allow&&Math.hypot(slide.x-closest.x,slide.z-closest.z)>=radius+enemyRadius(closest,sizes)-EPS?slide:at;
  if(Math.hypot(end.x-start.x,end.z-start.z)<EPS)break;
 }
 // A possible third obstruction must not permit tunneling past it.
 for(const o of obstacles){const sum=radius+enemyRadius(o,sizes);
  if(Math.hypot(end.x-o.x,end.z-o.z)<sum-EPS){end=start;break;}
 }
 if(typeof free==='function'&&!free(end.x,end.z,cover,radius))end=start;
 body.x=end.x;body.z=end.z;
 return {hit,obstacle};
}
function render(engine,player,seconds,low=false,calm=false){
 if(!engine||!valid(player)||seconds<=0)return 0;
 const count=low||calm?4:8;
 for(let i=0;i<count;i++){
  const a=i*Math.PI*2/count,r=PLAYER_RADIUS+1.22;
  engine.cube(player.x+Math.sin(a)*r,.16,player.z+Math.cos(a)*r,.34,.10,.55,'#fbbf24',a,calm?.55:Math.min(.95,seconds*2));
 }
 return count;
}
const api=Object.freeze({PLAYER_RADIUS,EPS,circleTime,enemyRadius,clip,render});
root.AegisBodyContact=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
