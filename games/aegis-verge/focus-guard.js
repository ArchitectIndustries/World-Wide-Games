/* Architect Industries original Aegis Verge focus-resume interlock.
 * Only active gameplay interruptions require acknowledgement; never auto-resume.
 * Uses no wall-clock time, global listeners, persistence, scores or third-party code.
 */
(function(root){
'use strict';
function create(){return {resumeRequired:false};}
function interrupt(state,eligible){
 if(!state||!eligible)return false;
 state.resumeRequired=true;
 return true;
}
function acknowledge(state){if(!state)return false;const was=state.resumeRequired;state.resumeRequired=false;return was;}
function required(state){return !!state&&state.resumeRequired===true;}
const api=Object.freeze({create,interrupt,acknowledge,required});
root.AegisFocusGuard=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
