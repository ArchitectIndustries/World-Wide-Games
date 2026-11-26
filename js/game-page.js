(() => {
  const $=s=>document.querySelector(s),games=window.WWG_GAMES||[],id=new URLSearchParams(location.search).get('id'),game=games.find(g=>g.id===id)||games[0];
  if(!game){location.href='index.html';return}
  // Platform profile/score data must not prevent a game from launching when
  // a browser policy or quota denies Web Storage. The memory overlay is scoped
  // to this page; it is never represented as a durable save or online score.
  const volatileRecords=new Map(), malformedRecords=new Set();
  let storageDenied=false;
  function storageUnavailable(){
    storageDenied=true;
    refreshStorageNotice();
  }
  function refreshStorageNotice(){
    const notice=$('#storageNotice');
    if(notice){
      notice.hidden=false;
      notice.textContent=storageDenied?'Browser storage is unavailable. Some WorldWideGames profile changes on this page are session-only and may disappear on reload. Individual games may have separate save limitations.':'Some saved WorldWideGames profile records have an unexpected format. Affected records are session-only on this page; the original stored values are preserved. Individual games may have separate save limitations.';
    }
  }
  const storage={
    getItem(key){
      if(volatileRecords.has(key))return volatileRecords.get(key);
      try{return window.localStorage.getItem(key)}catch{storageUnavailable();return null}
    },
    setItem(key,value){
      const text=String(value);
      if(malformedRecords.has(key)){volatileRecords.set(key,text);return false}
      try{window.localStorage.setItem(key,text);volatileRecords.delete(key);return true}
      catch{volatileRecords.set(key,text);storageUnavailable();return false}
    },
    removeItem(key){
      try{window.localStorage.removeItem(key);volatileRecords.delete(key);return true}
      catch{volatileRecords.delete(key);storageUnavailable();return false}
    }
  };
  // JSON syntax is not a profile schema. A damaged record is isolated for this
  // session, never overwritten by automatic play counters or score updates.
  const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const finite=v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=Number.MAX_SAFE_INTEGER;
  const safeKey=k=>!['__proto__','constructor','prototype'].includes(k);
  const numberMap=v=>record(v)&&Object.entries(v).every(([k,n])=>safeKey(k)&&finite(n));
  const stringList=v=>Array.isArray(v)&&v.every(x=>typeof x==='string');
  const fields=(v,keys)=>record(v)&&keys.every(k=>!Object.hasOwn(v,k)||finite(v[k]));
  function validRecord(k,v,f){
    if(k==='wwg:prefs')return record(v)&&['reducedMotion','muted','highContrast'].every(x=>!Object.hasOwn(v,x)||typeof v[x]==='boolean')&&['volume','textScale'].every(x=>!Object.hasOwn(v,x)||finite(v[x]));
    if(k==='wwg:keymap')return record(v);
    if(k==='wwg:run-history')return Array.isArray(v)&&v.every(x=>record(x)&&typeof x.id==='string'&&finite(x.score));
    if(Array.isArray(f))return stringList(v);
    if(k==='wwg:sessions')return record(v)&&Object.entries(v).every(([id,x])=>safeKey(id)&&fields(x,['count','last','longest']));
    if(k==='wwg:daily')return record(v)&&Object.entries(v).every(([day,x])=>safeKey(day)&&fields(x,['plays','brain','milestones','ratings'])&&(!Object.hasOwn(x,'unique')||stringList(x.unique))&&(!Object.hasOwn(x,'eventKeys')||stringList(x.eventKeys)));
    if(k==='wwg:daily-game-playtime')return record(v)&&Object.entries(v).every(([day,x])=>safeKey(day)&&numberMap(x));
    if(k==='wwg:score-runs')return record(v)&&Object.entries(v).every(([id,x])=>safeKey(id)&&record(x)&&finite(x.score));
    return numberMap(v);
  }
  const load=(k,f)=>{
    const raw=storage.getItem(k);if(raw===null)return f;
    try{const v=JSON.parse(raw);if(validRecord(k,v,f))return v}catch{}
    malformedRecords.add(k);refreshStorageNotice();return f;
  };
  const prefs=load('wwg:prefs',{reducedMotion:false,muted:false,volume:.7,highContrast:false,textScale:1});document.documentElement.classList.toggle('reduced-motion',!!prefs.reducedMotion);document.documentElement.classList.toggle('high-contrast',!!prefs.highContrast);document.documentElement.style.setProperty('--wwg-text-scale',Math.max(.9,Math.min(1.25,Number(prefs.textScale)||1)));
  // Imported browser-local keymaps are not trusted markup or executable key codes.
  // Limit restored mappings to the exact choices exposed by the player profile.
  const KEY_DEFAULTS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',primary:'Space',secondary:'KeyE'};
  const KEY_LABELS={KeyW:'W',KeyA:'A',KeyS:'S',KeyD:'D',KeyI:'I',KeyJ:'J',KeyK:'K',KeyL:'L',KeyQ:'Q',KeyE:'E',KeyF:'F',KeyC:'C',KeyX:'X',KeyZ:'Z',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Space:'Space',Enter:'Enter',ShiftLeft:'Left Shift'};
  const supportedKeys=new Set(Object.keys(KEY_LABELS)),storedKeys=load('wwg:keymap',{}),activeKeys={...KEY_DEFAULTS};
  if(storedKeys&&typeof storedKeys==='object'&&!Array.isArray(storedKeys)){
    for(const action of Object.keys(KEY_DEFAULTS)){
      const key=storedKeys[action];
      if(typeof key==='string'&&supportedKeys.has(key))activeKeys[action]=key;
    }
  }
  const keyLabel=code=>KEY_LABELS[code]||code,mapped=action=>keyLabel(activeKeys[action]);
  const controlDetail=c=>{let out=String(c);out=out.replace(/Remappable Left \/ Right/gi,`Left / Right (← / → or A / D always; ${mapped('left')} / ${mapped('right')} custom mapping)`);out=out.replace(/Remappable Up \/ Down/gi,`Up / Down (↑ / ↓ or W / S always; ${mapped('up')} / ${mapped('down')} custom mapping)`);out=out.replace(/Remappable directional controls/gi,`Universal directional controls (Arrow keys or W/A/S/D always; custom map Up ${mapped('up')}, Down ${mapped('down')}, Left ${mapped('left')}, Right ${mapped('right')})`);out=out.replace(/Remappable directions/gi,`Universal directions (Arrow keys or W/A/S/D always; custom map Up ${mapped('up')}, Down ${mapped('down')}, Left ${mapped('left')}, Right ${mapped('right')})`);out=out.replace(/\bPrimary\b(?!\s*\/\s*Space)/g,`Primary (${mapped('primary')} currently; Space default)`);out=out.replace(/\bSecondary\b(?!\s*\/\s*E)/g,`Secondary (${mapped('secondary')} currently; E default)`);return out},objectiveFor=g=>{if(g.objective)return String(g.objective);const goal=/\b(complete|defeat|recover|reach|finish|survive|build|collect|route|find|capture|archive|tow|restore|keep|score|win|clear|protect|deliver|align|manage|race|unlock|seal|sweep|explore|master|solve|avoid|return|outscore|beat|last|connect|grow|place|close|discover|catch|hack|guide|balance|land|repair|escape|defend|match|form|earn)\b/i,sentences=String(g.description||'').match(/[^.!?]+[.!?]+/g)||[],desc=sentences.find(s=>goal.test(s));if(desc)return desc.trim();const controls=Array.isArray(g.controls)?g.controls:[],line=controls.find(c=>goal.test(c)&&!/supported|controls on mobile|gamepad|backspace|restart|cycle|selected|tap or click/i.test(c));if(line)return /[.!?]$/.test(line)?line:line+'.';if(sentences.length)return sentences[0].trim();return 'Complete the core challenge and finish the run.'};document.title=`${game.title} — WorldWideGames`;$('#gameGenre').textContent=game.genres.join(' · ');const controlText=(game.controls||[]).join(' ').toLowerCase(),caps=[];if(/wasd|arrow|keyboard|digit|space|key/.test(controlText))caps.push('Keyboard');if(/touch|tap|mobile|pointer|click/.test(controlText))caps.push('Touch');if(/gamepad/.test(controlText))caps.push('Gamepad');if(game.remappable)caps.push('Remappable');const modes=Array.isArray(game.modes)&&game.modes.length?game.modes:(game.genres.some(x=>['Multiplayer','Co-op'].includes(x))?['Local Multiplayer']:['Solo']);caps.push(...modes);if($('#inputBadges'))$('#inputBadges').innerHTML=caps.map(x=>`<span>${x}</span>`).join('');if($('#remapNote'))$('#remapNote').hidden=!game.remappable;const keyProfile=$('#keyboardProfile');if(keyProfile){keyProfile.hidden=!game.remappable;if(game.remappable){
    const heading=document.createElement('strong');heading.textContent='Current keyboard map';
    const labels={up:'Up',down:'Down',left:'Left',right:'Right',primary:'Primary',secondary:'Secondary'};
    const rows=Object.keys(KEY_DEFAULTS).map(action=>{
      const row=document.createElement('span'),value=document.createElement('b');
      value.textContent=mapped(action);
      row.append(document.createTextNode(labels[action]+' '),value);
      return row;
    });
    const note=document.createElement('small'),lead=document.createElement('b');
    lead.textContent='Universal movement:';
    note.append(lead,document.createTextNode(' Arrow keys and W / A / S / D always work. Your custom remap is an additional movement option. Action buttons keep their selected mapping.'));
    keyProfile.replaceChildren(heading,...rows,note);
  }}$('#gameTitle').textContent=game.title;$('#gameDescription').textContent=game.description;if($('#gameObjective'))$('#gameObjective').innerHTML=`<strong>How to win:</strong> ${objectiveFor(game)}`;$('#gameCover').src=game.cover;$('#gameCover').alt=`${game.title} cover art`;const controlList=$('#controlsList');controlList.replaceChildren(...game.controls.map(c=>{const item=document.createElement('li');item.textContent=controlDetail(c);return item}));$('#gameDate').textContent=`Added ${new Date(game.added+'T12:00:00').toLocaleDateString()}${game.updated&&game.version&&game.version!=='1.0'?` · Updated ${new Date(game.updated+'T12:00:00').toLocaleDateString()}`:''}`;$('#gameBadge').textContent=(game.featured?'Featured':'Instant play')+(game.version?` · v${game.version}`:'');$('#footerGame').textContent=game.title;
  const frame=$('#gameFrame'),outerParams=new URLSearchParams(location.search);if(game.id==='cyber-wars'&&!outerParams.get('world')){const a=new Uint32Array(2);crypto.getRandomValues(a);outerParams.set('world',((a[0]^a[1])>>>0).toString(36).toUpperCase().slice(0,8));try{history.replaceState(null,'','?'+outerParams.toString())}catch{}}const params=new URLSearchParams();for(const key of ['world','session','seed'])if(outerParams.get(key))params.set(key,outerParams.get(key));if(prefs.muted)params.set('muted','1');if(prefs.reducedMotion)params.set('motion','reduce');if(prefs.highContrast)params.set('contrast','high');params.set('volume',String(Number.isFinite(Number(prefs.volume))?Math.max(0,Math.min(1,Number(prefs.volume))):.7));frame.src=game.path+(params.toString()?'?'+params.toString():'');
  // Count visible page time only. Accumulate fractional intervals across flushes
  // so switching tabs cannot add background time or repeatedly discard fractions.
  function createPlayClock(readNow, initiallyActive) {
    let mark=readNow(),active=!!initiallyActive,elapsedMs=0,committedSeconds=0;
    function account(){const now=readNow();if(active)elapsedMs+=Math.max(0,now-mark);mark=now;}
    return {
      flush(){account();const totalSeconds=Math.floor(elapsedMs/1000),seconds=totalSeconds-committedSeconds;committedSeconds=totalSeconds;return {seconds,totalSeconds};},
      setActive(next){account();active=!!next;}
    };
  }
  const plays=load('wwg:plays',{});plays[game.id]=(plays[game.id]||0)+1;storage.setItem('wwg:plays',JSON.stringify(plays));
  const readPlayTime=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const playClock=createPlayClock(readPlayTime,document.visibilityState!=='hidden');
  const sessionStats=load('wwg:sessions',{});sessionStats[game.id]=sessionStats[game.id]||{count:0,longest:0,last:0};sessionStats[game.id].count=Number(sessionStats[game.id].count||0)+1;storage.setItem('wwg:sessions',JSON.stringify(sessionStats));
  function flushPlaytime(){
    const {seconds:secs,totalSeconds}=playClock.flush();if(!secs)return;
    const pt=load('wwg:playtime',{});pt[game.id]=Number(pt[game.id]||0)+secs;storage.setItem('wwg:playtime',JSON.stringify(pt));
    const dp=load('wwg:daily-playtime',{}),dk=new Date().toLocaleDateString('en-CA');dp[dk]=Number(dp[dk]||0)+secs;storage.setItem('wwg:daily-playtime',JSON.stringify(dp));
    const dgp=load('wwg:daily-game-playtime',{});dgp[dk]=dgp[dk]&&typeof dgp[dk]==='object'?dgp[dk]:{};dgp[dk][game.id]=Number(dgp[dk][game.id]||0)+secs;storage.setItem('wwg:daily-game-playtime',JSON.stringify(dgp));
    const ss=load('wwg:sessions',{});ss[game.id]=ss[game.id]||{count:1,longest:0,last:0};ss[game.id].last=totalSeconds;ss[game.id].longest=Math.max(Number(ss[game.id].longest||0),totalSeconds);storage.setItem('wwg:sessions',JSON.stringify(ss));
  }
  addEventListener('pagehide',()=>{flushPlaytime();playClock.setActive(false)});
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){flushPlaytime();playClock.setActive(false)}else playClock.setActive(true)});
  addEventListener('pageshow',()=>playClock.setActive(document.visibilityState!=='hidden'));
  let recent=load('wwg:recent',[]);recent=[game.id,...recent.filter(x=>x!==game.id)].slice(0,12);storage.setItem('wwg:recent',JSON.stringify(recent));
  const today=new Date().toLocaleDateString('en-CA'),daily=load('wwg:daily',{}),day=daily[today]||{plays:0,unique:[],brain:0,milestones:0,ratings:0,eventKeys:[]};day.plays=(day.plays||0)+1;day.unique=Array.isArray(day.unique)?day.unique:[];if(!day.unique.includes(game.id))day.unique.push(game.id);if(game.genres.some(g=>['Puzzle','Strategy'].includes(g)))day.brain=1;daily[today]=day;storage.setItem('wwg:daily',JSON.stringify(daily));
  let favorites=load('wwg:favorites',[]),favBtn=$('#favoriteButton');function syncFav(){const active=favorites.includes(game.id);favBtn.textContent=active?'♥ Favorited':'♡ Favorite'}favBtn.addEventListener('click',()=>{favorites=favorites.includes(game.id)?favorites.filter(x=>x!==game.id):[...favorites,game.id];storage.setItem('wwg:favorites',JSON.stringify(favorites));syncFav()});syncFav();
  let playLater=load('wwg:play-later',[]),laterBtn=$('#laterButton');function syncLater(){if(!laterBtn)return;const active=playLater.includes(game.id);laterBtn.textContent=active?'✓ Play later':'＋ Play later'}if(laterBtn)laterBtn.addEventListener('click',()=>{playLater=playLater.includes(game.id)?playLater.filter(x=>x!==game.id):[...playLater,game.id];storage.setItem('wwg:play-later',JSON.stringify(playLater));syncLater()});syncLater();
  const restartFrame=$('#restartFrameButton');if(restartFrame)restartFrame.addEventListener('click',()=>{const current=frame.src;frame.src='about:blank';setTimeout(()=>{frame.src=current},0)});
  if(window.WWG_PLAYER_VIEW)window.WWG_PLAYER_VIEW.mount({frame,game,storage});
  else $('#fullscreenButton').addEventListener('click',()=>{const wrap=$('#gameFrameWrap');if(wrap.requestFullscreen)Promise.resolve(wrap.requestFullscreen()).catch(()=>{})});
  const share=$('#shareButton');if(share)share.addEventListener('click',async()=>{const data={title:game.title,text:game.tagline,url:location.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(location.href);share.textContent='Link copied';setTimeout(()=>share.textContent='Share',1200)}}catch{}});
  let scores=load('wwg:scores',{});const scoreMeta=game.scoreMeta||{unit:'pts',label:'Local score',direction:'high'},lowerIsBetter=scoreMeta.direction==='low';
  // Do not round competitive values before comparing or persisting them.
  // Accepted numbers are finite and within JS's safe integer magnitude.
  // Rendering up to nine decimal places covers millisecond timing without
  // exposing floating-point subtraction noise as spurious extra digits.
  const validScore=n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=Number.MAX_SAFE_INTEGER;
  const scoreFormatter=new Intl.NumberFormat(undefined,{maximumFractionDigits:9});
  const displayScore=n=>scoreFormatter.format(n);
  function better(a,b){const previous=Number(b);return validScore(a)&&(b==null||!validScore(previous)||(lowerIsBetter?a<previous:a>previous))}
  function syncBest(){const v=Number(scores[game.id]),hint=lowerIsBetter?' • lower is better':'';$('#localBest').textContent=validScore(v)?`Best ${scoreMeta.label||'local score'}: ${displayScore(v)} ${scoreMeta.unit||'pts'}${hint}`:'No score submitted yet.'}function renderRunSummary(){
    const el=$('#runSummary');if(!el)return;
    // Run-history records originate in browser-local storage. Never parse their
    // event names (or score-unit labels) as HTML, even after a saved-data import.
    const stored=load('wwg:run-history',[]);
    const hist=(Array.isArray(stored)?stored:[]).filter(r=>r&&r.id===game.id&&validScore(r.score)).slice(0,5);
    el.replaceChildren();
    if(!hist.length){const p=document.createElement('p');p.textContent='No scored runs yet. Finish a supported run to start a local performance history.';el.append(p);return}
    const vals=hist.map(r=>r.score),avg=vals.reduce((a,b)=>a+b/vals.length,0),best=lowerIsBetter?Math.min(...vals):Math.max(...vals);
    const rawTrend=vals.length>1?vals[0]-vals[1]:0,trend=lowerIsBetter?-rawTrend:rawTrend;
    const head=document.createElement('div');head.className='run-summary-head';
    for(const [value,label] of [[String(hist.length),'recent'],[displayScore(avg),'avg'],[displayScore(best),'best'],[(trend>0?'+':'')+displayScore(trend),'trend']]){
      const cell=document.createElement('span'),strong=document.createElement('b');strong.textContent=value;cell.append(strong,document.createTextNode(' '+label));head.append(cell);
    }
    const list=document.createElement('div');list.className='mini-run-list';
    for(const run of hist){
      const row=document.createElement('span'),number=document.createElement('b'),detail=document.createElement('small');
      number.textContent=displayScore(run.score)+' '+String(scoreMeta.unit||'pts');
      const safeEvent=typeof run.event==='string'&&run.event.length?run.event:'run';
      const safeDuration=typeof run.duration==='number'&&Number.isFinite(run.duration)&&run.duration>=0&&run.duration<=86400?(' · '+run.duration+'s'):'';
      detail.textContent=safeEvent.replaceAll('-',' ')+safeDuration;
      row.append(number,detail);list.append(row);
    }
    el.append(head,list);
  }
  syncBest();renderRunSummary();
  let ratings=load('wwg:ratings',{});function renderRating(){const value=Number(ratings[game.id]||0);$('#ratingControl').innerHTML=[1,2,3,4,5].map(n=>`<button type="button" class="rating-star ${n<=value?'active':''}" data-rate="${n}" aria-label="${n} star${n===1?'':'s'}">★</button>`).join('');$('#ratingNote').textContent=value?`You rated this ${value}/5. Stored only in this browser.`:'Stored only in this browser.';document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const was=!!ratings[game.id];ratings[game.id]=Number(b.dataset.rate);storage.setItem('wwg:ratings',JSON.stringify(ratings));if(!was){const ds=load('wwg:daily',{}),d=ds[today]||day;d.ratings=(d.ratings||0)+1;ds[today]=d;storage.setItem('wwg:daily',JSON.stringify(ds))}renderRating()})}renderRating();
  addEventListener('message',e=>{const eventGame=e.data&&(e.data.game||e.data.gameId);if(e.source!==frame.contentWindow||(e.origin&&e.origin!==location.origin&&!(location.protocol==='file:'&&e.origin==='null'))||!e.data||typeof e.data!=='object'||e.data.type!=='wwg:game-event'||eventGame!==game.id)return;const events=load('wwg:events',{}),key=`${game.id}:${e.data.event||'milestone'}`;events[key]=(events[key]||0)+1;storage.setItem('wwg:events',JSON.stringify(events));const rules=window.WWG_EVENT_RULES,isMilestone=!!rules?.isMilestoneKey?.(key);if(isMilestone){const ds=load('wwg:daily',{}),d=ds[today]||day;d.eventKeys=Array.isArray(d.eventKeys)?d.eventKeys:[];if(!d.eventKeys.includes(key)){d.eventKeys.push(key);d.milestones=new Set(d.eventKeys.filter(k=>rules.isMilestoneKey(k))).size;ds[today]=d;storage.setItem('wwg:daily',JSON.stringify(ds))}}// Only explicitly numeric, finite, safely bounded scores enter local records;
  // never coerce strings/booleans or destroy race-time precision by rounding.
  const n=e.data.score;if(validScore(n)){const run={id:game.id,score:n,event:e.data.event||'run',duration:Number.isFinite(Number(e.data.duration))?Number(e.data.duration):null,at:new Date().toISOString(),meta:{...(game.scoreMeta||{}),...(e.data.meta||{})}};const runs=load('wwg:score-runs',{});runs[game.id]={score:run.score,event:run.event,duration:run.duration,at:run.at,meta:run.meta};storage.setItem('wwg:score-runs',JSON.stringify(runs));const hist=load('wwg:run-history',[]);hist.unshift(run);storage.setItem('wwg:run-history',JSON.stringify(hist.slice(0,20)));if(better(n,scores[game.id])){scores[game.id]=n;storage.setItem('wwg:scores',JSON.stringify(scores));syncBest()}renderRunSummary()}});
})();
