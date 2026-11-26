'use strict';
const assert=require('node:assert/strict');
const H=require('../games/aegis-verge/hazard-evasion.js');
const M=require('../games/aegis-verge/arc-mines.js');
const T=require('../games/aegis-verge/tactics.js');
let count=0;function ok(value,label){assert.ok(value,label);count++}function eq(a,b,label){assert.deepEqual(a,b,label);count++}
const newMine=()=>{const m=M.create([{x:0,z:0},{x:13,z:0},{x:26,z:0}]);m.phase[0]='warning';m.left[0]=1.1;return m;};
const newActor=(type='skirmisher',x=2,z=0)=>({type,x,z,state:'seek',yaw:0,path:[{x:3,z:2}],navAt:10,hp:2,dead:false});
const m=newMine(),e=newActor();
const old=Math.hypot(e.x,e.z);
ok(H.evade(e,e.type,m,0,1/60,[],T,M),'uncommitted light drone moves away');
ok(Math.hypot(e.x,e.z)>old,'distance increased');
ok(Math.hypot(e.x-2,e.z)<4.3*H.RESPONSE/60+.0001,'no speed-limit violation');
eq(e.state,'evade','visible tactical state');eq(e.path,[],'invalidates old enemy route');eq(e.navAt,0,'route replanned');
for(const type of ['lancer','skirmisher']){const q=newActor(type);ok(H.evade(q,type,m,0,1/60,[],T,M),type+' dodges');}
for(const type of ['warden','bulwark']){const q=newActor(type);eq(H.evade(q,type,m,0,1/60,[],T,M),false,type+' does not dodge');eq(q.x,2,'heavy position unchanged');}
for(const state of ['windup','stagger']){const q=newActor();q.state=state;eq(H.evade(q,q.type,m,0,1/60,[],T,M),false,state+' commitment retained');eq(q.state,state,'state preserved');}
const noWarning=newMine();noWarning.phase[0]='idle';eq(H.evade(newActor(),'skirmisher',noWarning,0,1/60,[],T,M),false,'no inactive dodge');
const spent=newMine();spent.phase[0]='spent';eq(H.evade(newActor(),'skirmisher',spent,0,1/60,[],T,M),false,'no spent-mine dodge');
eq(H.evade(newActor('skirmisher',7,0),'skirmisher',m,0,1/60,[],T,M),false,'outside radius no dodge');
const blocked=newActor('skirmisher',4,0);eq(H.evade(blocked,'skirmisher',m,0,1/60,[{id:10,x:2,z:0,w:1,d:3}],T,M),false,'cover already blocks shockwave');
const edge=newActor('skirmisher',37.1,0),edgeM=M.create([{x:35,z:0},{x:13,z:0},{x:26,z:0}]);edgeM.phase[0]='warning';ok(!H.evade(edge,'skirmisher',edgeM,0,1/60,[],T,M)||edge.x<=38-.91,'world bounds respected');
for(const invalid of [-1,3,1.4])eq(H.evade(newActor(),'skirmisher',m,invalid,1/60,[],T,M),false,'invalid relay');
for(const invalid of [-.01,0,.1,NaN])eq(H.evade(newActor(),'skirmisher',m,0,invalid,[],T,M),false,'invalid timestep');
eq(H.evade(null,'skirmisher',m,0,1/60,[],T,M),false,'null enemy');
eq(H.evade({...newActor(),dead:true},'skirmisher',m,0,1/60,[],T,M),false,'dead enemy');
eq(H.evade(newActor(),'skirmisher',m,0,1/60,null,T,M),false,'missing cover collection');
const stationary=newActor();ok(!H.evade(stationary,'skirmisher',m,1,1/60,[],T,M),'only active relay warning');
console.log(JSON.stringify({suite:'F3D13 original hazard-aware drone evasion',passed:count,total:count}));
