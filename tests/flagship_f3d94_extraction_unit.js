const assert=require('node:assert/strict'), E=require('../games/aegis-verge/extraction-pad.js');
let n=0;function ok(x){assert.ok(x);n++}
for(const exit of [[0,31],[-28,24],[30,-25]]){
 const o={exit,player:{x:exit[0],z:exit[1]},relay:3,active:true,finished:false,defeated:false};
 for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2]) for(const d of [0,3.999,4,4.001,8]){
  const p={x:exit[0]+Math.sin(a)*d,z:exit[1]+Math.cos(a)*d};ok(E.inside(exit,p)===(Math.hypot(p.x-exit[0],p.z-exit[1])<4));}
 for(const change of [{active:false},{defeated:true},{relay:2}])ok(E.observe({...o,...change})===null);
 const s=E.observe(o);ok(s.inside);ok(E.label(s).includes('ARRIVED'));ok(E.announcement(s).includes('Inside'));
 const outside=E.observe({...o,player:{x:exit[0]+7,z:exit[1]}});ok(!outside.inside);ok(E.label(outside).includes('3m to edge'));
 ok(E.label(E.observe({...o,finished:true})).includes('COMPLETE'));
 for(const low of [false,true])for(const calm of [false,true]){
  const p=E.geometry(s,low,calm),count=low||calm?8:16;ok(p.length===count+10);
  for(const q of p.slice(0,count)){ok(Math.abs(Math.hypot(q.x-exit[0],q.z-exit[1])-E.RADIUS)<1e-9);ok(q.sy===.12);}
  let f=0,b=0;ok(E.render({faceted:()=>f++,cubeBatch:a=>b=a.length},s,low,calm)===p.length+1);ok(f===1&&b===p.length);
 }
}
ok(E.geometry(null).length===0);ok(E.render({},null)===0);console.log(`${n}/${n} extraction geometry and authority assertions passed`);
// The giant arena floor used to sort in front of distant above-floor objects.
// Only the authored horizontal base slab is tagged; remaining painter depth ordering stays intact.
const fs=require('node:fs'),vm=require('node:vm');let fills=[];
const ctx={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){fills.push(this.fillStyle)}};
const window={AegisFacetedMesh:require('../games/aegis-verge/faceted-mesh.js')};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../games/aegis-verge/rendering.js'),'utf8'),{window});
const e={mode:'canvas2d',ctx,resize(){},canvas:{width:800,height:600},fog:[0,0,0],far:200,fov:1,fogNear:100,fogFar:200};window.AegisRender.install(e);
function order(tag){fills=[];e.begin({x:0,y:8,z:-14},{x:0,y:0,z:30});e.cubeBatch([{x:0,y:-.4,z:0,sx:84,sy:.6,sz:84,color:'#ff0000',ground:tag}]);e.cube(0,1,28,1,2,1,'#00ff00',0,1);e.end();return fills.map(x=>x.match(/\d+/g).map(Number));}
const old=order(false),fixed=order(true);assert.ok(old.some((v,i)=>v[0]>0&&old.slice(0,i).some(w=>w[1]>0)),'Reproduces original painter occlusion order');assert.ok(fixed[0][0]>0&&fixed.slice(1).every(v=>v[0]===0),'Explicit floor layer draws before above-ground target');console.log('2/2 floor painter-order assertions passed');
