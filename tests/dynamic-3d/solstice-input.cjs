const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../..');
const modelSource=fs.readFileSync(path.join(root,'games/solstice-wilds/model.js'),'utf8');
const model=import('data:text/javascript;base64,'+Buffer.from(modelSource).toString('base64'));
const mainSource=fs.readFileSync(path.join(root,'games/solstice-wilds/main.js'),'utf8').replace(/^import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*/gm,'');
const sharedInput=fs.readFileSync(path.join(root,'assets/wwg-input.js'),'utf8');

// Execute the real runtime handlers in an isolated modeled DOM. This creates no
// browser, and adds no debug hooks, globals or cheats to the shipped game.
async function harness(){
  const m=await model,elements=new Map(),windowEvents=new Map(),documentEvents=new Map(),messages=[];
  const controls={pads:[],now:0,raf:0};let document;
  const hidden=new Set(['hud','touchControls','pauseMenu','journal','result','confirm','fatal','continueButton','interaction']);
  const children={menu:['startButton','continueButton','touchToggle','motionToggle','muteToggle'],pauseMenu:['resumeButton','pauseJournalButton','restartButton'],journal:['closeJournalButton'],result:['retryButton','resultMenuButton'],confirm:['confirmStart','cancelStart']};
  const context2d=new Proxy({}, {get:(target,key)=>target[key]??(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
  class Element{
    constructor(id=''){this.id=id;this.hidden=hidden.has(id);this.style={};this.textContent='';this.innerHTML='';this.checked=false;this.disabled=false;this.handlers=new Map();this.clientWidth=1000;this.clientHeight=600;this.children=[];const set=new Set();this.classList={add:(...xs)=>xs.forEach(x=>set.add(x)),remove:(...xs)=>xs.forEach(x=>set.delete(x)),contains:x=>set.has(x),toggle:(x,force)=>{const add=force===undefined?!set.has(x):force;if(add)set.add(x);else set.delete(x);return add;}};}
    addEventListener(name,fn){if(!this.handlers.has(name))this.handlers.set(name,[]);this.handlers.get(name).push(fn);}
    emit(name,event={}){const e={target:this,preventDefault(){this.prevented=true;},pointerId:1,button:0,...event};for(const fn of this.handlers.get(name)||[])fn(e);return e;}
    focus(){document.activeElement=this;}
    getContext(){return context2d;}
    append(node){this.children.push(node);}
    setPointerCapture(){}
    getClientRects(){return this.hidden?[]:[{}];}
    getBoundingClientRect(){return this.id==='stick'?{left:0,top:0,width:108,height:108}:{left:0,top:0,width:1000,height:600};}
    querySelectorAll(){return(children[this.id]||[]).map(get);}
    contains(node){return node===this||(children[this.id]||[]).includes(node?.id);}
    matches(){return this.id.endsWith('Toggle');}
  }
  function get(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);}
  document={body:new Element('body'),hidden:false,activeElement:null,getElementById:get,createElement:()=>new Element(),querySelectorAll:()=>['touchPulse','touchInteract','touchSprint'].map(get),addEventListener(name,fn){if(!documentEvents.has(name))documentEvents.set(name,[]);documentEvents.get(name).push(fn);}};
  const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
  const ctx={...m,document,localStorage:storage,location:{search:'',origin:'https://example.test'},matchMedia:()=>({matches:false}),URLSearchParams,console,
    navigator:{getGamepads:()=>controls.pads},crypto:{getRandomValues:a=>(a[0]=1337,a)},ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>++controls.raf,cancelAnimationFrame(){},
    parent:{postMessage:(message,origin)=>messages.push({message,origin})},addEventListener(name,fn){if(!windowEvents.has(name))windowEvents.set(name,[]);windowEvents.get(name).push(fn);},
    createValley(canvas){return{canvas,renderer:{mode:'software'},resize(){},update(){},dispose(){},project:()=>({x:0,y:0,visible:false})};}
  };
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(sharedInput,ctx,{filename:'wwg-input.js'});vm.runInContext(mainSource,ctx,{filename:'solstice-main.js'});
  const run=code=>vm.runInContext(code,ctx);
  const advance=(frames=1)=>{for(let i=0;i<frames;i++){controls.now+=1000/60;ctx.__frameTime=controls.now;run('animate(__frameTime)');}};
  function key(code,repeat=false,options={}){const event={code,key:code,repeat,target:get('world'),preventDefault(){this.prevented=true;},...options};for(const fn of documentEvents.get('keydown')||[])fn(event);return event;}
  function up(code){for(const fn of documentEvents.get('keyup')||[])fn({code,target:get('world')});}
  function event(name,detail={}){for(const fn of windowEvents.get(name)||[])fn(detail);}
  function pad(){const p={index:0,id:'Test standard controller',connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};controls.pads=[p];return p;}
  return{run,advance,key,up,event,pad,get,controls,storage,messages,document};
}

test('held keyboard moves and pulses continuously; interact remains an edge action',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();
  h.key('KeyW');h.advance(60);h.key('KeyW',true);h.advance(60);h.up('KeyW');
  assert.ok(h.run('state.player.z')<26);const z=h.run('state.player.z');h.advance(20);assert.equal(h.run('state.player.z'),z);
  h.key('Space');h.advance(90);h.up('Space');assert.ok(h.run('state.pulses')>=4);const pulses=h.run('state.pulses');h.advance(30);assert.equal(h.run('state.pulses'),pulses);
  h.run('state=createExpedition(42)');h.key('KeyE');h.advance();for(let i=0;i<20;i++){h.key('KeyE',true);h.advance();}assert.equal(h.run('state.interactions'),1);h.up('KeyE');h.key('KeyE');h.advance();assert.equal(h.run('state.interactions'),2);
});

test('cleared keyboard input needs a fresh press after pause or focus loss',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();h.key('KeyW');h.advance(12);
  h.key('KeyP');assert.equal(h.run('state.mode'),'paused');const paused=h.run('state.elapsed');h.advance(90);assert.equal(h.run('state.elapsed'),paused);
  h.up('KeyP');h.key('KeyP');assert.equal(h.run('state.mode'),'playing');const z=h.run('state.player.z');h.key('KeyW',true);h.advance(30);assert.equal(h.run('state.player.z'),z);
  h.up('KeyW');h.key('KeyW');h.advance(12);assert.ok(h.run('state.player.z')<z);h.event('blur');assert.equal(h.run('state.mode'),'paused');assert.equal(h.run('keys.size'),0);
});

