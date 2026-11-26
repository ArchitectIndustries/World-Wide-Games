'use strict';
// Ports the concurrent campaign's controlled state fixtures to Node VM.
// Production source stays private; this test alone injects a local inspection hook.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {boot}=require('./runtime-harness.cjs');
const checks=[];const check=(name,value)=>{assert.ok(value,name);checks.push(name)};
const root=path.resolve(__dirname,'../..'),ctx={window:{},document:{getElementById:()=>null}};
for(const file of ['js/games.js','js/event-rules.js','js/arcade-expansion.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
check('Combined catalog has 91 unique games',ctx.window.WWG_GAMES.length===91&&new Set(ctx.window.WWG_GAMES.map(g=>g.id)).size===91);
const hook='window.__campaignFixture={state:()=>state,phase:()=>phase,stage:()=>stage,begin,finish,move,rescue,defense,frame,keys};';
function instrument(code,src){if(!src.endsWith('wwg-campaign.js'))return code;assert.ok(code.endsWith('})();\n'));return code.slice(0,-6)+hook+'})();\n'}
for(const game of ['stormwake-rescue','iron-meridian']){
 const prefix=game+': ',publicRun=boot(game,{origin:'https://worldwidegames.vercel.app/games/'+game+'/'});
 check(prefix+'ordinary source exposes no test hook',!('__campaignFixture'in publicRun.context));
 publicRun.byId.get('launch').click();check(prefix+'ordinary launch hides the menu',publicRun.byId.get('menu').hidden);
 const r=boot(game,{transformScript:instrument}),el=id=>r.byId.get(id),qa=r.context.__campaignFixture;
 check(prefix+'game identity comes from the actual body attribute',r.document.body.dataset.game===game);
 check(prefix+'initial menu is shown',!el('menu').hidden&&qa.phase()==='menu');
 el('launch').click();check(prefix+'actual launch begins play',el('menu').hidden&&qa.phase()==='play');
 const x=qa.state().p.x;r.dispatch('keydown',{code:'ArrowRight'});qa.frame(1050);r.dispatch('keyup',{code:'ArrowRight'});
 check(prefix+'actual key handler moves player through frame loop',qa.state().p.x>x);
 el('pause').click();const t=qa.state().t;qa.frame(1100);
 check(prefix+'pause opens menu and freezes simulation',!el('menu').hidden&&qa.phase()==='paused'&&qa.state().t===t);
 el('launch').click();check(prefix+'resume closes menu',el('menu').hidden&&qa.phase()==='play');
 r.dispatch('keydown',{code:'KeyP',repeat:false});check(prefix+'P pauses',qa.phase()==='paused');
 r.dispatch('keydown',{code:'KeyP',repeat:false});check(prefix+'P resumes',qa.phase()==='play'&&el('menu').hidden);
 el('restart').click();check(prefix+'restart resets active operation',qa.state().t===0&&qa.stage()===0&&el('menu').hidden);
 r.dispatch('blur');check(prefix+'focus loss pauses actual game',qa.phase()==='paused'&&!el('menu').hidden);el('launch').click();
 if(game==='stormwake-rescue'){
  let s=qa.state();s.p.x=200;s.p.y=270;for(const o of s.entities.slice(0,3)){o.x=200;o.y=270}qa.rescue(0);
  check(prefix+'vessel capacity is two survivors',s.cargo===2);
  s.p.x=80;s.p.y=270;qa.rescue(0);
  check(prefix+'dock delivers cargo and adds earned rescue points',s.saved===2&&s.cargo===0&&s.score===1000);
  r.dispatch('keydown',{code:'ArrowRight'});r.dispatch('keydown',{code:'Space'});qa.move(.1);r.dispatch('keyup',{code:'Space'});r.dispatch('keyup',{code:'ArrowRight'});
  check(prefix+'boost consumes energy',s.p.energy<100);
  s.p.x=s.reef[0].x+10;s.p.y=s.reef[0].y;qa.rescue(0);
  check(prefix+'actual reef collision causes hull damage',s.p.hp<100);
  s.time=0;qa.rescue(.02);
  check(prefix+'timeout ends attempt and shows retry',qa.phase()==='ended'&&!el('menu').hidden);
 }else{
  const s=qa.state();s.p.x=350;s.p.y=270;r.dispatch('keydown',{code:'KeyE'});qa.defense(.01);r.dispatch('keyup',{code:'KeyE'});
  check(prefix+'turret building deducts 35 scrap',s.turrets.length===3&&s.credits===40);
  s.entities=[{x:365,y:270,hp:20,max:20,speed:0,damage:0,cd:100,heavy:false,fast:false}];r.dispatch('keydown',{code:'Space'});qa.defense(.01);r.dispatch('keyup',{code:'Space'});qa.defense(.03);
  check(prefix+'real projectile collision defeats a nearby enemy',s.kills>=1);
  s.p.x=480;s.p.y=270;s.base=70;const credits=s.credits;qa.defense(.1);
  check(prefix+'relay repair consumes scrap',s.base>70&&s.credits<credits);
  s.base=0;s.p.x=300;qa.defense(0);
  check(prefix+'destroyed relay ends attempt and shows retry',qa.phase()==='ended'&&!el('menu').hidden);
 }
 check(prefix+'loss emits one attempt event',r.messages.filter(m=>m.event==='run-ended').length===1);
 check(prefix+'loss never emits campaign completion',!r.messages.some(m=>m.event==='campaign-complete'));
 el('launch').click();check(prefix+'retry returns to operation score checkpoint',qa.phase()==='play'&&qa.state().score===0&&qa.stage()===0&&el('menu').hidden);
 for(let stage=0;stage<3;stage++){
  check(prefix+'enters operation '+(stage+1),qa.stage()===stage);
  const s=qa.state();if(game==='stormwake-rescue'){s.saved=s.goal;qa.rescue(0)}else{s.kills=s.goal;s.entities=[];qa.defense(0)}
  check(prefix+'completed operation '+(stage+1)+' opens result menu',!el('menu').hidden&&qa.phase()===(stage<2?'between':'ended'));
  if(stage<2){check(prefix+'intermediate stage is not a campaign clear',!r.messages.some(m=>m.event==='campaign-complete'));el('launch').click();}
 }
 check(prefix+'three-stage chain emits one finite scored campaign clear',r.messages.filter(m=>m.event==='campaign-complete'&&Number.isFinite(m.score)).length===1);
 qa.finish(true);check(prefix+'finished phase rejects duplicate completion',r.messages.filter(m=>m.event==='campaign-complete').length===1);
 check(prefix+'local record persists without a new dependency',Number(r.storage.get(game+':best'))>0);
 const rules=ctx.window.WWG_EVENT_RULES;
 check(prefix+'earned campaign event is a registered completion',rules.isCompletion(game,'campaign-complete')&&rules.isMilestone(game,'campaign-complete'));
 check(prefix+'attempt and stage telemetry cannot clear the catalog entry',!rules.isCompletion(game,'run-ended')&&!rules.isCompletion(game,'stage-complete'));
 const html=fs.readFileSync(path.join(root,'games',game,'index.html'),'utf8');
 check(prefix+'hidden overlay has explicit display and pointer guards',/\[hidden\]\{display:none!important;pointer-events:none!important\}/.test(html));
}
check('Recovered Railspire earned event survives reconciliation',ctx.window.WWG_EVENT_RULES.isCompletion('railspire-dispatch','shift-cleared')&&!ctx.window.WWG_EVENT_RULES.isCompletion('railspire-dispatch','shift-complete'));
check('Recovered Cyber Wars and Gravity completion rules survive',ctx.window.WWG_EVENT_RULES.isCompletion('cyber-wars','viridia-slice-complete')&&ctx.window.WWG_EVENT_RULES.isCompletion('gravity-foundry','foundry-complete'));
console.log(JSON.stringify({suite:'Concurrent original campaigns',passed:checks.length,total:checks.length,qualification:'Actual source in Node VM with modeled DOM/canvas and test-only controlled state fixtures. No browser layout, real devices, or unassisted campaign claim.',checks},null,2));
