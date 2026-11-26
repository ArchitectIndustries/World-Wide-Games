'use strict';
const assert=require('node:assert/strict'),A=require('../games/aegis-verge/cover-architecture'),T=require('../games/aegis-verge/tactics'),BC=require('../games/aegis-verge/breachable-cover');
let n=0;function check(s,v){assert(v,s);n++}
const eps=1e-8;
for(let op=0;op<3;op++)for(const b of T.coverFor(op).filter(b=>!BC.BREACHABLE_IDS.includes(b.id))){
 for(const [f,count] of [[A.geometry,4],[A.detailed,16]]){
  const g=f(b,op);check('count',g.length===count);check('deterministic',JSON.stringify(g)===JSON.stringify(f(b,op)));
  check('bounds',g.every(q=>q.sx>0&&q.sy>0&&q.sz>0&&Math.abs(q.x-b.x)+q.sx/2<=b.w/2+eps&&Math.abs(q.z-b.z)+q.sz/2<=b.d/2+eps&&q.y-q.sy/2>=-eps&&q.y+q.sy/2<=b.h+eps));
  check('volume',Math.abs(g.reduce((s,q)=>s+q.sx*q.sy*q.sz,0)-b.w*b.d*b.h)<eps);
  check('no volumetric overlap',g.every((a,i)=>g.slice(i+1).every(c=>Math.abs(a.x-c.x)>= (a.sx+c.sx)/2-eps||Math.abs(a.y-c.y)>=(a.sy+c.sy)/2-eps||Math.abs(a.z-c.z)>=(a.sz+c.sz)/2-eps)));
  check('real solid collider',!T.free(b.x,b.z,T.coverFor(op)));
 }
}
check('invalid rejected',A.geometry({}).length===0);check('different operation palettes',new Set([0,1,2].map(i=>A.geometry(T.coverFor(0)[1],i)[1].color)).size===3);console.log(`${n} assertions passed`);
