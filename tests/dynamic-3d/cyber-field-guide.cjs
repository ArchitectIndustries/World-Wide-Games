'use strict';
// Actual CW event handlers with modeled DOM/canvas. Real layout/focus rendering
// is qualified separately in the supported browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
let passed=0;const names=[];function check(name,fn){fn();passed++;names.push(name);}
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'games/cyber-wars/index.html'),'utf8');
const baseline=process.env.CW_BASELINE_HTML?fs.readFileSync(process.env.CW_BASELINE_HTML,'utf8'):cp.execFileSync('git',['show','53a569bf4b8493e666298d4c702e427e2e14260d:games/cyber-wars/index.html'],{cwd:root,encoding:'utf8'});
const oldHud=baseline.slice(baseline.indexOf('<div class="hud">'),baseline.indexOf('<div class="reticle">'));
check('all pre-existing HUD/status IDs remain unique in the new document',()=>{
 for(const [,id]of oldHud.matchAll(/id="([^"]+)"/g))assert.equal([...html.matchAll(new RegExp('id="'+id+'"','g'))].length,1,id);
});
check('secondary status, map and complete notes are contained in the native guide',()=>{
 const guide=html.slice(html.indexOf('<dialog id="fieldGuide"'),html.indexOf('</dialog>',html.indexOf('<dialog id="fieldGuide"')));
 for(const id of ['riverStatus','riverRunStatus','riverCargoStatus','threatStatus','journalStatus','worldCode','map'])assert(guide.includes('id="'+id+'"'),id);
 assert(guide.includes('Complete field and river instructions'));assert(guide.includes('>Field Guide</h2>'));
 const core=html.slice(html.indexOf('<div class="hud"'),html.indexOf('<div class="field-tools"'));
 assert.equal((core.match(/class="pill"/g)||[]).length,2);assert(!core.includes('riverCargoStatus'));
 const footer=html.match(/<div class="brand">([^<]*)<\/div>/)[1];assert(footer.split(/\s+/).length<20);
});
check('guide controls and optional touch actions have explicit accessible state',()=>{
 assert(/id="fieldGuideButton"[^>]*aria-controls="fieldGuide"[^>]*aria-expanded="false"/.test(html));
 assert(/id="touchTools"[^>]*aria-controls="touchActions"[^>]*aria-expanded="false"/.test(html));
 assert(html.includes('.field-tools[hidden]{display:none!important}'));
 assert(html.includes('.context-brief[hidden]{display:none!important}'));
 assert(/\.field-tools button,\.field-guide button\{min-height:44px;min-width:44px/.test(html));
 assert.equal((html.match(/class="touch-extra" data-act=/g)||[]).length,7);
});
const injection=`if(qa)window.__guideFixture={tick,shots:()=>shots.length,keys:()=>({...keys}),field:()=>JSON.stringify({player,weatherTime:weather.time,enemies:enemies.map(e=>[e.x,e.z,e.hp]),fauna:fauna.map(a=>[a.x,a.z,a.hp]),raft:{x:raft.x,z:raft.z},credits:state.credits,mission:state.mission})};\nif(qa)window.CWQA={`;
const r=boot('cyber-wars',{transformScript:code=>code.replace('if(qa)window.CWQA={',injection)}),qa=r.context.CWQA,f=r.context.__guideFixture;
const position=()=>JSON.stringify(qa.snapshot().player);
const el=id=>r.byId.get(id),down=(code,extras={})=>r.dispatch('keydown',{code,key:code,repeat:false,...extras}),up=code=>r.dispatch('keyup',{code});
check('the guide cannot open before entering the world',()=>{el('fieldGuideButton').click();assert.equal(el('fieldGuide').open,false);assert.equal(el('fieldTools').hidden,true);});
el('start').click();
check('core controls activate with the world and touch expansion is reversible',()=>{
 assert.equal(el('fieldTools').hidden,false);el('touchTools').click();assert.equal(el('touchTools').getAttribute('aria-expanded'),'true');el('touchTools').click();assert.equal(el('touchTools').getAttribute('aria-expanded'),'false');
});
down('KeyW');qa.stepField(2);const before=f.field(),beforePosition=position(),writes=r.writes.length;
check('opening the guide pauses and clears field input with initial focus',()=>{
 el('fieldGuideButton').click();assert.equal(el('fieldGuide').open,true);assert.equal(qa.inputDebug().paused,true);assert.equal(r.document.activeElement.id,'fieldGuideClose');assert.equal(el('fieldGuideButton').getAttribute('aria-expanded'),'true');assert(Object.values(f.keys()).every(v=>!v));
});
check('guide keys and ticks cannot move actors, advance weather or create saves',()=>{
 const shots=f.shots();for(const code of ['KeyW','Space','KeyE','KeyQ','KeyH','KeyV'])down(code);
 for(let i=0;i<20;i++)f.tick(1100+i*35);
 assert.equal(f.field(),before);assert.equal(f.shots(),shots);assert.equal(r.writes.length,writes);
});
check('returning to the field focuses the canvas and requires held keys to release',()=>{
 el('fieldGuideClose').click();assert.equal(el('fieldGuide').open,false);assert.equal(qa.inputDebug().paused,false);assert.equal(r.document.activeElement.id,'c');assert.equal(el('fieldGuideButton').getAttribute('aria-expanded'),'false');
 down('KeyW',{repeat:true});qa.stepField(2);assert.equal(position(),beforePosition);
 for(const code of ['KeyW','Space','KeyE','KeyQ','KeyH','KeyV'])up(code);
 down('KeyW');qa.stepField(2);up('KeyW');assert.notEqual(position(),beforePosition);
});
check('help shortcuts and native cancellation close cleanly',()=>{
 down('F1');up('F1');assert.equal(el('fieldGuide').open,true);let cancelled=false;el('fieldGuide').dispatchEvent({type:'cancel',preventDefault(){cancelled=true;}});assert(cancelled);assert.equal(el('fieldGuide').open,false);assert.equal(qa.inputDebug().paused,false);
 down('Slash',{shiftKey:true});up('Slash');assert.equal(el('fieldGuide').open,true);down('Escape');up('Escape');assert.equal(el('fieldGuide').open,false);
});
check('native button Space does not leak into the field pulse action',()=>{
 el('fieldGuideButton').focus();const shots=f.shots();down('Space',{target:el('fieldGuideButton')});up('Space');assert.equal(f.shots(),shots);el('fieldGuideButton').click();el('fieldGuideClose').click();down('Space',{target:el('c')});up('Space');assert.equal(f.shots(),shots+1);
});
check('a guide opened from pause returns to the paused menu',()=>{
 el('fieldPause').click();assert.equal(qa.inputDebug().paused,true);el('pauseGuide').click();assert.equal(el('fieldGuideClose').textContent,'Return to pause menu');el('fieldGuideClose').click();assert.equal(qa.inputDebug().paused,true);assert.equal(el('pause').style.display,'grid');assert.equal(r.document.activeElement.id,'pauseGuide');el('resume').click();assert.equal(qa.inputDebug().paused,false);
});
const pad={connected:true,mapping:'standard',buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0,0,0]};r.context.navigator.getGamepads=()=>[pad];qa.stepField(2);
check('controller Start opens and closes the guide without leaking held actions',()=>{
 pad.buttons[9].pressed=true;qa.stepField(1);assert.equal(el('fieldGuide').open,true);const field=f.field(),playerPosition=position(),shots=f.shots();pad.buttons[0].pressed=true;pad.axes[0]=.8;qa.stepField(3);assert.equal(f.field(),field);assert.equal(f.shots(),shots);
 pad.buttons[9].pressed=false;qa.stepField(1);pad.buttons[9].pressed=true;qa.stepField(1);assert.equal(el('fieldGuide').open,false);qa.stepField(3);assert.equal(position(),playerPosition);assert.equal(f.shots(),shots);
 pad.buttons[9].pressed=false;pad.buttons[0].pressed=false;pad.axes[0]=0;qa.stepField(2);pad.buttons[0].pressed=true;qa.stepField(1);assert.equal(f.shots(),shots+1);pad.buttons[0].pressed=false;qa.stepField(1);
});
check('controller B closing the guide cannot interact with the nearby steward',()=>{
 qa.setPlayer(0,6);pad.buttons[9].pressed=true;qa.stepField(1);pad.buttons[9].pressed=false;qa.stepField(1);assert.equal(el('fieldGuide').open,true);pad.buttons[1].pressed=true;qa.stepField(1);assert.equal(el('fieldGuide').open,false);qa.stepField(2);assert.notEqual(el('dialogue').style.display,'block');assert.equal(qa.inputDebug().paused,false);pad.buttons[1].pressed=false;qa.stepField(1);
});
check('river brief appears only in the relevant context and no progression is granted',()=>{
 qa.setPlayer(17,8);assert.equal(el('contextBrief').hidden,false);assert.match(el('contextBrief').textContent,/WADING|RAIN SURGE/);assert.match(el('fieldAlerts').textContent,/River: (wading|rain surge)/);qa.setPlayer(0,3);assert(!el('contextBrief').textContent.includes('WADING'));assert.equal(el('contextBrief').hidden,el('threatStatus').textContent==='UNDETECTED');assert.equal(qa.snapshot().state.credits,21000);assert.equal(qa.snapshot().state.pilotRank,0);assert.equal(r.writes.length,writes);
});
console.log(JSON.stringify({suite:'Cyber Wars compact HUD and Field Guide',passed,total:passed,checks:names,browserLayoutTest:false}));
