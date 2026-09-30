from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve()
PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def raw(slug):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 cases={
  'windward-cargo':"delivery=4;score=2600;finish();",
  'cipher-court':"idx=cases.length-1;score=2500;selected=cases[idx].culprit;document.querySelector('#accuse').click();",
  'moonwake-angler':"catches=5;score=3000;finish();",
  'deepwater-signal':"relays.forEach(r=>r.on=true);sub.relays=5;sub.x=gate.x;sub.y=gate.y;scan();",
  'emberdeck-pilgrim':"state.node=2;state.enemy.hp=0;victory();",
  'command-bloom':"idx=levels.length-1;cores.forEach(c=>c.got=true);bot.x=levels[idx].g[0];bot.y=levels[idx].g[1];finish();",
  'railspire-dispatch':"delivered=8;finish('Shift cleared.');",
  'glyphsmith':"score=1750;finish();",
  'solar-loom':"worlds=['garden','rocky','garden','ice','rocky','ice'];epoch=9;finish('The loom holds.');",
  'atlas-below':"p.ore=6;p.crystal=2;craft();p.x=exit.x;p.y=exit.y;finish(true);",
  'aetherstead-colony':"pop=35;food=50;power=50;morale=80;turn=16;advance();",
  'prism-duel':"s1=4;s2=0;score(1);",
  'starweaver-drift':"beacons.forEach(b=>b.scanned=true);ship.x=relay.x;ship.y=relay.y;step(performance.now()+1000);",
  'pulse-archive':"start=performance.now()-100000;loop(performance.now());",
  'skyhook-sprint':"p.x=4050;step(performance.now()+1000);",
  'vector-league':"ys=5;loop(performance.now()+1000);",
  'crownline-tactics':"round=13;endCheck();",
  'echo-bazaar':"for(let i=0;i<12;i++)next();",
  'lumen-relay':"idx=levels.length-1;totalMoves=8;moves=4;won=true;nextStage();",
  'neon-stack':"score=4321;reported=false;report();",
  'rune-depths':"player.count=5;player.x=exit.x-1;player.y=exit.y;grid[exit.y][exit.x]=0;move(1,0);",
  'gravity-foundry':"cores.forEach(c=>c.got=true);probe.x=levels[li].goal[0];probe.y=levels[li].goal[1];status='fly';step(performance.now()+16);",
  'hexbound-tactics':"ecore=0;pcore=12;turn=5;finish();",
  'rift-relay':"score=8;time=42;shield=4;step(performance.now()+16);",
  'bastion-bloom':"lives=0;over=false;reported=false;enemies=[{p:path.length-1,hp:1,max:1,speed:0,slow:0,r:8}];loop(performance.now()+16);"
 }
 out={}
 for slug,code in cases.items():
  p=b.new_page(viewport={'width':960,'height':540});errs=[];p.on('pageerror',lambda e,errs=errs:errs.append(str(e)));p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(60);p.evaluate(code);p.wait_for_timeout(70);ev=p.evaluate('window.__events');num=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))];assert num,(slug,ev,errs);out[slug]=num[-1]['event'];assert not errs,(slug,errs);p.close()
 print({'scoredGames':len(out),'events':out});b.close()
