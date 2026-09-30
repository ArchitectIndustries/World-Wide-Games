from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
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
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(220)
 assert p.locator('#gameGrid .game-card').count()==43;assert p.locator('#gameCount').inner_text()=='43'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==42;assert p.locator('[data-key-action]').count()==6;p.locator('[data-key-action="up"]').select_option('KeyI');assert p.evaluate("JSON.parse(localStorage.getItem('wwg:keymap')).up")=='KeyI';p.locator('.dialog-close').click()
 p.locator('#inputFilter').select_option('Remappable');txt=p.locator('#gameGrid').inner_text();assert 'Frostline Rescue' in txt and 'Chronofold Courier' in txt and 'Atlas Below' in txt;p.locator('#inputFilter').select_option('All')
 p.locator('#collectionFilter').select_option('Hands & Heart');txt=p.locator('#gameGrid').inner_text();assert 'Frostline Rescue' in txt and 'Terrace Keeper' in txt;p.locator('#collectionFilter').select_option('All')
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(40);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 q=b.new_page(viewport={'width':1100,'height':720});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('frostline-rescue',{'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}),wait_until='domcontentloaded');q.wait_for_timeout(80);y=q.evaluate('player.y');q.keyboard.down('KeyI');q.wait_for_timeout(120);q.keyboard.up('KeyI');assert q.evaluate('player.y')<y;q.evaluate('rescued=6;score=2300;finish(true)');ev=q.evaluate('window.__events');assert ev[-1]['event']=='district-cleared';checks['frostline-rescue']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':900,'height':680});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('signal-choir'),wait_until='domcontentloaded');q.wait_for_timeout(70);q.evaluate('clearTimers();playing=false;seq=[0,1];input=[]');q.keyboard.press('Digit1');q.keyboard.press('Digit2');q.evaluate('round=6;score=2100;lives=2;finish(true)');ev=q.evaluate('window.__events');assert ev[-1]['event']=='choir-complete';checks['signal-choir']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('terrace-keeper'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.locator('[data-p="0"]').click();q.locator('[data-p="0"]').click();q.evaluate('harvested=12;coins=100;score=1900;finish()');ev=q.evaluate('window.__events');assert ev[-1]['event']=='season-complete';checks['terrace-keeper']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1050,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('emberdeck-pilgrim',{'wwg:emberdeck-meta':json.dumps({'clears':3,'boon':'coalheart'})}),wait_until='domcontentloaded');q.wait_for_timeout(70);assert q.locator('#boonRow').evaluate('(e)=>getComputedStyle(e).display')!='none';q.evaluate('state.enemy.hp=0;victory()');q.wait_for_timeout(30);assert 'Glass Garden' in q.locator('#reward').inner_text() and 'Iron Kiln' in q.locator('#reward').inner_text();q.locator('[data-route="glass"]').click();q.wait_for_timeout(20);assert q.evaluate('state.route')=='glass';checks['emberdeckBranch']=True;assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':980,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('chronofold-courier',{'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}),wait_until='domcontentloaded');q.wait_for_timeout(50);before=q.evaluate('player.y');q.keyboard.press('KeyI');after=q.evaluate('player.y');assert after<before;(q.keyboard.press('KeyF'));assert q.evaluate('echoes.length')==1;checks['chronofoldRemap']=True;assert not ee,ee;q.close()
 assert not errs,errs
 print(json.dumps({'cards':43,'achievements':42,'mobile':d,'checks':checks,'remapFilter':True,'handsHeart':True},indent=2));b.close()
