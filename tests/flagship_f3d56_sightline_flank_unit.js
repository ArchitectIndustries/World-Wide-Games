'use strict';
const assert=require('node:assert/strict');
const S=require('../games/aegis-verge/warden-support-maneuver.js');
const T=require('../games/aegis-verge/tactics.js');
const O=require('../games/aegis-verge/warden-overguard.js');
let passed=0;
function check(label,ok){assert.ok(ok,label);passed++;}
function make(){return [{idx:0,type:'lancer',x:8,z:-18,hp:3,dead:false,state:'recover'}, {idx:1,type:'warden',x:18,z:-18,hp:8,dead:false,state:'recover',yaw:0}];}
const blocks=[{id:990,x:13,z:-18,w:2,d:8,h:5}];
const actor=make(),[ally,warden]=actor;
check('known nearby cover intersection',!!T.firstCover(warden.x,warden.z,ally.x,ally.z,blocks,.08));
check('nearby covered ally is not already linked',O.links(actor,blocks,T.firstCover,false,0).length===0);
check('nearby covered ally is a valid flank objective',S.select(warden,actor,false,blocks,T.firstCover)===ally);
check('nearby clear ally has no redundant pursuit',S.select(warden,actor,false,[],T.firstCover)===null);
check('link radius agrees with live protection rule',S.LINK_RANGE===O.RANGE);
check('legacy distant ally remains eligible',S.select({...warden,x:29},actor)===ally);
check('jam denies covered flank',S.select(warden,actor,true,blocks,T.firstCover)===null);
check('fallen allied target denied',S.select(warden,[{...ally,dead:true},warden],false,blocks,T.firstCover)===null);
check('stagger denies support',S.select({...warden,state:'stagger'},actor,false,blocks,T.firstCover)===null);
check('no flank if no cover and already in range',S.steer(warden,actor,[],T,0)===null);
const m=S.steer(warden,actor,blocks,T,0);
check('covered ally initiates physical detour',!!m&&warden.supportActive&&warden.supportFlank);
check('detour includes path around barricade',warden.supportPath.some(p=>Math.abs(p.z+18)>4));
check('normalized steering vector',Math.abs(Math.hypot(m.mx,m.mz)-1)<1e-5);
const draws=[];const renderer={cube:(...args)=>draws.push(args)};
check('flanking signal adds third amber piece',S.render(renderer,actor,false,true,0)===3);
check('orange heading bar identifies cover flanking',draws.some(args=>args[6]==='#fb923c'));
check('reduced settings limit flank to 2 low-intensity pieces',S.render(renderer,actor,true,true,0)===2);
let linked=false,everFlanked=false,counts=0;
for(let i=0;i<480;i++){
 const intent=S.steer(warden,actor,blocks,T,i/60);
 if(!intent){linked=O.links(actor,blocks,T.firstCover,false,i/60).length>0;break;}
 everFlanked ||=warden.supportFlank;
 T.move(warden,intent.mx*2.6/60,intent.mz*2.6/60,blocks,1.55);
 check('step '+i+' physically collision safe',T.free(warden.x,warden.z,blocks,1.55));
 counts++;
 if(O.links(actor,blocks,T.firstCover,false,i/60).length){linked=true;break;}
}
check('actual maneuver traverses several positions',counts>25);
check('cover blocked flank traversed',everFlanked);
check('tether eventually established around solid cover',linked);
check('tether now unobstructed',!T.firstCover(warden.x,warden.z,ally.x,ally.z,blocks,.08));
check('tether remains within true link range',Math.hypot(warden.x-ally.x,warden.z-ally.z)<O.RANGE);
const prev={x:warden.x,z:warden.z};const rest=S.steer(warden,actor,blocks,T,9);
check('once linked, stop needless ally pursuit',rest===null&&!warden.supportActive&&!warden.supportFlank);
check('stopped maneuver does not teleport',prev.x===warden.x&&prev.z===warden.z);
const hit=O.apply(ally,actor,blocks,T.firstCover,false,9,1);
check('first live shot can be absorbed after actual flank',hit.damage===0&&hit.absorbed===1);
check('cooldown shot deals regular damage',O.apply(ally,actor,blocks,T.firstCover,false,9.2,1).damage===1);
const fresh=make(),m2=S.steer(fresh[1],fresh,blocks,T,0);
check('flank initially active before changing cover',m2&&fresh[1].supportFlank);
check('dynamic cover removal releases cached path',S.steer(fresh[1],fresh,[],T,1)===null&&fresh[1].supportPath.length===0&&!fresh[1].supportFlank);
S.steer(fresh[1],fresh,blocks,T,2);
check('jam clears flank indicator',S.steer(fresh[1],fresh,blocks,T,2.2,true)===null&&!fresh[1].supportFlank);
console.log(JSON.stringify({suite:'F3D56 Warden Sightline Flank',passed,fail:0,steps:counts}));
