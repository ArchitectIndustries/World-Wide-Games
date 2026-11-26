'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.join(__dirname,'..','games','aegis-verge');
const html=fs.readFileSync(path.join(home,'index.html'),'utf8');
const css=fs.readFileSync(path.join(home,'compact-combat-hud.css'),'utf8');
const js=fs.readFileSync(path.join(home,'compact-combat-hud.js'),'utf8');
let passed=0;const ck=(name,val)=>{assert.ok(val,name);passed++};
const titleVersion=html.match(/<title>Aegis Verge (\d+)\.(\d+)\b/);
ck('compact cockpit remains present at version 2.58 or later',!!titleVersion&&(Number(titleVersion[1])>2||(Number(titleVersion[1])===2&&Number(titleVersion[2])>=58)));
ck('separate original CSS loaded',html.includes('<link rel="stylesheet" href="compact-combat-hud.css">'));
ck('separate controls handler loaded',html.includes('<script src="compact-combat-hud.js"></script>'));
for(const [id,target] of [['compactBriefButton','objectivePanel'],['compactToolsButton','touchActions'],['compactMenuButton','toolbar']]){
 ck(id+' present and accessible',html.includes('id="'+id+'" type="button" aria-controls="'+target+'" aria-expanded="false"'));
 ck(id+' handled',js.includes("'"+id+"'"));
}
ck('landscape scoped to coarse pointers',css.includes('@media (pointer:coarse) and (max-height:420px) and (max-width:800px)'));
ck('four primary controls retained','shield fire pulse dash'.split(' ').every(n=>html.includes('data-action="'+n+'"')));
ck('all secondary actions retained','decoy uplink cache'.split(' ').every(n=>html.includes('data-action="'+n+'"')));
ck('reflow uses minimum 44px controls',css.includes('min-width:44px;min-height:44px;height:44px'));
ck('warning no longer covers steering in compact state',css.includes('#checkpointWarning:not(:empty){top:94px'));
ck('mobile helper never changes score/HP',!/(\bscore\s*[+\-=]|\bhp\s*[+\-=]|\bplayer\s*\.)/.test(js));
ck('close button collapses without stale aria states',js.includes("item.button.setAttribute('aria-expanded',String(!!open))"));
console.log(JSON.stringify({suite:'F3D58 Compact Combat Cockpit structural gates',passed}));
