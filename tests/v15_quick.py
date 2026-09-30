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
 assert p.locator('#gameGrid .game-card').count()==47;assert p.locator('#gameCount').inner_text()=='47'
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==50;p.locator('.dialog-close').click()
 p.locator('#collectionFilter').select_option('Aim & Arc');txt=p.locator('#gameGrid').inner_text();assert 'Driftglass Links' in txt and 'Cloudforge Pinball' in txt
 p.locator('#collectionFilter').select_option('All');p.locator('#modeFilter').select_option('Local Multiplayer');txt=p.locator('#gameGrid').inner_text();assert 'Prism Duel' in txt and 'Twinforge Expedition' in txt and 'Driftglass Links' not in txt
 p.locator('#modeFilter').select_option('Solo');txt=p.locator('#gameGrid').inner_text();assert 'Driftglass Links' in txt and 'Prism Duel' in txt
 p.locator('#inputFilter').select_option('Remappable');txt=p.locator('#gameGrid').inner_text();assert 'Circuit Rush' in txt and 'Orbit Breaker' in txt
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(70);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 assert not errs,errs
 checks={}
 q=b.new_page(viewport={'width':1100,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('driftglass-links'),wait_until='domcontentloaded');q.wait_for_timeout(70);a0=q.evaluate('angle');q.keyboard.press('ArrowRight');assert q.evaluate('angle')>a0;q.keyboard.press('Space');assert q.evaluate('strokes')==1;q.evaluate('moving=false;hole=holes.length-1;strokes=18;completeHole()');ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='course-complete' and ev[-1]['score']==18 and ev[-1]['meta']['direction']=='low';checks['driftglass']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1050,'height':820});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('tideglass-surveyor'),wait_until='domcontentloaded');q.wait_for_timeout(60);x0=q.evaluate('cursor[0]');q.keyboard.press('ArrowRight');assert q.evaluate('cursor[0]')==min(8,x0+1);q.evaluate('chart=charts.length-1;cursor=[...cur().t];probe()');q.wait_for_timeout(650);ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='survey-complete' and isinstance(ev[-1]['score'],(int,float));checks['tideglass']=ev[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('prism-duel'),wait_until='domcontentloaded');q.wait_for_timeout(60);q.locator('#mode').click();assert q.evaluate("mode")=='ai';q.evaluate("s1=4;s2=0;score(1)");ev=q.evaluate('window.__events');assert ev and ev[-1]['event']=='ai-duel-won' and ev[-1]['meta']['mode']=='ai';checks['prismAI']=ev[-1]['score'];assert not ee,ee;q.close()
 seed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('circuit-rush',seed),wait_until='domcontentloaded');q.wait_for_timeout(70);before=q.evaluate('car.v');q.keyboard.down('KeyI');q.wait_for_timeout(180);q.keyboard.up('KeyI');after=q.evaluate('car.v');assert after>before,(before,after);checks['circuitRemap']=round(after,2);assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':700});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('orbit-breaker',seed),wait_until='domcontentloaded');q.wait_for_timeout(70);before=q.evaluate('shots.length');q.keyboard.press('KeyF');q.wait_for_timeout(30);after=q.evaluate('shots.length');assert after>before,(before,after);checks['orbitRemap']=after;assert not ee,ee;q.close()
 print(json.dumps({'cards':47,'achievements':50,'mobile':d,'modeFilter':True,'aimArc':True,'checks':checks},indent=2));b.close()
