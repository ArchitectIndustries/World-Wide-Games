'use strict';
// Original runtime in a modeled DOM/canvas. CSS structure is checked separately;
// this file makes no browser layout, touch-device or screen-reader claim.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require('../../games/aegis-verge/combat-presentation.js');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
const home=path.resolve(__dirname,'../../games/aegis-verge');
const html=fs.readFileSync(path.join(home,'index.html'),'utf8');
const css=fs.readFileSync(path.join(home,'frontier-hud.css'),'utf8');
let passed=0;const checks=[];
const check=(name,test)=>{test();passed++;checks.push(name)};

const base={active:true,relay:0,hostiles:3,capture:0,near:false};
check('launch directive asks for a deployment',()=>assert.equal(P.directive({...base,active:false}),'Choose an operation, then deploy.'));
check('active relay directive contains only the real hostile count',()=>assert.equal(P.directive(base),'Relay 1: defeat 3 hostiles.'));
check('single hostile uses the correct relay and singular count',()=>assert.equal(P.directive({...base,relay:1,hostiles:1}),'Relay 2: defeat 1 hostile.'));
check('clear relay gives the actual route goal',()=>assert.equal(P.directive({...base,hostiles:0}),'Relay 1 clear. Follow the cyan route to its beacon.'));
check('capture directive uses the original three-second requirement',()=>assert.equal(P.directive({...base,hostiles:0,near:true,capture:1.5}),'Relay 1: hold the beacon · 50%.'));
check('capture display clamps without mutating input',()=>{const state={...base,hostiles:0,near:true,capture:8},before=JSON.stringify(state);assert.match(P.directive(state),/100%/);assert.equal(JSON.stringify(state),before)});
check('completed relays point to the original extraction goal',()=>assert.equal(P.directive({...base,hostiles:0,relay:3}),'Relays secured. Reach the green extraction pad.'));
check('terminal directives take precedence over inactive deployment',()=>{assert.match(P.directive({active:false,defeated:true}),/lost/);assert.match(P.directive({active:false,finished:true}),/secured/)});
for(const [input,expected] of [
 ['WARDEN SKYBURST / EXIT THE RING, SHIELD, TAKE COVER OR LURE HOSTILES INTO IT','Skyburst incoming · leave the ring, shield or take cover.'],
 ['RELAY SURGE CHARGING · Q/PULSE to jam · E/AEGIS to shield · retreat to evade','Relay surge · Pulse, shield or leave the ring.'],
 ['CAPACITOR ARMING · 1.2s / light drones try to escape','CAPACITOR ARMING · 1.2s. Clear the ring.'],
 ['POTENTIAL BULWARK VOLLEY / CURRENT POSITION IN 3 FIRING LANES / MOVE OR TAKE COVER','Bulwark volley · leave orange lanes or take cover.'],
 ['LANCER THREE-LANE LOCK / evade every marked orange lane or take cover','Lancer lock · evade orange lanes or take cover.'],
 ['SKYBURST SILENCE · 2 staggered hostiles vulnerable / double shot damage','2 hostiles exposed · double-damage opening.'],
 ['PAUSED / P or Resume','Paused · P or Resume to continue.'],
 ['FOCUS PAUSED / press P or Resume combat','Paused after switching away. Resume when ready.']
])check('concise contextual cue: '+input.split(' / ')[0],()=>{assert.equal(P.alert(input),expected);assert(expected.length<80)});
check('unrecognized earned-result and safety messages remain intact',()=>{const text='FIELD SALVAGE RECOVERED · hull +18 · Aegis +30 · RANKED RUN ENDED — PRACTICE ONLY';assert.equal(P.alert(text),text)});
check('empty contextual cue stays empty',()=>assert.equal(P.alert(''),''));
check('manual disclosure copies the complete existing content exactly',()=>{const source={innerHTML:'<summary>Mission</summary><p>Full controls &amp; ranked rules.</p>'},target={innerHTML:''};assert(P.copyManual({getElementById:id=>id==='missionBriefing'?source:target}));assert.equal(target.innerHTML,source.innerHTML);assert.equal(P.copyManual({getElementById:()=>null}),false)});

