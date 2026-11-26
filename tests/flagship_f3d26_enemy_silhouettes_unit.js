'use strict';
const assert=require('node:assert/strict');
const ES=require('../games/aegis-verge/enemy-silhouettes.js');
let count=0;const t=(name,fn)=>{fn();count++;};
const TYPES=['skirmisher','lancer','bulwark','warden'];
const e=(type,state='seek')=>({type,size:1.7,x:2,z:4,yaw:Math.PI/2,idx:1,flash:0,state});
for(const type of TYPES){
 t(type+' expected palette',()=>assert.ok(ES.PALETTE[type].startsWith('#')));
 t(type+' finite original geometry',()=>assert.ok(ES.parts(e(type),'full',.7).every(p=>[p.r,p.y,p.f,p.w,p.h,p.d,p.em].every(Number.isFinite)&&p.w>0&&p.h>0&&p.d>0)));
 t(type+' bounded 3D body',()=>assert.ok(ES.parts(e(type)).length<=14));
 t(type+' detail LOD is bounded',()=>assert.ok(ES.parts(e(type),'lite').length<ES.parts(e(type),'full').length));
 t(type+' charged core changes color',()=>assert.ok(ES.parts(e(type,'windup')).some(p=>p.name==='charging-core'&&p.color==='#fbbf24')));
 t(type+' stagger exposes cyan',()=>assert.ok(ES.parts(e(type,'stagger')).some(p=>p.name==='exposed-core'&&p.color==='#67e8f9')));
}
t('identities physically distinct',()=>{let sets=TYPES.map(type=>ES.parts(e(type)).map(p=>p.name).join('/'));assert.equal(new Set(sets).size,4)});
t('hit flash changes armor paint',()=>{let q=e('lancer');q.flash=.1;assert.ok(ES.parts(q).some(p=>p.name==='armor'&&p.color==='#ffffff'))});
t('calm is steady',()=>{let q=e('warden','stagger');assert.deepEqual(ES.parts(q,'full',5,true),ES.parts(q,'full',15,true))});
t('pose rotates right/forward local coordinates and preserves origin',()=>{const cubes=[];const eng={cube:(...x)=>cubes.push(x)};const q=e('lancer');q.yaw=0;ES.render(eng,q,'lite',0,true);let a=cubes.find(c=>c[5]===ES.parts(q,'lite')[0].d);assert.ok(a);assert.equal(a[0],2);assert.equal(a[2],4);});
t('render returns bounded count',()=>{let n=0;const eng={cube:()=>n++};assert.equal(ES.render(eng,e('warden'),'full',0,true),n);assert.ok(n<=14)});
t('unknown type falls back safely',()=>{assert.ok(ES.parts(e('unknown'),'lite').length>0)});
console.log(JSON.stringify({passed:count,failed:0}));
