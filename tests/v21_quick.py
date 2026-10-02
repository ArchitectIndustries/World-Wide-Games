from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
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
 assert p.locator('#gameGrid .game-card').count()==59;assert p.locator('#gameCount').inner_text()=='59';assert p.locator('#dailyPickGrid .game-card').count()==1
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==69;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Air & Altitude');txt=p.locator('#gameGrid').inner_text();assert 'Kiteglass Drift' in txt and ('Stoneveil Ascent' in txt or 'Windward Cargo' in txt)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 # In Progress must isolate played-but-not-cleared content when combined with search.
 seed={'wwg:plays':json.dumps({'runelight-locksmith':2,'mirrormesh-relay':1}),'wwg:events':json.dumps({'mirrormesh-relay:mesh-complete':1})}
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(100);p.locator('#searchInput').fill('runelight');p.locator('#statusFilter').select_option('In Progress');assert p.locator('#gameGrid .game-card').count()==1;assert 'Runelight Locksmith' in p.locator('#gameGrid').inner_text();p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('kiteglass-drift',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(120);before=q.evaluate('y');q.keyboard.down('KeyI');q.wait_for_timeout(220);q.keyboard.up('KeyI');after=q.evaluate('y');assert after<before,(before,after)
 q.evaluate("()=>{for(const g of GATES){y=g.y;gateCheck(g.x-1,g.x+1)};wx=GATES[GATES.length-1].x+400;finish()}");q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert any(x.get('event')=='course-complete' for x in ev),ev;checks['kiteglass']=next(x['score'] for x in reversed(ev) if x.get('event')=='course-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':900,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('runelight-locksmith',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(100);assert q.evaluate('selected')==0;q.keyboard.press('KeyL');assert q.evaluate('selected')==1;before=q.evaluate('misses+pins.filter(Boolean).length');q.keyboard.press('KeyF');q.wait_for_timeout(30);after=q.evaluate('misses+pins.filter(Boolean).length');assert after>before
 q.evaluate("()=>{li=LEVELS.length-1;load();pins=Array(LEVELS[li].pins).fill(true);total=4200;completeLock()}");q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert any(x.get('event')=='vault-opened' for x in ev),ev;checks['runelight']=next(x['score'] for x in reversed(ev) if x.get('event')=='vault-opened');assert not ee,ee;q.close()
 print(json.dumps({'cards':59,'achievements':69,'mobile':d,'checks':checks,'inProgressFilter':True,'airCollection':True},indent=2));b.close()
