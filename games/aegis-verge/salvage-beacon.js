/* Architect Industries | Aegis Verge 2.63 | Salvage Channel Beacon
 * Original time-linked 3D channel feedback. Mirrors the existing authoritative
 * field-cache timer, sightline, collision and completion state; never mutates it.
 */
(function(root){
'use strict';
const SEGMENTS=12;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function snapshot(cache,index){
 if(!cache||!Array.isArray(cache.sites)||!Number.isInteger(index)||index<0||index>=cache.sites.length)return null;
 const site=cache.sites[index];if(!site||![site.x,site.z].every(Number.isFinite))return null;
 const spent=!!cache.used?.[index],active=!spent&&cache.channel===index;
 const duration=root.AegisFieldCache?.CHANNEL;
 if(!Number.isFinite(duration)||duration<=0)return null; // fail closed if authoritative channel module is missing
 const left=active?clamp(Number.isFinite(cache.left)?cache.left:duration,0,duration):0;
 return {index,x:site.x,z:site.z,spent,active,left,ratio:active?clamp((duration-left)/duration,0,1):0};
}
function render(engine,cache,index,player,options={}){
 if(!engine||typeof engine.cube!=='function')return 0;
 const s=snapshot(cache,index);if(!s||!s.active)return 0;
 const count=options.low?8:SEGMENTS,filled=Math.floor(s.ratio*count+1e-7),calm=!!options.calm;
 let calls=0;
 for(let k=0;k<count;k++){
  const angle=k*2*Math.PI/count;
  engine.cube(s.x+Math.sin(angle)*1.85,.22,s.z+Math.cos(angle)*1.85,.48,.16,.35,k<filled?'#a7f3d0':'#176b61',angle,k<filled?.9:.24);calls++;
 }
 // Height and color encode *remaining* simulation time even when the HUD is hidden.
 engine.cube(s.x,2.26+s.ratio*.35,s.z,.32,.28+s.ratio*.7,.32,'#6ee7b7',0,.35+s.ratio*.5);calls++;
 // Physical world-space tether is strictly cosmetic and exists only while within
 // the game's already-validated channel. No extra collision, score or resources.
 if(player&&Number.isFinite(player.x)&&Number.isFinite(player.z)){
  const dx=player.x-s.x,dz=player.z-s.z,d=Math.hypot(dx,dz);
  if(d>.12&&d<=3.21){const a=Math.atan2(dx,dz),segments=calm?1:2;
   for(let j=0;j<segments;j++){const t=(j+.5)/segments;
    engine.cube(s.x+dx*t,.16,s.z+dz*t,.12,.1,d/segments*.8,'#5eead4',a,.25+s.ratio*.4);calls++;
   }
  }
 }
 return calls;
}
const api=Object.freeze({SEGMENTS,snapshot,render});
root.AegisSalvageBeacon=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
