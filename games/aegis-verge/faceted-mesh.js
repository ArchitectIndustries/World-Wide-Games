/* Original Aegis convex hard-surface mesh pipeline, MIT. No gameplay authority. */
(function(root){
'use strict';
const profiles=Object.freeze({hull:[.12,.28,.75],canopy:[.15,.18,.63],runner:[.20,.16,.84],relay:[.23,.23,.52]});
function geometry(shape,w,h,d){
 const p=profiles[shape];if(!p||![w,h,d].every(x=>Number.isFinite(x)&&x>0))throw new Error('Invalid mesh');
 const [rear,front,roof]=p;
 // Convex octagon in XZ, then inset roof. CCW viewed from below.
 const ring=[[-.5+rear,-.5],[.5-rear,-.5],[.5,-.5+rear],[.5,.5-front],[.5-front,.5],[-.5+front,.5],[-.5,.5-front],[-.5,-.5+rear]];
 // Relay crystals have a broad equator and two tapered ends; closed,
 // convex, flat-shaded faces use the same renderer and bounded cache.
 const rings=shape==='relay'?[[-.5,roof],[0,1],[.5,roof]]:[[-.5,1],[.5,roof]];
 const vertices=rings.flatMap(([y,scale])=>ring.map(([x,z])=>[x*w*scale,y*h,z*d*scale]));
 const indices=[Array.from({length:8},(_,i)=>i),Array.from({length:8},(_,i)=>vertices.length-1-i)];
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<8;i++){const j=(i+1)%8,a=k*8;indices.push([a+i,a+i+8,a+j+8,a+j]);}
 const faces=indices.map(ix=>{const a=vertices[ix[0]],b=vertices[ix[1]],c=vertices[ix[2]],u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);return {ix,n:n.map(v=>v/l)};});
 const floats=[];for(const {ix,n} of faces)for(let i=1;i<ix.length-1;i++)for(const j of [ix[0],ix[i],ix[i+1]])floats.push(...vertices[j],...n);
 return {vertices,faces,triangles:new Float32Array(floats)};
}
function install(engine){
 if(!engine||engine.mode!=='webgl2')return;
 const g=engine.gl,cache=new Map(),dispose=engine.dispose.bind(engine),matrix=new Float32Array(16);
 function clear(){for(const r of cache.values()){g.deleteBuffer(r.buffer);g.deleteVertexArray(r.vao);}cache.clear();}
 engine.dispose=()=>{clear();dispose();};
 engine.meshStats=()=>({entries:cache.size,bytes:[...cache.values()].reduce((n,r)=>n+r.bytes,0)});
 engine.faceted=(shape,x,y,z,w,h,d,color,yaw=0,em=0)=>{
  const key=[shape,w,h,d].join(':');let r=cache.get(key);
  if(!r){if(cache.size>=32){engine.cube(x,y,z,w,h,d,color,yaw,em);return;}
   const data=geometry(shape,w,h,d).triangles,vao=g.createVertexArray(),buffer=g.createBuffer();
   if(!vao||!buffer){if(vao)g.deleteVertexArray(vao);if(buffer)g.deleteBuffer(buffer);engine.cube(x,y,z,w,h,d,color,yaw,em);return;}
   g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,data,g.STATIC_DRAW);
   for(let i=0;i<2;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,24,i*12);}
   r={vao,buffer,count:data.length/6,bytes:data.byteLength};cache.set(key,r);
  }
  const c=Math.cos(yaw),s=Math.sin(yaw);matrix.set([c,0,-s,0,0,1,0,0,s,0,c,0,x,y,z,1]);
  const n=parseInt(color.slice(1),16),u=engine._loc;
  g.bindVertexArray(r.vao);g.uniform1i(u.uInstanced,0);g.uniformMatrix4fv(u.uM,false,matrix);g.uniform3f(u.uColor,(n>>16&255)/255,(n>>8&255)/255,(n&255)/255);g.uniform1f(u.uEmissive,em);g.drawArrays(g.TRIANGLES,0,r.count);g.bindVertexArray(engine.vao);engine.calls++;
 };
}
const api={geometry,install};root.AegisFacetedMesh=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
