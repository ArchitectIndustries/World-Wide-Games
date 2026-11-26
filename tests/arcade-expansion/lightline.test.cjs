const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../../games/lightline-circuit/engine.js');
const {Circuit,COLS,ROWS,index}=E;
function emptyFixture(riders){const c=new Circuit({seed:7});c.board.fill(-1);c.riders=riders.map((r,id)=>({...r,id,trail:[index(r.x,r.y)],reason:null}));for(const r of c.riders)if(r.alive)c.board[index(r.x,r.y)]=r.id;c.status='running';c.ai=r=>r.dir;return c;}
test('all five arenas spawn safely and progress only deliberately',()=>{
  const c=new Circuit();assert.equal(c.status,'ready');const first=c.board.slice();c.step();assert.deepEqual(c.board,first);assert.equal(c.next(),false);
  for(let round=1;round<=5;round++){assert.equal(c.round,round);for(const r of c.riders){assert.equal(c.board[index(r.x,r.y)],r.id);const d=E.DIRS[r.dir];assert.equal(c.free(r.x+d.x,r.y+d.y),true);}assert.equal(c.start(),true);assert.equal(c.start(),false);c.riders.slice(1).forEach(r=>r.alive=false);c.finishIfNeeded();if(round<5)assert.equal(c.next(),true);else assert.equal(c.next(),false);}
  assert.equal(c.status,'complete');assert.equal(c.wins[0],5);
});
test('reverse and repeated turn commands cannot turn through an occupied trail',()=>{
  const c=new Circuit();c.start();assert.equal(c.queueTurn(3),false);assert.equal(c.queueTurn(1),false);assert.equal(c.queueTurn(0),true);assert.equal(c.queueTurn(2),false);assert.equal(c.queueTurn(3),true);assert.equal(c.queueTurn(2),false);assert.deepEqual(c.turns,[0,3]);
});
test('same destination is a simultaneous head-on draw',()=>{
  const c=emptyFixture([{x:10,y:10,dir:1,alive:true},{x:12,y:10,dir:3,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);
  const r=c.step();assert.deepEqual(r.crashes.map(v=>v.reason),['head-on','head-on']);assert.equal(r.finished,true);assert.equal(c.outcome.draw,true);assert.deepEqual(c.wins,[0,0,0,0]);assert.equal(c.totalScore,0);
});
test('swapping occupied head cells crashes both riders without ordering bias',()=>{
  const c=emptyFixture([{x:10,y:10,dir:1,alive:true},{x:11,y:10,dir:3,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);
  c.step();assert.equal(c.riders[0].alive,false);assert.equal(c.riders[1].alive,false);assert.equal(c.outcome.draw,true);
});
test('walls and previous trails are actual lethal geometry',()=>{
  const c=emptyFixture([{x:COLS-1,y:10,dir:1,alive:true},{x:11,y:12,dir:1,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);c.step();assert.equal(c.riders[0].reason,'boundary');assert.equal(c.outcome.winner,1);
  const d=emptyFixture([{x:10,y:10,dir:1,alive:true},{x:15,y:10,dir:1,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);d.board[index(11,10)]=0;d.step();assert.equal(d.riders[0].reason,'trail');
});
test('boost moves two cells and spends only a finite extra-cell reserve',()=>{
  const c=emptyFixture([{x:2,y:3,dir:1,alive:true},{x:2,y:20,dir:1,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);
  c.boost=2;c.step(true);assert.equal(c.riders[0].x,4);assert.equal(c.boost,1);assert.equal(c.roundScore,4);c.step(true);assert.equal(c.riders[0].x,6);assert.equal(c.boost,0);c.step(true);assert.equal(c.riders[0].x,7);assert.equal(c.boost,0);
});
test('boost cannot tunnel across a trail or a live stationary rival head',()=>{
  const c=emptyFixture([{x:8,y:10,dir:1,alive:true},{x:10,y:9,dir:2,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);
  c.step(true);assert.equal(c.riders[0].x,9);assert.equal(c.riders[0].alive,false);assert.equal(c.riders[0].reason,'trail');assert.equal(c.outcome.winner,1);assert.equal(c.totalScore,2);
});
test('only a surviving player receives outlast points, and terminal steps are idempotent',()=>{
  const c=emptyFixture([{x:5,y:10,dir:1,alive:true},{x:COLS-1,y:9,dir:1,alive:true},{x:2,y:2,dir:1,alive:false},{x:3,y:3,dir:1,alive:false}]);c.step();assert.equal(c.roundScore,352);assert.equal(c.totalScore,352);assert.equal(c.wins[0],1);for(let i=0;i<20;i++)c.step(true);assert.equal(c.totalScore,352);assert.equal(c.wins[0],1);assert.equal(c.roundScores.length,1);
});
test('input clearing prevents queued movement from surviving interruption',()=>{
  const c=new Circuit();c.start();c.queueTurn(0);c.clearInput();c.step();assert.equal(c.riders[0].dir,1);
});
test('AI selects a legal escape when a forward crash is avoidable',()=>{
  const c=new Circuit({difficulty:'velocity',seed:18});const r=c.riders[1];r.x=20;r.y=13;r.dir=1;c.board.fill(-1);c.board[index(20,13)]=1;c.board[index(21,13)]=4;c.board[index(20,14)]=4;
  assert.equal(c.ai(r),0);
});
test('fifty deterministic five-round AI matches terminate with finite scores and valid bounds',()=>{
  for(let seed=1;seed<=50;seed++){
    const c=new Circuit({seed,difficulty:['cruise','circuit','velocity'][seed%3]});
    for(let round=1;round<=5;round++){
      c.start();let tick=0;
      while(c.status==='running'&&tick++<COLS*ROWS){if(c.riders[0].alive)c.queueTurn(c.ai(c.riders[0]));c.step(tick%9===0);}
      assert.ok(tick<COLS*ROWS,`seed ${seed} round ${round} stalled`);assert.ok(c.totalScore>=0&&Number.isFinite(c.totalScore));for(const r of c.riders){assert.ok(r.x>=0&&r.x<COLS&&r.y>=0&&r.y<ROWS);assert.ok(r.trail.length<=COLS*ROWS);}
      if(round<5)assert.equal(c.next(),true);
    }
    assert.equal(c.status,'complete');assert.equal(c.roundScores.length,5);assert.ok(c.wins.reduce((a,b)=>a+b,0)<=5);
  }
});
