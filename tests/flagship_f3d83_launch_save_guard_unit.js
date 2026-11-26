const assert=require('node:assert/strict');
const G=require('../games/aegis-verge/launch-reset-guard.js');
let n=0;function check(actual,expected){assert.equal(actual,expected);n++;}
for(const code of ['KeyR','Digit1','Digit2','Digit3'])check(G.protectedShortcut(code),true);
for(const code of ['KeyP','Space','KeyG','Digit4','',null])check(G.protectedShortcut(code),false);
for(const active of [false,null,undefined,0,'true'])check(G.mayReset(active,true),false);
for(const shown of [false,null,undefined,0,'true'])check(G.mayReset(true,shown),false);
check(G.mayReset(true,true),true);
check(Object.isFrozen(G),true);
console.log('PASS F3D83 launch guard policy '+n+'/'+n);
