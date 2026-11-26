/* Architect Industries — original single-use, local signal uplink countermeasure.
 * One spire per relay. Uplink interrupts charge weapons for a limited time,
 * never grants points, never changes ranked authority, and persists only usage.
 */
(function(root){
'use strict';
const COST=30,DURATION=6,RANGE=3.6,COUNT=3;
const validUsed=a=>Array.isArray(a)&&a.length===COUNT&&[0,1,2].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&typeof a[i]==='boolean');
function create(sites,used){
 if(!Array.isArray(sites)||sites.length!==COUNT||!sites.every(q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.z)))throw Error('invalid signal sites');
 if(used!==undefined&&!validUsed(used))throw Error('invalid uplink snapshot');
 return {sites:sites.map(q=>Object.freeze({x:q.x,z:q.z})),used:used?[...used]:[false,false,false],jamLeft:0};
}
function near(s,relay,x,z){return !!(s&&Number.isSafeInteger(relay)&&relay>=0&&relay<COUNT&&Math.hypot(s.sites[relay].x-x,s.sites[relay].z-z)<=RANGE);}
function ready(s,relay,x,z,energy,hasHostiles){return near(s,relay,x,z)&&!s.used[relay]&&energy>=COST&&hasHostiles;}
function activate(s,relay,x,z,energy,hasHostiles){if(!ready(s,relay,x,z,energy,hasHostiles))return false;s.used[relay]=true;s.jamLeft=DURATION;return true;}
function tick(s,dt){if(!s||!Number.isFinite(dt)||dt<0)return 0;s.jamLeft=Math.max(0,s.jamLeft-dt);return s.jamLeft;}
function snapshot(s){return [...s.used];}
// Presentation only: actual activation remains the ready/activate predicate.
function observe(s,relay,player,hasHostiles,playing){
 if(!s||!playing||relay<0||relay>=COUNT)return {mode:'inactive'};
 if(s.jamLeft>0)return {mode:'jam',seconds:s.jamLeft};
 if(s.used[relay])return {mode:'spent'};
 if(!hasHostiles)return {mode:'clear'};
 const q=s.sites[relay],distance=Math.hypot(q.x-player.x,q.z-player.z);
 if(!near(s,relay,player.x,player.z))return {mode:'approach',distance};
 return {mode:ready(s,relay,player.x,player.z,player.energy,hasHostiles)?'ready':'energy'};
}
function label(v){switch(v.mode){case 'jam':return v.seconds.toFixed(1)+'s';case 'spent':return 'SPENT';case 'clear':return 'CLEAR';case 'ready':return 'READY';case 'energy':return COST+' ENERGY';case 'approach':return Math.ceil(Math.max(0,v.distance-RANGE))+'m TO EDGE';default:return 'STANDBY';}}
function announcement(v){return ({jam:'Signal jam active. Hostile charge weapons disabled.',spent:'Current signal spire spent.',clear:'No hostiles remain. Signal spire unavailable.',ready:'Signal spire ready. Activate with F, left bumper or Uplink. Costs 30 energy.',energy:'Signal spire in range. Requires 30 energy.',approach:'Approach the marked signal spire perimeter.',inactive:''})[v.mode];}
function render(engine,s,i,relay,view,low,calm){
 const q=s.sites[i],spent=s.used[i],current=i===relay,lit=current&&!spent;
 const mode=current?view.mode:'inactive',jam=current&&mode==='jam',readyNow=mode==='ready';
 const col=jam?'#c4b5fd':spent?'#475569':readyNow?'#99f6e4':mode==='energy'?'#fbbf24':lit?'#22d3ee':'#385575';
 // Original faceted power pedestal and raised paired antenna forks. Fixed
 // mesh dimensions allow shared cache across all nine sites in the campaign.
 engine.faceted('hull',q.x,.16,q.z,2,.30,2,'#153647',0,0);
 engine.cube(q.x,.76,q.z,.65,.90,.65,'#314b5d');
 for(const side of [-1,1])engine.cube(q.x+side*.55,1.66,q.z,.20,2.20,.46,'#526d7b');
 engine.faceted('relay',q.x,spent&&!jam?1.22:2.05,q.z,.72,1.15,.72,col,0,jam||lit?.8:.08);
 if(!low){for(const side of [-1,1])engine.cube(q.x+side*.55,2.85,q.z,.26,.22,.54,col,0,lit||jam?.7:.08);}
 // Sparse tangential markers lie at the real interaction radius. Only the
 // current usable site draws a ring; calm mode keeps static eight markers.
 if(current&&['ready','approach','energy'].includes(mode)){
  const n=low||calm?8:16;
  for(let k=0;k<n;k++){const a=k*Math.PI*2/n;engine.cube(q.x+Math.sin(a)*RANGE,.10,q.z+Math.cos(a)*RANGE,.60,.08,.13,col,a,.55);}
 }
}
const api=Object.freeze({COST,DURATION,RANGE,COUNT,validUsed,create,near,ready,activate,tick,snapshot,observe,label,announcement,render});
root.AegisSignalUplink=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
