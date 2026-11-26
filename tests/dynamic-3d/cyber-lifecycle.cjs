'use strict';
// Actual page lifecycle and controller handlers in the existing VM fixture.
// BroadcastChannel, browser events and controller hardware are modeled here.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');

function fixture({relay=false}={}){
 let installed=false;
 const r=boot('cyber-wars',{
  ...(relay?{origin:'http://localhost/?qa=1&world=VIRIDIA&relay=ws://localhost/ws'}:{}),
  transformScript:code=>{
   let prefix='';
   if(!installed){installed=true;prefix=`
    window.__channels=[];window.__sockets=[];window.__denyChannel=false;
    window.BroadcastChannel=class {
     constructor(name){this.name=name;this.closed=false;this.messages=[];window.__channels.push(this);if(window.__denyChannel)throw new Error('channel denied');}
     postMessage(message){if(this.closed||this.failPost)throw new Error('channel unavailable');this.messages.push(message);}
     close(){this.closed=true;this.closes=(this.closes||0)+1;}
    };
    window.WebSocket=class {
     static OPEN=1;
     constructor(url){this.url=url;this.readyState=0;this.messages=[];window.__sockets.push(this);}
     send(message){this.messages.push(JSON.parse(message));}
     close(){this.readyState=3;this.closes=(this.closes||0)+1;this.onclose?.();}
    };
   `;}
   return prefix+code.replace('if(qa)window.CWQA={','if(qa)window.__lifecycleFixture={pollGamepad,broadcast,shots:()=>shots.length};\nif(qa)window.CWQA={');
  }
 });
 const qa=r.context.CWQA,handlers=r.context.__lifecycleFixture,el=id=>r.byId.get(id);
 el('start').click();el('c').focus();
 let focused=true;r.document.hasFocus=()=>focused;
 const pad={connected:true,mapping:'standard',buttons:Array.from({length:16},()=>({pressed:false,value:0})),axes:[0,0,0,0]};
 r.context.navigator.getGamepads=()=>[pad];handlers.pollGamepad(0);handlers.pollGamepad(0);
 const open=kind=>{qa.setPlayer(kind==='archive'?-31:0,kind==='archive'?-8:7);el('c').focus();r.dispatch('keydown',{code:'KeyE'});r.dispatch('keyup',{code:'KeyE'});};
 return {r,qa,handlers,el,pad,open,poll:()=>handlers.pollGamepad(.035),focus:value=>{focused=value;}};
}

for(const mode of ['unfocused','hidden'])test(`archive controller is inert while ${mode} and requires neutral input on return`,()=>{
 const g=fixture();g.open('archive');const state=JSON.stringify(g.qa.snapshot()),focus=g.r.document.activeElement;
 if(mode==='hidden'){g.r.document.hidden=true;g.r.dispatch('visibilitychange');}else{g.focus(false);g.r.dispatch('blur');}
 g.pad.buttons[0].pressed=true;g.pad.axes[0]=.8;g.poll();g.poll();
 assert.equal(g.el('canopyReading').hidden,true);assert.equal(g.r.document.activeElement,focus);assert.equal(g.qa.inputDebug().paused,true);
 if(mode==='hidden'){g.r.document.hidden=false;g.r.dispatch('visibilitychange');}else g.focus(true);
 g.poll();assert.equal(g.el('canopyReading').hidden,true);
 // Releasing A is insufficient while a direction is still held.
 g.pad.buttons[0].pressed=false;g.poll();g.pad.buttons[0].pressed=true;g.poll();assert.equal(g.el('canopyReading').hidden,true);
 g.pad.buttons[0].pressed=false;g.pad.axes[0]=0;g.poll();
 g.pad.buttons[0].pressed=true;g.poll();assert.equal(g.el('canopyReading').hidden,false);assert.equal(g.el('canopyBookTitle').textContent,'The Lake Beneath the Library');
 assert.equal(JSON.stringify(g.qa.snapshot()),state);assert.equal(g.r.writes.length,0);
});

test('briefing controller cannot dismiss while unfocused or hidden, including a suspension with no sampled frames',()=>{
 for(const mode of ['unfocused','hidden']){
  const g=fixture();g.open('briefing');const state=JSON.stringify(g.qa.snapshot());
  if(mode==='hidden'){g.r.document.hidden=true;g.r.dispatch('visibilitychange');}else{g.focus(false);g.r.dispatch('blur');}
  g.pad.buttons[0].pressed=true;g.poll();assert.equal(g.el('dialogue').open,true);assert.equal(g.qa.inputDebug().paused,true);
  if(mode==='hidden')g.r.document.hidden=false;else g.focus(true);
  g.poll();assert.equal(g.el('dialogue').open,true);
  g.pad.buttons[0].pressed=false;g.poll();g.pad.buttons[0].pressed=true;g.poll();assert.equal(g.el('dialogue').open,false);assert.equal(g.qa.inputDebug().paused,false);
  assert.equal(JSON.stringify(g.qa.snapshot()),state);assert.equal(g.handlers.shots(),0);assert.equal(g.r.writes.length,0);
 }
 for(const kind of ['archive','briefing']){
  const g=fixture();g.open(kind);g.focus(false);g.r.dispatch('blur');g.pad.buttons[0].pressed=true;
  // A cached/background page can stop animating entirely. No poll occurs here.
  g.focus(true);g.poll();assert.equal(g.el(kind==='archive'?'canopyArchive':'dialogue').open,true);
  if(kind==='archive')assert.equal(g.el('canopyReading').hidden,true);
  g.pad.buttons[0].pressed=false;g.poll();g.pad.buttons[0].pressed=true;g.poll();
  if(kind==='archive')assert.equal(g.el('canopyReading').hidden,false);else assert.equal(g.el('dialogue').open,false);
 }
});

