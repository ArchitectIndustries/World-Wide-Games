/* Architect Industries — Aegis Verge F3D27 Threat Fan.
 * Original, deterministic hostile volley footprint shared with actual firing.
 * Cover clips EVERY lane; no auto-dodge, scoring, collision or imported assets.
 */
(function(root){
'use strict';
const VOLLEYS=Object.freeze({
 skirmisher:Object.freeze({speed:12,offsets:Object.freeze([0])}),
 lancer:Object.freeze({speed:20,offsets:Object.freeze([0])}),
 bulwark:Object.freeze({speed:12,offsets:Object.freeze([-.14,0,.14])}),
 warden:Object.freeze({speed:15,offsets:Object.freeze([-.1,0,.1])})
});
// Preview and actual bolts share flight budget and collision padding.
const PROJECTILE_LIFE=2.8, COVER_PADDING=.12, PLAYER_RADIUS=1.35;
const MAX_DISTANCE=Math.max(...Object.values(VOLLEYS).map(v=>v.speed))*PROJECTILE_LIFE;
function pattern(type){return VOLLEYS[type]||VOLLEYS.skirmisher;}
function lanes(enemy,cover,firstCover){
 if(!enemy||enemy.state!=='windup'||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z)||
    !Number.isFinite(enemy.aimX)||!Number.isFinite(enemy.aimZ))return [];
 const p=pattern(enemy.type),angle=Math.atan2(enemy.aimX-enemy.x,enemy.aimZ-enemy.z),
       length=p.speed*PROJECTILE_LIFE,result=[];
 for(const offset of p.offsets){
  const a=angle+offset,ex=enemy.x+Math.sin(a)*length,ez=enemy.z+Math.cos(a)*length;
  const hit=typeof firstCover==='function'?firstCover(enemy.x,enemy.z,ex,ez,cover,COVER_PADDING):null;
  const end=hit?{x:hit.x,z:hit.z}:{x:ex,z:ez};
  result.push({x:enemy.x,z:enemy.z,endX:end.x,endZ:end.z,angle:a,
   offset,speed:p.speed,blocked:!!hit,length:Math.hypot(end.x-enemy.x,end.z-enemy.z)});
 }
 return result;
}
// Snapshot of the current player's real collision circle, not a prediction
// of actor motion or interception. A wall wins a simultaneous contact.
function dangerAt(enemy,lines,player,segmentCircle){
 if(!enemy||enemy.dead||enemy.siegeTarget||enemy.state!=='windup'||!player||
    ![player.x,player.z,enemy.windup].every(Number.isFinite)||typeof segmentCircle!=='function')return null;
 let best=null,count=0;
 for(const l of lines){
  if(l.length<=0)continue;
  const t=segmentCircle(l.x,l.z,l.endX,l.endZ,player.x,player.z,PLAYER_RADIUS);
  if(t===null||!Number.isFinite(t)||(l.blocked&&t>=1-1e-9))continue;
  count++;const arrival=Math.max(0,enemy.windup)+l.length*t/l.speed;
  if(!best||arrival<best.arrival)best={type:enemy.type,arrival};
 }
 return best?{...best,count}:null;
}
function dangerLabel(threat){return threat?`POTENTIAL ${String(threat.type).toUpperCase()} VOLLEY / CURRENT POSITION IN ${threat.count===1?'A FIRING LANE':threat.count+' FIRING LANES'} / MOVE OR TAKE COVER`:'';}
function render(engine,enemy,cover,firstCover,low=false,calm=false,lines=lanes(enemy,cover,firstCover)){if(!engine||!lines.length)return 0;
 const progress=Number.isFinite(enemy.windupTotal)&&enemy.windupTotal>0?
  Math.max(0,Math.min(1,1-enemy.windup/enemy.windupTotal)):0;
 let count=0;
 for(const l of lines){
  if(l.length<.1)continue;
  const center=Math.abs(l.offset)<.001;
  const width=center?.14:.10,color=center?'#ffd18b':'#ff986c';
  engine.cube((l.x+l.endX)/2,.11,(l.z+l.endZ)/2,width,.065,l.length,color,l.angle,.55+progress*.35);count++;
  // Small perpendicular endpoint ticks show the actual individual firing lanes;
  // the warning is shape-readable without color or flashing animations.
  if(!low||!center){engine.cube(l.endX,.12,l.endZ,center?1.5:1.05,.08,.14,color,l.angle,.75);count++;}
 }
 if(!low){engine.cube(enemy.x,2.1,enemy.z,.3+Math.max(0,enemy.windup),.3,.3+Math.max(0,enemy.windup),'#ffcf7a',enemy.yaw,1);count++;}
 return count;
}
const api=Object.freeze({VOLLEYS,MAX_DISTANCE,PROJECTILE_LIFE,COVER_PADDING,PLAYER_RADIUS,pattern,lanes,dangerAt,dangerLabel,render});
root.AegisHostileTelegraphs=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
