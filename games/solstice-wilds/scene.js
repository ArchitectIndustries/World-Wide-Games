/* Original Solstice Wilds geometry and scene direction. No remote assets. */
import {THREE,createRenderer,createSkyEnvironment,loadSurfaceMaterial} from '../../assets/wwg-three-scene.js';
import {SITES,PILLARS,TABLET,TIDEWORKS,BRIDGE_HALF_WIDTH,OBSTACLES,TREES,RUNES,terrainHeight,weatherAt,random} from './model.js';

const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const palette={stone:'#b8c2ad',darkStone:'#668b81',wood:'#947453',gold:'#dfbd73',mint:'#a2eccf',forest:'#91ad77',sea:'#467f8c'};
const materials=new Set(),geometries=new Set();
const geo=g=>(geometries.add(g),g);
function material(color,opts={}) {const m=new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:true,...opts});materials.add(m);return m;}
function basic(color,opts={}) {const m=new THREE.MeshBasicMaterial({color,...opts});materials.add(m);return m;}
function mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function group(parent,x=0,y=0,z=0){const o=new THREE.Group();o.position.set(x,y,z);parent.add(o);return o;}
function tapered(w,h,d,taper=.72){
  const p=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*taper/2,h,-d*taper/2,w*taper/2,h,-d*taper/2,w*taper/2,h,d*taper/2,-w*taper/2,h,d*taper/2];
  const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);g.computeVertexNormals();return g;
}
function archGeometry(radius,thickness,depth,segments=9){
  const v=[],indices=[];
  for(let i=0;i<=segments;i++){const a=i/segments*Math.PI;for(const z of [-depth/2,depth/2])for(const r of [radius-thickness,radius])v.push(Math.cos(a)*r,Math.sin(a)*r,z);}
  for(let i=0;i<segments;i++){const a=i*4,b=(i+1)*4;indices.push(a,a+1,b+1,a,b+1,b,a+2,b+3,a+3,a+2,b+2,b+3,a,b,a+2,a+2,b,b+2,a+1,a+3,b+1,a+3,b+3,b+1);}
  indices.push(0,2,1,1,2,3);const q=segments*4;indices.push(q,q+1,q+2,q+1,q+3,q+2);
  const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function cylinder(top,bottom,height,segments=6){return geo(new THREE.CylinderGeometry(top,bottom,height,segments));}
function oceanGeometry(low){
  if(!low){const g=geo(new THREE.PlaneGeometry(220,220,18,18));g.rotateX(-Math.PI/2);return g;}
  // The island hides this interior water in a depth buffer. Omit those hidden
  // faces in the painter-sorted CPU tier so a long sea triangle cannot cover
  // an inland path or the explorer. The river has its own separate surface.
  const vertices=[],indices=[];
  for(const [x0,x1,z0,z1] of [[-110,-50,-110,110],[50,110,-110,110],[-50,50,-110,-50],[-50,50,50,110]]){
    const nx=Math.ceil((x1-x0)/20),nz=Math.ceil((z1-z0)/20),offset=vertices.length/3;
    for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++)vertices.push(x0+(x1-x0)*x/nx,0,z0+(z1-z0)*z/nz);
    for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){
      const a=offset+z*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);
    }
  }
  const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function makeTerrain(low,groundMat){
  const n=low?26:48,g=geo(new THREE.PlaneGeometry(110,110,n,n));g.rotateX(-Math.PI/2);
  const pos=g.attributes.position,colors=[],color=new THREE.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),edge=Math.max(Math.abs(x),Math.abs(z));
    let h=terrainHeight(x,z);if(Math.abs(z+18)<3.7)h=-1.3;
    if(edge>49)h-=(edge-49)*.55;pos.setY(i,h);
    const river=Math.abs(z+18)<6.3;
    color.set(river?'#d3c5a0':edge>48?'#b6bc8c':Math.sin(x*.4+z*.25)>.35?'#a7bb88':'#769677');
    color.multiplyScalar(.92+.08*Math.sin(x*.6-z*.4));colors.push(color.r,color.g,color.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return new THREE.Mesh(g,groundMat);
}
function ribbon(points,width,mat,parent){
  const vertices=[],uv=[],indices=[];
  for(let i=0;i<points.length;i++){
    const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz)||1;
    for(const side of [-1,1]){const x=p[0]+dz/n*width*side,z=p[1]-dx/n*width*side;vertices.push(x,terrainHeight(x,z)+.055,z);uv.push(side===-1?0:1,i*.3);}
    if(i){const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
  }
  const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return mesh(g,mat,parent);
}
function explorer(parent){
  const root=group(parent),torso=group(root,0,1.1,0),coat=material('#dfb971'),cloth=material('#e8dcc0'),navy=material('#244c51'),skin=material('#ae7c57'),boot=material('#273c37'),scarf=material('#d67755'),glass=material('#a9f2db',{emissive:'#55bfa6',emissiveIntensity:.25});
  mesh(tapered(.72,.74,.48,.8),coat,torso,0,0,0);mesh(tapered(.56,.35,.45,.92),navy,root,0,.85,0);
  mesh(cylinder(.14,.17,.18,6),skin,torso,0,.82,0);
  const head=group(torso,0,1.02,0);mesh(geo(new THREE.IcosahedronGeometry(.29,0)),skin,head);
  mesh(cylinder(.34,.37,.11,8),navy,head,0,.14,-.015);mesh(cylinder(.2,.25,.17,7),coat,head,0,.24,-.025);
  mesh(geo(new THREE.BoxGeometry(.28,.09,.07)),glass,head,0,.02,.27);
  const pack=mesh(tapered(.51,.56,.24,.9),navy,torso,0,.09,-.35);pack.rotation.x=-.06;
  mesh(cylinder(.095,.095,.55,6),cloth,torso,.36,.34,-.31);mesh(geo(new THREE.BoxGeometry(.55,.065,.08)),cloth,torso,0,.24,-.5);
  mesh(cylinder(.31,.32,.13,7),scarf,torso,0,.76,0);
  const scarfTail=mesh(tapered(.15,.54,.045,.55),scarf,torso,-.19,.48,-.34);scarfTail.rotation.z=.16;
  const limbs=[];
  for(const side of [-1,1]){
    const arm=group(torso,side*.47,.61,0);const sleeve=mesh(cylinder(.13,.16,.48,5),coat,arm,0,-.22,0);sleeve.rotation.z=side*.1;
    const fore=group(arm,0,-.45,0);mesh(cylinder(.115,.12,.38,5),cloth,fore,0,-.16,.015);mesh(geo(new THREE.IcosahedronGeometry(.13,0)),skin,fore,0,-.38,.03);
    if(side===1){const tool=group(fore,0,-.37,.15);mesh(cylinder(.13,.1,.36,6),navy,tool,0,.04,0).rotation.x=Math.PI/2;mesh(geo(new THREE.IcosahedronGeometry(.115,0)),glass,tool,0,.04,.2);}
    const leg=group(root,side*.2,.91,0);mesh(cylinder(.14,.16,.46,5),navy,leg,0,-.22,0);const shin=group(leg,0,-.43,0);mesh(cylinder(.13,.14,.38,5),navy,shin,0,-.17,0);mesh(geo(new THREE.BoxGeometry(.25,.2,.43)),boot,shin,0,-.36,.09);
    limbs.push({side,arm,fore,leg,shin});
  }
  const lantern=mesh(geo(new THREE.IcosahedronGeometry(.12,0)),glass,torso,-.4,.12,.1);
  return {root,torso,head,limbs,scarfTail,lantern};
}
function guardian(parent,type){
  const root=group(parent),isWarden=type==='warden',stone=material(isWarden?'#9faca0':'#849e8c'),dark=material('#335b57'),glow=material('#f4c16a',{emissive:'#dc7a36',emissiveIntensity:.7});
  const scale=isWarden?1.33:type==='sentinel'?1:.8;root.scale.setScalar(scale);
  const body=group(root,0,1.1,0);mesh(tapered(1,.95,.65,.62),stone,body,0,-.16,0);mesh(geo(new THREE.IcosahedronGeometry(.31,0)),dark,body,0,1,0);mesh(geo(new THREE.BoxGeometry(.35,.1,.12)),glow,body,0,1.02,.27);
  const core=mesh(geo(new THREE.OctahedronGeometry(.23,0)),glow,body,0,.35,.36);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=group(body,side*.69,.65,0);mesh(tapered(.33,.53,.38,.83),stone,arm,0,-.48,0);mesh(geo(new THREE.OctahedronGeometry(.22,0)),dark,arm,0,-.65,0);arms.push(arm);
    const leg=group(root,side*.34,.97,0);mesh(tapered(.29,.78,.35,.8),dark,leg,0,-.76,0);mesh(geo(new THREE.BoxGeometry(.43,.18,.62)),stone,leg,0,-.86,.12);legs.push(leg);
    if(isWarden){const plate=mesh(tapered(.55,.45,.65,.45),stone,body,side*.53,.57,-.18);plate.rotation.z=-side*.4;}
    else if(type==='sentinel'){const fin=mesh(tapered(.1,.85,.5,.1),stone,body,side*.65,.55,-.25);fin.rotation.z=-side*.35;}
  }
  const health=group(root,0,2.8,0);mesh(geo(new THREE.PlaneGeometry(1.05,.12)),basic('#25443f',{side:THREE.DoubleSide}),health);
  const healthFill=mesh(geo(new THREE.PlaneGeometry(1,.075)),basic('#f2cc88',{side:THREE.DoubleSide}),health,0,0,.01);
  const guardPlates=[];
  if(isWarden){
    const bronze=material('#cfac68',{metalness:.3,roughness:.5});
    for(const side of [-1,1]){const plate=mesh(tapered(.4,.72,.14,.7),bronze,body,side*.23,-.06,.55);plate.rotation.z=-side*.12;guardPlates.push(plate);}
  }
  return {root,body,arms,legs,stone,glow,core,guardPlates,health,healthFill};
}

