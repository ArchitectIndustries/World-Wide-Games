'use strict';
// Shipped handlers and geometry under modeled DOM/Canvas. No browser or GPU
// claim: the release coordinator checks native layout and actual play separately.
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
const Collection=require('../../games/cyber-wars/archive-collection.js');
const Archive=require('../../games/cyber-wars/canopy-archive.js');
const World=require('../../games/cyber-wars/viridia-world.js');
function fixture(){
 const expose=`if(qa)window.__archiveFixture={tick,shots:()=>shots.length,keys:()=>({...keys}),nearest:()=>nearestInteractable(3.2),prompt:updatePrompt,scene:()=>viridiaWorld.inspect(),brief:dialogue,field:()=>JSON.stringify({player,weather:weather.time,enemies:enemies.map(e=>[e.x,e.z,e.hp,e.dead]),fauna:fauna.map(a=>[a.x,a.z,a.hp]),raft:{x:raft.x,z:raft.z},credits:state.credits,mission:state.mission})};\nif(qa)window.CWQA={`;
 const r=boot('cyber-wars',{transformScript:code=>code.replace('if(qa)window.CWQA={',expose)}),qa=r.context.CWQA,f=r.context.__archiveFixture;
 const el=id=>r.byId.get(id),down=(code,extra={})=>r.dispatch('keydown',{code,key:code,repeat:false,...extra}),up=code=>r.dispatch('keyup',{code});
 // The shared small DOM fixture predates this standard native DOM method.
 el('readerPage').replaceChildren=function(){this.children=[];};
 let clock=1000;const tick=(n=1)=>{for(let i=0;i<n;i++){clock+=35;r.context.performance.now=()=>clock;f.tick(clock);}};
 el('start').click();el('c').focus();
 const place=(x,z)=>{qa.setPlayer(x,z);el('c').focus();};
 const use=()=>{down('KeyE');up('KeyE');};
 const makePad=()=>{const p={connected:true,mapping:'standard',buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0,0,0]};r.context.navigator.getGamepads=()=>[p];qa.stepField(2);return p;};
 return {r,qa,f,el,down,up,tick,place,use,makePad};
}

test('steward briefing is a native focused modal and P closes it before resuming',()=>{
 const g=fixture();g.place(0,7);g.use();
 assert.equal(g.el('dialogue').tagName,'DIALOG');assert.equal(g.el('dialogue').open,true);assert.equal(g.qa.inputDebug().paused,true);assert.equal(g.r.document.activeElement.id,'dialogueClose');
 g.down('KeyP');g.up('KeyP');assert.equal(g.el('dialogue').open,false);assert.equal(g.el('dialogue').style.display,'none');assert.equal(g.qa.inputDebug().paused,false);assert.equal(g.r.document.activeElement.id,'c');
 assert.equal(g.qa.snapshot().state.credits,21000);
});

test('briefing freezes actual field ticks and blocks keyboard, touch and camera leakage',()=>{
 const g=fixture();g.place(0,7);g.use();const before=g.f.field(),shots=g.f.shots(),writes=g.r.writes.length;
 for(const key of ['KeyW','Space','KeyC','KeyE','KeyQ'])g.down(key);
 g.r.document.querySelector('[data-k="up"]').dispatchEvent({type:'pointerdown',pointerId:4,preventDefault(){}});
 g.el('c').dispatchEvent({type:'pointerdown',pointerType:'touch',clientX:20,clientY:20});g.el('c').dispatchEvent({type:'pointermove',pointerType:'touch',clientX:120,clientY:50});
 g.tick(5);assert.equal(g.f.field(),before);assert.equal(g.f.shots(),shots);assert.equal(g.r.writes.length,writes);assert(Object.values(g.f.keys()).every(v=>!v));
});

test('closing a briefing requires held movement and primary actions to release',()=>{
 const g=fixture();g.place(0,7);g.down('KeyW');g.use();g.down('Space');const position=JSON.stringify(g.qa.snapshot().player),shots=g.f.shots();
 g.el('dialogueClose').click();g.down('KeyW',{repeat:true});g.down('Space',{repeat:true});g.qa.stepField(5);
 assert.equal(JSON.stringify(g.qa.snapshot().player),position);assert.equal(g.f.shots(),shots);
 g.up('KeyW');g.up('Space');g.down('KeyW');g.qa.stepField(3);g.up('KeyW');assert.notEqual(JSON.stringify(g.qa.snapshot().player),position);
});

