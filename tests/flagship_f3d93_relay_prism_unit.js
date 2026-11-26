'use strict';
const a=require('node:assert/strict'), M=require('../games/aegis-verge/faceted-mesh'), S=require('../games/aegis-verge/skyworks');let n=0;function ok(x){a.ok(x);n++}
for(const [w,h,d] of [[.82,1.12,.82],[2,3,1],[1,1,1]]){
 const g=M.geometry('relay',w,h,d);ok(g.vertices.length===24);ok(g.faces.length===18);ok(g.triangles.length===792);const edges=new Map();
 for(const f of g.faces){const dot=p=>p.reduce((s,x,i)=>s+x*f.n[i],0),plane=dot(g.vertices[f.ix[0]]);ok(plane>0);ok(Math.abs(Math.hypot(...f.n)-1)<1e-8);ok(g.vertices.every(p=>dot(p)<=plane+1e-8));ok(f.ix.every(i=>Math.abs(dot(g.vertices[i])-plane)<1e-8));for(let i=0;i<f.ix.length;i++){const k=[f.ix[i],f.ix[(i+1)%f.ix.length]].sort((a,b)=>a-b).join(':');edges.set(k,(edges.get(k)||0)+1)}}ok([...edges.values()].every(v=>v===2));
}
const relays=[[-22,-13],[20,-8],[0,17]];
for(let op=0;op<3;op++)for(const low of [true,false])for(let relay=0;relay<=3;relay++)for(const warning of [false,true]){
 const ctx={op,relays,relay,warning,low,calm:true,elapsed:3},snap=JSON.stringify(ctx),mesh=[],cube=[];const count=S.render({cubeBatch:g=>cube.push(...g),faceted:(...v)=>mesh.push(v)},ctx);ok(mesh.length===3);ok(count===mesh.length+cube.length);ok(JSON.stringify(ctx)===snap);for(let i=0;i<3;i++){const m=mesh[i],state=S.relayState(i,relay,warning&&i===relay);ok(m[0]==='relay'&&m[1]===relays[i][0]&&m[3]===relays[i][1]);ok(m[2]-m[5]/2>=5.9);ok(m[7]===(state==='warning'?'#fbbf24':state==='powered'?'#34d399':state==='active'?S.theme(op).lit:'#40556b'));}let fallback=[];ok(S.render({cubeBatch:g=>fallback.push(...g)},ctx)===fallback.length);}
console.log(JSON.stringify({passed:n,failed:0}));
