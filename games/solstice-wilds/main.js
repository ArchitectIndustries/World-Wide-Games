import {GAME_ID,SITES,PILLARS,TABLET,TIDEWORKS,RUNES,terrainHeight,seedFrom,createExpedition,
  stepExpedition,interaction,objective,weatherAt,takeEvents,setPaused,openJournal,closeModal,
  readCheckpoint,writeCheckpoint,clearCheckpoint,restoreCheckpoint,retryExpedition} from './model.js';
import {createValley} from './scene.js';

const $=id=>document.getElementById(id);
let storage=null;try{storage=window.localStorage;}catch{}
let preferences={};try{const p=JSON.parse(storage?.getItem('wwg:prefs')||'{}');if(p&&typeof p==='object'&&!Array.isArray(p))preferences=p;}catch{}
const params=new URLSearchParams(location.search),rawVolume=params.has('volume')?Number(params.get('volume')):Number(preferences.volume);
const settings={volume:Number.isFinite(rawVolume)?Math.max(0,Math.min(1,rawVolume)):.7,
  muted:params.get('muted')==='1'||preferences.muted===true,
  reducedMotion:params.get('motion')==='reduce'||preferences.reducedMotion===true,
  touch:matchMedia('(pointer:coarse)').matches};
document.body.classList.toggle('high-contrast',params.get('contrast')==='high'||preferences.highContrast===true);
document.body.classList.toggle('reduced-motion',settings.reducedMotion);
document.body.classList.toggle('touch',settings.touch);
$('touchToggle').checked=settings.touch;$('motionToggle').checked=settings.reducedMotion;$('muteToggle').checked=settings.muted;
let saved=readCheckpoint(storage),state=createExpedition(seedFrom(params.get('seed')||'solstice-wilds')),valley;
state.mode='menu';
let yaw=-.44,pitch=.57,snapCamera=true,lastTime=0,lastDraw=0,frame=0,stopped=false,lastMode='menu',confirmReturn='menu',journalFromPause=false;
let pageCached=false,lifecycleDisposed=false;
let audioContext=null,voices=new Set(),padId=null,padArmed=false,previousButtons=[],toastText='',lastJournal='';
let activeInput='keyboard',padNavDirection=0,padNavRepeat=0;
const keys=new Set(),touch={x:0,z:0,pulse:false,sprint:false},pointerActions=new Map();let interactEdge=false,orbit=null,stickPointer=null;
const mapContext=$('map').getContext('2d');
const inputDefaults={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],primary:['Space'],secondary:['KeyE']};

