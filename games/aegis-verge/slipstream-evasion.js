/* Aegis Verge 2.34 - Slipstream Evasion.
 * First-party swept hostile-bolt near-miss detection. The actual projectile
 * hit, shield, decoy, cover and interception paths run first. This module
 * never changes projectile collision or awards competitive points. MIT.
 */
(function(root){
'use strict';
const HIT_RADIUS=1.35, GRAZE_RADIUS=2.6, REWARD=6, COOLDOWN=1.25;
const create=()=>({cooldown:0,flash:0,count:0});
function tick(state,dt){if(!Number.isFinite(dt)||dt<=0)return;state.cooldown=Math.max(0,state.cooldown-dt);state.flash=Math.max(0,state.flash-dt);}
function probe(ax,az,bx,bz,player,wallTime=Infinity,decoyTime=Infinity){
 if(!player||![ax,az,bx,bz,player.x,player.z].every(Number.isFinite))return null;
 const dx=bx-ax,dz=bz-az,len2=dx*dx+dz*dz;
 if(len2<1e-8)return null;
 const t=Math.max(0,Math.min(1,((player.x-ax)*dx+(player.z-az)*dz)/len2));
 // Ignore an endpoint near the projectile's spawn or expiry. The actual
 // projectile must sweep alongside, not merely spawn within the graze zone.
 if(t<=1e-5||t>=1-1e-5||t>=wallTime-1e-8||t>=decoyTime-1e-8)return null;
 const x=ax+dx*t,z=az+dz*t,dist=Math.hypot(player.x-x,player.z-z);
 return dist>HIT_RADIUS+.06&&dist<=GRAZE_RADIUS?{x,z,t,dist}:null;
}
function reward(state,bolt,player,near,actualTravel,shielded=false){
 if(!state||!bolt||!near||bolt.grazed||shielded||state.cooldown>0||!Number.isFinite(actualTravel)||actualTravel<.018||!player||!Number.isFinite(player.energy))return false;
 // Grazes supplement the Aegis resource, never score/rank/HP; repeat reward
 // from the same bolt is explicitly forbidden.
 if(player.energy>=100)return false;
 const before=player.energy;player.energy=Math.min(100,player.energy+REWARD);
 if(player.energy===before)return false;
 bolt.grazed=true;state.cooldown=COOLDOWN;state.flash=.42;state.count++;
 return true;
}
function render(engine,player,state,calm){
 if(!engine||!player||!state||state.flash<=0)return;
 const n=calm?4:10,alpha=Math.max(0,Math.min(1,state.flash/.42));
 for(let i=0;i<n;i++){
  const a=i*2*Math.PI/n,rad=2.35+(1-alpha)*1.1;
  engine.cube(player.x+Math.sin(a)*rad,.22,player.z+Math.cos(a)*rad,.20,.12,.48,'#6ee7b7',a,.3+alpha*.55);
 }
}
root.AegisSlipstreamEvasion=Object.freeze({create,tick,probe,reward,render,HIT_RADIUS,GRAZE_RADIUS,REWARD,COOLDOWN});
})(typeof window!=='undefined'?window:globalThis);
