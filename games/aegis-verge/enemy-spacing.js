/* Architect Industries / Aegis Verge F3D75 — original living-rig separation.
 * One authoritative swept chassis solver for player and hostiles; never
 * changes weapon hitboxes, scores, rewards or dead-unit passability.
 * Source: first-party MIT-compatible, no assets or external packages.
 */
(function(root){
'use strict';
const FLASH=.32;
function alive(e){return !!e&&!e.dead&&(Number.isFinite(e.hp)?e.hp:e.hull)>0&&Number.isFinite(e.x)&&Number.isFinite(e.z);}
function obstacles(body,player,enemies,playerRadius){
 if(body===player)return Array.isArray(enemies)?enemies:[];
 const others=Array.isArray(enemies)?enemies.filter(e=>e!==body&&alive(e)):[];
 if(alive(player)&&Number.isFinite(playerRadius)&&playerRadius>0){
  // Existing CONTACT.enemyRadius determines the same physical body as a
  // player radius when using this synthetic proxy, not a new hitbox.
  others.unshift({x:player.x,z:player.z,hp:player.hp??player.hull,type:'rig',size:playerRadius/.65});
 }
 return others;
}
function notice(body,obstacle,player){
 if(!body||body===player||!obstacle||obstacle.type==='rig')return false;
 body.spacingFlash=FLASH;
 return true;
}
function tick(enemies,dt){
 if(!Array.isArray(enemies)||!Number.isFinite(dt)||dt<=0)return;
 for(const e of enemies)if(e&&Number.isFinite(e.spacingFlash)&&e.spacingFlash>0)e.spacingFlash=Math.max(0,e.spacingFlash-dt);
}
function render(engine,e,low=false,calm=false){
 if(!engine||!alive(e)||!Number.isFinite(e.spacingFlash)||e.spacingFlash<=0)return 0;
 const count=low||calm?3:6,level=Math.min(1,e.spacingFlash/FLASH);
 for(let i=0;i<count;i++){
  const a=i*Math.PI*2/count,r=1.05;
  engine.cube(e.x+Math.sin(a)*r,.18,e.z+Math.cos(a)*r,.16,.09,.4,'#fbbf24',a,.35+level*.5);
 }
 return count;
}
const api=Object.freeze({FLASH,alive,obstacles,notice,tick,render});
root.AegisEnemySpacing=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
