/* Architect Industries — Aegis Verge Skyburst: first-party Warden telegraphed siege artillery.
 * A fixed, announced world-space target; independent projectile flight; actual cover occlusion.
 * Decorative arc is never a collider. No external assets or runtime dependencies.
 */
(function(root){
'use strict';
const RADIUS=4.2,FLIGHT=0.85,DAMAGE=12,HOSTILE_DAMAGE=2,MAX_ACTIVE=8;
const valid=p=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
function chosen(enemy){return !!enemy&&enemy.type==='warden'&&Number.isSafeInteger(enemy.cycles)&&enemy.cycles%3===2;}
function target(actor){if(!valid(actor))return null;return Object.freeze({x:Math.max(-36,Math.min(36,actor.x)),z:Math.max(-36,Math.min(36,actor.z))});}
function launch(list,enemy,mark){if(!Array.isArray(list)||!valid(enemy)||!valid(mark)||list.length>=MAX_ACTIVE)return null;
 const shell={fromX:enemy.x,fromZ:enemy.z,casterIdx:Number.isSafeInteger(enemy.idx)?enemy.idx:null,x:mark.x,z:mark.z,left:FLIGHT,total:FLIGHT};list.push(shell);return shell;
}
function protectedByCover(shell,player,blocks,firstCover){return !!firstCover(shell.x,shell.z,player.x,player.z,blocks,.08);}
function resolve(shell,player,blocks,firstCover){const d=Math.hypot(player.x-shell.x,player.z-shell.z);return{inRange:d<=RADIUS,blocked:d<=RADIUS&&protectedByCover(shell,player,blocks,firstCover),distance:d};}
// An enemy may be caught by another Warden's *actual* timed impact. Cover
// occludes each individual unit. The firing Warden cannot damage itself.
// Caller applies HP/death authority without credit, drops or bonus score.
function splashHostiles(shell,enemies,blocks,firstCover){
 if(!valid(shell)||!Array.isArray(enemies)||typeof firstCover!=='function')return [];
 const hit=[];
 for(const enemy of enemies){
  if(!valid(enemy)||enemy.dead||shell.casterIdx!==null&&Number.isSafeInteger(enemy.idx)&&shell.casterIdx===enemy.idx)continue;
  const distance=Math.hypot(enemy.x-shell.x,enemy.z-shell.z);
  if(distance>RADIUS||firstCover(shell.x,shell.z,enemy.x,enemy.z,blocks,.08))continue;
  hit.push({enemy,distance});
 }
 return hit;
}
function step(list,dt,player,blocks,firstCover,onBlast){if(!Number.isFinite(dt)||dt<=0)return[];
 const outcomes=[];
 for(let i=list.length-1;i>=0;i--){const shell=list[i];shell.left=Math.max(0,shell.left-dt);
  if(shell.left<=0){const collision=resolve(shell,player,blocks,firstCover),outcome={...collision,x:shell.x,z:shell.z,casterIdx:shell.casterIdx,hit:collision.inRange&&!collision.blocked};list.splice(i,1);outcomes.push(outcome);if(onBlast)onBlast(outcome);}
 }
 return outcomes;
}
function marker(engine,x,z,low,calm,progress=0){if(!Number.isFinite(x)||!Number.isFinite(z))return;
 const n=(low||calm)?8:14;const color=progress>0.66?'#f87171':'#fbbf24';
 for(let i=0;i<n;i++){const a=(i+.5)*2*Math.PI/n,ring=RADIUS*(.96-.08*progress);
  engine.cube(x+Math.sin(a)*ring,.12,z+Math.cos(a)*ring,.24,.11,.82,color,a,.86);
 }
 engine.cube(x,.15,z,.58,.13,.58,'#f87171',0,.7);
}
function render(engine,list,enemies,low,calm){
 for(const e of enemies)if(!e.dead&&e.state==='windup'&&e.siegeTarget){marker(engine,e.siegeTarget.x,e.siegeTarget.z,low,calm,1-e.windup/(e.windupTotal||1));}
 for(const s of list){const progress=1-s.left/s.total;marker(engine,s.x,s.z,low,calm,progress);
  const x=s.fromX+(s.x-s.fromX)*progress,z=s.fromZ+(s.z-s.fromZ)*progress;
  engine.cube(x,1.4+11*4*progress*(1-progress),z,.65,.65,.65,'#ffae65',progress*3,.95);
 }
}
const api=Object.freeze({RADIUS,FLIGHT,DAMAGE,HOSTILE_DAMAGE,MAX_ACTIVE,chosen,target,launch,protectedByCover,resolve,splashHostiles,step,marker,render});
root.AegisSiegeBarrage=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
