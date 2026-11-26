const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.join(__dirname,'../..');

// Real Three geometry and the shared software projection pipeline, with drawing
// commands modeled rather than a browser or a GPU. No texture requests leave
// this process. These checks do not measure actual browser frame rate or pixels.
const fixture=(async()=>{
  const context=new Proxy({createLinearGradient(){return{addColorStop(){}};}},{get(o,key){return key in o?o[key]:(()=>{});},set(o,key,value){o[key]=value;return true;}});
  globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(value){},width:0,height:0};}};
  const canvas={width:1000,height:600,clientWidth:1000,clientHeight:600,style:{},getContext:type=>type==='2d'?context:null};
  const {THREE}=await import(pathToFileURL(path.join(root,'assets/wwg-three-scene.js')));
  const {createValley}=await import(pathToFileURL(path.join(root,'games/solstice-wilds/scene.js')));
  const model=await import(pathToFileURL(path.join(root,'games/solstice-wilds/model.js')));
  const valley=createValley(canvas);valley.resize(1000,600);return{THREE,valley,model};
})();
after(async()=>{(await fixture).valley.dispose();});

function visibleOpaque(hit){
  for(let object=hit.object;object;object=object.parent)if(!object.visible)return false;
  const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
  return material&&(!material.transparent||material.opacity>=.8);
}
function obstructionHits(THREE,valley,state,model){
  const nominalHead=new THREE.Vector3(state.player.x,model.terrainHeight(state.player.x,state.player.z)+1.6,state.player.z);
  const distance=nominalHead.distanceTo(valley.camera.position),direction=valley.camera.getWorldDirection(new THREE.Vector3());
  // Stop before the explorer's own body, which is supposed to occupy the center.
  const ray=new THREE.Raycaster(valley.camera.position,direction,.08,Math.max(.08,distance-1.2));
  return ray.intersectObjects(valley.scene.children,true).filter(visibleOpaque);
}

test('spawn camera remains unobstructed at its preferred yaw and when orbiting behind the lighthouse',async()=>{
  const {THREE,valley,model}=await fixture,state=model.createExpedition(7331);
  for(const yaw of [-.44,0,.44,1.2,2.5]){
    valley.update(state,1/30,{yaw,pitch:.57,snap:true});
    assert.equal(obstructionHits(THREE,valley,state,model).length,0,`Spawn view is blocked at yaw ${yaw}`);
    const head=new THREE.Vector3(0,model.terrainHeight(0,35)+1.6,35),distance=head.distanceTo(valley.camera.position);
    if(yaw===-.44)assert.ok(Math.abs(distance-13.4)<.01);
    if(yaw===0)assert.ok(distance>3&&distance<7,'Tower obstruction should shorten the camera boom');
  }
});

test('camera clears terrain, archive masonry, workshop and tree canopy across orbit directions',async()=>{
  const {THREE,valley,model}=await fixture,state=model.createExpedition(7331);
  const sites=[['archive',-31,9],['workshop',28,20],['counterweight bench',31,22],['sluice',25,-5.8],['winch',20,-10],['spire',2,-33],['coastal tree',13,45]];
  for(const [name,x,z]of sites){
    state.player.x=x;state.player.z=z;
    for(const yaw of [0,.75,Math.PI,-1.4]){
      valley.update(state,1/30,{yaw,pitch:.38,snap:true});
      assert.equal(obstructionHits(THREE,valley,state,model).length,0,`${name} view blocked at yaw ${yaw}`);
      assert.ok(valley.camera.position.y>model.terrainHeight(valley.camera.position.x,valley.camera.position.z),'Camera must remain above terrain');
    }
  }
});

test('software scene stays within its visible mesh budget at representative route locations',async()=>{
  const {valley,model}=await fixture,state=model.createExpedition(7331);state.weatherTime=80;
  assert.equal(valley.renderer.mode,'software');
  for(const [w,h]of[[1000,600],[1320,720]]){
    valley.resize(w,h);
    for(const [x,z]of[[0,35],[-31,9],[30,23],[31,22],[25,-5.8],[20,-10],[2,-33]]){
      state.player.x=x;state.player.z=z;valley.update(state,1/30,{yaw:-.44,pitch:.57,snap:true});
      const triangles=valley.renderer.info.render.triangles;
      assert.ok(triangles>200,`Expected a visible 3D world at ${x},${z}`);
      assert.ok(triangles<=3000,`Software geometry budget exceeded at ${x},${z}, ${w}x${h}: ${triangles}`);
    }
  }
});

test('bridge leaves, counterweight and collision agree through deployment, pause and lock',async()=>{
  const {valley,model}=await fixture,state=model.createExpedition(7331);state.completed.archive=true;state.archiveRead=true;state.archiveStep=3;
  Object.assign(state.tideworks,{installed:true,setting:model.RUNES.findIndex(r=>r.id===state.sequence[0]),phase:'lowering'});state.player.x=20;state.player.z=-10;
  valley.update(state,1/30,{yaw:-.44,pitch:.57,snap:true});const south=valley.scene.getObjectByName('South bridge leaf'),north=valley.scene.getObjectByName('North bridge leaf'),weight=valley.scene.getObjectByName('Tideworks counterweight'),wheel=valley.scene.getObjectByName('Tideworks waterwheel');
  assert.ok(south.rotation.x>1.2&&north.rotation.x< -1.2);const highWeight=weight.position.y;
  for(let i=0;i<108;i++)model.stepExpedition(state,{},1/60);valley.update(state,1/30,{yaw:-.44,pitch:.57,snap:true});assert.ok(Math.abs(south.rotation.x-.61)<.015);assert.equal(model.canOccupy(state,20,-18),false);assert.ok(weight.position.y<highWeight);
  const angles=[south.rotation.x,north.rotation.x,weight.position.y,wheel.rotation.z];model.setPaused(state,true);model.stepExpedition(state,{},.25);valley.update(state,.25,{yaw:-.44,pitch:.57,snap:true});assert.deepEqual([south.rotation.x,north.rotation.x,weight.position.y,wheel.rotation.z],angles);model.setPaused(state,false);
  for(let i=0;i<110;i++)model.stepExpedition(state,{},1/60);valley.update(state,1/30,{yaw:-.44,pitch:.57,snap:true,reducedMotion:true});assert.equal(south.rotation.x,0);assert.equal(Math.abs(north.rotation.x),0);assert.equal(model.canOccupy(state,20,-18),true);assert.equal(wheel.rotation.z,0);
});

test('software ocean cannot overpaint the inland traversal surface',async()=>{
  const {valley}=await fixture;
  const ocean=valley.scene.getObjectByName('Coastal ocean'),g=ocean.geometry,p=g.attributes.position,index=g.index.array;
  assert.ok(index.length>0);
  for(let i=0;i<index.length;i+=3){
    const triangle=[index[i],index[i+1],index[i+2]].map(j=>({x:p.getX(j),z:p.getZ(j)}));
    assert.ok(triangle.every(v=>v.x<=-50)||triangle.every(v=>v.x>=50)||triangle.every(v=>v.z<=-50)||triangle.every(v=>v.z>=50),'Ocean triangle overlaps the walkable island');
  }
});
