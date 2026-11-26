'use strict';
const assert=require('node:assert/strict'), H=require('../games/aegis-verge/hostile-telegraphs.js'),T=require('../games/aegis-verge/tactics.js'),F=require('../games/aegis-verge/projectile-lifetime.js');
let n=0;const ok=(x,m)=>{assert.ok(x,m);n++};
for(const type of Object.keys(H.VOLLEYS))for(const angle of [0,.4,Math.PI/2,Math.PI,-1.2]){
 const e={type,state:'windup',x:0,z:0,aimX:Math.sin(angle)*10,aimZ:Math.cos(angle)*10,windup:.5,windupTotal:1};
 const lanes=H.lanes(e,[],T.firstCover);
 ok(lanes.length===H.pattern(type).offsets.length);
 for(const l of lanes){const p={x:0,z:0,vx:Math.sin(l.angle)*l.speed,vz:Math.cos(l.angle)*l.speed,life:H.PROJECTILE_LIFE};while(F.advance(p,1/60)){};ok(Math.hypot(p.x-l.endX,p.z-l.endZ)<1e-8,'flight endpoint');ok(Math.abs(l.length-l.speed*H.PROJECTILE_LIFE)<1e-8);}
 const center=lanes.find(l=>l.offset===0);const pos=d=>({x:Math.sin(angle)*d,z:Math.cos(angle)*d});
 ok(H.dangerAt(e,lanes,pos(center.length-.2),T.segmentCircle));ok(!H.dangerAt(e,lanes,pos(center.length+H.PLAYER_RADIUS+.1),T.segmentCircle));
 ok(!H.dangerAt({...e,dead:true},lanes,pos(8),T.segmentCircle));ok(!H.dangerAt({...e,siegeTarget:{}},lanes,pos(8),T.segmentCircle));
}
const e={type:'lancer',state:'windup',x:0,z:-20,aimX:0,aimZ:20,windup:.5,windupTotal:1};const ls=H.lanes(e,[],T.firstCover);
ok(ls[0].length===56);ok(H.dangerAt(e,ls,{x:0,z:20},T.segmentCircle));ok(!H.dangerAt(e,ls,{x:1.36,z:20},T.segmentCircle));ok(H.dangerAt(e,ls,{x:1.34,z:20},T.segmentCircle));
const blocked=H.lanes(e,[{x:0,z:0,w:3,d:3}],T.firstCover);ok(blocked[0].blocked);ok(Math.abs(blocked[0].endZ+1.62)<1e-8);ok(!H.dangerAt(e,blocked,{x:0,z:20},T.segmentCircle));
ok(!H.dangerAt(e,blocked,{x:0,z:blocked[0].endZ+H.PLAYER_RADIUS},T.segmentCircle),'wall wins tie');
const calls=[];ok(H.render({cube:(...a)=>calls.push(a)},e,[],T.firstCover,true,true,ls)===1);ok(calls[0][5]===56);ok(H.dangerLabel(H.dangerAt(e,ls,{x:0,z:20},T.segmentCircle)).includes('CURRENT POSITION IN A FIRING LANE'));
console.log(`${n}/${n} full-range threat assertions passed`);
