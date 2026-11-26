(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrchardEngine=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function random(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function segmentDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/len)):0;return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
  class Run{
    constructor(mode='classic',seed=1){this.mode=mode;this.rng=random(seed);this.items=[];this.particles=[];this.time=0;this.score=0;this.lives=3;this.combo=0;this.lastCut=-10;this.spawnAt=.2;this.sliced=0;this.over=false;this.nextId=1;}
    spawn(){const count=2+Math.floor(this.rng()*3);for(let i=0;i<count;i++){const x=100+this.rng()*700;this.items.push({id:this.nextId++,x,y:620,vx:(450-x)*.32+(this.rng()-.5)*95,vy:-670-this.rng()*140,r:29+this.rng()*6,kind:this.mode!=='zen'&&this.time>3&&this.rng()<.19?'hazard':Math.floor(this.rng()*4),angle:this.rng()*6,spin:(this.rng()-.5)*4,cut:false});}}
    step(dt){if(this.over||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);this.time=Math.min(60,this.time+dt);if(this.time>=60){this.over=true;return;}if(this.time>=this.spawnAt){this.spawn();this.spawnAt=this.time+Math.max(.62,1.18-this.time*.006)+this.rng()*.26;}
      for(const x of this.items){x.vy+=840*dt;x.x+=x.vx*dt;x.y+=x.vy*dt;x.angle+=x.spin*dt;}this.items=this.items.filter(x=>!x.cut&&x.y<690&&x.x>-80&&x.x<980);
      for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=470*dt;p.life-=dt;}this.particles=this.particles.filter(x=>x.life>0);if(this.time-this.lastCut>.65)this.combo=0;
    }
    slice(ax,ay,bx,by){if(this.over||![ax,ay,bx,by].every(Number.isFinite))return[];const hit=[];for(const x of this.items){if(x.cut||segmentDistance(x.x,x.y,ax,ay,bx,by)>x.r+5)continue;x.cut=true;hit.push(x);
        if(x.kind==='hazard'){this.lives--;this.combo=0;this.score=Math.max(0,this.score-50);if(this.lives<=0){this.lives=0;this.over=true;break;}}
        else{this.combo=this.time-this.lastCut<=.65?Math.min(5,this.combo+1):1;this.lastCut=this.time;this.score+=10*this.combo;this.sliced++;for(let i=0;i<8;i++)this.particles.push({x:x.x,y:x.y,vx:(this.rng()-.5)*220,vy:(this.rng()-.65)*220,kind:x.kind,life:.4+this.rng()*.25});}
      }return hit;
    }
  }
  return{Run,random,segmentDistance};
});
