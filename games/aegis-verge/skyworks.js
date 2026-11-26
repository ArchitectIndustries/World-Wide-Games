/* Aegis Verge F3D31 — Skyworks.
 * Authored low-poly skyline and live relay-state architecture: original first-party
 * geometry, no imported models, textures, sound, physics, or extra network calls.
 * Out-of-arena structures are intentionally non-colliding; the floor is cosmetic.
 */
(function(root){'use strict';
 const THEMES=Object.freeze([
  {name:'salt',metal:'#29495d',trim:'#5f8996',lit:'#67e8f9',dark:'#142b39',seed:0},
  {name:'scar',metal:'#513044',trim:'#99566b',lit:'#fb7185',dark:'#321c30',seed:1},
  {name:'crown',metal:'#3b315b',trim:'#7965ab',lit:'#c084fc',dark:'#211b39',seed:2}
 ]);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const cube=(x,y,z,sx,sy,sz,color,yaw=0,em=0,detail='base')=>({x,y,z,sx,sy,sz,color,yaw,em,detail});
 function theme(op){return THEMES[clamp(Number.isInteger(op)?op:0,0,THEMES.length-1)];}
 function skyline(op=0){
  const t=theme(op),out=[];
  // Every outer worksite sits beyond the player's +/-38m movement boundary.
  // Four authored silhouettes per operation; deterministic, no RNG or loading.
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6+.13,rad=49+(i%4)*2.6,x=Math.sin(a)*rad,z=Math.cos(a)*rad;
   const h=8+(i%3)*3.2+(op===2?3:0),yaw=a;
   out.push(cube(x,h/2,z,4.6,h,4.6,t.metal,yaw));
   out.push(cube(x,h+.15,z,5.6,.32,5.6,t.trim,yaw,.12));
   if(op===0){
    out.push(cube(x,h+1.65,z,2.2,3.2,2.2,t.dark,yaw,0,'high'));
    out.push(cube(x,h+3.4,z,3.4,.24,3.4,t.lit,yaw,.48,'high'));
    out.push(cube(x,h*.6,z,5,.1,5,t.lit,yaw,.38,'high'));
   } else if(op===1){
    for(const side of[-1,1])out.push(cube(x+Math.cos(a)*side*3.4,h*.55,z-Math.sin(a)*side*3.4,.7,h*.9,.7,t.trim,yaw,0,'high'));
    out.push(cube(x,h+1,z,6.9,.5,1.4,t.lit,yaw,.35,'high'));
   } else {
    for(const side of[-1,1])out.push(cube(x+Math.cos(a)*side*2.6,h+1.7,z-Math.sin(a)*side*2.6,1.2,3.8,.24,t.trim,yaw,.1,'high'));
    out.push(cube(x,h+3.3,z,.32,3,.32,t.lit,yaw,.7,'high'));
   }
  }
  // Ground-inlaid survey plates sit below the collision plane; they never
  // change player, projectile, enemy or waypoint collision data.
  for(let j=0;j<8;j++){
   const a=j*Math.PI/4,rad=30.8+(j%2)*1.3,x=Math.sin(a)*rad,z=Math.cos(a)*rad;
   out.push(cube(x,-.055,z,3.8,.035,1.2,t.dark,a));
   out.push(cube(x,-.031,z,2.5,.026,.13,t.trim,a,.24,'high'));
  }
  return out;
 }
 function limited(list,low){return low?list.filter(x=>x.detail!=='high'):list;}
 function relayState(i,relay,warning=false){
  if(!Number.isInteger(i)||i<0||i>2)return'future';
  if(relay>=3||i<relay)return'powered';
  if(i===relay)return warning?'warning':'active';
  return'future';
 }
 function geometry(op,relays,relay=0,clock=0,low=false,calm=false,warning=false){
  const t=theme(op),out=[];
  if(!Array.isArray(relays))return out;
  for(let i=0;i<Math.min(3,relays.length);i++){
   const p=relays[i];if(!Array.isArray(p)||p.length<2||![p[0],p[1]].every(Number.isFinite))continue;
   const [x,z]=p,s=relayState(i,relay,warning&&i===relay),hot=s==='active'||s==='warning',powered=s==='powered';
   const color=s==='warning'?'#fbbf24':(powered?'#34d399':hot?t.lit:'#40556b');
   // Suspended warning/readability frame intentionally begins above gameplay
   // hitboxes. This is signalling architecture, NOT extra invisible cover.
   out.push(cube(x,5.65,z,.85,.3,5.3,t.dark,0));
   out.push(cube(x,5.85,z,5.5,.18,.45,color,0,(hot||powered)?.62:.08));
   out.push({...cube(x,6.52,z,.82,1.12,.82,color,0,(hot||powered)?.65:.05),shape:'relay'});
   if(!low){
    for(const side of[-1,1]){
     out.push(cube(x+side*3.15,5.45,z,.35,1.2,.4,t.trim,0,.12));
     out.push(cube(x+side*3.15,6.25,z,.7,.18,1.45,color,0,.48));
    }
    // Pulsing core is deliberately based on simulation time and disabled in
    // Calm/reduced-motion mode; pause and focus freeze it naturally.
    const y=7.65+(hot&&!calm?Math.sin(clock*2.2+i)*.25:0);
    out.push(cube(x,y,z,.55,.6,.55,color,calm?0:clock*.25,(hot||powered)?.8:.08));
   }
  }
  return out;
 }
 function render(engine,context){
  const m=geometry(context.op,context.relays,context.relay,context.elapsed,context.low,context.calm,context.warning);
  if(engine&&typeof engine.cubeBatch==='function'){
   if(typeof engine.faceted==='function'){engine.cubeBatch(m.filter(q=>!q.shape));for(const q of m)if(q.shape)engine.faceted(q.shape,q.x,q.y,q.z,q.sx,q.sy,q.sz,q.color,q.yaw,q.em);}
   else engine.cubeBatch(m);
  }
  return m.length;
 }
 const api={theme,skyline,limited,relayState,geometry,render};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.AegisSkyworks=api;
})(typeof window!=='undefined'?window:globalThis);
