'use strict';
// Reuse the release's modeled driver against the actual shared Engine and CW
// adapter. This validates VAO/buffer contracts, not a real graphics driver.
const assert=require('node:assert/strict');
const {fixture}=require('./aegis-instance-storage.cjs');
const Renderer=require('../../games/cyber-wars/viridia-renderer.js');
let passed=0;const checks=[];
function check(name,action){action();passed++;checks.push(name);}
for(const reject of [false,true]){
 const f=fixture(),e=f.engine,original=e.program,label=reject?'local shader rejected':'Viridia shader active';
 check(label+': reproduce the inherited ordinary-cube storage failure',()=>{
  assert.equal(e.batchEnabled,false);f.begin();assert.throws(()=>e.cube(0,1,0,2,2,2,'#667788'),/insufficient backing storage/);
 });
 f.driver.rejectShader=reject;Renderer.install(e);
 check(label+': initialize base storage without changing shared capacity',()=>{
  assert.equal(f.buffers.get(e.instanceBuffer),80);assert.equal(e.instanceCapacity,0);assert.equal(e.instanceData,null);
 });
 check(label+': shader success or fallback is accurately exposed',()=>{
  if(reject){assert.equal(e.program,original);assert.equal(e.viridiaMesh,undefined);assert.match(e.viridiaStats().fallbackReason,/shader rejection/);}
  else{assert.notEqual(e.program,original);assert.equal(typeof e.viridiaMesh,'function');assert.equal(e.viridiaStats().fallbackReason,null);}
 });
 check(label+': draw the real shared cube and unbatched scenery',()=>{
  f.begin();const before=f.driver.draws;e.cube(0,1,0,2,2,2,'#667788');e.cubeBatch([{x:2,y:1,z:0,sx:2,sy:2,sz:2,color:'#667788'}]);assert.equal(f.driver.draws,before+2);
 });
 if(!reject)check(label+': custom unbatched geometry restores valid cube attributes',()=>{
  const before=f.driver.draws;e.viridiaBatch([{shape:'orb',x:0,y:2,z:4,sx:2,sy:2,sz:2,color:'#88aa77',surface:1}]);e.cube(0,1,0,1,1,1,'#abc');assert.equal(f.driver.draws,before+2);
 });
 check(label+': later shared instancing reallocates normally',()=>{
  e.batchEnabled=true;e.cubeBatch([{x:0,y:1,z:0,sx:2,sy:2,sz:2,color:'#667788'},{x:3,y:1,z:0,sx:2,sy:2,sz:2,color:'#8899aa'}]);
  assert.equal(e.instanceCapacity,2);assert.equal(e.instanceData.length,40);assert.equal(f.buffers.get(e.instanceBuffer),160);
 });
 if(!reject)check(label+': local instancing and single meshes preserve the base VAO',()=>{
  e.viridiaBatch([{shape:'leaf',x:0,y:3,z:8,sx:2,sy:1,sz:2,color:'#789a65'},{shape:'leaf',x:3,y:3,z:8,sx:2,sy:1,sz:2,color:'#789a65'}]);
  e.viridiaMesh('arch',0,4,12,8,4,4,'#b9a780');e.cube(0,1,0,2,2,2,'#abc');
 });
 check(label+': disposal releases both original and local buffers',()=>{e.dispose();assert.equal(f.buffers.size,0);});
}
console.log(JSON.stringify({suite:'Cyber Wars actual Engine instance storage contract',passed,total:passed,checks,hardwareBrowserTest:false}));
