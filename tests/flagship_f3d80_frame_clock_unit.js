/* Pure timing invariants. Full original-engine Chromium test proves outcomes. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const clock=require('../games/aegis-verge/frame-clock.js');
let count=0;
function check(label,actual,expect){assert.ok(Math.abs(actual-expect)<1e-9,label+' got '+actual+' expected '+expect);count++}
check('60Hz',clock.elapsed(1000+1000/60,1000),1/60);
check('30Hz',clock.elapsed(1000+1000/30,1000),1/30);
check('10Hz',clock.elapsed(1100,1000),.1);
check('5Hz',clock.elapsed(1200,1000),.2);
check('4Hz bounded',clock.elapsed(1250,1000),.25);
check('2Hz safety bound',clock.elapsed(1500,1000),.25);
check('multi-second suspended stall bounded',clock.elapsed(6000,1000),.25);
check('negative timestamp movement ignored',clock.elapsed(999,1000),0);
check('same frame no double step',clock.elapsed(1000,1000),0);
check('invalid now ignored',clock.elapsed(NaN,1000),0);
check('invalid previous ignored',clock.elapsed(1100,Infinity),0);
check('max independent of host FPS',clock.MAX_FOREGROUND_STEP,.25);
const html=fs.readFileSync('games/aegis-verge/index.html','utf8');
assert.ok(html.includes('AegisFrameClock.elapsed(n,last)'));count++;
assert.ok(html.includes('<script src="frame-clock.js"></script>'));count++;
const sw=fs.readFileSync('sw.js','utf8');
assert.ok(sw.includes('"./games/aegis-verge/frame-clock.js"'));count++;
// Integrated releases may fingerprint runtime content; retain both historical forms.
assert.ok(/const CACHE='wwg-v[0-9]+(?:-f3d[0-9]+|-[a-f0-9]{12})?'/.test(sw));count++;
console.log('F3D80 frame timing '+count+'/'+count+' assertions PASS');
