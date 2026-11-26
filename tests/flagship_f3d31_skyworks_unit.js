'use strict';
const assert=require('node:assert/strict');
const S=require('../games/aegis-verge/skyworks.js');
const T=require('../games/aegis-verge/tactics.js');
let count=0;function ok(title,fn){fn();count++;console.log('PASS',title)}
const anchors=[[-22,-13],[20,-8],[0,17]];
ok('three distinct original palette themes',()=>assert.equal(new Set([0,1,2].map(i=>S.theme(i).lit)).size,3));
ok('invalid operation falls back deterministically',()=>assert.deepEqual(S.theme(NaN),S.theme(0)));
for(let op=0;op<3;op++){
 const g=S.skyline(op);const low=S.limited(g,true);
 ok(`operation ${op} skyline contains bounded authored geometry`,()=>assert(g.length>=65&&g.length<=110));
 ok(`operation ${op} low-tier skyline smaller`,()=>assert(low.length<g.length&&low.length<=45));
 ok(`operation ${op} deterministic skyline`,()=>assert.deepEqual(g,S.skyline(op)));
 ok(`operation ${op} finite mesh dimensions, emissive values`,()=>assert(g.every(q=>[q.x,q.y,q.z,q.sx,q.sy,q.sz,q.yaw,q.em].every(Number.isFinite)&&q.sx>0&&q.sy>0&&q.sz>0&&q.em>=0&&q.em<=1)));
 ok(`operation ${op} worksite supports real collision boundary`,()=>assert(g.filter(q=>q.y>1).every(q=>Math.hypot(q.x,q.z)>46)));
 ok(`operation ${op} non-colliding inlaid panels stay below ground`,()=>assert(g.filter(q=>q.y<=1).every(q=>q.y<=-.01&&q.sy<.05)));
 ok(`operation ${op} gameplay cover geometry not mutated`,()=>{const b=T.coverFor(op),old=JSON.stringify(b);S.skyline(op);assert.equal(JSON.stringify(b),old)});
}
ok('future relay is dim',()=>assert.equal(S.relayState(2,0),'future'));
ok('active relay recognized',()=>assert.equal(S.relayState(0,0),'active'));
ok('security surge changes current state',()=>assert.equal(S.relayState(1,1,true),'warning'));
ok('completed relay marked powered',()=>assert.equal(S.relayState(0,1),'powered'));
ok('extraction powers all relays',()=>assert.equal(S.relayState(2,3),'powered'));
ok('out of bounds returns safe state',()=>assert.equal(S.relayState(44,3),'future'));
const active=S.geometry(0,anchors,0,1,false,false,false),warn=S.geometry(0,anchors,0,1,false,false,true),power=S.geometry(0,anchors,1,1,false,false,false);
ok('active and surge warning geometry differ',()=>assert.notDeepEqual(active,warn));
ok('active and powered relay geometry differ',()=>assert.notDeepEqual(active,power));
ok('all relay architecture floats above hitbox',()=>assert(active.every(q=>q.y-q.sy/2>=4.8)));
ok('effect-limited reduces geometry',()=>assert(S.geometry(0,anchors,0,1,true,true).length<active.length));
ok('calm mode freezes animation',()=>assert.deepEqual(S.geometry(0,anchors,0,1,false,true),S.geometry(0,anchors,0,45,false,true)));
ok('normal animation reacts to simulation time',()=>assert.notDeepEqual(S.geometry(0,anchors,0,1,false,false),S.geometry(0,anchors,0,45,false,false)));
ok('no malformed points emitted',()=>assert.deepEqual(S.geometry(0,[[NaN,0],null,[0,1]],0),S.geometry(0,[null,null,[0,1]],0)));
ok('draw backend receives only valid first-party geometry',()=>{let n=0;const result=S.render({cubeBatch:items=>{n=items.length;assert(items.every(q=>q.color.startsWith('#')))}},{op:0,relays:anchors,relay:0,elapsed:1,low:true,calm:true,warning:false});assert.equal(n,result)});
ok('render without engine safe',()=>assert.equal(S.render(null,{op:0,relays:anchors,relay:0,elapsed:1,low:true,calm:true,warning:false}),9));
console.log(`SUMMARY ${count}/${count} first-party Skyworks geometry and objective-state assertions`);
