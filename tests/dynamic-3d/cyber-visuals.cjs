'use strict';
const assert=require('node:assert/strict');
const Renderer=require('../../games/cyber-wars/viridia-renderer.js');
const World=require('../../games/cyber-wars/viridia-world.js');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
function equal(a,b,message){assert.deepEqual(a,b,message);checks++;}
for(const shape of ['plane','box','column','trunk','spire','leaf','arch','orb','rock']){
 const g=Renderer.geometry(shape);
 check(g.vertices.length>=4&&g.faces.length>0,shape+' has actual mesh geometry');
 check(g.triangles.length%18===0&&g.triangles.length>=18,shape+' has complete normal-bearing triangles');
 check([...g.triangles].every(Number.isFinite),shape+' has finite vertices and normals');
 for(const f of g.faces){
  check(Math.abs(Math.hypot(...f.n)-1)<1e-7,shape+' normal is normalized');
  check(f.ix.every(i=>i>=0&&i<g.vertices.length),shape+' topology is in bounds');
 }
}
const clipped=Renderer.clipNear([{x:-1,y:0,z:.05},{x:1,y:0,z:1},{x:0,y:1,z:1}]);
equal(clipped.length,4,'Near-plane crossing produces a clipped quad');
check(clipped.every(p=>p.z>=.18&&[p.x,p.y,p.z].every(Number.isFinite)),'Clipped vertices remain finite and in front of the near plane');
equal(Renderer.clipNear([{x:0,y:0,z:-1},{x:1,y:0,z:0},{x:0,y:1,z:.1}]),[],'A completely hidden face is rejected');
const m=Renderer.matrix(4,5,6,2,3,4,Math.PI/2);
check(Math.abs(m[12]-4)<1e-8&&Math.abs(m[13]-5)<1e-8&&Math.abs(m[14]-6)<1e-8,'Mesh transforms preserve the specified world translation');
check(Math.abs(Math.hypot(m[0],m[1],m[2])-2)<1e-8&&Math.abs(Math.hypot(m[4],m[5],m[6])-3)<1e-8,'Rotation preserves the intended nonuniform scale');
for(const rain of [0,.5,1])for(let i=0;i<30;i++){
 const p=World.waterSample(i-15,4+i%10,i*3,rain,false);
 check(p.height>.02&&p.height<.08,'Water remains below the original bridge and raft');
}
equal(World.waterSample(20,8,1,1,true),World.waterSample(20,8,500,1,true),'Reduced motion freezes water movement');
check(World.waterSample(20,8,1,0).height!==World.waterSample(20,8,2,0).height,'Water responds to the existing simulation clock');
check(World.atmosphere(.24,0).day>World.atmosphere(.74,0).day,'Sky lighting distinguishes day and night');
check(World.atmosphere(.24,1).fogFar<World.atmosphere(.24,0).fogFar,'Actual rain reduces visual distance');
const sourceObjects=[
 {x:40,y:3,z:40,sx:.9,sy:6,sz:.9,color:'#3d4930',detail:'landmark'},
 {x:39,y:.31,z:42,sx:.15,sy:.62,sz:.15,color:'#366b43',detail:'understory',yaw:0},
 {x:0,y:-.55,z:0,sx:132,sy:1,sz:132,color:'#173126',detail:'landmark'}
],solids=[{x:40,z:40,r:.46,kind:'jungle-trunk'},{x:-8.5,z:16,r:.9,kind:'gateway-post'}],sourceJSON=JSON.stringify({sourceObjects,solids});
for(const o of [...sourceObjects,...solids])Object.freeze(o);
const district=World.build({seed:65,objects:sourceObjects,solids,interactables:[]});
equal(JSON.stringify({sourceObjects,solids}),sourceJSON,'Building presentation never mutates collision or source scenery');
equal(district.inspect(),World.build({seed:65,objects:sourceObjects,solids}).inspect(),'A world code deterministically reproduces its presentation');
for(const o of district.inspect().meshes){
 check([o.x,o.y,o.z,o.sx,o.sy,o.sz].every(Number.isFinite),'District transforms are finite');
 check(o.sx>0&&o.sy>0&&o.sz>0,'District dimensions are positive');
 if(o.support){
  const g=Renderer.getGeometry(o.shape);
  check(g.vertices.every(p=>Math.hypot(p[0]*o.sx,p[2]*o.sz)<=o.support.r+1e-7),'A solid visual support remains inside its existing collision circle');
 }
 if(o.detail==='horizon'){
  const vertices=Renderer.getGeometry(o.shape).vertices;
  check(vertices.every(p=>Math.abs(o.x+p[0]*o.sx)>=66||Math.abs(o.z+p[2]*o.sz)>=66),'Distant mountains never obstruct the playable district');
 }
}
check(district.inspect().water.every(o=>o.z-o.sz*.5>3.9&&o.z+o.sz*.5<14.1),'River mesh matches the existing water boundaries');
check(district.inspect().water.every(o=>o.x+o.sx*.5<-8.9||o.x-o.sx*.5>8.9),'The original dry bridge is kept clear of water geometry');
// Validate the renderer's public state contract with a GL command recorder.
// This tests VAO/uniform restoration, batching and disposal, not hardware shaders.
function fakeGL(){
 let serial=0;const deleted=[],draws=[],uniforms={},buffers=new Map(),g={deleted,draws,uniforms,buffers,bound:null};
 for(const k of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','STATIC_DRAW','DYNAMIC_DRAW','FLOAT','TRIANGLES','DEPTH_TEST','CULL_FACE'])g[k]=k;
 for(const kind of ['Program','Shader','VertexArray','Buffer']){g['create'+kind]=()=>({kind,id:++serial});g['delete'+kind]=o=>deleted.push(o);}
 for(const k of ['shaderSource','compileShader','attachShader','linkProgram','enableVertexAttribArray','vertexAttribPointer','vertexAttribDivisor','disable','enable','depthMask','uniformMatrix4fv','uniform3f'])g[k]=()=>{};
 g.bindBuffer=(target,buffer)=>{g.arrayBuffer=buffer;};g.bufferData=(target,data)=>buffers.set(g.arrayBuffer,typeof data==='number'?data:data.byteLength);
 g.getShaderParameter=g.getProgramParameter=()=>true;g.getUniformLocation=(p,k)=>k;g.bindVertexArray=v=>{g.bound=v;};g.useProgram=p=>{g.currentProgram=p;};
 g.uniform1i=g.uniform1f=(k,v)=>{uniforms[k]=v;};
 g.drawArrays=(mode,start,count)=>draws.push({mode,count,instances:1,vao:g.bound});
 g.drawArraysInstanced=(mode,start,count,n)=>draws.push({mode,count,instances:n,vao:g.bound});
 return g;
}
const gl=fakeGL(),engine={gl,mode:'webgl2',program:{old:true},vao:{cube:true},instanceBuffer:{legacyInstances:true},instanceCapacity:0,_loc:{},canvas:{width:800,height:600},fov:1,far:175,fog:[.3,.4,.3],sun:{x:.3,y:-1,z:.2},batchEnabled:true,calls:0,batchCalls:0,instancesRendered:0,begin(){gl.bindVertexArray(this.vao);gl.useProgram(this.program);},cube(){check(gl.bound===this.vao,'A legacy cube retains its VAO after custom meshes');check(gl.buffers.get(this.instanceBuffer)>=80,'A driver can fetch enabled instance attributes during ordinary cube draws');this.calls++;},cubeBatch(){check(gl.bound===this.vao,'Legacy batching retains its VAO after custom meshes');},dispose(){this.disposed=true;}};
Renderer.install(engine);engine.viridiaAtmosphere({time:42,rain:.7,day:.8});engine.begin({x:0,y:2,z:0},{x:0,y:2,z:1});
check(gl.buffers.get(engine.instanceBuffer)>=80,'Legacy cube attributes have a backing record even before any instanced draw');
engine.viridiaMesh('arch',0,5,10,10,5,8,'#aabbcc');equal(gl.bound,engine.vao,'Custom single meshes restore the shared cube VAO');engine.cube(0,0,0,1,1,1,'#fff');equal(gl.uniforms.uSurface,0,'Legacy cubes do not inherit water or foliage material state');
engine.viridiaBatch([{shape:'leaf',x:0,y:5,z:10,sx:3,sy:1,sz:4,color:'#668855',surface:1},{shape:'leaf',x:4,y:5,z:10,sx:3,sy:1,sz:4,color:'#668855',surface:1}]);
check(gl.draws.some(d=>d.instances===2),'Compatible local meshes share an instanced draw');equal(gl.uniforms.uInstanced,0,'Custom batching restores noninstanced mode');equal(gl.bound,engine.vao,'Custom batching restores the cube VAO');
engine.batchEnabled=false;
engine.viridiaBatch([{shape:'orb',x:0,y:2,z:8,sx:1,sy:1,sz:1,color:'#88aa77',surface:1}]);
equal(gl.draws.at(-1).instances,1,'A driver with batching disabled uses ordinary custom mesh draws');
engine.cube(0,0,0,1,1,1,'#fff');equal(engine.instanceCapacity,0,'Inert initial storage does not replace the shared engine capacity/reallocation contract');
engine.dispose();check(engine.disposed&&gl.deleted.filter(x=>x?.kind==='Buffer').length>=4,'Local GPU resources are released with the parent engine');
for(const failAt of [1,3]){
 const g=fakeGL(),program={original:true},begin=()=>{},e={gl:g,program,instanceBuffer:{legacyInstances:true},instanceCapacity:0,begin,cube(){},cubeBatch(){},dispose(){}};let compiled=0;
 g.getShaderParameter=()=>++compiled!==failAt;g.getShaderInfoLog=()=> 'fixture shader failure';
 Renderer.install(e);
 equal(e.program,program,'A material or sky shader failure preserves the original engine program');
 equal(e.begin,begin,'A shader failure preserves the original frame renderer');
 check(!e.viridiaMesh&&e.viridiaStats().fallbackReason==='fixture shader failure','A failed local shader leaves the legacy world path available and exposes a reason');
 check(!g.deleted.includes(program),'Shader cleanup never deletes the preserved original program');
 check(g.buffers.get(e.instanceBuffer)>=80,'Shader rejection still leaves backing storage for legacy cube instance attributes');
}
// Execute the actual game scripts with modeled DOM/Canvas to check render purity.
const game=boot('cyber-wars');game.byId.get('start').click();const qa=game.context.CWQA;
const snapshot=()=>JSON.stringify(qa.snapshot()),initial=snapshot(),collision=JSON.stringify(qa.solidMap()),writes=game.writes.length;
for(const t of [0,30,60,100]){qa.setWeatherTime(t);for(const phase of [.24,.52,.75]){qa.setVisualPhase(phase);qa.drawScene();}}
equal(snapshot(),initial,'All day/night/weather draws preserve actual player, NPC, quest, economy and checkpoint state');
equal(JSON.stringify(qa.solidMap()),collision,'Rendering never adds or changes collision');
equal(game.writes.length,writes,'Rendering never writes a save');
const metrics=qa.graphics();
check(metrics.meshes.softwareFaces>100,'The fallback executes visible polygon geometry');
check(metrics.meshes.softwareFaces<18000,'Fallback scene stays inside its bounded face budget');
equal(metrics.viridia.trees,86,'All existing procedural trees receive the new visual model');
equal(qa.snapshot().state.credits,21000,'Rendering preserves the exact starting balance');
equal(qa.save(),false,'Rendering does not bypass the owned-home checkpoint gate');
console.log(JSON.stringify({suite:'Cyber Wars Viridia visual geometry and state isolation',checks,passed:checks,modeledGameRenderer:metrics.renderer,visibleSoftwareFaces:metrics.meshes.softwareFaces,hardwareBrowserTest:false}));
