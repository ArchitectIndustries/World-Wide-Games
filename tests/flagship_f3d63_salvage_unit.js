'use strict';
const assert=require('node:assert/strict');
const F=require('../games/aegis-verge/field-cache.js'),B=require('../games/aegis-verge/salvage-beacon.js');
const sites=[{x:0,z:0},{x:12,z:0},{x:-12,z:0}];let checks=0;
function ok(name,fn){fn();checks++;console.log('PASS',name)}
function fresh(){return F.create(sites)}
const actor={x:0,z:2,hull:35,energy:40};
ok('fresh cache inactive',()=>assert.deepEqual(B.snapshot(fresh(),0),{index:0,x:0,z:0,spent:false,active:false,left:0,ratio:0}));
ok('reject invalid cache',()=>assert.equal(B.snapshot(null,0),null));
ok('reject out of range index',()=>assert.equal(B.snapshot(fresh(),8),null));
ok('reject non-integer index',()=>assert.equal(B.snapshot(fresh(),.5),null));
ok('render absent engine',()=>assert.equal(B.render(null,fresh(),0,actor),0));
ok('render unopened cache is zero',()=>{let n=0;assert.equal(B.render({cube(){n++}},fresh(),0,actor),0);assert.equal(n,0)});
const s=fresh();
ok('real game field channel starts',()=>assert.equal(F.begin(s,0,actor,[],()=>null),true));
ok('at start 0 percent',()=>assert.equal(B.snapshot(s,0).ratio,0));
ok('countdown progresses through real authoritative field cache',()=>{assert.equal(F.tick(s,actor,.675,false,[],()=>null),'channeling');assert(Math.abs(B.snapshot(s,0).ratio-.5)<1e-6)});
ok('rendered full tier has bounded ring+tether+core',()=>{let q=[];const result=B.render({cube(...args){q.push(args)}},s,0,actor,{low:false,calm:false});assert.equal(result,15);assert.equal(q.length,result);assert.equal(q.filter(x=>x[6]==='#a7f3d0').length,6)});
ok('low tier has 8 segments',()=>{let q=[];assert.equal(B.render({cube(...args){q.push(args)}},s,0,actor,{low:true,calm:false}),11);assert.equal(q.filter(x=>x[6]==='#a7f3d0').length,4)});
ok('reduce FX keeps readable ring',()=>{let q=[];assert.equal(B.render({cube(...args){q.push(args)}},s,0,actor,{low:true,calm:true}),10);assert.equal(q.filter(x=>x[6]==='#a7f3d0').length,4)});
ok('no player link outside validated range',()=>{let q=[];assert.equal(B.render({cube(...args){q.push(args)}},s,0,{x:20,z:20},{low:true}),9)});
ok('negative and NaN timer bounded',()=>{const t={...s,left:NaN};assert.equal(B.snapshot(t,0).ratio,0);t.left=-5;assert.equal(B.snapshot(t,0).ratio,1);t.left=500;assert.equal(B.snapshot(t,0).ratio,0)});
ok('normal progress never consumes resources or changes score',()=>{const hp=actor.hull,e=actor.energy;B.render({cube(){}},s,0,actor);assert.equal(actor.hull,hp);assert.equal(actor.energy,e);assert.equal(s.used[0],false)});
ok('shield interrupts real channel and stops art',()=>{assert.equal(F.tick(s,actor,.1,true,[],()=>null),'interrupted');assert.equal(B.render({cube(){}},s,0,actor),0);assert.equal(B.snapshot(s,0).ratio,0)});
ok('channel can restart after interrupt',()=>{assert.equal(F.begin(s,0,actor,[],()=>null),true);assert.equal(F.tick(s,actor,1.35,false,[],()=>null).type,'recovered')});
ok('used cache never renders live countdown',()=>{assert.equal(B.snapshot(s,0).spent,true);assert.equal(B.render({cube(){}},s,0,actor),0)});
ok('new operations reset state',()=>{const next=fresh();assert.equal(B.snapshot(next,0).spent,false);assert.equal(B.snapshot(next,0).active,false)});
ok('no other active site visual false positives',()=>{const next=fresh();F.begin(next,0,actor,[],()=>null);assert.equal(B.render({cube(){}},next,1,actor),0)});
console.log(JSON.stringify({passed:checks,total:checks,suite:'F3D63 field cache 3D countdown from authoritative real game channel'}));
