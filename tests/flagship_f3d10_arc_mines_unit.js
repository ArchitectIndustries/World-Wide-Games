'use strict';
const assert=require('node:assert/strict');
const AM=require('../games/aegis-verge/arc-mines.js');
const CP=require('../games/aegis-verge/checkpoint.js');
let assertions=0;function ok(v,msg){assert.ok(v,msg);assertions++}function eq(a,b,msg){assert.deepEqual(a,b,msg);assertions++}
const sites=[{x:0,z:0},{x:12,z:0},{x:24,z:0}];
const s=AM.create(sites);eq(AM.snapshot(s),[2,2,2],'fresh mines all armored');
ok(s.sites[0]!==sites[0],'immutable coords cloned');ok(!AM.validHp([0,2]),'reject missing mine');ok(!AM.validHp([0,2,3]),'reject excess HP');ok(!AM.validHp([0,2,NaN]),'reject NaN');ok(!AM.validHp([0,2,'1']),'reject coerced values');
eq(AM.tick(s,0,6,0,.1),null,'outside trigger');eq(AM.tick(s,0,4,0,.1),'warning','enter warning radius');ok(s.left[0]===AM.WARNING,'fixed warning window');
eq(AM.tick(s,0,4,0,.5),null,'not instant blast');eq(AM.tick(s,0,50,0,.9),'blast','blast after window even if retreated');eq(AM.snapshot(s),[0,2,2],'blast one-shot');eq(AM.tick(s,0,0,0,5),null,'blast never repeats');
const v=AM.create(sites);let a=AM.hit(v,1,1);ok(a.hit&&!a.disabled&&a.hp===1,'first shot weakens');a=AM.hit(v,1,1);ok(a.hit&&a.disabled&&a.hp===0,'second shot disables');ok(!AM.hit(v,1,1).hit,'spent cannot farm');ok(AM.tick(v,1,12,0,30)===null,'spent cannot arm');eq(AM.snapshot(v),[2,0,2],'HP snap');
const u=AM.create(sites,[2,1,0]);eq(AM.snapshot(u),[2,1,0],'restore partial and spent');ok(!AM.create(sites).phase.includes('warning'),'no spontaneous warning');
let rejected=false;try{AM.create(sites,[0,0,5])}catch{rejected=true}ok(rejected,'invalid restore throws');
let inter=AM.intercept(AM.create(sites),0,-4,0,4,0,(ax,az,bx,bz,x,z,r)=>{return x===0&&r===1.35?.33:null});ok(inter&&inter.index===0&&inter.t===.33,'can intercept true segment');
const saveState={op:0,relay:1,hull:85,energy:62,score:340,recoveriesLeft:1,elapsed:12,damageTaken:15,clean:false,barrierHp:[5,5,0],uplinkUsed:[false,true,false]};
const raw={...saveState,version:CP.VERSION,savedAt:Date.now()};
const legacy=CP.validate(raw);eq(legacy.mineHp,[2,2,2],'old checkpoints valid');
const partial=CP.validate({...raw,mineHp:[0,1,2]});eq(partial.mineHp,[0,1,2],'partial mine checkpoint valid');
for(const bad of [[2,2,3],[0,-1,2],[0,1],[0,1,null],{'0':0,'1':2,'2':2}]){ok(CP.validate({...raw,mineHp:bad})===null,'reject invalid checkpoint mine values')}
const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
ok(CP.save(storage,{...saveState,mineHp:[0,1,2]}),'save valid');eq(CP.load(storage,1).mineHp,[0,1,2],'load saved snapshot');ok(CP.load(storage,1).relay===1,'progress preserved');
let fail=false;try{AM.create([])}catch{fail=true}ok(fail,'reject broken sites');
console.log(JSON.stringify({suite:'F3D10 arc mines + checkpoint',assertions,passed:true}));
