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
 assert p.locator('#gameGrid .game-card').count()==61;assert p.locator('#gameCount').inner_text()=='61';assert p.locator('#dailyPickGrid .game-card').count()==1
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==72;profile=p.locator('#profileStats').inner_text().lower();assert 'primary genres tried' in profile and 'catalog explored' in profile and 'catalog cleared' in profile;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Night Shift');txt=p.locator('#gameGrid').inner_text();assert 'Blackglass Watch' in txt and ('Deepwater Signal' in txt or 'Quiet Protocol' in txt)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 # Continue Playing should surface a played but uncleared release.
 seed={'wwg:plays':json.dumps({'blackglass-watch':2,'mirrormesh-relay':1}),'wwg:recent':json.dumps(['blackglass-watch','mirrormesh-relay']),'wwg:events':json.dumps({'mirrormesh-relay:mesh-complete':1})}
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(130);assert not p.locator('#continueSection').is_hidden();assert 'Blackglass Watch' in p.locator('#continueGrid').inner_text();p.close()
 # Fresh Genre: Horror has been seen, Salvage has not.
 seed={'wwg:plays':json.dumps({'blackglass-watch':1})}
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(100);p.locator('#statusFilter').select_option('Fresh Genre');txt=p.locator('#gameGrid').inner_text();assert 'Blackglass Watch' not in txt and 'Tetherline Salvage' in txt;p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('blackglass-watch',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(100);before=q.evaluate('feed');q.keyboard.press('KeyL');after=q.evaluate('feed');assert after!=before
 q.evaluate("()=>{for(let i=0;i<SHIFTS.length;i++){const a=active();feed=a.room;type=TYPES.indexOf(a.type);report()}}")
 q.wait_for_timeout(80);ev=q.evaluate('window.__events');hit=[x for x in ev if x.get('event')=='watch-complete'];assert hit and isinstance(hit[-1].get('score'),(int,float)),ev;checks['blackglass']=hit[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('tetherline-salvage',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(100);before=q.evaluate('ship.x');q.keyboard.down('KeyL');q.wait_for_timeout(180);q.keyboard.up('KeyL');after=q.evaluate('ship.x');assert after>before,(before,after)
 q.evaluate("()=>{for(const p of pods){if(p.done)continue;ship.x=p.x;ship.y=p.y;hook();tether.x=bay.x;tether.y=bay.y;tryRecover()}}")
 q.wait_for_timeout(80);ev=q.evaluate('window.__events');hit=[x for x in ev if x.get('event')=='haul-complete'];assert hit and isinstance(hit[-1].get('score'),(int,float)),ev;checks['tetherline']=hit[-1]['score'];assert not ee,ee;q.close()
 print(json.dumps({'cards':61,'achievements':72,'mobile':d,'checks':checks,'continuePlaying':True,'freshGenre':True,'nightShift':True},indent=2));b.close()