// A minimal tree from static markup verifies the real grouping and ID uniqueness.
// The runtime fixture intentionally has a flat DOM and cannot establish these.
const markup=html.split('<script',1)[0],nodes=[],stack=[],ids=new Map();
const voids=new Set(['meta','link','input','br','hr','img','source','wbr','area','base','embed','param','track','col']);
for(const token of markup.matchAll(/<\/?([a-z][\w-]*)\b([^>]*)>/gi)){
 const tag=token[1].toLowerCase();
 if(token[0][1]==='/'){assert.equal(stack.pop()?.tag,tag);continue}
 const attrs={};for(const a of token[2].matchAll(/([\w:-]+)(?:\s*=\s*"([^"]*)")?/g))attrs[a[1]]=a[2]??'';
 const node={tag,attrs,parent:stack.at(-1),children:[]};node.parent?.children.push(node);nodes.push(node);
 if(attrs.id){assert(!ids.has(attrs.id),'duplicate ID '+attrs.id);ids.set(attrs.id,node)}
 if(!voids.has(tag))stack.push(node);
}
const within=(node,parent)=>{for(let n=node;n;n=n.parent)if(n===parent)return true;return false};
const hud=nodes.find(n=>n.attrs.class==='hud'),guide=ids.get('fieldGuideContent');
check('exactly three critical pills occupy the active HUD',()=>{assert.equal(hud.children.length,3);for(const id of ['hull','energy','threat'])assert(within(ids.get(id),hud))});
check('all secondary stats remain available in the field guide',()=>{for(const id of ['op','relay','score','ghostPill','interceptPill','recoveryPill','overguardPill','guardPill','pulsePill','dashPill','decoyPill','breachPill','fluxPill','circuitPill','guidePill','cachePill','uplinkPill','trialPill','rankStatus'])assert(within(ids.get(id),guide),id)});
check('one contextual alert location retains critical screen-reader nodes',()=>{assert(within(ids.get('combatStatus'),ids.get('objectivePanel')));assert(within(ids.get('spatialCue'),ids.get('objectivePanel')));assert(!within(ids.get('shieldNotice'),guide));assert(!within(ids.get('relayLockVoice'),guide));assert(css.includes('#combatStatus:not(:empty)+#spatialCue{display:none!important}'))});
check('existing pause and disclosures remain independent named controls',()=>{for(const id of ['pauseButton','compactBriefButton','compactToolsButton','compactMenuButton'])assert.equal(ids.get(id).parent.attrs.class,'battle-actions');assert.equal(ids.get('compactBriefButton').attrs['aria-controls'],'objectivePanel');assert.equal(ids.get('objectivePanel').attrs.tabindex,'-1')});
check('full manual contains no nested IDs that could be duplicated',()=>{const brief=ids.get('missionBriefing');for(const [id,node]of ids)if(id!=='missionBriefing')assert(!within(node,brief),id)});
check('disclosure layer keeps minimum 44-pixel interactive controls and mobile scroll',()=>{assert(css.includes('min-width:44px;min-height:44px;height:44px'));assert(css.includes('touch-action:pan-y'));assert(css.includes('summary:focus-visible'));assert(css.includes('max-height:calc(100dvh - 99px)'))});
check('new presentation resources load after the retained compact controls',()=>{assert(html.indexOf('href="frontier-hud.css"')>html.indexOf('href="compact-combat-hud.css"'));assert(html.indexOf('src="combat-presentation.js"')>html.indexOf('src="compact-combat-hud.js"'))});

const r=boot('aegis-verge',{transformScript:s=>s.replace('window.__aegisVerge={','window.__aegisVerge={render,update,sync,')});
const game=r.context.__aegisVerge,button=id=>r.byId.get(id);
button('start').click();game.render();
check('actual deployment enables the simplified combat HUD',()=>{assert(game.state().active);assert(r.document.body.classList.contains('playing-hud'));assert.equal(button('objText').textContent,'Relay 1: defeat 3 hostiles.')});
r.dispatch('keydown',{code:'KeyW',key:'w',repeat:false});game.update(.05);
const before=JSON.parse(JSON.stringify(game.state())),writes=r.writes.length,events=r.messages.length;
button('compactBriefButton').click();game.render();
check('opening the field guide uses the real pause and input-release path',()=>{assert(game.state().paused);assert(r.context.AegisCompactHUD.isOpen('compactBriefButton'));assert.equal(button('compactBriefButton').getAttribute('aria-expanded'),'true');assert.equal(r.document.activeElement,button('objectivePanel'));assert.equal(button('pauseButton').textContent,'Resume');assert(Object.values(r.context.keys).every(x=>!x))});
check('opening guide changes no score, mission, reward, or storage state',()=>{const after=JSON.parse(JSON.stringify(game.state()));assert.deepEqual({...after,paused:before.paused},before);assert.equal(r.writes.length,writes);assert.equal(r.messages.length,events)});
const frozen=JSON.stringify(game.state()),frozenAt=r.context.elapsed;
for(let i=0;i<20;i++){game.update(.05);if(i%5===0)game.render()}
check('reading the guide freezes real simulation and environmental time',()=>{assert.equal(JSON.stringify(game.state()),frozen);assert.equal(r.context.elapsed,frozenAt)});
r.dispatch('keydown',{key:'Escape',code:'Escape',target:button('objectivePanel'),repeat:false});
check('Escape closes the disclosure, restores its control focus and stays paused',()=>{assert(!r.context.AegisCompactHUD.isOpen('compactBriefButton'));assert.equal(button('compactBriefButton').getAttribute('aria-expanded'),'false');assert.equal(r.document.activeElement,button('compactBriefButton'));assert(game.state().paused)});
button('compactBriefButton').click();game.render();
check('opening a guide while paused never silently resumes combat',()=>assert(game.state().paused));
check('Space on a native briefing summary remains available to expand its details',()=>{let prevented=false;const summary={closest:selector=>selector.includes('summary')?summary:null};r.dispatch('keydown',{key:' ',code:'Space',target:summary,repeat:false,preventDefault:()=>{prevented=true}});assert(!prevented);assert(game.state().paused);assert(!r.context.keys.fire)});
button('pauseButton').click();game.render();
check('deliberate Resume closes all disclosures and focuses the combat canvas',()=>{assert(!game.state().paused);for(const id of ['compactBriefButton','compactToolsButton','compactMenuButton'])assert.equal(button(id).getAttribute('aria-expanded'),'false');assert.equal(r.document.activeElement,button('c'));assert.equal(button('pauseButton').textContent,'Pause')});
const resumedAt=r.context.elapsed;game.update(.05);
check('simulation advances only after deliberate resume',()=>assert(r.context.elapsed>resumedAt));
button('compactBriefButton').click();r.dispatch('keydown',{key:'p',code:'KeyP',target:button('objectivePanel'),repeat:false});game.render();
check('existing P keyboard resume works from the focused guide',()=>{assert(!game.state().paused);assert(!r.context.AegisCompactHUD.isOpen('compactBriefButton'));assert.equal(r.document.activeElement,button('c'))});
game.clearWave();
check('actual clear-wave state switches to the concise route directive',()=>assert.equal(button('objText').textContent,'Relay 1 clear. Follow the cyan route to its beacon.'));
game.teleportRelay();game.sync();
check('entering the real relay perimeter switches to hold progress',()=>assert.equal(button('objText').textContent,'Relay 1: hold the beacon · 0%.'));

console.log(JSON.stringify({passed,total:passed,scope:'Pure presentation, actual HTML/CSS contracts and original game code in modeled DOM/canvas; no browser layout or device claim.',checks},null,2));
