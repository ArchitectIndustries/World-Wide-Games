from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json,datetime
ROOT=Path('.').resolve()
def pre(seed=None):
 data=json.dumps(seed or {})
 return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home(seed=None):
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre(seed)+f'<script>{games}</script><script>{app}</script>')
def raw(slug,seed=None):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',pre(seed)+'<script>',1)
def detail(seed=None):
 h=(ROOT/'game.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();gp=(ROOT/'js/game-page.js').read_text()
 return h.replace('<link rel="stylesheet" href="assets/styles.css"/>',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/game-page.js"></script>',pre(seed)+f'<script>{games}</script><script>{gp}</script>')
# Seed seven-day activity so chart rendering is non-zero.
today=datetime.date.today(); activity={(today-datetime.timedelta(days=i)).isoformat():(i+1)*120 for i in range(7)}
seed={'wwg:daily-playtime':json.dumps(activity)}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(180)
 assert p.locator('#gameGrid .game-card').count()==37; assert p.locator('#gameCount').inner_text()=='37'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==33;assert p.locator('#activityChart .activity-day').count()==7;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Story & Journey');assert 'Ashfall Caravan' in p.locator('#gameGrid').inner_text();p.locator('#collectionFilter').select_option('All')
 p.locator('#searchInput').fill('hidden object');assert 'Mothlight Museum' in p.locator('#gameGrid').inner_text();p.locator('#searchInput').fill('')
 p.keyboard.press('/');assert p.evaluate("document.activeElement===document.querySelector('#searchInput')")
 p.locator('#searchInput').blur();p.keyboard.press('p');assert p.locator('#profileDialog').evaluate('e=>e.open');p.locator('.dialog-close').click()
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(30);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 q=b.new_page(viewport={'width':960,'height':650});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('ashfall-caravan'),wait_until='domcontentloaded');q.wait_for_timeout(50)
 for _ in range(8): q.evaluate('choose(0)')
 q.wait_for_timeout(50);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='journey-complete' and isinstance(ev[-1]['score'],(int,float));assert not ee,ee;checks['ashfall-caravan']=ev[-1]['score'];q.close()
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('twinforge-expedition'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.keyboard.press('w');q.evaluate('sector=2;energy=75;score=2200;finish()');q.wait_for_timeout(50);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='expedition-complete';assert not ee,ee;checks['twinforge-expedition']=ev[-1]['score'];q.close()
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('mothlight-museum'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.evaluate('room=2;found=new Set([0,1,2,3,4]);roomDone()');q.wait_for_timeout(50);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='case-closed';assert not ee,ee;checks['mothlight-museum']=ev[-1]['score'];q.close()
 q=b.new_page(viewport={'width':1100,'height':800});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(detail(),wait_until='domcontentloaded');q.wait_for_timeout(1150);q.evaluate("dispatchEvent(new Event('pagehide'));dispatchEvent(new MessageEvent('message',{source:document.querySelector('#gameFrame').contentWindow,data:{type:'wwg:game-event',game:window.WWG_GAMES[0].id,event:'test-run',score:321,duration:9,meta:{source:'qa'}}}))");pt=q.evaluate("JSON.parse(localStorage.getItem('wwg:daily-playtime')||'{}')");assert any(v>=1 for v in pt.values()),pt;hist=q.evaluate("JSON.parse(localStorage.getItem('wwg:run-history')||'[]')");assert hist and hist[0]['score']==321 and hist[0]['duration']==9,hist;assert not ee,ee;q.close()
 assert not errs,errs
 print(json.dumps({'cards':37,'achievements':33,'activityBars':7,'mobile':d,'checks':checks,'dailyPlaytimeTracked':True},indent=2));b.close()
