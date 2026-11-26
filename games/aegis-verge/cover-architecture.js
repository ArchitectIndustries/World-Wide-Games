/* Aegis Verge: original permanent fortification geometry (Architect Industries, MIT).
 * The collision record is the sole source of dimensions. Decorative pieces
 * never extend outside it; low-detail keeps the exact same occupied envelope.
 * Breachable armor and salvage are rendered by their own stateful modules.
 */
(function(root){'use strict';
 const palettes=[
  {base:'#263b48',body:'#526b72',cap:'#83979a',band:'#344b55',rib:'#a1b2ad'},
  {base:'#362a35',body:'#76565d',cap:'#a88b83',band:'#483440',rib:'#b7a09a'},
  {base:'#302d46',body:'#625b80',cap:'#8b86a2',band:'#423c5b',rib:'#b0a9c1'}
 ];
 function geometry(b,op=0){
  if(!b||![b.x,b.z,b.w,b.d,b.h].every(Number.isFinite)||Math.min(b.w,b.d,b.h)<=0)return [];
  const p=palettes[op]||palettes[0],out=[];
  const part=(x,y,z,sx,sy,sz,color,detail='base')=>out.push({x,y,z,sx,sy,sz,color,yaw:0,em:0,detail});
  const {x,z,w,d,h}=b;
  // Four continuous, non-overlapping courses form a complete solid envelope.
  const courses=[[0,.18,p.base],[.18,.69,p.body],[.69,.83,p.band],[.83,1,p.cap]];
  for(const [lo,hi,color] of courses)part(x,h*(lo+hi)/2,z,w,h*(hi-lo),d,color);
  // High-detail shallow relief stays within the wall's silhouette. The
  // body is split into inset core + outer panel strips in the detailed mesh;
  // avoid coplanar overlays by replacing the body rather than drawing over it.
  return out;
 }
 // For the high tier, replace the middle body course with an inset core and
 // four non-overlapping face skins. Alternating ribs are formed by splitting
 // each long face, not by adding collision-free protrusions.
 function detailed(b,op=0){
  const out=geometry(b,op);if(!out.length)return out;
  const p=palettes[op]||palettes[0],{x,z,w,d,h}=b,t=Math.min(.12,w/8,d/8),y=h*(.18+.69)/2,sy=h*(.69-.18);
  const part=(x,y,z,sx,sy,sz,color)=>({x,y,z,sx,sy,sz,color,yaw:0,em:0,detail:'base'});
  const pieces=[part(x,y,z,w-2*t,sy,d-2*t,p.body)];
  for(const s of [-1,1]){
   for(const [lo,hi,col] of [[0,.16,p.rib],[.16,.84,p.body],[.84,1,p.rib]]){
    pieces.push(part(x-w/2+w*(lo+hi)/2,y,z+s*(d-t)/2,w*(hi-lo),sy,t,col));
    pieces.push(part(x+s*(w-t)/2,y,z-(d-2*t)/2+(d-2*t)*(lo+hi)/2,t,sy,(d-2*t)*(hi-lo),col));
   }
  }
  out.splice(1,1,...pieces);return out;
 }
 const api={geometry,detailed};root.AegisCoverArchitecture=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
