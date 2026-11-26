'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let passed=0;function ok(v){assert.ok(v);passed++}const log=[];let trig=0;
const math=Object.create(Math);math.sin=(x)=>{trig++;return Math.sin(x)};math.cos=(x)=>{trig++;return Math.cos(x)};
const window={AegisFacetedMesh:require('../games/aegis-verge/faceted-mesh.js')};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../games/aegis-verge/rendering.js'),'utf8'),{window,Math:math});
const ctx={createLinearGradient:()=>({addColorStop:(...x)=>log.push(['stop',...x])}),fillRect:(...x)=>log.push(['rect',...x]),beginPath:()=>log.push(['begin']),moveTo:(...x)=>log.push(['move',...x]),lineTo:(...x)=>log.push(['line',...x]),closePath:()=>log.push(['close']),fill:()=>log.push(['fill',ctx.fillStyle])};
const e={mode:'canvas2d',ctx,resize(){},canvas:{width:800,height:600},fog:[.05,.1,.2],far:200,fov:1,fogNear:10,fogFar:100};
const gpu={mode:'webgl2',cube(){}};let original=gpu.cube;ok(window.AegisRender.install(gpu)===gpu);ok(gpu.cube===original);window.AegisRender.install(e);
function frame(eye,target){log.length=0;trig=0;e.begin(eye,target);e.cube(0,0,4,2,2,2,'#aabbcc',.3,.1);e.faceted('hull',1,0,6,2,1,3,'#ad0',.2,.2);e.cube(0,0,.2,.5,.5,.5,'#fac',.2);e.end();ok(trig===4+2*3);ok(e.calls===3);ok(e.softwareFaces>0);ok(log.filter(r=>r[0]==='move'||r[0]==='line').every(r=>r.slice(1).every(Number.isFinite)));return JSON.stringify(log)}
const eye={x:0,y:0,z:0},target={x:0,y:0,z:10};let first=frame(eye,target);ok(frame(eye,target)===first);let shifted=frame({x:2,y:1,z:-1},target);ok(shifted!==first);ok(frame(eye,target)===first);e.fog=[.2,.1,.05];ok(frame(eye,target)!==first);e.fog=[.05,.1,.2];ok(frame(eye,target)===first);e.canvas.width=400;ok(frame(eye,target)!==first);e.canvas.width=800;ok(frame(eye,target)===first);ok(e.meshStats().entries===1);ok(e.meshStats().bytes===2016);console.log(JSON.stringify({passed,failed:0}));
