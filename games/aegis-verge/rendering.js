/* Aegis Verge's local, dependency-free low-tier polygon renderer.
 * Same world geometry, camera and collision data as WebGL2. This is real-time
 * CPU rasterization, not a video, image sequence or remote streamed session.
 * Painter ordering is deliberately limited to this small convex-mesh arena.
 */
(function(root){
'use strict';
function install(engine){
 if(!engine||engine.mode!=='canvas2d')return engine;
 // Hoist immutable topology and frame-invariant camera/fog coefficients.
 const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
 const cubeFaces=[[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[3,7,6,2],[0,1,0]],[[0,1,5,4],[0,-1,0]]];
 let faces=[],eye={},cy=1,syaw=0,cp=1,sp=0,f=1,w=1,h=1,fog=[];
 const ctx=engine.ctx,near=.18;
 const rgb=c=>{let s=String(c||'#fff').replace('#','');if(s.length===3)s=s.split('').map(k=>k+k).join('');const n=parseInt(s,16);return[(n>>16)&255,(n>>8)&255,n&255];};
 const view=p=>{const dx=p[0]-eye.x,dy=p[1]-eye.y,dz=p[2]-eye.z,rx=dx*cy-dz*syaw,rz=dx*syaw+dz*cy;return{x:rx,y:dy*cp-rz*sp,z:dy*sp+rz*cp};};
 const clip=poly=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=a.z>=near,bb=b.z>=near;if(aa)out.push(a);if(aa!==bb){const t=(near-a.z)/(b.z-a.z);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:near});}}return out;};
 engine.begin=(e,target)=>{
  engine.resize();w=engine.canvas.width;h=engine.canvas.height;eye={...e};engine.cam={...e};
  const yaw=Math.atan2(target.x-e.x,target.z-e.z),pitch=Math.atan2(target.y-e.y,Math.hypot(target.x-e.x,target.z-e.z));cy=Math.cos(yaw);syaw=Math.sin(yaw);cp=Math.cos(pitch);sp=Math.sin(pitch);fog=engine.fog.map(v=>v*255);f=h*.5/Math.tan(engine.fov/2);faces=[];engine.calls=0;
  const c=fog.map(Math.round),sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,`rgb(${c[0]+16},${c[1]+24},${c[2]+36})`);sky.addColorStop(.6,`rgb(${c[0]},${c[1]},${c[2]})`);sky.addColorStop(1,'#02050b');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 };
 const meshCache=new Map();
 engine.cube=(x,y,z,sx,sy,sz,color='#fff',angle=0,em=0,shape=null,ground=false)=>{
  const dx=x-eye.x,dz=z-eye.z;if(dx*dx+dz*dz>engine.far*engine.far && sx<50)return;
  const co=Math.cos(angle),si=Math.sin(angle),pts=[];
  for(const [a,b,c] of corners)pts.push([x+a*sx*.5*co+c*sz*.5*si,y+b*sy*.5,z-a*sx*.5*si+c*sz*.5*co]);
  const col=rgb(color);let defs=cubeFaces;
  if(shape){const key=[shape,sx,sy,sz].join(':');let mesh=meshCache.get(key);if(!mesh&&meshCache.size<32){mesh=root.AegisFacetedMesh.geometry(shape,sx,sy,sz);meshCache.set(key,mesh);}if(mesh){pts.length=0;for(const [a,b,c] of mesh.vertices)pts.push([x+a*co+c*si,y+b,z-a*si+c*co]);defs=mesh.faces.map(f=>[f.ix,f.n]);}}
  // Each visible vertex is transformed once per object; clipped points are
  // still generated per face, so the existing near-plane and painter semantics hold.
  const projected=new Array(pts.length);
  const amount=Math.min(.92,Math.max(0,(Math.hypot(dx,dz)-engine.fogNear)/(engine.fogFar-engine.fogNear)));
  for(const [ix,n] of defs){const normal=[n[0]*co+n[2]*si,n[1],-n[0]*si+n[2]*co],p=pts[ix[0]];
   if(normal[0]*(eye.x-p[0])+normal[1]*(eye.y-p[1])+normal[2]*(eye.z-p[2])<=0)continue;
   let poly=clip(ix.map(i=>projected[i]||(projected[i]=view(pts[i]))));if(poly.length<3)continue;
   const depth=poly.reduce((a,p)=>a+p.z,0)/poly.length;
   const light=Math.min(1.55,.34+Math.max(0,normal[0]*-.36+normal[1]*.85+normal[2]*-.3)*.65+em*.65);
   const fill=col.map((v,i)=>Math.round(Math.min(255,v*light)*(1-amount)+fog[i]*amount));
   const screen=poly.map(p=>[w*.5+p.x/p.z*f,h*.5-p.y/p.z*f]);
   if(screen.every(p=>p[0]<0)||screen.every(p=>p[0]>w)||screen.every(p=>p[1]<0)||screen.every(p=>p[1]>h))continue;
   faces.push({screen,depth,ground,fill:`rgb(${fill.join(',')})`});
  }engine.calls++;
 };
 engine.faceted=(shape,...args)=>engine.cube(...args,shape);
 engine.meshStats=()=>({entries:meshCache.size,bytes:[...meshCache.values()].reduce((n,r)=>n+r.triangles.byteLength,0)});
 engine.cubeBatch=list=>{for(const q of list)engine.cube(q.x,q.y,q.z,q.sx,q.sy,q.sz,q.color,q.yaw,q.em,null,q.ground===true);};
 engine.shadow=(x,y,z,sx,sz,angle)=>engine.cube(x,y,z,sx,.025,sz,'#03060c',angle,0);
 engine.end=()=>{faces.sort((a,b)=>Number(b.ground)-Number(a.ground)||b.depth-a.depth);for(const face of faces){ctx.beginPath();face.screen.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=face.fill;ctx.fill();}engine.softwareFaces=faces.length;};
 return engine;
}
root.AegisRender={install};
})(window);
