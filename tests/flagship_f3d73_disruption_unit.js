'use strict';
const assert=require('node:assert/strict');
const D=require('../games/aegis-verge/crossfire-disruption.js');
const CB=require('../games/aegis-verge/counterplay.js');
const make=(extras={})=>({x:2,z:3,hp:5,max:5,dead:false,state:'windup',windup:.4,aimX:7,aimZ:9,staggerLeft:0,cool:0,siegeTarget:{x:4,z:8},...extras});
let n=0;
function test(name,condition){assert.ok(condition,name);n++;}
const a=make();test('module frozen',Object.isFrozen(D));
test('committed live enemy charge interrupted',D.apply(a,2,CB));
test('enemy enters actual stun state',a.state==='stagger'&&a.staggerLeft===CB.STAGGER_SECONDS);
test('weapon winding halted',a.windup===0&&a.cool>=CB.STAGGER_SECONDS);
test('siege charge target reset',a.siegeTarget===null);
test('old aim invalidated',a.aimX===a.x&&a.aimZ===a.z);
test('vulnerable to real cannon counterplay',CB.shotDamage(a)===2);
test('stun advances in real simulated time',CB.tick(a,.5)===true&&a.staggerLeft<CB.STAGGER_SECONDS);
test('stun expires into recovery',CB.tick(a,2)===false&&a.state==='recover');
for(const [name,enemy,damage] of [
 ['seek',make({state:'seek'}),3],['recover',make({state:'recover'}),3],['already staggered',make({state:'stagger'}),3],
 ['dead',make({dead:true}),3],['killed by bolt',make({hp:0}),3],['negative hp',make({hp:-4}),3],
 ['invalid hp',make({hp:NaN}),3],['zero damage',make(),0],['negative damage',make(),-1],
 ['invalid damage',make(),Infinity],['nan damage',make(),NaN]
]){let called=false;test(name+' ignored',D.apply(enemy,damage,{interrupt:()=>{called=true;return true}})===false&&!called);}
test('null enemy ignored',D.apply(null,2,CB)===false);
test('missing interrupt ignored',D.apply(make(),2,{})===false);
test('no counterplay ignored',D.apply(make(),2,null)===false);
const no=make();test('declined interruption returns false',D.apply(no,2,{interrupt:()=>false})===false&&no.siegeTarget!==null);
const called=make();let count=0;test('once per real application',D.apply(called,1,{interrupt:e=>{count++;e.state='stagger';return true}})&&count===1);
console.log('F3D73 crossfire disruption '+n+'/'+n+' passed');
