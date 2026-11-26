'use strict';
const assert=require('node:assert/strict'),U=require('../../games/aegis-verge/signal-uplink.js');
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};
const s=U.create([{x:0,z:0},{x:10,z:10},{x:-10,z:10}]);
for(const r of [0,1,2])for(const d of [0,3.59,3.6,3.61,8])for(const energy of [0,29.99,30,100])for(const hostile of [false,true]){
 const q=s.sites[r],p={x:q.x+d,z:q.z,energy},v=U.observe(s,r,p,hostile,true);
 ok((v.mode==='ready')===U.ready(s,r,p.x,p.z,energy,hostile));
 ok(!U.observe(s,r,p,hostile,false).mode.includes('ready'));
}
for(const low of [false,true])for(const calm of [false,true]){
 const calls=[],eng={cube:(...a)=>calls.push(a),faceted:(...a)=>calls.push(a.slice(1))};
 const v=U.observe(s,0,{x:0,z:0,energy:30},true,true);U.render(eng,s,0,0,v,low,calm);
 const ring=calls.filter(a=>a[1]===.10);ok(ring.length===(low||calm?8:16));for(const a of ring)ok(Math.abs(Math.hypot(a[0],a[2])-U.RANGE)<1e-9);
 calls.length=0;U.render(eng,s,1,0,v,low,calm);ok(!calls.some(a=>a[1]===.10));
}
ok(U.activate(s,0,0,0,30,true));ok(U.observe(s,0,{x:0,z:0,energy:0},true,true).mode==='jam');U.tick(s,6);ok(U.observe(s,0,{x:0,z:0,energy:100},true,true).mode==='spent');ok(!U.activate(s,0,0,0,100,true));ok(U.observe(s,1,{x:10,z:10,energy:29},true,true).mode==='energy');ok(U.observe(s,1,{x:10,z:10,energy:30},false,true).mode==='clear');ok(U.observe(s,3,{x:0,z:0},true,true).mode==='inactive');
console.log(`${n}/${n} signal forge assertions passed`);
