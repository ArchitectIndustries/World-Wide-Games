/* Solstice Wilds — original deterministic expedition model. Architect Industries. */
export const GAME_ID = 'solstice-wilds';
export const SAVE_KEY = 'wwg:solstice-wilds:checkpoint:v1';
export const SAVE_SCHEMA = 1;
export const PLAYER_RADIUS = .65;
export const RUNES = Object.freeze([
  {id:'sun', name:'Sun', glyph:'☀', color:'#ffc66b'},
  {id:'tide', name:'Tide', glyph:'≈', color:'#74e7df'},
  {id:'leaf', name:'Leaf', glyph:'✦', color:'#b2e880'}
]);
export const SITES = Object.freeze({
  lighthouse:{x:0,z:41,name:'Dawn Lighthouse'},
  archive:{x:-31,z:2,name:'The Western Archive'},
  workshop:{x:30,z:16,name:'The Tide Workshop'},
  bridge:{x:20,z:-10,name:'River Bridge'},
  spire:{x:2,z:-38,name:'The Solstice Spire'}
});
export const PILLARS = Object.freeze([
  {x:-38,z:-1,rune:'sun'}, {x:-31,z:-6,rune:'tide'}, {x:-24,z:-1,rune:'leaf'}
]);
export const TABLET = Object.freeze({x:-31,z:7});
export const CRATES = Object.freeze([
  {x:23,z:17}, {x:27,z:23}, {x:35,z:23},
  {x:39,z:16}, {x:36,z:9}, {x:25,z:10}
]);
export const TREES = Object.freeze([
  [-46,38],[-39,21],[-34,33],[-26,29],[-22,41],[-9,40],[13,42],[28,39],[40,34],[43,25],
  [43,4],[34,-5],[11,2],[4,-8],[-8,2],[-14,-8],[-46,-10],[-45,-27],[-33,-31],[-27,-44],
  [-17,-29],[27,-29],[37,-35],[42,-46],[-40,10],[41,44],[7,33],[-18,8],[33,0],[45,-30]
].map(([x,z])=>({x,z})));
export const OBSTACLES = Object.freeze([
  // Solid foundations, rocks and remaining archive walls. Gaps are deliberate paths.
  {x:0,z:42,r:2.5,kind:'lighthouse'},
  {x:-39,z:2.35,r:.6,kind:'column'}, {x:-39,z:-4.35,r:.6,kind:'column'},
  {x:-23,z:2.35,r:.6,kind:'column'}, {x:-23,z:-4.35,r:.6,kind:'column'},
  {x:-35,z:-10,r:1.5,kind:'rock'}, {x:-26,z:-10,r:1.6,kind:'rock'},
  {x:31,z:14,r:2,kind:'workshop'},
  {x:TABLET.x,z:TABLET.z,r:.9,kind:'tablet'},
  {x:2,z:-38,r:1.8,kind:'spire'},
  {x:-14,z:20,r:2.3,kind:'rock'}, {x:10,z:13,r:1.65,kind:'rock'},
  {x:-43,z:29,r:2.4,kind:'rock'}, {x:44,z:-5,r:2.4,kind:'rock'},
  {x:15,z:-35,r:1.8,kind:'rock'}, {x:-14,z:-43,r:2.2,kind:'rock'},
  ...PILLARS.map(p=>({x:p.x,z:p.z,r:.9,kind:'pillar'})),
  ...TREES.map(p=>({...p,r:.4,kind:'tree'})),
  ...Array.from({length:7},(_,i)=>({x:2+Math.sin(i/7*Math.PI*2)*8.3,z:-38+Math.cos(i/7*Math.PI*2)*8.3,r:.68,kind:'column'}))
]);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const uint=n=>(n>>>0)||7331;
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);

