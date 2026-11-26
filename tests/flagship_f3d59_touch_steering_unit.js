'use strict';
const assert=require('node:assert/strict');
const api=require('../games/aegis-verge/touch-steering.js');
const map=new Map(),listeners=new Map();
const rects={up:[0,0,44,44],down:[46,0,90,44],left:[0,46,44,90],right:[46,46,90,90]};
for(const [key,rect] of Object.entries(rects)){
 const handlers={};const classes=new Set();
 const button={dataset:{k:key},addEventListener:(type,fn)=>{handlers[type]=fn},
  setPointerCapture(){}, getBoundingClientRect:()=>({left:rect[0],top:rect[1],right:rect[2],bottom:rect[3],width:44,height:44}),
  classList:{toggle:(name,enabled)=>enabled?classes.add(name):classes.delete(name),contains:name=>classes.has(name)}};
 map.set(key,button);listeners.set(key,handlers);
}
const steer={querySelector:selector=>map.get(selector.match(/data-k="(.*?)"/)[1])};
let state={},changes=0;const driver=api.install(steer,s=>{state=s;changes++});
let checks=0;function ck(ok,name){assert.ok(ok,name);checks++}
function ev(type,id,x,y){return{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){}}}
function run(button,type,id,x,y){listeners.get(button)[type](ev(type,id,x,y))}
ck(!!driver,'driver installed');
run('up','pointerdown',1,20,20);ck(state.up&&!state.left,'first pointer drives forward');
run('up','pointermove',1,20,67);ck(!state.up&&state.left,'slide transfers from up to left');
run('right','pointerdown',2,67,67);ck(state.left&&state.right,'independent fingers co-exist');
run('up','pointermove',1,150,150);ck(!state.left&&state.right,'leaving bank releases only owning pointer');
run('right','pointercancel',2,67,67);ck(!state.left&&!state.right,'cancel releases');
run('up','pointerdown',1,20,20);run('up','pointerdown',2,20,20);run('up','pointerup',1,20,20);ck(state.up,'releasing one of two fingers cannot drop held control');
run('up','lostpointercapture',2,20,20);ck(!state.up,'capture loss cannot stick control');
run('left','pointerdown',3,20,67);driver.reset();ck(!state.left,'explicit reset stops movement on pause');
run('left','pointermove',3,67,67);ck(!state.right,'stale pointer cannot rearm after reset');
ck(changes>=7,'state changes sent');
console.log(JSON.stringify({suite:'F3D59 directional pointer ownership',passed:checks,changes}));
