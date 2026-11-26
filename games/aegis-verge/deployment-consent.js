/* Architect Industries — original checkpoint-preserving launch authorization.
 * New deployments deliberately discard a valid relay; demand a second, recent
 * action against the exact same snapshot. No extra storage or network writes.
 */
(function(root){
'use strict';
const WINDOW_MS=15000,MIN_REVIEW_MS=800;
function create(){return {pending:null,expires:0,armedAt:0};}
function cancel(state){state.pending=null;state.expires=0;state.armedAt=0;}
function request(state,checkpoint,now=Date.now(),clickCount=0){
 if(!state||!Number.isFinite(now))return 'blocked';
 if(!checkpoint){cancel(state);return 'deploy';}
 const fingerprint=JSON.stringify(checkpoint);
 if(state.pending===fingerprint&&now<=state.expires){
  // One browser double-click emits TWO click events before the player can read
  // the warning. A second distinct, later activation must be intentional.
  if(now-state.armedAt<MIN_REVIEW_MS||clickCount>=2)return 'wait';
  cancel(state);return 'confirm';
 }
 state.pending=fingerprint;state.armedAt=now;state.expires=now+WINDOW_MS;return 'warn';
}
const api=Object.freeze({WINDOW_MS,MIN_REVIEW_MS,create,cancel,request});
root.AegisDeploymentConsent=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
