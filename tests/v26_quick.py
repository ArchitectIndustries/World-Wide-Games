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
 assert p.locator('#gameGrid .game-card').count()==65;assert p.locator('#gameCount').inner_text()=='65';assert p.locator('#dailyPickGrid .game-card').count()==1
 assert not p.locator('#updatedSection').is_hidden();assert 'Ashfall Caravan' in p.locator('#updatedGrid').inner_text()
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==84;p.locator('#profileDialog .dialog-close').click()
 p.locator('#collectionFilter').select_option('Field Studies');txt=p.locator('#gameGrid').inner_text();assert 'Strata Cipher' in txt and 'Starfall Observatory' in txt
 p.locator('#releaseHistoryButton').click();assert p.locator('#releaseHistoryDialog').evaluate('(e)=>e.open');assert p.locator('#releaseHistoryList .release-item').count()==6;assert 'v26' in p.locator('#releaseHistoryList').inner_text();p.locator('#releaseHistoryDialog .dialog-close').click()
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('strata-cipher',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.keyboard.press('KeyH');assert q.evaluate('charges')==4
 q.evaluate("""()=>{for(let s=0;s<SITES.length;s++){for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(SITES[s][y][x]==='A'){cursor={x,y};excavate()}if(s<SITES.length-1)advance()}}""")
 ev=q.evaluate('window.__events');done=[x for x in ev if x.get('event')=='survey-complete'];delicate=[x for x in ev if x.get('event')=='delicate-excavation'];assert done and delicate and isinstance(done[-1].get('score'),(int,float)),ev;checks['strata']=done[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('ashfall-caravan',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.evaluate("chooseContract('relief')");q.evaluate("()=>{while(!done)choose(0)}")
 ev=q.evaluate('window.__events');journey=[x for x in ev if x.get('event')=='journey-complete'];assert journey and isinstance(journey[-1].get('score'),(int,float)),ev;assert journey[-1]['meta']['contract']=='relief' and journey[-1]['meta']['contractMastered'] is True;checks['ashfall']=journey[-1]['score'];assert not ee,ee;q.close()
 print(json.dumps({'cards':65,'achievements':84,'mobile':d,'releaseHistoryItems':6,'fieldStudies':True,'checks':checks},indent=2));b.close()
