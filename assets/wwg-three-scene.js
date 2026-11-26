/* WorldWideGames scene renderer, original Architect Industries implementation.
 * Three.js r187 is vendored under its MIT license. The CPU tier projects the
 * same scene geometry; it does not claim hardware PBR, shadow maps or WebGPU.
 */
import * as THREE from './vendor/three-r187/three.module.js';
export {THREE};

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const linearTable=Array.from({length:256},(_,i)=>{const v=i/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
const srgb=v=>Math.round(255*clamp(v<=.0031308?v*12.92:1.055*Math.pow(Math.max(0,v),1/2.4)-.055));
const filmic=x=>clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14));
const colorArray=color=>[color?.r??1,color?.g??1,color?.b??1];
const sampleCache=new WeakMap();

/** A deterministic near-plane clip, shared by the renderer's focused tests. */
export function clipNear(vertices,near){
  const result=[];
  for(let i=0;i<vertices.length;i++){
    const a=vertices[i],b=vertices[(i+1)%vertices.length],insideA=a.z<=-near,insideB=b.z<=-near;
    if(insideA)result.push(a);
    if(insideA!==insideB){const t=(-near-a.z)/(b.z-a.z);result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:-near});}
  }
  return result;
}

function textureSample(texture,u,v){
  const image=texture?.image;
  if(!image||!(image.width||image.videoWidth)||image.complete===false)return null;
  let sample=sampleCache.get(image);
  if(sample===undefined){
    try{
      const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,64,64);
      sample=ctx.getImageData(0,0,64,64).data;
    }catch{sample=null;}
    sampleCache.set(image,sample);
  }
  if(!sample)return null;
  u=u*(texture.repeat?.x??1)+(texture.offset?.x??0);
  v=v*(texture.repeat?.y??1)+(texture.offset?.y??0);
  const wrap=(value,mode)=>mode===THREE.RepeatWrapping?((value%1)+1)%1:clamp(value,0,.9999);
  u=wrap(u,texture.wrapS);v=wrap(v,texture.wrapT);if(texture.flipY)v=1-v;
  const i=(Math.min(63,Math.floor(v*64))*64+Math.min(63,Math.floor(u*64)))*4;
  return[linearTable[sample[i]],linearTable[sample[i+1]],linearTable[sample[i+2]],sample[i+3]/255];
}

