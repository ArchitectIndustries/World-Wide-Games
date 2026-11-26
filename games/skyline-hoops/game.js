/* Skyline Hoops — original WorldWideGames code and procedural artwork. */
'use strict';

const SkylineHoopsPhysics = (() => {
  const WIDTH = 1000, HEIGHT = 600, FLOOR = 540, GRAVITY = 900;
  const HOOP = Object.freeze({left:758,right:842,y:260,rimRadius:4,boardX:862,boardTop:124,boardBottom:280});
  const COURSE = Object.freeze([
    {x:380,name:'Warm-up corner'}, {x:330,name:'Courtside rhythm'},
    {x:285,name:'The sweet spot'}, {x:225,name:'Beyond the stripe'},
    {x:180,name:'Downtown touch'}, {x:300,name:'Glasshouse angle'},
    {x:150,name:'City limits'}, {x:245,name:'Evening crossover'},
    {x:120,name:'Rooftop range'}, {x:205,name:'The last light'}
  ].map(spot => Object.freeze({...spot,y:477,long:spot.x<=240})));
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  function makeBall(spot,angle,power) {
    const radians=clamp(angle,35,80)*Math.PI/180, speed=480+clamp(power,0,100)*6;
    return {x:spot.x,y:spot.y,vx:Math.cos(radians)*speed,vy:-Math.sin(radians)*speed,
      radius:14,time:0,rotation:0,bank:false,scored:false,scoreBank:false,scoreRimHits:0,hitFloor:false,rimHits:0,
      sinceScore:0,sinceFloor:0,done:false,event:null};
  }
  function collideRim(ball,x,y) {
    const dx=ball.x-x,dy=ball.y-y,distance=Math.hypot(dx,dy),clearance=ball.radius+HOOP.rimRadius;
    if(distance>=clearance || distance<0.0001)return;
    const nx=dx/distance,ny=dy/distance,vn=ball.vx*nx+ball.vy*ny;
    ball.x=x+nx*clearance;ball.y=y+ny*clearance;
    if(vn<0){ball.vx-=1.68*vn*nx;ball.vy-=1.68*vn*ny;ball.rimHits++;ball.event='rim';}
  }
  function stepBall(ball,dt) {
    if(ball.done)return ball;
    ball.event=null;
    const oldX=ball.x,oldY=ball.y;
    ball.time+=dt;
    ball.x+=ball.vx*dt;
    ball.y+=ball.vy*dt+GRAVITY*dt*dt/2;
    ball.vy+=GRAVITY*dt;
    ball.rotation+=ball.vx*dt/80;
    const boardLeft=HOOP.boardX-ball.radius,boardRight=HOOP.boardX+10+ball.radius;
    if(ball.y+ball.radius>HOOP.boardTop && ball.y-ball.radius<HOOP.boardBottom){
      if(oldX<=boardLeft && ball.x>=boardLeft && ball.vx>0){
        ball.x=boardLeft;ball.vx=-ball.vx*.72;ball.bank=true;ball.event='board';
      }else if(oldX>=boardRight && ball.x<=boardRight && ball.vx<0){
        ball.x=boardRight;ball.vx=-ball.vx*.72;ball.event='board';
      }
    }
    collideRim(ball,HOOP.left,HOOP.y);
    collideRim(ball,HOOP.right,HOOP.y);
    // A score is one downward crossing, above the floor, through a ball-sized opening.
    // Neither a rising overlap nor a later floor bounce can count.
    if(!ball.scored && !ball.hitFloor && oldY<HOOP.y && ball.y>=HOOP.y && ball.vy>0){
      const crossing=(HOOP.y-oldY)/(ball.y-oldY);
      const crossX=oldX+(ball.x-oldX)*crossing;
      const margin=ball.radius+HOOP.rimRadius;
      if(crossX>HOOP.left+margin && crossX<HOOP.right-margin){ball.scored=true;ball.scoreBank=ball.bank;ball.scoreRimHits=ball.rimHits;ball.event='score';}
    }
    if(ball.y+ball.radius>=FLOOR && ball.vy>0){
      ball.y=FLOOR-ball.radius;
      if(!ball.hitFloor){ball.hitFloor=true;ball.event=ball.scored?'soft-floor':'floor';}
      ball.vy=-ball.vy*.32;ball.vx*=.72;
      if(Math.abs(ball.vy)<35)ball.vy=0;
    }
    if(ball.scored)ball.sinceScore+=dt;
    if(ball.hitFloor)ball.sinceFloor+=dt;
    if(ball.sinceScore>.68 || ball.sinceFloor>.48 || ball.time>6 || ball.x<-80 || ball.x>1080)ball.done=true;
    return ball;
  }
  function predict(spot,angle,power) {
    const ball=makeBall(spot,angle,power),points=[{x:ball.x,y:ball.y}];
    for(let n=0;n<1080 && !ball.done;n++){
      stepBall(ball,1/180);
      if(n%6===0)points.push({x:ball.x,y:ball.y});
      if(ball.scored || ball.hitFloor)break;
    }
    points.push({x:ball.x,y:ball.y});
    return {points,ball};
  }
  function pointsFor(ball,spot){return ball.scored ? 100+(ball.scoreBank?50:0)+(spot.long?50:0) : 0;}
  return Object.freeze({WIDTH,HEIGHT,FLOOR,GRAVITY,HOOP,COURSE,clamp,makeBall,stepBall,predict,pointsFor});
})();
if(typeof module!=='undefined' && module.exports)module.exports=SkylineHoopsPhysics;

