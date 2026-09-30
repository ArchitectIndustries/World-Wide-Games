from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json,datetime
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
 today=datetime.datetime.now(datetime.timezone.utc).date();daily={(today-datetime.timedelta(days=i)).isoformat():120 for i in range(3)}
 seed={'wwg:daily-playtime':json.dumps(daily)}
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(seed),wait_until='domcontentloaded');p.wait_for_timeout(250)
 assert p.locator('#gameGrid .game-card').count()==53;assert p.locator('#gameCount').inner_text()=='53';assert p.locator('#dailyPickGrid .game-card').count()==1;assert p.locator('.update-badge').count()>=4
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==61;assert 'play-day streak' in p.locator('#profileStats').inner_text();p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Competition Night');txt=p.locator('#gameGrid').inner_text();assert 'Glasswing Polo' in txt and ('Vector League' in txt or 'Prism Duel' in txt)
 p.locator('#collectionFilter').select_option('Living Networks');txt=p.locator('#gameGrid').inner_text();assert 'Rootsong Architect' in txt
 p.locator('#collectionFilter').select_option('All');p.locator('#sortSelect').select_option('updated');p.wait_for_timeout(20);assert p.locator('#gameGrid .update-badge').count()>=4
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 checks={};keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('glasswing-polo',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('p1.x');q.keyboard.down('KeyL');q.wait_for_timeout(180);q.keyboard.up('KeyL');after=q.evaluate('p1.x');assert after>before;q.evaluate('s1=4;s2=1;goal(1)');q.wait_for_timeout(30);ev=q.evaluate('window.__events');assert any(x.get('event')=='ai-match-won' for x in ev);checks['glasswing']=next(x['score'] for x in reversed(ev) if x.get('event')=='ai-match-won');q.evaluate("setMode('local')");q.wait_for_timeout(30);p2before=q.evaluate('p2.x');q.keyboard.down('ArrowLeft');q.wait_for_timeout(140);q.keyboard.up('ArrowLeft');p2after=q.evaluate('p2.x');assert p2after<p2before;checks['glasswingLocalP2']=round(p2before-p2after,1);assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('rootsong-architect',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);before=q.evaluate('cursor[0]');q.keyboard.press('KeyF');assert q.evaluate('grown.size')>1;q.keyboard.press('KeyL');after=q.evaluate('cursor[0]');assert after>before
 q.evaluate("for(let i=0;i<LEVELS.length;i++){li=i;load();for(const [x,y] of LEVELS[i].solution)if(!grown.has(key(x,y)))grow(x,y)}");q.wait_for_timeout(60);ev=q.evaluate('window.__events');assert any(x.get('event')=='grove-complete' for x in ev);checks['rootsong']=next(x['score'] for x in reversed(ev) if x.get('event')=='grove-complete');assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('atlas-below',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(70);q.locator('[data-contract="1"]').click();assert q.evaluate('contractIndex')==1
 for i,(ore,crystal,caches) in enumerate([(4,2,2),(4,4,0),(6,3,0)]):
  q.evaluate("([i,o,c,k])=>{contractIndex=i;make();p.ore=o;p.crystal=c;p.caches=k;craft();p.x=exit.x;p.y=exit.y;finish(true)}",[i,ore,crystal,caches])
 ev=q.evaluate('window.__events');assert any(x.get('event')=='contract-mastered' for x in ev);checks['atlasContracts']=q.evaluate('meta.contracts.length');assert checks['atlasContracts']==3;assert not ee,ee;q.close()
 print(json.dumps({'cards':53,'achievements':61,'mobile':d,'checks':checks},indent=2));b.close()
