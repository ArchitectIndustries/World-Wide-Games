'use strict';
const assert=require('node:assert/strict');const c=require('../games/aegis-verge/frame-clock.js');let n=0;
function check(name,fn){fn();n++;console.log('PASS',name)}
for(const [dt,expected] of [[1/60,1],[.25,15],[.2,12],[.033,2],[5,15],[0,0],[-1,0],[NaN,0],[Infinity,0]])check('bounded '+dt,()=>{let a=[];c.advance(dt,()=>true,x=>a.push(x));assert.equal(a.length,expected);assert.ok(a.every(x=>x>0&&x<=1/60));if(Number.isFinite(dt))assert.ok(Math.abs(a.reduce((x,y)=>x+y,0)-Math.min(.25,Math.max(0,dt)))<1e-8)});
for(const state of ['finished','defeated','paused','suspended','inactive'])check(state+' stops mid-frame',()=>{let steps=0,live=true;c.advance(.25,()=>live,()=>{steps++;live=false});assert.equal(steps,1)});
check('already terminal',()=>{let steps=0;c.advance(.25,()=>false,()=>steps++);assert.equal(steps,0)});
check('new frame resumes without old debt',()=>{let n=0;c.advance(.25,()=>n===0,()=>n++);c.advance(1/60,()=>true,()=>n++);assert.equal(n,2)});
console.log(n+' assertions passed');