class SoftwareSceneRenderer{
  constructor(canvas,options={}){
    this.domElement=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    if(!this.ctx)throw new Error('This browser cannot create a canvas renderer.');
    this.mode='software';this.quality='low';this.pixelRatio=1;this.width=1;this.height=1;
    this.info={render:{calls:0,triangles:0,lines:0},memory:{geometries:0,textures:0}};
    this.shadowMap={enabled:false};this.toneMappingExposure=1.05;
    this.maxTriangles=options.maxTriangles||18000;this.disposed=false;
    this.view=new THREE.Matrix4();this.vp=new THREE.Matrix4();this.mv=new THREE.Matrix4();
    this.instance=new THREE.Matrix4();this.world=new THREE.Matrix4();this.normal=new THREE.Matrix3();
    this.frustum=new THREE.Frustum();this.sphere=new THREE.Sphere();this.pos=new THREE.Vector3();
    this.a=new THREE.Vector3();this.b=new THREE.Vector3();this.c=new THREE.Vector3();
    this.na=new THREE.Vector3();this.nb=new THREE.Vector3();this.nn=new THREE.Vector3();
    this.polygons=[];this.lines=[];this.lights=[];this.ambient=[.18,.20,.23];
  }
  setPixelRatio(ratio){this.pixelRatio=clamp(Number(ratio)||1,.5,1);this.setSize(this.width,this.height,false);}
  getPixelRatio(){return this.pixelRatio;}
  setSize(width,height,updateStyle=true){
    this.width=Math.max(1,Math.floor(width));this.height=Math.max(1,Math.floor(height));
    const scale=Math.min(this.pixelRatio,1100/this.width,760/this.height);
    const w=Math.max(1,Math.round(this.width*scale)),h=Math.max(1,Math.round(this.height*scale));
    if(this.domElement.width!==w)this.domElement.width=w;if(this.domElement.height!==h)this.domElement.height=h;
    if(updateStyle&&this.domElement.style){this.domElement.style.width=this.width+'px';this.domElement.style.height=this.height+'px';}
  }
  getSize(target=new THREE.Vector2()){return target.set(this.width,this.height);}
  setClearColor(value){this.clearColor=new THREE.Color(value);}
  compile(){}
  dispose(){this.disposed=true;this.polygons.length=0;this.lines.length=0;}
  render(scene,camera){
    if(this.disposed)return;
    scene.updateMatrixWorld();camera.updateMatrixWorld();
    this.view.copy(camera.matrixWorldInverse);this.vp.multiplyMatrices(camera.projectionMatrix,this.view);
    this.frustum.setFromProjectionMatrix(this.vp);this.near=Math.max(.03,camera.near||.1);this.camera=camera;
    this.projection=camera.projectionMatrix.elements;this.w=this.domElement.width;this.h=this.domElement.height;
    this.polygons.length=0;this.lines.length=0;this.lights.length=0;
    this.info.render.calls=0;this.info.render.triangles=0;this.info.render.lines=0;
    const bg=scene.background?.isColor?scene.background:this.clearColor||new THREE.Color('#17373f');
    this.background=colorArray(bg);this.fog=scene.fog;
    this.ambient=[.14,.16,.19];this.hemi=null;
    scene.traverseVisible(obj=>{
      if(obj.isAmbientLight){for(let i=0;i<3;i++)this.ambient[i]+=colorArray(obj.color)[i]*obj.intensity*.45;}
      if(obj.isHemisphereLight)this.hemi={sky:colorArray(obj.color),ground:colorArray(obj.groundColor),intensity:obj.intensity*.45};
      if(obj.isDirectionalLight&&this.lights.length<3){
        const at=new THREE.Vector3();obj.getWorldPosition(at);const target=new THREE.Vector3();obj.target.getWorldPosition(target);
        this.lights.push({direction:at.sub(target).normalize(),color:colorArray(obj.color),intensity:obj.intensity*.55});
      }
    });
    const ctx=this.ctx,sky=ctx.createLinearGradient(0,0,0,this.h);
    const css=(color,m=1)=>`rgb(${color.map(v=>srgb(v*m)).join(',')})`;
    sky.addColorStop(0,css(this.background,.72));sky.addColorStop(.62,css(this.background,1.25));sky.addColorStop(1,css(this.background,.68));
    ctx.globalAlpha=1;ctx.fillStyle=sky;ctx.fillRect(0,0,this.w,this.h);
    scene.traverseVisible(obj=>{
      if(obj.userData?.softwareHidden)return;
      if(obj.isMesh){
        if(obj.isInstancedMesh){
          for(let i=0;i<obj.count;i++){
            obj.getMatrixAt(i,this.instance);this.world.multiplyMatrices(obj.matrixWorld,this.instance);
            let tint=null;if(obj.instanceColor){const a=obj.instanceColor.array;tint=[a[i*3],a[i*3+1],a[i*3+2]];}
            this.addMesh(obj,this.world,tint);
          }
        }else this.addMesh(obj,obj.matrixWorld,null);
      }else if(obj.isLine)this.addLine(obj);
    });
    this.polygons.sort((a,b)=>a.order-b.order||b.depth-a.depth);
    for(const tri of this.polygons){
      ctx.globalAlpha=tri.alpha;ctx.fillStyle=tri.color;
      ctx.beginPath();ctx.moveTo(tri.x0,tri.y0);ctx.lineTo(tri.x1,tri.y1);ctx.lineTo(tri.x2,tri.y2);ctx.closePath();ctx.fill();
      // Cover subpixel cracks between adjoining opaque faces without outlining them.
      if(tri.alpha>=.99){ctx.strokeStyle=tri.color;ctx.lineWidth=.45;ctx.stroke();}
    }
    ctx.globalAlpha=1;
    for(const line of this.lines){ctx.globalAlpha=line.alpha;ctx.strokeStyle=line.color;ctx.lineWidth=line.width;ctx.beginPath();ctx.moveTo(line.x0,line.y0);ctx.lineTo(line.x1,line.y1);ctx.stroke();}
    ctx.globalAlpha=1;this.info.render.triangles=this.polygons.length;this.info.render.lines=this.lines.length;
  }
  project(v){
    const p=this.projection,w=p[3]*v.x+p[7]*v.y+p[11]*v.z+p[15];
    if(w<=0)return null;
    return{x:((p[0]*v.x+p[4]*v.y+p[8]*v.z+p[12])/w*.5+.5)*this.w,y:(.5-(p[1]*v.x+p[5]*v.y+p[9]*v.z+p[13])/w*.5)*this.h};
  }
  addMesh(obj,matrix,tint){
    const geo=obj.geometry,position=geo?.attributes?.position;if(!position||this.polygons.length>=this.maxTriangles)return;
    if(!geo.boundingSphere)geo.computeBoundingSphere();this.sphere.copy(geo.boundingSphere).applyMatrix4(matrix);
    if(obj.frustumCulled!==false&&!this.frustum.intersectsSphere(this.sphere))return;
    this.mv.multiplyMatrices(this.view,matrix);this.normal.getNormalMatrix(matrix);
    const index=geo.index?.array,pa=position.array,uv=geo.attributes.uv?.array,colors=geo.attributes.color?.array,normals=geo.attributes.normal?.array;
    const count=Math.min(index?.length??position.count,(geo.drawRange.count===Infinity?Infinity:geo.drawRange.start+geo.drawRange.count));
    const start=geo.drawRange.start||0,groups=geo.groups,materials=Array.isArray(obj.material)?obj.material:[obj.material];
    for(let i=start;i+2<count;i+=3){
      if(this.polygons.length>=this.maxTriangles)break;
      const group=materials.length>1?groups.find(g=>i>=g.start&&i<g.start+g.count):null;
      const mat=materials[group?.materialIndex||0];if(!mat||mat.visible===false||(mat.opacity??1)<=0)continue;
      const ia=index?index[i]:i,ib=index?index[i+1]:i+1,ic=index?index[i+2]:i+2;
      this.a.fromArray(pa,ia*3);this.b.fromArray(pa,ib*3);this.c.fromArray(pa,ic*3);
      if(normals&&!mat.flatShading)this.nn.set(normals[ia*3]+normals[ib*3]+normals[ic*3],normals[ia*3+1]+normals[ib*3+1]+normals[ic*3+1],normals[ia*3+2]+normals[ib*3+2]+normals[ic*3+2]);
      else this.nn.crossVectors(this.na.subVectors(this.b,this.a),this.nb.subVectors(this.c,this.a));
      this.nn.applyMatrix3(this.normal).normalize();
      this.a.applyMatrix4(this.mv);this.b.applyMatrix4(this.mv);this.c.applyMatrix4(this.mv);
      if(this.a.z>-this.near&&this.b.z>-this.near&&this.c.z>-this.near)continue;
      const depth=-(this.a.z+this.b.z+this.c.z)/3;
      let verts=[{x:this.a.x,y:this.a.y,z:this.a.z},{x:this.b.x,y:this.b.y,z:this.b.z},{x:this.c.x,y:this.c.y,z:this.c.z}];
      if(verts.some(v=>v.z>-this.near))verts=clipNear(verts,this.near);
      if(verts.length<3)continue;
      const base=colorArray(mat.color);if(tint)for(let k=0;k<3;k++)base[k]*=tint[k];
      if(mat.vertexColors&&colors)for(let k=0;k<3;k++)base[k]*=(colors[ia*3+k]+colors[ib*3+k]+colors[ic*3+k])/3;
      let alpha=mat.transparent?(mat.opacity??1):1;
      if(mat.map&&uv){
        const sample=textureSample(mat.map,(uv[ia*2]+uv[ib*2]+uv[ic*2])/3,(uv[ia*2+1]+uv[ib*2+1]+uv[ic*2+1])/3);
        if(sample){for(let k=0;k<3;k++)base[k]*=sample[k];alpha*=sample[3];}
      }
      if(alpha<(mat.alphaTest||.002))continue;
      const emission=colorArray(mat.emissive||{r:0,g:0,b:0});let lit=base.slice();
      if(!mat.isMeshBasicMaterial){
        const illumination=this.ambient.slice(),ny=clamp(this.nn.y*.5+.5);
        if(this.hemi)for(let k=0;k<3;k++)illumination[k]+=(this.hemi.ground[k]*(1-ny)+this.hemi.sky[k]*ny)*this.hemi.intensity;
        for(const light of this.lights){const dot=Math.max(0,this.nn.dot(light.direction));for(let k=0;k<3;k++)illumination[k]+=dot*light.intensity*light.color[k];}
        lit=base.map((v,k)=>v*illumination[k]);
      }
      lit=lit.map((v,k)=>v+emission[k]*(mat.emissiveIntensity??1));
      if(this.fog&&mat.fog!==false){
        const f=this.fog.isFogExp2?1-Math.exp(-Math.pow(depth*this.fog.density,2)):clamp((depth-this.fog.near)/(this.fog.far-this.fog.near));
        const fc=colorArray(this.fog.color);lit=lit.map((v,k)=>v*(1-f)+fc[k]*f);
      }
      const color=`rgb(${lit.map(v=>srgb(mat.toneMapped===false?clamp(v):filmic(v*this.toneMappingExposure))).join(',')})`;
      const projected=verts.map(v=>this.project(v));
      for(let fan=1;fan+1<projected.length;fan++){
        const a=projected[0],b=projected[fan],c=projected[fan+1];if(!a||!b||!c)continue;
        if([a,b,c].every(p=>p.x<0)||[a,b,c].every(p=>p.x>this.w)||[a,b,c].every(p=>p.y<0)||[a,b,c].every(p=>p.y>this.h))continue;
        const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
        if(Math.abs(area)<.08||(mat.side===THREE.FrontSide&&area>=0)||(mat.side===THREE.BackSide&&area<=0))continue;
        this.polygons.push({x0:a.x,y0:a.y,x1:b.x,y1:b.y,x2:c.x,y2:c.y,depth,color,alpha,order:obj.renderOrder||0});
      }
    }
    this.info.render.calls++;
  }
  addLine(obj){
    const pos=obj.geometry?.attributes?.position,mat=obj.material;if(!pos||!mat||mat.visible===false)return;
    const a=new THREE.Vector3(),b=new THREE.Vector3(),matrix=new THREE.Matrix4().multiplyMatrices(this.view,obj.matrixWorld);
    const step=obj.isLineSegments?2:1;
    for(let i=0;i+1<pos.count;i+=step){
      a.fromBufferAttribute(pos,i).applyMatrix4(matrix);b.fromBufferAttribute(pos,i+1).applyMatrix4(matrix);
      if(a.z>-this.near||b.z>-this.near)continue;
      const p=this.project(a),q=this.project(b);if(!p||!q)continue;
      this.lines.push({x0:p.x,y0:p.y,x1:q.x,y1:q.y,color:'#'+mat.color.getHexString(),alpha:mat.opacity??1,width:Math.max(.5,mat.linewidth||1)});
    }
  }
}

