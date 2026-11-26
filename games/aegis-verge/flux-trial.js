/* Architect Industries - Aegis Verge Flux Split Trial (F3D48).
 * First-party, optional local split timer driven exclusively by accepted physical
 * Flux Circuit gate crossings and the existing pause-safe simulation clock.
 * Never controls motion, completion, resources, competitive score or rankings.
 */
(function(root){
'use strict';
const PREFIX='wwg:aegis-verge:flux-trial-v1:op',MAX_SECONDS=3600,COUNT=4;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const validSplits=a=>Array.isArray(a)&&a.length===COUNT&&a[0]===0&&a.slice(1).every((n,i)=>finite(n)&&n>0&&n<=MAX_SECONDS&&(i===0||n>a[i]));
function key(op){return PREFIX+op;}
function read(storage,op){
 if(!Number.isInteger(op)||op<0||op>2)return null;
 try{const value=JSON.parse(storage()?.getItem(key(op))||'null');
  if(!value||value.version!==1||!validSplits(value.splits)||!finite(value.duration)||value.duration!==value.splits[COUNT-1])return null;
  return {duration:value.duration,splits:[...value.splits]};
 }catch{return null;}
}
function create(op,storage,resumed=false){return {op,startedAt:null,splits:[],complete:false,ineligible:!!resumed,best:read(storage,op),last:null,stored:false};}
function cross(state,event,elapsed,storage){
 if(!state||state.complete||!event?.crossed||!Number.isInteger(event.progress)||!finite(elapsed)||elapsed<0||elapsed>1e8)return null;
 if(event.progress!==state.splits.length+1||event.progress<1||event.progress>COUNT)return null;
 if(event.progress===1){state.startedAt=elapsed;state.splits.push(0);state.last={kind:'start',progress:1};return state.last;}
 if(!finite(state.startedAt)||elapsed<=state.startedAt)return null;
 const split=Math.round((elapsed-state.startedAt)*1000)/1000;
 if(split<=0||split>MAX_SECONDS||(state.splits.length>1&&split<=state.splits[state.splits.length-1]))return null;
 state.splits.push(split);
 const delta=state.best&&finite(state.best.splits[event.progress-1])?Math.round((split-state.best.splits[event.progress-1])*100)/100:null;
 if(event.progress<COUNT){state.last={kind:'split',progress:event.progress,time:split,delta};return state.last;}
 state.complete=true;let newBest=false,saved=false;
 if(!state.ineligible&&(!state.best||split<state.best.duration)){
  newBest=true;const record={version:1,duration:split,splits:[...state.splits]};
  try{const store=storage();store?.setItem(key(state.op),JSON.stringify(record));
   saved=store?.getItem(key(state.op))===JSON.stringify(record);
  }catch{saved=false;}
  // A blocked write must never be displayed as a persisted personal best.
  if(saved)state.best={duration:split,splits:[...state.splits]};
 }
 state.stored=saved;
 state.last={kind:'complete',progress:COUNT,time:split,delta,newBest,saved,ineligible:state.ineligible};return state.last;
}
function display(state,elapsed){
 if(!state)return 'READY';
 const pb=state.best?' · PB '+state.best.duration.toFixed(1)+'s':'';
 if(state.complete)return 'FINISH '+state.splits[3].toFixed(1)+'s'+(state.stored?' · NEW PB':state.ineligible?' · PRACTICE':'')+pb;
 if(state.startedAt===null)return 'READY · GATE 1'+pb+(state.ineligible?' · PRACTICE':'');
 const t=finite(elapsed)?Math.max(0,elapsed-state.startedAt):0;
 return 'RUN '+t.toFixed(1)+'s · '+state.splits.length+'/4'+pb+(state.ineligible?' · PRACTICE':'');
}
const api=Object.freeze({COUNT,MAX_SECONDS,create,read,cross,display,key});
root.AegisFluxTrial=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
