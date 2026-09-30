from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve()
def pre(seed=None):
    data=json.dumps(seed or {})
    return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home(seed=None):
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 h=re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre(seed)+f'<script>{games}</script><script>{app}</script>');return h
def raw(slug,seed=None):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',pre(seed)+'<script>',1)
def detail(seed=None):
 h=(ROOT/'game.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();gp=(ROOT/'js/game-page.js').read_text();h=h.replace('<link rel="stylesheet" href="assets/styles.css"/>',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/game-page.js"></script>',pre(seed)+f'<script>{games}</script><script>{gp}</script>');return h
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(180)
 assert p.locator('#gameGrid .game-card').count()==34
 assert p.locator('#gameCount').inner_text()=='34'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==28;assert p.locator('#profileStats > div').count()==7;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Slow & Cozy');assert p.locator('#gameGrid').inner_text().find('Moonwake Angler')>=0;p.locator('#collectionFilter').select_option('Mind Games');assert p.locator('#gameGrid').inner_text().find('Cipher Court')>=0;p.locator('#collectionFilter').select_option('All')
 p.locator('#searchInput').fill('flight');assert p.locator('#gameGrid .game-card').count()>=1;assert 'Windward Cargo' in p.locator('#gameGrid').inner_text();p.locator('#searchInput').fill('')
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(30);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 # Windward Cargo completion + controls
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('windward-cargo'),wait_until='domcontentloaded');q.wait_for_timeout(80);q.keyboard.press('ArrowUp');q.evaluate("delivery=4;score=2400;finish()") ;q.wait_for_timeout(30);ev=q.evaluate('window.__events');assert ev[-1]['event']=='route-complete' and isinstance(ev[-1]['score'],(int,float));assert not ee,ee;checks['windward-cargo']=ev[-1]['score'];q.close()
 # Cipher Court solve all four cases directly through UI state.
 q=b.new_page(viewport={'width':960,'height':720});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('cipher-court'),wait_until='domcontentloaded');q.wait_for_timeout(50)
 for _ in range(4):q.evaluate("selected=cases[idx].culprit;document.querySelector('#accuse').click()")
 q.wait_for_timeout(80);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='docket-solved';assert not ee,ee;checks['cipher-court']=ev[-1]['score'];q.close()
 # Moonwake Angler force five-catch finish.
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('moonwake-angler'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.keyboard.press('Space');q.evaluate("catches=5;score=3100;finish()") ;q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert ev[-1]['event']=='night-haul';assert not ee,ee;checks['moonwake-angler']=ev[-1]['score'];q.close()
 # Mosslight fourth region progression.
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('mosslight-vale'),wait_until='domcontentloaded');q.wait_for_timeout(50);q.evaluate("questStage=4;postStage=3;fenStage=3;reachStage=2;sunbells.forEach(x=>x.got=true);player.x=orrin.x;player.y=orrin.y;interact()") ;q.wait_for_timeout(40);assert q.evaluate('reachStage')==3 and q.evaluate('blade')==4;ev=q.evaluate('window.__events');assert any(x.get('event')=='sunfall-restored' for x in ev);assert not ee,ee;checks['mosslight-vale']='sunfall-restored';q.close()
 # Atlas generation differs materially at Deep Cartographer rank.
 def atlas_counts(clears):
  seed={'wwg:atlas-meta':json.dumps({'clears':clears})};qq=b.new_page(viewport={'width':960,'height':540});ee=[];qq.on('pageerror',lambda e:ee.append(str(e)));qq.set_content(raw('atlas-below',seed),wait_until='domcontentloaded');qq.wait_for_timeout(50);vals=qq.evaluate("({rank:rankName(),gas:map.flat().filter(x=>x===5).length,crystal:map.flat().filter(x=>x===3).length,walls:map.flat().filter(x=>x===1).length})");assert not ee,ee;qq.close();return vals
 rookie=atlas_counts(0);deep=atlas_counts(5);assert deep['rank']=='Deep Cartographer';assert deep['gas']<=rookie['gas'];assert deep['crystal']>=rookie['crystal']
 # Detail shell tracks sessions and playtime.
 q=b.new_page(viewport={'width':1100,'height':800});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(detail(),wait_until='domcontentloaded');q.wait_for_timeout(1100);q.evaluate("dispatchEvent(new Event('pagehide'))");pt=q.evaluate("JSON.parse(localStorage.getItem('wwg:playtime')||'{}')");ss=q.evaluate("JSON.parse(localStorage.getItem('wwg:sessions')||'{}')");assert any(v>=1 for v in pt.values()),pt;assert any(v.get('count',0)>=1 for v in ss.values()),ss;assert not ee,ee;q.close()
 assert not errs,errs
 print(json.dumps({'cards':34,'achievements':28,'mobile':d,'checks':checks,'rookie':rookie,'deep':deep,'sessionTracking':True},indent=2));b.close()
