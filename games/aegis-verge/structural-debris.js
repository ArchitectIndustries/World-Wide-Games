/* Architect Industries original cover fracture/debris presentation.
 * Cosmetic debris is NEVER added to the authoritative collision, sightline or
 * navigation arrays. Partial armor retains exactly the original solid hitbox.
 * Deterministic world-space pieces keep checkpoint-restored damage legible.
 */
(function(root){
'use strict';
const MAX_PIECES=36, DURATION=1.35;
const box=(x,y,z,sx,sy,sz,color,yaw=0,em=0)=>({x,y,z,sx,sy,sz,color,yaw,em});
function armor(b,hp,max=5){
 if(!b||!Number.isFinite(hp)||hp<=0||hp>max||!Number.isFinite(b.w)||!Number.isFinite(b.d)||!Number.isFinite(b.h))return [];
 const w=b.w,d=b.d,h=b.h,damage=max-hp,items=[];
 items.push(box(b.x,h/2,b.z,w,h,d,damage?'#403746':'#344552'));
 // Rib-and-panel profile: asymmetric fractures increase with real structural damage.
 for(let j=0;j<4;j++){
  const dw=w/4,xc=b.x-w/2+dw*(j+.5),cut=damage>j?(.13+.08*damage):0;
  items.push(box(xc,h+.10-cut,b.z,dw*.94,.19,d+.12,damage>j?'#9a6c43':'#567283'));
 }
 for(const side of[-1,1]){
  const z=b.z+side*(d/2+.065);
  items.push(box(b.x,h*.68,z,w*.87,.11,.07,damage?'#fbbf24':'#7dd3fc',0,.50));
  // Physically attached brace points do not pretend to change collision.
  for(let j=0;j<3;j++){
   const x=b.x+w*(j-1)*.27;
   items.push(box(x,h*.27,z,w*.095,.20,.10,'#8294a3',0,.07));
  }
  for(let k=0;k<Math.min(damage,4);k++){
   const x=b.x+w*(k%3-1)*.18+(side*.035),cy=h*(.22+.135*k);
   items.push(box(x,cy,z+side*.06,.11,.55+(k%2)*.13,.075,'#fbbf24',((k%2)?-.58:.68),.87));
  }
 }
 items.push(box(b.x,h+.35,b.z,w*.87*hp/max,.08,d*.68,'#fbbf24',0,.95));
 return items;
}
function emit(list,b,amount=1,breached=false,reduced=false){
 if(!Array.isArray(list)||!b||!Number.isFinite(b.x)||!Number.isFinite(b.z))return list;
 const count=reduced?3:breached?12:Math.min(8,3+Math.round(amount)*2);
 for(let i=0;i<count;i++){
  const a=(i*2.3999632297)+(b.id||0)*.7,r=.28+(i%5)*.16;
  const speed=breached?2.9:1.9,life=DURATION-(i%4)*.09;
  list.push({x:b.x+Math.sin(a)*r,y:Math.max(.12,b.h*.6),z:b.z+Math.cos(a)*r,
   vx:Math.sin(a)*speed,vz:Math.cos(a)*speed,vy:1.7+(i%3)*.55,
   yaw:a,spin:(i%2?1:-1)*(.9+i%3),life,maxLife:life,
   sx:.30+(i%3)*.12,sy:.22+(i%2)*.13,sz:.38+(i%4)*.12,
   color:i%3===0?'#fbbf24':i%3===1?'#65788c':'#9a6146'});
 }
 if(list.length>MAX_PIECES)list.splice(0,list.length-MAX_PIECES);
 return list;
}
function tick(list,dt){
 if(!Array.isArray(list)||!Number.isFinite(dt)||dt<=0)return list;
 const step=Math.min(dt,.05);
 for(const p of list){
  p.life-=step;p.x+=p.vx*step;p.z+=p.vz*step;
  p.y=Math.max(.10,p.y+p.vy*step);p.vy=p.y<=.10?0:p.vy-10*step;
  p.vx*=Math.max(0,1-2.1*step);p.vz*=Math.max(0,1-2.1*step);p.yaw+=p.spin*step;
 }
 for(let i=list.length-1;i>=0;i--)if(list[i].life<=0)list.splice(i,1);
 return list;
}
function geometry(p){return box(p.x,Math.max(.09,p.y),p.z,p.sx,p.sy,p.sz,p.color,p.yaw,p.life>0?.24:0);}
const api=Object.freeze({MAX_PIECES,DURATION,armor,emit,tick,geometry});
root.AegisStructuralDebris=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
