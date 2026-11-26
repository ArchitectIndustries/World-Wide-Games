/* Architect Industries / Aegis Verge F3D73 - original tactical crossfire interruption.
 * Real, surviving hostile bolt impacts can interrupt an ally's committed windup,
 * reusing the existing authoritative Counterplay stagger/cooldown state.
 * Does NOT award player score, damage, drops, or automatic player attacks.
 */
(function(root){
'use strict';
function apply(target,rawDamage,counterplay){
 if(!target||target.dead||!Number.isFinite(target.hp)||target.hp<=0||
   target.state!=='windup'||!Number.isFinite(rawDamage)||rawDamage<=0||
   !counterplay||typeof counterplay.interrupt!=='function')return false;
 const interrupted=!!counterplay.interrupt(target);
 if(interrupted){target.siegeTarget=null;target.aimX=target.x;target.aimZ=target.z;}
 return interrupted;
}
const api=Object.freeze({apply});
root.AegisCrossfireDisruption=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