/** Prefer local WebGL2 PBR; retain a genuine, lit 3D mesh path without a GPU. */
export function createRenderer(canvas,options={}){
  let gl=null;
  if(!options.forceSoftware){try{gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});}catch{}}
  if(gl){
    try{
      const renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,alpha:false});
      renderer.mode='webgl2';renderer.quality='high';renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));
      return renderer;
    }catch(error){
      // A canvas cannot acquire a 2D context after acquiring WebGL. Replace only
      // this failed rendering surface, and expose the active element to callers.
      const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;
      canvas.dataset.rendererRecovery=String(error?.message||'WebGL initialization failed');
    }
  }
  return new SoftwareSceneRenderer(canvas,options);
}

/** A local atmospheric light probe, with no image CDN or external fetch. */
export function createSkyEnvironment(renderer,scene){
  if(renderer.mode!=='webgl2')return null;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
  gradient.addColorStop(0,'#7aaebc');gradient.addColorStop(.44,'#b7d5cf');gradient.addColorStop(.51,'#eddbb4');gradient.addColorStop(.58,'#536c58');gradient.addColorStop(1,'#172e29');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  const sun=ctx.createRadialGradient(352,95,1,352,95,52);sun.addColorStop(0,'rgba(255,249,220,1)');sun.addColorStop(.14,'rgba(255,239,199,.85)');sun.addColorStop(1,'rgba(255,239,199,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,512,256);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromEquirectangular(texture);scene.environment=target.texture;
  pmrem.dispose();texture.dispose();return target;
}

/** Self-hosted, checksum-recorded CC0 Poly Haven maps. No runtime provider API. */
export function loadSurfaceMaterial(kind,options={}){
  if(kind!=='forest'&&kind!=='rock')throw new Error('Unknown surface material: '+kind);
  const {repeat=4,normalScale=.65,...params}=options;
  const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0,...params});
  const loader=new THREE.TextureLoader();
  for(const [property,suffix,color] of [['map','color',true],['normalMap','normal',false],['roughnessMap','roughness',false]]){
    const url=new URL('./materials/'+kind+'-'+suffix+'.jpg',import.meta.url).href;
    const map=loader.load(url,()=>{material.needsUpdate=true;},undefined,()=>{material[property]=null;material.userData.surfaceFallback=true;material.needsUpdate=true;});
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(Array.isArray(repeat)?repeat[0]:repeat,Array.isArray(repeat)?repeat[1]:repeat);map.anisotropy=4;
    if(color)map.colorSpace=THREE.SRGBColorSpace;material[property]=map;
  }
  material.normalScale.set(normalScale,normalScale);return material;
}
