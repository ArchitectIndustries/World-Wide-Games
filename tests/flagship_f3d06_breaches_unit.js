'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const base=path.join(__dirname,'../games/aegis-verge');
const BC=require(path.join(base,'breachable-cover.js'));
const T=require(path.join(base,'tactics.js'));
let count=0;function test(label,fn){fn();count++;console.log('PASS',label)}
for(let op=0;op<3;op++){
 const records=T.coverFor(op),s=BC.create(records),b=records[0];
 test('op '+op+' initial barricades and HP',()=>{assert.equal(s.health.size,3);assert.equal(BC.live(s).length,8);assert.equal(BC.status(s,0).hp,5)});
 test('op '+op+' blocked collision before breach',()=>assert.equal(T.free(b.x,b.z,BC.live(s),.9),false));
 test('op '+op+' real line-of-sight obstruction before breach',()=>assert.equal(T.firstCover(b.x-b.w,b.z,b.x+b.w,b.z,BC.live(s)).block.id,0));
 test('op '+op+' chip and clamp',()=>{assert.deepEqual(BC.strike(s,0,2),{hit:true,breached:false,before:5,hp:3});assert.equal(BC.status(s,0).hp,3)});
 test('op '+op+' remove geometry on lethal hit',()=>{const r=BC.strike(s,0,3);assert.equal(r.breached,true);assert.equal(s.breaches,1);assert.equal(BC.status(s,0).hp,0);assert.ok(!BC.live(s).some(x=>x.id===0))});
 test('op '+op+' no repeat breach/scoring side effects',()=>{assert.equal(BC.strike(s,0,2).hit,false);assert.equal(s.breaches,1);assert.ok(!('score' in s))});
 test('op '+op+' solid ordinary cover unaffected',()=>{const r=BC.strike(s,1,10);assert.equal(r.hit,false);assert.ok(BC.live(s).some(x=>x.id===1))});
 test('op '+op+' invalid damage gated',()=>{assert.equal(BC.strike(s,3,-4).hit,false);assert.equal(BC.strike(s,3,NaN).hit,false);assert.equal(BC.status(s,3).hp,5)});
}
const a=BC.create(T.coverFor(0)),b=BC.create(T.coverFor(0));BC.strike(a,0,5);
test('new operation regenerates undamaged cover',()=>{assert.equal(BC.status(b,0).hp,5);assert.ok(BC.live(b).some(x=>x.id===0))});
test('source cover records remain immutable',()=>assert.equal(Object.isFrozen(a.source[0]),true));
console.log(JSON.stringify({suite:'F3D06 breachable cover state and collision',passed:count,total:count}));
