/* Architect Industries — Aegis Verge F3D65 Shield Fracture.
 * First-party deterministic shield absorption accounting. An exhausted
 * generator cannot block more incoming damage than its actual Aegis reserve.
 * No physics, projectiles, rewards or score are synthesized here.
 */
(function(root){
'use strict';
const FLASH=0.46;
function resolve(damage,energy,shielded){
 if(!Number.isFinite(damage)||damage<0||!Number.isFinite(energy)||energy<0)throw new RangeError('invalid impact');
 const amount=damage,available=Math.max(0,energy);
 const demand=Math.max(2,amount*.8);
 const spent=shielded&&amount>0?Math.min(available,demand):0;
 const absorbed=shielded&&amount>0?Math.min(amount,amount*spent/demand):0;
 const spill=Math.max(0,amount-absorbed);
 return Object.freeze({spent,absorbed,spill,fractured:shielded&&amount>0&&spill>1e-7,fullyBlocked:amount>0&&spill<=1e-7});
}
function shards(player,flash,low=false,calm=false){
 if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!Number.isFinite(flash)||flash<=0)return [];
 const remaining=Math.min(1,flash/FLASH),count=calm?4:low?6:10,out=[];
 for(let i=0;i<count;i++){
  const a=2*Math.PI*i/count+Math.PI/8;
  const radius=2.2+(!calm?(1-remaining)*.5:0);
  out.push({x:player.x+Math.sin(a)*radius,z:player.z+Math.cos(a)*radius,y:.62+(i%3)*.36+(calm?0:(1-remaining)*.4),
   w:.16,h:.54+(i%2)*.24,d:.23,color:'#fbbf24',yaw:a+.38,em:.25+remaining*.75});
 }
 return out;
}
function render(engine,player,flash,low=false,calm=false){
 if(!engine||typeof engine.cube!=='function')return 0;
 const list=shards(player,flash,low,calm);
 for(const p of list)engine.cube(p.x,p.y,p.z,p.w,p.h,p.d,p.color,p.yaw,p.em);
 return list.length;
}
const api=Object.freeze({FLASH,resolve,shards,render});
root.AegisShieldFracture=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
