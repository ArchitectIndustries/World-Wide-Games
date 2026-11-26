'use strict';
const assert=require('node:assert/strict');
const S=require('../games/aegis-verge/score-integrity.js');
let n=0;const check=(x,label)=>{assert.ok(x,label);n++;};
for(let op=0;op<3;op++){
 check(S.eligible(true,op,op),'ordered ranked op '+op);
 check(!S.eligible(false,op,op),'practice op '+op);
 check(!S.eligible(true,op+1,op),'wrong chain '+op);
 check(!S.eligible(true,op-1,op),'incomplete chain '+op);
}
check(!S.eligible(1,0,0),'truthy coerced rank rejected');
check(!S.eligible(true,0,-1),'negative op rejected');
check(!S.eligible(true,3,3),'out of bounds op rejected');
check(!S.eligible(true,0,NaN),'invalid op rejected');
const meta={best:[777,600,300]};
for(let op=0;op<3;op++){
 const before=meta.best.slice();check(!S.record(meta,op,99999,false),'unranked score rejected '+op);
 check(meta.best.join(',')===before.join(','),'unranked preserves all best slots '+op);
}
check(!S.record(meta,0,776,true),'lower ranked score no update');
check(!S.record(meta,0,777,true),'equal ranked score no update');
check(S.record(meta,0,888,true),'higher ranked score accepted');
check(meta.best[0]===888&&meta.best[1]===600,'other slots unchanged');
for(const x of [NaN,Infinity,-1,'9000',null]){check(!S.record(meta,0,x,true),'invalid score rejected '+String(x));}
check(!S.record(meta,3,900,true),'invalid op rejected');
check(!S.record({best:null},0,900,true),'invalid best structure rejected');
check(S.record(meta,1,900.5,true),'finite fractional score rounded');
check(meta.best[1]===901,'rounding correct');
check(S.record(meta,2,1e15,true),'huge score bounded');
check(meta.best[2]===1e8,'bounded score is valid for progression store');
console.log(JSON.stringify({name:'F3D61 practice result isolation',assertions:n,status:'PASS'}));
