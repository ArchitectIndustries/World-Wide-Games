'use strict';
// Release comparison against the published 0.64 game. The DOM and graphics are
// modeled; this is a state/checkpoint regression, not a browser playthrough.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..'),baseline='53a569bf4b8493e666298d4c702e427e2e14260d';
const index=path.join(root,'games/cyber-wars/index.html'),harness=path.join(root,'tests/recovery-specialist/runtime-harness.cjs');
const baselineHTML=process.env.CW_BASELINE_HTML?fs.readFileSync(process.env.CW_BASELINE_HTML,'utf8'):execFileSync('git',['show',baseline+':games/cyber-wars/index.html'],{cwd:root,encoding:'utf8',maxBuffer:2*1024*1024});
const localRequire=createRequire(harness);
function variant(html){
 const fileSystem={...fs,readFileSync:(file,...args)=>path.resolve(file)===index?html:fs.readFileSync(file,...args)};
 const box={module:{exports:{}},exports:{},require:name=>name==='node:fs'?fileSystem:localRequire(name),__dirname:path.dirname(harness),__filename:harness,console,URL,URLSearchParams,TextEncoder,TextDecoder};
 vm.runInNewContext(fs.readFileSync(harness,'utf8'),box,{filename:harness});
 const game=box.module.exports.boot('cyber-wars',{transformScript:code=>'Date.now=()=>1795651200000;\n'+code});
 game.byId.get('start').click();return game;
}
const old=variant(baselineHTML),current=variant(fs.readFileSync(index,'utf8')),cases=[];
const snap=g=>{const s=g.context.CWQA.snapshot();delete s.state.startedAt;return JSON.stringify(s);};
function compare(name,action){
 if(action){action(old.context.CWQA,old);action(current.context.CWQA,current);}
 assert.equal(snap(current),snap(old),name+': complete exposed gameplay state');
 assert.equal(JSON.stringify(current.context.CWQA.solidMap()),JSON.stringify(old.context.CWQA.solidMap()),name+': actual collision circles');
 const s=current.context.CWQA.snapshot().state;cases.push({name,credits:s.credits,rank:s.pilotRank,mission:s.mission});
}
compare('initial');
compare('walking',qa=>qa.stepWalk(1.25,-.60));
compare('weather and night drawing',qa=>{qa.setWeatherTime(45);qa.setVisualPhase(.74);qa.drawScene();});
compare('manual and salvage mission',qa=>qa.completeInitiation());
compare('restored obelisks',qa=>qa.restoreAllObelisks());
compare('warden defeated',qa=>qa.defeatBoss());
compare('home purchase',qa=>qa.buyHome());
compare('owned-home checkpoint',qa=>assert.equal(qa.save(),true));
assert.equal(JSON.stringify([...current.storage]),JSON.stringify([...old.storage]),'Serialized checkpoint keys and bytes remain identical');
console.log(JSON.stringify({suite:'Cyber Wars 0.64 to 0.65 behavior equivalence',baseline,pairedStateCases:cases,sourceGeometryAndStateEqual:true,checkpointBytesEqual:true,browser:false}));
