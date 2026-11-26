/* Aegis Verge: original, deterministic pulse-interrupt and exposed-target rules.
 * No third-party code or assets. Shared between runtime and isolated tests.
 */
(function(root){
'use strict';
const RADIUS=10, COST=35, COOLDOWN=.85, STAGGER_SECONDS=1.3;
function interrupt(e){
 if(!e||e.dead||e.state!=='windup')return false;
 e.state='stagger';e.windup=0;e.staggerLeft=STAGGER_SECONDS;
 e.cool=Math.max(e.cool,STAGGER_SECONDS+.5);return true;
}
function tick(e,dt){
 if(e.state!=='stagger')return false;
 e.staggerLeft=Math.max(0,(e.staggerLeft||0)-Math.max(0,dt));
 if(e.staggerLeft<=0){e.state='recover';e.cool=Math.max(e.cool,.5);return false;}
 return true;
}
function shotDamage(e){return e&&e.state==='stagger'&&e.staggerLeft>0?2:1;}
const api=Object.freeze({RADIUS,COST,COOLDOWN,STAGGER_SECONDS,interrupt,tick,shotDamage});
root.AegisCounterplay=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