export function createValley(canvas){
  const renderer=createRenderer(canvas,{antialias:true,maxTriangles:22000}),low=renderer.quality==='low';
  canvas=renderer.domElement;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#a6c9c5');scene.fog=new THREE.Fog('#a6c9c5',low?42:58,132);
  const camera=new THREE.PerspectiveCamera(53,1,.16,180);camera.position.set(11,10,49);
  const ambient=new THREE.HemisphereLight('#d5e8dc','#6f8062',2.1);scene.add(ambient);
  const sunlight=new THREE.DirectionalLight('#fff0c9',2.7);sunlight.position.set(-27,60,35);sunlight.castShadow=true;sunlight.shadow.mapSize.set(low?512:1024,low?512:1024);Object.assign(sunlight.shadow.camera,{left:-43,right:43,top:43,bottom:-43,near:1,far:135});sunlight.shadow.bias=-.0007;scene.add(sunlight);scene.add(sunlight.target);
  const skyEnvironment=createSkyEnvironment(renderer,scene);
  const ground=loadSurfaceMaterial('forest',{repeat:22,vertexColors:true,roughness:1,flatShading:true});materials.add(ground);
  const stone=loadSurfaceMaterial('rock',{repeat:2,color:palette.stone,roughness:.97,flatShading:true});materials.add(stone);
  const darkStone=loadSurfaceMaterial('rock',{repeat:1.5,color:palette.darkStone,roughness:1,flatShading:true});materials.add(darkStone);
  const wood=material(palette.wood),gold=material(palette.gold,{metalness:.38,roughness:.4}),mint=material(palette.mint,{emissive:'#4b9f87',emissiveIntensity:.48}),dark=material('#264e4d'),cloth=material('#d8cfa9');
  const terrain=makeTerrain(low,ground);terrain.receiveShadow=true;scene.add(terrain);
  const seaMat=material(palette.sea,{transparent:true,opacity:.9,roughness:.3,metalness:.16,side:THREE.DoubleSide});
  const seaGeo=oceanGeometry(low),sea=mesh(seaGeo,seaMat,scene,0,-1.2,0);sea.name='Coastal ocean';sea.receiveShadow=false;sea.castShadow=false;
  const riverMat=material('#579ba5',{transparent:true,opacity:.87,roughness:.26,metalness:.18,side:THREE.DoubleSide});
  const riverGeo=geo(new THREE.PlaneGeometry(110,7.1,low?16:32,2));riverGeo.rotateX(-Math.PI/2);const river=mesh(riverGeo,riverMat,scene,0,.09,-18);river.castShadow=false;
  const trailMat=material('#b5aa83',{side:THREE.DoubleSide,roughness:1});
  ribbon([[0,36],[-7,30],[-16,27],[-23,19],[-29,12],[-31,8]],1.15,trailMat,scene);
  ribbon([[-29,12],[-19,13],[-8,16],[3,23],[15,26],[27,27],[30,23]],1.05,trailMat,scene);
  ribbon([[29,23],[21,16],[20,6],[20,-4],[20,-10],[20,-13]],1.05,trailMat,scene);
  ribbon([[20,-23],[18,-28],[10,-32],[2,-35]],1.05,trailMat,scene);
  const cullables=[],trees=[],flags=[];
  const addCull=(object,radius=42)=>{cullables.push({object,radius});return object;};

  // A lighthouse built from a flared octagonal drum, shaded lantern and copper cap.
  const lighthouse=group(scene,0,terrainHeight(0,42),42);
  mesh(cylinder(2.7,3.2,.6,8),darkStone,lighthouse,0,.15,0);
  mesh(cylinder(1.65,2.5,8.2,8),stone,lighthouse,0,4.3,0);
  for(let i=0;i<8;i++){const a=i/8*TAU;const slit=mesh(geo(new THREE.BoxGeometry(.16,.9,.08)),dark,lighthouse,Math.sin(a)*1.95,4.1,Math.cos(a)*1.95);slit.rotation.y=a;}
  mesh(cylinder(2.05,2.05,.35,8),darkStone,lighthouse,0,8.4,0);
  mesh(cylinder(1.45,1.45,1.65,8),material('#b9e6ce',{transparent:true,opacity:.38,emissive:'#8bc3a4',emissiveIntensity:.25}),lighthouse,0,9.3,0);
  for(let i=0;i<8;i++){const a=i/8*TAU;mesh(cylinder(.07,.07,1.8,4),gold,lighthouse,Math.sin(a)*1.47,9.35,Math.cos(a)*1.47);}
  mesh(cylinder(.05,2.1,1.65,8),gold,lighthouse,0,10.9,0);mesh(geo(new THREE.OctahedronGeometry(.62,0)),mint,lighthouse,0,9.4,0);
  const homeLight=mesh(geo(new THREE.ConeGeometry(1.4,8,8,1,true)),basic('#f5e7a2',{transparent:true,opacity:.09,side:THREE.DoubleSide,depthWrite:false}),lighthouse,0,14.4,0);homeLight.rotation.z=Math.PI;
  const doorstep=mesh(cylinder(1.8,1.8,.16,8),gold,scene,0,terrainHeight(0,37.8)+.08,37.8);

  // Archive: an incomplete horseshoe arcade around the three rune drums.
  const archive=group(scene,-31,terrainHeight(-31,2),2);addCull(archive,61);
  mesh(cylinder(10.6,10.9,.4,10),darkStone,archive,0,-.1,-3);
  mesh(cylinder(9.8,9.9,.15,10),stone,archive,0,.15,-3);
  const arcGeo=archGeometry(3.6,.55,.75,low?7:12);
  for(const side of [-1,1]){
    const arch=group(archive,side*8,.15,-3);arch.rotation.y=Math.PI/2;
    mesh(arcGeo,stone,arch,0,3,0);for(const x of [-3.35,3.35]){mesh(cylinder(.42,.57,3,6),stone,arch,x,1.5,0);mesh(cylinder(.65,.65,.25,6),darkStone,arch,x,.12,0);}
  }
  const runeMeshes=[];
  for(const p of PILLARS){
    const base=group(scene,p.x,terrainHeight(p.x,p.z)+.28,p.z);addCull(base,55);
    mesh(cylinder(1.12,1.32,.38,6),darkStone,base,0,.05,0);mesh(cylinder(.76,.92,2.55,6),stone,base,0,1.43,0);
    const color=RUNES.find(r=>r.id===p.rune).color,m=material(color,{emissive:color,emissiveIntensity:.16});
    const orb=mesh(geo(new THREE.OctahedronGeometry(.44,0)),m,base,0,3,0);
    const ring=mesh(geo(new THREE.TorusGeometry(.66,.055,3,12)),gold,base,0,3,0);ring.rotation.x=.2;
    runeMeshes.push({base,orb,ring,material:m,rune:p.rune});
  }
  const tablet=group(scene,TABLET.x,terrainHeight(TABLET.x,TABLET.z),TABLET.z);mesh(tapered(1.8,.85,1.15,.9),darkStone,tablet);
  const slab=mesh(geo(new THREE.BoxGeometry(1.75,.12,1.14)),stone,tablet,0,.92,0);slab.rotation.x=.26;
  for(let i=0;i<3;i++){const rune=mesh(geo(new THREE.TorusGeometry(.17,.033,3,6)),gold,tablet,(i-1)*.48,1.01,-.05);rune.rotation.x=-Math.PI/2+.26;}

  // Tide workshop: leaning timber roof, wind cloth, working salvage and a hoist.
  const workshop=group(scene,31,terrainHeight(31,14),14);addCull(workshop,52);
  mesh(tapered(4.6,.6,3.3,.95),stone,workshop);
  for(const x of [-1.75,1.75])for(const z of [-1.1,1.1])mesh(cylinder(.12,.17,3.25,5),wood,workshop,x,2,z);
  const roof=mesh(tapered(5.2,.8,4.2,.6),wood,workshop,0,3.45,0);roof.rotation.z=.04;
  mesh(geo(new THREE.BoxGeometry(4.8,.13,.15)),gold,workshop,0,3.5,2.1);
  mesh(cylinder(.6,.72,.8,6),dark,workshop,0,1,0);mesh(geo(new THREE.TorusGeometry(.75,.1,4,9)),gold,workshop,0,1.95,0).rotation.x=.4;
  const banner=mesh(geo(new THREE.PlaneGeometry(1.2,1.8,2,3)),material('#d4a16b',{side:THREE.DoubleSide}),workshop,2,2.4,1.15);flags.push(banner);
  // Two raised leaves, a real counterweight and a player-operated sluice make
  // the river crossing's state legible from the approach. Collision opens only
  // after the model locks both leaves at the end of deployment.
  const bridge=group(scene,20,.78,-18);bridge.name='Tideworks crossing';
  const bridgeLeaves=[];
  for(const shore of [-1,1]){
    const leaf=group(bridge,0,0,shore*3.96);leaf.name=shore>0?'South bridge leaf':'North bridge leaf';
    for(let i=0;i<6;i++){const plank=mesh(geo(new THREE.BoxGeometry(BRIDGE_HALF_WIDTH*2,.19,.65)),wood,leaf,0,0,-shore*(i+.5)*.66);plank.rotation.z=Math.sin(i*2)*.012;}
    for(const side of [-1,1]){
      mesh(geo(new THREE.BoxGeometry(.16,.14,3.96)),dark,leaf,side*2.8,1.22,-shore*1.98);
      for(const z of [.25,3.7])mesh(cylinder(.075,.1,1.4,5),wood,leaf,side*2.8,.62,-shore*z);
    }
    bridgeLeaves.push({leaf,shore});
    const bank=group(bridge,0,0,shore*4.2);mesh(geo(new THREE.BoxGeometry(6.1,.32,.7)),darkStone,bank);
    for(const side of [-1,1])mesh(cylinder(.24,.35,1.3,5),stone,bank,side*3,.5,0);
  }
  const repairWheel=group(scene,TIDEWORKS.winch.x,terrainHeight(TIDEWORKS.winch.x,TIDEWORKS.winch.z),TIDEWORKS.winch.z);
  mesh(tapered(1.3,1.1,.8,.8),darkStone,repairWheel);
  const winchHandle=mesh(geo(new THREE.TorusGeometry(.47,.07,3,8)),gold,repairWheel,0,1.45,0);winchHandle.name='Bridge winch handle';
  const bench=group(scene,TIDEWORKS.bench.x,terrainHeight(TIDEWORKS.bench.x,TIDEWORKS.bench.z),TIDEWORKS.bench.z);addCull(bench,48);
  mesh(tapered(1.65,.85,1.2,.9),wood,bench);mesh(geo(new THREE.BoxGeometry(1.9,.15,1.35)),darkStone,bench,0,.92,0);
  const workParts=group(bench,0,1.12,0);
  for(let i=0;i<4;i++)mesh(geo(new THREE.BoxGeometry(.36,.24,.44)),gold,workParts,(i%2-.5)*.6,Math.floor(i/2)*.2,Math.floor(i/2)*.28-.1);
  const benchBeacon=mesh(geo(new THREE.OctahedronGeometry(.18,0)),mint,bench,0,1.7,0);
  const gantry=group(scene,16.3,terrainHeight(16.3,-11),-11);addCull(gantry,48);
  for(const x of [-.85,.85])mesh(geo(new THREE.BoxGeometry(.25,4.8,.3)),wood,gantry,x,2.3,0);
  mesh(geo(new THREE.BoxGeometry(2.2,.3,.38)),darkStone,gantry,0,4.7,0);
  const weight=mesh(tapered(1.1,1,.8,.9),gold,gantry,0,3.25,0);weight.name='Tideworks counterweight';
  const cable=mesh(cylinder(.035,.035,1,4),dark,gantry,0,4.1,0);
  const wheelRoot=group(scene,27,1.9,-18);wheelRoot.name='Tideworks waterwheel';addCull(wheelRoot,55);wheelRoot.rotation.y=Math.PI/2;
  for(const side of [-1,1])mesh(geo(new THREE.TorusGeometry(1.65,.12,3,low?12:20)),wood,wheelRoot,0,0,side*.48);
  for(let i=0;i<8;i++){
    const a=i/8*TAU,paddle=mesh(geo(new THREE.BoxGeometry(.55,.16,1.15)),wood,wheelRoot,Math.cos(a)*1.65,Math.sin(a)*1.65,0);paddle.rotation.z=a;
    if(i%2===0){const spoke=mesh(geo(new THREE.BoxGeometry(3.3,.1,.13)),gold,wheelRoot);spoke.rotation.z=a;}
  }
  mesh(cylinder(.2,.2,1.5,5),gold,wheelRoot).rotation.x=Math.PI/2;
  const wheelHousing=group(scene,27,0,-18);addCull(wheelHousing,55);
  for(const x of [-1,1]){mesh(tapered(.75,3,1,.8),darkStone,wheelHousing,x,0,0);mesh(geo(new THREE.BoxGeometry(.28,.28,6.7)),wood,wheelHousing,x,2.7,2.6);}
  const sluice=group(scene,TIDEWORKS.valve.x,terrainHeight(TIDEWORKS.valve.x,TIDEWORKS.valve.z),TIDEWORKS.valve.z);addCull(sluice,52);
  mesh(tapered(1.2,1.2,1,.85),darkStone,sluice);
  const dial=group(sluice,0,1.42,.15);dial.name='Three-rune sluice dial';
  mesh(geo(new THREE.TorusGeometry(.56,.065,3,12)),gold,dial);
  const dialPointer=mesh(tapered(.13,.56,.09,.1),mint,dial,0,-.08,.06);
  const dialRunes=[];
  for(let i=0;i<3;i++){
    const a=i/3*TAU,m=material(RUNES[i].color,{emissive:RUNES[i].color,emissiveIntensity:.12});
    const glyph=mesh(geo(new THREE.OctahedronGeometry(.13,0)),m,dial,Math.sin(a)*.66,Math.cos(a)*.66,0);dialRunes.push({glyph,material:m});
  }
  const gate=mesh(geo(new THREE.BoxGeometry(.25,1.7,2.8)),wood,scene,27,.9,-14.5);gate.name='Tideworks sluice gate';
  for(const x of [26.7,27.3])mesh(tapered(.2,2.6,.25,.8),stone,scene,x,.15,-14.5);
  // Restored light follows the paths the explorer has actually made useful.
  const conduitMat=basic('#c6ecc1',{transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
  const archiveConduit=ribbon([[-29,10],[-19,13],[-8,16],[3,23],[15,26],[29,24],[31,21]],.065,conduitMat,scene);
  const workshopConduit=ribbon([[30,20],[24,14],[25,3],[25,-8],[20,-10]],.07,conduitMat,scene);
  const northConduit=ribbon([[20,-23],[18,-28],[10,-32],[2,-35]],.08,conduitMat,scene);
  const homeConduit=ribbon([[20,-10],[20,6],[15,26],[5,31],[0,37]],.075,conduitMat,scene);
  const pathBeacons=[];
  for(const [x,z,site] of [[-19,13,'archive'],[3,23,'archive'],[25,3,'installed'],[20,-25,'bridge'],[10,-32,'bridge'],[5,31,'spire']]){
    const g=group(scene,x,terrainHeight(x,z),z);mesh(tapered(.26,.8,.26,.65),darkStone,g);const lamp=mesh(geo(new THREE.OctahedronGeometry(.16,0)),mint,g,0,1,0);pathBeacons.push({lamp,site});addCull(g,48);
  }

  // Spire: a broken observatory court and an animated three-ring armillary.
  const spire=group(scene,2,terrainHeight(2,-38),-38);addCull(spire,64);
  mesh(cylinder(10.7,11.1,.5,10),darkStone,spire,0,-.15,0);mesh(cylinder(9.8,10.1,.18,10),stone,spire,0,.18,0);
  mesh(cylinder(1.4,2.05,1.7,7),darkStone,spire,0,1,0);mesh(cylinder(1.9,1.9,.22,7),gold,spire,0,1.95,0);
  const armillary=group(spire,0,4.4,0),rings=[];
  for(let i=0;i<3;i++){const ring=mesh(geo(new THREE.TorusGeometry(2.1-i*.2,.09,low?3:5,low?14:24)),gold,armillary);ring.rotation.set(i*.9,.4+i*.7,.2);rings.push(ring);}
  const heart=mesh(geo(new THREE.IcosahedronGeometry(.7,0)),mint,armillary);
  for(let i=0;i<7;i++){const a=i/7*TAU,r=8.3;const h=i===1?2.8:i===4?3.6:5.5;const column=group(spire,Math.sin(a)*r,0,Math.cos(a)*r);mesh(cylinder(.42,.68,h,6),stone,column,0,h/2,0);mesh(cylinder(.8,.8,.3,6),darkStone,column,0,h,0);}
  const spireHalo=mesh(geo(new THREE.RingGeometry(2.4,2.65,low?18:32)),basic('#a2e5c1',{transparent:true,opacity:.7,side:THREE.DoubleSide}),spire,0,.35,0);spireHalo.rotation.x=-Math.PI/2;

  // Procedural vegetation uses shared meshes and nearby visibility, with no texture billboards.
  const rand=random(93071),trunkGeo=cylinder(.15,.29,3.4,5),crownGeo=geo(new THREE.IcosahedronGeometry(2,0)),trunkMat=material('#695d46');
  const leafMats=['#527e65','#698e68','#759e70','#8ba475'].map(c=>material(c));
  for(let i=0;i<TREES.length;i++){
    const {x,z}=TREES[i],g=group(scene,x,terrainHeight(x,z),z),scale=.8+rand()*.65;g.scale.setScalar(scale);
    mesh(trunkGeo,trunkMat,g,0,1.7,0).rotation.z=(rand()-.5)*.2;
    const crown=group(g,0,3.2,0);mesh(crownGeo,leafMats[i%4],crown,.05,.8,0).scale.set(1.15,.77,1);mesh(crownGeo,leafMats[(i+1)%4],crown,.65,1.75,-.1).scale.set(.72,.63,.75);
    addCull(g,low?31:63);trees.push({root:g,crown,phase:rand()*TAU});
  }
  const grassGeo=geo(new THREE.BufferGeometry());grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.45,0,0,0,1.1,.07,.3,0,0,0,0,-.3,.06,.8,0,0,0,.4,-.25,0,-.25,.15,.7,.1,.35,0,.25],3));grassGeo.computeVertexNormals();const grassMat=material('#88a87b',{side:THREE.DoubleSide});
  for(let i=0;i<(low?48:105);i++){
    const x=(rand()-.5)*94,z=(rand()-.5)*94;if(Math.abs(z+18)<6||OBSTACLES.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+1))continue;
    const g=mesh(grassGeo,grassMat,scene,x,terrainHeight(x,z),z);g.rotation.y=rand()*TAU;g.scale.setScalar(.65+rand()*.7);addCull(g,low?25:47);
  }
  const rockGeo=geo(new THREE.IcosahedronGeometry(1,0));
  for(const o of OBSTACLES.filter(o=>o.kind==='rock')){const rock=mesh(rockGeo,stone,scene,o.x,terrainHeight(o.x,o.z)+o.r*.45,o.z);rock.scale.set(o.r,o.r*.85,o.r);rock.rotation.set(.1,.6,0);addCull(rock,65);}
  for(let i=0;i<20;i++){const x=(rand()-.5)*95,z=(rand()-.5)*95;if(Math.abs(z+18)<5)continue;const rock=mesh(rockGeo,darkStone,scene,x,terrainHeight(x,z)+.3,z);rock.scale.set(.5+rand(),.4+rand()*.4,.55+rand());addCull(rock,low?31:58);}
  // Sea stacks and northern silhouettes anchor the valley beyond the walkable shore.
  for(const [x,z,h,w] of [[-69,-33,17,15],[-57,-64,25,20],[-28,-71,18,18],[12,-69,23,22],[46,-66,27,20],[69,-29,15,13],[-68,35,10,9]]){
    const mountain=mesh(geo(new THREE.ConeGeometry(w,h,5)),material('#547d78'),scene,x,h/2-2,z);mountain.rotation.y=x*.1;mountain.castShadow=false;
  }
  const clouds=[];const cloudMat=material('#d4e1d4',{transparent:true,opacity:.32,flatShading:true,depthWrite:false});
  for(let i=0;i<5;i++){const g=group(scene,-55+i*26,24+i%2*4,-51-i%3*6);mesh(geo(new THREE.IcosahedronGeometry(1,0)),cloudMat,g).scale.set(13,2.1,5);clouds.push(g);}

  // Capture the environment before adding actors/effects. The follow camera
  // shortens its boom against actual terrain, masonry and tree geometry.
  const cameraOccluders=scene.children.filter(object=>!object.isLight);
  const cameraRay=new THREE.Raycaster(),cameraDirection=new THREE.Vector3();
  function clearCameraSight(origin,position){
    cameraDirection.copy(position).sub(origin);const length=cameraDirection.length();if(length<.1)return;
    cameraDirection.multiplyScalar(1/length);cameraRay.set(origin,cameraDirection);cameraRay.near=.08;cameraRay.far=length;
    for(const hit of cameraRay.intersectObjects(cameraOccluders,true)){
      let visible=true;for(let object=hit.object;object;object=object.parent)if(!object.visible){visible=false;break;}
      const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
      if(!visible||!material||material.transparent&&material.opacity<.8)continue;
      position.copy(origin).addScaledVector(cameraDirection,Math.max(.5,hit.distance-.45));break;
    }
  }
  const player=explorer(scene),enemyVisuals=new Map(),crateVisuals=new Map();
  const playerShadow=mesh(geo(new THREE.CircleGeometry(.8,low?10:18)),basic('#153c37',{transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}),scene);playerShadow.rotation.x=-Math.PI/2;playerShadow.castShadow=false;
  const effectsRoot=group(scene),effectPool=[],projectilePool=[];
  const beamGeo=cylinder(.04,.085,1,5),orbGeo=geo(new THREE.IcosahedronGeometry(.19,0)),ringGeo=geo(new THREE.RingGeometry(.86,1,low?16:24));
  const beamMat=basic('#b9ffe6',{transparent:true,opacity:.86}),hurtMat=basic('#eaa368',{transparent:true,opacity:.7,side:THREE.DoubleSide}),ringMat=basic('#d6e3a5',{transparent:true,opacity:.65,side:THREE.DoubleSide});
  const warningMat=basic('#f5b460',{transparent:true,opacity:.58,side:THREE.DoubleSide,depthWrite:false}),warnings=new Map();
  const rainGeo=geo(new THREE.BoxGeometry(.025,.75,.025)),rainMat=basic('#d8e8d9',{transparent:true,opacity:.48}),rain=[];
  for(let i=0;i<(low?18:55);i++){const drop=mesh(rainGeo,rainMat,scene);drop.castShadow=false;drop.visible=false;rain.push({mesh:drop,x:rand()*25-12.5,z:rand()*25-12.5,phase:rand()*12});}

  let look=new THREE.Vector3(0,1.8,35),camPosition=new THREE.Vector3(0,10,48),first=true;
  function surface(s,x,z){
    if(s.completed.bridge&&Math.abs(z+18)<4.2&&Math.abs(x-20)<BRIDGE_HALF_WIDTH)return .92;
    const ground=terrainHeight(x,z);
    if(Math.hypot(x+31,z+1)<10.5)return Math.max(ground,terrainHeight(-31,2)+.3);
    if(Math.hypot(x-2,z+38)<10.5)return Math.max(ground,terrainHeight(2,-38)+.3);
    return ground;
  }
  function attachActors(s){
    for(const e of s.enemies)if(!enemyVisuals.has(e.id)){
      const v=guardian(scene,e.type);enemyVisuals.set(e.id,v);
      v.root.name=e.id;
      const warning=mesh(ringGeo,warningMat,scene);warning.rotation.x=-Math.PI/2;warning.castShadow=false;
      let lane=null;
      if(e.type==='warden'){lane=mesh(geo(new THREE.BoxGeometry(3.2,.035,1)),basic('#f5b460',{transparent:true,opacity:.28,depthWrite:false}),scene);lane.castShadow=false;lane.name='Warden locked charge lane';}
      warnings.set(e.id,{ring:warning,lane});
    }
    for(const c of s.crates)if(!crateVisuals.has(c.id)){
      const g=group(scene,c.x,terrainHeight(c.x,c.z),c.z);const box=mesh(geo(new THREE.BoxGeometry(1.65,1.45,1.65)),wood,g,0,.75,0);
      for(const side of [-1,1]){mesh(geo(new THREE.BoxGeometry(.1,1.53,1.76)),dark,g,side*.58,.75,0);mesh(geo(new THREE.BoxGeometry(1.76,.1,1.76)),gold,g,0,side*.57+.75,0);}
      const salvage=group(scene,c.x,terrainHeight(c.x,c.z)+.9,c.z);mesh(geo(new THREE.TorusGeometry(.29,.075,4,7)),gold,salvage);mesh(geo(new THREE.OctahedronGeometry(.23,0)),mint,salvage);
      crateVisuals.set(c.id,{root:g,box,salvage});
    }
  }
  function update(s,delta,view={}){
    attachActors(s);const t=s.weatherTime,weather=weatherAt(t),reduced=!!view.reducedMotion,p=s.player;
    player.root.position.set(p.x,surface(s,p.x,p.z),p.z);player.root.rotation.y=p.facing;
    playerShadow.position.set(p.x,surface(s,p.x,p.z)+.025,p.z);playerShadow.visible=low&&s.mode!=='menu';
    const moving=!!p.moving,stride=moving?Math.sin(p.walk*1.65):0;
    player.torso.position.y=1.1+(moving&&!reduced?Math.abs(stride)*.055:0);
    for(const l of player.limbs){l.leg.rotation.x=stride*l.side*.48;l.shin.rotation.x=Math.max(0,-stride*l.side)*.4;l.arm.rotation.x=-stride*l.side*.35;l.fore.rotation.x=-.2;if(l.side===1&&p.pulseCooldown>.16){l.arm.rotation.x=-1.1;l.fore.rotation.x=-.25;}}
    player.scarfTail.rotation.x=reduced?.12:.1+Math.sin(t*2)*.15+weather.wind*.15;player.head.rotation.y=.06*Math.sin(t*.6);
    player.root.visible=s.mode!=='menu'||!view.title;
    if(p.invulnerable>0){player.lantern.material.emissiveIntensity=1.5;}else player.lantern.material.emissiveIntensity=.3;
    for(const r of runeMeshes){const done=s.completed.archive||s.sequence.slice(0,s.archiveStep).includes(r.rune);r.orb.rotation.y=t*.5;r.orb.position.y=3+(reduced?0:Math.sin(t*1.2)*.1);r.material.emissiveIntensity=done?.9:.13;r.ring.rotation.z=t*.12;r.ring.visible=done;}
    const works=s.tideworks,progress=s.completed.bridge?1:works.deployment,eased=progress*progress*(3-2*progress);
    for(const {leaf,shore} of bridgeLeaves)leaf.rotation.x=shore*1.22*(1-eased);
    workParts.visible=!works.installed;benchBeacon.visible=s.completed.archive;
    weight.visible=cable.visible=works.installed;weight.position.y=3.25-eased*2.5;
    const cableLength=4.55-(weight.position.y+.95);cable.scale.y=Math.max(.08,cableLength);cable.position.y=4.55-cableLength/2;
    winchHandle.rotation.z=progress*TAU*1.3;wheelRoot.rotation.z=reduced?0:-works.flowTime*1.2;
    const flowAligned=works.installed&&RUNES[works.setting]?.id===s.sequence[0];gate.position.y=flowAligned?2.1:.9;
    dialPointer.rotation.z=works.setting<0?Math.PI/3:-works.setting/3*TAU;
    dialRunes.forEach((r,i)=>{r.material.emissiveIntensity=works.setting===i?.8:.08;r.glyph.scale.setScalar(works.setting===i?1.2:1);});
    archiveConduit.visible=s.completed.archive;workshopConduit.visible=works.installed;northConduit.visible=s.completed.bridge;homeConduit.visible=s.completed.spire;
    for(const b of pathBeacons)b.lamp.visible=b.site==='installed'?works.installed:!!s.completed[b.site];
    for(let i=0;i<rings.length;i++)if(!reduced){rings[i].rotation.x=i*.9+t*(s.completed.spire?.16:.04)*(i%2?1:-1);rings[i].rotation.y=.4+i*.7+t*.08;}
    heart.rotation.y=t*.45;heart.scale.setScalar(s.completed.spire?1.2:1);spireHalo.visible=s.completed.spire;homeLight.material.opacity=s.completed.spire?.16:.045;
    for(const e of s.enemies){
      const v=enemyVisuals.get(e.id),near=Math.hypot(e.x-p.x,e.z-p.z)<(low?42:65);v.root.visible=e.hp>0&&near;
      if(e.hp>0){
        v.root.position.set(e.x,surface(s,e.x,e.z)+.2,e.z);v.root.rotation.y=e.facing;
        const stride=e.moving?Math.sin(e.walk*2)*.24:0,exposed=e.type==='warden'&&e.phase==='recover'&&e.exposed;
        v.legs[0].rotation.x=stride;v.legs[1].rotation.x=-stride;
        v.arms[0].rotation.x=e.phase==='windup'?-1.2:exposed?.65:stride;v.arms[1].rotation.x=e.phase==='windup'?-1.2:exposed?.65:-stride;
        v.body.rotation.z=e.phase==='windup'&&!reduced?.045*Math.sin(t*12):0;v.body.rotation.x=e.phase==='charge'?.28:exposed?.13:0;
        v.stone.emissive.set(e.hitFlash>0?'#bbdfb9':e.guardFlash>0?'#a87932':'#000000');v.stone.emissiveIntensity=e.hitFlash>0?.8:e.guardFlash>0?.45:0;
        for(let i=0;i<v.guardPlates.length;i++){const plate=v.guardPlates[i],side=i?1:-1;plate.position.x=side*(exposed?.66:.23);plate.rotation.z=side*(exposed?.75:-.12);}
        v.core.scale.setScalar(exposed?1.45:1);v.glow.color.set(exposed?'#b9f5d6':'#f4c16a');v.glow.emissive.set(exposed?'#58cfa8':'#dc7a36');
        v.health.rotation.y=(view.yaw??0)-e.facing;v.healthFill.scale.x=e.hp/e.maxHp;v.healthFill.position.x=-(1-e.hp/e.maxHp)*.5;v.health.visible=Math.hypot(e.x-p.x,e.z-p.z)<18;
      }
      const warning=warnings.get(e.id),visible=e.phase==='windup'&&e.hp>0&&near;warning.ring.visible=visible;
      if(visible){const q=e.target,r=e.type==='warden'?1.65:e.type==='sentinel'?1.05:2.5;warning.ring.position.set(q.x,surface(s,q.x,q.z)+.12,q.z);warning.ring.scale.setScalar(r*(reduced?1:.65+.35*clamp(e.clock/e.windup,0,1)));}
      if(warning.lane){warning.lane.visible=visible;if(visible){const a=e.chargeStart,b=e.target,length=Math.hypot(b.x-a.x,b.z-a.z);warning.lane.position.set((a.x+b.x)/2,surface(s,(a.x+b.x)/2,(a.z+b.z)/2)+.1,(a.z+b.z)/2);warning.lane.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);warning.lane.scale.z=length;}}
    }
    for(const c of s.crates){const v=crateVisuals.get(c.id),near=Math.hypot(c.x-p.x,c.z-p.z)<(low?39:65);v.root.visible=c.hp>0&&near;v.root.rotation.z=c.hitFlash>0?Math.sin(c.hitFlash*80)*.035:0;v.salvage.visible=c.hp===0&&!c.collected&&near;v.salvage.rotation.y=t*1.2;v.salvage.position.y=terrainHeight(c.x,c.z)+.85+(reduced?0:Math.sin(t*2+c.id)*.15);}
    for(let i=0;i<s.effects.length;i++){
      const f=s.effects[i];let v=effectPool[i];if(!v){v={beam:mesh(beamGeo,beamMat,effectsRoot),ring:mesh(ringGeo,ringMat,effectsRoot)};v.ring.rotation.x=-Math.PI/2;effectPool.push(v);}v.beam.visible=f.type==='pulse';v.ring.visible=f.type!=='pulse';
      if(f.type==='pulse'){
        const from=new THREE.Vector3(f.x,surface(s,f.x,f.z)+1.65,f.z),to=new THREE.Vector3(f.tx,terrainHeight(f.tx,f.tz)+1.1,f.tz),dir=to.clone().sub(from);v.beam.position.copy(from).addScaledVector(dir,.5);v.beam.scale.set(1,dir.length(),1);v.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
      }else{v.ring.position.set(f.x,surface(s,f.x,f.z)+.13,f.z);v.ring.scale.setScalar((f.radius||2)*(1.1-f.ttl/f.life*.6));v.ring.material=f.type==='hurt'||f.type==='slam'?hurtMat:ringMat;}
    }
    for(let i=s.effects.length;i<effectPool.length;i++){effectPool[i].beam.visible=false;effectPool[i].ring.visible=false;}
    for(let i=0;i<s.projectiles.length;i++){let orb=projectilePool[i];if(!orb){orb=mesh(orbGeo,basic('#ffd391'),scene);projectilePool.push(orb);}const q=s.projectiles[i];orb.visible=true;orb.position.set(q.x,terrainHeight(q.x,q.z)+1.05,q.z);}
    for(let i=s.projectiles.length;i<projectilePool.length;i++)projectilePool[i].visible=false;
    for(const item of cullables)item.object.visible=Math.hypot(item.object.position.x-p.x,item.object.position.z-p.z)<item.radius||!!view.title;
    for(const tree of trees)if(tree.root.visible){tree.crown.rotation.z=reduced?0:Math.sin(t*1.1+tree.phase)*(.025+.025*weather.wind);tree.crown.rotation.x=reduced?0:Math.sin(t*.8+tree.phase)*.018;}
    for(const flag of flags){const pos=flag.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);pos.setZ(i,reduced?0:Math.sin(t*3+y*3)*.1*(1.2-y));}pos.needsUpdate=true;}
    const riverPos=riverGeo.attributes.position;for(let i=0;i<riverPos.count;i++)riverPos.setY(i,(reduced?0:Math.sin(t*1.3+riverPos.getX(i)*.35)*.055));riverPos.needsUpdate=true;
    const seaPos=seaGeo.attributes.position;for(let i=0;i<seaPos.count;i++)seaPos.setY(i,(reduced?0:Math.sin(t*.6+seaPos.getX(i)*.12+seaPos.getZ(i)*.15)*.18));seaPos.needsUpdate=true;
    for(const drop of rain){drop.mesh.visible=weather.rain>.1&&!reduced&&!view.title;drop.mesh.position.set(p.x+drop.x+Math.sin(t*.4)*2,terrainHeight(p.x,p.z)+((drop.phase-t*13)%12+12)%12,p.z+drop.z);drop.mesh.rotation.z=.2;}
    clouds.forEach((c,i)=>{c.position.x=-55+i*26+(reduced?0:Math.sin(t*.006+i)*10);});
    const warmth=weather.day*(1-weather.rain*.32);sunlight.intensity=2.7*warmth;sunlight.position.set(-27+Math.sin(t*.01)*15,60,35);ambient.intensity=1.8+weather.rain*.35;
    scene.background.set(weather.rain>.5?'#9cb8b8':'#a6c9c5');scene.fog.color.copy(scene.background);seaMat.color.set(weather.rain>.5?'#3e7380':palette.sea);
    const title=!!view.title;const yaw=title?-.36:view.yaw??0,pitch=title?.5:view.pitch??.57,distance=title?20:13.4;
    const target=new THREE.Vector3(p.x,surface(s,p.x,p.z)+1.6,p.z);
    if(title)target.set(-1,3,29);
    const destination=target.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance));
    destination.y=Math.max(destination.y,terrainHeight(destination.x,destination.z)+1.4);
    const amount=first||view.snap?1:1-Math.exp(-Math.max(.001,delta)*(reduced?18:9));look.lerp(target,amount);camPosition.lerp(destination,amount);
    if(!title){scene.updateMatrixWorld(true);clearCameraSight(look,camPosition);}
    camera.position.copy(camPosition);camera.lookAt(look);first=false;
    sunlight.target.position.copy(player.root.position);
    renderer.render(scene,camera);
  }
  function resize(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function project(x,y,z){const v=new THREE.Vector3(x,y,z).project(camera);return{x:(v.x*.5+.5)*canvas.clientWidth,y:(-.5*v.y+.5)*canvas.clientHeight,visible:v.z>-1&&v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.1};}
  function dispose(){renderer.dispose();skyEnvironment?.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}
  return {renderer,canvas,scene,camera,update,resize,project,dispose};
}