test('browser shortcuts do not become movement or pause inputs',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();const z=h.run('state.player.z');
  const e=h.key('KeyW',false,{ctrlKey:true});h.advance(30);assert.equal(h.run('state.player.z'),z);assert.notEqual(e.prevented,true);
  h.key('KeyP',false,{metaKey:true});assert.equal(h.run('state.mode'),'playing');
});

test('standard controller button edges start, interact, pause and resume',async()=>{
  const h=await harness(),p=h.pad();h.advance();p.buttons[0]={pressed:true,value:1};h.advance();assert.equal(h.run('state.mode'),'playing');
  p.buttons[0]={pressed:false,value:0};h.advance();p.buttons[2]={pressed:true,value:1};h.advance();assert.equal(h.run('state.interactions'),1);
  h.advance(20);assert.equal(h.run('state.interactions'),1);p.buttons[2]={pressed:false,value:0};h.advance();
  p.buttons[9]={pressed:true,value:1};h.advance();assert.equal(h.run('state.mode'),'paused');const elapsed=h.run('state.elapsed');h.advance(30);assert.equal(h.run('state.elapsed'),elapsed);
  p.buttons[9]={pressed:false,value:0};h.advance();p.buttons[9]={pressed:true,value:1};h.advance();assert.equal(h.run('state.mode'),'playing');
});

