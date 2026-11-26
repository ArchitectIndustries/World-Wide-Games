'use strict';
const assert=require('node:assert/strict');
const api=require('../games/aegis-verge/combat-holds.js');
const handlers=new Map(),nodes=[];const keys=['fire','shield','pulse','dash','decoy','uplink','cache'];
for(const action of keys){const callbacks={},classes=new Set();const node={dataset:{action},addEventListener:(name,fn)=>callbacks[name]=fn,setPointerCapture(){},classList:{toggle:(name,v)=>v?classes.add(name):classes.delete(name),contains:name=>classes.has(name)}};nodes.push(node);handlers.set(action,callbacks);}
let held={},triggers=[],calls=0,assertions=0;function check(value,label){assert.ok(value,label);assertions++;}
const driver=api.install(nodes,h=>{held=h;calls++;},a=>triggers.push(a));
const event=id=>({pointerId:id,pointerType:'touch',button:0,preventDefault(){}});
const send=(key,name,id)=>handlers.get(key)[name](event(id));
check(!!driver,'module initialized');
send('fire','pointerdown',1);send('fire','pointerdown',2);
check(held.fire,'both hold FIRE');check(triggers.join(',')==='fire,fire','two genuine presses each initiate shot');
send('fire','pointerup',1);check(held.fire,'first release never cancels second FIRE');
send('fire','pointercancel',2);check(!held.fire,'last cancellation drops FIRE');
send('shield','pointerdown',3);send('shield','pointerdown',4);send('shield','pointerup',3);
check(held.shield,'second SHIELD remains active');send('shield','lostpointercapture',4);check(!held.shield,'capture loss drops SHIELD');
send('pulse','pointerdown',5);send('pulse','pointerdown',5);check(triggers.filter(x=>x==='pulse').length===1,'duplicate pointerdown cannot double pulse');send('pulse','pointerup',5);
handlers.get('shield').keydown({code:'Space',repeat:false,preventDefault(){}});send('shield','pointerdown',6);
handlers.get('shield').keyup({code:'Space',preventDefault(){}});check(held.shield,'keyboard keyup cannot release held touch');
handlers.get('shield').blur();check(held.shield,'blur cannot release active finger');
send('shield','pointerup',6);check(!held.shield,'final touch release clears shield');
send('fire','pointerdown',8);send('shield','pointerdown',9);driver.reset();check(!held.fire&&!held.shield,'reset clears all simultaneous combat holds');
send('fire','pointerup',8);send('shield','pointerup',9);check(!held.fire&&!held.shield,'late pointerups do not re-enable inputs');
check(calls>=6,'changes surfaced to real game input');
console.log(JSON.stringify({test:'F3D60 pointer-owned combat holds',assertions,callbackCalls:calls,triggers}));
