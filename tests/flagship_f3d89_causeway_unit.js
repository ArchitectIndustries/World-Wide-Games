'use strict';
const assert=require('node:assert/strict'),F=require('../games/aegis-verge/flux-slipways'),T=require('../games/aegis-verge/tactics');
let n=0;function check(name,condition){assert(condition,name);n++;}
const eps=1e-8;
for(let op=0;op<3;op++)for(const low of [true,false]){
 const g=F.surface(op,low);check('bounded detail',g.length===(low?6:16));check('deterministic',JSON.stringify(g)===JSON.stringify(F.surface(op,low)));
 for(const q of g){check('inlaid geometry',q.y+q.sy/2<0&&q.sx>0&&q.sz>0);check('track footprint',F.TRACKS.some(r=>Math.abs(q.x-r.x)+q.sx/2<=r.width/2+eps&&Math.abs(q.z-r.z)+q.sz/2<=r.length/2+eps));}
 check('no overlap',g.every((a,i)=>g.slice(i+1).every(b=>Math.abs(a.x-b.x)>=(a.sx+b.sx)/2-eps||Math.abs(a.z-b.z)>=(a.sz+b.sz)/2-eps)));
 const marks=[];F.render({cube(...args){marks.push(args)}},low,null,true);
 for(const r of F.TRACKS){
  const arrows=marks.filter(m=>m[1]===.085&&Math.abs(m[2]-r.z)<r.length/2);
  check('arrow count',arrows.length===(low?10:20));
  for(const m of arrows){const [x,,z,,,length,,yaw]=m;const tipX=x+Math.sin(yaw)*length/2*r.direction,tipZ=z+Math.cos(yaw)*length/2*r.direction;
   check('forward tip converges at center',Math.abs(tipX-r.x)<.02&&Math.sign(tipZ-z)===r.direction);
  }
  const p={x:r.x,z:r.z,energy:100};check('real aligned boost',F.sample(p,0,r.direction,4)===r);check('wrong-way no boost',F.sample(p,0,-r.direction,4)===null);check('no boost if shield/dash',F.sample(p,0,r.direction,4,false)===null);check('outside no boost',F.sample({...p,x:r.width/2+.001},0,r.direction,4)===null);check('low energy no boost',F.sample({...p,energy:1},0,r.direction,4)===null);
  const state=F.create();check('real movement cost',F.advance(state,r,.1,.6,p).active&&Math.abs(p.energy-97.7)<eps);check('blocked movement zero spend',!F.advance(state,r,.1,0,p).active&&Math.abs(p.energy-97.7)<eps);
 }
 check('cover still solid',!T.free(T.coverFor(op)[0].x,T.coverFor(op)[0].z,T.coverFor(op)));
}
check('distinct op colors',new Set([0,1,2].map(i=>F.surface(i,true)[0].color)).size===3);
console.log(JSON.stringify({passed:n,total:n}));
