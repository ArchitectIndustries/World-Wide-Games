/* Aegis Verge 2.35: first-party directional threat cues and synthesized spatial audio.
 * Uses real world positions, vehicle heading, and original solid-cover ray tests.
 * No samples, external engine, telemetry, network, or gameplay authority.
 */
(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const PRESETS=Object.freeze({
 lock:Object.freeze({label:'HOSTILE LOCK',tone:490,end:330,duration:.17,wave:'triangle'}),
 volley:Object.freeze({label:'INCOMING FIRE',tone:225,end:130,duration:.13,wave:'sawtooth'}),
 mine:Object.freeze({label:'CAPACITOR ARMING',tone:610,end:370,duration:.2,wave:'square'}),
 surge:Object.freeze({label:'RELAY SURGE',tone:330,end:180,duration:.22,wave:'triangle'})
});
function locate(listener,source,blocks=[],firstCover){
 if(!listener||!source||![listener.x,listener.z,listener.yaw,source.x,source.z].every(Number.isFinite))return null;
 const dx=source.x-listener.x,dz=source.z-listener.z,d=Math.hypot(dx,dz),yaw=listener.yaw;
 const right=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/(d||1);
 const ahead=(dx*Math.sin(yaw)+dz*Math.cos(yaw))/(d||1);
 const pan=clamp(right*1.12,-.95,.95);
 const occluded=typeof firstCover==='function'&&d>.01?!!firstCover(listener.x,listener.z,source.x,source.z,blocks,.08):false;
 const attenuation=clamp(1/(1+Math.pow(d/19,1.5)),.055,1)*(occluded?.38:1);
 const direction=ahead<-.45?'REAR':pan<-.32?'LEFT':pan>.32?'RIGHT':'AHEAD';
 return {distance:d,pan,occluded,gain:attenuation,direction,x:source.x,z:source.z};
}
function create(){return{context:null,activeVoices:0,played:0,blocked:0,last:null,remaining:0,events:0};}
function contextOf(state,factory){
 if(state.context)return state.context;
 try{const C=factory||(typeof root.AudioContext==='function'?root.AudioContext:root.webkitAudioContext);if(C)state.context=new C();}catch{};
 return state.context;
}
function unlock(state,allowed=true,factory){
 if(!allowed)return false;
 const c=contextOf(state,factory);if(!c)return false;
 try{if(c.state==='suspended'&&typeof c.resume==='function'){const r=c.resume();if(r&&typeof r.catch==='function')r.catch(()=>{});}}catch{}
 return c.state==='running';
}
function play(state,kind,position,allowed=true,options={}){
 const spec=PRESETS[kind];if(!allowed||!spec||!position||position.distance>52||state.activeVoices>=8){state.blocked++;return false;}
 const c=contextOf(state,options.factory);
 if(!c||c.state!=='running'){state.blocked++;return false;}
 let nodes=[],allocated=false;
 try{
  const osc=c.createOscillator(),gain=c.createGain(),time=c.currentTime;
  nodes.push(osc,gain);
  osc.type=spec.wave;osc.frequency.setValueAtTime(spec.tone,time);
  osc.frequency.exponentialRampToValueAtTime(spec.end,time+spec.duration);
  const volume=clamp(Number(options.volume??1),0,1);
  gain.gain.setValueAtTime(Math.max(.00001,.045*position.gain*volume),time);
  gain.gain.exponentialRampToValueAtTime(.00001,time+spec.duration);
  let tail=gain;
  // An optional low-pass filter makes a blocked threat sound muffled, while
  // retaining the visible direction and warning label when audio is unavailable.
  if(typeof c.createBiquadFilter==='function'){
   const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=position.occluded?760:6500;
   tail.connect(filter);tail=filter;nodes.push(filter);
  }
  if(typeof c.createStereoPanner==='function'){
   const panner=c.createStereoPanner();panner.pan.setValueAtTime(position.pan,time);
   tail.connect(panner);tail=panner;nodes.push(panner);
  }
  tail.connect(c.destination);osc.connect(gain);
  state.activeVoices++;allocated=true;
  let released=false;
  osc.onended=()=>{if(released)return;released=true;state.activeVoices=Math.max(0,state.activeVoices-1);for(const node of nodes)try{node.disconnect()}catch{}};
  osc.start(time);osc.stop(time+spec.duration+.005);state.played++;return true;
 }catch{if(allocated){state.activeVoices=Math.max(0,state.activeVoices-1)}for(const node of nodes)try{node.disconnect()}catch{};state.blocked++;return false;}
}
function signal(state,kind,position,allowed=true,options={}){
 if(!PRESETS[kind]||!position)return null;
 const name=PRESETS[kind].label;
 state.last={kind,direction:position.direction,x:position.x,z:position.z,occluded:position.occluded,
  text:`${name} / ${position.direction}${position.occluded?' / BEHIND COVER':''}`,distance:position.distance};
 state.remaining=1.3;state.events++;
 play(state,kind,position,allowed,options);
 return state.last;
}
function tick(state,dt){if(!Number.isFinite(dt)||dt<=0)return;state.remaining=Math.max(0,state.remaining-dt);if(state.remaining===0)state.last=null;}
function reset(state){state.last=null;state.remaining=0;}
function render(engine,state,calm=false){
 if(!state.last||state.remaining<=0||!engine||typeof engine.cube!=='function')return 0;
 const q=state.last,count=calm?2:6,fade=clamp(state.remaining/1.3,0,1);
 for(let i=0;i<count;i++){
  const a=i*Math.PI*2/count,rad=1.7+(1-fade)*.9;
  engine.cube(q.x+Math.sin(a)*rad,.14,q.z+Math.cos(a)*rad,calm?.32:.38,.12,.65,
   q.kind==='mine'||q.kind==='surge'?'#fbbf24':'#fb923c',a,.25+fade*.65);
 }
 return count;
}
const api={PRESETS,locate,create,unlock,play,signal,tick,reset,render};
root.AegisSpatialThreat=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