test('native Continue, cancellation and paused-menu return preserve their focus boundaries',()=>{
 const g=fixture();g.place(0,7);g.use();const shots=g.f.shots();g.down('Space',{target:g.el('dialogueClose')});g.el('dialogueClose').click();g.up('Space');assert.equal(g.f.shots(),shots);
 g.use();let prevented=false;g.el('dialogue').dispatchEvent({type:'cancel',preventDefault(){prevented=true;}});assert(prevented);assert.equal(g.r.document.activeElement.id,'c');
 g.el('fieldPause').click();g.f.brief('District record','A paused return fixture.');g.el('dialogueClose').click();assert.equal(g.qa.inputDebug().paused,true);assert.equal(g.el('pause').style.display,'grid');assert.equal(g.r.document.activeElement.id,'resume');
});

test('each current obelisk objective has its actual numbered destination',()=>{
 const g=fixture();g.qa.completeInitiation();g.el('dialogueClose').click();
 for(const [i,x,z]of [[0,-24,22],[1,24,24],[2,0,-18]]){
  assert.match(g.el('compass').textContent,new RegExp('^Solar Obelisk '+(i+1)+' ·'));assert(!g.el('compass').textContent.includes('undefined'));
  g.place(x,z+2);g.use();if(g.el('dialogue').open)g.el('dialogueClose').click();
 }
 assert.match(g.el('compass').textContent,/^Southern ruin ·/);assert.equal(g.qa.snapshot().state.credits,31000);
});

test('repeat steward explanations expose remaining work without awarding a second mission',()=>{
 const g=fixture();g.place(0,7);g.use();g.el('dialogueClose').click();g.use();assert.equal(g.el('dialogueSteps').children.length,3);assert.equal(g.qa.snapshot().state.credits,21000);g.el('dialogueClose').click();
 g.qa.completeInitiation();g.el('dialogueClose').click();const state=JSON.stringify(g.qa.snapshot().state);g.use();assert.match(g.el('dialogueText').textContent,/0 of three obelisks/);assert.equal(JSON.stringify(g.qa.snapshot().state),state);
});

test('archivist catalogue separates three readings from the actual Pilot study action',()=>{
 const g=fixture();g.place(-31,-8);const state=JSON.stringify(g.qa.snapshot().state);g.use();
 assert.equal(g.el('canopyArchive').open,true);assert.equal(g.qa.inputDebug().paused,true);assert.equal(g.el('canopyBooks').children.length,3);assert.match(g.el('canopyPilotState').textContent,/Pilot Rank 1/);
 assert.equal(g.r.document.activeElement,g.el('canopyBooks').children[0]);assert.equal(JSON.stringify(g.qa.snapshot().state),state);assert.equal(g.r.writes.length,0);
});

test('all lecterns are reachable through actual ground movement and open their correct volume',()=>{
 const g=fixture();g.place(-31,-8);const state=JSON.stringify(g.qa.snapshot().state),solids=JSON.stringify(g.qa.solidMap());
 const walk=(x,z)=>{const p=g.qa.snapshot().player;g.qa.stepWalk(x-p.x,z-p.z);assert(Math.hypot(g.qa.snapshot().player.x-x,g.qa.snapshot().player.z-z)<.05);};
 const route=[[-34,-8.9,'The Lake Beneath the Library'],[-36,-8.9],[-36,-13],[-31.5,-13,'The Beetle That Kept Time'],[-26.5,-13,'The Hundred-Credit Roof']];
 for(const [x,z,title]of route){walk(x,z);if(!title)continue;g.f.prompt();assert.equal(g.f.nearest().kind,'archive-book');assert(g.el('prompt').innerHTML.includes(title));g.use();assert.equal(g.el('canopyBookTitle').textContent,title);assert.equal(g.el('canopyArchive').open,true);g.el('canopyClose').click();}
 assert.equal(JSON.stringify(g.qa.snapshot().state),state);assert.equal(JSON.stringify(g.qa.solidMap()),solids);assert.equal(g.r.writes.length,0);
});

test('selected canonical texts are complete, classified and immutable',()=>{
 const books=Collection.readings;assert.equal(books.length,3);assert.deepEqual(books.map(b=>b.title),['The Lake Beneath the Library','The Beetle That Kept Time','The Hundred-Credit Roof']);
 for(const b of books){assert.equal(b.paragraphs.length,3);assert(b.author&&b.category);assert(Object.isFrozen(b)&&Object.isFrozen(b.paragraphs));}
 assert.match(books[2].paragraphs[1],/all ten ranks/);assert.match(books[2].paragraphs[1],/exactly one thousand/);assert.match(books[2].paragraphs[1],/not bought separately/);
 const canonicalHashes=['2aa0ae33a90dbf0a8520986a7070fba53218b7cb1851593f68e0850d4030bcc7','c940efa05ccf78949245119f7634ff6f0a557c92f388040868aafee3ccb3b0e5','d142cd0c2305d802ec102febd2319333a6aacbb1e49ee812b24acc06c44caca6'];
 for(let i=0;i<books.length;i++)assert.equal(crypto.createHash('sha256').update(books[i].paragraphs.join('\n\n')).digest('hex'),canonicalHashes[i]);
 assert.equal(Collection.sourceCommit,'c3f8c5055a7f0087c382b226c6d58905ad3f03e3');
});

