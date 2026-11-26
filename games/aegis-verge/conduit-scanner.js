/* Architect Industries | Aegis Verge F3D69 | Exposed Conduit Tactical Scanner.
 * Player-side observation only: no enemy AI, ballistics, damage, score or physics changes.
 * The indicator follows actual enemy HP and sightline, and never exposes enemies through cover.
 * Original first-party MIT-compatible implementation; no runtime dependencies.
 */
(function(root){
'use strict';
const TYPES=Object.freeze(['skirmisher','lancer','bulwark']);
const RANGE=27;
function observe(player,enemies,cover,firstCover,range=RANGE,sizes=null){
 if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Array.isArray(enemies)||typeof firstCover!=='function')return null;
 let selected=null;
 for(const e of enemies){
  if(!e||e.dead||!TYPES.includes(e.type)||!Number.isFinite(e.hp)||!Number.isFinite(e.max)||e.max<=0||e.hp<=0||e.hp/e.max>.5||
     !Number.isFinite(e.x)||!Number.isFinite(e.z)||!Number.isFinite(e.yaw))continue;
  const distance=Math.hypot(player.x-e.x,player.z-e.z);
  if(distance>range||distance<.01)continue;
  // Respect the same solid-cover precedence used by the live cannon.
  if(firstCover(player.x,player.z,e.x,e.z,cover,.08))continue;
  const rx=Math.cos(e.yaw),rz=-Math.sin(e.yaw);
  const typeSize=sizes?.[e.type]?.size;
  const size=Number.isFinite(e.size)&&e.size>0?e.size:Number.isFinite(typeSize)&&typeSize>0?typeSize:1.4;
  const right=(player.x-e.x)*rx+(player.z-e.z)*rz;
  const ready=right>=size*.5;
  if(!selected||distance<selected.distance)selected={enemy:e,rx,rz,size,distance,ready};
 }
 return selected;
}
function cue(target){if(!target)return '';
 return target.ready?'RIGHT CONDUIT IN VIEW · '+target.enemy.type.toUpperCase()+' · '+Math.round(target.distance)+'m · shoot inward from the right (+1 damage)':'CONDUIT EXPOSED · '+target.enemy.type.toUpperCase()+' · move toward its RIGHT flank for +1 cannon damage';
}
function render(engine,target,elapsed=0,low=false,calm=false){
 if(!engine||!target||!target.ready)return 0;
 const e=target.enemy,rx=target.rx,rz=target.rz,a=e.yaw;
 const x=e.x+rx*target.size*.62,z=e.z+rz*target.size*.62;
 // Clamp emissions and draw count. All geometry is anchored to the actual HP-exposed plate.
 const pulse=calm?0:Math.sin(elapsed*5)*.08;
 engine.cube(x,1.98+pulse,z,.20,.24,.20,'#fcd34d',a,.75);
 engine.cube(x,2.27+pulse,z,.49,.09,.20,'#fbbf24',a,.78);
 if(low)return 2;
 engine.cube(x+rx*.35,1.29,z+rz*.35,.10,.73,.13,'#fde68a',a,.68);
 engine.cube(x-rx*.35,1.29,z-rz*.35,.10,.73,.13,'#fde68a',a,.68);
 return 4;
}
const api=Object.freeze({TYPES,RANGE,observe,cue,render});
root.AegisConduitScanner=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