test('controller Start cannot open or close the guide in a background document',()=>{
 const g=fixture();g.focus(false);g.r.dispatch('blur');g.pad.buttons[9].pressed=true;g.poll();assert.equal(g.el('fieldGuide').open,false);
 g.focus(true);g.poll();assert.equal(g.el('fieldGuide').open,false);g.pad.buttons[9].pressed=false;g.poll();g.pad.buttons[9].pressed=true;g.poll();assert.equal(g.el('fieldGuide').open,true);
 g.pad.buttons[9].pressed=false;g.poll();g.r.document.hidden=true;g.r.dispatch('visibilitychange');g.pad.buttons[1].pressed=true;g.poll();assert.equal(g.el('fieldGuide').open,true);
 g.r.document.hidden=false;g.poll();assert.equal(g.el('fieldGuide').open,true);g.pad.buttons[1].pressed=false;g.poll();g.pad.buttons[1].pressed=true;g.poll();assert.equal(g.el('fieldGuide').open,false);
 assert.equal(g.r.writes.length,0);
});

test('persisted return recreates one usable local channel without changing gameplay or saving',()=>{
 const g=fixture(),before=JSON.stringify(g.qa.snapshot()),channels=g.r.context.__channels,old=g.qa.channel();
 g.handlers.broadcast();assert.equal(old.messages.at(-1).type,'pos');
 g.r.dispatch('pagehide',{persisted:true});assert.equal(old.closed,true);assert.equal(old.closes,1);assert.equal(old.messages.at(-1).type,'bye');assert.equal(g.qa.channel(),null);
 g.r.dispatch('pageshow',{persisted:true});const restored=g.qa.channel();assert(restored&&restored!==old);assert.equal(restored.name,old.name);assert.equal(channels.length,2);
 g.handlers.broadcast();assert.equal(restored.messages.at(-1).type,'pos');assert.equal(restored.messages.at(-1).x,g.qa.snapshot().player.x);
 restored.onmessage({data:{type:'pos',id:'nearby-tab',x:2,z:4,yaw:0,color:'#70b7ff'}});assert(g.qa.network().peers.includes('local:nearby-tab'));
 g.r.dispatch('pageshow',{persisted:true});assert.equal(g.qa.channel(),restored);assert.equal(channels.length,2);
 // The deliberately received peer may change presence, never gameplay.
 assert.equal(JSON.stringify({...g.qa.snapshot(),peers:[]}),before);assert.equal(g.r.writes.length,0);assert.equal(g.r.context.__sockets.length,0);
});

test('local channel restoration is bounded when closing or construction fails and ignores ordinary pageshow',()=>{
 const g=fixture(),old=g.qa.channel(),channels=g.r.context.__channels;
 g.r.dispatch('pageshow',{persisted:false});assert.equal(channels.length,1);
 old.failPost=true;g.r.dispatch('pagehide',{persisted:true});assert.equal(old.closed,true);assert.equal(g.qa.channel(),null);
 g.r.context.__denyChannel=true;assert.doesNotThrow(()=>g.r.dispatch('pageshow',{persisted:true}));assert.equal(g.qa.channel(),null);assert.equal(channels.length,2);
 g.r.dispatch('pageshow',{persisted:true});assert.equal(channels.length,2);
 const ordinary=fixture(),initial=ordinary.qa.channel();ordinary.r.dispatch('pagehide',{persisted:false});ordinary.r.dispatch('pageshow',{persisted:false});assert.equal(initial.closed,true);assert.equal(ordinary.qa.channel(),null);assert.equal(ordinary.r.context.__channels.length,1);
 assert.equal(g.r.writes.length,0);assert.equal(ordinary.r.writes.length,0);
});

test('persisted return restores local presence without automatically rejoining the optional Internet relay',()=>{
 const g=fixture({relay:true}),sockets=g.r.context.__sockets,socket=sockets[0];assert.equal(sockets.length,1);
 socket.readyState=1;socket.onopen();assert.equal(socket.messages.at(-1).type,'join');
 socket.onmessage({data:JSON.stringify({type:'welcome',protocol:2,world:'VIRIDIA',id:'guest-session',features:['guest-resume-v1','verified-spawn-v1'],selfPose:{id:'guest-session',x:0,z:3,yaw:Math.PI},resumeToken:'1'.repeat(48),resumed:false,peers:[]})});
 assert.equal(g.qa.network().online,true);assert.equal(g.qa.channel(),null);const before=JSON.stringify(g.qa.snapshot());
 g.r.dispatch('pagehide',{persisted:true});assert.equal(socket.closes,1);assert.equal(g.qa.network().online,false);
 g.r.dispatch('pageshow',{persisted:true});assert(g.qa.channel());assert.equal(g.qa.channel().closed,false);assert.equal(sockets.length,1);assert.equal(g.qa.network().online,false);assert.equal(g.qa.network().retryCount,0);
 assert.equal(JSON.stringify(g.qa.snapshot()),before);assert.equal(g.r.writes.length,0);
});
