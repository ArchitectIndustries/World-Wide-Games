/* Architect Industries — Aegis Verge 2.52 Phase Telegraph.
 * First-party deterministic world-space readiness cues, not collision authority.
 * Only reads the authoritative phase clock, current course leg and real player
 * position. Reduced-effects and low-tier rendering have fixed draw budgets.
 */
(function(root){
'use strict';
const REACH=14, LANE=6;
function create(){return {lastKey:null,announcements:0};}
function observe(state,player,screen,clock,resolved=false){
 if(!state)return null;
 if(!player||!screen||resolved||!clock||!['open','warning','live'].includes(clock.mode)||
  ![player.x,player.z].every(Number.isFinite)||Math.abs(player.x)>LANE||Math.abs(player.z-screen.z)>REACH){state.lastKey=null;return null;}
 const key=screen.id+':'+clock.mode;
 if(key===state.lastKey)return null;
 state.lastKey=key;state.announcements++;
 const type=clock.mode,detail=type==='live'?'SHIELD OR WAIT':type==='warning'?'PREPARE TO STOP':'CROSS WHEN CLEAR';
 return `FLUX ${screen.id.toUpperCase()} · ${type.toUpperCase()} · ${detail}`;
}
function label(clock,screen,resolved=false){
 if(!screen||!clock||clock.mode==='idle')return 'STANDBY';
 if(resolved)return `${screen.id.toUpperCase()} CLEARED · NO REPEAT STRIKE`;
 if(clock.mode==='disabled')return `${screen.id.toUpperCase()} OFFLINE · PRACTICE`;
 const short={open:'OPEN',warning:'CHARGING',live:'LIVE — SHIELD / WAIT'}[clock.mode];
 return `${screen.id.toUpperCase()} · ${short} · ${Math.max(0,clock.seconds).toFixed(1)}s`;
}
function render(engine,screen,clock,low=false,calm=false,resolved=false){
 if(!engine||!screen||!clock||clock.mode==='idle')return 0;
 const mode=resolved?'cleared':clock.mode,color=(mode==='disabled'||mode==='cleared')?'#34d399':mode==='live'?'#fb7185':mode==='warning'?'#fbbf24':'#67e8f9';
 const count=low?4:8, progress=clock.progress,solid=mode==='disabled'||mode==='cleared';
 // Physically placed countdown columns flank the actual shutter plane.
 // An extinguishing stack reads in both software Canvas2D and WebGL2.
 for(const side of [-1,1]){
  engine.cube(side*2.68,1.55,screen.z,.21,2.7,.2,'#1d3345',0,.11);
  for(let i=0;i<count;i++){
   const filled=solid||(i/count)>=progress;
   const y=.33+(i+.5)*2.35/count;
   engine.cube(side*2.68,y,screen.z,.3,1.88/count,.36,filled?color:'#294053',0,filled?.7:.07);
  }
 }
 // No emission pulses/flicker in reduced-effects mode, no new light objects.
 if(!calm&&!low&&mode==='live')engine.cube(0,3.38,screen.z,.85,.16,.28,color,0,.9);
 return 2+2*count+(!calm&&!low&&mode==='live'?1:0);
}
const api=Object.freeze({REACH,LANE,create,observe,label,render});
root.AegisFluxPhaseTelegraph=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
