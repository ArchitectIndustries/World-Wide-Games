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
 assert p.locator('#gameGrid .game-card').count()==51;assert p.locator('#gameCount').inner_text()=='51';assert p.locator('#dailyPickGrid .game-card').count()==1
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==57;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Systems Lab');txt=p.locator('#gameGrid').inner_text();assert 'Tidal Foundry' in txt and 'Spanwright' in txt
 p.locator('#collectionFilter').select_option('Daily Pick');assert p.locator('#gameGrid .game-card').count()==1
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 checks={};seed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('stoneveil-ascent',seed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('selected');q.keyboard.press('KeyL');after=q.evaluate('selected');assert after!=before or q.evaluate('reachable().length')==1;q.keyboard.press('KeyF');q.wait_for_timeout(380);assert q.evaluate('cur')!=0;q.evaluate("ri=4;completed=4;loadRoute();cur=holds.length-2;selected=holds.length-1;stamina=100;moves=1;climb()");q.wait_for_timeout(520);ev=q.evaluate('window.__events');assert any(x.get('event')=='summit-complete' for x in ev);checks['stoneveil']=next(x['score'] for x in reversed(ev) if x.get('event')=='summit-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('tidal-foundry',seed),wait_until='domcontentloaded');q.wait_for_timeout(80);m0=q.evaluate('tiles[cursor].m');q.keyboard.press('KeyF');m1=q.evaluate('tiles[cursor].m');assert m1!=m0;q.evaluate("si=5;load();tiles.forEach(t=>{if(t.route)t.m=t.sol});testFlow()");q.wait_for_timeout(820);ev=q.evaluate('window.__events');assert any(x.get('event')=='foundry-complete' for x in ev);checks['foundry']=next(x['score'] for x in reversed(ev) if x.get('event')=='foundry-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('mosslight-vale',seed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.evaluate("hollowStage=3;canopyStage=2;starLilies.forEach(x=>x.got=true);player.x=elian.x;player.y=elian.y;interact()");ev=q.evaluate('window.__events');assert any(x.get('event')=='starbloom-restored' for x in ev);assert q.evaluate('blade')==6 and q.evaluate('canopyStage')==3;checks['starbloom']=next(x['score'] for x in reversed(ev) if x.get('event')=='starbloom-restored');assert not ee,ee;q.close()
 print(json.dumps({'cards':51,'achievements':57,'dailyPick':True,'mobile':d,'checks':checks},indent=2));b.close()
