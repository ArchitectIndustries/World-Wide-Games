'use strict';
const assert=require('node:assert/strict');
const CAM=require('../games/aegis-verge/camera-occlusion.js');
const VP=require('../games/aegis-verge/camera-vista.js');
const T=require('../games/aegis-verge/tactics.js');
let n=0;function ok(label,test){assert.ok(test,label);n++}
const p={x:0,z:-27,yaw:0},cover=T.coverFor(0),focus={x:0,y:1.55,z:-27},s=VP.create();
ok('new view is chase',s.mode==='chase');
const chase=CAM.resolve(p,cover);ok('default camera backward compatible',chase.eye.y===8&&chase.eye.z===-38);
const wide=CAM.resolve(p,cover,'tactical');
ok('tactical provides wider, elevated viewpoint',wide.eye.y===11&&wide.eye.z===-42);
ok('tactical target looks farther ahead',wide.target.z>chase.target.z);
ok('tactical camera collision clear',CAM.first(focus,wide.eye,cover)===null);
ok('profile mode toggle',VP.toggle(s)==='tactical'&&s.transitions===1);
const a=VP.follow(s,chase,p,cover,CAM,0);ok('camera initializes from valid reference pose',a.eye.y===8);
const b=VP.follow(s,wide,p,cover,CAM,1/60);ok('camera interpolates to tactical safely',b.eye.y>8&&b.eye.y<11);
ok('lerp eye never inside real obstacle',CAM.first(focus,b.eye,cover)===null);
const c=VP.follow(s,wide,p,cover,CAM,.08);ok('camera advances toward target',c.eye.y>b.eye.y);
ok('camera can instant-transition for reduced FX',VP.follow(s,wide,p,cover,CAM,.03,true).eye.y===11);
ok('goal remains unchanged',JSON.stringify(p)==='{"x":0,"z":-27,"yaw":0}');
ok('cover unchanged',JSON.stringify(cover)===JSON.stringify(T.coverFor(0)));
ok('switch back to chase',VP.toggle(s)==='chase');
const d=VP.follow(s,chase,p,cover,CAM,.03,true);ok('returns to chase immediately for accessibility',d.eye.y===8);
VP.reset(s);ok('reset clears interpolation but retains chosen mode',s.eye===null&&s.mode==='chase');
const wall={id:42,x:0,z:-3,w:4,d:1,h:15};const safe=CAM.resolve({x:0,z:0,yaw:0},[wall],'tactical');
ok('tactical view collides with cover and repositions',safe.mode==='elevated'||safe.mode==='shortened'||safe.mode==='overhead');
ok('repositioned camera passes 3D collision check',CAM.first({x:0,y:1.55,z:0},safe.eye,[wall])===null);
ok('failed line of sight transition snaps to goal',(() => {s.eye={x:0,y:3,z:0};s.target={x:0,y:1,z:5};const pose=VP.follow(s,safe,{x:0,z:0,yaw:0},[wall],CAM,.02);return CAM.first({x:0,y:1.55,z:0},pose.eye,[wall])===null;})());
for(let op=0;op<3;op++)for(const yaw of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
 const player={x:0,z:0,yaw},blocks=T.coverFor(op),goal=CAM.resolve(player,blocks,'tactical');ok('all operations and headings produce finite safe tactical camera',Number.isFinite(goal.eye.x)&&Number.isFinite(goal.eye.y)&&Number.isFinite(goal.eye.z)&&!CAM.first({x:0,y:1.55,z:0},goal.eye,blocks));}
ok('invalid camera pose rejected without mutating state',VP.follow(s,{eye:{x:NaN,y:1,z:0},target:{x:0,y:0,z:0}},p,[],CAM,.016)===null);
console.log(JSON.stringify({passed:n,failed:0,feature:'Tactical Vista bounded camera occlusion and interpolation'}));
