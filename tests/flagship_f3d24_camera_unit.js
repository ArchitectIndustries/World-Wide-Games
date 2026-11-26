/* Original first-party F3D24 camera collision unit suite. */
'use strict';
const assert=require('node:assert/strict');
const C=require('../games/aegis-verge/camera-occlusion.js');
const T=require('../games/aegis-verge/tactics.js');
let count=0;function test(n,fn){fn();count++;console.log('PASS '+n)}
const box={id:4,x:0,z:0,w:3,d:3,h:4};
const from={x:-8,y:1.5,z:0},to={x:8,y:1.5,z:0};
test('3D cast hits expanded real cover',()=>assert.ok(C.cast(from,to,box)>0));
test('3D cast misses roof above',()=>assert.equal(C.cast({...from,y:7},{...to,y:7},box),null));
test('3D cast misses lateral offset',()=>assert.equal(C.cast({...from,z:8},{...to,z:8},box),null));
test('3D cast misses vertically below low floor',()=>assert.equal(C.cast({...from,y:-2},{...to,y:-2},box),null));
test('3D cast finds first blocker independent of input order',()=>{const a={...box,id:1,x:-4};assert.equal(C.first(from,to,[box,a]).blockId,1);});
test('segment tangency is conservative',()=>assert.notEqual(C.cast({...from,z:1.84},{...to,z:1.84},box),null));
test('no dependency on color or render geometry',()=>assert.ok(C.cast(from,to,{...box,color:null})!==null));
test('normal open ground retains parent camera',()=>{const r=C.resolve({x:0,z:-27,yaw:0},T.coverFor(0));assert.equal(r.mode,'normal');assert.equal(r.eye.y,8);assert.equal(r.eye.z,-38);});
test('camera behind real barricade elevates',()=>{const p={x:-19,z:0,yaw:Math.PI*1.5};const r=C.resolve(p,T.coverFor(0));assert.equal(r.mode,'elevated');assert.ok(r.eye.y>8);assert.equal(C.first({x:p.x,y:1.55,z:p.z},r.eye,T.coverFor(0)),null);});
test('3D roof matters: camera not falsely rejected for pass over low cover',()=>{const block={...box,h:.5,x:-4,z:-2};const p={x:0,z:0,yaw:Math.PI/2};assert.equal(C.resolve(p,[block]).mode,'normal');});
test('removed barrier restores original chase camera',()=>{const p={x:-19,z:0,yaw:Math.PI*1.5},all=T.coverFor(0);const r=C.resolve(p,all);assert.equal(r.mode,'elevated');assert.equal(C.resolve(p,all.filter(b=>b.id!==2)).mode,'normal');});
test('operation 2 and 3 author geometry always return finite camera',()=>{for(let op=1;op<3;op++){const c=T.coverFor(op);for(let yaw of [0,1.57,3.14,4.71]){let q=C.resolve({x:0,z:-27,yaw},c);assert.ok(Number.isFinite(q.eye.x)&&Number.isFinite(q.eye.y)&&Number.isFinite(q.eye.z));}}});
test('no cover mutation or player transform mutation',()=>{const p={x:-19,z:0,yaw:Math.PI*1.5},blocks=T.coverFor(0),before=JSON.stringify([p,blocks]);C.resolve(p,blocks);assert.equal(JSON.stringify([p,blocks]),before);});
test('high unroofed wall forces fallback overhead or shortened camera',()=>{const p={x:0,z:0,yaw:0},wall={id:4,x:0,z:-2.4,w:5,d:1,h:70};const q=C.resolve(p,[wall]);assert.ok(['overhead','shortened'].includes(q.mode));assert.equal(C.first({x:p.x,y:1.55,z:p.z},q.eye,[wall]),null);});
test('cast rejects invalid coordinates safely',()=>assert.equal(C.cast({x:NaN,y:1,z:0},to,box),null));
test('empty cover retains normal distance',()=>{const q=C.resolve({x:3,z:5,yaw:Math.PI},[]);assert.equal(Math.hypot(q.eye.x-3,q.eye.z-5),11);});
test('player with non-finite yaw defaults to bounded normal shot',()=>{const q=C.resolve({x:0,z:0,yaw:NaN},[]);assert.deepEqual(q.eye,{x:0,y:8,z:-11});});
console.log(`F3D24 camera tests ${count}/${count} passed`);
