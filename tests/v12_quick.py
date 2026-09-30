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
today=datetime.date.today(); activity={(today-datetime.timedelta(days=i)).isoformat():(i+1)*180 for i in range(7)}
dgp={}
for i in range(7):
 k=(today-datetime.timedelta(days=i)).isoformat(); dgp[k]={'chronofold-courier':240+i*30,'hearthline-kitchen':120,'spectra-safari':90}
seed={'wwg:daily-playtime':json.dumps(activity),'wwg:daily-game-playtime':json.dumps(dgp)}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(200)
 assert p.locator('#gameGrid .game-card').count()==40; assert p.locator('#gameCount').inner_text()=='40'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==38;assert p.locator('#activityChart .activity-day').count()==7;assert p.locator('#genreTrends .genre-trend').count()>=5;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Skill & Timing');grid=p.locator('#gameGrid').inner_text();assert 'Hearthline Kitchen' in grid and 'Pulse Archive' in grid;p.locator('#collectionFilter').select_option('All')
 p.locator('#searchInput').fill('time loop');assert 'Chronofold Courier' in p.locator('#gameGrid').inner_text();p.locator('#searchInput').fill('')
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(40);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 q=b.new_page(viewport={'width':960,'height':640});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('chronofold-courier'),wait_until='domcontentloaded');q.wait_for_timeout(70);q.keyboard.press('ArrowRight');q.keyboard.press('Space');assert q.evaluate('echoes.length')==1;q.evaluate('si=4;stageScore=1500;completeStage()');q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='archive-delivered' and isinstance(ev[-1]['score'],(int,float));checks['chronofold-courier']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':980,'height':700});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('hearthline-kitchen'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.evaluate('bowl=[...order.i];needle=50;cooked=false;cook();serve();score=1400;served=3;finish()');q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='service-complete';checks['hearthline-kitchen']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':980,'height':600});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('spectra-safari'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.evaluate('animals[0].x=cam.x+20;animals[0].y=cam.y;snap();score+=900;finish()');q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='survey-complete';checks['spectra-safari']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1050,'height':720});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('ashfall-caravan'),wait_until='domcontentloaded');q.wait_for_timeout(50);q.evaluate('for(let z=0;z<8;z++)choose(0)');q.wait_for_timeout(30);meta=q.evaluate("JSON.parse(localStorage.getItem('wwg:ashfall-meta'))");assert meta['completions']==1 and meta['trait'];variant=q.evaluate("restart();i=2;currentScene().t");assert variant!='The Singing Well';checks['ashfallLegacy']=meta['trait'];assert not ee,ee;q.close()
 runs=[{'id':'chronofold-courier','score':1200,'event':'archive-delivered','duration':80,'at':'2026-09-30T12:00:00Z','meta':{}},{'id':'chronofold-courier','score':900,'event':'archive-delivered','duration':95,'at':'2026-09-30T11:00:00Z','meta':{}}]
 q=b.new_page(viewport={'width':1120,'height':780});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(detail({'wwg:run-history':json.dumps(runs)}),wait_until='domcontentloaded');q.wait_for_timeout(1150);txt=q.locator('#runSummary').inner_text();assert '1,050' in txt and '+300' in txt,txt;q.evaluate("dispatchEvent(new Event('pagehide'))");dgp2=q.evaluate("JSON.parse(localStorage.getItem('wwg:daily-game-playtime')||'{}')");assert dgp2 and any('chronofold-courier' in v for v in dgp2.values());assert not ee,ee;q.close()
 assert not errs,errs
 print(json.dumps({'cards':40,'achievements':38,'genreTrends':True,'mobile':d,'checks':checks,'runSummary':True,'dailyGamePlaytimeTracked':True},indent=2));b.close()
