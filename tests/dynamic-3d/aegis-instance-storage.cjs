'use strict';
// Exercise the actual shared Engine plus the local Aegis adapter against a
// WebGL storage/VAO contract model. This is not a GPU or browser execution test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const M=require('../../games/aegis-verge/environment-mesh.js');
const engineSource=fs.readFileSync(path.join(__dirname,'../../assets/wwg-webgl.js'),'utf8');
let passed=0;const names=[];const check=(name,test)=>{test();passed++;names.push(name);};
function fixture(){
 const buffers=new Map(),vaos=new Map(),driver={rejectShader:false,draws:0},g={};let buffer=null,vao=null,serial=0;
 for(const name of['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','STATIC_DRAW','DYNAMIC_DRAW','FLOAT','TRIANGLES','BLEND','SRC_ALPHA','ONE_MINUS_SRC_ALPHA','DEPTH_TEST','CULL_FACE','BACK','COLOR_BUFFER_BIT','DEPTH_BUFFER_BIT'])g[name]=++serial;
 g.createBuffer=()=>{const b={id:++serial};buffers.set(b,0);return b;};
 g.bindBuffer=(_,b)=>{buffer=b;};
 g.bufferData=(_,data)=>{assert(buffer,'a buffer must be bound');buffers.set(buffer,typeof data==='number'?data:data.byteLength);};
 g.bufferSubData=(_,offset,data)=>assert(offset+data.byteLength<=buffers.get(buffer),'subdata fits its allocated instance buffer');
 g.createVertexArray=()=>{const a={id:++serial};vaos.set(a,new Map());return a;};
 g.bindVertexArray=a=>{vao=a;};
 const attribute=i=>{const entries=vaos.get(vao);assert(entries,'a VAO must be bound');if(!entries.has(i))entries.set(i,{enabled:false,divisor:0});return entries.get(i);};
 g.enableVertexAttribArray=i=>{attribute(i).enabled=true;};
 g.vertexAttribPointer=(i,size,type,normalized,stride,offset)=>Object.assign(attribute(i),{buffer,size,stride:stride||size*4,offset});
 g.vertexAttribDivisor=(i,divisor)=>{attribute(i).divisor=divisor;};
 function draw(first,count,instances){
  assert(vaos.has(vao),'draw uses a valid VAO');
  for(const a of vaos.get(vao).values())if(a.enabled){
   const records=a.divisor?Math.ceil(instances/a.divisor):first+count;
   const needed=a.offset+(records-1)*a.stride+a.size*4;
   assert((buffers.get(a.buffer)||0)>=needed,'enabled vertex attribute has insufficient backing storage');
  }
  driver.draws++;
 }
 g.drawArrays=(_,first,count)=>draw(first,count,1);
 g.drawArraysInstanced=(_,first,count,instances)=>draw(first,count,instances);
 for(const name of['createShader','createProgram'])g[name]=()=>({id:++serial});
 for(const name of['shaderSource','compileShader','attachShader','linkProgram','deleteShader','deleteProgram','useProgram','uniformMatrix4fv','uniform3f','uniform3fv','uniform1f','uniform1i','uniform4fv','enable','disable','cullFace','clearColor','clear','viewport','blendFunc','depthMask'])g[name]=()=>{};
 g.deleteBuffer=b=>buffers.delete(b);g.deleteVertexArray=a=>vaos.delete(a);
 g.getShaderParameter=()=>!driver.rejectShader;g.getShaderInfoLog=()=> 'modeled optional shader rejection';g.getProgramParameter=()=>true;g.getUniformLocation=(_,name)=>name;
 g.getExtension=()=>({UNMASKED_RENDERER_WEBGL:'driver'});g.getParameter=()=> 'SwiftShader contract fixture';
 const canvas={width:0,height:0,clientWidth:640,clientHeight:400,getContext:()=>g,setAttribute(){}};
 const context=vm.createContext({window:{},devicePixelRatio:1,performance:{now:()=>1000},Float32Array,Math});vm.runInContext(engineSource,context);
 const engine=new context.window.WWG3D.Engine(canvas),eye={x:0,y:8,z:-12},target={x:0,y:0,z:0};
 return{engine,driver,buffers,begin:()=>engine.begin(eye,target)};
}
if(require.main===module){for(const reject of[false,true]){
 const f=fixture(),e=f.engine,original=e.program,label=reject?'optional shader rejected':'enhanced shader active';
 check(`${label}: actual shared software-driver path disables batching`,()=>assert.equal(e.batchEnabled,false));
 check(`${label}: fixture reproduces the original enabled-array storage failure`,()=>{f.begin();assert.throws(()=>e.cube(0,1,0,2,2,2,'#667788'),/insufficient backing storage/);});
 f.driver.rejectShader=reject;M.install(e);
 check(`${label}: local adapter allocates exactly one inert base instance record`,()=>{assert.equal(f.buffers.get(e.instanceBuffer),80);assert.equal(e.instanceCapacity,0);assert.equal(e.instanceData,null);});
 check(`${label}: optional shader state is accurately retained`,()=>{assert.equal(e.environmentStats().enhanced,!reject);if(reject)assert.equal(e.program,original);else assert.notEqual(e.program,original);});
 check(`${label}: real shared cube and fallback batch now draw`,()=>{
  f.begin();const before=f.driver.draws;e.cube(0,1,0,2,2,2,'#667788');e.cubeBatch([{x:2,y:1,z:0,sx:2,sy:2,sz:2,color:'#667788'}]);assert.equal(f.driver.draws,before+2);
 });
 check(`${label}: later hardware-style instancing still reallocates normally`,()=>{
  e.batchEnabled=true;e.cubeBatch([{x:0,y:1,z:0,sx:2,sy:2,sz:2,color:'#667788'},{x:3,y:1,z:0,sx:2,sy:2,sz:2,color:'#8899aa'}]);assert.equal(e.instanceCapacity,2);assert.equal(e.instanceData.length,40);assert.equal(f.buffers.get(e.instanceBuffer),160);assert.equal(e.batchCalls,1);
 });
 check(`${label}: custom mesh restores the fully backed original VAO`,()=>{e.mesh(M.bevel('storage-contract',1,1,1),{},{color:'#667788'});e.cube(0,1,0,2,2,2,'#667788');});
}
console.log(JSON.stringify({passed,total:passed,scope:'Actual shared Engine and Aegis adapter in a modeled WebGL VAO/storage driver; no GPU/browser claim.',checks:names},null,2));
}
module.exports={fixture};
