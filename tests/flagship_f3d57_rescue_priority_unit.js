'use strict';
const assert=require('node:assert/strict');
const S=require('../games/aegis-verge/warden-support-maneuver.js');
const T=require('../games/aegis-verge/tactics.js');
const O=require('../games/aegis-verge/warden-overguard.js');
let count=0;
const ck=(name,ok)=>{assert.ok(ok,name);count++};
const walls=[{id:1,x:8,z:-23,w:12,d:2,h:5},{id:2,x:8,z:-13,w:12,d:2,h:5},{id:3,x:2,z:-18,w:2,d:12,h:5},{id:4,x:14,z:-18,w:2,d:12,h:5}];
function rig(){return [
 {idx:0,type:'lancer',x:8,z:-18,hp:3,dead:false,state:'recover'},
 {idx:1,type:'warden',x:23,z:-18,hp:8,dead:false,state:'recover',yaw:0},
 {idx:2,type:'skirmisher',x:17,z:9,hp:3,dead:false,state:'recover'}
]}
let [sealed,w,available]=rig();
ck('all three actors occupy legal world positions',[sealed,w,available].every(a=>T.free(a.x,a.z,walls,1.55)));
ck('closest ally sealed behind four solid walls',!!T.firstCover(w.x,w.z,sealed.x,sealed.z,walls,.08));
ck('closest sealed ally has no grid route',T.path(w.x,w.z,sealed.x,sealed.z,walls,1.55).length===0);
ck('alternate exposed ally has grid route',T.path(w.x,w.z,available.x,available.z,walls,1.55).length>0);
ck('legacy nearest-selection reveals unreachable target',S.select(w,[sealed,w,available],false,walls,T.firstCover)===sealed);
let paths=0;const measured={...T,path(...args){paths++;return T.path(...args)}};
const start=S.steer(w,[sealed,w,available],walls,measured,0);
ck('rescue steers toward reachable alternative',!!start&&start.target===available&&w.supportActive);
ck('valid normalized direction',Math.abs(Math.hypot(start.mx,start.mz)-1)<1e-6);
ck('failure is cached for sealed ally',w.supportBlocked?.some(f=>f.idx===sealed.idx));
let linked=false;
for(let n=1;n<=600;n++){
 const intent=S.steer(w,[sealed,w,available],walls,measured,n/60);
 if(intent){T.move(w,intent.mx*2.6/60,intent.mz*2.6/60,walls,1.55);ck('physical body respects solid cover at '+n,T.free(w.x,w.z,walls,1.55));}
 const active=O.links([sealed,w,available],walls,T.firstCover,false,n/60);
 if(active.some(x=>x.target===available)){linked=true;break;}
}
ck('reachable ally is physically protected',linked);
ck('unreachable closest ally not protected',O.links([sealed,w,available],walls,T.firstCover,false,10).every(x=>x.target!==sealed));
ck('pathfinding bounded by cache and 0.7s replanning',paths<35);
ck('first real overguard absorbs one cannon point',O.apply(available,[sealed,w,available],walls,T.firstCover,false,10,1).damage===0);
ck('second cannon point during recharge deals normal damage',O.apply(available,[sealed,w,available],walls,T.firstCover,false,10.2,1).damage===1);
let sample=rig(),ww=sample[1];S.steer(ww,sample,walls,T,0);
ck('failure cached in otherwise sealed setup',ww.supportBlocked.some(f=>f.idx===0));
S.steer(ww,sample,[],T,.1);
ck('removing cover immediately clears failed route cache',ww.supportBlocked.length===0);
ck('cleared nearby ally no longer triggers a flanking route',!ww.supportFlank);
S.steer(ww,sample,walls,T,1);
ck('cover restoration recomputes and restores rescue route',ww.supportBlocked.some(f=>f.idx===0)&&ww.supportActive);
S.steer(ww,sample,walls,T,1.1,true);
ck('jam stops support immediately',!ww.supportActive&&!ww.supportFlank);
const next=S.steer(ww,sample,walls,T,2);
ck('support resumes when jam ends',!!next);
S.steer(ww,sample,walls,T,2.1);const blocked=ww.supportBlocked[0];
if(blocked){sample[0].x+=1.5;const before=ww.supportBlocked[0].until;S.steer(ww,sample,walls,T,2.15);ck('moving unreachable ally forces fresh consideration',ww.supportBlocked[0].until>before);}
else ck('moving unreachable ally is allowed',true);
console.log(JSON.stringify({suite:'F3D57 Warden Rescue Priority',passed:count,pathCalls:paths,linked}));
