/* Cyber Wars: original local Viridia mesh/material adapter.
 * Presentation only. No game state, network, storage, input or collision authority.
 * Uses the catalog's WebGL2 engine and a bounded, clipped polygon fallback.
 */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=c=>{if(Array.isArray(c))return c;let s=String(c||'#ffffff').replace('#','');if(s.length===3)s=s.split('').map(x=>x+x).join('');const n=parseInt(s,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
function face(vertices,indices,center=[0,0,0]){
 let ix=indices.slice(),a=vertices[ix[0]],b=vertices[ix[1]],c=vertices[ix[2]];
 const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);
 let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);
 if(len<1e-9)return null;
 n=n.map(x=>x/len);
 if(center&&n.reduce((s,x,i)=>s+x*(a[i]-center[i]),0)<0){ix.reverse();n=n.map(x=>-x);}
 return {ix,n};
}
function finish(vertices,faces){
 faces=faces.filter(Boolean);const floats=[];
 for(const f of faces)for(let i=1;i<f.ix.length-1;i++)for(const j of [f.ix[0],f.ix[i],f.ix[i+1]])floats.push(...vertices[j],...f.n);
 return {vertices,faces,triangles:new Float32Array(floats)};
}
function geometry(kind){
 if(kind==='plane'){
  const v=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5]];
  return finish(v,[face(v,[0,3,2,1],null)]);
 }
 if(kind==='box'){
  const v=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
  return finish(v,[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].map(ix=>face(v,ix)));
 }
 if(kind==='column'||kind==='trunk'||kind==='spire'){
  const count=8,top=kind==='spire'?.09:kind==='trunk'?.64:1,v=[];
  for(const [y,r]of [[-.5,.5],[.5,.5*top]])for(let i=0;i<count;i++){const a=i/count*Math.PI*2;v.push([Math.cos(a)*r,y,Math.sin(a)*r]);}
  const fs=[Array.from({length:count},(_,i)=>i),Array.from({length:count},(_,i)=>count+i)];
  for(let i=0;i<count;i++){const j=(i+1)%count;fs.push([i,j,j+count,i+count]);}
  return finish(v,fs.map(ix=>face(v,ix)));
 }
 if(kind==='leaf'){
  const v=[[0,.10,0],[0,-.055,0],[0,0,-.5],[.37,0,-.18],[.5,.025,.08],[.25,.035,.38],[0,.04,.5],[-.25,.035,.38],[-.5,.025,.08],[-.37,0,-.18]],fs=[];
  for(let i=2;i<v.length;i++){const j=i===v.length-1?2:i+1;fs.push(face(v,[0,i,j]),face(v,[1,j,i]));}
  return finish(v,fs);
 }
 if(kind==='arch'){
  const v=[],fs=[],steps=12,sides=6;
  for(let i=0;i<=steps;i++){const a=i/steps*Math.PI;for(let j=0;j<sides;j++){const b=j/sides*Math.PI*2,r=.065;v.push([Math.cos(a)*(.5+Math.cos(b)*r),Math.sin(a)*(.5+Math.cos(b)*r),Math.sin(b)*r]);}}
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const k=(j+1)%sides,a=(i+.5)/steps*Math.PI,center=[Math.cos(a)*.5,Math.sin(a)*.5,0];fs.push(face(v,[i*sides+j,i*sides+k,(i+1)*sides+k,(i+1)*sides+j],center));}
  fs.push(face(v,Array.from({length:sides},(_,i)=>i),[.5,.01,0]));
  fs.push(face(v,Array.from({length:sides},(_,i)=>steps*sides+i),[-.5,.01,0]));
  return finish(v,fs);
 }
 if(kind==='orb'||kind==='rock'){
  const t=(1+Math.sqrt(5))/2,v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p=>p.map(x=>x*.5/Math.hypot(...p)));
  const base=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],edges=new Map(),fs=[];
  // One shared subdivision gives silhouettes enough contour for heads, crowns
  // and geology while keeping the software path strictly bounded (80 faces).
  const midpoint=(a,b)=>{const key=Math.min(a,b)+':'+Math.max(a,b);if(edges.has(key))return edges.get(key);const p=v[a].map((x,i)=>(x+v[b][i])*.5),scale=.5/Math.hypot(...p),i=v.length;v.push(p.map(x=>x*scale));edges.set(key,i);return i;};
  for(const [a,b,c]of base){const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);fs.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);}
  if(kind==='rock')for(let i=0;i<v.length;i++){const p=v[i],r=.88+.065*Math.sin(p[0]*13+p[2]*7)+.035*Math.cos(p[1]*19-p[2]*5);v[i]=p.map(x=>x*r);}
  return finish(v,fs.map(ix=>face(v,ix)));
 }
 throw new Error('Unknown Viridia geometry: '+kind);
}
const geometries=new Map();
function getGeometry(kind){if(!geometries.has(kind))geometries.set(kind,geometry(kind));return geometries.get(kind);}
function matrix(x,y,z,sx,sy,sz,yaw=0,pitch=0,roll=0){
 const cy=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
 return [ (cy*cr+s*sp*sr)*sx,sr*cp*sx,(-s*cr+cy*sp*sr)*sx,0,
  (-cy*sr+s*sp*cr)*sy,cr*cp*sy,(sr*s+cy*sp*cr)*sy,0,
  s*cp*sz,-sp*sz,cy*cp*sz,0,x,y,z,1];
}
function clipNear(poly,near=.18){
 const out=[];
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=a.z>=near,bb=b.z>=near;
  if(aa)out.push(a);if(aa!==bb){const t=(near-a.z)/(b.z-a.z);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:near});}
 }
 return out;
}
const VS=[
'#version 300 es',
'precision highp float;layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNor;',
'layout(location=2)in vec4 aM0;layout(location=3)in vec4 aM1;layout(location=4)in vec4 aM2;layout(location=5)in vec4 aM3;layout(location=6)in vec3 aColor;layout(location=7)in float aEmissive;',
'uniform mat4 uP,uV,uM;uniform vec3 uColor;uniform float uEmissive;uniform int uInstanced;out vec3 vN,vW,vColor;out float vEmissive;',
'void main(){mat4 m=uInstanced!=0?mat4(aM0,aM1,aM2,aM3):uM;vec4 w=m*vec4(aPos,1.);vW=w.xyz;vec3 s=vec3(length(m[0].xyz),length(m[1].xyz),length(m[2].xyz));vN=normalize(mat3(m)*(aNor/max(s*s,vec3(.0001))));vColor=uInstanced!=0?aColor:uColor;vEmissive=uInstanced!=0?aEmissive:uEmissive;gl_Position=uP*uV*w;}'
].join('\n');
const FS=[
'#version 300 es',
'precision highp float;in vec3 vN,vW,vColor;in float vEmissive;uniform vec3 uSun,uFog,uCam;uniform float uRough,uFogNear,uFogFar,uSurface,uTime,uRain,uDay;out vec4 outColor;',
'float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}',
'float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}',
'void main(){vec3 n=normalize(vN),light=normalize(-uSun),view=normalize(uCam-vW),base=vColor;float rough=.76,grain=mix(.88,1.10,noise(vW*3.8));',
'if(uSurface>.5&&uSurface<1.5){grain=mix(.83,1.12,noise(vW*7.));base*=mix(vec3(.85,.98,.74),vec3(1.0,1.04,.92),max(0.,n.y));rough=.68;}',
'if(uSurface>1.5&&uSurface<2.5){float a=sin(vW.x*1.8+vW.z*.7-uTime*1.7),b=cos(vW.z*2.8-vW.x*.5+uTime*1.25);n=normalize(vec3(a*(.075+uRain*.055),1.,b*(.085+uRain*.05)));rough=.17+uRain*.19;grain=1.;float fresnel=pow(1.-max(dot(n,view),0.),3.);base=mix(base,uFog*1.22,fresnel*.66);float foam=pow(max(0.,sin(vW.x*3.4-vW.z*2.2-uTime*2.)),18.)*(.1+uRain*.08);base+=vec3(.44,.60,.51)*foam;}',
'if(uSurface>2.5&&uSurface<3.5){rough=.25;grain=mix(.92,1.06,noise(vW*11.));}',
'if(uSurface>3.5&&uSurface<4.5){grain=mix(.86,1.08,noise(vW*23.));rough=.94;}',
'if(uSurface>4.5){grain=mix(.78,1.13,noise(vW*1.5)*.66+noise(vW*9.)*.34);rough=.97;}',
'float diffuse=max(dot(n,light),0.),hemi=mix(.28,.50,n.y*.5+.5)+uDay*.08;vec3 h=normalize(light+view);float spec=pow(max(dot(n,h),0.),mix(92.,10.,rough))*(1.-rough)*(.24+uDay*.72);',
'float contact=mix(.86,1.,smoothstep(-.1,1.3,vW.y));vec3 col=base*grain*contact*(hemi+diffuse*(.25+uDay*.45))+vec3(1.,.91,.74)*spec+base*vEmissive*.70;',
'float fog=smoothstep(uFogNear,uFogFar,distance(uCam,vW));outColor=vec4(mix(col,uFog,fog),1.);}'
].join('\n');
const SKY_VS=['#version 300 es','precision highp float;layout(location=0)in vec2 p;out vec2 uv;void main(){uv=p;gl_Position=vec4(p,1.,1.);}'].join('\n');
const SKY_FS=[
'#version 300 es','precision highp float;in vec2 uv;out vec4 outColor;uniform vec3 uForward,uRight,uUp,uHorizon,uSun;uniform float uDay,uRain,uTime,uAspect,uTan;',
'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
'void main(){vec3 ray=normalize(uForward+uRight*uv.x*uAspect*uTan+uUp*uv.y*uTan);float elevation=clamp(ray.y*.85+.12,0.,1.);vec3 top=mix(vec3(.015,.027,.065),vec3(.16,.34,.43),uDay);top=mix(top,vec3(.13,.19,.22),uRain*.62);vec3 col=mix(uHorizon,top,pow(elevation,.53));',
'vec2 cloud=ray.xz/max(.15,ray.y+.28)*2.6+vec2(uTime*.008,uTime*.003);float density=n(cloud)*.6+n(cloud*2.03)*.27+n(cloud*4.1)*.13;float cover=smoothstep(.54-uRain*.16,.77-uRain*.14,density)*smoothstep(-.04,.23,ray.y);vec3 clouds=mix(vec3(.08,.10,.16),vec3(.79,.83,.72),uDay);clouds=mix(clouds,vec3(.27,.34,.34),uRain*.75);col=mix(col,clouds,cover*.80);',
'float sun=max(dot(ray,normalize(-uSun)),0.);col+=vec3(1.,.75,.37)*pow(sun,280.)*uDay*(1.-uRain*.86)*(1.-cover);col+=vec3(.25,.16,.05)*pow(sun,18.)*uDay*.16;',
'float stars=step(.9975,h(floor(ray.xz/max(.1,ray.y+.1)*310.)))*smoothstep(.08,.3,ray.y)*(1.-uDay)*(1.-uRain);col+=vec3(.50,.63,.75)*stars;outColor=vec4(col,1.);}'
].join('\n');
function compile(g,vs,fs){
 const shaders=[],p=g.createProgram();
 try{for(const [type,source]of [[g.VERTEX_SHADER,vs],[g.FRAGMENT_SHADER,fs]]){const s=g.createShader(type);shaders.push(s);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(s)||'Viridia shader compilation failed');g.attachShader(p,s);}
  g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(p)||'Viridia shader linking failed');return p;
 }catch(e){if(p)g.deleteProgram(p);throw e;}finally{for(const s of shaders)g.deleteShader(s);}
}
function install(engine){
 if(!engine||engine.viridiaMesh)return engine;
 const mood={time:0,rain:0,day:1,reduced:false},stats={meshes:0,triangles:0,softwareFaces:0,clipped:0};
 engine.viridiaAtmosphere=value=>Object.assign(mood,value);
 engine.viridiaStats=()=>({...stats,mode:engine.mode,geometryKinds:geometries.size,fallbackReason:engine.viridiaError||null});
 if(engine.gl){
  const g=engine.gl,resources=new Map(),baseBegin=engine.begin.bind(engine),baseCube=engine.cube.bind(engine),baseBatch=engine.cubeBatch.bind(engine),baseDispose=engine.dispose.bind(engine);
  // Active per-instance attributes still require a valid backing record when
  // the uniform branch selects ordinary cubes. Software WebGL drivers can
  // disable batching before cubeBatch ever allocates the shared engine buffer.
  // Initialize locally before optional shader compilation so the legacy
  // fallback is usable as well, without claiming any batch capacity.
  if(engine.instanceBuffer&&!engine.instanceCapacity){g.bindBuffer(g.ARRAY_BUFFER,engine.instanceBuffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array(20),g.DYNAMIC_DRAW);}
  let p,skyProgram;
  try{p=compile(g,VS,FS);skyProgram=compile(g,SKY_VS,SKY_FS);}catch(e){if(p)g.deleteProgram(p);engine.viridiaError=String(e.message);return engine;}
  const old=engine.program;engine.program=p;g.deleteProgram(old);
  for(const k of ['uP','uV','uM','uColor','uSun','uFog','uCam','uEmissive','uRough','uFogNear','uFogFar','uInstanced','uSurface','uTime','uRain','uDay'])engine._loc[k]=g.getUniformLocation(p,k);
  const skyLoc={};for(const k of ['uForward','uRight','uUp','uHorizon','uSun','uDay','uRain','uTime','uAspect','uTan'])skyLoc[k]=g.getUniformLocation(skyProgram,k);
  const skyVAO=g.createVertexArray(),skyBuffer=g.createBuffer(),instances=g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER,instances);g.bufferData(g.ARRAY_BUFFER,new Float32Array(20),g.DYNAMIC_DRAW);
  g.bindVertexArray(skyVAO);g.bindBuffer(g.ARRAY_BUFFER,skyBuffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,g.FLOAT,false,8,0);g.bindVertexArray(engine.vao);
  function resource(kind){
   if(resources.has(kind))return resources.get(kind);
   const mesh=getGeometry(kind),vao=g.createVertexArray(),buffer=g.createBuffer();
   g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,mesh.triangles,g.STATIC_DRAW);
   for(let i=0;i<2;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,24,i*12);}
   g.bindBuffer(g.ARRAY_BUFFER,instances);
   for(let i=0;i<4;i++){g.enableVertexAttribArray(2+i);g.vertexAttribPointer(2+i,4,g.FLOAT,false,80,i*16);g.vertexAttribDivisor(2+i,1);}
   g.enableVertexAttribArray(6);g.vertexAttribPointer(6,3,g.FLOAT,false,80,64);g.vertexAttribDivisor(6,1);g.enableVertexAttribArray(7);g.vertexAttribPointer(7,1,g.FLOAT,false,80,76);g.vertexAttribDivisor(7,1);
   const r={vao,buffer,count:mesh.triangles.length/6};resources.set(kind,r);g.bindVertexArray(engine.vao);return r;
  }
  engine.begin=(eye,target)=>{
   stats.meshes=stats.triangles=stats.softwareFaces=stats.clipped=0;baseBegin(eye,target);
   g.uniform1f(engine._loc.uTime,mood.reduced?0:mood.time);g.uniform1f(engine._loc.uRain,mood.rain);g.uniform1f(engine._loc.uDay,mood.day);g.uniform1f(engine._loc.uSurface,0);
   const d=[target.x-eye.x,target.y-eye.y,target.z-eye.z],len=Math.hypot(...d)||1,f=d.map(x=>x/len),right=[-f[2],0,f[0]],rl=Math.hypot(...right)||1;for(let i=0;i<3;i++)right[i]/=rl;const up=[right[1]*f[2]-right[2]*f[1],right[2]*f[0]-right[0]*f[2],right[0]*f[1]-right[1]*f[0]];
   g.useProgram(skyProgram);g.bindVertexArray(skyVAO);g.disable(g.DEPTH_TEST);g.disable(g.CULL_FACE);g.depthMask(false);
   g.uniform3f(skyLoc.uForward,...f);g.uniform3f(skyLoc.uRight,...right);g.uniform3f(skyLoc.uUp,...up);g.uniform3f(skyLoc.uHorizon,...engine.fog);g.uniform3f(skyLoc.uSun,engine.sun.x,engine.sun.y,engine.sun.z);
   g.uniform1f(skyLoc.uDay,mood.day);g.uniform1f(skyLoc.uRain,mood.rain);g.uniform1f(skyLoc.uTime,mood.reduced?0:mood.time);g.uniform1f(skyLoc.uAspect,engine.canvas.width/engine.canvas.height);g.uniform1f(skyLoc.uTan,Math.tan(engine.fov/2));g.drawArrays(g.TRIANGLES,0,3);
   g.depthMask(true);g.enable(g.DEPTH_TEST);g.enable(g.CULL_FACE);g.useProgram(engine.program);g.bindVertexArray(engine.vao);
  };
  engine.cube=(...args)=>{g.uniform1f(engine._loc.uSurface,0);baseCube(...args);};
  engine.cubeBatch=items=>{g.uniform1f(engine._loc.uSurface,0);baseBatch(items);};
  engine.viridiaMesh=(kind,x,y,z,sx,sy,sz,color,yaw=0,em=0,pitch=0,roll=0,surface=0)=>{
   const r=resource(kind),c=rgb(color),u=engine._loc;g.bindVertexArray(r.vao);g.uniform1i(u.uInstanced,0);g.uniformMatrix4fv(u.uM,false,new Float32Array(matrix(x,y,z,sx,sy,sz,yaw,pitch,roll)));g.uniform3f(u.uColor,...c);g.uniform1f(u.uEmissive,em);g.uniform1f(u.uSurface,surface);g.drawArrays(g.TRIANGLES,0,r.count);g.bindVertexArray(engine.vao);engine.calls++;stats.meshes++;stats.triangles+=r.count/3;
  };
  let instanceData=new Float32Array(20*1024);
  engine.viridiaBatch=items=>{
   if(!engine.batchEnabled){for(const o of items)engine.viridiaMesh(o.shape,o.x,o.y,o.z,o.sx,o.sy,o.sz,o.color,o.yaw||0,o.em||0,o.pitch||0,o.roll||0,o.surface||0);return;}
   const groups=new Map();
   for(const o of items){const k=o.shape+':'+(o.surface||0);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);}
   for(const group of groups.values()){
    const r=resource(group[0].shape),n=group.length;if(n*20>instanceData.length)instanceData=new Float32Array(Math.pow(2,Math.ceil(Math.log2(n)))*20);
    for(let i=0;i<n;i++){const o=group[i],j=i*20;instanceData.set(matrix(o.x,o.y,o.z,o.sx,o.sy,o.sz,o.yaw,o.pitch,o.roll),j);instanceData.set(rgb(o.color),j+16);instanceData[j+19]=o.em||0;}
    g.bindVertexArray(r.vao);g.bindBuffer(g.ARRAY_BUFFER,instances);g.bufferData(g.ARRAY_BUFFER,instanceData.subarray(0,n*20),g.DYNAMIC_DRAW);g.uniform1i(engine._loc.uInstanced,1);g.uniform1f(engine._loc.uSurface,group[0].surface||0);g.drawArraysInstanced(g.TRIANGLES,0,r.count,n);engine.calls++;engine.batchCalls++;engine.instancesRendered+=n;stats.meshes+=n;stats.triangles+=r.count*n/3;
   }
   g.uniform1i(engine._loc.uInstanced,0);g.uniform1f(engine._loc.uSurface,0);g.bindVertexArray(engine.vao);
  };
  engine.end=()=>{};
  engine.dispose=()=>{for(const r of resources.values()){g.deleteBuffer(r.buffer);g.deleteVertexArray(r.vao);}resources.clear();g.deleteBuffer(instances);g.deleteBuffer(skyBuffer);g.deleteVertexArray(skyVAO);g.deleteProgram(skyProgram);baseDispose();};
 }else{
  const ctx=engine.ctx,baseDispose=engine.dispose.bind(engine);
  let faces=[],eye={},cy=1,syaw=0,cp=1,sp=0,w=1,h=1,f=1,fog=[0,0,0],sun=[-.4,.8,-.2];
  const view=p=>{const dx=p[0]-eye.x,dy=p[1]-eye.y,dz=p[2]-eye.z,rx=-dx*cy+dz*syaw,rz=dx*syaw+dz*cy;return {x:rx,y:dy*cp-rz*sp,z:dy*sp+rz*cp};};
  engine.begin=(e,target)=>{
   engine.resize();w=engine.canvas.width;h=engine.canvas.height;eye={...e};engine.cam={...e};engine._eye=eye;engine._target={...target};engine._yaw=Math.atan2(target.x-e.x,target.z-e.z);engine._pitch=Math.atan2(target.y-e.y,Math.hypot(target.x-e.x,target.z-e.z)||1);
   cy=Math.cos(engine._yaw);syaw=Math.sin(engine._yaw);cp=Math.cos(engine._pitch);sp=Math.sin(engine._pitch);f=h*.5/Math.tan(engine.fov/2);fog=engine.fog.map(v=>v*255);sun=engine.sun?[-engine.sun.x,-engine.sun.y,-engine.sun.z]:[-.36,.85,-.3];const sl=Math.hypot(...sun)||1;sun=sun.map(x=>x/sl);faces=[];engine.calls=engine.batchCalls=engine.instancesRendered=0;stats.meshes=stats.triangles=stats.softwareFaces=stats.clipped=0;
   const top=[12+30*mood.day,22+61*mood.day,42+64*mood.day],sky=ctx.createLinearGradient(0,0,0,h),horizon=fog.map(Math.round);sky.addColorStop(0,'rgb('+top.map(Math.round).join(',')+')');sky.addColorStop(.64,'rgb('+horizon.join(',')+')');sky.addColorStop(1,'#17342d');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
   // Bounded cloud bands are a sky backdrop; the world itself remains 3D polygons.
   if(ctx.ellipse){ctx.save();ctx.globalAlpha=.045+.08*mood.rain;ctx.fillStyle=mood.day>.4?'#edf1d3':'#718f9c';for(let i=0;i<6;i++){const x=((i*.231+(mood.reduced?0:mood.time*.0006))%1.35-.15)*w;ctx.beginPath();ctx.ellipse(x,h*(.12+(i%3)*.07),w*(.14+(i%2)*.07),h*.035,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  };
  engine.viridiaMesh=(kind,x,y,z,sx,sy,sz,color,yaw=0,em=0,pitch=0,roll=0,surface=0,ground=false)=>{
   const dx=x-eye.x,dz=z-eye.z;if(dx*dx+dz*dz>(engine.far+Math.max(sx,sz))**2)return;
   const mesh=getGeometry(kind),m=matrix(x,y,z,sx,sy,sz,yaw,pitch,roll),pts=mesh.vertices.map(p=>[p[0]*m[0]+p[1]*m[4]+p[2]*m[8]+x,p[0]*m[1]+p[1]*m[5]+p[2]*m[9]+y,p[0]*m[2]+p[1]*m[6]+p[2]*m[10]+z]),projections=[],col=rgb(color).map(v=>v*255);
   const fogMix=clamp((Math.hypot(dx,dz)-engine.fogNear)/(engine.fogFar-engine.fogNear),0,.97);
   for(const def of mesh.faces){
    if(faces.length>=18000)break;
    const n=def.n,normal=[n[0]*m[0]/(sx*sx)+n[1]*m[4]/(sy*sy)+n[2]*m[8]/(sz*sz),n[0]*m[1]/(sx*sx)+n[1]*m[5]/(sy*sy)+n[2]*m[9]/(sz*sz),n[0]*m[2]/(sx*sx)+n[1]*m[6]/(sy*sy)+n[2]*m[10]/(sz*sz)],nl=Math.hypot(...normal)||1;for(let i=0;i<3;i++)normal[i]/=nl;
    const point=pts[def.ix[0]];if(normal[0]*(eye.x-point[0])+normal[1]*(eye.y-point[1])+normal[2]*(eye.z-point[2])<=0)continue;
    const original=def.ix.map(i=>projections[i]||(projections[i]=view(pts[i]))),poly=clipNear(original);if(poly.length<3)continue;if(poly.length!==original.length||original.some(p=>p.z<.18))stats.clipped++;
    const depth=poly.reduce((v,p)=>v+p.z,0)/poly.length,screen=poly.map(p=>[w*.5+p.x/p.z*f,h*.5-p.y/p.z*f]);
    if(screen.every(p=>p[0]<0)||screen.every(p=>p[0]>w)||screen.every(p=>p[1]<0)||screen.every(p=>p[1]>h))continue;
    let light=.36+mood.day*.08+Math.max(0,normal.reduce((v,n,i)=>v+n*sun[i],0))*(.32+mood.day*.38)+em*.65;
    if(surface===2)light=.74+.12*Math.sin(x*1.4+z*2-(mood.reduced?0:mood.time*1.4))+.08*mood.rain;
    const fill=col.map((v,i)=>Math.round(clamp(v*light,0,255)*(1-fogMix)+fog[i]*fogMix));
    faces.push({screen,depth,ground,fill:'rgb('+fill.join(',')+')'});
   }
   engine.calls++;stats.meshes++;stats.triangles+=mesh.triangles.length/18;
  };
  engine.cube=(x,y,z,sx,sy,sz,color='#fff',yaw=0,em=0,pitch=0,roll=0)=>engine.viridiaMesh('box',x,y,z,sx,sy,sz,color,yaw,em,pitch,roll,0,sy<=.13&&y<.1);
  engine.cubeBatch=items=>{for(const o of items)engine.cube(o.x,o.y,o.z,o.sx,o.sy,o.sz,o.color,o.yaw,o.em);};
  engine.viridiaBatch=items=>{for(const o of items)engine.viridiaMesh(o.shape,o.x,o.y,o.z,o.sx,o.sy,o.sz,o.color,o.yaw||0,o.em||0,o.pitch||0,o.roll||0,o.surface||0,o.ground||false);};
  engine.shadow=(x,y,z,sx,sz,yaw=0)=>engine.viridiaMesh('plane',x,y,z,sx,1,sz,'#12281f',yaw);
  engine.end=()=>{faces.sort((a,b)=>Number(b.ground)-Number(a.ground)||b.depth-a.depth);for(const o of faces){ctx.beginPath();o.screen.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=o.fill;ctx.fill();}stats.softwareFaces=faces.length;engine.softwareFaces=faces.length;};
  engine.dispose=()=>{faces=[];baseDispose();};
 }
 return engine;
}
const api={geometry,getGeometry,matrix,clipNear,install};root.CWViridiaRenderer=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
