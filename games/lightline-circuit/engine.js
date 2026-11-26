(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LightlineEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const COLS = 44, ROWS = 28;
  const DIRS = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
  const LEVELS = {
    cruise: {label:'Cruise', tick:170, randomness:0.32},
    circuit: {label:'Circuit', tick:135, randomness:0.12},
    velocity: {label:'Velocity', tick:105, randomness:0.03}
  };
  const ARENAS = ['Open current','Split channels','Four beacons','The exchange','Final orbit'];
  const index = (x,y) => y*COLS+x;
  const inside = (x,y) => x>=0 && y>=0 && x<COLS && y<ROWS;
  const opposite = (a,b) => (a+2)%4===b;
  function seeded(seed) { let n=seed>>>0||1; return () => {n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296;}; }
  function obstacles(round) {
    const cells=[];
    function block(x,y,w,h) {for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)cells.push(index(i,j));}
    if(round===2){block(15,8,2,7);block(27,13,2,7);}
    if(round===3){for(const x of [13,29])for(const y of [8,18])block(x,y,2,2);}
    if(round===4){block(20,8,4,3);block(20,17,4,3);block(12,13,5,2);block(27,13,5,2);}
    if(round===5){block(19,11,6,6);block(9,5,3,2);block(32,21,3,2);}
    return cells;
  }
  class Circuit {
    constructor({difficulty='circuit', seed=1}={}) {
      this.difficulty=LEVELS[difficulty]?difficulty:'circuit';this.rng=seeded(seed);
      this.round=1;this.wins=[0,0,0,0];this.totalScore=0;this.roundScores=[];
      this.setup();
    }
    setup() {
      this.board=new Int8Array(COLS*ROWS);this.board.fill(-1);
      this.blocks=obstacles(this.round);for(const p of this.blocks)this.board[p]=4;
      const starts=[{x:7,y:6,dir:1},{x:36,y:6,dir:2},{x:36,y:21,dir:3},{x:7,y:21,dir:0}];
      this.riders=starts.map((s,id)=>({...s,id,alive:true,trail:[index(s.x,s.y)],reason:null}));
      for(const r of this.riders)this.board[index(r.x,r.y)]=r.id;
      this.turns=[];this.boost=16;this.moves=0;this.roundScore=0;this.status='ready';this.outcome=null;this.ticks=0;
    }
    start() {if(this.status!=='ready')return false;this.status='running';return true;}
    next() {if(this.status!=='round-over'||this.round>=5)return false;this.round++;this.setup();return true;}
    queueTurn(dir) {
      if((this.status!=='running'&&this.status!=='ready')||!this.riders[0].alive||!Number.isInteger(dir)||dir<0||dir>3||this.turns.length>=2)return false;
      const previous=this.turns.length?this.turns[this.turns.length-1]:this.riders[0].dir;
      if(previous===dir||opposite(previous,dir))return false;
      this.turns.push(dir);return true;
    }
    clearInput() {this.turns=[];}
    free(x,y) {return inside(x,y)&&this.board[index(x,y)]===-1;}
    room(x,y) {
      if(!this.free(x,y))return 0;
      const queue=[index(x,y)],visited=new Uint8Array(COLS*ROWS);visited[queue[0]]=1;
      let read=0;
      while(read<queue.length && queue.length<550){
        const p=queue[read++],px=p%COLS,py=Math.floor(p/COLS);
        for(const d of DIRS){const nx=px+d.x,ny=py+d.y;if(!this.free(nx,ny))continue;const k=index(nx,ny);if(!visited[k]){visited[k]=1;queue.push(k);}}
      }
      return queue.length;
    }
    ai(r) {
      const candidates=[r.dir,(r.dir+1)%4,(r.dir+3)%4].map(dir=>{
        const d=DIRS[dir],x=r.x+d.x,y=r.y+d.y;
        if(!this.free(x,y))return {dir,value:-Infinity};
        const exits=DIRS.reduce((n,v)=>n+(this.free(x+v.x,y+v.y)?1:0),0);
        return {dir,value:this.room(x,y)+exits*3+(dir===r.dir?2:0)+this.rng()};
      }).filter(c=>Number.isFinite(c.value)).sort((a,b)=>b.value-a.value);
      if(!candidates.length)return r.dir;
      const random=LEVELS[this.difficulty].randomness;
      // Difficulty affects choices, never the collision rules or information available.
      if(candidates.length>1&&this.rng()<random)return candidates[Math.floor(this.rng()*Math.min(candidates.length,2))].dir;
      return candidates[0].dir;
    }
    move(ids) {
      const proposals=ids.filter(id=>this.riders[id].alive).map(id=>{
        const r=this.riders[id],d=DIRS[r.dir],x=r.x+d.x,y=r.y+d.y;
        return {id,x,y,key:index(x,y),reason:!inside(x,y)?'boundary':this.board[index(x,y)]!==-1?'trail':null};
      });
      const destinations=new Map();
      for(const p of proposals){if(p.reason)continue;const group=destinations.get(p.key)||[];group.push(p);destinations.set(p.key,group);}
      for(const group of destinations.values())if(group.length>1)for(const p of group)p.reason='head-on';
      const crashes=[];
      for(const p of proposals){
        const r=this.riders[p.id];
        if(p.reason){r.alive=false;r.reason=p.reason;crashes.push({id:p.id,x:r.x,y:r.y,reason:p.reason});}
        else {r.x=p.x;r.y=p.y;r.trail.push(p.key);this.board[p.key]=r.id;if(r.id===0){this.moves++;this.roundScore+=2;}}
      }
      if(this.riders[0].alive)this.roundScore+=crashes.filter(c=>c.id!==0).length*100;
      return crashes;
    }
    finishIfNeeded() {
      const live=this.riders.filter(r=>r.alive);
      if(live.length>1)return false;
      const winner=live.length?live[0].id:null;
      if(winner!==null){this.wins[winner]++;if(winner===0)this.roundScore+=250;}
      this.totalScore+=this.roundScore;this.roundScores.push(this.roundScore);
      this.outcome={winner,draw:winner===null,score:this.roundScore};
      this.status=this.round===5?'complete':'round-over';this.turns=[];
      return true;
    }
    step(wantsBoost=false) {
      if(this.status!=='running')return {crashes:[],finished:false};
      this.ticks++;
      if(this.riders[0].alive&&this.turns.length)this.riders[0].dir=this.turns.shift();
      for(const r of this.riders.slice(1))if(r.alive)r.dir=this.ai(r);
      const crashes=this.move(this.riders.filter(r=>r.alive).map(r=>r.id));
      if(this.finishIfNeeded())return {crashes,finished:true};
      if(wantsBoost&&this.riders[0].alive&&this.boost>0){
        this.boost--;
        if(this.turns.length)this.riders[0].dir=this.turns.shift();
        crashes.push(...this.move([0]));
      }
      return {crashes,finished:this.finishIfNeeded()};
    }
    leaders() {const best=Math.max(...this.wins);return this.wins.map((w,i)=>w===best?i:null).filter(i=>i!==null);}
  }
  return {Circuit,COLS,ROWS,DIRS,LEVELS,ARENAS,index,inside,opposite};
});