test('controller requires neutral after interruption; held pulse and orbit work afterward',async()=>{
  const h=await harness(),p=h.pad();h.get('startButton').emit('click');h.advance();p.buttons[0]={pressed:true,value:1};p.axes[2]=.6;h.advance(45);
  assert.ok(h.run('state.pulses')>=2);assert.ok(Math.abs(h.run('yaw'))>.1);h.event('blur');h.get('resumeButton').emit('click');const count=h.run('state.pulses'),yaw=h.run('yaw');h.advance(45);assert.equal(h.run('state.pulses'),count);assert.equal(h.run('yaw'),yaw);
  p.buttons[0]={pressed:false,value:0};p.axes[2]=0;h.advance();p.buttons[0]={pressed:true,value:1};h.advance(30);assert.ok(h.run('state.pulses')>count);
});

test('touch sticks, held actions, cancellation and multiple pointers release correctly',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();const pulse=h.get('touchPulse');
  pulse.emit('pointerdown',{pointerId:11});pulse.emit('pointerdown',{pointerId:12});h.advance(30);assert.ok(h.run('state.pulses')>=2);
  pulse.emit('pointerup',{pointerId:11});assert.equal(h.run('touch.pulse'),true);pulse.emit('pointercancel',{pointerId:12});assert.equal(h.run('touch.pulse'),false);
  const stick=h.get('stick');stick.emit('pointerdown',{pointerId:20,clientX:54,clientY:16});h.advance(20);assert.ok(h.run('state.player.z')<35);stick.emit('lostpointercapture',{pointerId:20});assert.equal(h.run('touch.z'),0);
  pulse.emit('pointerdown',{pointerId:21});h.get('touchSprint').emit('pointerdown',{pointerId:22});h.event('blur');assert.equal(h.run('touch.pulse||touch.sprint'),false);assert.equal(h.run('pointerActions.size'),0);
});

test('drag orbit is clamped and stops when capture is lost',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();const canvas=h.get('world');
  canvas.emit('pointerdown',{pointerId:8,clientX:50,clientY:50});canvas.emit('pointermove',{pointerId:8,clientX:150,clientY:2000});assert.ok(h.run('yaw')<0);assert.equal(h.run('pitch'),1.03);
  canvas.emit('lostpointercapture',{pointerId:8});const yaw=h.run('yaw');canvas.emit('pointermove',{pointerId:8,clientX:400,clientY:10});assert.equal(h.run('yaw'),yaw);
});

test('journal opened from pause returns to pause, with no hidden simulation or input',async()=>{
  const h=await harness();h.get('startButton').emit('click');h.advance();h.get('pauseButton').emit('click');h.get('pauseJournalButton').emit('click');
  const elapsed=h.run('state.elapsed');h.key('KeyW');h.advance(120);assert.equal(h.run('state.elapsed'),elapsed);assert.equal(h.get('journal').hidden,false);
  h.get('closeJournalButton').emit('click');assert.equal(h.run('state.mode'),'paused');assert.equal(h.get('pauseMenu').hidden,false);assert.equal(h.get('journal').hidden,true);
});

test('saved remaps replace action defaults and update visible prompt labels',async()=>{
  const h=await harness();h.storage.setItem('wwg:keymap',JSON.stringify({primary:'KeyF',secondary:'KeyQ'}));h.event('storage',{key:'wwg:keymap'});h.get('startButton').emit('click');h.advance();
  assert.equal(h.get('pulseKey').textContent,'F');assert.equal(h.get('promptKey').textContent,'Q');h.key('Space');h.advance(30);assert.equal(h.run('state.pulses'),0);h.up('Space');h.key('KeyF');h.advance(30);assert.ok(h.run('state.pulses')>0);h.up('KeyF');h.key('KeyQ');h.advance();assert.equal(h.run('state.interactions'),1);
});
