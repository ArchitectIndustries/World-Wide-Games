/* Architect Industries / Aegis Verge F3D77 - original contact-counterplay module.
 * A physically blocked vector dash interrupts ONE actually charging living hostile.
 * No damage, scoring, loot, invulnerability or hitbox modifications.
 */
(function(root){
'use strict';
const FLASH=.65;
function create(){return {armed:false,flash:0,target:null,count:0};}
function arm(s){if(!s)return false;s.armed=true;return true;}
function reset(s){if(!s)return;s.armed=false;s.flash=0;s.target=null;s.count=0;}
function hit(s,contact,hostiles,interrupt){
 if(!s?.armed||!contact?.hit||!Array.isArray(hostiles)||typeof interrupt!=='function')return false;
 const e=contact.obstacle;
 // Contact must resolve against the real hostile object, not a synthetic
 // radius proxy, cover block, friendly decoy or weapon-only hit region.
 if(!e||!hostiles.includes(e)||e.dead||!Number.isFinite(e.hp)||e.hp<=0||e.state!=='windup')return false;
 if(!interrupt(e))return false;
 s.armed=false;s.flash=FLASH;s.target=e;s.count++;
 return true;
}
function tick(s,dt){if(!s||!Number.isFinite(dt)||dt<=0)return;
 s.flash=Math.max(0,s.flash-dt);if(!s.flash)s.target=null;
}
function render(engine,s,low=false,calm=false){
 const e=s?.target;if(!engine||!(s.flash>0)||!e||e.dead||e.hp<=0)return 0;
 const n=low||calm?4:8,fade=Math.min(.85,.25+s.flash/FLASH*.6);
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=1.5+(FLASH-s.flash)*1.1;
  engine.cube(e.x+Math.cos(a)*r,.85+(i%2)*.25,e.z+Math.sin(a)*r,.25,.13,.35,'#5eead4',a,fade);
 }return n;
}
const api=Object.freeze({FLASH,create,arm,reset,hit,tick,render});
root.AegisDashIntercept=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
