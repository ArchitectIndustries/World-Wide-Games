/* Architect Industries / Aegis Verge. Original, deterministic shield timing.
 * A rising shield edge arms one short interception window, then cooldown.
 * Reflected energy follows the existing real player projectile/cover simulation.
 */
(function(root){
'use strict';
const WINDOW=.24,COOLDOWN=2.4,RETURN_SPEED=30;
function create(){return {window:0,cooldown:0,spent:false,parries:0};}
function press(s,eligible){if(!s||!eligible||s.cooldown>0)return false;s.window=WINDOW;s.cooldown=COOLDOWN;s.spent=false;return true;}
function tick(s,dt){if(!s||!Number.isFinite(dt)||dt<=0)return;s.window=Math.max(0,s.window-dt);s.cooldown=Math.max(0,s.cooldown-dt);}
function intercept(s,shielded,bolt){
 if(!s||!shielded||s.window<=0||s.spent||!bolt||!Number.isFinite(bolt.vx)||!Number.isFinite(bolt.vz))return null;
 const speed=Math.hypot(bolt.vx,bolt.vz);if(speed<.001)return null;
 s.spent=true;s.window=0;s.parries++;
 return {vx:-bolt.vx/speed*RETURN_SPEED,vz:-bolt.vz/speed*RETURN_SPEED,life:1.45,reflected:true};
}
const api={WINDOW,COOLDOWN,RETURN_SPEED,create,press,tick,intercept};
root.AegisPerfectGuard=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
