/* Architect Industries Aegis Verge: foreground frame-rate fairness.
 * The engine already subdivides <= .25 seconds into <=1/60 physics steps.
 * Preserve real elapsed foreground time down to 4Hz instead of silently
 * extending ranked timers at slow 5Hz/10Hz render rates. Larger single-frame
 * stalls are deliberately bounded for collision safety and responsive recovery.
 * Pure first-party logic; no dependency, system clock, or background timer.
 */
(function(root){
'use strict';
const MAX_FOREGROUND_STEP=0.25;
function elapsed(now,previous){
 if(!Number.isFinite(now)||!Number.isFinite(previous))return 0;
 return Math.max(0,Math.min(MAX_FOREGROUND_STEP,(now-previous)/1000));
}
// Re-read the live session guard before every substep. A victory, loss or
// pause committed inside one step must discard the remainder of that frame.
function advance(dt,canStep,step){
 let left=Number.isFinite(dt)?Math.max(0,Math.min(MAX_FOREGROUND_STEP,dt)):0;
 while(left>1e-8&&canStep()){const size=Math.min(left,1/60);step(size);left-=size;}
}
const api=Object.freeze({elapsed,advance,MAX_FOREGROUND_STEP});
root.AegisFrameClock=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
