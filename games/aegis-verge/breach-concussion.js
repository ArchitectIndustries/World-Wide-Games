/* Architect Industries | F3D82 | original Breach Concussion.
 * A true barricade destruction radiates one short, cover-aware pressure pulse.
 * Only surviving enemies committed to a charged windup may be interrupted;
 * no damage, pickups, score, armor bypass, hitbox or physics modification.
 * Uses the already-authoritative firstCover and Counterplay APIs.
 */
(function(root){
'use strict';
const RADIUS=8, DURATION=.78;
function create(){return {x:0,z:0,left:0,interrupted:0,events:0};}
function clear(state){if(!state)return;Object.assign(state,create());}
function breach(state,block,enemies,liveCover,tactics,counterplay){
 if(!state||!block||![block.x,block.z].every(Number.isFinite)||
    !Array.isArray(enemies)||!Array.isArray(liveCover)||
    typeof tactics?.firstCover!=='function'||typeof counterplay?.interrupt!=='function')return null;
 const struck=[];
 for(const e of enemies){
  if(!e||e.dead||!Number.isFinite(e.hp)||e.hp<=0||e.state!=='windup'||
     ![e.x,e.z].every(Number.isFinite))continue;
  const range=Math.hypot(e.x-block.x,e.z-block.z);
  if(range>RADIUS||range<.001)continue;
  // Check the *post-breach* authoritative collider list: no other intact
  // wall may transmit the concussion; a demolished wall no longer blocks it.
  if(tactics.firstCover(block.x,block.z,e.x,e.z,liveCover,.08))continue;
  if(counterplay.interrupt(e)){
   e.siegeTarget=null;e.aimX=e.x;e.aimZ=e.z;struck.push(e);
  }
 }
 state.x=block.x;state.z=block.z;state.left=DURATION;
 state.interrupted=struck.length;state.events++;
 return {count:struck.length,targets:struck};
}
function tick(state,dt){if(!state||!Number.isFinite(dt)||dt<=0)return;
 state.left=Math.max(0,state.left-dt);
}
function label(state){return state?.left>0?`BREACH CONCUSSION · ${state.interrupted} charged hostile${state.interrupted===1?'':'s'} interrupted · no bonus score`:'';}
function render(engine,state,low=false,calm=false){
 if(!engine||!state||state.left<=0)return 0;
 const phase=1-state.left/DURATION,r=.9+phase*(RADIUS*.72),n=calm?8:low?12:20;
 for(let i=0;i<n;i++){
  const a=2*Math.PI*i/n;
  engine.cube(state.x+Math.sin(a)*r,.18+(i%2)*.09,state.z+Math.cos(a)*r,.17,.13,.8, '#fbbf24',a,Math.max(.06,.68*(1-phase)));
 }
 if(!calm){engine.cube(state.x,1.55+phase*.8,state.z,.42,.22,.42,'#fef08a',0,Math.max(.08,.5*(1-phase)));return n+1;}
 return n;
}
const api=Object.freeze({RADIUS,DURATION,create,clear,breach,tick,label,render});
root.AegisBreachConcussion=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
