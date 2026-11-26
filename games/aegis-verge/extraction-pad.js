/* Architect Industries MIT. Original traversable extraction landmark.
 * Radius is shared with mission completion; no score, collider or timer added. */
(function(root){'use strict';
const RADIUS=4;
function distance(exit,player){return Math.hypot(player.x-exit[0],player.z-exit[1]);}
function inside(exit,player){return distance(exit,player)<RADIUS;}
function observe({exit,player,relay,active,finished,defeated}){
 if(!active||defeated||relay<3)return null;
 return {x:exit[0],z:exit[1],distance:distance(exit,player),inside:inside(exit,player),finished:!!finished};
}
function label(s){if(!s)return '';if(s.finished)return 'EXTRACTION COMPLETE';if(s.inside)return 'EXTRACTION ZONE / ARRIVED';if(s.distance===RADIUS)return 'EXTRACTION OPEN / CROSS INSIDE GREEN PERIMETER';return `EXTRACTION OPEN / ENTER GREEN PERIMETER (${Math.ceil(Math.max(0,s.distance-RADIUS))}m to edge)`;}
function announcement(s){return !s?'':s.finished?'Extraction complete.':s.inside?'Inside extraction zone.':'All relays secured. Drive into the green extraction perimeter.';}
function geometry(s,low=false,calm=false){
 if(!s)return [];
 const pieces=[],col=s.finished?'#bbf7d0':'#34d399',dark='#214c49';
 const p=(x,y,z,sx,sy,sz,color,yaw=0,em=0)=>pieces.push({x:s.x+x,y,z:s.z+z,sx,sy,sz,color,yaw,em});
 // Tangential rails centered on the authoritative radius, not an invented square trigger.
 const n=low||calm?8:16;
 for(let i=0;i<n;i++){const a=i*2*Math.PI/n;p(Math.sin(a)*RADIUS,.10,Math.cos(a)*RADIUS,low?1.18:.78,.12,.17,col,a,.68);}
 // Four thin landing guides remain non-solid and entirely inside the perimeter.
 for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2])p(Math.sin(a)*2.1,.13,Math.cos(a)*2.1,.19,.06,1.25,col,a,.35);
 // Original portal silhouette across the center, clear line of sight from other approaches.
 for(const side of [-1,1]){p(side*2.8,2.25,0,.48,4.5,.65,dark);p(side*2.8,2.7,-.36,.16,3.1,.10,col,0,.8);}
 p(0,4.6,0,6.1,.34,.66,dark);p(0,4.6,-.37,5.3,.11,.09,col,0,.8);
 return pieces;
}
function render(engine,s,low=false,calm=false){if(!s)return 0;
 // Thin faceted pad, no raised platform or new collision surface. Constant dimensions bound mesh reuse.
 engine.faceted('hull',s.x,.025,s.z,5.6,.05,5.6,'#183b3b',0,0);
 const p=geometry(s,low,calm);engine.cubeBatch(p);return p.length+1;
}
const api=Object.freeze({RADIUS,distance,inside,observe,label,announcement,geometry,render});root.AegisExtractionPad=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
