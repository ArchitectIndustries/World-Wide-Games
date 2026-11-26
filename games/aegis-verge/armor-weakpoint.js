/* Architect Industries — Aegis Verge F3D68: Exposed Conduit Counterplay.
 * A swept projectile must FIRST hit an enemy using the existing collision and
 * wall precedence. Only a direct right-flank contact after genuine armor loss
 * earns one extra point of damage; no new score, rewards or hitbox.
 * Warden rear-reactor behavior stays exclusively in reactor-flank.js.
 * Original MIT-compatible first-party work; no external dependencies.
 */
(function(root){
'use strict';
const ALLOWED=Object.freeze(['skirmisher','lancer','bulwark']);
const MIN_SIDE=.20,APPROACH=.55;
function evaluate(enemy,shot,contact,base){
 const damage=Number.isFinite(base)&&base>0?base:0;
 const unchanged=()=>({damage,bonus:0});
 if(!enemy||enemy.dead||!ALLOWED.includes(enemy.type)||!shot||shot.reflected||
    !contact||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z)||
    !Number.isFinite(enemy.yaw)||!Number.isFinite(enemy.hp)||!Number.isFinite(enemy.max)||
    enemy.hp<=0||enemy.max<=0||enemy.hp/enemy.max>.5||
    !Number.isFinite(shot.vx)||!Number.isFinite(shot.vz)||
    !Number.isFinite(contact.x)||!Number.isFinite(contact.z))return unchanged();
 const speed=Math.hypot(shot.vx,shot.vz);if(speed<1e-6)return unchanged();
 // The visually exposed plate is on the enemy's LOCAL RIGHT side. Both
 // entry position and travel direction must agree; no rear grazing bonuses.
 const rightX=Math.cos(enemy.yaw),rightZ=-Math.sin(enemy.yaw);
 const size=Number.isFinite(enemy.size)&&enemy.size>0?enemy.size:1.4;
 const side=(contact.x-enemy.x)*rightX+(contact.z-enemy.z)*rightZ;
 const approach=(shot.vx*rightX+shot.vz*rightZ)/speed;
 const bonus=side>=MIN_SIDE*size&&approach<=-APPROACH?1:0;
 return {damage:damage+bonus,bonus};
}
const api=Object.freeze({ALLOWED,MIN_SIDE,APPROACH,evaluate});
root.AegisArmorWeakpoint=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
