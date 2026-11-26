'use strict';
const assert=require('node:assert/strict');
const ES=require('../games/aegis-verge/enemy-silhouettes.js');
let checks=0;
function ok(name,fn){fn();checks++;console.log('PASS',name)}
const make=(type,state='seek',extra={})=>({type,size:({skirmisher:1.4,lancer:1.7,bulwark:2.1,warden:2.4})[type],
 x:0,z:0,yaw:0,idx:0,flash:0,state,windup:.8,windupTotal:1,travelDistance:0,motionRate:0,...extra});
const get=(e,n,quality='full',calm=false)=>ES.parts(e,quality,2,calm).find(x=>x.name===n);
for(const type of ['skirmisher','lancer','bulwark','warden']){
 ok(type+' idle pose finite and bounded',()=>assert(ES.parts(make(type)).every(p=>[p.r,p.f,p.y,p.w,p.h,p.d,p.em].every(Number.isFinite))));
 ok(type+' animation freeze in calm at fixed combat state',()=>assert.deepEqual(ES.parts(make(type,'seek',{motionRate:1,travelDistance:8}),'full',3,true),ES.parts(make(type,'seek',{motionRate:1,travelDistance:8}),'full',9,true)));
 ok(type+' moving pose differs from idle',()=>assert.notDeepEqual(ES.parts(make(type,'seek',{motionRate:1,travelDistance:4}),'full',3),ES.parts(make(type),'full',3)));
 ok(type+' unchanged part counts and tier cap',()=>{assert(ES.parts(make(type),'full').length<=14);assert(ES.parts(make(type),'lite').length<=ES.parts(make(type),'full').length)});
 ok(type+' charging communicates countdown',()=>{const a=ES.parts(make(type,'windup',{windup:.9}),'full'),b=ES.parts(make(type,'windup',{windup:.05}),'full');assert.notDeepEqual(a,b);assert(b.some(p=>p.name==='charging-core'&&p.color==='#fbbf24'))});
 ok(type+' no gameplay state mutation',()=>{const e=make(type,'windup',{windup:.4});const json=JSON.stringify(e);ES.parts(e);assert.equal(JSON.stringify(e),json)});
}
ok('skirmisher wings and rear jets move based on real travel',()=>{assert.notEqual(get(make('skirmisher','seek',{travelDistance:3,motionRate:1}),'swept-fin').r,get(make('skirmisher'),'swept-fin').r)});
ok('lancer rails physically extend during genuine countdown',()=>{assert(get(make('lancer','windup',{windup:.1}),'lance').f>get(make('lancer','windup',{windup:1}),'lance').f)});
ok('bulwark armor opens while charging and staggered',()=>{assert(get(make('bulwark','stagger'),'shield-shoulder').r!==get(make('bulwark'),'shield-shoulder').r)});
ok('warden command crown rises while charging',()=>{assert(get(make('warden','windup',{windup:.01}),'crown').y>get(make('warden','windup',{windup:1}),'crown').y)});
ok('warden back reactor remains on actual rear side',()=>{assert(get(make('warden'),'rear-reactor').f<0)});
ok('lightweight mode retains amber charge core',()=>{assert(ES.parts(make('lancer','windup',{windup:.1}),'lite').some(p=>p.name==='charging-core'))});
ok('calm freezes gait but preserves distinct windup state',()=>{const a=make('warden','windup',{windup:.05,travelDistance:4,motionRate:1});assert.notDeepEqual(ES.parts(a,'lite',1,true),ES.parts(make('warden'),'lite',1,true));assert.deepEqual(ES.parts(a,'lite',1,true),ES.parts(a,'lite',8,true))});
ok('blocked enemy zero motion never sprints in place',()=>{assert.deepEqual(ES.parts(make('lancer','seek',{travelDistance:0,motionRate:0}),'full',3,true),ES.parts(make('lancer','seek',{travelDistance:8,motionRate:0}),'full',3,true))});
ok('renderer passes finite first-party geometry',()=>{let cubes=[];const x=make('warden','windup',{windup:.01});assert.equal(ES.render({cube:(...a)=>cubes.push(a)},x,'full',0,true),cubes.length);assert(cubes.every(a=>a.slice(0,6).every(Number.isFinite)))});
console.log(JSON.stringify({passed:checks,failed:0}));
