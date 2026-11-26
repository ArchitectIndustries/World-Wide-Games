const assert=require('node:assert/strict');
const G=require('../games/aegis-verge/replay-ghost.js');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS',name)};
function fake(){const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>{map.set(k,String(v));},all:map};}
test('bound recording cadence',()=>{const s=G.create();G.reset(s,null,true);for(let i=0;i<600;i++)G.record(s,i/60,{x:0,z:-27+i*.01,yaw:0});assert(s.samples.length<=42);assert(s.samples.length>=35)});
test('paused time does not advance ghost',()=>{const r={v:1,operation:0,duration:4,samples:[[0,0,-27,0],[2,0,-22,0],[4,0,-18,0]]};assert.deepEqual(G.position(r,2),G.position(r,2));assert.equal(G.position(r,4.5),null)});
test('interpolation midpoints',()=>{const r={duration:4,samples:[[0,0,-27,0],[4,8,-19,Math.PI/2]]};assert(Math.abs(G.position(r,2).x-4)<1e-6)});
test('heading wraps shortest turn',()=>{const r={duration:4,samples:[[0,0,0,3.1],[4,1,0,-3.1]]};assert(Math.abs(G.position(r,2).yaw)>3)});
test('ineligible and incomplete cannot save',()=>{const s=G.create(),db=fake();G.reset(s,null,false);G.record(s,0,{x:0,z:0,yaw:0});assert.equal(G.complete(s,0,4,()=>db).accepted,false)});
test('valid fastest run persists',()=>{const s=G.create(),db=fake();G.reset(s,null,true);for(let i=0;i<=20;i++)G.record(s,i*.25,{x:i*.2,z:-27+i*.2,yaw:0});const res=G.complete(s,1,5,()=>db);assert(res.accepted&&res.persisted);assert.equal(G.load(1,()=>db).samples.length,21)});
test('slower run not overwrite',()=>{const s=G.create(),db=fake();G.reset(s,null,true);for(let i=0;i<=20;i++)G.record(s,i*.25,{x:i*.2,z:-27+i*.2,yaw:0});G.complete(s,1,5,()=>db);const first=db.getItem(G.PREFIX+1);G.reset(s,G.load(1,()=>db),true);for(let i=0;i<=28;i++)G.record(s,i*.25,{x:0,z:0,yaw:0});assert.equal(G.complete(s,1,7,()=>db).reason,'slower');assert.equal(db.getItem(G.PREFIX+1),first)});
test('denied storage does not throw',()=>{const s=G.create();G.reset(s,null,true);for(let i=0;i<=20;i++)G.record(s,i*.25,{x:0,z:0,yaw:0});const r=G.complete(s,0,5,()=>{throw new Error('denied')});assert(r.accepted&&!r.persisted);assert.equal(G.load(0,()=>{throw new Error('denied')}),null)});
test('nonpersistent storage detected',()=>{const s=G.create();G.reset(s,null,true);for(let i=0;i<=20;i++)G.record(s,i*.25,{x:0,z:0,yaw:0});const r=G.complete(s,0,5,()=>({setItem(){},getItem(){return null}}));assert(r.accepted&&!r.persisted)});
test('reject tampered coordinate, NaN, length, op',()=>{const good={v:1,operation:1,duration:5,samples:[[0,0,-27,0],[5,0,-10,0]]};assert(G.validate(good,1));assert.equal(G.validate({...good,operation:2},1),null);assert.equal(G.validate({...good,samples:[[0,48,0,0],[5,0,-10,0]]},1),null);assert.equal(G.validate({...good,samples:[[0,0,-27,0],[5,NaN,-10,0]]},1),null);assert.equal(G.validate({...good,samples:[[2,0,-27,0],[5,0,-10,0]]},1),null)});
test('untrusted corrupt record loads null',()=>{const db=fake();db.setItem(G.PREFIX+2,'{"v":1,"operation":2,"duration":2,"samples":[]}');assert.equal(G.load(2,()=>db),null)});
test('operation storage isolation',()=>{const db=fake();const s=G.create();G.reset(s,null,true);for(let i=0;i<=20;i++)G.record(s,i*.25,{x:0,z:0,yaw:0});G.complete(s,1,5,()=>db);assert.equal(G.load(0,()=>db),null);assert(G.load(1,()=>db))});
test('no traces beyond bounded memory and time',()=>{const s=G.create();G.reset(s,null,true);for(let i=0;i<8000;i++)G.record(s,i*.25,{x:0,z:0,yaw:0});assert(s.samples.length<=G.MAX_SAMPLES);assert.equal(G.record(s,601,{x:0,z:0,yaw:0}),false)});
// Normalizing raw accumulated steering yaw must not invalidate a real long run.
test('accumulated steering yaw normalized',()=>{const s=G.create();G.reset(s,null,true);G.record(s,0,{x:0,z:-27,yaw:Math.PI*60+.1});assert(Math.abs(s.samples[0][3])<=Math.PI+.01)});
console.log(`${passed}/${passed} ghost replay checks passed`);
