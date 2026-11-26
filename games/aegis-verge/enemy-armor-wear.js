/* Architect Industries - Aegis Verge F3D67 enemy battle-wear kit.
 * Original first-party local-space geometry. Visual state is a pure projection
 * of authoritative hostile HP. Neither collision, DPS, AI, rewards nor saving
 * is modified. No random/wall-clock state; device tiers are draw bounded.
 */
(function(root){
'use strict';
const PARTS=Object.freeze({
 skirmisher:['swept-fin','thruster'],
 lancer:['prong','capacitor'],
 bulwark:['shield-shoulder','rear-strut'],
 warden:['arm','antenna']
});
const COLORS=Object.freeze({skirmisher:'#75d5ee',lancer:'#f4c96f',bulwark:'#db8a7a',warden:'#ab9de7'});
function stage(e){
 if(!e||!Number.isFinite(e.hp)||!Number.isFinite(e.max)||e.max<=0||e.hp<=0||e.dead)return 0;
 const fraction=Math.min(1,Math.max(0,e.hp/e.max));
 return fraction>.75?0:fraction>.5?1:fraction>.25?2:3;
}
function decorate(geometry,e,quality='full',calm=false){
 if(!Array.isArray(geometry)||!e)return geometry;
 const wear=stage(e),type=Object.prototype.hasOwnProperty.call(PARTS,e.type)?e.type:'skirmisher';
 if(!wear)return geometry;
 const size=Math.max(.8,Math.min(3,Number(e.size)||1.4));
 const [outer,inner]=PARTS[type];
 // Remove a visible armor plate on the right only after genuine HP falls.
 // Retain the base keel/core, and keep the original physical hitbox intact.
 let removedOuter=false,removedInner=false;
 for(let i=geometry.length-1;i>=0;i--){
  const p=geometry[i];
  if(wear>=2&&!removedOuter&&p.name===outer&&p.r>0){geometry.splice(i,1);removedOuter=true;continue;}
  if(wear>=3&&!removedInner&&p.name===inner&&p.r<0){geometry.splice(i,1);removedInner=true;}
 }
 const p=(name,r,y,f,w,h,d,color,em)=>geometry.push({name,r:r*size,y:y*size,f:f*size,w:w*size,h:h*size,d:d*size,color,em});
 // These replace missing plating with readable, asymmetric internals.
 // Calm mode retains static damage communication without flashing or loops.
 p('scored-armor',.38,.89,.24,.45,.055,.35,'#312f39',0);
 if(wear>=2){
  p('exposed-conduit',.57,.94,.12,.11,.24,.57,e.weakpointFlash>0?'#ffe8a2':COLORS[type],e.weakpointFlash>0?1:calm?.35:.68);
  if(e.weakpointFlash>0&&quality!=='lite')p('breach-spark',.70,1.07,.05,.16,.17,.22,'#ffd18b',1);
  p('broken-bracket',.79,.70,-.28,.25,.13,.42,'#986b59',.08);
 }
 if(wear>=3){
  // Retain one prominent core breach even on software/mobile tiers.
  p('reactor-breach',-.32,1.07,.15,.30,.18,.36,'#ffcf77',calm?.55:.95);
  if(quality!=='lite')p('fractured-spine',0,1.19,-.38,.13,.37,.37,'#876168',.08);
 }
 return geometry;
}
const api=Object.freeze({stage,decorate,PARTS,COLORS});
root.AegisEnemyArmorWear=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
