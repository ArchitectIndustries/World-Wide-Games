'use strict';
// Bounded geometry / renderer-contract / actual-game regressions.
// Node VM and a modeled canvas; no claim of browser/GPU or device validation.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const M=require('../../games/aegis-verge/environment-mesh.js');
const W=require('../../games/aegis-verge/worldscape.js');
const ES=require('../../games/aegis-verge/enemy-silhouettes.js');
const {boot}=require('../recovery-specialist/runtime-harness.cjs');
let passed=0;const names=[];
function check(name,test){test();passed++;names.push(name);}
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fingerprint=[];
for(let op=0;op<3;op++){
 const full=W.makeScene(op),low=W.makeScene(op,true);
 check(`operation ${op+1}: authored scene is cached`,()=>assert.equal(full,W.makeScene(op)));
 check(`operation ${op+1}: rich silhouette within bounded GPU budget`,()=>assert(full.triangleCount>10000&&full.triangleCount<30000&&full.vertexBytes<2100000));
 check(`operation ${op+1}: fallback geometry is genuinely reduced`,()=>assert(low.triangleCount<4500&&low.triangleCount<full.triangleCount*.25));
 check(`operation ${op+1}: static world is batched into eight materials`,()=>assert.equal(full.meshes.length,8));
 for(const scene of[full,low]){
  check(`operation ${op+1}/${scene.low}: finite complete mesh buffers`,()=>assert(scene.meshes.every(q=>q.mesh.triangles.length%18===0&&q.mesh.triangles.every(Number.isFinite)&&q.mesh.faces.every(f=>Math.abs(Math.hypot(...f.n)-1)<1e-6))));
  check(`operation ${op+1}/${scene.low}: no decorative obstacle occupies a valid driving path`,()=>{
   for(const part of scene.parts)if(part.tag==='perimeter')for(const v of part.mesh.vertices){const q=M.point(v,part.pose);assert(!(q[1]>.001&&Math.abs(q[0])<38&&Math.abs(q[2])<38),JSON.stringify(q));}
  });
  check(`operation ${op+1}/${scene.low}: tall districts clear the tactical camera envelope`,()=>{
   for(const part of scene.parts)if(part.tag==='perimeter')for(const v of part.mesh.vertices){const q=M.point(v,part.pose);if(q[1]>4)assert(Math.hypot(Math.max(0,Math.abs(q[0])-36.85),Math.max(0,Math.abs(q[2])-36.85))>=15.4,JSON.stringify(q));}
  });
  check(`operation ${op+1}/${scene.low}: relief retains cliffs and distant ridges outside the arena`,()=>{
   const mesh=W.terrain(op,scene.low);assert(Math.min(...mesh.vertices.map(v=>v[1]))<-10);assert(Math.max(...mesh.vertices.map(v=>v[1]))>20);assert(mesh.vertices.every(v=>Math.max(Math.abs(v[0]),Math.abs(v[2]))>=42-1e-6));
  });
  check(`operation ${op+1}/${scene.low}: drive plane stays flat and below gameplay height`,()=>{
   const p=scene.parts.find(p=>p.tag==='drive-plane');assert(p.mesh.vertices.every(v=>v[1]===-.095));assert.equal(p.mesh.faces.length,1);
  });
 }
 fingerprint.push(hash(full.meshes.find(x=>x.material.color===full.theme.metal).mesh.triangles));
}
check('operations differ in authored geometry, not only color',()=>assert.equal(new Set(fingerprint).size,3));
check('correct normal transform under non-uniform scaling',()=>{
 const p={sx:3,sy:.5,sz:2,yaw:.4,pitch:.3,roll:-.2},n=M.normal([1/Math.sqrt(2),1/Math.sqrt(2),0],p),t0=M.point([0,0,0],p),t1=M.point([1,-1,0],p),t=t1.map((x,i)=>x-t0[i]);assert(Math.abs(n.reduce((s,x,i)=>s+x*t[i],0))<1e-8);
});
check('motion changes with actual simulation time',()=>assert.notDeepEqual(W.motion({elapsed:4,relay:0}),W.motion({elapsed:12,relay:0})));
check('Calm mode freezes continuous motion while retaining power state',()=>assert.deepEqual(W.motion({elapsed:4,relay:2,calm:true}),W.motion({elapsed:90,relay:2,calm:true})));
check('real completed relays drive environmental power',()=>{assert.equal(W.motion({elapsed:0,relay:0}).power,0);assert.equal(W.motion({elapsed:0,relay:3}).power,1);});
check('world observer and draw calls never mutate gameplay input',()=>{
 const ctx={op:1,elapsed:8,relay:1,low:false,calm:false,player:{x:0,z:-27},enemies:[{x:4,z:8,type:'warden',dead:false}],cover:[{x:3,z:4,w:4,d:3,h:3}],relays:[[-22,-13],[20,-8],[0,17]],warning:false,muzzle:0,pulse:0,dash:0};
 const original=JSON.stringify(ctx),draw=[],engine={mode:'webgl2',batchEnabled:true,sun:{},mesh:(...args)=>draw.push(args)};
 W.frame(engine,ctx);W.render(engine,ctx);W.animate(engine,ctx);assert.equal(JSON.stringify(ctx),original);assert(draw.length>20&&draw.length<60);assert.equal(engine.environmentFrame.boxes.length,1);assert.equal(engine.environmentFrame.contacts.length,2);assert.equal(engine.environmentFrame.lights.length,2);
 assert(draw.every(([mesh,pose,mat])=>mesh.vertices.length>0&&Object.values(pose).every(Number.isFinite)&&/^#[a-f\d]{6}$/i.test(mat.color)));
});
for(const type of['skirmisher','lancer','bulwark','warden'])check(`${type}: bevelled armor preserves genuine pose and bounds`,()=>{
 const e={type,size:2,x:3,z:7,yaw:.6,hp:3,max:3,state:'windup',windup:.3,windupTotal:.7},before=JSON.stringify(e),meshes=[],cubes=[];
 const count=ES.render({faceted:(...q)=>meshes.push(q),cube:(...q)=>cubes.push(q)},e,'full',4,false);assert(meshes.length>=2);assert.equal(count,meshes.length+cubes.length);assert.equal(JSON.stringify(e),before);assert(meshes.every(q=>q.slice(1,7).every(Number.isFinite)));
});

function fakeGL(rejectShader=false){
 let id=0;const log=[],gl={};
 for(const k of['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','STATIC_DRAW','FLOAT','TRIANGLES','BLEND','SRC_ALPHA','ONE_MINUS_SRC_ALPHA'])gl[k]=k;
 for(const name of['shaderSource','compileShader','attachShader','linkProgram','deleteShader','deleteProgram','bindVertexArray','bindBuffer','bufferData','enableVertexAttribArray','vertexAttribPointer','uniform3f','uniform3fv','uniform1f','uniform1i','uniform4fv','uniformMatrix4fv','drawArrays','enable','disable','blendFunc','depthMask','deleteBuffer','deleteVertexArray'])gl[name]=(...args)=>log.push([name,...args]);
 for(const name of['createShader','createProgram','createVertexArray','createBuffer'])gl[name]=()=>({id:++id});
 gl.getShaderParameter=()=>!rejectShader;gl.getShaderInfoLog=()=> 'fixture shader rejection';gl.getProgramParameter=()=>true;gl.getUniformLocation=(_,name)=>name;
 const canvas={setAttribute:(...a)=>log.push(['attribute',...a])},engine={mode:'webgl2',gl,canvas,program:{id:'old'},vao:{id:'cube'},_loc:{},batchEnabled:true,calls:0,begin(){log.push(['begin']);},cube(){log.push(['cube']);},cubeBatch(){log.push(['batch']);},faceted(){log.push(['faceted']);},shadow(){log.push(['shadow']);},dispose(){log.push(['base-dispose']);}};
 return{gl,log,engine};
}
{
 const {engine:e,log}=fakeGL(),mesh=M.bevel('test',1,2,3),old=e.program;
 M.install(e);e.environmentFrame={boxes:[{x:1,z:2,w:3,d:4,h:5}],contacts:[{x:0,z:0,radius:1,height:1}],lights:[],time:3};e.begin({x:0,y:8,z:-10},{x:0,y:1,z:0});
 e.mesh(mesh,{x:2,y:0,z:3},{color:'#6688aa',metal:.6,rough:.3});e.mesh(mesh,{x:3,y:0,z:3},{color:'#6688aa',metal:.6,rough:.3});
 check('local shader replaces only its engine instance',()=>{assert.notEqual(e.program,old);assert(log.some(x=>x[0]==='deleteProgram'&&x[1]===old));assert.equal(e.environmentStats().enhanced,true);});
 check('mesh buffer uploads once and is reused',()=>{assert.equal(e.environmentStats().meshes,1);assert.equal(log.filter(x=>x[0]==='bufferData').length,1);});
 check('custom mesh restores original cube VAO',()=>assert.equal(log.at(-1)[1],e.vao));
 check('live authoritative cover and contact shadows have bounded uniforms',()=>{assert(log.some(x=>x[0]==='uniform1i'&&x[1]==='uShadowCount'&&x[2]===1));assert(log.some(x=>x[0]==='uniform1i'&&x[1]==='uContactCount'&&x[2]===1));});
 e.shadow(0,0,0,4,4);check('enhanced renderer avoids stacking obsolete rectangular actor shadows',()=>assert(!log.some(x=>x[0]==='shadow')));
 e.mesh(mesh,{}, {color:'#eeeeee',alpha:.12});check('transparent steam restores depth writes and blending',()=>{assert(log.some(x=>x[0]==='depthMask'&&x[1]===false));assert(log.some(x=>x[0]==='depthMask'&&x[1]===true));assert(log.some(x=>x[0]==='disable'&&x[1]==='BLEND'));});
 e.batchEnabled=false;e.begin({},{ });e.shadow(0,0,0,4,4);check('slow/software GPU tier avoids expensive directional shadows and preserves a fallback',()=>{assert(log.some(x=>x[0]==='uniform1i'&&x[1]==='uShadowCount'&&x[2]===0));assert(log.some(x=>x[0]==='shadow'));});
 e.dispose();check('context disposal releases every environment buffer and delegates existing cleanup',()=>{assert.equal(e.environmentStats().meshes,0);assert.equal(log.filter(x=>x[0]==='deleteBuffer').length,1);assert.equal(log.at(-1)[0],'base-dispose');});
}
{
 const {engine:e,log}=fakeGL(true),old=e.program;M.install(e);
 check('shader rejection preserves proven base rendering',()=>{assert.equal(e.program,old);assert.equal(e.environmentStats().enhanced,false);e.mesh(M.bevel('fallback',1,1,1),{}, {color:'#ffffff'});assert(log.some(x=>x[0]==='drawArrays'));});
}

const expose=s=>s.replace('window.__aegisVerge={','window.__aegisVerge={render,update,');
const withWorld=boot('aegis-verge',{transformScript:expose});
const withoutWorld=boot('aegis-verge',{transformScript:s=>expose(s).replace('WORLD.frame(engine,worldFrame);','').replace('WORLD.render(engine,worldFrame);','').replace('WORLD.animate(engine,worldFrame);','')});
for(const r of[withWorld,withoutWorld])r.byId.get('start').click();
check('actual launch integrates new world renderer and recovered uplink',()=>{assert(withWorld.context.__aegisVerge.state().active);assert.equal(typeof withWorld.context.AegisSignalUplink.observe,'function');});
{
 const game=withWorld.context.__aegisVerge,before=JSON.stringify(game.state()),writes=withWorld.writes.length,events=withWorld.messages.length;
 for(let i=0;i<4;i++)game.render();
 check('actual render passes cannot mutate saves, rewards, mission state or combat',()=>{assert.equal(JSON.stringify(game.state()),before);assert.equal(withWorld.writes.length,writes);assert.equal(withWorld.messages.length,events);assert(game.tactics().softwareFaces>500&&game.tactics().softwareFaces<4000);});
}
for(const r of[withWorld,withoutWorld])r.dispatch('keydown',{key:'w',code:'KeyW',repeat:false});
for(let i=0;i<100;i++){
 for(const r of[withWorld,withoutWorld]){r.context.__aegisVerge.update(.025);if(i%10===0)r.context.__aegisVerge.render();}
}
check('identical actual movement/combat with environment enabled or omitted',()=>assert.equal(JSON.stringify(withWorld.context.__aegisVerge.state()),JSON.stringify(withoutWorld.context.__aegisVerge.state())));
for(const r of[withWorld,withoutWorld])r.dispatch('keydown',{key:'p',code:'KeyP',repeat:false});
const paused=JSON.stringify(withWorld.context.__aegisVerge.state());
withWorld.context.__aegisVerge.update(.1);withWorld.context.__aegisVerge.render();
check('pause freezes actual simulation and environmental clock',()=>{assert(withWorld.context.__aegisVerge.state().paused);assert.equal(JSON.stringify(withWorld.context.__aegisVerge.state()),paused);});
console.log(JSON.stringify({passed,total:passed,scope:'Node geometry, GL lifecycle contract mock and actual game code in modeled DOM/canvas. No browser or GPU execution claim.',checks:names},null,2));