test('reading navigation, text sizing and browser shortcuts do not act on the world',()=>{
 const g=fixture();g.place(-31,-8);g.use();g.el('canopyBooks').children[0].click();const state=g.f.field(),shots=g.f.shots();
 g.down('ArrowRight');g.up('ArrowRight');assert.equal(g.el('canopyBookTitle').textContent,'The Beetle That Kept Time');g.down('ArrowLeft');g.up('ArrowLeft');assert.equal(g.el('canopyBookTitle').textContent,'The Lake Beneath the Library');
 for(let i=0;i<10;i++)g.el('canopyLarger').click();assert.equal(g.el('canopyText').style.fontSize,'135%');assert.equal(g.el('canopyLarger').disabled,true);for(let i=0;i<10;i++)g.el('canopySmaller').click();assert.equal(g.el('canopyText').style.fontSize,'90%');
 let prevented=false;g.down('KeyL',{ctrlKey:true,preventDefault(){prevented=true;}});g.up('KeyL');assert.equal(prevented,false);
 g.down('Space',{target:g.el('canopyNext')});g.el('canopyNext').click();g.up('Space');g.tick(3);assert.equal(g.f.field(),state);assert.equal(g.f.shots(),shots);
});

test('catalogue Pilot action uses the existing pages and only explicit study awards Rank 1',()=>{
 const g=fixture();g.place(-31,-8);g.use();for(const button of g.el('canopyBooks').children){button.click();g.el('canopyBack').click();}assert.equal(g.qa.snapshot().state.pilotRank,0);
 g.el('canopyPilot').click();assert.equal(g.el('canopyArchive').open,false);assert.equal(g.qa.manual().open,true);assert.equal(g.qa.manual().canStudy,false);assert.equal(g.qa.snapshot().state.pilotRank,0);
 g.el('readerNext').click();assert.equal(g.qa.manual().canStudy,true);g.el('readerStudy').click();assert.equal(g.qa.snapshot().state.pilotRank,1);assert.equal(g.qa.snapshot().state.credits,21000);assert.equal(g.el('dialogue').open,true);assert.equal(g.r.writes.length,0);
});

test('touch Use opens the archive and modal touch cannot move, turn, sprint or fire',()=>{
 const g=fixture();g.place(-31,-8);const move=g.r.document.querySelector('[data-k="up"]'),use=g.r.document.querySelector('[data-act="interact"]');move.dispatchEvent({type:'pointerdown',pointerId:1,preventDefault(){}});use.dispatchEvent({type:'pointerdown',pointerId:2,preventDefault(){}});
 assert.equal(g.el('canopyArchive').open,true);const state=g.f.field(),shots=g.f.shots();
 for(const button of g.r.document.querySelectorAll('[data-k], [data-act]'))button.dispatchEvent({type:'pointerdown',pointerId:8,preventDefault(){}});
 g.el('c').dispatchEvent({type:'pointerdown',pointerType:'touch',clientX:0,clientY:0});g.el('c').dispatchEvent({type:'pointermove',pointerType:'touch',clientX:200,clientY:200});g.tick(2);assert.equal(g.f.field(),state);assert.equal(g.f.shots(),shots);
 g.el('canopyClose').click();g.qa.stepField(3);assert.equal(JSON.stringify(g.qa.snapshot().player),JSON.stringify(JSON.parse(state).player));assert.equal(g.f.shots(),shots);assert.equal(g.r.document.activeElement.id,'c');move.dispatchEvent({type:'pointerup',pointerId:1});
});

test('controller opening B is absorbed; A browses; B closes without reopening or moving',()=>{
 const g=fixture();g.place(-31,-8);const pad=g.makePad();pad.buttons[1].pressed=true;g.qa.stepField(1);assert.equal(g.el('canopyArchive').open,true);g.qa.stepField(3);assert.equal(g.el('canopyArchive').open,true);
 pad.buttons[1].pressed=false;g.qa.stepField(1);pad.buttons[0].pressed=true;g.qa.stepField(1);assert.equal(g.el('canopyBookTitle').textContent,'The Lake Beneath the Library');pad.buttons[0].pressed=false;g.qa.stepField(1);
 const before=JSON.stringify(g.qa.snapshot().player),shots=g.f.shots();pad.axes[0]=.9;pad.buttons[1].pressed=true;g.qa.stepField(1);assert.equal(g.el('canopyArchive').open,false);g.qa.stepField(4);assert.equal(g.el('canopyArchive').open,false);assert.equal(JSON.stringify(g.qa.snapshot().player),before);assert.equal(g.f.shots(),shots);
 pad.buttons[1].pressed=false;pad.axes[0]=0;g.qa.stepField(2);pad.buttons[1].pressed=true;g.qa.stepField(1);assert.equal(g.el('canopyArchive').open,true);
});

