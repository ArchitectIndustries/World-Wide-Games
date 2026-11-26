/* Aegis Verge: original cover geometry and deterministic navigation.
 * Architect Industries. No third-party code or assets.
 * Collision and rendering consume the same immutable cover records.
 */
(function (root) {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const layouts = [
    [[-9,-17,7,3,3.2],[10,-17,6,3,3],[-13,2,3,9,4.2],[12,5,3,8,3.4],[-7,19,6,3,3.3],[25,15,5,4,4],[0,-4,6,3,2.8],[-27,18,4,5,3.7]],
    [[-8,-17,3,8,3.5],[9,-9,7,3,3.1],[-12,10,3,9,4],[23,2,4,7,3.4],[0,10,6,3,3],[20,26,7,3,4],[-28,-12,4,6,3.7],[5,-24,5,3,3]],
    [[-9,-20,3,9,4.2],[11,-17,5,3,3.2],[-10,3,7,3,3.4],[12,2,3,8,4.3],[0,16,7,3,3.2],[27,11,4,7,4],[-28,-3,4,7,3.6],[-5,29,7,3,3]]
  ];
  function coverFor(op) {
    return (layouts[op] || layouts[0]).map((r, id) => Object.freeze({id,x:r[0],z:r[1],w:r[2],d:r[3],h:r[4]}));
  }
  function inside(x,z,b,r=0) {
    return x>=b.x-b.w/2-r && x<=b.x+b.w/2+r && z>=b.z-b.d/2-r && z<=b.z+b.d/2+r;
  }
  function free(x,z,blocks,r=.9) {
    return Math.abs(x)<=38-r && Math.abs(z)<=38-r && !blocks.some(b=>inside(x,z,b,r));
  }
  // Swept segment / expanded AABB. Returns the first normalized impact time.
  function segmentBox(ax,az,bx,bz,b,r=0) {
    let enter=0, exit=1;
    for (const [a,d,min,max] of [[ax,bx-ax,b.x-b.w/2-r,b.x+b.w/2+r],[az,bz-az,b.z-b.d/2-r,b.z+b.d/2+r]]) {
      if (Math.abs(d)<1e-9) { if(a<min||a>max)return null; continue; }
      let t0=(min-a)/d,t1=(max-a)/d;
      if(t0>t1)[t0,t1]=[t1,t0];
      enter=Math.max(enter,t0);exit=Math.min(exit,t1);
      if(enter>exit)return null;
    }
    return enter>=0 && enter<=1 ? enter : null;
  }
  function firstCover(ax,az,bx,bz,blocks,r=0) {
    let hit=null;
    for(const b of blocks){const t=segmentBox(ax,az,bx,bz,b,r);if(t!==null&&(!hit||t<hit.t))hit={t,block:b,x:ax+(bx-ax)*t,z:az+(bz-az)*t};}
    return hit;
  }
  function segmentCircle(ax,az,bx,bz,x,z,r) {
    const dx=bx-ax,dz=bz-az,ox=ax-x,oz=az-z,A=dx*dx+dz*dz,C=ox*ox+oz*oz-r*r;
    if(C<=0)return 0;if(A<1e-12)return null;
    const B=2*(ox*dx+oz*dz),D=B*B-4*A*C;
    if(D<0)return null;
    const t=(-B-Math.sqrt(D))/(2*A);return t>=0&&t<=1?t:null;
  }
  function move(body,dx,dz,blocks,r=.9) {
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.35));let blocked=false;
    for(let i=0;i<steps;i++) {
      const x=clamp(body.x+dx/steps,-38+r,38-r),z=clamp(body.z+dz/steps,-38+r,38-r);
      if(free(x,body.z,blocks,r))body.x=x;else blocked=true;
      if(free(body.x,z,blocks,r))body.z=z;else blocked=true;
    }
    return blocked;
  }
  function nearestFree(x,z,blocks,r=.9) {
    x=clamp(x,-36,36);z=clamp(z,-36,36);
    if(free(x,z,blocks,r))return{x,z};
    for(let d=1;d<=20;d++)for(let i=0;i<16;i++) {
      const a=i*Math.PI/8,nx=x+Math.sin(a)*d,nz=z+Math.cos(a)*d;
      if(free(nx,nz,blocks,r))return{x:nx,z:nz};
    }
    return{x:0,z:-27};
  }
  // Four-neighbor A*: no diagonal corner clipping, deterministic tie ordering.
  // Small 37x37 field, replanned at most twice a second per hostile.
  function path(ax,az,bx,bz,blocks,r=1) {
    const N=37,step=2,coord=i=>i*step-36,key=(x,z)=>z*N+x;
    const snap=(x,z)=>{
      let best=null,dist=Infinity;
      for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++) {
        const wx=coord(ix),wz=coord(iz),d=(wx-x)**2+(wz-z)**2;
        if(d<dist&&free(wx,wz,blocks,r)){best={x:ix,z:iz};dist=d;}
      }return best;
    };
    const a=snap(ax,az),b=snap(bx,bz);if(!a||!b)return[];
    const start=key(a.x,a.z),goal=key(b.x,b.z),g=new Float64Array(N*N).fill(Infinity),came=new Int32Array(N*N).fill(-1),closed=new Uint8Array(N*N);
    const h=i=>Math.abs(i%N-b.x)+Math.abs(Math.floor(i/N)-b.z);const open=[start];g[start]=0;
    while(open.length) {
      let at=0;for(let j=1;j<open.length;j++)if(g[open[j]]+h(open[j])<g[open[at]]+h(open[at]))at=j;
      const cur=open.splice(at,1)[0];if(closed[cur])continue;closed[cur]=1;
      if(cur===goal){const result=[];for(let k=cur;k!==start;k=came[k]){if(k<0)return[];result.unshift({x:coord(k%N),z:coord(Math.floor(k/N))});}return result;}
      const cx=cur%N,cz=Math.floor(cur/N);
      for(const [dx,dz] of [[1,0],[0,1],[-1,0],[0,-1]]) {
        const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=N||nz>=N)continue;
        const nk=key(nx,nz);if(closed[nk]||!free(coord(nx),coord(nz),blocks,r))continue;
        if(firstCover(coord(cx),coord(cz),coord(nx),coord(nz),blocks,r))continue;
        const cost=g[cur]+1;if(cost<g[nk]){g[nk]=cost;came[nk]=cur;open.push(nk);}
      }
    }
    return[];
  }
  const api={coverFor,inside,free,segmentBox,firstCover,segmentCircle,move,nearestFree,path};
  root.AegisTactics=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
