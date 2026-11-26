const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const api=import(pathToFileURL(path.resolve(__dirname,'../../assets/wwg-three-scene.js')));
function surface(){
  const calls=[];
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){calls.push({alpha:this.globalAlpha,color:this.fillStyle})}};
  return {width:1,height:1,style:{},calls,getContext:kind=>kind==='2d'?ctx:null};
}
async function scene(){
  const {THREE,createRenderer}=await api,canvas=surface(),renderer=createRenderer(canvas,{forceSoftware:true});
  renderer.setSize(640,400);
  const s=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1.6,.1,100);camera.position.z=5;camera.lookAt(0,0,0);
  return{THREE,canvas,renderer,s,camera};
}
test('near plane clipping retains visible triangles and rejects geometry behind the camera',async()=>{
  const {clipNear}=await api;
  assert.equal(clipNear([{x:-1,y:0,z:-1},{x:1,y:0,z:-1},{x:0,y:1,z:.5}],.1).length,4);
  assert.equal(clipNear([{x:0,y:0,z:1},{x:1,y:0,z:1},{x:0,y:1,z:1}],.1).length,0);
  assert.ok(clipNear([{x:-1,y:0,z:-1},{x:1,y:0,z:-1},{x:0,y:1,z:.5}],.1).every(v=>v.z<=-.1));
});
test('fallback projects real indexed meshes and respects hidden groups',async()=>{
  const {THREE,renderer,s,camera,canvas}=await scene();
  const group=new THREE.Group();group.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'#edc881'})));s.add(group);
  renderer.render(s,camera);assert.equal(renderer.mode,'software');assert.ok(renderer.info.render.triangles>0);assert.ok(canvas.calls.length>0);
  group.visible=false;renderer.render(s,camera);assert.equal(renderer.info.render.triangles,0);
});
test('instanced objects have independent world transforms and frustum culling',async()=>{
  const {THREE,renderer,s,camera}=await scene();
  const instances=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.6,.6),new THREE.MeshBasicMaterial(),3);
  const m=new THREE.Matrix4();instances.setMatrixAt(0,m.makeTranslation(-1,0,0));instances.setMatrixAt(1,m.makeTranslation(1,0,0));instances.setMatrixAt(2,m.makeTranslation(500,0,0));s.add(instances);
  renderer.render(s,camera);assert.equal(renderer.info.render.calls,2);assert.ok(renderer.info.render.triangles>=4);
});
test('transparent materials, vertex colors and near-plane crossings remain finite',async()=>{
  const {THREE,renderer,s,camera}=await scene();camera.position.set(0,0,0);camera.lookAt(0,0,-1);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,-2,1,-1,-2,0,1,.5],3));geo.setAttribute('color',new THREE.Float32BufferAttribute([.2,.6,.4,.3,.7,.5,.1,.5,.3],3));
  s.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.5})));
  renderer.render(s,camera);assert.equal(renderer.info.render.triangles,2);
  for(const t of renderer.polygons){assert.equal(t.alpha,.5);for(const k of ['x0','y0','x1','y1','x2','y2','depth'])assert.ok(Number.isFinite(t[k]),k);assert.match(t.color,/^rgb\(/);}
});
test('lighting, fog and emissive objects produce readable finite colors',async()=>{
  const {THREE,renderer,s,camera}=await scene();s.fog=new THREE.Fog('#537c77',3,12);s.add(new THREE.HemisphereLight('#d5eeee','#244f32',1.4));
  const sun=new THREE.DirectionalLight('#ffe1af',2);sun.position.set(3,6,3);s.add(sun);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#86b7a4',emissive:'#075e50',emissiveIntensity:.4}));s.add(mesh);
  renderer.render(s,camera);assert.ok(renderer.polygons.length>0);assert.ok(renderer.polygons.every(t=>!t.color.includes('NaN')));
});
test('resizing caps the software surface and dispose stops drawing',async()=>{
  const {THREE,renderer,s,camera,canvas}=await scene();renderer.setSize(4000,3000);assert.ok(canvas.width<=1100&&canvas.height<=760);
  s.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial()));renderer.render(s,camera);const count=canvas.calls.length;
  renderer.dispose();renderer.render(s,camera);assert.equal(canvas.calls.length,count);
});
