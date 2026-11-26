/* Architect Industries — Aegis Verge F3D41: Skyburst Counterpulse.
 * Pure live-shell 3D position and line-of-sight pulse neutralization.
 * The pulse never creates a blast, awards score, or skips cover collision.
 * Original first-party code; no new runtime dependencies.
 */
(function(root){
'use strict';
const HEIGHT=1.4,ARC=44,PULSE_Y=1.1;
const finite=p=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
function position(shell){
 if(!finite(shell)||!Number.isFinite(shell.fromX)||!Number.isFinite(shell.fromZ)||
    !Number.isFinite(shell.left)||!Number.isFinite(shell.total)||shell.total<=0||
    shell.left<=0||shell.left>shell.total)return null;
 const progress=1-shell.left/shell.total;
 return {x:shell.fromX+(shell.x-shell.fromX)*progress,
         z:shell.fromZ+(shell.z-shell.fromZ)*progress,
         y:HEIGHT+ARC*progress*(1-progress),progress};
}
function intercept(shells,actor,cover,firstCover,radius,elevatedBlocked){
 if(!Array.isArray(shells)||!finite(actor)||!Array.isArray(cover)||
    typeof firstCover!=='function'||!Number.isFinite(radius)||radius<=0)return [];
 const neutralized=[];
 for(let i=shells.length-1;i>=0;i--){
  const pos=position(shells[i]);if(!pos)continue;
  if(Math.hypot(pos.x-actor.x,pos.z-actor.z,pos.y-PULSE_Y)>radius)continue;
  // Cannot reach through existing solid battlefield cover even if the
  // airborne geometry's ground projection is otherwise inside the radius.
  if(typeof elevatedBlocked==='function'
    ? elevatedBlocked({x:actor.x,y:PULSE_Y,z:actor.z},pos,cover,.08)
    : firstCover(actor.x,actor.z,pos.x,pos.z,cover,.08))continue;
  shells.splice(i,1);neutralized.push(pos);
 }
 return neutralized;
}
function emit(bursts,points,actor){if(!Array.isArray(bursts)||!Array.isArray(points))return;
 for(const p of points){if(!finite(p)||!Number.isFinite(p.y))continue;
  bursts.push({x:p.x,z:p.z,y:p.y,left:.42,
   from:finite(actor)?{x:actor.x,y:PULSE_Y,z:actor.z}:null});
 }
 if(bursts.length>6)bursts.splice(0,bursts.length-6);
}
function tick(bursts,dt){if(!Array.isArray(bursts)||!Number.isFinite(dt)||dt<=0)return;
 for(const burst of bursts)burst.left-=dt;
 for(let i=bursts.length-1;i>=0;i--)if(bursts[i].left<=0)bursts.splice(i,1);
}
function render(engine,bursts,low,calm){if(!engine||!Array.isArray(bursts))return;
 const sides=low||calm?4:8;
 for(const b of bursts){const radius=1.1+(1-b.left/.42)*2.1;
  for(let j=0;j<sides;j++){const a=2*Math.PI*j/sides;
   engine.cube(b.x+Math.sin(a)*radius,b.y,b.z+Math.cos(a)*radius,.35,.2,.35,'#86efac',a,.72);
  }
  engine.cube(b.x,b.y,b.z,.48,.48,.48,'#e0ffe3',0,.9);
  // Physically grounded counter arc: world-space sparks connect pulse origin
  // to the actual intercepted shell position, never to an invented target.
  if(b.from){const segments=calm||low?2:5;
   for(let i=1;i<=segments;i++){const t=i/(segments+1),fade=b.left/.42;
    engine.cube(b.from.x+(b.x-b.from.x)*t,b.from.y+(b.y-b.from.y)*t,
      b.from.z+(b.z-b.from.z)*t,.17*fade,.24*fade,.17*fade,'#bbf7d0',0,.85);
   }
  }
 }
}
const api=Object.freeze({HEIGHT,ARC,PULSE_Y,position,intercept,emit,tick,render});
root.AegisSkyburstCounterpulse=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
