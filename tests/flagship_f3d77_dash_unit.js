'use strict';
const assert=require('node:assert/strict');
const D=require('../games/aegis-verge/dash-intercept.js');
const CB=require('../games/aegis-verge/counterplay.js');
const CONTACT=require('../games/aegis-verge/body-contact.js');
const types={lancer:{size:1.7}};
let n=0;function ok(label,c){assert.ok(c,label);n++}
const hostile=()=>({x:0,z:3,type:'lancer',idx:0,hp:3,state:'windup',windup:.5,cool:0});
const e=hostile(),s=D.create();ok('immutable module',Object.isFrozen(D));ok('idle',!s.armed&&s.flash===0&&s.count===0);
ok('cannot interrupt without dash',!D.hit(s,{hit:true,obstacle:e},[e],CB.interrupt));ok('arm dash',D.arm(s));ok('reject no contact',!D.hit(s,{hit:false,obstacle:e},[e],CB.interrupt));
ok('reject proxy not in enemy registry',!D.hit(s,{hit:true,obstacle:{...e}},[e],CB.interrupt));ok('reject no registry',!D.hit(s,{hit:true,obstacle:e},null,CB.interrupt));
ok('reject no interrupter',!D.hit(s,{hit:true,obstacle:e},[e],null));ok('reject dead target',!D.hit(s,{hit:true,obstacle:{...e,dead:true}},[{...e,dead:true}],CB.interrupt));
const target=hostile(),people=[target];const actor={x:0,z:0,hull:100};const from={x:0,z:0};actor.z=5;
const physical=CONTACT.clip(actor,from,people,CONTACT.PLAYER_RADIUS,[],()=>true,types);
ok('authoritative chassis hit',physical.hit&&physical.obstacle===target);ok('stops before hostile',actor.z<target.z);ok('physical dash break',D.hit(s,physical,people,CB.interrupt));ok('actually staggered',target.state==='stagger'&&target.windup===0);ok('countershot 2 damage',CB.shotDamage(target)===2);ok('one per dash',!D.hit(s,physical,people,CB.interrupt));ok('count one',s.count===1);
let draws=[];ok('8 visible 3D marks',D.render({cube:(...args)=>draws.push(args)},s)===8&&draws.length===8);ok('teal original mark',draws.every(x=>x[6]==='#5eead4'));ok('4 low tier',D.render({cube:()=>{}},s,true)===4);ok('4 reduced motion',D.render({cube:()=>{}},s,false,true)===4);
D.tick(s,.2);ok('tick decays',s.flash<D.FLASH&&s.flash>0);const x=s.flash;D.tick(s,0);ok('pause freezes',s.flash===x);D.tick(s,9);ok('expires',s.flash===0&&s.target===null);ok('inactive render zero',D.render({cube:()=>{}},s)===0);
D.arm(s);target.state='seek';ok('normal enemy has no free stagger',!D.hit(s,{hit:true,obstacle:target},people,CB.interrupt));target.state='windup';target.hp=0;ok('zero hp cannot stagger',!D.hit(s,{hit:true,obstacle:target},people,CB.interrupt));
D.reset(s);ok('reset all transient effect state',!s.armed&&s.flash===0&&s.count===0);ok('handles missing scene',D.render(null,s)===0);ok('negative dt ignored',D.tick(s,-1)===undefined);console.log(`F3D77 dash-break assertions ${n}/${n} passed`);
