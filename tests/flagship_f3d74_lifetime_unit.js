'use strict';
const assert=require('node:assert/strict');
const F=require('../games/aegis-verge/projectile-lifetime.js');
const I=require('../games/aegis-verge/shot-intercept.js');
const T=require('../games/aegis-verge/tactics.js');
let n=0;function ok(name,predicate){assert.ok(predicate,name);n++}
const bolt=(life=1,x=0,vx=10)=>({x,z:0,vx,vz:0,life});
let a=bolt(0.02);ok('module frozen',Object.isFrozen(F));ok('full-frame advance',F.advance(a,.01));ok('full speed displacement',a.x===.1&&a.flightFraction===1);ok('life decremented',Math.abs(a.life-.01)<1e-8);ok('start recorded',a.prevX===0&&a.fullX===.1);
a=bolt(.002);ok('partial-frame travel',F.advance(a,.01));ok('short remaining displacement',Math.abs(a.x-.02)<1e-10);ok('full-frame endpoint available',a.fullX===.1);ok('fraction exact',Math.abs(a.flightFraction-.2)<1e-10);ok('expired at end',a.life===0);ok('advance cannot resurrect',!F.advance(a,.01));ok('post-expiry stays still',Math.abs(a.x-.02)<1e-10);
a=bolt(0);ok('zero-life cannot travel',!F.advance(a,.1)&&a.x===0);a=bolt(-1);ok('negative life cannot travel',!F.advance(a,.1)&&a.x===0);a=bolt(1);ok('zero dt rejected',!F.advance(a,0));a=bolt(1);ok('negative dt rejected',!F.advance(a,-.1));a=bolt(1);ok('nonfinite dt rejected',!F.advance(a,NaN));a=bolt(1);a.vx=Infinity;ok('invalid velocity rejected',!F.advance(a,.1));ok('null projectile rejected',!F.advance(null,.1));
function duel(shotLife,boltLife){const shot={x:2,z:0,vx:-30,vz:0,life:shotLife};const hostile={x:-2,z:0,vx:30,vz:0,life:boltLife};F.advance(shot,.1);F.advance(hostile,.1);return I.earliest({x:hostile.prevX,z:0},{x:hostile.x,z:0,fullX:hostile.fullX,fullZ:0,flightFraction:hostile.flightFraction},[shot],[],T.firstCover,1)}
ok('real same-step collision',duel(1,1)?.t>0);ok('expired short shot cannot intercept later bolt',duel(.03,1)===null);ok('expired short bolt cannot be intercepted after dying',duel(1,.03)===null);ok('both survive until real meeting',duel(.08,.08)?.t>0);ok('partial shot travel covers only its lifetime',duel(.055,1)===null);ok('near-boundary temporal intercept accepted',duel(.061,1)?.t>0);
const blocked=I.earliest({x:-2,z:0},{x:1,z:0},[{x:-1,z:0,prevX:2,prevZ:0,fullX:-1,fullZ:0,flightFraction:1,life:1,collided:true}],[],T.firstCover);
ok('already-struck cannon shot cannot intercept again',blocked===null);
const reflected=I.earliest({x:-2,z:0},{x:1,z:0},[{x:-1,z:0,prevX:2,prevZ:0,fullX:-1,fullZ:0,flightFraction:1,life:1,reflected:true}],[],T.firstCover);
ok('reflections do not farm interceptions',reflected===null);
let s={x:2,z:0,vx:-30,vz:0,life:.05},b={x:-2,z:0,vx:30,vz:0,life:1};F.advance(s,.1);F.advance(b,.1);ok('expired cannon shot in frame still records flight',s.life===0&&s.flightFraction===.5);ok('expire-before-impact is rejected despite full endpoint overlap',!I.earliest({x:b.prevX,z:0},{x:b.x,z:0,flightFraction:b.flightFraction,fullX:b.fullX,fullZ:0},[s],[],T.firstCover));
ok('original non-lifetime SI remains backwards-compatible',I.earliest({x:-2,z:0},{x:2,z:0},[{x:2,z:0,prevX:2,prevZ:0,life:1}],[],T.firstCover)!==null);
console.log('F3D74 projectile lifetime '+n+'/'+n+' passed');
