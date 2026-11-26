/* Architect Industries — Aegis Verge Flux Phase Screens (F3D49).
 * First-party timed course obstacles. Real post-collision swept movement only;
 * no authority over mission victory, rankings, navigation or score.
 */
(function(root){
'use strict';
const PERIOD=3.6,OPEN=1.05,WARN=.8,LIVE=1.3,WIDTH=1.95,ENERGY=12,HULL=9;
const SCREENS=Object.freeze([
 Object.freeze({id:'departure',z:-19.3,progress:1,direction:1,offset:.45}),
 Object.freeze({id:'return',z:25.3,progress:3,direction:-1,offset:1.0})
]);
const finite=Number.isFinite;
function create(){return {resolved:[false,false],hits:0,guards:0,last:null};}
function phase(screen,elapsed,startedAt){
 if(!screen||!finite(elapsed)||!finite(startedAt)||elapsed<startedAt)return 'idle';
 const n=(((elapsed-startedAt+screen.offset)%PERIOD)+PERIOD)%PERIOD;
 return n<OPEN?'open':n<OPEN+WARN?'warning':n<OPEN+WARN+LIVE?'live':'open';
}
function current(progress){return SCREENS.find(s=>s.progress===progress)||null;}
// Same deterministic clock and boundaries as phase(): the display cannot
// forecast a different hazard state from the actual collision calculation.
function timing(screen,elapsed,startedAt,capState=null){
 const index=SCREENS.indexOf(screen);
 if(index<0||!finite(elapsed)||!finite(startedAt)||elapsed<startedAt)return {mode:'idle',seconds:null,next:null,progress:0};
 if(capState?.hp?.[index]===0)return {mode:'disabled',seconds:null,next:null,progress:1};
 const t=(((elapsed-startedAt+screen.offset)%PERIOD)+PERIOD)%PERIOD;
 const edges=[OPEN,OPEN+WARN,OPEN+WARN+LIVE,PERIOD];
 const i=edges.findIndex(edge=>t<edge);
 const segment=i<0?3:i,begin=segment===0?0:edges[segment-1],end=edges[segment];
 return {mode:segment===1?'warning':segment===2?'live':'open',seconds:Math.max(0,end-t),next:['warning','live','open','open'][segment],progress:Math.min(1,Math.max(0,(t-begin)/(end-begin)))};
}
function inspect(state,from,to,progress,elapsed,startedAt,guarded=false,capState=null){
 if(!state||!from||!to||!Number.isInteger(progress))return null;
 const screen=current(progress),i=SCREENS.indexOf(screen);
 if(!screen||state.resolved[i]||!finite(from.x)||!finite(from.z)||!finite(to.x)||!finite(to.z))return null;
 const start=(from.z-screen.z)*screen.direction,end=(to.z-screen.z)*screen.direction;
 if(!(start<0&&end>=0))return null;
 const fraction=(screen.z-from.z)/(to.z-from.z),x=from.x+(to.x-from.x)*fraction;
 if(!finite(fraction)||fraction<0||fraction>1||Math.abs(x)>WIDTH)return null;
 const mode=capState?.hp?.[i]===0?'disabled':phase(screen,elapsed,startedAt);
 // Screen never damages an unstarted run, nor a crossing in its open/warning phase.
 if(mode==='idle')return null;
 state.resolved[i]=true;
 const kind=mode==='disabled'?'disabled':mode==='live'?(guarded?'guard':'hit'):'safe';
 if(kind==='hit')state.hits++;
 if(kind==='guard')state.guards++;
 state.last={kind,id:screen.id,mode,x,z:screen.z};return state.last;
}
function status(state,progress,elapsed,startedAt,capState=null){
 const s=current(progress);if(!s||!finite(startedAt))return state?.hits?'COURSE COMPLETE · '+state.hits+' STRIKE'+(state.hits===1?'':'S'):'STANDBY';
 const i=SCREENS.indexOf(s),mode=capState?.hp?.[i]===0?'disabled':phase(s,elapsed,startedAt);
 return s.id.toUpperCase()+' · '+(mode==='disabled'?'OFFLINE — PRACTICE':mode==='live'?'LIVE — SHIELD / WAIT':mode==='warning'?'CHARGING':mode==='open'?'OPEN':'STANDBY')+(state?.hits?' · '+state.hits+' STRIKE'+(state.hits===1?'':'S'):'');
}
function render(engine,low,calm,progress,elapsed,startedAt,capState=null,resolved=null){
 if(!engine)return;
 for(const s of SCREENS){
  const i=SCREENS.indexOf(s),selected=s.progress===progress&&finite(startedAt),previous=progress>s.progress&&resolved?.[i]===true&&finite(startedAt);
  const armed=selected||previous,mode=armed?(capState?.hp?.[i]===0?'disabled':phase(s,elapsed,startedAt)):'idle';
  const live=mode==='live',warn=mode==='warning',color=mode==='disabled'?'#34d399':live?'#fb7185':warn?'#fbbf24':armed?'#67e8f9':'#375568';
  const intensity=live?.95:warn?.75:armed?.4:.12;
  for(const side of[-1,1]){
   engine.cube(side*2.2,1.35,s.z,.28,2.7,.38,'#2f4657',0,.12);
   engine.cube(side*2.2,2.85,s.z,.7,.25,.65,color,0,intensity);
  }
  engine.cube(0,3.0,s.z,4.7,.22,.36,color,0,intensity);
  engine.cube(0,.08,s.z,4.1,.08,.3,color,0,intensity*.6);
  if(armed){
   const bars=low||calm?1:3;
   for(let j=0;j<bars;j++)engine.cube(0,.85+j*.8,s.z,3.8,.1,.18,color,0,intensity*(live?1:.4));
   if(!calm&&!low&&warn)engine.cube(0,3.35,s.z,.45,.22,.48,'#fef3c7',elapsed*2,.8);
  }
 }
}
const api=Object.freeze({PERIOD,OPEN,WARN,LIVE,WIDTH,ENERGY,HULL,SCREENS,create,phase,current,timing,inspect,status,render});
root.AegisFluxPhaseScreens=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
