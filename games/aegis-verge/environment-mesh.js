/* Aegis Verge 3.0 — original local mesh and atmosphere pipeline.
 * Architect Industries, MIT. No shared-engine patch, imported asset, network,
 * gameplay, storage, collision or scoring authority.
 */
(function(root){
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=value=>{if(Array.isArray(value))return value;const n=parseInt(String(value||'#ffffff').slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
function rotation(p={}){
 const a=p.yaw||0,b=p.pitch||0,c=p.roll||0,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);
 return[ca*cc+sa*sb*sc,sc*cb,-sa*cc+ca*sb*sc,-ca*sc+sa*sb*cc,cc*cb,sc*sa+ca*sb*cc,sa*cb,-sb,ca*cb];
}
function point(v,p={},r=rotation(p)){
 const x=v[0]*(p.sx??1),y=v[1]*(p.sy??1),z=v[2]*(p.sz??1);
 return[r[0]*x+r[3]*y+r[6]*z+(p.x||0),r[1]*x+r[4]*y+r[7]*z+(p.y||0),r[2]*x+r[5]*y+r[8]*z+(p.z||0)];
}
function normal(v,p={},r=rotation(p)){
 const x=v[0]/(p.sx??1),y=v[1]/(p.sy??1),z=v[2]/(p.sz??1),a=r[0]*x+r[3]*y+r[6]*z,b=r[1]*x+r[4]*y+r[7]*z,c=r[2]*x+r[5]*y+r[8]*z,l=Math.hypot(a,b,c)||1;
 return[a/l,b/l,c/l];
}
function geometry(id,vertices,indices){
 const faces=[],floats=[],min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const v of vertices){if(v.length!==3||!v.every(Number.isFinite))throw Error('Nonfinite environment vertex');for(let i=0;i<3;i++){min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}}
 for(const ix of indices){
  if(ix.length<3||ix.some(i=>!Number.isInteger(i)||!vertices[i]))throw Error('Invalid environment face');
  const a=vertices[ix[0]],b=vertices[ix[1]],c=vertices[ix[2]],u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-9)continue;
  for(let j=0;j<3;j++)n[j]/=l;faces.push({ix:[...ix],n});
  for(let i=1;i<ix.length-1;i++)for(const j of[ix[0],ix[i],ix[i+1]])floats.push(...vertices[j],...n);
 }
 return{id,vertices,faces,triangles:new Float32Array(floats),bounds:{min,max},trianglesCount:floats.length/18};
}
function merge(id,parts){
 const vertices=[],indices=[];
 for(const {mesh,pose={}} of parts){const offset=vertices.length,r=rotation(pose);for(const v of mesh.vertices)vertices.push(point(v,pose,r));for(const f of mesh.faces)indices.push(f.ix.map(i=>i+offset));}
 return geometry(id,vertices,indices);
}
function lathe(id,profile,segments=16){
 const v=[],f=[];segments=Math.max(3,Math.floor(segments));
 for(const [y,r] of profile)for(let i=0;i<segments;i++){const a=i*TAU/segments;v.push([Math.sin(a)*r,y,Math.cos(a)*r]);}
 f.push(Array.from({length:segments},(_,i)=>segments-1-i));
 f.push(Array.from({length:segments},(_,i)=>(profile.length-1)*segments+i));
 for(let k=0;k<profile.length-1;k++)for(let i=0;i<segments;i++){const j=(i+1)%segments,a=k*segments;f.push([a+i,a+j,a+j+segments,a+i+segments]);}
 return geometry(id,v,f);
}
function torus(id,radius,tube,segments=28,sides=6){
 const v=[],f=[];
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*TAU/segments,b=j*TAU/sides,r=radius+Math.cos(b)*tube;v.push([Math.sin(a)*r,Math.sin(b)*tube,Math.cos(a)*r]);}
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=((i+1)%segments)*sides+j,c=((i+1)%segments)*sides+(j+1)%sides,d=i*sides+(j+1)%sides;f.push([a,b,c,d]);}
 return geometry(id,v,f);
}
function sphere(id,segments=12,rings=7,inward=false){
 const v=[],f=[];
 for(let j=0;j<=rings;j++)for(let i=0;i<segments;i++){const a=i*TAU/segments,b=j*Math.PI/rings;v.push([Math.sin(a)*Math.sin(b),Math.cos(b),Math.cos(a)*Math.sin(b)]);}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*segments+i,b=j*segments+(i+1)%segments,c=b+segments,d=a+segments;if(j===0)f.push([a,d,c]);else if(j===rings-1)f.push([a,d,b]);else f.push([a,d,c,b]);}
 if(inward)for(const x of f)x.reverse();
 return geometry(id,v,f);
}
function bevel(id,w,h,d,inset=.12){
 const r=Math.min(w,d)*clamp(inset,.01,.3),v=[],f=[];
 const ring=[[-w/2+r,-d/2],[w/2-r,-d/2],[w/2,-d/2+r],[w/2,d/2-r],[w/2-r,d/2],[-w/2+r,d/2],[-w/2,d/2-r],[-w/2,-d/2+r]];
 for(const [y,s] of[[-h/2,.90],[-h*.30,1],[h*.30,1],[h/2,.84]])for(const [x,z]of ring)v.push([x*s,y,z*s]);
 f.push(Array.from({length:8},(_,i)=>i));f.push(Array.from({length:8},(_,i)=>31-i));
 for(let k=0;k<3;k++)for(let i=0;i<8;i++){const j=(i+1)%8,a=k*8;f.push([a+i,a+i+8,a+j+8,a+j]);}
 return geometry(id,v,f);
}
function arch(id,width,rise,thickness,depth,segments=18){
 const v=[],f=[];
 for(let i=0;i<=segments;i++){const a=Math.PI-i*Math.PI/segments,co=Math.cos(a),si=Math.sin(a);v.push([co*width/2,si*rise,depth/2],[co*(width/2-thickness),si*(rise-thickness),depth/2],[co*width/2,si*rise,-depth/2],[co*(width/2-thickness),si*(rise-thickness),-depth/2]);}
 const orient=(ix,want)=>{const a=v[ix[0]],b=v[ix[1]],c=v[ix[2]],u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];if(n.reduce((s,x,i)=>s+x*want[i],0)<0)ix.reverse();f.push(ix);};
 for(let i=0;i<segments;i++){const a=i*4,b=a+4,mid=Math.PI-(i+.5)*Math.PI/segments,n=[Math.cos(mid),Math.sin(mid),0];orient([a,a+1,b+1,b],[0,0,1]);orient([a+2,b+2,b+3,a+3],[0,0,-1]);orient([a,b,b+2,a+2],n);orient([a+1,a+3,b+3,b+1],n.map(x=>-x));}
 orient([0,2,3,1],[0,-1,0]);const n=segments*4;orient([n,n+1,n+3,n+2],[0,-1,0]);
 return geometry(id,v,f);
}
const VS=`#version 300 es
precision highp float;
layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNor;
layout(location=2)in vec4 aM0;layout(location=3)in vec4 aM1;layout(location=4)in vec4 aM2;layout(location=5)in vec4 aM3;
layout(location=6)in vec3 aColor;layout(location=7)in float aEmissive;
uniform mat4 uP,uV,uM;uniform vec3 uColor;uniform float uEmissive;uniform int uInstanced;
out vec3 vN,vW,vColor;out float vEmissive;
void main(){mat4 m=uInstanced!=0?mat4(aM0,aM1,aM2,aM3):uM;vec4 w=m*vec4(aPos,1.);vW=w.xyz;vN=normalize(transpose(inverse(mat3(m)))*aNor);vColor=uInstanced!=0?aColor:uColor;vEmissive=uInstanced!=0?aEmissive:uEmissive;gl_Position=uP*uV*w;}`;
const FS=`#version 300 es
precision highp float;
in vec3 vN,vW,vColor;in float vEmissive;
uniform vec3 uSun,uFog,uCam,uSky,uHorizon,uSunColor;uniform float uRough,uFogNear,uFogFar,uTime,uAlpha;
uniform vec3 uSurface;uniform int uShadowCount,uContactCount,uLightCount;
uniform vec4 uShadow[12],uShadowSize[12],uContact[8],uLight[4],uLightColor[4];out vec4 outColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
vec3 tone(vec3 c){return pow(clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.),vec3(1./2.2));}
float coverShade(vec3 p,vec3 light){float shade=1.;for(int i=0;i<12;i++){if(i>=uShadowCount)break;vec3 center=uShadow[i].xyz,halfSize=uShadowSize[i].xyz;vec3 inv=1./(light+vec3(.00001));vec3 a=(center-halfSize-p)*inv,b=(center+halfSize-p)*inv,nearV=min(a,b),farV=max(a,b);float enter=max(max(nearV.x,nearV.y),nearV.z),leave=min(min(farV.x,farV.y),farV.z);if(leave>max(.04,enter)&&enter<36.)shade=min(shade,.24);}
for(int i=0;i<8;i++){if(i>=uContactCount)break;vec4 q=uContact[i];vec2 at=q.xy-light.xz*(q.w-p.y)/max(.25,light.y);float r=q.z*1.12,d=length((p.xz-at)/vec2(r,r*.78));if(p.y<q.w&&d<1.)shade*=mix(.42,1.,smoothstep(.20,1.,d));}return shade;}
void main(){
 vec3 N=normalize(vN),V=normalize(uCam-vW),L=normalize(-uSun);float kind=uSurface.z;
 if(kind>8.5){vec3 d=normalize(vW-uCam);float h=clamp(d.y*1.7+.08,0.,1.);vec3 sky=mix(uHorizon,uSky,pow(h,.55));float clouds=noise(d.xz/max(.18,d.y+.22)*2.+vec2(uTime*.006,0.));clouds+=noise(d.xz/max(.18,d.y+.22)*5.-vec2(uTime*.003,0.))*.35;sky=mix(sky,uHorizon*.96,smoothstep(.79,1.13,clouds)*.30*smoothstep(.02,.32,d.y));float sun=max(0.,dot(d,L));sky+=uSunColor*(pow(sun,320.)*.7+pow(sun,24.)*.09);outColor=vec4(clamp(sky,0.,1.),1.);return;}
 float rough=clamp(uRough,.12,.98),metal=clamp(uSurface.x,0.,1.);vec3 albedo=pow(max(vColor,vec3(.001)),vec3(2.2));
 float coarse=noise(vW.xz*.11),fine=noise(vW.xz*1.6+vW.yy*.5);
 if(kind>1.5&&kind<2.5){albedo*=.83+coarse*.25+fine*.10;float strata=.91+.09*sin(vW.y*1.6+coarse*3.);albedo*=strata;rough=.94;}
 else if(kind>2.5&&kind<3.5){vec2 q=abs(fract(vW.xz*.125)-.5);float seam=max(smoothstep(.486,.499,q.x),smoothstep(.486,.499,q.y));albedo*=mix(.92+fine*.12,.50,seam);rough=.82;}
 else if(kind>3.5&&kind<4.5){N=normalize(N+vec3(sin(vW.x*.45+uTime*.55)*.11,0.,cos(vW.z*.39-uTime*.42)*.12));rough=.18;metal=.38;albedo*=.86+coarse*.18;}
 else{albedo*=.93+fine*.10;}
 vec3 H=normalize(L+V);float ndl=max(dot(N,L),0.),ndv=max(dot(N,V),0.);float shade=vW.y<6.5?coverShade(vW+N*.045,L):1.;
 vec3 hemi=mix(pow(uFog,vec3(2.2))*.35,pow(uHorizon,vec3(2.2))*.9,clamp(N.y*.5+.5,0.,1.));
 vec3 F0=mix(vec3(.045),albedo,metal);float spec=pow(max(dot(N,H),0.),mix(100.,7.,rough))*(1.-rough*.72)*ndl;
 vec3 col=albedo*(.19+hemi*.7)*(1.-uSurface.y*.45)+albedo*(1.-metal*.46)*uSunColor*ndl*shade*.82+F0*uSunColor*spec*shade*1.7;
 float fresnel=pow(1.-ndv,4.);col+=mix(vec3(.045),albedo,metal)*pow(uHorizon,vec3(2.2))*fresnel*(1.-rough)*.75;
 for(int i=0;i<4;i++){if(i>=uLightCount)break;vec3 ray=uLight[i].xyz-vW;float dist=length(ray),falloff=pow(max(0.,1.-dist/uLight[i].w),2.);col+=albedo*uLightColor[i].rgb*falloff*(.25+.75*max(0.,dot(N,normalize(ray))))*uLightColor[i].w;}
 col+=albedo*vEmissive*1.15;
 float dist=distance(uCam,vW),fog=smoothstep(uFogNear,uFogFar,dist);fog*=clamp(1.03-vW.y*.0015,.52,1.);col=mix(col,pow(uFog,vec3(2.2))*.75,clamp(fog,0.,.94));outColor=vec4(tone(col),uAlpha);
}`;
function compile(gl){
 const shaders=[];let program=null;
 try{for(const [type,source]of[[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,FS]]){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));}program=gl.createProgram();for(const s of shaders)gl.attachShader(program,s);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));return program;}
 catch(error){if(program)gl.deleteProgram(program);throw error;}
 finally{for(const s of shaders)gl.deleteShader(s);}
}
function install(engine){
 if(!engine||engine.mode!=='webgl2')return engine;
 const g=engine.gl,cache=new Map(),oldProgram=engine.program;
 // The shared cube VAO enables per-instance attributes before its first batch.
 // Even an uninstanced draw must have valid backing storage for enabled arrays.
 // Seed one inert record locally, including when the optional shader is rejected.
 // Leave capacity at zero so the existing batch path still sizes its own buffer.
 if(engine.instanceBuffer&&!engine.instanceCapacity){
  const inert=new Float32Array(20);inert[0]=inert[5]=inert[10]=inert[15]=1;
  g.bindBuffer(g.ARRAY_BUFFER,engine.instanceBuffer);g.bufferData(g.ARRAY_BUFFER,inert,g.DYNAMIC_DRAW);
 }
 let enhanced=false;
 try{const next=compile(g);engine.program=next;g.deleteProgram(oldProgram);enhanced=true;}catch{ /* Keep the proven shader if the graphics driver rejects the local tier. */ }
 engine.canvas?.setAttribute?.('data-aegis-materials',enhanced?'frontier':'basic');
 const loc=engine._loc={};for(const k of['uP','uV','uM','uColor','uSun','uFog','uCam','uEmissive','uRough','uFogNear','uFogFar','uInstanced','uSky','uHorizon','uSunColor','uTime','uAlpha','uSurface','uShadowCount','uContactCount','uLightCount','uShadow[0]','uShadowSize[0]','uContact[0]','uLight[0]','uLightColor[0]'])loc[k]=g.getUniformLocation(engine.program,k);
 const matrix=new Float32Array(16),baseBegin=engine.begin.bind(engine),baseDispose=engine.dispose.bind(engine);
 let lastMaterial='';
 const surface=m=>{m=m||{};const key=[m.metal??.18,m.ao??0,m.pattern??0,m.rough??.72,m.alpha??1].join('/');if(key===lastMaterial)return;lastMaterial=key;g.uniform3f(loc.uSurface,m.metal??.18,m.ao??0,m.pattern??0);g.uniform1f(loc.uRough,m.rough??.72);g.uniform1f(loc.uAlpha,m.alpha??1);};
 for(const method of['cube','cubeBatch','faceted']){const original=engine[method]?.bind(engine);if(original)engine[method]=(...args)=>{surface();return original(...args);};}
 const baseShadow=engine.shadow?.bind(engine);
 if(baseShadow)engine.shadow=(...args)=>{if(!enhanced||engine.batchEnabled===false||!engine.environmentFrame)return baseShadow(...args);};
 engine.begin=(eye,target)=>{
  baseBegin(eye,target);lastMaterial='';surface();const e=engine.environmentFrame||{};
  g.uniform3fv(loc.uSky,rgb(e.sky||'#183c59'));g.uniform3fv(loc.uHorizon,rgb(e.horizon||'#aec5cc'));g.uniform3fv(loc.uSunColor,rgb(e.sunColor||'#ffe3ba'));g.uniform1f(loc.uTime,e.calm?0:(e.time||0));
  const supported=engine.batchEnabled!==false,boxes=supported?(e.boxes||[]).slice(0,12):[],contacts=supported?(e.contacts||[]).slice(0,8):[],lights=(e.lights||[]).slice(0,4);
  g.uniform1i(loc.uShadowCount,boxes.length);g.uniform1i(loc.uContactCount,contacts.length);g.uniform1i(loc.uLightCount,lights.length);
  if(boxes.length){g.uniform4fv(loc['uShadow[0]'],new Float32Array(boxes.flatMap(b=>[b.x,b.h*.5,b.z,0])));g.uniform4fv(loc['uShadowSize[0]'],new Float32Array(boxes.flatMap(b=>[b.w*.5,b.h*.5,b.d*.5,0])));}
  if(contacts.length)g.uniform4fv(loc['uContact[0]'],new Float32Array(contacts.flatMap(q=>[q.x,q.z,q.radius,q.height])));
  if(lights.length){g.uniform4fv(loc['uLight[0]'],new Float32Array(lights.flatMap(q=>[q.x,q.y,q.z,q.radius])));g.uniform4fv(loc['uLightColor[0]'],new Float32Array(lights.flatMap(q=>[...rgb(q.color),q.power??1])));}
 };
 engine.mesh=(mesh,pose={},material={})=>{
  if(!enhanced&&(material.pattern===9||(material.alpha??1)<1))return false;
  let record=cache.get(mesh);
  if(!record){if(cache.size>=96)return false;const vao=g.createVertexArray(),buffer=g.createBuffer();if(!vao||!buffer){if(vao)g.deleteVertexArray(vao);if(buffer)g.deleteBuffer(buffer);return false;}
   g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,mesh.triangles,g.STATIC_DRAW);for(let i=0;i<2;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,24,i*12);}record={vao,buffer,count:mesh.triangles.length/6,bytes:mesh.triangles.byteLength};cache.set(mesh,record);
  }
  const r=rotation(pose),sx=pose.sx??1,sy=pose.sy??1,sz=pose.sz??1;matrix.set([r[0]*sx,r[1]*sx,r[2]*sx,0,r[3]*sy,r[4]*sy,r[5]*sy,0,r[6]*sz,r[7]*sz,r[8]*sz,0,pose.x||0,pose.y||0,pose.z||0,1]);
  surface(material);const c=rgb(material.color||'#ffffff');g.bindVertexArray(record.vao);g.uniform1i(loc.uInstanced,0);g.uniformMatrix4fv(loc.uM,false,matrix);g.uniform3fv(loc.uColor,c);g.uniform1f(loc.uEmissive,material.emissive||0);
  if((material.alpha??1)<1){g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);}
  g.drawArrays(g.TRIANGLES,0,record.count);
  if((material.alpha??1)<1){g.depthMask(true);g.disable(g.BLEND);}
  g.bindVertexArray(engine.vao);engine.calls++;return true;
 };
 engine.environmentStats=()=>({enhanced,meshes:cache.size,bytes:[...cache.values()].reduce((n,r)=>n+r.bytes,0)});
 engine.dispose=()=>{for(const r of cache.values()){g.deleteBuffer(r.buffer);g.deleteVertexArray(r.vao);}cache.clear();baseDispose();};
 return engine;
}
const api=Object.freeze({geometry,merge,lathe,torus,sphere,bevel,arch,point,normal,rotation,install,VS,FS});
root.AegisEnvironmentMesh=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
