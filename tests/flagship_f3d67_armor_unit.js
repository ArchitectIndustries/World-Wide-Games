'use strict';
const assert=require('node:assert/strict');
const A=require('../games/aegis-verge/enemy-armor-wear.js');
const E=require('../games/aegis-verge/enemy-silhouettes.js');
let n=0;function ok(s,v){assert.ok(v,s);n++}
const q=(type,hp,max=8,quality='full')=>E.parts({type,hp,max,size:2.2,idx:1,flash:0,yaw:0,x:0,z:0,state:'seek'},quality,3.1,false);
ok('zero hp no false wear',A.stage({hp:0,max:8})===0);
ok('dead enemy none',A.stage({hp:1,max:8,dead:true})===0);
ok('invalid maximum rejected',A.stage({hp:1,max:0})===0);
ok('missing enemy rejected',A.stage(null)===0);
ok('full hp intact',A.stage({hp:8,max:8})===0);
ok('75% first wear',A.stage({hp:6,max:8})===1);
ok('50% second wear',A.stage({hp:4,max:8})===2);
ok('25% maximum wear',A.stage({hp:2,max:8})===3);
ok('slight nick above 75% remains intact',A.stage({hp:7,max:8})===0);
ok('overfull never damages cosmetically',A.stage({hp:100,max:8})===0);
ok('API frozen',Object.isFrozen(A)&&Object.isFrozen(A.PARTS));
ok('module handles absent geometry',A.decorate(null,{hp:1,max:8})===null);
for(const type of Object.keys(A.PARTS)){
 const orig=q(type,8),scar=q(type,6),open=q(type,4),critical=q(type,2),lite=q(type,2,8,'lite');
 ok(type+' no extra cosmetics at full health',!orig.some(p=>p.name==='scored-armor'));
 ok(type+' first scar visible on real damage',scar.some(p=>p.name==='scored-armor'));
 ok(type+' no armor loss before second stage',scar.filter(p=>p.name===A.PARTS[type][0]&&p.r>0).length===orig.filter(p=>p.name===A.PARTS[type][0]&&p.r>0).length);
 ok(type+' right panel removed at second stage',open.filter(p=>p.name===A.PARTS[type][0]&&p.r>0).length===Math.max(0,orig.filter(p=>p.name===A.PARTS[type][0]&&p.r>0).length-1));
 ok(type+' exposed conduit at stage two',open.some(p=>p.name==='exposed-conduit'));
 ok(type+' staged critical reactor breach',critical.some(p=>p.name==='reactor-breach'));
 ok(type+' low tier keeps visible critical reactor',lite.some(p=>p.name==='reactor-breach'));
 ok(type+' low tier omits extra fractured spine',!lite.some(p=>p.name==='fractured-spine'));
 ok(type+' visual fidelity has valid finite geometry',critical.every(p=>['r','y','f','w','h','d','em'].every(k=>Number.isFinite(p[k]))&&p.w>0&&p.h>0&&p.d>0));
 ok(type+' critical keeps core/keel (no false collision disappearance)',critical.some(p=>p.name==='keel')&&critical.some(p=>p.name==='core'));
 ok(type+' reduced motion still shows actual damage',(()=>{let a=E.parts({type,hp:2,max:8,size:2.2},'full',13,true);return a.some(p=>p.name==='reactor-breach')})());
 ok(type+' bounded geometry additions',critical.length-orig.length<=5);
 ok(type+' HP transition changes geometry',JSON.stringify(orig)!==JSON.stringify(open));
 ok(type+' render actual model uses geometry',(()=>{const enemy={type,hp:4,max:8,size:2.2,x:0,z:0,yaw:0},commands=[];E.render({cube(...args){commands.push(args)}},enemy,'full',2,false);return commands.length===q(type,4).length})());
}
console.log(`F3D67 enemy battle-wear unit ${n}/${n} passed`);
