'use strict';
// Source-executed physics and DOM-simulation checks; not browser/device evidence.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const gamePath=path.resolve(__dirname,'../../games/skyline-hoops/game.js');
const P=require(gamePath);
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function flight(spot,angle,power){const b=P.makeBall(spot,angle,power);let goals=0;for(let i=0;i<1200&&!b.done;i++){P.stepBall(b,1/180);if(b.event==='score')goals++;}return {b,goals};}
const DIRECT=[[56,53],[53,58],[52,62],[49,68],[47,73],[52,61],[46,76],[49,67],[46,78],[49,69]];
for(let i=0;i<10;i++)test(`Course spot ${i+1} has a reachable direct shot`,()=>{const {b,goals}=flight(P.COURSE[i],...DIRECT[i]);assert(b.done);assert(b.scored);assert(!b.scoreBank);assert.equal(goals,1);assert.equal(P.pointsFor(b,P.COURSE[i]),P.COURSE[i].long?150:100);});
test('Reachable bank shot earns its declared bonus',()=>{const {b,goals}=flight(P.COURSE[5],45,76);assert(b.scored&&b.scoreBank);assert.equal(P.pointsFor(b,P.COURSE[5]),150);assert.equal(goals,1);});
test('Long range and bank bonuses stack once',()=>{const {b,goals}=flight(P.COURSE[9],41,88);assert(b.scored&&b.scoreBank);assert.equal(P.pointsFor(b,P.COURSE[9]),200);assert.equal(goals,1);});
test('Rising through the hoop is not a basket',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:800,y:261,vx:0,vy:-100});P.stepBall(b,1/60);assert(b.y<260);assert(!b.scored);});
test('Downward clean crossing scores once',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:800,y:259,vx:0,vy:100});P.stepBall(b,1/60);assert(b.scored);assert.equal(b.event,'score');P.stepBall(b,1/60);assert.notEqual(b.event,'score');});
test('Outside the rim opening does not score',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:730,y:259,vx:0,vy:100});P.stepBall(b,1/60);assert(!b.scored);});
test('A floor bounce cannot create a basket',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:800,y:259,vx:0,vy:100,hitFloor:true});P.stepBall(b,1/60);assert(!b.scored);});
test('Backboard collisions reverse horizontal motion',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:847,y:220,vx:300,vy:0});P.stepBall(b,1/180);assert(b.vx<0);assert(b.bank);assert(!b.scored);});
test('Post-basket glass contact cannot add a bank bonus',()=>{const b=P.makeBall(P.COURSE[0],60,50);Object.assign(b,{x:800,y:259,vx:0,vy:100});P.stepBall(b,1/60);assert(b.scored);b.bank=true;assert.equal(P.pointsFor(b,P.COURSE[0]),100);});
test('All angle/power extremes terminate without invalid state',()=>{for(const spot of P.COURSE)for(const angle of [35,80])for(const power of [0,100]){const {b,goals}=flight(spot,angle,power);assert(b.done);assert([b.x,b.y,b.vx,b.vy].every(Number.isFinite));assert(goals<=1);}});
test('Aim preview agrees with actual basket result for reachable and missed shots',()=>{for(let i=0;i<10;i++)for(const shot of [DIRECT[i],[35,0],[80,100],[55,70]]){const forecast=P.predict(P.COURSE[i],...shot);const live=flight(P.COURSE[i],...shot);assert.equal(forecast.ball.scored,live.b.scored);assert.equal(P.pointsFor(forecast.ball,P.COURSE[i]),P.pointsFor(live.b,P.COURSE[i]));}});
test('Free-flight movement agrees with the projectile equation',()=>{const b=P.makeBall(P.COURSE[0],60,50);const initial={...b};for(let i=0;i<18;i++)P.stepBall(b,1/180);assert(Math.abs(b.x-(initial.x+initial.vx*.1))<1e-8);assert(Math.abs(b.y-(initial.y+initial.vy*.1+P.GRAVITY*.01/2))<1e-8);});

