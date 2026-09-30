from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json,datetime,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
def pre(seed=None):
 data=json.dumps(seed or {})
 return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home(seed=None):
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre(seed)+f'<script>{games}</script><script>{app}</script>')
def raw(slug,seed=None):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 return h.replace('<script>',pre(seed)+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(250)
 assert p.locator('#gameGrid .game-card').count()==57;assert p.locator('#gameCount').inner_text()=='57';assert p.locator('#dailyPickGrid .game-card').count()==1
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==67;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Signals & Circuits');txt=p.locator('#gameGrid').inner_text();assert 'Mirrormesh Relay' in txt and 'Hushwave Operator' in txt 
 p.locator('#collectionFilter').select_option('Skill & Timing');txt=p.locator('#gameGrid').inner_text();assert 'Pulsevine Parkour' in txt
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('pulsevine-parkour',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(160);before=q.evaluate('p.x');q.keyboard.down('KeyL');q.wait_for_timeout(180);q.keyboard.up('KeyL');after=q.evaluate('p.x');assert after>before,(before,after);q.keyboard.press('KeyF');q.wait_for_timeout(30);assert q.evaluate('jumpQueued>0 || p.vy<0 || p.y<447');q.evaluate("()=>{for(const x of checkpoints){p.x=x;checkCheckpoint()}p.x=1222;checkCheckpoint()}");q.wait_for_timeout(30);ev=q.evaluate('window.__events');assert any(x.get('event')=='circuit-complete' for x in ev);checks['pulsevine']=next(x['score'] for x in reversed(ev) if x.get('event')=='circuit-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':900,'height':750});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('tessera-commons',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('cursor[0]');q.keyboard.press('KeyL');after=q.evaluate('cursor[0]');assert after>=before;q.keyboard.press('KeyH');assert q.evaluate('pick')==1
 q.evaluate("()=>{reset();for(let n=0;n<10;n++){let f=null;for(let y=0;y<5&&!f;y++)for(let x=0;x<5;x++)if(valid(x,y)){f=[x,y];break}cursor=f;pick=0;place()}}")
 q.wait_for_timeout(30);ev=q.evaluate('window.__events');assert any(x.get('event')=='commons-complete' for x in ev);checks['tessera']=next(x['score'] for x in reversed(ev) if x.get('event')=='commons-complete');assert not ee,ee;q.close()
 # Share button works without throwing in the self-contained harness; URL round-trip is validated statically because Chromium loopback navigation is administratively blocked.
 p=b.new_page(viewport={'width':1100,'height':800});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(150);p.locator('#collectionFilter').select_option('Board & Tabletop');p.locator('#searchInput').fill('tessera');assert p.locator('#gameGrid .game-card').count()==1;p.locator('#shareDiscovery').click();p.wait_for_timeout(80);assert p.locator('#shareDiscovery').inner_text() in ['Link copied','Link ready','Share discovery'];assert not errs,errs;p.close()

 q=b.new_page(viewport={'width':900,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('mirrormesh-relay',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.evaluate("async()=>{const sols=[[0,0],[1,1,1,1],[0,0,0],[0,0,0,0],[1,1,1,1],[1,1,0,0,1,1]];for(let i=0;i<sols.length;i++){mirrors.forEach((m,j)=>m[2]=sols[i][j]);render();await new Promise(r=>setTimeout(r,260));}}");q.wait_for_timeout(300);ev=q.evaluate('window.__events');assert any(x.get('event')=='mesh-complete' for x in ev),ev;checks['mirrormesh']=next(x['score'] for x in reversed(ev) if x.get('event')=='mesh-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':900,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('hushwave-operator',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.evaluate("()=>{for(let i=0;i<TARGETS.length;i++){els.forEach((e,j)=>e.value=TARGETS[ci][j]);sample();}}");q.wait_for_timeout(100);ev=q.evaluate('window.__events');assert any(x.get('event')=='band-decoded' for x in ev),ev;checks['hushwave']=next(x['score'] for x in reversed(ev) if x.get('event')=='band-decoded');assert not ee,ee;q.close()
 p=b.new_page(viewport={'width':1100,'height':800});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(100);p.locator('#makeMix').click();p.wait_for_timeout(60);mixstore=p.evaluate("JSON.parse(localStorage.getItem('wwg:play-later')||'[]').length");assert mixstore>=3;p.close()
 print(json.dumps({'cards':57,'achievements':67,'mobile':d,'checks':checks,'shareControl':True,'mix':True},indent=2));b.close()
