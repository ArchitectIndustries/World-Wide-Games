'use strict';
// Actual game input handlers in the existing DOM model; F3D97 pointer module
// unit coverage is retained separately. No native/browser input claim.
const assert=require('node:assert/strict');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
let passed=0;const checks=[];const check=(name,test)=>{test();passed++;checks.push(name);};
const key=(r,code,on=true,repeat=false)=>r.dispatch(on?'keydown':'keyup',{code,key:code==='Space'?' ':code.replace('Key','').toLowerCase(),repeat});
const drive=r=>{r.context.gp();r.context.update(.1);};
const held=(r,action)=>action==='fire'?r.eval('held.fire||touchHeld.fire||padHeld.fire'):r.context.keys[action];
function launch(opts){const r=boot('aegis-verge',opts);r.byId.get('start').click();return r;}
function focusCycle(r){r.dispatch('blur');r.dispatch('focus');r.byId.get('focusResume').click();}
const old=launch({transformScript:code=>code.replace('if(on&&e.repeat&&!held[action])return true;','')});
key(old,'KeyW');drive(old);focusCycle(old);const oldPosition=[old.context.player.x,old.context.player.z];key(old,'KeyW',true,true);drive(old);
check('the original OS-repeat ordering defect is reproduced against actual game handlers',()=>assert(Math.hypot(old.context.player.x-oldPosition[0],old.context.player.z-oldPosition[1])>.01));
for(const [code,action] of[['KeyW','up'],['ArrowUp','up'],['KeyA','left'],['Space','fire'],['KeyE','shield']]){
 const r=launch();key(r,code);drive(r);r.dispatch('blur');
 check(`${code}: focus loss clears the real held channel and pauses simulation`,()=>{assert(r.context.paused&&r.context.suspended);assert.equal(held(r,action),false);});
 r.dispatch('focus');check(`${code}: returning focus does not resume combat`,()=>assert(r.context.paused&&!r.context.suspended));
 r.byId.get('focusResume').click();const p={...r.context.player},shots=r.context.diagnostics.shotsFired;
 key(r,code,true,true);drive(r);
 check(`${code}: stale repeat after deliberate resume cannot reacquire a released control`,()=>{assert.equal(held(r,action),false);assert.equal(r.context.player.x,p.x);assert.equal(r.context.player.z,p.z);assert.equal(r.context.diagnostics.shotsFired,shots);});
 key(r,code,false);r.context.update(.2);key(r,code);r.context.gp();
 check(`${code}: keyup followed by fresh keydown rearms normally`,()=>assert.equal(held(r,action),true));
}
for(const mode of['pause','visibility','restart']){
 const r=launch();key(r,'KeyW');drive(r);
 if(mode==='pause'){r.context.togglePause();r.context.togglePause();}
 if(mode==='visibility'){r.document.hidden=true;r.dispatch('visibilitychange');r.document.hidden=false;r.dispatch('visibilitychange');assert(r.context.paused);r.byId.get('focusResume').click();}
 if(mode==='restart')r.context.resetOperation(0);
 const p={...r.context.player};key(r,'KeyW',true,true);drive(r);
 check(`${mode}: cleared ownership rejects an old repeat without losing a fresh press`,()=>{assert(!r.context.keys.up);assert.equal(r.context.player.x,p.x);assert.equal(r.context.player.z,p.z);key(r,'KeyW',false);key(r,'KeyW');assert(r.context.keys.up);});
}
check('ordinary repeats retain an already-owned hold and keyup releases it',()=>{const r=launch();key(r,'KeyW');key(r,'KeyW',true,true);assert(r.context.keys.up);key(r,'KeyW',false);assert(!r.context.keys.up);});
check('an editable field receives keyboard input without driving the rig',()=>{const r=launch();r.dispatch('keydown',{code:'KeyW',key:'w',repeat:false,target:{closest:()=>({})}});assert(!r.context.keys.up);});
check('gamepad resume continues to require a neutral sample before rearming',()=>{
 const r=launch(),pad={index:0,id:'modeled-controller',mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
 r.context.navigator.getGamepads=()=>[pad];r.context.gp();pad.axes[1]=-1;r.context.gp();assert(r.context.keys.up);focusCycle(r);r.context.gp();assert(!r.context.keys.up&&!r.context.padReady);pad.axes[1]=0;r.context.gp();assert(r.context.padReady);pad.axes[1]=-1;r.context.gp();assert(r.context.keys.up);
});

// Supply parent relationships and explicit rectangles omitted by the generic
// flat DOM fixture, then execute the real module and inline install paths.
const pointerBoot=()=>launch({transformScript:(code,src)=>src==='touch-steering.js'?`(()=>{const steer=document.querySelector('.steer');steer.ownerDocument=document;steer.querySelector=s=>document.querySelector(s);for(const [i,k] of ['up','down','left','right'].entries()){const n=document.querySelector('[data-k="'+k+'"]');n.ownerDocument=document;n.getBoundingClientRect=()=>({left:i*50,right:i*50+44,top:0,bottom:44,width:44,height:44});n.setPointerCapture=()=>{throw Error('modeled capture refusal');};}for(const n of document.querySelectorAll('[data-action]')){n.ownerDocument=document;n.setPointerCapture=()=>{throw Error('modeled capture refusal');};}})();\n`+code:code});
const pointer=(r,node,type,id,extra={})=>{const e={type,pointerId:id,pointerType:'touch',button:0,buttons:1,clientX:20,clientY:20,preventDefault(){},...extra};if(node)node.dispatchEvent(e);else r.dispatch(type,e);};
const r=pointerBoot(),up=r.document.querySelector('[data-k="up"]'),fire=r.document.querySelector('[data-action="fire"]'),shield=r.document.querySelector('[data-action="shield"]');
pointer(r,up,'pointerdown',11);assert(r.context.keys.up);pointer(r,null,'pointermove',11,{clientX:120});
check('integrated steering can slide across controls after pointer capture refusal',()=>assert(r.context.keys.left&&!r.context.keys.up));
pointer(r,null,'pointerup',11);pointer(r,null,'pointermove',11,{clientX:20});
check('integrated outside release prevents stale pointer movement from rearming',()=>assert(!r.context.keys.up&&!r.context.keys.left));
pointer(r,fire,'pointerdown',20);pointer(r,fire,'pointerdown',21);pointer(r,null,'pointerup',20);
check('integrated FIRE retains the independent second contact',()=>assert(held(r,'fire')));
pointer(r,null,'pointerup',21);const shotCount=r.context.diagnostics.shotsFired;drive(r);drive(r);
check('outside FIRE release stops actual cannon creation',()=>{assert(!held(r,'fire'));assert.equal(r.context.diagnostics.shotsFired,shotCount);});
pointer(r,shield,'pointerdown',30);key(r,'KeyE');pointer(r,null,'lostpointercapture',30);
check('lost touch capture does not cancel an independent keyboard shield hold',()=>assert(r.context.keys.shield));
key(r,'KeyE',false);pointer(r,shield,'pointerdown',31);pointer(r,null,'pointerout',31,{relatedTarget:null});
check('document exit releases the real shield control',()=>assert(!r.context.keys.shield));
pointer(r,up,'pointerdown',40);pointer(r,fire,'pointerdown',41);r.context.togglePause();r.context.togglePause();pointer(r,null,'pointermove',40);pointer(r,null,'pointerup',41);
check('pause/reset discards old pointer IDs across the installed controls',()=>assert(!r.context.keys.up&&!held(r,'fire')));
console.log(JSON.stringify({passed,total:passed,scope:'Actual game and F3D97 modules in the existing modeled DOM; no browser/native pointer claim.',checks},null,2));