function harness(storage=new Map(),denyStorage=false,search=''){
  let tick=0,raf;
  const messages=[],events=new Map(),docEvents=new Map(),audioLevels=[];
  const gradient={addColorStop(){}};
  const context=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(obj,key)=>key in obj?obj[key]:(()=>{}),set:(obj,key,value)=>(obj[key]=value,true)});
  class Element{constructor(tagName='DIV'){this.tagName=tagName;this.listeners=new Map();this.value='';this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.attributes={};}addEventListener(key,fn){this.listeners.set(key,fn);}setAttribute(key,value){this.attributes[key]=value;}replaceChildren(...children){this.children=children;}focus(){document.activeElement=this;}emit(type,event={}){this.listeners.get(type)?.(event);}click(){if(!this.disabled)this.emit('click');}getContext(){return context;}getBoundingClientRect(){return {left:0,top:0,width:1000,height:600};}setPointerCapture(id){this.pointerId=id;}hasPointerCapture(id){return this.pointerId===id;}releasePointerCapture(){this.pointerId=null;}}
  const elements=new Map();for(const id of ['court','angle','power','shoot','next','retry','pause','sound','status','track','shot','score','buckets','best','angle-value','power-value','ready-badge','spot','bonus','shot-title','storage-notice'])elements.set(id,new Element(['angle','power'].includes(id)?'INPUT':['shoot','next','retry','pause','sound'].includes(id)?'BUTTON':'DIV'));
  const document={hidden:false,getElementById:id=>elements.get(id),createElement:tag=>new Element(tag.toUpperCase()),addEventListener:(type,fn)=>docEvents.set(type,fn)};
  class TestAudioContext{constructor(){this.state='running';this.currentTime=0;this.destination={};}createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime:value=>audioLevels.push(value),exponentialRampToValueAtTime(){}},connect(){}};}}
  const window={devicePixelRatio:1,AudioContext:TestAudioContext,matchMedia:()=>({matches:true}),addEventListener:(type,fn)=>events.set(type,fn)};
  const sandbox={document,window,console,Math,Number,JSON,Set,Map,URLSearchParams,location:{origin:'https://qa.invalid',search},parent:{postMessage:(data,origin)=>messages.push({data,origin})},requestAnimationFrame:fn=>{raf=fn;},localStorage:{getItem:key=>{if(denyStorage)throw Error('Blocked');return storage.get(key)||null;},setItem:(key,value)=>{if(denyStorage)throw Error('Blocked');storage.set(key,value);}}};
  vm.runInNewContext(fs.readFileSync(gamePath,'utf8'),sandbox,{filename:'game.js'});
  const advance=(frames=1)=>{for(let i=0;i<frames;i++){tick+=1000/60;raf(tick);}};
  const set=(id,value)=>{const el=elements.get(id);el.value=String(value);el.emit('input');};
  const key=(key,tagName='BODY')=>events.get('keydown')({key,target:{tagName},preventDefault(){},repeat:false});
  const untilResult=()=>{for(let n=0;n<600&&elements.get('next').hidden;n++)advance();assert(!elements.get('next').hidden,'shot reaches a result');};
  return {elements,events,docEvents,messages,storage,audioLevels,document,advance,set,key,untilResult,click:id=>elements.get(id).click()};
}
test('Complete ten-shot course emits exactly one final result and persists actual score',()=>{
  const h=harness();for(let i=0;i<10;i++){h.set('angle',DIRECT[i][0]);h.set('power',DIRECT[i][1]);h.click('shoot');h.untilResult();assert.equal(h.messages.length,0);h.click('next');}
  assert.equal(h.elements.get('score').textContent,'1250');assert.equal(h.messages.length,1);assert.equal(h.messages[0].data.event,'course-complete');assert.equal(h.messages[0].data.score,1250);assert.equal(h.messages[0].origin,'https://qa.invalid');
  h.key('Enter');h.click('next');h.advance(10);assert.equal(h.messages.length,1);
  const fresh=harness(h.storage);assert.equal(fresh.elements.get('best').textContent,'1250');
  h.click('retry');assert.equal(h.elements.get('score').textContent,'0');assert.equal(h.elements.get('best').textContent,'1250');assert.equal(h.messages.length,1);
});
test('Ten misses complete with a truthful zero score',()=>{const h=harness();for(let i=0;i<10;i++){h.set('angle',35);h.set('power',0);h.click('shoot');h.untilResult();h.click('next');}assert.equal(h.messages.length,1);assert.equal(h.messages[0].data.score,0);assert.equal(h.elements.get('buckets').innerHTML,'0 <small>/ 10</small>');});
test('Pause freezes an in-flight shot and resumes it',()=>{const h=harness();h.set('angle',56);h.set('power',53);h.click('shoot');h.advance(10);h.click('pause');h.advance(600);assert.equal(h.elements.get('ready-badge').textContent,'PAUSED');assert(h.elements.get('next').hidden);assert.equal(h.elements.get('score').textContent,'0');h.click('pause');h.untilResult();assert.equal(h.elements.get('score').textContent,'100');});
test('Blur pauses play and clears held aim input',()=>{const h=harness();h.key('w');const value=h.elements.get('power').value;h.events.get('blur')();h.advance(30);assert.equal(h.elements.get('ready-badge').textContent,'PAUSED');h.key('p');h.advance(60);assert.equal(h.elements.get('power').value,value);});
test('Keyboard angle controls work while a button is focused',()=>{const h=harness();const original=h.elements.get('angle').value;h.key('ArrowLeft','BUTTON');assert.equal(Number(h.elements.get('angle').value),Number(original)+1);});
test('Storage denial does not prevent completion and clearly reports session-only best',()=>{const h=harness(new Map(),true);for(let i=0;i<10;i++){h.set('angle',DIRECT[i][0]);h.set('power',DIRECT[i][1]);h.click('shoot');h.untilResult();h.click('next');}assert.equal(h.messages.length,1);assert.equal(h.messages[0].data.score,1250);assert.equal(h.elements.get('storage-notice').hidden,false);assert.match(h.elements.get('storage-notice').textContent,/visit only/);assert.match(h.elements.get('status').textContent,/session best/);});
test('Swipe release launches; cancelled touch does not',()=>{const h=harness(),canvas=h.elements.get('court');canvas.emit('pointerdown',{button:0,pointerId:7,clientX:380,clientY:477,preventDefault(){}});canvas.emit('pointermove',{pointerId:7,clientX:495,clientY:277});canvas.emit('pointercancel');canvas.emit('pointerup',{pointerId:7});assert.equal(h.elements.get('ready-badge').textContent,'READY');canvas.emit('pointerdown',{button:0,pointerId:8,clientX:380,clientY:477,preventDefault(){}});canvas.emit('pointermove',{pointerId:8,clientX:495,clientY:277});canvas.emit('pointerup',{pointerId:8});assert.equal(h.elements.get('ready-badge').textContent,'IN FLIGHT');h.untilResult();});
test('P pauses with either a slider or a button focused',()=>{const h=harness();h.key('p','INPUT');assert.equal(h.elements.get('ready-badge').textContent,'PAUSED');h.key('p','BUTTON');assert.equal(h.elements.get('ready-badge').textContent,'READY');});
test('Global keyboard controls leave native slider arrows alone',()=>{const h=harness();const angle=h.elements.get('angle').value;let prevented=false;h.events.get('keydown')({key:'ArrowLeft',target:{tagName:'INPUT'},preventDefault(){prevented=true;},repeat:false});assert.equal(prevented,false);assert.equal(h.elements.get('angle').value,angle);});
test('Parent mute cannot be overridden by the game sound button',()=>{const h=harness(new Map(),false,'?muted=1&volume=1');assert(h.elements.get('sound').disabled);assert.equal(h.elements.get('sound').textContent,'Sound muted');h.click('sound');assert.equal(h.audioLevels.length,0);});
test('Parent volume scales synthesized sound amplitude',()=>{const h=harness(new Map(),false,'?volume=0.2');h.click('sound');assert.equal(h.audioLevels.length,1);assert(Math.abs(h.audioLevels[0]-.005)<1e-9);});
test('Parent zero volume mutes; numeric volume is bounded',()=>{const zero=harness(new Map(),false,'?volume=0');assert(zero.elements.get('sound').disabled);const excessive=harness(new Map(),false,'?volume=5');excessive.click('sound');assert.equal(excessive.audioLevels[0],.025);const negative=harness(new Map(),false,'?volume=-1');assert(negative.elements.get('sound').disabled);});
console.log(JSON.stringify({passed,total:passed,evidence:'Source-executed physics and lightweight DOM simulation. No real-browser, device, or audio claim.'}));
