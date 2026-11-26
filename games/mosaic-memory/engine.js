(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MosaicEngine=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  class Board{
    constructor(pairs=6,rng=Math.random){this.cards=shuffle(Array.from({length:pairs*2},(_,i)=>({value:Math.floor(i/2),matched:false})),rng);this.open=[];this.matches=0;this.moves=0;this.elapsed=0;this.lock=0;this.peek=0;this.hints=0;this.done=false;}
    flip(i){if(this.done||this.lock>0||this.peek>0||!Number.isInteger(i)||!this.cards[i]||this.cards[i].matched||this.open.includes(i))return'rejected';this.open.push(i);if(this.open.length===1)return'first';this.moves++;const [a,b]=this.open;if(this.cards[a].value===this.cards[b].value){this.cards[a].matched=this.cards[b].matched=true;this.matches++;this.open=[];if(this.matches*2===this.cards.length)this.done=true;return'match';}this.lock=.95;return'mismatch';}
    step(dt){if(this.done||!Number.isFinite(dt)||dt<0)return;dt=Math.min(dt,.1);this.elapsed+=dt;if(this.lock>0){this.lock=Math.max(0,this.lock-dt);if(this.lock===0)this.open=[];}this.peek=Math.max(0,this.peek-dt);}
    hint(){if(this.done||this.lock>0||this.peek>0)return false;this.hints++;this.peek=1.8;return true;}
    points(){return Math.max(100,Math.round(2000-this.moves*25-this.elapsed*3-this.hints*150));}
    visible(i){return this.cards[i].matched||this.open.includes(i)||this.peek>0;}
  }
  return{Board,shuffle};
});
