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
const api=Object.freeze({COST,DURATION,RANGE,COUNT,validUsed,create,near,ready,activate,tick,snapshot});
root.AegisSignalUplink=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
