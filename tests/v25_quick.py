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
BFS="""(target)=>{const start=[p.x,p.y],q=[start],prev=new Map([[start.join(','),null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];let end=null;while(q.length){const cur=q.shift();if(cur[0]===target.x&&cur[1]===target.y){end=cur;break}for(const d of dirs){const nx=cur[0]+d[0],ny=cur[1]+d[1],k=nx+','+ny;if(nx<0||ny<0||nx>=N||ny>=N||grid[ny][nx]==='#'||prev.has(k))continue;prev.set(k,cur);q.push([nx,ny])}}if(!end)throw new Error('no path');const path=[];for(let cur=end;prev.get(cur.join(','));){const old=prev.get(cur.join(','));path.push([cur[0]-old[0],cur[1]-old[1]]);cur=old}path.reverse();for(const d of path)move(d[0],d[1]);return path.length}"""
RUNE_BFS="""(target)=>{const start=[player.x,player.y],q=[start],prev=new Map([[start.join(','),null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];let end=null;while(q.length){const cur=q.shift();if(cur[0]===target.x&&cur[1]===target.y){end=cur;break}for(const d of dirs){const nx=cur[0]+d[0],ny=cur[1]+d[1],k=nx+','+ny;if(nx<0||ny<0||nx>=N||ny>=N||grid[ny][nx]||prev.has(k))continue;prev.set(k,cur);q.push([nx,ny])}}if(!end)throw new Error('no path');const path=[];for(let cur=end;prev.get(cur.join(','));){const old=prev.get(cur.join(','));path.push([cur[0]-old[0],cur[1]-old[1]]);cur=old}path.reverse();for(const d of path)move(d[0],d[1]);return path.length}"""
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(250)
 assert p.locator('#gameGrid .game-card').count()==64;assert p.locator('#gameCount').inner_text()=='64';assert p.locator('#dailyPickGrid .game-card').count()==1
 assert not p.locator('#updatedSection').is_hidden();assert 'Rune Depths' in p.locator('#updatedGrid').inner_text()
 p.locator('#profileButton').click();assert p.locator('#achievementGrid .achievement').count()==81;p.locator('#profileDialog .dialog-close').click()
 p.locator('#collectionFilter').select_option('Deep Expeditions');txt=p.locator('#gameGrid').inner_text();assert 'Echofall Caverns' in txt and 'Rune Depths' in txt
 p.locator('#releaseHistoryButton').click();assert p.locator('#releaseHistoryDialog').evaluate('(e)=>e.open');assert p.locator('#releaseHistoryList .release-item').count()==6;assert 'v25' in p.locator('#releaseHistoryList').inner_text();p.locator('#releaseHistoryDialog .dialog-close').click()
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d;assert not errs,errs;p.close()
 keyseed={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})};checks={}
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('echofall-caverns',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80);q.keyboard.press('KeyF');assert q.evaluate('echoes')==1
 q.evaluate(f"""()=>{{const bfs={BFS};for(let c=0;c<MAPS.length;c++){{for(const r of [...res])bfs(r);bfs(exit);if(c<MAPS.length-1)advance()}}}}""")
 ev=q.evaluate('window.__events');hit=[x for x in ev if x.get('event')=='atlas-complete'];assert hit and isinstance(hit[-1].get('score'),(int,float)),ev;checks['echofall']=hit[-1]['score'];assert not ee,ee;q.close()
 q=b.new_page(viewport={'width':1000,'height':760});ee=[];q.on('pageerror',lambda e,errs=ee:errs.append(str(e)));q.set_content(raw('rune-depths',keyseed),wait_until='domcontentloaded');q.wait_for_timeout(80)
 q.evaluate(f"""()=>{{const bfs={RUNE_BFS};const picks=['heart','edge','flask','heart'];for(let floor=1;floor<=5;floor++){{enemies=[];for(const s of [...sigils])bfs(s);bfs(exit);if(floor<5)chooseRelic(picks[floor-1])}}}}""")
 ev=q.evaluate('window.__events');master=[x for x in ev if x.get('event')=='depths-mastered'];triad=[x for x in ev if x.get('event')=='relic-triad'];assert master and triad and isinstance(master[-1].get('score'),(int,float)),ev;checks['rune']=master[-1]['score'];assert not ee,ee;q.close()
 print(json.dumps({'cards':64,'achievements':81,'mobile':d,'releaseHistoryItems':6,'deepExpeditions':True,'checks':checks},indent=2));b.close()
