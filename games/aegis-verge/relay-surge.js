/* Architect Industries original relay security surge.
 * Deterministic, renderer-agnostic finite state machine; no imported code/assets.
 * Distances are measured in the shared cover/collision world units.
 */
(function(root){
'use strict';
const START_DELAY=.8, WARNING=1.2, RECOVER=3.8, RADIUS=5.4, DAMAGE=18;
function create(){return{phase:'idle',remaining:START_DELAY,cycles:0,interrupted:0,last:'none'};}
function step(s,dt){
 if(!s||!Number.isFinite(dt)||dt<0)return null;
 let left=Math.min(.25,dt),event=null;
 while(left>1e-9){
  if(s.remaining>left){s.remaining-=left;break;}
  left-=Math.max(0,s.remaining);
  if(s.phase==='idle'||s.phase==='cooldown'){
   s.phase='warning';s.remaining=WARNING;s.last='warning';event='warning';
  }else{
   s.phase='cooldown';s.remaining=RECOVER;s.cycles++;s.last='strike';event='strike';
  }
 }
 return event;
}
function jam(s){if(!s||s.phase!=='warning')return false;s.phase='cooldown';s.remaining=RECOVER;s.interrupted++;s.last='jam';return true;}
function progress(s){return s?.phase==='warning'?Math.max(0,Math.min(1,1-s.remaining/WARNING)):0;}
const api=Object.freeze({create,step,jam,progress,START_DELAY,WARNING,RECOVER,RADIUS,DAMAGE});
root.AegisRelaySurge=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
