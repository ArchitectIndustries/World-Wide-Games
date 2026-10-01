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
 assert p.locator('#gameGrid .game-card').count()==62;assert p.locator('#gameCount').inner_text()=='62';assert p.locator('#dailyPickGrid .game-card').count()==1
 assert not p.locator('#updatedSection').is_hidden();assert 'Bastion Bloom' in p.locator('#updatedGrid').inner_text()
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==75;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Craft & Create');txt=p.locator('#gameGrid').inner_text();assert 'Prismweave Atelier' in txt and ('Archive Alchemist' in txt or 'Hearthline Kitchen' in txt)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('prismweave-atelier',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('band');q.keyboard.press('KeyL');after=q.evaluate('band');assert after!=before
 for _ in range(6):
  q.evaluate("()=>{const L=LEVELS[li];for(const op of [...L.scramble].reverse()){axis=op[0];band=op[1];shift(-op[2])}}")
  q.wait_for_timeout(540)
 ev=q.evaluate('window.__events');hit=[x for x in ev if x.get('event')=='atelier-complete'];assert hit and isinstance(hit[-1].get('score'),(int,float)),ev;checks['prismweave']=hit[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('bastion-bloom',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('selectedNode');q.keyboard.press('KeyL');after=q.evaluate('selectedNode');assert after!=before;q.keyboard.press('KeyK');assert q.evaluate('selectedType')!='bloom';q.keyboard.press('KeyF');assert q.evaluate('towers.length')==1
 q.evaluate("()=>{wave=10;waveActive=true;waveQueue=[];enemies=[];resolveWave()}");q.wait_for_timeout(80);ev=q.evaluate('window.__events');hit=[x for x in ev if x.get('event')=='campaign-complete'];assert hit and isinstance(hit[-1].get('score'),(int,float)),ev;checks['bastion']=hit[-1]['score'];assert not ee,ee;q.close()
 print(json.dumps({'cards':62,'achievements':75,'mobile':d,'updatedSpotlight':True,'craftCreate':True,'checks':checks},indent=2));b.close()
