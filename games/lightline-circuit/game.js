(() => {
  'use strict';
  const {Circuit,COLS,ROWS,DIRS,LEVELS,ARENAS}=window.LightlineEngine;
  const $=id=>document.getElementById(id);
  const canvas=$('arena'),ctx=canvas.getContext('2d');
  const COLORS=['#6de9ed','#ffa277','#cfa7ff','#d5ed7b'];
  const NAMES=['You','Ember','Orchid','Citron'];
  const SIGNS=['▲','◆','■','●'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params=new URLSearchParams(location.search);
  const parsedVolume=Number(params.get('volume')??0.5);
  const volume=Number.isFinite(parsedVolume)?Math.max(0,Math.min(1,parsedVolume)):0.5;
  const audioAllowed=params.get('muted')!=='1'&&volume>0;
  let soundOn=false,audio=null;
  let match=new Circuit({seed:Date.now()}),paused=false,boostHeld=false,boostPulses=0;
  let accumulator=0,last=0,grace=0,reported=false,best=0,swipe=null,view={w:0,h:0,scale:1,x:0,y:0};
  let sparkles=[];
  const held=new Set();
  const storageKey=()=>`wwg.lightline-circuit.v1.best.${match.difficulty}`;
  function readBest(){try{const n=Number(localStorage.getItem(storageKey()));best=Number.isFinite(n)?Math.max(0,Math.min(1000000,Math.floor(n))):0;}catch{best=0;}$('best').textContent=best.toLocaleString();}
  function saveBest(){if(match.totalScore<=best)return;best=match.totalScore;try{localStorage.setItem(storageKey(),String(best));}catch{/* Play remains available when storage is denied. */}$('best').textContent=best.toLocaleString();}
  function sound(frequency=400,duration=.09){
    if(!audioAllowed||!soundOn)return;
    try{
      if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='triangle';oscillator.frequency.setValueAtTime(frequency,audio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(Math.max(60,frequency*.7),audio.currentTime+duration);
      gain.gain.setValueAtTime(.055*volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);
    }catch{/* Sound is optional. */}
  }
  function setStatus(text){$('status').textContent=text;}
  function clearInput(){held.clear();boostHeld=false;boostPulses=0;swipe=null;match.clearInput();$('boost').classList.remove('held');}
  function hud(){
    $('round').textContent=`${String(match.round).padStart(2,'0')} / 05`;
    const current=match.status==='ready'||match.status==='running'?match.roundScore:0;
    $('score').textContent=(match.totalScore+current).toLocaleString();$('fuel').textContent=match.boost;
    $('arena-name').textContent=ARENAS[match.round-1].toUpperCase();
    const live=match.riders.filter(r=>r.alive).length;$('riders-left').textContent=`${live} RIDER${live===1?'':'S'}`;
    for(let i=0;i<4;i++)$('wins-'+i).textContent=match.wins[i];
    $('boost').disabled=paused||match.status!=='running'||!match.riders[0].alive||match.boost===0;
    $('pause').disabled=match.status!=='running';$('pause').textContent=paused?'Resume':'Pause';
  }
  function scoreboard(){
    $('result-board').replaceChildren();
    for(let i=0;i<4;i++){const row=document.createElement('div');row.style.color=COLORS[i];row.append(document.createTextNode(SIGNS[i]+' '+NAMES[i].toUpperCase()));const wins=document.createElement('b');wins.textContent=match.wins[i];row.append(wins);$('result-board').append(row);}
  }
  function showPanel(mode){
    $('panel').hidden=false;$('settings').hidden=mode!=='ready';$('result-board').hidden=!['round','complete'].includes(mode);
    const title=$('panel-title'),copy=$('panel-copy'),action=$('action'),tip=$('panel-tip');
    if(mode==='ready'){
      $('eyebrow').textContent='FIVE ROUNDS · FOUR RIDERS';title.innerHTML='Leave a line.<br>Find a way out.';
      copy.textContent='Your trail becomes a wall. Outlast three rivals, avoid every line, and save your boost for the space that matters.';
      action.textContent='Start circuit';tip.textContent='You are the cyan triangle. A short countdown gives you time to choose your line.';
    }else if(mode==='paused'){
      $('eyebrow').textContent='THE CIRCUIT IS PAUSED';title.textContent='Your line can wait.';copy.textContent='Nothing moves while you are away. Resume when you are ready; your score, boost, and position are preserved.';action.textContent='Resume circuit';tip.textContent='Arrows / WASD steer. Space boosts. P pauses or resumes.';
    }else if(mode==='round'){
      $('eyebrow').textContent=`ROUND ${match.round} OF 5 · ${ARENAS[match.round-1].toUpperCase()}`;
      title.textContent=match.outcome.draw?'No line left standing.':match.outcome.winner===0?'You owned the arena.':`${NAMES[match.outcome.winner]} takes the round.`;
      copy.textContent=`You earned ${match.outcome.score.toLocaleString()} points this round. Every new arena resets the trails and gives you 16 boost cells.`;
      action.textContent=`Start round ${match.round+1}`;tip.textContent='The numbers below are round wins. Five arenas decide the circuit.';scoreboard();
    }else{
      $('eyebrow').textContent='ALL FIVE ARENAS COMPLETE';const leaders=match.leaders();
      title.textContent=leaders.length>1?'A shared finish.':leaders[0]===0?'Circuit champion.':`${NAMES[leaders[0]]} wins the circuit.`;
      copy.textContent=`Your final score: ${match.totalScore.toLocaleString()}. ${match.wins[0]} round ${match.wins[0]===1?'win':'wins'} across five arenas. Try another route and beat your best.`;
      action.textContent='Race again';tip.textContent='Personal bests are saved separately for each pace on this device.';scoreboard();
    }
  }
  function startRound(){
    if(!match.start())return;paused=false;clearInput();accumulator=0;last=performance.now();grace=1.1;
    $('panel').hidden=true;$('countdown').hidden=false;$('countdown').innerHTML='READY<small>CHOOSE YOUR LINE</small>';
    setStatus(`Round ${match.round}: ${ARENAS[match.round-1]}. Steer the cyan triangle. Stay inside the arena and away from every trail.`);
    hud();canvas.focus({preventScroll:true});sound(500,.12);
  }
  function reset(){
    const difficulty=$('difficulty').value;match=new Circuit({difficulty,seed:Date.now()});paused=false;reported=false;accumulator=0;grace=0;sparkles=[];clearInput();readBest();$('countdown').hidden=true;showPanel('ready');hud();setStatus('Ready when you are. Choose a pace and start the circuit.');
  }
  function finishRound(){
    clearInput();accumulator=0;grace=0;$('countdown').hidden=true;hud();
    if(match.status==='complete'){
      saveBest();showPanel('complete');
      if(!reported){reported=true;try{parent.postMessage({type:'wwg:game-event',game:'lightline-circuit',event:'circuit-complete',score:match.totalScore},location.origin);}catch{/* A standalone local file may have an opaque origin. */}}
      setStatus(`Circuit complete. Your score is ${match.totalScore}. You won ${match.wins[0]} of five rounds.`);
    }else{showPanel('round');setStatus(match.outcome.draw?'Simultaneous final crashes: the round is a draw.':`${NAMES[match.outcome.winner]} won round ${match.round}. Your round score is ${match.roundScore}.`);}
    sound(match.outcome.winner===0?760:180,.2);$('action').focus({preventScroll:true});
  }
  function pause(reason='Circuit paused. Resume when ready.'){
    if(match.status!=='running'||paused)return;paused=true;clearInput();accumulator=0;$('countdown').hidden=true;showPanel('paused');hud();setStatus(reason);$('action').focus({preventScroll:true});
  }
  function resume(){
    if(match.status!=='running'||!paused||document.hidden)return;paused=false;clearInput();accumulator=0;last=performance.now();grace=Math.max(grace,.7);$('panel').hidden=true;$('countdown').hidden=false;$('countdown').innerHTML='READY<small>FIND YOUR LINE</small>';hud();setStatus('Circuit resumed. You have a short moment before movement begins.');canvas.focus({preventScroll:true});
  }
  function turn(dir){if(paused)return;if(match.queueTurn(dir))sound(250+dir*35,.025);}
  $('action').addEventListener('click',()=>{
    if(paused){resume();return;}
    if(match.status==='complete'){reset();return;}
    if(match.status==='round-over'){if(match.next())startRound();return;}
    if(match.status==='ready')startRound();
  });
  $('difficulty').addEventListener('change',reset);
  $('restart').addEventListener('click',reset);
  $('pause').addEventListener('click',()=>paused?resume():pause());
  $('sound').disabled=!audioAllowed;$('sound').title=audioAllowed?'Toggle original game audio':'Sound is muted by the WorldWideGames player settings.';
  $('sound').addEventListener('click',()=>{if(!audioAllowed)return;soundOn=!soundOn;$('sound').textContent=soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound(600,.12);});
  for(const b of document.querySelectorAll('[data-dir]'))b.addEventListener('click',()=>turn(Number(b.dataset.dir)));
  const boost=$('boost');
  boost.addEventListener('pointerdown',e=>{if(boost.disabled||e.button>0)return;e.preventDefault();boostHeld=true;boost.classList.add('held');try{boost.setPointerCapture(e.pointerId);}catch{}});
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])boost.addEventListener(kind,()=>{boostHeld=false;boost.classList.remove('held');});
  boost.addEventListener('click',e=>{if(!boost.disabled&&!e.pointerType&&e.detail===0)boostPulses=2;});
  const directionKeys={ArrowUp:0,KeyW:0,ArrowRight:1,KeyD:1,ArrowDown:2,KeyS:2,ArrowLeft:3,KeyA:3};
  addEventListener('keydown',e=>{
    if(e.target.closest?.('select,input,textarea'))return;
    if(e.target.closest?.('button,a')&&(e.code==='Space'||e.code==='Enter'))return;
    if(e.code==='KeyP'&&!e.repeat){e.preventDefault();paused?resume():pause();return;}
    if(e.code==='KeyR'&&!e.repeat){e.preventDefault();reset();return;}
    if(match.status!=='running'||paused)return;
    if(Object.hasOwn(directionKeys,e.code)){e.preventDefault();if(!e.repeat&&!held.has(e.code))turn(directionKeys[e.code]);held.add(e.code);}
    if(e.code==='Space'){e.preventDefault();boostHeld=true;held.add(e.code);boost.classList.add('held');}
  });
  addEventListener('keyup',e=>{held.delete(e.code);if(e.code==='Space'){boostHeld=false;boost.classList.remove('held');}});
  canvas.addEventListener('pointerdown',e=>{if(e.button>0||paused||match.status!=='running')return;swipe={id:e.pointerId,x:e.clientX,y:e.clientY};try{canvas.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  canvas.addEventListener('pointermove',e=>{
    if(!swipe||e.pointerId!==swipe.id)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;
    if(Math.hypot(dx,dy)<18)return;
    turn(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));swipe.x=e.clientX;swipe.y=e.clientY;
  });
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(kind,()=>{swipe=null;});
  addEventListener('blur',()=>pause('Paused because this window lost focus. Your circuit is preserved.'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Paused while this tab is hidden. Resume when you return.');});
  function resize(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
    const pad=16,scale=Math.min((rect.width-pad*2)/COLS,(rect.height-pad*2)/ROWS);
    view={w:rect.width,h:rect.height,dpr,scale,x:(rect.width-COLS*scale)/2,y:(rect.height-ROWS*scale)/2};draw();
  }
  function draw(){
    const {w,h,dpr,scale:s,x:ox,y:oy}=view;if(!w||!h)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080e23';ctx.fillRect(0,0,w,h);
    const bg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.65);bg.addColorStop(0,'#14233b');bg.addColorStop(1,'#080e23');ctx.fillStyle=bg;ctx.fillRect(ox,oy,COLS*s,ROWS*s);
    ctx.save();ctx.translate(ox,oy);
    ctx.strokeStyle='#28405b';ctx.lineWidth=1;ctx.globalAlpha=.4;ctx.beginPath();
    for(let x=0;x<=COLS;x++){ctx.moveTo(x*s,0);ctx.lineTo(x*s,ROWS*s);}for(let y=0;y<=ROWS;y++){ctx.moveTo(0,y*s);ctx.lineTo(COLS*s,y*s);}ctx.stroke();ctx.globalAlpha=1;
    ctx.strokeStyle='#69819d';ctx.lineWidth=2;ctx.strokeRect(0,0,COLS*s,ROWS*s);
    for(const p of match.blocks){const x=p%COLS,y=Math.floor(p/COLS);ctx.fillStyle='#34435f';ctx.fillRect(x*s+1,y*s+1,s-2,s-2);ctx.fillStyle='#6d7e97';ctx.fillRect(x*s+2,y*s+2,s-4,2);}
    for(const r of match.riders){
      ctx.globalAlpha=r.alive?.8:.32;ctx.strokeStyle=COLORS[r.id];ctx.lineWidth=Math.max(2,s*.48);ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
      for(let i=0;i<r.trail.length;i++){const p=r.trail[i],x=(p%COLS+.5)*s,y=(Math.floor(p/COLS)+.5)*s;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.globalAlpha=1;
      const x=(r.x+.5)*s,y=(r.y+.5)*s;
      if(!r.alive){ctx.strokeStyle=COLORS[r.id];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-s*.25,y-s*.25);ctx.lineTo(x+s*.25,y+s*.25);ctx.moveTo(x+s*.25,y-s*.25);ctx.lineTo(x-s*.25,y+s*.25);ctx.stroke();continue;}
      ctx.save();ctx.translate(x,y);ctx.rotate((r.dir-1)*Math.PI/2);ctx.fillStyle=COLORS[r.id];ctx.strokeStyle='#f1fcff';ctx.lineWidth=1.2;
      if(!reduced){ctx.shadowColor=COLORS[r.id];ctx.shadowBlur=10;}
      ctx.beginPath();const a=s*.48;
      if(r.id===0){ctx.moveTo(a,0);ctx.lineTo(-a,a*.8);ctx.lineTo(-a*.55,0);ctx.lineTo(-a,-a*.8);ctx.closePath();}
      else if(r.id===1){ctx.moveTo(a,0);ctx.lineTo(0,a);ctx.lineTo(-a,0);ctx.lineTo(0,-a);ctx.closePath();}
      else if(r.id===2)ctx.rect(-a*.8,-a*.8,a*1.6,a*1.6);
      else ctx.arc(0,0,a,0,Math.PI*2);
      ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#0a1630';ctx.fillRect(s*.08,-1.5,3,3);ctx.restore();
      if(r.id===0&&(grace>0||match.status==='ready')){ctx.strokeStyle='#a3f7f2';ctx.setLineDash([3,3]);ctx.lineWidth=1;ctx.strokeRect((r.x-1)*s,(r.y-1)*s,s*3,s*3);ctx.setLineDash([]);ctx.fillStyle='#dafbff';ctx.font='700 14px system-ui';ctx.textAlign='center';ctx.fillText('YOU',x,y-s*1.8);}
    }
    if(!reduced)for(const p of sparkles){ctx.globalAlpha=p.life;ctx.strokeStyle=COLORS[p.id];ctx.lineWidth=2;ctx.beginPath();ctx.arc((p.x+.5)*s,(p.y+.5)*s,(1-p.life)*s*2.8+2,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;ctx.restore();
  }
  function tick(t){
    const dt=last?Math.max(0,Math.min(.18,(t-last)/1000)):0;last=t;
    if(match.status==='running'&&!paused&&!document.hidden){
      if(grace>0){grace=Math.max(0,grace-dt);if(grace===0){$('countdown').hidden=true;sound(720,.08);}}
      else{
        accumulator+=dt*1000*(match.riders[0].alive?1:4);
        const step=LEVELS[match.difficulty].tick;let budget=0;
        while(accumulator>=step&&budget<5&&match.status==='running'){
          accumulator-=step;budget++;
          const result=match.step(boostHeld||boostPulses>0);if(boostPulses>0)boostPulses--;
          if(result.crashes.length){sparkles.push(...result.crashes.map(c=>({...c,life:1})));sound(130,.13);if(result.crashes.some(c=>c.id===0)&&!result.finished)setStatus('Your line is out. Watching the remaining riders at a faster pace until the round resolves.');else if(!result.finished)setStatus(`${match.riders.filter(r=>r.alive).length} riders remain. Keep your exit open.`);}
          if(result.finished){finishRound();break;}
        }
        if(budget===5)accumulator=Math.min(accumulator,step);
      }
      sparkles=sparkles.map(p=>({...p,life:p.life-dt*1.6})).filter(p=>p.life>0);hud();
    }
    draw();requestAnimationFrame(tick);
  }
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);
  reset();resize();requestAnimationFrame(tick);
})();