if(typeof document!=='undefined')(() => {
  const P=SkylineHoopsPhysics,canvas=document.getElementById('court'),ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);
  if(!ctx){$('status').textContent='This browser cannot create a drawing canvas. Try a browser with Canvas2D support.';$('shoot').disabled=true;return;}
  const controls={angle:$('angle'),power:$('power'),shoot:$('shoot'),next:$('next'),retry:$('retry'),pause:$('pause'),sound:$('sound')};
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const audioParams=new URLSearchParams(location.search||'');
  const parentMuted=audioParams.get('muted')==='1';
  const volumeParam=audioParams.get('volume');
  const parentVolume=volumeParam!==null&&Number.isFinite(Number(volumeParam))?P.clamp(Number(volumeParam),0,1):1;
  const audioAllowed=!parentMuted&&parentVolume>0;
  if(!audioAllowed){controls.sound.disabled=true;controls.sound.textContent='Sound muted';controls.sound.title='Sound is muted by WorldWideGames.';}
  const STORAGE='wwg:skyline-hoops:best:v1';
  let best=0;
  function storageNotice(message){$('storage-notice').textContent=message;$('storage-notice').hidden=!message;}
  try{const raw=localStorage.getItem(STORAGE);try{const saved=JSON.parse(raw||'null');if(saved&&Number.isFinite(saved.score)&&saved.score>=0&&saved.score<=2000)best=saved.score;}catch{}}
  catch{storageNotice('Best scores can be kept only for this visit because browser storage is unavailable.');}
  let index=0,score=0,made=0,results=[],mode='aiming',paused=false,soundOn=false,audio=null;
  let ball=null,angle=62,power=60,preview=null,drag=null,particles=[],sent=false;
  let lastTime=0,accumulator=0,feedbackTime=0,netMotion=0;
  const held=new Set();let keyDelay=0;
  const buildings=[{x:0,w:78,h:170},{x:85,w:90,h:230},{x:184,w:64,h:136},{x:260,w:82,h:198},{x:355,w:62,h:286},{x:432,w:95,h:172},{x:540,w:69,h:220},{x:620,w:79,h:145},{x:713,w:65,h:242},{x:794,w:92,h:184},{x:900,w:100,h:260}];
  function tone(frequency,duration=.08,type='sine',volume=.05,slide=0){
    if(!soundOn||!audioAllowed)return;
    try{
      if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type=type;osc.frequency.setValueAtTime(frequency,audio.currentTime);
      if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(20,slide),audio.currentTime+duration);
      const level=Math.max(.000001,volume*parentVolume);
      gain.gain.setValueAtTime(level,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.000001,audio.currentTime+duration);
      osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);
    }catch{soundOn=false;controls.sound.textContent='Sound unavailable';controls.sound.disabled=true;}
  }
  function updateTrack(){
    $('track').replaceChildren(...P.COURSE.map((spot,i)=>{const el=document.createElement('span');el.className='shot-dot'+(results[i]?(results[i].made?' made':' missed'):(i===index&&mode!=='finished'?' current':''));el.title=`Shot ${i+1}: ${results[i]?(results[i].made?'basket':'miss'):(i===index?'current':'up next')}`;el.setAttribute('aria-label',el.title);return el;}));
  }
  function updateHud(){
    $('shot').innerHTML=`${Math.min(index+1,10)} <small>/ 10</small>`;
    $('score').textContent=String(score);$('buckets').innerHTML=`${made} <small>/ ${results.length}</small>`;$('best').textContent=String(best);
    controls.angle.value=angle;controls.power.value=power;
    $('angle-value').textContent=`${angle}°`;$('power-value').textContent=`${power}%`;
    const editable=mode==='aiming'&&!paused;
    controls.angle.disabled=!editable;controls.power.disabled=!editable;controls.shoot.disabled=!editable;
    controls.shoot.hidden=mode==='result'||mode==='finished';controls.next.hidden=mode!=='result';
    controls.next.disabled=paused;controls.pause.disabled=mode==='finished';
    controls.pause.textContent=paused?'Resume':'Pause';controls.pause.setAttribute('aria-pressed',String(paused));
    $('ready-badge').textContent=paused?'PAUSED':mode==='aiming'?'READY':mode==='flying'?'IN FLIGHT':mode==='finished'?'COMPLETE':'SHOT ENDED';
    updateTrack();
  }
  function refreshPreview(){preview=P.predict(P.COURSE[index],angle,power);updateHud();}
  function prepareShot(){
    mode='aiming';ball=null;drag=null;particles=[];feedbackTime=0;netMotion=0;accumulator=0;
    const spot=P.COURSE[index];angle=62;
    const rad=angle*Math.PI/180,dx=800-spot.x,dy=spot.y-P.HOOP.y;
    const ideal=Math.sqrt(P.GRAVITY*dx*dx/(2*Math.cos(rad)**2*(dx*Math.tan(rad)-dy)));
    power=P.clamp(Math.round((ideal-480)/6)-4,0,100);
    $('spot').textContent=`${String(index+1).padStart(2,'0')} · ${spot.name.toUpperCase()}`;
    $('bonus').textContent=spot.long?'LONG RANGE +50':'100 PER BASKET';
    $('shot-title').textContent=index===0?'Find your arc.':spot.long?'Go downtown.':'Make your mark.';
    $('status').textContent=spot.long?'A long-range basket earns 50 extra points. Add a little power and watch the dotted arc.':'Adjust the dotted flight path toward the hoop. A bank off the backboard adds 50 points.';
    controls.next.innerHTML=`${index===9?'See course result':'Next shot'} <span>ENTER</span>`;
    refreshPreview();
  }
  function shoot(){
    if(mode!=='aiming'||paused)return;
    ball=P.makeBall(P.COURSE[index],angle,power);mode='flying';accumulator=0;held.clear();drag=null;
    $('shot-title').textContent='Let it fly.';$('status').textContent='Watch the arc. The shot ends after the basket or the ball lands.';
    tone(170,.09,'triangle',.04,320);updateHud();
  }
  function finishShot(){
    if(mode!=='flying'||!ball)return;
    const earned=P.pointsFor(ball,P.COURSE[index]);
    score+=earned;if(ball.scored)made++;
    results.push({made:ball.scored,points:earned,bank:ball.scoreBank,long:P.COURSE[index].long});
    mode='result';
    if(ball.scored){
      const extras=[ball.scoreBank?'bank +50':null,P.COURSE[index].long?'long range +50':null].filter(Boolean);
      $('shot-title').textContent=ball.scoreBank?'Off the glass!':ball.scoreRimHits?'Friendly bounce.':'Nothing but net.';
      $('status').textContent=`Basket! +${earned} points${extras.length?' · '+extras.join(' · '):''}. ${index===9?'View your course result.':'Ready for the next spot?'}`;
    }else{
      $('shot-title').textContent='Next one is yours.';
      $('status').textContent=`Miss · 0 points. ${index===9?'That was the final shot. View your course result.':ball.hitFloor?'The ball reached the court without a basket. Try a higher arc or adjust your power at the next spot.':'The ball left the playable court. Try a little less power at the next spot.'}`;
    }
    updateHud();controls.next.focus({preventScroll:true});
  }
  function complete(){
    if(mode==='finished')return;
    mode='finished';paused=false;held.clear();drag=null;
    const personalRecord=score>best;
    let bestSaved=true;
    if(personalRecord){best=score;try{localStorage.setItem(STORAGE,JSON.stringify({score:best,made}));storageNotice('');}catch{bestSaved=false;storageNotice('Your new best is kept for this visit only. Browser storage could not save it.');}}
    $('shot-title').textContent=made===10?'A perfect skyline.':made>=7?'Own the evening.':made>=4?'Finding your rhythm.':'Your next run awaits.';
    $('status').textContent=`Course complete: ${made} of 10 baskets · ${score} points.${personalRecord?(bestSaved?' New personal best!':' New session best.'):''} Restart for another ten shots.`;
    controls.retry.textContent='Play another course';
    if(!sent){sent=true;try{parent.postMessage({type:'wwg:game-event',game:'skyline-hoops',event:'course-complete',score},location.origin);}catch{}}
    updateHud();controls.retry.focus({preventScroll:true});
  }
  function next(){if(mode!=='result'||paused)return;if(index===9)complete();else{index++;prepareShot();controls.shoot.focus({preventScroll:true});}}
  function restart(){index=0;score=0;made=0;results=[];mode='aiming';paused=false;sent=false;held.clear();controls.retry.textContent='Restart course';prepareShot();}
  function setPaused(value){
    if(mode==='finished')return;
    paused=Boolean(value);held.clear();drag=null;accumulator=0;keyDelay=0;
    if(paused){$('status').textContent='Paused. Your current shot is saved in place. Choose Resume or press P when you are ready.';}
    else{$('status').textContent=mode==='aiming'?'Adjust your arc and power, then Shoot.':mode==='flying'?'Back on court. Your shot continues.':'Shot finished. Choose Next shot to continue.';}
    updateHud();
  }
  controls.angle.addEventListener('input',()=>{if(mode==='aiming'&&!paused){angle=Number(controls.angle.value);refreshPreview();}});
  controls.power.addEventListener('input',()=>{if(mode==='aiming'&&!paused){power=Number(controls.power.value);refreshPreview();}});
  controls.shoot.addEventListener('click',shoot);controls.next.addEventListener('click',next);controls.retry.addEventListener('click',restart);
  controls.pause.addEventListener('click',()=>setPaused(!paused));
  controls.sound.addEventListener('click',()=>{if(!audioAllowed)return;soundOn=!soundOn;controls.sound.textContent=soundOn?'Sound on':'Sound off';controls.sound.setAttribute('aria-pressed',String(soundOn));if(soundOn)tone(440,.1,'sine',.025);});
  function keyAdjust(key){
    if(mode!=='aiming'||paused)return;
    if(key==='arrowleft'||key==='a')angle=P.clamp(angle+1,35,80);
    if(key==='arrowright'||key==='d')angle=P.clamp(angle-1,35,80);
    if(key==='arrowup'||key==='w')power=P.clamp(power+1,0,100);
    if(key==='arrowdown'||key==='s')power=P.clamp(power-1,0,100);
    refreshPreview();
  }
  window.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    if(key==='p'){if(!e.repeat){e.preventDefault();setPaused(!paused);}return;}
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
    if(/^(BUTTON|A)$/.test(e.target.tagName)&&[' ','enter'].includes(key))return;
    if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(key)){
      e.preventDefault();if(!held.has(key)){keyAdjust(key);keyDelay=.22;}held.add(key);
    }
    if(key===' '){e.preventDefault();if(!e.repeat)shoot();}
    if(key==='enter'){e.preventDefault();if(!e.repeat)next();}
  });
  window.addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>setPaused(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
  function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*P.WIDTH/r.width,y:(e.clientY-r.top)*P.HEIGHT/r.height};}
  canvas.addEventListener('pointerdown',e=>{
    if(mode!=='aiming'||paused||e.button!==0)return;
    const p=point(e),spot=P.COURSE[index];
    if(Math.hypot(p.x-spot.x,p.y-spot.y)>95)return;
    e.preventDefault();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,start:p,end:p,moved:false};
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id||paused)return;
    const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;drag.end=p;
    if(dx>6 && dy< -6 && Math.hypot(dx,dy)>22){
      drag.moved=true;angle=Math.round(P.clamp(Math.atan2(-dy,dx)*180/Math.PI,35,80));
      power=Math.round(P.clamp((Math.hypot(dx,dy)*3.5-100)/6,0,100));refreshPreview();
    }
  });
  function release(e){
    if(!drag||drag.id!==e.pointerId)return;
    const valid=drag.moved&&drag.end.x>drag.start.x+6&&drag.end.y<drag.start.y-6;drag=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(valid)shoot();
  }
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function text(value,x,y,size=16,color='#f4f7ed',align='left',weight=600){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(value,x,y);}
  function background(){
    const sky=ctx.createLinearGradient(0,0,0,450);sky.addColorStop(0,'#102c3c');sky.addColorStop(.58,'#31636a');sky.addColorStop(1,'#a2a88a');ctx.fillStyle=sky;ctx.fillRect(0,0,1000,600);
    const glow=ctx.createRadialGradient(150,104,10,150,104,95);glow.addColorStop(0,'#f2d2a32b');glow.addColorStop(1,'#efc79400');ctx.fillStyle=glow;ctx.fillRect(45,5,215,215);
    ctx.fillStyle='#e9dab8';ctx.beginPath();ctx.arc(150,104,28,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5e8580';for(let i=0;i<18;i++)ctx.fillRect(i*67-15,320-(i%5)*21,55,95+(i%5)*21);
    for(let j=0;j<buildings.length;j++){
      const b=buildings[j],top=406-b.h;ctx.fillStyle=j%2?'#173b45':'#204853';ctx.fillRect(b.x,top,b.w,b.h);
      ctx.fillStyle='#2b5660';ctx.fillRect(b.x+3,top+3,b.w-6,4);
      if(j===4){ctx.fillRect(b.x+b.w*.48,top-43,3,43);ctx.fillStyle='#ecbb87';ctx.fillRect(b.x+b.w*.48,top-43,3,3);}
      for(let row=0;row<Math.floor((b.h-15)/22);row++)for(let col=0;col<Math.floor((b.w-13)/16);col++){
        ctx.fillStyle=(row*7+col*3+j*5)%5<2?'#c5cd9760':'#73968e23';ctx.fillRect(b.x+10+col*16,top+15+row*22,5,9);
      }
    }
    ctx.fillStyle='#153945';ctx.fillRect(0,383,1000,30);line(0,385,1000,385,'#a7b5a266',4);
    for(let x=15;x<1000;x+=65){line(x,333,x,415,'#71959170',3);line(x,333,x+65,387,'#71959135',1);line(x+65,333,x,387,'#71959135',1);}line(0,333,1000,333,'#83a7a564',2);
    const court=ctx.createLinearGradient(0,405,0,600);court.addColorStop(0,'#b77756');court.addColorStop(1,'#814d43');ctx.fillStyle=court;ctx.fillRect(0,411,1000,189);
    ctx.fillStyle='#2c6466';ctx.beginPath();ctx.moveTo(663,412);ctx.lineTo(1000,412);ctx.lineTo(1000,600);ctx.lineTo(580,600);ctx.closePath();ctx.fill();
    line(0,540,1000,540,'#f2d8b050',3);line(650,421,588,590,'#e5d5afaf',3);line(650,421,998,421,'#e5d5afaf',3);
    ctx.beginPath();ctx.ellipse(700,512,260,89,0,Math.PI*.5,Math.PI*1.5);ctx.strokeStyle='#e9d4ae90';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.ellipse(665,510,85,50,0,0,Math.PI*2);ctx.strokeStyle='#dfc79c70';ctx.lineWidth=3;ctx.stroke();
    for(let y=425;y<600;y+=27)line(0,y,1000,y,'#3d292014',1);
    text('SKYLINE',36,572,15,'#e6cba68a','left',800);text('PUBLIC COURT',36,587,9,'#e6cba675','left',600);
  }
  function hoop(){
    const h=P.HOOP;
    ctx.fillStyle='#0c2930a0';ctx.beginPath();ctx.ellipse(906,544,63,9,0,0,Math.PI*2);ctx.fill();
    line(910,533,910,175,'#213b43',15);line(910,178,874,151,'#405f67',12);line(910,297,873,264,'#213b43',9);
    rounded(856,121,17,163,3,'#e3eee7','#a9c7c6');
    ctx.fillStyle='#d4efeb48';ctx.fillRect(818,126,37,151);line(821,130,852,130,'#e7f1dc',3);line(821,273,852,273,'#e7f1dc',3);line(821,130,821,273,'#c5e5db',3);
    line(841,204,854,204,'#f3ebd1',3);line(841,204,841,251,'#f3ebd1',3);
    line(h.right,h.y,859,h.y,'#ffb076',7);
    const sway=reducedMotion?0:Math.sin(netMotion*26)*Math.min(netMotion,1)*9;
    for(let i=0;i<=6;i++){
      const x=h.left+(h.right-h.left)*i/6,bottom=782+36*i/6+sway;
      line(x,h.y+4,bottom,h.y+58,'#e8eee1a0',1.7);
      if(i<6)line(x,h.y+4,782+36*(i+1)/6+sway,h.y+58,'#e8eee160',1.5);
    }
    line(767,h.y+22,834,h.y+22,'#e8eee16e',1.3);line(776,h.y+42,825,h.y+42,'#e8eee16e',1.3);line(782+sway,h.y+58,818+sway,h.y+58,'#e8eee1aa',2);
    ctx.beginPath();ctx.ellipse(800,h.y,42,8,0,0,Math.PI*2);ctx.strokeStyle='#ff9967';ctx.lineWidth=6;ctx.stroke();
  }
  function player(){
    const spot=P.COURSE[index],x=spot.x;
    ctx.fillStyle='#1b2f354d';ctx.beginPath();ctx.ellipse(x-24,540,40,7,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x,540,36,8,0,0,Math.PI*2);ctx.strokeStyle='#e9edb09a';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#1c333e';ctx.beginPath();ctx.arc(x-33,451,13,0,Math.PI*2);ctx.fill();
    rounded(x-45,465,24,43,7,'#d9f57a');line(x-37,508,x-44,533,'#1c333e',10);line(x-26,508,x-15,531,'#1c333e',10);
    line(x-50,536,x-37,536,'#dfe6d8',6);line(x-19,535,x-6,535,'#dfe6d8',6);
    line(x-25,477,x-8,484,'#9c6d54',8);line(x-8,484,x-1,477,'#9c6d54',8);
    if(mode==='aiming')text(drag?'RELEASE TO SHOOT':'SWIPE FROM BALL',x,579,12,'#f3debd','center',700);
  }
  function drawBall(b,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(b.x,b.y);ctx.rotate(b.rotation||0);
    const sphere=ctx.createRadialGradient(-5,-6,2,0,0,18);sphere.addColorStop(0,'#ffbe72');sphere.addColorStop(.6,'#ef873e');sphere.addColorStop(1,'#b85430');
    ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#4c342c';ctx.lineWidth=1.8;ctx.stroke();
    line(-14,0,14,0,'#55372e',1.5);line(0,-14,0,14,'#55372e',1.5);
    ctx.beginPath();ctx.ellipse(0,0,6,14,0,0,Math.PI*2);ctx.strokeStyle='#55372e';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
  }
  function aim(){
    if(!preview)return;
    const points=preview.points;
    for(let i=1;i<points.length;i++){
      if(i%2===0)continue;const p=points[i];if(p.y<15||p.y>540)continue;
      ctx.globalAlpha=Math.max(.2,1-i/points.length*.65);ctx.fillStyle='#f2efca';ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
    if(preview.ball.scored){ctx.beginPath();ctx.arc(800,260,23,0,Math.PI*2);ctx.strokeStyle='#d9f57a88';ctx.lineWidth=2;ctx.stroke();}
    const s=P.COURSE[index],rad=angle*Math.PI/180;line(s.x,s.y,s.x+Math.cos(rad)*52,s.y-Math.sin(rad)*52,'#f6f2d27f',2);
    drawBall({x:s.x,y:s.y});
  }
  function celebrate(){
    netMotion=1;feedbackTime=1;
    if(!reducedMotion)for(let i=0;i<22;i++)particles.push({x:800,y:260,vx:Math.cos(i*2.399)*110,vy:Math.sin(i*2.399)*90-70,life:.7+(i%4)*.08,color:i%2?'#d9f57a':'#ffb579'});
    tone(523,.11,'sine',.045);tone(784,.18,'triangle',.025);
  }
  function draw(){
    const pixelRatio=Math.min(window.devicePixelRatio||1,1.5),bounds=canvas.getBoundingClientRect();
    const w=Math.max(1,Math.round(bounds.width*pixelRatio)),h=Math.max(1,Math.round(w*.6));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.setTransform(canvas.width/1000,0,0,canvas.height/600,0,0);background();hoop();player();
    if(mode==='aiming')aim();
    if(ball){
      if(ball.y<15){text('HIGH ARC',ball.x,25,12,'#eef0ce','center');ctx.fillStyle='#ffab6c';ctx.beginPath();ctx.arc(ball.x,42,5,0,Math.PI*2);ctx.fill();}
      else drawBall(ball);
    }
    for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);}ctx.globalAlpha=1;
    if(feedbackTime>0){rounded(729,322,142,38,10,'#d9f57a');text('BUCKET!',800,347,18,'#193536','center',800);}
    if(mode==='result'&&!paused){rounded(300,49,400,63,12,'#0a263ae8','#57767a');text(ball.scored?`+${P.pointsFor(ball,P.COURSE[index])}  /  ${ball.scoreBank?'OFF THE GLASS':'BASKET'}`:'MISS  /  KEEP SHOOTING',500,88,23,ball.scored?'#d9f57a':'#ffc6a0','center',800);}
    if(mode==='finished'){
      ctx.fillStyle='#071823a8';ctx.fillRect(0,0,1000,600);rounded(220,140,560,282,20,'#102d38','#5c7f7b');
      text('DUSK SESSION COMPLETE',500,191,15,'#d9f57a','center',750);text(String(score),500,282,76,'#f3f4e8','center',850);
      text(`${made} / 10 BUCKETS`,500,323,20,'#cedfd9','center',700);text('Another evening. Another shot.',500,370,17,'#b0c8cb','center',500);
    }
    if(paused){ctx.fillStyle='#071823c7';ctx.fillRect(0,0,1000,600);text('PAUSED',500,286,50,'#e8f2d6','center',800);text('Resume or press P to return to the court',500,328,19,'#c1d4d3','center',500);}
  }
  function frame(time){
    const dt=Math.min((time-lastTime)/1000||0,.05);lastTime=time;
    if(!paused){
      if(held.size&&mode==='aiming'){keyDelay-=dt;if(keyDelay<=0){held.forEach(keyAdjust);keyDelay=.065;}}
      if(mode==='flying'){
        accumulator+=dt;while(accumulator>=1/180&&mode==='flying'){
          const wasScored=ball.scored;P.stepBall(ball,1/180);accumulator-=1/180;
          if(ball.scored&&!wasScored)celebrate();
          else if(ball.event==='rim'||ball.event==='board')tone(240,.055,'triangle',.025,125);
          else if(ball.event==='floor')tone(100,.09,'sine',.04,40);
          if(ball.done)finishShot();
        }
      }
      for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;}particles=particles.filter(p=>p.life>0);
      feedbackTime=Math.max(0,feedbackTime-dt);netMotion=Math.max(0,netMotion-dt*1.9);
    }
    draw();requestAnimationFrame(frame);
  }
  prepareShot();requestAnimationFrame(frame);
})();
