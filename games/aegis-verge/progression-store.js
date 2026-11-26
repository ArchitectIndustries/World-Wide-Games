/* Architect Industries — original Aegis Verge progression persistence boundary.
 * Browser storage is best-effort; successful method return is not proof of write.
 * Never use client-editable progression to authorize competitive score.
 */
(function(root){
'use strict';
const DEFAULT=Object.freeze({unlocked:1,best:[0,0,0],clears:0,bestHull:0});
function bounded(v,lo,hi,fallback){return Number.isSafeInteger(v)&&v>=lo&&v<=hi?v:fallback;}
function normalize(value){
 const o=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const arr=Array.isArray(o.best)?o.best:[];
 return {unlocked:bounded(o.unlocked,1,3,1),
  best:Array.from({length:3},(_,i)=>bounded(arr[i],0,100000000,0)),
  clears:bounded(o.clears,0,1000000,0),bestHull:bounded(o.bestHull,0,100,0)};
}
// Accept a lazy storage accessor: even evaluating window.localStorage may throw.
function load(getStorage,key){
 try{const raw=getStorage().getItem(key);return normalize(raw?JSON.parse(raw):null);}catch{return normalize(null);}
}
function save(getStorage,key,data){
 try{const store=getStorage(),payload=JSON.stringify(normalize(data));
  store.setItem(key,payload);
  // Web Storage is synchronous, so an immediate exact read-back detects silent no-op writes.
  return store.getItem(key)===payload;
 }catch{return false;}
}
const api=Object.freeze({DEFAULT,normalize,load,save});
root.AegisProgressStore=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
