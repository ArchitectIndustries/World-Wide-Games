/* Aegis Verge: first-party emergency respawn safety window.
 * Simulation time only: the caller must not tick while paused or suspended.
 * Does not affect mission score, enemy state, pickups or checkpoint writes.
 */
(function(root){
 'use strict';
 const DURATION=2;
 function create(){return {remaining:0};}
 function begin(state){state.remaining=DURATION;return state.remaining;}
 function tick(state,dt){if(Number.isFinite(dt)&&dt>0)state.remaining=Math.max(0,state.remaining-dt);return state.remaining;}
 function protects(state){return state.remaining>0;}
 function reset(state){state.remaining=0;}
 root.AegisRecoveryGrace=Object.freeze({DURATION,create,begin,tick,protects,reset});
})(typeof globalThis!=='undefined'?globalThis:window);
