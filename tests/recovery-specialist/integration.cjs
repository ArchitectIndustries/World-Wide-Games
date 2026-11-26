'use strict';
// Executes shipped first-party runtimes with a modeled DOM/canvas, never a browser.
// The river steering paths are the preserved 0.64 fixtures, not new game logic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./runtime-harness.cjs');
const checks=[];
function check(name,condition){assert.ok(condition,name);checks.push(name);}
const raw=fs.readFileSync(path.resolve(__dirname,'../cw064_cargo_drift_chromium.py'),'utf8');
const fixtures=Object.fromEntries(['ROUTE','SPILL','INCOMPLETE'].map(name=>[name,raw.match(new RegExp(name+"='''([\\s\\S]*?)'''"))[1]]));
function cyber(){const r=boot('cyber-wars');r.byId.get('start').click();return r;}
const river=cyber(),initial=river.context.CWQA.snapshot();
check('Cyber Wars boots with the exact 21-credit start',initial.state.credits===21000);
check('New character has no house or Pilot rank',!initial.state.ownsHome&&initial.state.pilotRank===0);
const clear=river.eval('('+fixtures.ROUTE+')()');
check('River cargo physically collects all three moving pods',clear.cargo.count===3&&clear.cargo.picked.every(Boolean));
check('River traversal clears all three ordered gates',clear.run.stage===3&&clear.run.result==='CLEAR');
check('North-bank landing delivers all three pods',clear.cargo.result==='DELIVERED'&&clear.cargo.clears===1);
check('Delivery stays within active-time limit',clear.run.elapsed>0&&clear.run.elapsed<75);
check('Physical course avoids timber collision',clear.run.contacts===0&&clear.cargo.spills===0);
check('Moving pod pickup still uses 0.65-second hold',clear.cargo.hold===.65&&clear.cargo.progress.every(x=>x===.65));
check('Pickup still requires 1.8m proximity and <=2m/s',clear.cargo.range===1.8&&clear.cargo.maxSpeed===2);
check('No credits, ranks or house granted for the optional course',clear.cargo.credits===21000&&clear.cargo.rank===0&&!clear.cargo.ownsHome);
check('Optional course does not persist a strategic save',river.writes.length===0);
check('All drifting pod coordinates and velocities remain finite',clear.cargo.bodies.every(b=>['x','z','vx','vz'].every(k=>Number.isFinite(b[k]))));
const spilled=cyber(),spill=spilled.eval('('+fixtures.SPILL+')()');
check('Fixture physically collects a pod before collision',spill.picked&&spill.before.count===1);
check('One real timber contact spills exactly one pod',spill.struck.run.contacts===1&&spill.struck.cargo.spills===1&&spill.struck.cargo.count===0);
check('Lingering timber contact cannot repeatedly spill',spill.held.cargo.spills===1&&spill.held.run.contacts===1);
check('Overboard target is physically recovered',spill.recovered.cargo.count===1&&spill.recovered.cargo.recoveredSpills===1);
check('Recovery uses actual steering simulation',spill.physicalReturnSteps>15&&spill.physicalReturnSteps<380);
check('Recovered pod leaves no phantom drop',spill.recovered.cargo.dropped.every(x=>x===null));
check('Spill and retrieval preserve credits',spill.recovered.cargo.credits===21000);
check('Spill and retrieval never save without an owned home',spilled.writes.length===0);
const incomplete=cyber().eval('('+fixtures.INCOMPLETE+')()');
check('Landing without cargo never claims delivery',incomplete.cargo.result==='MISSED'&&incomplete.cargo.clears===0);
check('Missed cargo gives no fabricated economic reward',incomplete.cargo.credits===21000&&incomplete.cargo.rank===0);
const META='wwg:aegis-verge:meta-v1';
const records=[
 {name:'object score and fractional unlock',value:{unlocked:2.5,best:[{toString:0,valueOf:0},4321,'75'],clears:2,bestHull:85},expect:{unlocked:1,best:[0,4321,0],clears:2,bestHull:85}},
 {name:'out of range values',value:{unlocked:4,best:[-1,12,1e20],clears:-1,bestHull:101},expect:{unlocked:1,best:[0,12,0],clears:0,bestHull:0}},
 {name:'valid neighbouring records',value:{unlocked:3,best:[100,200,300],clears:9,bestHull:100},expect:{unlocked:3,best:[100,200,300],clears:9,bestHull:100}}
];
for(const c of records){
 const r=boot('aegis-verge',{storage:{[META]:JSON.stringify(c.value)}});
 check('Aegis independent field validation: '+c.name,JSON.stringify(r.context.meta)===JSON.stringify(c.expect));
 r.byId.get('start').click();check('Aegis remains launchable: '+c.name,r.byId.get('launch').style.display==='none');
 if(c.name!=='valid neighbouring records')check('Aegis exposes repaired-record status: '+c.name,!r.byId.get('recordNotice').hidden&&r.byId.get('recordNotice').textContent.includes('repaired'));
}
const denied=boot('aegis-verge',{denyRead:true});denied.byId.get('start').click();
check('Denied browser storage does not block Aegis launch',denied.byId.get('launch').style.display==='none');
check('Denied browser storage announces session-only progress',denied.byId.get('recordNotice').textContent.includes('session only'));
const quota=boot('aegis-verge',{storage:{[META]:JSON.stringify({unlocked:2.5,best:[100,200,300]})},denyWrite:true});
check('Failed record repair write leaves valid session records',quota.context.meta.best[1]===200&&quota.context.meta.unlocked===1);
check('Failed record repair write has an explicit warning',quota.byId.get('recordNotice').textContent.includes('saving is unavailable'));
const reset=boot('aegis-verge');reset.byId.get('start').click();reset.byId.get('done').style.display='grid';reset.context.resetOperation(0);
check('Operation restart hides stale results overlay',reset.byId.get('done').style.display==='none');
check('Operation restart restores actual gameplay focus',reset.document.activeElement===reset.byId.get('c'));
const publicAegis=boot('aegis-verge',{origin:'https://worldwidegames.vercel.app/games/aegis-verge/'});
check('Served Aegis exposes no mutable testing facade',['__aegisVerge','player','engine','finish','resetOperation'].every(k=>!(k in publicAegis.context)));
publicAegis.byId.get('start').click();check('Production-origin-mode Aegis starts through actual UI handler',publicAegis.byId.get('launch').style.display==='none');
const publicCW=boot('cyber-wars',{origin:'https://worldwidegames.vercel.app/games/cyber-wars/?qa=1'});
check('Public Cyber Wars ignores URL request for QA controls',!('CWQA'in publicCW.context));
publicCW.byId.get('start').click();check('Production-origin-mode Cyber Wars starts through actual UI handler',publicCW.byId.get('launch').style.display==='none');
console.log(JSON.stringify({suite:'Reconciled Aegis F3D95 + Cyber Wars 0.64',total:checks.length,passed:checks.length,qualification:'Actual first-party runtime and physics in Node VM with modeled DOM/canvas. Not browser, graphics, controller hardware or human-play qualification.',riverSeconds:clear.run.elapsed,checks},null,2));