test('controller Start closing readings cannot immediately open the Field Guide',()=>{
 const g=fixture();g.place(-31,-8);const pad=g.makePad();g.use();pad.buttons[9].pressed=true;g.qa.stepField(1);assert.equal(g.el('canopyArchive').open,false);g.qa.stepField(4);assert.equal(g.el('fieldGuide').open,false);
 pad.buttons[9].pressed=false;g.qa.stepField(2);pad.buttons[9].pressed=true;g.qa.stepField(1);assert.equal(g.el('fieldGuide').open,true);
});

test('controller confirm closes briefing without firing or interacting again',()=>{
 const g=fixture();g.place(0,7);const pad=g.makePad();pad.buttons[1].pressed=true;g.qa.stepField(1);assert.equal(g.el('dialogue').open,true);g.qa.stepField(2);assert.equal(g.el('dialogue').open,true);
 pad.buttons[1].pressed=false;g.qa.stepField(1);const shots=g.f.shots();pad.buttons[0].pressed=true;g.qa.stepField(1);assert.equal(g.el('dialogue').open,false);g.qa.stepField(4);assert.equal(g.f.shots(),shots);assert.equal(g.qa.snapshot().state.mission,1);assert.equal(g.qa.snapshot().state.credits,21000);
});

test('archive Escape/cancel and loss of focus clear input without writing a checkpoint',()=>{
 const g=fixture();g.place(-31,-8);g.use();g.down('KeyW');g.r.dispatch('blur');g.tick(2);g.down('Escape');g.up('Escape');assert.equal(g.el('canopyArchive').open,false);assert.equal(g.r.document.activeElement.id,'c');const position=JSON.stringify(g.qa.snapshot().player);g.down('KeyW',{repeat:true});g.qa.stepField(4);assert.equal(JSON.stringify(g.qa.snapshot().player),position);g.up('KeyW');
 g.use();let cancelled=false;g.el('canopyArchive').dispatchEvent({type:'cancel',preventDefault(){cancelled=true;}});assert(cancelled);assert.equal(g.qa.inputDebug().paused,false);assert.equal(g.qa.save(),false);assert.equal(g.r.writes.length,0);
});

test('district record and aftermath use existing state without mutating it',()=>{
 const state=Object.freeze({mission:2,cores:3,obelisks:Object.freeze([true,false,true]),bossDefeated:false,ownsHome:false,sliceComplete:false});const before=JSON.stringify(state);
 assert.deepEqual(Archive.districtRecord(state).map(x=>x.done),[true,false,true]);assert.deepEqual(World.districtMilestones(state),{cores:3,restored:2,quiet:false,homeRecorded:false});assert.equal(JSON.stringify(state),before);
 const district=World.build({seed:66}),eye={x:0,y:2,z:0},forward={x:0,z:1};let rows=[];const engine={mode:'canvas2d',viridiaBatch:batch=>rows.push(...batch.map(x=>({...x}))),viridiaMesh(){}};
 const capture=frame=>{rows=[];district.render(engine,eye,forward,{day:1,rain:0,time:20,reduced:true,...frame});return rows;};
 const dormant=capture({cores:0,obelisks:[false,false,false]}),restored=capture({...state,ownsHome:true,sliceComplete:true,bossDefeated:true});
 assert.equal(dormant.filter(x=>x.detail==='solar-ring').length,0);assert.equal(restored.filter(x=>x.detail==='solar-ring').length,4);assert(restored.some(x=>x.detail==='solar-conduit'));assert.equal(restored.filter(x=>x.detail==='quiet-ruin').length,6);assert.equal(restored.filter(x=>x.detail==='recorded-home').length,1);
 assert.equal(JSON.stringify(capture({...state,time:1})),JSON.stringify(capture({...state,time:999})));assert.equal(JSON.stringify(state),before);
});

test('lectern geometry and civic gestures render within the existing physical district',()=>{
 const g=fixture(),scene=g.f.scene(),solids=g.qa.solidMap();assert.equal(scene.meshes.filter(m=>m.detail==='archive-page').length,6);assert.equal(scene.meshes.filter(m=>m.detail==='lectern').length,6);
 for(const book of Collection.readings)assert(solids.some(s=>s.kind==='archive-post'&&Math.abs(s.x-book.x)<.01&&Math.abs(s.z-(book.z-.75))<.01));
 const state=JSON.stringify(g.qa.snapshot()),writes=g.r.writes.length;g.qa.drawScene();g.qa.setVisualPhase(.7);g.qa.drawScene();assert.equal(JSON.stringify(g.qa.snapshot()),state);assert.equal(g.r.writes.length,writes);assert(g.qa.graphics().meshes.softwareFaces<18000);
});
