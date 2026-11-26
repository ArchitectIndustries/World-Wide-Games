/* Architect Industries — Aegis Verge F3D44: Skyburst Suppression.
 * Only genuine surviving, exposed friendly-artillery collateral triggers this.
 * Firing caster and sheltered actors are excluded by the authoritative splash list.
 * First-party MIT; no score, health, pickup or objective authority.
 */
(function(root){
'use strict';
const DELAY=.65, VISUAL=.78;
function apply(enemy,counterplay){
 if(!enemy||enemy.dead||!Number.isFinite(enemy.hp)||enemy.hp<=0||
  !counterplay||typeof counterplay.interrupt!=='function')return false;
 if(enemy.state==='stagger')return false; // Preserve existing earned vulnerability windows.
 if(enemy.state==='windup'){
  if(!counterplay.interrupt(enemy))return false;
 }else{
  // Never shorten a legitimate attack cooldown; delay only an attack that
  // could otherwise begin before the pressure wave dissipates.
  if(!Number.isFinite(enemy.cool))enemy.cool=0;
  if(enemy.cool>=DELAY)return false;
  enemy.cool=DELAY;enemy.state='recover';enemy.siegeTarget=null;
 }
 enemy.suppressedLeft=VISUAL;return true;
}
function tick(enemy,dt){
 if(!enemy||!Number.isFinite(dt)||dt<=0)return;
 enemy.suppressedLeft=Math.max(0,(enemy.suppressedLeft||0)-dt);
}
const api=Object.freeze({DELAY,VISUAL,apply,tick});
root.AegisSkyburstSuppression=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