export function random(seed) {
  let t=uint(seed);
  return ()=>{t+=0x6D2B79F5;let r=t;r=Math.imul(r^(r>>>15),r|1);r^=r+Math.imul(r^(r>>>7),r|61);return((r^(r>>>14))>>>0)/4294967296;};
}
export function seedFrom(value) {
  const text=String(value??'solstice');let n=2166136261;
  for(const ch of text.slice(0,80)){n^=ch.codePointAt(0);n=Math.imul(n,16777619);}
  return uint(n);
}
export function terrainHeight(x,z) {
  const roll=.28*Math.sin(x*.14)*Math.cos(z*.12)+.18*Math.sin(z*.23+x*.07);
  const archive=1.2*Math.exp(-((x+31)**2+(z+1)**2)/240);
  const north=2.6/(1+Math.exp((z+27)*.34));
  const banks=Math.abs(z+18)<5?-.15:0;
  return .65+roll+archive+north+banks;
}
function runeSequence(seed) {
  const r=random(seed^0x5ab81),a=['sun','tide','leaf'];
  for(let i=2;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function enemies() {
  return [
    {id:'workshop-1',x:22,z:13,type:'scout',site:'workshop',hp:3},
    {id:'workshop-2',x:39,z:22,type:'scout',site:'workshop',hp:3},
    {id:'spire-west',x:-7,z:-35,type:'sentinel',site:'spire',hp:5},
    {id:'spire-east',x:11,z:-40,type:'sentinel',site:'spire',hp:5},
    {id:'spire-warden',x:2,z:-43,type:'warden',site:'spire',hp:8}
  ].map((e,i)=>({...e,home:{x:e.x,z:e.z},maxHp:e.hp,facing:0,phase:'patrol',clock:i*.3,
    cooldown:1+i*.25,target:null,hitFlash:0,attackSerial:0}));
}
export function createExpedition(seed=7331) {
  seed=uint(seed);
  return {
    seed:uint(seed),mode:'playing',modal:null,elapsed:0,weatherTime:0,score:0,ranked:true,
    player:{x:0,z:35,facing:Math.PI,hp:100,stamina:100,pulseCooldown:0,invulnerable:0,sprintRest:0,walk:0},
    completed:{archive:false,bridge:false,spire:false},archiveRead:false,archiveStep:0,
    sequence:runeSequence(seed),salvage:0,
    crates:CRATES.map((c,i)=>({...c,id:i,hp:2,collected:false,hitFlash:0})),
    enemies:enemies(),projectiles:[],effects:[],events:[],message:{text:'Follow the gold trail to the Western Archive.',ttl:7},
    checkpoint:null,completedOnce:false,totalDamage:0,pulses:0,interactions:0
  };
}
function emit(s,event,detail={}) {s.events.push({event,detail});}
function say(s,text,ttl=4) {s.message={text,ttl};}
export function takeEvents(s) {return s.events.splice(0);}
export function setPaused(s,paused) {
  if(s.mode==='playing'&&paused){s.mode='paused';return true;}
  if(s.mode==='paused'&&!paused){s.mode='playing';return true;}
  return false;
}
export function closeModal(s) {s.modal=null;}
export function openJournal(s) {if(s.mode==='playing'&&!s.modal)s.modal='journal';}
function isActive(s) {return s.mode==='playing'&&!s.modal;}

export function canOccupy(s,x,z,radius=PLAYER_RADIUS,{crates=true}={}) {
  if(!finite(x)||!finite(z)||x<-49+radius||x>49-radius||z<-49+radius||z>49-radius)return false;
  // The river is a continuous impassable boundary; its only crossing is the repaired bridge.
  if(Math.abs(z+18)<3.6+radius&&(!s.completed.bridge||Math.abs(x-20)>3.2-radius))return false;
  for(const o of OBSTACLES)if(Math.hypot(x-o.x,z-o.z)<o.r+radius)return false;
  if(crates)for(const c of s.crates)if(c.hp>0&&Math.hypot(x-c.x,z-c.z)<1+radius)return false;
  return true;
}
function moveBody(s,body,dx,dz,radius=PLAYER_RADIUS,options) {
  // Subdivision avoids tunnelling even during a permitted long foreground frame.
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.25));
  for(let i=0;i<count;i++){
    if(canOccupy(s,body.x+dx/count,body.z,radius,options))body.x+=dx/count;
    if(canOccupy(s,body.x,body.z+dz/count,radius,options))body.z+=dz/count;
  }
}
function lineClear(s,a,b) {
  const length=dist(a,b),steps=Math.ceil(length/.55);
  for(let i=1;i<steps;i++){
    const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps;
    if(OBSTACLES.some(o=>Math.hypot(x-o.x,z-o.z)<o.r*.86))return false;
  }
  return true;
}
function effect(s,type,x,z,extra={}) {
  s.effects.push({type,x,z,ttl:type==='pulse'?.23:.65,life:type==='pulse'?.23:.65,...extra});
  if(s.effects.length>28)s.effects.shift();
}
function damagePlayer(s,amount,source) {
  if(!isActive(s)||s.player.invulnerable>0)return false;
  s.player.hp=Math.max(0,s.player.hp-amount);s.player.invulnerable=.9;s.totalDamage+=amount;
  effect(s,'hurt',s.player.x,s.player.z);emit(s,'player-hit',{amount,source});
  if(s.player.hp===0){s.mode='dead';s.modal=null;s.projectiles=[];say(s,'Your field lantern went dark. Return to the last restored site.',999);emit(s,'expedition-lost');}
  return true;
}
export function pulse(s) {
  if(!isActive(s)||s.player.pulseCooldown>0)return false;
  const p=s.player;p.pulseCooldown=.34;s.pulses++;
  const targets=[...s.enemies.filter(e=>e.hp>0),...s.crates.filter(c=>c.hp>0)]
    .filter(t=>dist(p,t)<=11.5&&lineClear(s,p,t)).sort((a,b)=>dist(p,a)-dist(p,b));
  const target=targets[0];
  effect(s,'pulse',p.x,p.z,{tx:target?.x??p.x+Math.sin(p.facing)*9,tz:target?.z??p.z+Math.cos(p.facing)*9});
  emit(s,'pulse-fired',{hit:!!target});
  if(!target)return true;
  p.facing=Math.atan2(target.x-p.x,target.z-p.z);target.hp--;target.hitFlash=.18;
  if(target.hp===0){
    effect(s,'shatter',target.x,target.z);
    if('type'in target){target.phase='dead';s.score+=target.type==='warden'?180:60;emit(s,'guardian-defeated',{id:target.id});say(s,target.site==='spire'?'Guardian quieted. Keep moving during the amber warning.':'Workshop sentinel quieted. Pulse the wooden crates for salvage.');}
    else {emit(s,'crate-broken',{id:target.id});say(s,'Salvage released. Walk over the golden part to collect it.');}
  }
  return true;
}
export function interaction(s) {
  if(s.mode!=='playing')return null;
  const p=s.player,candidates=[];
  const add=(id,point,range,label)=>{const d=dist(p,point);if(d<=range)candidates.push({id,...point,label,d});};
  add('lighthouse',{x:0,z:37.8},4,s.completed.spire?'Signal the expedition home':'Rest at the lighthouse');
  add('tablet',TABLET,3.5,s.archiveRead?'Read the rune sequence':'Read the Archive inscription');
  if(!s.completed.archive)for(const q of PILLARS)add('pillar-'+q.rune,q,3,'Attune the '+RUNES.find(r=>r.id===q.rune).name+' pillar');
  add('bridge',SITES.bridge,4.5,s.completed.bridge?'Rest at the repaired bridge':`Repair bridge · ${s.salvage}/4 salvage`);
  add('spire',SITES.spire,4,s.completed.spire?'The Spire is restored':'Activate the Solstice Spire');
  candidates.sort((a,b)=>a.d-b.d);return candidates[0]??null;
}
function checkpoint(s,site) {
  s.player.hp=100;s.player.stamina=100;s.checkpoint=makeCheckpoint(s);
  emit(s,'checkpoint',{site,checkpoint:s.checkpoint});
}
export function interact(s) {
  if(!isActive(s))return false;
  const a=interaction(s);if(!a)return false;s.interactions++;
  if(a.id==='tablet'){
    s.archiveRead=true;s.modal='archive';say(s,'The inscription gives the order. Attune each matching pillar.');return true;
  }
  if(a.id.startsWith('pillar-')){
    if(!s.archiveRead){say(s,'The pillars are silent. Read the tablet beside the Archive entrance.');return false;}
    const rune=a.id.slice(7);
    if(rune!==s.sequence[s.archiveStep]){s.archiveStep=0;say(s,'The harmony broke. Begin again in the inscription’s order.',5);effect(s,'wrong',a.x,a.z);emit(s,'rune-reset');return false;}
    s.archiveStep++;effect(s,'attune',a.x,a.z);emit(s,'rune-attuned',{rune,step:s.archiveStep});
    if(s.archiveStep===3){s.completed.archive=true;s.score+=300;checkpoint(s,'archive');emit(s,'archive-restored');say(s,'Archive restored · checkpoint saved. Recover four parts at the Tide Workshop, then repair the bridge.',8);}
    else say(s,`Rune ${s.archiveStep} of 3 attuned. Follow the inscription.`);
    return true;
  }
  if(a.id==='bridge'){
    if(s.completed.bridge){s.player.hp=100;s.player.stamina=100;say(s,'Field lantern restored. The bridge is safe to cross.');return true;}
    if(!s.completed.archive){say(s,'The bridge mechanism needs the Archive’s restored light. Visit the western ruins first.',5);return false;}
    if(s.salvage<4){say(s,'Find four golden parts: pulse wooden crates at the Tide Workshop, then walk over the salvage.',6);return false;}
    s.salvage-=4;s.completed.bridge=true;s.score+=300;checkpoint(s,'bridge');emit(s,'bridge-repaired');say(s,'Bridge repaired · checkpoint saved. Cross north and quiet the Spire’s three guardians.',8);effect(s,'attune',20,-18);return true;
  }
  if(a.id==='spire'){
    if(s.completed.spire){say(s,'The observatory is awake. Return south to the Dawn Lighthouse.');return true;}
    if(!s.completed.archive||!s.completed.bridge){say(s,'Restore the Archive and repair the river bridge first.');return false;}
    const remaining=s.enemies.filter(e=>e.site==='spire'&&e.hp>0).length;
    if(remaining){say(s,`${remaining} Spire guardian${remaining===1?' is':'s are'} still active. Keep moving, avoid the amber warnings, and pulse.`,6);return false;}
    s.completed.spire=true;s.score+=500;checkpoint(s,'spire');emit(s,'spire-restored');say(s,'Spire restored · checkpoint saved. Carry the solstice light home to the Dawn Lighthouse.',9);effect(s,'attune',a.x,a.z);return true;
  }
  if(a.id==='lighthouse'){
    if(!s.completed.spire){s.player.hp=100;s.player.stamina=100;say(s,'Rested. The gold trail leads west to the Archive; the journal records your route.');return true;}
    if(s.completedOnce)return false;
    s.completedOnce=true;s.mode='won';s.projectiles=[];s.score+=Math.max(0,600-Math.floor(s.elapsed))+Math.round(s.player.hp*2);
    const event={event:'campaign-complete',detail:{seconds:Math.round(s.elapsed),sites:3,ranked:s.ranked,damage:s.totalDamage},duration:s.elapsed};
    if(s.ranked)event.score=s.score;s.events.push(event);say(s,'The valley’s light is home.',999);return true;
  }
  return false;
}
function enemyStep(s,e,dt) {
  if(e.hp<=0)return;
  e.hitFlash=Math.max(0,e.hitFlash-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.clock+=dt;
  const p=s.player,d=dist(e,p),atHome=dist(e,e.home);
  if(e.site==='spire'&&p.z>-23){e.phase='patrol';return;}
  if(e.phase==='windup'){
    if(e.clock<e.windup)return;
    const target=e.target;e.phase='recover';e.clock=0;e.cooldown=e.type==='warden'?1.8:1.3;
    if(e.type==='sentinel'){
      const dx=target.x-e.x,dz=target.z-e.z,n=Math.hypot(dx,dz)||1;
      s.projectiles.push({x:e.x,z:e.z,vx:dx/n*13,vz:dz/n*13,ttl:2.3,owner:e.id});
      effect(s,'enemy-shot',e.x,e.z);
    }else{
      const radius=e.type==='warden'?3.6:2.5;effect(s,'slam',target.x,target.z,{radius});
      if(dist(p,target)<radius+PLAYER_RADIUS)damagePlayer(s,e.type==='warden'?26:18,e.id);
    }
    return;
  }
  if(e.phase==='recover'){if(e.clock>.65){e.phase='chase';e.clock=0;}return;}
  if(d<17&&atHome<24){
    e.phase='chase';e.facing=Math.atan2(p.x-e.x,p.z-e.z);
    const range=e.type==='sentinel'?11:e.type==='warden'?4.3:3;
    if(d<range&&e.cooldown<=0&&lineClear(s,e,p)){
      e.phase='windup';e.clock=0;e.windup=e.type==='warden'?1.25:e.type==='sentinel'?1.05:.8;
      e.target={x:p.x,z:p.z};e.attackSerial++;return;
    }
    if(d>range*.7){const speed=e.type==='warden'?2.15:e.type==='sentinel'?1.7:2.9;moveBody(s,e,Math.sin(e.facing)*speed*dt,Math.cos(e.facing)*speed*dt,.75,{crates:false});}
  }else{
    e.phase='patrol';
    const target={x:e.home.x+Math.sin(s.elapsed*.34+e.maxHp)*2,z:e.home.z+Math.cos(s.elapsed*.29+e.maxHp)*1.5};
    const n=dist(e,target)||1;e.facing=Math.atan2(target.x-e.x,target.z-e.z);
    moveBody(s,e,(target.x-e.x)/n*dt*.7,(target.z-e.z)/n*dt*.7,.75,{crates:false});
  }
}
function tick(s,input,dt) {
  s.elapsed+=dt;s.weatherTime+=dt;
  const p=s.player;
  p.pulseCooldown=Math.max(0,p.pulseCooldown-dt);p.invulnerable=Math.max(0,p.invulnerable-dt);p.sprintRest=Math.max(0,p.sprintRest-dt);
  let mx=finite(input.mx)?clamp(input.mx,-1,1):0,mz=finite(input.mz)?clamp(input.mz,-1,1):0;
  const n=Math.hypot(mx,mz);if(n>1){mx/=n;mz/=n;}
  if(n>.05){
    const sprint=!!input.sprint&&p.stamina>1;
    if(sprint){p.stamina=Math.max(0,p.stamina-25*dt);p.sprintRest=.8;}
    const speed=sprint?8.5:5.3;p.facing=Math.atan2(mx,mz);p.walk+=dt*speed;
    const weather=weatherAt(s.weatherTime);const wind=weather.rain*.23;
    moveBody(s,p,mx*speed*dt+wind*dt,mz*speed*dt);
  }
  if(p.sprintRest===0)p.stamina=Math.min(100,p.stamina+20*dt);
  if(input.pulse)pulse(s);
  for(const c of s.crates){
    c.hitFlash=Math.max(0,c.hitFlash-dt);
    if(c.hp===0&&!c.collected&&dist(p,c)<1.8){c.collected=true;s.salvage++;s.score+=25;effect(s,'collect',c.x,c.z);emit(s,'salvage-collected',{count:s.salvage});say(s,`Salvage recovered · ${s.salvage}/4 for the bridge.`);}
  }
  for(const e of s.enemies){enemyStep(s,e,dt);if(s.mode!=='playing')break;}
  if(s.mode!=='playing')return;
  for(const q of s.projectiles){
    q.ttl-=dt;const steps=Math.max(1,Math.ceil(Math.hypot(q.vx,q.vz)*dt/.3));
    for(let j=0;j<steps&&q.ttl>0;j++){
      q.x+=q.vx*dt/steps;q.z+=q.vz*dt/steps;
      if(dist(q,p)<1){damagePlayer(s,16,q.owner);q.ttl=0;}
      else if(OBSTACLES.some(o=>Math.hypot(q.x-o.x,q.z-o.z)<o.r))q.ttl=0;
    }
  }
  s.projectiles=s.projectiles.filter(q=>q.ttl>0);
  for(const f of s.effects)f.ttl-=dt;s.effects=s.effects.filter(f=>f.ttl>0);
  s.message.ttl=Math.max(0,s.message.ttl-dt);
}
export function stepExpedition(s,input={},delta=0) {
  if(!isActive(s)||!finite(delta)||delta<=0)return;
  if(input.interact){interact(s);if(!isActive(s))return;}
  const elapsed=clamp(delta,0,.25),steps=Math.ceil(elapsed/(1/60)),dt=elapsed/steps;
  for(let i=0;i<steps&&isActive(s);i++)tick(s,input,dt);
}
export function weatherAt(time) {
  const t=((time%150)+150)%150;
  const rain=clamp((t-55)/15,0,1)*clamp((125-t)/18,0,1);
  return {rain,wind:.25+.5*(.5+.5*Math.sin(time*.043)),day:.72+.28*Math.sin(time*.011),name:rain>.5?'Coastal rain':rain>.05?'Wind rising':'Clear coast'};
}
export function objective(s) {
  if(s.mode==='won')return {title:'Expedition complete',text:'The solstice light has returned to the lighthouse.',target:SITES.lighthouse};
  if(!s.completed.archive)return {title:'01 · Wake the Archive',text:s.archiveRead?`Attune the pillars in the recorded order · ${s.archiveStep}/3`:'Follow the western trail and read the Archive tablet.',target:s.archiveRead?SITES.archive:TABLET};
  if(!s.completed.bridge)return s.salvage<4?{title:'02 · Restore the crossing',text:`Pulse workshop crates; collect four golden parts · ${s.salvage}/4`,target:SITES.workshop}:{title:'02 · Restore the crossing',text:'Bring your salvage to the bridge mechanism beside the river.',target:SITES.bridge};
  if(!s.completed.spire){const remaining=s.enemies.filter(e=>e.site==='spire'&&e.hp>0).length;return {title:'03 · Light the Solstice Spire',text:remaining?`Cross the bridge. Quiet ${remaining} guardian${remaining===1?'':'s'}; avoid their amber warnings.`:'Activate the quiet Spire at the center of the northern court.',target:SITES.spire};}
  return {title:'04 · Bring the light home',text:'Return across the bridge and signal at the Dawn Lighthouse.',target:{x:0,z:37.8}};
}
export function makeCheckpoint(s) {
  return {schema:SAVE_SCHEMA,seed:s.seed,completed:{...s.completed},archiveRead:s.archiveRead,
    salvage:clamp(Math.floor(s.salvage),0,6),score:clamp(Math.floor(s.score),0,5000),elapsed:clamp(s.elapsed,0,36000),
    crates:s.crates.map(c=>({hp:c.hp,collected:c.collected})),defeated:s.enemies.filter(e=>e.hp===0).map(e=>e.id)};
}
export function validateCheckpoint(value) {
  if(!record(value)||value.schema!==SAVE_SCHEMA||!Number.isInteger(value.seed)||value.seed<1||value.seed>4294967295)return null;
  const c=value.completed;if(!record(c)||!['archive','bridge','spire'].every(k=>typeof c[k]==='boolean'))return null;
  if(!c.archive||(c.spire&&!c.bridge)||value.archiveRead!==true)return null;
  if(!Number.isInteger(value.salvage)||value.salvage<0||value.salvage>6||!Number.isInteger(value.score)||value.score<0||value.score>5000||!finite(value.elapsed)||value.elapsed<0||value.elapsed>36000)return null;
  if(!Array.isArray(value.crates)||value.crates.length!==CRATES.length||!value.crates.every(v=>record(v)&&Number.isInteger(v.hp)&&v.hp>=0&&v.hp<=2&&typeof v.collected==='boolean'&&(!v.collected||v.hp===0)))return null;
  const collected=value.crates.filter(v=>v.collected).length;
  if(value.salvage!==collected-(c.bridge?4:0))return null;
  const ids=enemies().map(e=>e.id);
  if(!Array.isArray(value.defeated)||value.defeated.length>ids.length||new Set(value.defeated).size!==value.defeated.length||!value.defeated.every(id=>ids.includes(id)))return null;
  if(c.spire&&!ids.filter(id=>id.startsWith('spire-')).every(id=>value.defeated.includes(id)))return null;
  return {schema:SAVE_SCHEMA,seed:value.seed,completed:{archive:c.archive,bridge:c.bridge,spire:c.spire},archiveRead:true,salvage:value.salvage,score:value.score,elapsed:value.elapsed,
    crates:value.crates.map(v=>({hp:v.hp,collected:v.collected})),defeated:[...value.defeated]};
}
export function restoreCheckpoint(value) {
  const saved=validateCheckpoint(value);if(!saved)return null;
  const s=createExpedition(saved.seed);s.completed={...saved.completed};s.archiveRead=true;s.archiveStep=3;s.salvage=saved.salvage;s.score=saved.score;s.elapsed=saved.elapsed;s.weatherTime=saved.elapsed;s.ranked=false;s.checkpoint=saved;
  const pos=s.completed.spire?{x:2,z:-33}:s.completed.bridge?{x:20,z:-10}:{x:-31,z:10};Object.assign(s.player,pos);
  for(let i=0;i<s.crates.length;i++)Object.assign(s.crates[i],saved.crates[i]);
  for(const e of s.enemies)if(saved.defeated.includes(e.id)){e.hp=0;e.phase='dead';}
  say(s,'Checkpoint restored · expedition practice. Finish the journey; completion scores are awarded on fresh runs.',8);return s;
}
export function retryExpedition(s) {
  const restored=s.checkpoint?restoreCheckpoint(s.checkpoint):createExpedition(s.seed);
  restored.ranked=false;return restored;
}
export function readCheckpoint(storage) {
  try {const raw=storage?.getItem(SAVE_KEY);if(!raw||raw.length>4096)return null;return validateCheckpoint(JSON.parse(raw));}catch{return null;}
}
export function writeCheckpoint(storage,value) {
  const checked=validateCheckpoint(value);if(!checked)return false;
  try{storage.setItem(SAVE_KEY,JSON.stringify(checked));return true;}catch{return false;}
}
export function clearCheckpoint(storage) {try{storage.removeItem(SAVE_KEY);return true;}catch{return false;}}
