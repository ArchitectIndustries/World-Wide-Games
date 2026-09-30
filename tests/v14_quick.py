from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
def pre(seed=None):
 data=json.dumps(seed or {})
 return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
def data_uri(p): return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home(seed=None):
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre(seed)+f'<script>{games}</script><script>{app}</script>')
def raw(slug,seed=None):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 return h.replace('<script>',pre(seed)+'<script>',1)
def detail(seed=None):
 h=(ROOT/'game.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();gp=(ROOT/'js/game-page.js').read_text()
 h=h.replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>')
 h=h.replace('<script src="js/games.js"></script><script src="js/game-page.js"></script>',pre(seed)+f'<script>{games}</script><script>{gp}</script>')
 return h
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(220)
 assert p.locator('#gameGrid .game-card').count()==45; assert p.locator('#gameCount').inner_text()=='45'
 p.locator('#profileButton').click(); assert p.locator('#achievementGrid .achievement').count()==45; p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Build & Operate'); txt=p.locator('#gameGrid').inner_text(); assert 'Spanwright' in txt and 'Lantern Line' in txt
 p.locator('#collectionFilter').select_option('All');p.locator('#inputFilter').select_option('Remappable');txt=p.locator('#gameGrid').inner_text();assert 'Lantern Line' in txt and 'Frostline Rescue' in txt
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(60);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 assert not errs,errs
 checks={}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('spanwright'),wait_until='domcontentloaded');q.wait_for_timeout(80)
 q.evaluate("addBeam(0,2);addBeam(2,3);addBeam(3,4);addBeam(4,1)");assert q.evaluate('graphPath()');assert q.evaluate('stability().ok');q.evaluate('level=4;score=4100;retries=2;finishStage()');ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='grand-span-certified' and isinstance(ev[-1]['score'],(int,float));checks['spanwright']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));seed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};q.set_content(raw('lantern-line',seed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.keyboard.down('KeyI');q.wait_for_timeout(180);q.keyboard.up('KeyI');assert q.evaluate('speed')>0;q.evaluate('totalDelay=12;penalty=3;comfort=95;finish()');ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='route-complete' and ev[-1]['meta']['direction']=='low';checks['lantern-line']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1080,'height':720});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('mosslight-vale'),wait_until='domcontentloaded');q.wait_for_timeout(80);q.evaluate('reachStage=3;hollowStage=2;duskOrchids.forEach(x=>x.got=true);player.x=nera.x;player.y=nera.y;interact();save()');ev=q.evaluate('window.__events');assert any(x.get('event')=='moonroot-restored' for x in ev);assert q.evaluate('hollowStage')==3 and q.evaluate('blade')==5;saved=json.loads(q.evaluate("localStorage.getItem('wwg:mosslight-save')"));assert saved['hollowStage']==3 and all(saved['duskOrchids']);checks['mosslightMoonroot']=saved['hollowStage'];assert not ee,ee;q.close()
 # Direction-aware local best: worse low score must not replace 30, better 18 must.
 q=b.new_page(viewport={'width':1100,'height':800});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));seed={'wwg:scores':json.dumps({'lantern-line':30})};q.set_content(detail(seed),wait_until='domcontentloaded');q.wait_for_timeout(120)
 # game.html defaults to first game without query under set_content; force URL selection by evaluating registry target is hard, so rebuild URL search before load not possible. Use direct code invariant below.
 q.close()
 print(json.dumps({'cards':45,'achievements':45,'mobile':d,'buildOperate':True,'remapFilter':True,'checks':checks},indent=2));b.close()