function safeFocus(element){try{element?.focus({preventScroll:true});}catch{element?.focus();}}
function syncSaved(){
  $('continueButton').hidden=!saved;
  $('checkpointNote').textContent=saved?'A restored site is saved. Continue in expedition practice, or begin a fresh scored run.':'Progress saves when you restore a site.';
}
function stopSounds(){for(const osc of voices){try{osc.stop();}catch{}}voices.clear();}
function unlockAudio(){
  if(settings.muted||settings.volume===0)return;
  try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}catch{}
}
function tone(frequency,duration=.1,volume=.05,wave='sine',delay=0){
  if(settings.muted||settings.volume===0||!audioContext||audioContext.state!=='running')return;
  try{const now=audioContext.currentTime+delay,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*settings.volume),now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(audioContext.destination);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(now);osc.stop(now+duration+.02);}catch{}
}
function soundEvent(event){
  if(event==='pulse-fired')tone(440,.09,.025,'triangle');
  else if(event==='player-hit')tone(90,.17,.055,'triangle');
  else if(event==='crate-broken'||event==='guardian-defeated'){tone(145,.1,.04,'triangle');tone(220,.13,.03,'sine',.05);}
  else if(event==='salvage-collected'){tone(660,.13,.025);tone(880,.2,.02,'sine',.07);}
  else if(event==='rune-attuned'){tone(392+state.archiveStep*98,.25,.05);}
  else if(event==='rune-reset'){tone(196,.22,.04,'triangle');tone(174,.23,.035,'triangle',.1);}
  else if(event==='counterweight-installed'){tone(196,.16,.04,'triangle');tone(294,.22,.035,'sine',.1);}
  else if(event==='sluice-set')tone(330,.15,.025,'triangle');
  else if(event==='bridge-deploying'){tone(130,.4,.025,'triangle');tone(196,.4,.02,'triangle',.25);}
  else if(event==='warden-warning'){tone(110,.22,.035,'triangle');tone(165,.22,.03,'triangle',.3);}
  else if(event==='warden-exposed'){tone(587,.2,.03);tone(784,.3,.025,'sine',.08);}
  else if(['archive-restored','bridge-repaired','spire-restored','campaign-complete'].includes(event)){[392,494,587,784].forEach((f,i)=>tone(f,.6,.035,'sine',i*.12));}
}
function resetInput(){
  keys.clear();touch.x=touch.z=0;touch.pulse=touch.sprint=false;interactEdge=false;orbit=null;stickPointer=null;pointerActions.clear();
  $('stickThumb').style.transform='';for(const b of document.querySelectorAll('.touch-actions button'))b.classList.remove('active');
  padArmed=false;previousButtons=[];padNavDirection=0;padNavRepeat=0;refreshKeyLabels();
}
function activeOverlay(){return ['fatal','confirm','journal','result','pauseMenu','menu'].map($).find(n=>!n.hidden)||null;}
function overlayItems(overlay){return Array.from(overlay?.querySelectorAll('button,input,summary,[tabindex="0"]')||[]).filter(n=>!n.disabled&&n.getClientRects().length);}
function focusMenuItem(item){safeFocus(item);item?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'auto'});}
function setInputDevice(device){if(activeInput!==device){activeInput=device;refreshKeyLabels();}}
function refreshKeyLabels(){
  const map=window.WWGInput?.read()||{primary:'Space',secondary:'KeyE'},label=code=>window.WWGInput?.label(code)||code;
  const pad=activeInput==='gamepad';
  $('pulseKey').textContent=pad?'A':label(map.primary);$('interactKey').textContent=pad?'X':label(map.secondary);$('promptKey').textContent=pad?'X':label(map.secondary);
  $('moveKey').textContent=pad?'LEFT STICK':'WASD';$('sprintKey').textContent=pad?'B / LT':'SHIFT';$('cameraGuide').textContent=pad?'right stick to orbit':'drag to orbit';
  $('controllerHint').hidden=!pad||!activeOverlay();
  $('pauseButton').title=pad?'Pause (Start)':'Pause (P / Escape)';$('journalButton').title=pad?'Expedition journal (View)':'Expedition journal';
}
function showOnly(id){
  for(const name of ['menu','pauseMenu','journal','result','confirm'])$(name).hidden=name!==id;
  const playing=['playing','paused','dead','won'].includes(state.mode);
  $('hud').hidden=!playing;
  $('touchControls').hidden=!settings.touch||state.mode!=='playing'||!!state.modal||id==='confirm';
  refreshKeyLabels();
}
function launch(next){
  state=next;state.mode='playing';state.modal=null;lastMode='playing';lastJournal='';yaw=-.44;pitch=.57;snapCamera=true;
  resetInput();unlockAudio();showOnly(null);safeFocus(valley.canvas);
}
function freshSeed(){if(params.has('seed'))return seedFrom(params.get('seed'));try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]||7331;}catch{return seedFrom(String(Date.now()));}}
function startFresh(){saved=null;clearCheckpoint(storage);syncSaved();launch(createExpedition(freshSeed()));}
function requestFresh(){
  if(saved||state.mode==='paused'||state.mode==='playing'){
    confirmReturn=state.mode;setPaused(state,true);resetInput();stopSounds();showOnly('confirm');safeFocus($('cancelStart'));
  }else startFresh();
}
function pause(){
  if(state.mode!=='playing')return;
  state.modal=null;setPaused(state,true);resetInput();stopSounds();showOnly('pauseMenu');safeFocus($('resumeButton'));
}
function resume(){if(state.mode!=='paused')return;setPaused(state,false);resetInput();unlockAudio();showOnly(null);safeFocus(valley.canvas);}
function togglePause(){
  if(!$('confirm').hidden){cancelFresh();return;}
  if(state.modal){closeJournal();return;}
  if(state.mode==='playing')pause();else if(state.mode==='paused')resume();
}
function cancelFresh(){
  if(confirmReturn==='menu'){state.mode='menu';showOnly('menu');safeFocus(saved?$('continueButton'):$('startButton'));}
  else {state.mode='paused';showOnly('pauseMenu');safeFocus($('resumeButton'));}
  resetInput();
}
function toMenu(){
  resetInput();stopSounds();state=createExpedition(state.seed);state.mode='menu';lastMode='menu';snapCamera=true;syncSaved();showOnly('menu');safeFocus(saved?$('continueButton'):$('startButton'));
}
function showJournal(fromPause=false){
  journalFromPause=fromPause;
  if(fromPause){state.mode='playing';openJournal(state);}else openJournal(state);
  if(!state.modal)return;
  lastJournal=state.modal;resetInput();stopSounds();paintJournal();showOnly('journal');safeFocus($('closeJournalButton'));
}
function closeJournal(){
  closeModal(state);lastJournal='';resetInput();
  if(journalFromPause){journalFromPause=false;state.mode='paused';showOnly('pauseMenu');safeFocus($('resumeButton'));}
  else {showOnly(null);unlockAudio();safeFocus(valley.canvas);}
}
function paintJournal(){
  const archive=state.modal==='archive';$('journalTitle').textContent=archive?'The Archive’s inscription':'A valley of borrowed light';
  let text=archive?'<p>Carved beneath a ring of stars: “The valley remembers three lights. Call them in this order, and the old crossing will answer.”</p>':'<p>Your field lantern can wake the observatory. Restore its three sites, then return to the southern lighthouse with the solstice light.</p>';
  if(state.archiveRead){text+='<div class="rune-sequence">'+state.sequence.map((id,i)=>{const r=RUNES.find(r=>r.id===id);return(i?'<span class="rune-arrow" aria-hidden="true">·</span>':'')+`<div class="rune-cell" style="color:${r.color}"><strong>${r.glyph}</strong><small>${r.name}</small></div>`;}).join('')+'</div><p>Approach each matching pillar and interact once. A wrong rune resets the sequence. This order remains in your journal.</p>';
    const first=RUNES.find(r=>r.id===state.sequence[0]);text+=`<div class="mechanism-note"><strong>THE FIRST LIGHT GUIDES THE WATER</strong><p>After restoring the Archive, install four salvage parts at the workshop’s counterweight bench. Turn the river sluice dial to <b>${first.glyph} ${first.name}</b>, then operate the bridge winch. Let both leaves lower and lock before crossing.</p></div>`;
  }
  if(!archive){
    const sites=[['archive','I','Western Archive','Read the entrance tablet. Attune the three rune pillars in its order.'],['bridge','II','Tideworks restoration','Recover four parts and install the counterweight at the workshop bench. Set the sluice to the Archive’s first rune, operate the winch, and watch the crossing lock.'],['spire','III','Solstice Spire','Quiet the two sentinels. Evade the warden’s marked charge, then pulse its exposed core while it recovers. Activate the armillary and follow the restored lights home.']];
    text+=sites.map(([key,n,title,body])=>`<div class="journal-site"><b>${state.completed[key]?'✓':n}</b><p><strong>${title}</strong>${body}</p></div>`).join('');
    text+='<h3>Field notes</h3><p>Pulse targets the nearest visible enemy or crate within range. Amber rings warn of sentinel strikes. The warden closes its bronze plates while guarded; leave the marked charge lane, then pulse when the plates open around its bright core. The river can only be crossed after the bridge locks. Restoring a site refills your lantern and saves a checkpoint.</p><p>Pause with P / Escape or controller Start. Controller View opens this journal. Menus support D-pad or stick navigation, A to select, and B to go back. Fresh runs can submit a completion score; resumed and retried journeys are expedition practice.</p>';
  }
  $('journalContent').innerHTML=text;
}
function showResult(){
  resetInput();const won=state.mode==='won';showOnly('result');
  $('resultEyebrow').textContent=won?'THREE SITES · ONE RETURN':'THE LANTERN WENT DARK';
  $('resultTitle').textContent=won?'The light is home.':'The valley keeps your place.';
  $('resultText').textContent=won?(state.ranked?'Archive, crossing and Spire restored. Your fresh expedition earned the score below.':'You brought the light home. This checkpoint expedition was practice, so no completion score was submitted.'):(state.checkpoint?'Retry from your last restored site with a full lantern. The continuation will be expedition practice.':'Start the journey again with a full lantern. Retries are expedition practice.');
  const minutes=Math.floor(state.elapsed/60),seconds=String(Math.floor(state.elapsed%60)).padStart(2,'0');
  $('resultStats').innerHTML=`<span><b>${Object.values(state.completed).filter(Boolean).length} / 3</b>SITES RESTORED</span><span><b>${minutes}:${seconds}</b>ACTIVE TIME</span><span><b>${won&&state.ranked?state.score:'—'}</b>${state.ranked&&won?'EXPEDITION SCORE':'PRACTICE RUN'}</span>`;
  $('retryButton').textContent=won?'Begin another expedition':state.checkpoint?'Return to checkpoint':'Retry expedition';safeFocus($('retryButton'));
}
function processEvents(){
  const publish=new Set(['archive-restored','bridge-repaired','spire-restored','campaign-complete']);
  for(const event of takeEvents(state)){
    if(event.event==='checkpoint'){
      saved=event.detail.checkpoint;const ok=writeCheckpoint(storage,saved);syncSaved();
      if(!ok)state.message={text:'Site restored. Your checkpoint is available for this session; browser storage is unavailable.',ttl:7};
    }
    if(event.event==='campaign-complete'){saved=null;clearCheckpoint(storage);syncSaved();}
    soundEvent(event.event);
    if(publish.has(event.event)&&parent!==window){
      const payload={type:'wwg:game-event',game:GAME_ID,event:event.event,detail:event.detail};
      if(typeof event.score==='number'&&Number.isFinite(event.score))payload.score=event.score;
      if(typeof event.duration==='number'&&Number.isFinite(event.duration))payload.duration=event.duration;
      parent.postMessage(payload,location.origin==='null'?'*':location.origin);
    }
  }
}
function isAction(event,action){return window.WWGInput?.is(event,action)??inputDefaults[action].includes(event.code);}
function held(action){for(const code of keys)if(isAction({code,key:code},action))return true;return false;}
function editable(target){return target?.matches?.('input,textarea,select,[contenteditable="true"]');}
function onKeyDown(event){
  // Browser shortcuts must retain their normal meaning, and must not leave a
  // previously held gameplay key running underneath the shortcut.
  if(event.ctrlKey||event.metaKey||event.altKey){keys.clear();return;}
  setInputDevice('keyboard');
  if(event.code==='Tab'){
    const overlay=activeOverlay();
    if(overlay){const focusable=overlayItems(overlay);
      const first=focusable[0],last=focusable.at(-1);
      if(first&&(event.shiftKey&&(document.activeElement===first||!overlay.contains(document.activeElement))||!event.shiftKey&&(document.activeElement===last||!overlay.contains(document.activeElement)))){event.preventDefault();safeFocus(event.shiftKey?last:first);return;}
    }
  }
  if(editable(event.target))return;
  if(event.code==='Escape'||event.code==='KeyP'){if(!event.repeat){event.preventDefault();togglePause();}return;}
  if(state.mode!=='playing'||state.modal||!$('confirm').hidden)return;
  const handled=Object.keys(inputDefaults).some(action=>isAction(event,action))||event.code==='ShiftLeft'||event.code==='ShiftRight';
  if(!handled)return;event.preventDefault();
  // An OS repeat arriving after pause/focus clearing is not a fresh press.
  if(event.repeat&&!keys.has(event.code))return;
  keys.add(event.code);unlockAudio();
  if(isAction(event,'secondary')&&!event.repeat)interactEdge=true;
}
function onKeyUp(event){keys.delete(event.code);}
function controllerOverlay(overlay,buttons,pressed,axes,dt){
  const direction=buttons[13]||axes[1]>.55?1:buttons[12]||axes[1]<-.55?-1:0;
  padNavRepeat=Math.max(0,padNavRepeat-dt);
  if(direction&&(direction!==padNavDirection||padNavRepeat===0)){
    const items=overlayItems(overlay),index=items.indexOf(document.activeElement);
    if(items.length)focusMenuItem(items[index<0?(direction>0?0:items.length-1):(index+direction+items.length)%items.length]);
    padNavRepeat=direction===padNavDirection?.16:.34;
  }
  padNavDirection=direction;
  if(!direction)padNavRepeat=0;
  if(pressed(1)||pressed(9)){
    if(overlay.id==='confirm')cancelFresh();
    else if(overlay.id==='journal')closeJournal();
    else if(overlay.id==='pauseMenu')resume();
    else if(overlay.id==='result')toMenu();
    else if(overlay.id==='menu'&&$('controlsDetails').open){$('controlsDetails').open=false;safeFocus($('controlsSummary'));}
    return;
  }
  if(overlay.id==='menu'&&pressed(2)&&saved){const next=restoreCheckpoint(saved);if(next)launch(next);return;}
  if(pressed(0)){
    const items=overlayItems(overlay),selected=items.includes(document.activeElement)?document.activeElement:items[0];
    if(selected){focusMenuItem(selected);selected.click();}
  }
}
function pollGamepad(dt){
  let pads=[];try{pads=navigator.getGamepads?.()||[];}catch{}
  const pad=Array.from(pads).find(p=>p?.connected&&p.mapping==='standard');
  if(!pad){padArmed=false;padId=null;previousButtons=[];return{x:0,z:0,pulse:false,sprint:false};}
  if(padId!==pad.index+pad.id){padId=pad.index+pad.id;padArmed=false;previousButtons=[];}
  const buttons=pad.buttons.map(b=>!!b.pressed),neutral=pad.axes.every(a=>Math.abs(a)<.2)&&!buttons.some(Boolean);
  if(!neutral)setInputDevice('gamepad');
  if(!padArmed){if(neutral)padArmed=true;previousButtons=buttons;return{x:0,z:0,pulse:false,sprint:false};}
  const prior=previousButtons,pressed=i=>buttons[i]&&!prior[i];previousButtons=buttons;
  const overlay=activeOverlay();
  if(overlay){controllerOverlay(overlay,buttons,pressed,pad.axes,dt);return{x:0,z:0,pulse:false,sprint:false};}
  if(pressed(9)){togglePause();return{x:0,z:0,pulse:false,sprint:false};}
  if(state.mode!=='playing')return{x:0,z:0,pulse:false,sprint:false};
  if(pressed(8)){showJournal();return{x:0,z:0,pulse:false,sprint:false};}
  const axis=n=>Math.abs(pad.axes[n]||0)>.16?(pad.axes[n]||0):0;
  yaw-=axis(2)*dt*1.8;pitch=Math.max(.24,Math.min(1.03,pitch+axis(3)*dt*1.1));if(pressed(2))interactEdge=true;
  return{x:axis(0),z:axis(1),pulse:buttons[0],sprint:buttons[1]||(pad.buttons[6]?.value??0)>.3};
}
function inputForFrame(dt){
  const pad=pollGamepad(dt);let x=(held('right')?1:0)-(held('left')?1:0)+touch.x+pad.x,z=(held('down')?1:0)-(held('up')?1:0)+touch.z+pad.z;
  const n=Math.hypot(x,z);if(n>1){x/=n;z/=n;}
  const c=Math.cos(yaw),sn=Math.sin(yaw),input={mx:x*c+z*sn,mz:-x*sn+z*c,pulse:held('primary')||touch.pulse||pad.pulse,sprint:keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.sprint||pad.sprint,interact:interactEdge};interactEdge=false;return input;
}
function bindTouchButton(id,action){
  const button=$(id);
  button.addEventListener('pointerdown',e=>{if(state.mode!=='playing'||state.modal)return;e.preventDefault();setInputDevice('touch');unlockAudio();button.setPointerCapture(e.pointerId);pointerActions.set(e.pointerId,action);button.classList.add('active');if(action==='interact')interactEdge=true;else touch[action]=true;});
  const release=e=>{if(!pointerActions.has(e.pointerId))return;pointerActions.delete(e.pointerId);const active=Array.from(pointerActions.values()).includes(action);button.classList.toggle('active',active);if(action!=='interact')touch[action]=active;};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('click',e=>{if(e.detail===0&&action==='interact')interactEdge=true;});
}
function bindInputs(){
  document.addEventListener('keydown',onKeyDown);document.addEventListener('keyup',onKeyUp);
  window.addEventListener('blur',()=>{resetInput();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();pause();}});
  window.addEventListener('storage',e=>{if(e.key==='wwg:keymap')resetInput();});
  const canvas=valley.canvas;
  canvas.addEventListener('pointerdown',e=>{if(state.mode!=='playing'||state.modal||e.button>0)return;e.preventDefault();setInputDevice(e.pointerType==='touch'?'touch':'keyboard');unlockAudio();orbit={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);safeFocus(canvas);});
  canvas.addEventListener('pointermove',e=>{if(orbit?.id!==e.pointerId)return;const dx=e.clientX-orbit.x,dy=e.clientY-orbit.y;orbit.x=e.clientX;orbit.y=e.clientY;yaw-=dx*.006;pitch=Math.max(.24,Math.min(1.03,pitch+dy*.004));});
  const end=e=>{if(orbit?.id===e.pointerId)orbit=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);canvas.addEventListener('contextmenu',e=>e.preventDefault());
  const stick=$('stick');
  function drag(e){const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,max=rect.width*.32;let dx=e.clientX-cx,dz=e.clientY-cy;const n=Math.hypot(dx,dz);if(n>max){dx*=max/n;dz*=max/n;}touch.x=dx/max;touch.z=dz/max;$('stickThumb').style.transform=`translate(${dx}px,${dz}px)`;}
  stick.addEventListener('pointerdown',e=>{if(stickPointer!==null||state.mode!=='playing'||state.modal)return;e.preventDefault();setInputDevice('touch');stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);drag(e);unlockAudio();});
  stick.addEventListener('pointermove',e=>{if(stickPointer===e.pointerId)drag(e);});
  const release=e=>{if(stickPointer!==e.pointerId)return;stickPointer=null;touch.x=touch.z=0;$('stickThumb').style.transform='';};stick.addEventListener('pointerup',release);stick.addEventListener('pointercancel',release);stick.addEventListener('lostpointercapture',release);
  bindTouchButton('touchPulse','pulse');bindTouchButton('touchInteract','interact');bindTouchButton('touchSprint','sprint');
}
const labelNodes=[];
function createLabels(){
  const labels=[{id:'home',...SITES.lighthouse,y:11,label:'Dawn Lighthouse'},{id:'archive',x:-31,z:2,y:6,label:'Western Archive'},{id:'workshop',...SITES.workshop,y:4.5,label:'Tide Workshop'},{id:'workbench',...TIDEWORKS.bench,y:2.2,label:'Counterweight bench'},{id:'valve',...TIDEWORKS.valve,y:2.3,label:'Sluice dial'},{id:'bridge',...TIDEWORKS.winch,y:2.5,label:'Bridge winch'},{id:'spire',...SITES.spire,y:7,label:'Solstice Spire'},...PILLARS.map(p=>({...p,id:'rune-'+p.rune,y:3.8,label:RUNES.find(r=>r.id===p.rune).name,glyph:RUNES.find(r=>r.id===p.rune).glyph}))];
  for(const label of labels){const node=document.createElement('div');node.className='world-label';node.innerHTML=(label.glyph?`<span class="glyph">${label.glyph}</span>`:'')+label.label;$('labels').append(node);labelNodes.push({node,...label});}
}
function paintLabels(){
  for(const l of labelNodes){
    const d=Math.hypot(l.x-state.player.x,l.z-state.player.z),p=valley.project(l.x,terrainHeight(l.x,l.z)+l.y,l.z);
    const nearDevice=['workbench','valve','bridge'].includes(l.id),visible=state.mode==='playing'&&!state.modal&&p.visible&&d<(l.glyph?22:nearDevice?20:52)&&d>2;
    l.node.hidden=!visible;if(visible){
      if(l.id==='valve')l.node.textContent='Sluice · '+(RUNES[state.tideworks.setting]?.name||'closed');
      if(l.id==='workbench')l.node.textContent=state.tideworks.installed?'Counterweight installed':'Counterweight bench';
      const done=l.glyph?state.completed.archive||state.sequence.slice(0,state.archiveStep).includes(l.rune):l.id==='workbench'?state.tideworks.installed:l.id==='valve'?RUNES[state.tideworks.setting]?.id===state.sequence[0]:!!state.completed[l.id];
      l.node.style.left=p.x+'px';l.node.style.top=p.y+'px';l.node.classList.toggle('done',done);
    }
  }
}
function paintMap(){
  const c=mapContext;if(!c)return;const w=156,scale=1.23,at=p=>({x:w/2+p.x*scale,y:w/2+p.z*scale});
  c.clearRect(0,0,w,w);c.save();c.beginPath();c.arc(78,78,75,0,Math.PI*2);c.clip();c.fillStyle='#153f42';c.fillRect(0,0,w,w);
  c.fillStyle='#547664';c.beginPath();c.roundRect(15,15,126,126,17);c.fill();c.fillStyle='#398290';c.fillRect(10,78-21.6*scale,137,7.2*scale);
  c.strokeStyle='#c0ba8a65';c.lineWidth=2;c.beginPath();[[0,36],[-16,27],[-31,8],[-19,13],[3,23],[30,23],[20,6],[20,-12]].forEach(([x,z],i)=>i?c.lineTo(78+x*scale,78+z*scale):c.moveTo(78+x*scale,78+z*scale));c.stroke();
  if(state.completed.bridge){c.fillStyle='#e2ca8a';c.fillRect(78+17.3*scale,78-22*scale,5.4*scale,8*scale);}
  for(const [key,point] of Object.entries(SITES)){if(key==='bridge')continue;const p=at(point);c.fillStyle=state.completed[key]?'#b1e1a5':key==='workshop'?'#dbb478':'#c8ccb3';c.beginPath();c.arc(p.x,p.y,key==='lighthouse'?3:3.7,0,Math.PI*2);c.fill();}
  const target=at(objective(state).target);c.strokeStyle='#f6dea1';c.lineWidth=1.4;c.beginPath();c.arc(target.x,target.y,6,0,Math.PI*2);c.stroke();
  for(const e of state.enemies)if(e.hp>0&&Math.hypot(e.x-state.player.x,e.z-state.player.z)<16){const p=at(e);c.fillStyle='#eea568';c.fillRect(p.x-1.5,p.y-1.5,3,3);}
  const p=at(state.player),a=state.player.facing;c.fillStyle='#fff4d1';c.beginPath();c.moveTo(p.x+Math.sin(a)*5.5,p.y+Math.cos(a)*5.5);c.lineTo(p.x+Math.sin(a+2.5)*4,p.y+Math.cos(a+2.5)*4);c.lineTo(p.x+Math.sin(a-2.5)*4,p.y+Math.cos(a-2.5)*4);c.closePath();c.fill();c.restore();
}
function paintHud(){
  const task=objective(state),p=state.player;$('objectiveTitle').textContent=task.title;$('objectiveText').textContent=task.text;
  $('healthValue').textContent=Math.ceil(p.hp);$('healthFill').style.width=p.hp+'%';$('staminaFill').style.width=p.stamina+'%';$('healthFill').style.background=p.hp<35?'#eeaa7f':'#a4e4bb';
  $('archivePip').classList.toggle('done',state.completed.archive);$('bridgePip').classList.toggle('done',state.completed.bridge);$('spirePip').classList.toggle('done',state.completed.spire);
  $('weather').textContent=weatherAt(state.weatherTime).name;$('runBadge').textContent=state.ranked?'FRESH EXPEDITION':'CHECKPOINT PRACTICE';$('salvageValue').textContent=state.tideworks.installed?'COUNTERWEIGHT INSTALLED':'SALVAGE '+state.salvage+' / 4';$('distanceValue').textContent=Math.round(Math.hypot(task.target.x-p.x,task.target.z-p.z))+' m TO OBJECTIVE';
  const warden=state.enemies.find(e=>e.type==='warden'&&e.hp>0&&Math.hypot(e.x-p.x,e.z-p.z)<19);$('encounter').hidden=!warden||state.mode!=='playing'||!!state.modal;
  if(warden){const phase=warden.phase,exposed=phase==='recover'&&warden.exposed;$('encounterTitle').textContent=exposed?'CORE EXPOSED · PULSE NOW':phase==='windup'?'CHARGE MARKED · LEAVE THE LANE':phase==='charge'?'WARDEN CHARGING':'WARDEN GUARDED';$('encounterText').textContent=exposed?'Its bronze plates are open. Pulse the bright core.':phase==='windup'||phase==='charge'?'Move sideways from the amber lane. The charge direction is locked.':phase==='recover'?'The charge connected. Its plates stay closed until you evade a charge.':'Keep room to move. Evade its charge to expose the core.';$('encounter').classList.toggle('exposed',exposed);}
  const nearby=interaction(state);$('interaction').hidden=!nearby||state.mode!=='playing'||!!state.modal||!$('confirm').hidden;if(nearby)$('interactionText').textContent=nearby.label;
  if(state.message.text!==toastText){toastText=state.message.text;$('toast').textContent=toastText;}$('toast').classList.toggle('show',state.message.ttl>0&&state.mode==='playing'&&!state.modal);
  $('vignette').classList.toggle('hurt',p.invulnerable>.5&&!settings.reducedMotion);paintMap();paintLabels();
}
function animate(now){
  if(stopped)return;frame=requestAnimationFrame(animate);const dt=lastTime?Math.min(.25,Math.max(0,(now-lastTime)/1000)):0;lastTime=now;
  const input=inputForFrame(dt);stepExpedition(state,input,dt);processEvents();
  if(state.modal&&lastJournal!==state.modal){journalFromPause=false;lastJournal=state.modal;resetInput();stopSounds();paintJournal();showOnly('journal');safeFocus($('closeJournalButton'));}
  if(state.mode!==lastMode){if(state.mode==='won'||state.mode==='dead')showResult();lastMode=state.mode;}
  const frameDelay=valley.renderer.mode==='software'?32:0;
  if(now-lastDraw>=frameDelay){const drawDt=Math.min(.25,(now-lastDraw)/1000);lastDraw=now;valley.update(state,drawDt,{yaw,pitch,reducedMotion:settings.reducedMotion,title:state.mode==='menu',snap:snapCamera});snapCamera=false;if(state.mode!=='menu')paintHud();else for(const l of labelNodes)l.node.hidden=true;}
}
function bindButtons(){
  $('startButton').addEventListener('click',requestFresh);$('continueButton').addEventListener('click',()=>{const next=restoreCheckpoint(saved);if(next)launch(next);else{saved=null;syncSaved();}});
  $('pauseButton').addEventListener('click',pause);$('resumeButton').addEventListener('click',resume);$('restartButton').addEventListener('click',requestFresh);
  $('confirmStart').addEventListener('click',startFresh);$('cancelStart').addEventListener('click',cancelFresh);
  $('journalButton').addEventListener('click',()=>showJournal());$('pauseJournalButton').addEventListener('click',()=>showJournal(true));$('closeJournalButton').addEventListener('click',closeJournal);
  $('retryButton').addEventListener('click',()=>{if(state.mode==='won')startFresh();else launch(retryExpedition(state));});$('resultMenuButton').addEventListener('click',toMenu);
  $('touchToggle').addEventListener('change',e=>{settings.touch=e.target.checked;document.body.classList.toggle('touch',settings.touch);resetInput();});
  $('motionToggle').addEventListener('change',e=>{settings.reducedMotion=e.target.checked;document.body.classList.toggle('reduced-motion',settings.reducedMotion);});
  $('muteToggle').addEventListener('change',e=>{settings.muted=e.target.checked;if(settings.muted)stopSounds();else unlockAudio();});
}
try{
  valley=createValley($('world'));$('renderLabel').textContent='';
  createLabels();bindInputs();bindButtons();syncSaved();refreshKeyLabels();
  const resize=()=>{const rect=$('game').getBoundingClientRect();valley.resize(Math.max(1,rect.width),Math.max(1,rect.height));};
  const observer=new ResizeObserver(resize);observer.observe($('game'));resize();
  valley.update(state,0,{title:true,reducedMotion:settings.reducedMotion,snap:true});$('loading').hidden=true;safeFocus(saved?$('continueButton'):$('startButton'));frame=requestAnimationFrame(animate);
  window.addEventListener('pagehide',event=>{
    if(lifecycleDisposed)return;
    if(event.persisted){
      // The browser will retain this document and its renderer. Stop scheduling
      // work and require an explicit resume when it returns from page cache.
      pause();resetInput();stopSounds();pageCached=true;stopped=true;
      cancelAnimationFrame(frame);frame=0;lastTime=lastDraw=0;
      try{audioContext?.suspend()?.catch(()=>{});}catch{}
      return;
    }
    lifecycleDisposed=true;pageCached=false;stopped=true;cancelAnimationFrame(frame);frame=0;
    observer.disconnect();resetInput();stopSounds();valley.dispose();try{audioContext?.close()?.catch(()=>{});}catch{}
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted||!pageCached||lifecycleDisposed)return;
    pageCached=false;stopped=false;lastTime=lastDraw=0;snapCamera=true;
    resetInput();resize();
    const overlay=activeOverlay(),items=overlayItems(overlay);
    safeFocus(overlay?.id==='confirm'?$('cancelStart'):items.includes(document.activeElement)?document.activeElement:items[0]);
    frame=requestAnimationFrame(animate);
  });
}catch(error){
  $('loading').hidden=true;$('fatal').hidden=false;$('fatalText').textContent='The expedition could not initialize. Reload the page to try again.';console.error('Solstice Wilds initialization failed:',error);
}
