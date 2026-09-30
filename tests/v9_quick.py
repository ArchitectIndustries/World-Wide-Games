from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve()
def pre(seed=None):
    data=json.dumps(seed or {})
    return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
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
 assert p.locator('#gameGrid .game-card').count()==31
 assert p.locator('#gameCount').inner_text()=='31'
 assert p.locator('#achievementGrid .achievement').count()==24
 p.locator('#searchInput').fill('deckbuilder');assert p.locator('#gameGrid .game-card').count()==1;assert 'Emberdeck Pilgrim' in p.locator('#gameGrid').inner_text();p.locator('#searchInput').fill('')
 p.locator('#collectionFilter').select_option('Local Together');n=p.locator('#gameGrid .game-card').count();assert 1<=n<31,n;p.locator('#collectionFilter').select_option('All')
 p.locator('#profileButton').click();assert p.locator('#profileStats > div').count()==4;p.locator('.dialog-close').click()
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(30);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 for slug in ['deepwater-signal','emberdeck-pilgrim','command-bloom']:
  q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e,ee=ee:ee.append(str(e)));q.set_content(raw(slug),wait_until='domcontentloaded');q.wait_for_timeout(100)
  if slug=='deepwater-signal':
   q.keyboard.press('Space');q.keyboard.press('KeyE');assert int(q.locator('#battery').inner_text())<100;q.evaluate("relays.forEach(r=>r.on=true);sub.relays=5;sub.x=gate.x;sub.y=gate.y;scan()")
  elif slug=='emberdeck-pilgrim':
   assert q.locator('#hand .card').count()>=4;q.keyboard.press('Digit1');q.evaluate("state.node=2;state.enemy.hp=0;victory()")
  else:
   q.keyboard.press('KeyF');q.keyboard.press('KeyP');assert int(q.locator('#count').inner_text())==2;q.evaluate("idx=levels.length-1;cores.forEach(c=>c.got=true);bot.x=levels[idx].g[0];bot.y=levels[idx].g[1];finish()")
  q.wait_for_timeout(50);ev=q.evaluate('window.__events');assert any(isinstance(x.get('score'),(int,float)) for x in ev),(slug,ev);assert not ee,(slug,ee);checks[slug]=ev[-1]['event'];q.close()
 # Atlas rank-perk boot at Deep Cartographer.
 seed={'wwg:atlas-meta':json.dumps({'clears':5})}
 q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw('atlas-below',seed),wait_until='domcontentloaded');q.wait_for_timeout(100);assert q.locator('#rank').inner_text()=='Deep Cartographer';assert q.locator('#signal').inner_text() in ['N','S','E','W'];assert int(q.locator('#ore').inner_text())==1 and int(q.locator('#crystal').inner_text())==1;q.evaluate("p.ore=6;p.crystal=2;craft();p.x=exit.x;p.y=exit.y;finish(true)");ev=q.evaluate('window.__events');assert ev[-1]['meta']['rankBonus']=='gas-filter+starter-kit';assert not ee,ee;q.close()
 # Reusable detail shell playtime tracking.
 q=b.new_page(viewport={'width':1100,'height':800});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(detail(),wait_until='domcontentloaded');q.wait_for_timeout(1150);q.evaluate("dispatchEvent(new Event('pagehide'))");pt=q.evaluate("JSON.parse(localStorage.getItem('wwg:playtime')||'{}')");assert any(v>=1 for v in pt.values()),pt;assert not ee,ee;q.close()
 assert not errs,errs
 print(json.dumps({'cards':31,'achievements':24,'collectionLocalTogether':n,'mobile':d,'checks':checks,'playtimeTracked':True},indent=2));b.close()
