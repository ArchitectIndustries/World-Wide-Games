/* Architect Industries — Aegis Verge F3D64 Salvage Fabricator
 * First-party low-poly 3D cache hardware linked to authoritative field-cache
 * state. Geometry is entirely cosmetic; the original collision footprint,
 * channel duration, reward, checkpoint and score rules remain untouched.
 */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function profile(cache,index){
 if(!cache||!Array.isArray(cache.sites)||!Array.isArray(cache.used)||!Number.isInteger(index)||index<0||index>=cache.sites.length)return null;
 const site=cache.sites[index];
 if(!site||!Number.isFinite(site.x)||!Number.isFinite(site.z))return null;
 const spent=cache.used[index]===true;
 const active=!spent&&cache.channel===index;
 const duration=root.AegisFieldCache?.CHANNEL;
 const left=Number.isFinite(cache.left)?cache.left:duration;
 const progress=active&&Number.isFinite(duration)&&duration>0?clamp((duration-left)/duration,0,1):0;
 return Object.freeze({x:site.x,z:site.z,spent,active,progress});
}
function parts(cache,index,simTime=0,opts={}){
 const p=profile(cache,index);if(!p)return [];
 const low=!!opts.low,calm=!!opts.calm;
 const t=Number.isFinite(simTime)&&!calm?Math.max(0,simTime):0;
 const base=p.spent?'#1c2934':p.active?'#154b50':'#183d43';
 const trim=p.spent?'#64748b':p.active?'#7dd3fc':'#4ade80';
 const glow=p.spent?'#64748b':p.active?'#a7f3d0':'#86efac';
 const sx=p.x,sz=p.z,result=[];
 function cube(x,y,z,w,h,d,color,yaw=0,em=0){result.push({x,y,z,w,h,d,color,yaw,em});}
 // All visible structures fit within the existing 2.8m platform. The
 // authoritative 1.5m core collision and sightline remains separate.
 cube(sx,.13,sz,2.72,.22,2.72,base);
 cube(sx,.35,sz,1.75,.22,1.75,'#243f4e');
 for(const side of[-1,1])cube(sx+side*1.04,.75,sz,.18,1.05,1.66,trim,0,p.spent?.04:.16);
 // Closed / activated / exhausted silhouette remains recognizable in low tier.
 const spread=p.active?.40*p.progress:0;
 const height=p.spent?.76:1.38+(p.active?.28*p.progress:0);
 cube(sx,height,sz,.96,p.spent?.55:.92,.96,glow,t*.16,p.spent?.03:p.active?.87:.36);
 cube(sx,height+.52,sz,p.spent?.82:1.44,.15,p.spent?.82:1.44,trim,t*.23,p.spent?.03:.48);
 for(const side of[-1,1])cube(sx+side*(.53+spread),height+.12,sz,.16,.56,.95,p.spent?'#334155':'#166474',0,p.active?.5:.16);
 if(!low){
  // Framed armor trusses, suspended diagnostics, and three status bars.
  for(const x of[-1,1])for(const z of[-1,1])cube(sx+x*1.15,.42,sz+z*1.12,.16,.6,.16,'#536d7b');
  cube(sx,.24,sz-1.33,1.6,.10,.09,trim,0,p.spent?.02:.4);
  cube(sx,.24,sz+1.33,1.6,.10,.09,trim,0,p.spent?.02:.4);
  for(let k=0;k<3;k++){
   const lit=p.spent?false:p.active?p.progress>=(k+1)/3:k===0;
   cube(sx-.48+k*.48,.51,sz-1.29,.32,.12,.095,lit?glow:'#34515d',0,lit?.74:0);
  }
 }
 return result;
}
function render(engine,cache,index,simTime,opts={}){
 if(!engine||typeof engine.cube!=='function')return 0;
 const arr=parts(cache,index,simTime,opts);
 for(const b of arr)engine.cube(b.x,b.y,b.z,b.w,b.h,b.d,b.color,b.yaw,b.em);
 return arr.length;
}
root.AegisSalvageFabricator=Object.freeze({profile,parts,render});
if(typeof module==='object'&&module.exports)module.exports=root.AegisSalvageFabricator;
})(typeof window==='object'?window:globalThis);
