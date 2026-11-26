/* Architect Industries, original 3D relay stabilization signal.
 * Read-only projection of the real hold timer. It never affects capture,
 * collision, combat, scoring, achievements, or save state.
 */
(function(root){'use strict';
const HOLD_SECONDS=3,RADIUS=5,STEPS=16;
const finite=n=>Number.isFinite(n);
function observe(o){
 if(!o||!o.active||o.finished||o.defeated||o.hostiles>0||!o.target||!finite(o.target.x)||!finite(o.target.z)||!finite(o.player?.x)||!finite(o.player?.z))return null;
 const distance=Math.hypot(o.player.x-o.target.x,o.player.z-o.target.z);
 const fraction=Math.min(1,Math.max(0,(finite(o.capture)?o.capture:0)/HOLD_SECONDS));
 return Object.freeze({x:o.target.x,z:o.target.z,within:distance<RADIUS,distance,fraction,filled:Math.floor(fraction*STEPS+1e-7),relay:o.relay+1,warning:!!o.warning});
}
function geometry(s,low=false,calm=false){if(!s)return [];
 const pieces=[],stride=low||calm?2:1;
 for(let i=0;i<STEPS;i+=stride){
  const a=i*2*Math.PI/STEPS,lit=i<s.filled;
  // Arc segments sit BELOW existing gate threshold and above ground.
  // Fill is fixed to authoritative capture time; no fake success animation.
  pieces.push({x:s.x+Math.sin(a)*3.45,y:.225,z:s.z+Math.cos(a)*3.45,sx:low?.45:.62,sy:lit?.22:.12,sz:.19,yaw:a,color:lit?'#86efac':s.within?'#20526d':'#29404d',em:lit?.85:.10});
 }
 if(s.within&&s.filled>0){
  pieces.push({x:s.x,y:4.58,z:s.z,sx:.40+1.8*s.fraction,sy:.12,sz:.28,color:s.warning?'#fbbf24':'#86efac',yaw:0,em:.86});
 }
 return pieces;
}
function render(engine,s,low=false,calm=false){const p=geometry(s,low,calm);if(engine?.cubeBatch)engine.cubeBatch(p);return p.length;}
function label(s){if(!s)return '';
 const pct=Math.floor(s.fraction*100+1e-6);
 return s.within?`RELAY ${s.relay} STABILIZING · ${pct}% / HOLD POSITION`:`RELAY ${s.relay} CLEAR · ENTER BEACON (${Math.ceil(s.distance)}m)${pct?' · '+pct+'% RETAINED':''}`;
}
function announcement(s){if(!s)return '';
 if(!s.within)return `Relay ${s.relay} clear. Enter the perimeter to stabilize.`;
 // Screen-reader announcements stay to coarse steps rather than 60Hz updates.
 return `Relay ${s.relay} stabilizing: ${Math.floor(s.fraction*4+1e-6)*25} percent.`;
}
const api=Object.freeze({HOLD_SECONDS,RADIUS,STEPS,observe,geometry,render,label,announcement});
root.AegisRelayStabilization=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
