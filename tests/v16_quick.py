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
 assert p.locator('#gameGrid .game-card').count()==49;assert p.locator('#gameCount').inner_text()=='49'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==53;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Motion & Momentum');txt=p.locator('#gameGrid').inner_text();assert 'Riftwake Regatta' in txt and 'Circuit Rush' in txt
 p.locator('#collectionFilter').select_option('All');p.locator('[data-later="riftwake-regatta"]').first.click();p.locator('#statusFilter').select_option('Play Later');txt=p.locator('#gameGrid').inner_text();assert 'Riftwake Regatta' in txt
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(70);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs
 checks={}
 seed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('riftwake-regatta',seed),wait_until='domcontentloaded');q.wait_for_timeout(80);a0=q.evaluate('boat.a');q.keyboard.down('KeyL');q.wait_for_timeout(160);q.keyboard.up('KeyL');a1=q.evaluate('boat.a');assert a1>a0,(a0,a1);q.keyboard.down('KeyI');q.wait_for_timeout(150);q.keyboard.up('KeyI');assert q.evaluate('trim')>.55;q.evaluate('start=performance.now()-50000;penalty=2;finish()');ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='regatta-complete' and ev[-1]['meta']['direction']=='low';checks['regatta']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('archive-alchemist'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.evaluate('while(!done){selected=[...pairs[round]];brew()}');ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='archive-complete' and ev[-1]['score']>0;checks['alchemist']=ev[-1]['score'];assert not ee,ee;q.close()
 print(json.dumps({'cards':49,'achievements':53,'mobile':d,'playLater':True,'checks':checks},indent=2));b.close()
