/* Architect Industries — original bounded relay checkpoint schema.
 * Persist only a cleared-relay boundary, never mutable projectiles or ranked eligibility.
 * Browser localStorage is player-editable and is NOT a score trust boundary.
 */
(function(root){
'use strict';
const KEY='wwg:aegis-verge:relay-checkpoint-v1',VERSION=1;
// Additive v1 schema extension. Older checkpoints with no cover record restore intact cover.
const DEFAULT_COVER=Object.freeze([5,5,5]);
const DEFAULT_UPLINKS=Object.freeze([false,false,false]);
const DEFAULT_MINES=Object.freeze([2,2,2]);
const DEFAULT_CACHES=Object.freeze([false,false,false]);
// Optional F3D51 practice-course snapshot; old v1 saves remain loadable.
const DEFAULT_CAPACITORS=Object.freeze([2,2]);
const DEFAULT_PHASE_RESOLVED=Object.freeze([false,false]);
const validCapacitors=a=>Array.isArray(a)&&a.length===2&&[0,1].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&integer(a[i],0,2));
const validPhase=a=>Array.isArray(a)&&a.length===2&&[0,1].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&typeof a[i]==='boolean');
function validTrial(t,progress,elapsed){
 if(t===null)return true;
 if(!t||typeof t!=='object'||Array.isArray(t)||!Number.isFinite(t.startedAt)||t.startedAt<0||t.startedAt>elapsed||!Array.isArray(t.splits)||t.splits.length!==progress||progress<1||progress>4)return false;
 if(t.splits[0]!==0||typeof t.complete!=='boolean'||t.complete!==(progress===4))return false;
 let last=0;
 for(let i=1;i<t.splits.length;i++){
  const n=t.splits[i];
  if(!Number.isFinite(n)||n<=last||n>3600||n>elapsed-t.startedAt+.001)return false;
  last=n;
 }
 return true;
}
const validMines=a=>Array.isArray(a)&&a.length===3&&DEFAULT_MINES.every((_,i)=>Object.prototype.hasOwnProperty.call(a,i)&&Number.isSafeInteger(a[i])&&a[i]>=0&&a[i]<=2);
const validUplinks=a=>Array.isArray(a)&&a.length===3&&DEFAULT_UPLINKS.every((_,i)=>Object.prototype.hasOwnProperty.call(a,i)&&typeof a[i]==='boolean');
const validCaches=a=>Array.isArray(a)&&a.length===3&&[0,1,2].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&typeof a[i]==='boolean');
function validCover(a){return Array.isArray(a)&&a.length===3&&DEFAULT_COVER.every((_,i)=>Object.prototype.hasOwnProperty.call(a,i)&&Number.isSafeInteger(a[i])&&a[i]>=0&&a[i]<=5);}
function integer(x,min,max){return Number.isSafeInteger(x)&&x>=min&&x<=max;}
function validate(s,unlocked=3){
 if(!s||typeof s!=='object'||Array.isArray(s)||s.version!==VERSION)return null;
 if(!integer(s.op,0,2)||!integer(s.relay,1,3)||s.op>=unlocked)return null;
 for(const [key,lo,hi] of [['hull',1,100],['energy',0,100],['score',0,1000000],['recoveriesLeft',0,1],['elapsed',0,7200],['damageTaken',0,10000]])
  if(!Number.isFinite(s[key])||s[key]<lo||s[key]>hi)return null;
 if(typeof s.clean!=='boolean'||!integer(s.savedAt,1,8640000000000000))return null;
 if(s.barrierHp!==undefined&&!validCover(s.barrierHp))return null;
 if(s.uplinkUsed!==undefined&&!validUplinks(s.uplinkUsed))return null;
 if(s.mineHp!==undefined&&!validMines(s.mineHp))return null;
 if(s.cacheUsed!==undefined&&!validCaches(s.cacheUsed))return null;
 if(s.circuitProgress!==undefined&&!integer(s.circuitProgress,0,4))return null;
 if(s.circuitAwarded!==undefined&&typeof s.circuitAwarded!=='boolean')return null;
 if(s.circuitAwarded===true&&s.circuitProgress!==4)return null;
 if(s.circuitProgress===4&&s.circuitAwarded!==true)return null;
 const progress=s.circuitProgress??0;
 if(s.capacitorHp!==undefined&&!validCapacitors(s.capacitorHp))return null;
 if(s.phaseResolved!==undefined&&!validPhase(s.phaseResolved))return null;
 if(s.phaseHits!==undefined&&!integer(s.phaseHits,0,2))return null;
 if(s.phaseGuards!==undefined&&!integer(s.phaseGuards,0,2))return null;
 if(s.trialState!==undefined&&!validTrial(s.trialState,progress,s.elapsed))return null;
 const cap=s.capacitorHp??DEFAULT_CAPACITORS, resolved=s.phaseResolved??DEFAULT_PHASE_RESOLVED;
 if(cap[0]<2&&progress<1||cap[1]<2&&progress<3)return null;
 if(resolved[0]&&progress<1||resolved[1]&&progress<3)return null;
 if((s.phaseHits??0)+(s.phaseGuards??0)>resolved.filter(Boolean).length)return null;
 const barrierHp=(s.barrierHp===undefined?DEFAULT_COVER:s.barrierHp).slice(),uplinkUsed=(s.uplinkUsed===undefined?DEFAULT_UPLINKS:s.uplinkUsed).slice(),mineHp=(s.mineHp===undefined?DEFAULT_MINES:s.mineHp).slice(),cacheUsed=(s.cacheUsed===undefined?DEFAULT_CACHES:s.cacheUsed).slice();
 return {version:VERSION,op:s.op,relay:s.relay,hull:s.hull,energy:s.energy,score:s.score,
  recoveriesLeft:s.recoveriesLeft,elapsed:s.elapsed,damageTaken:s.damageTaken,clean:s.clean,barrierHp,uplinkUsed,mineHp,cacheUsed,circuitProgress:s.circuitProgress??0,circuitAwarded:s.circuitAwarded===true,
  capacitorHp:[...cap],phaseResolved:[...resolved],phaseHits:s.phaseHits??0,phaseGuards:s.phaseGuards??0,
  trialState:s.trialState===undefined||s.trialState===null?null:{startedAt:s.trialState.startedAt,splits:[...s.trialState.splits],complete:s.trialState.complete},
  savedAt:s.savedAt};
}
function load(store,unlocked=3){
 try{const raw=store.getItem(KEY);if(!raw)return null;return validate(JSON.parse(raw),unlocked);}catch{return null;}
}
function save(store,state){
 const snapshot=validate({...state,version:VERSION,savedAt:Date.now()},3);
 if(!snapshot)return false;
 try{const raw=JSON.stringify(snapshot);store.setItem(KEY,raw);return store.getItem(KEY)===raw;}catch{return false;}
}
function clear(store){try{store.removeItem(KEY);return store.getItem(KEY)===null;}catch{return false;}}
const api=Object.freeze({KEY,VERSION,validate,load,save,clear});
root.AegisCheckpoint=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
