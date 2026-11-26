/* First-party deterministic focus-interruption state and loss/resume gating. */
'use strict';
const assert=require('node:assert/strict'),G=require('../games/aegis-verge/focus-guard.js');
let n=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);n++;};
const s=G.create();eq(G.required(s),false,'new operation does not start paused');
eq(G.interrupt(s,false),false,'nonplaying state does not request resume');eq(G.required(s),false,'prelaunch unaffected');
eq(G.interrupt(s,true),true,'active interrupted');eq(G.required(s),true,'requires explicit resume');
eq(G.interrupt(s,true),true,'repeated interruption idempotent');eq(G.required(s),true,'repeated interruption remains paused');
eq(G.interrupt(s,false),false,'manual pause alone never marks interrupt');eq(G.required(s),true,'manual pause does not clear prior interlock');
eq(G.acknowledge(s),true,'explicit acknowledge releases gate');eq(G.required(s),false,'gate cleared');
eq(G.acknowledge(s),false,'no fake repeated acknowledgements');eq(G.required(null),false,'null is safe read');eq(G.interrupt(null,true),false,'null cannot interrupt');eq(G.acknowledge(null),false,'null cannot acknowledge');
for(let i=0;i<15;i++){const x=G.create();eq(G.interrupt(x,true),true,'multiple independent runs');eq(G.acknowledge(x),true,'independent clear');eq(G.required(x),false,'independent reset');}
const y=G.create();G.interrupt(y,true);const z=G.create();eq(G.required(z),false,'new run cannot inherit prior gate');
console.log(JSON.stringify({suite:'F3D15 original focus guard state',passed:n,total:n}));
