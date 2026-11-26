'use strict';
const assert=require('node:assert/strict');const CP=require('../games/aegis-verge/checkpoint.js');
let passed=0;function ok(name,f){f();passed++;console.log('PASS '+name)}
function store(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),raw:m}}
const good={op:0,relay:1,hull:82,energy:63,score:1080,recoveriesLeft:1,elapsed:73.23,damageTaken:18,clean:false};
let db=store();
ok('write exact checkpoint boundary',()=>assert(CP.save(db,good)));
ok('schema versioned',()=>assert.equal(CP.load(db,3).version,1));
ok('exact values read back',()=>assert.equal(CP.load(db,1).score,1080));
ok('blocked locked operation',()=>assert.equal(CP.load(db,0),null));
ok('reject wrong version',()=>assert.equal(CP.validate({...CP.load(db),version:10}),null));
ok('reject wave zero',()=>assert.equal(CP.validate({...CP.load(db),relay:0}),null));
ok('accept extraction checkpoint',()=>assert.equal(CP.validate({...CP.load(db),relay:3}).relay,3));
ok('reject nonfinite energy',()=>assert.equal(CP.validate({...CP.load(db),energy:Infinity}),null));
ok('reject negative hull',()=>assert.equal(CP.validate({...CP.load(db),hull:-1}),null));
ok('reject excessively high score',()=>assert.equal(CP.validate({...CP.load(db),score:2000000}),null));
ok('reject malformed object',()=>assert.equal(CP.validate([]),null));
ok('reject corrupted JSON',()=>{db.setItem(CP.KEY,'{bad');assert.equal(CP.load(db),null)});
ok('clear persisted slot',()=>{db=store();CP.save(db,good);assert(CP.clear(db));assert.equal(CP.load(db),null)});
ok('quota/security failure safe',()=>{const denied={getItem(){throw new Error('blocked')},setItem(){throw new Error('quota')},removeItem(){throw new Error('blocked')}};assert.equal(CP.save(denied,good),false);assert.equal(CP.load(denied),null);assert.equal(CP.clear(denied),false)});
ok('no ranked fields serialized',()=>{db=store();CP.save(db,{...good,rankedRun:true,chainWins:3,circuitScore:999999});assert.equal(CP.load(db).rankedRun,undefined);assert.equal(CP.load(db).circuitScore,undefined)});
console.log(JSON.stringify({passed,total:15}));
