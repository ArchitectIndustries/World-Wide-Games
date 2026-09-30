from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
def pre(seed=None):
 data=json.dumps(seed or {})
 return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre()+f'<script>{games}</script><script>{app}</script>')
def raw(slug,seed=None):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 return h.replace('<script>',pre(seed)+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1440,'height':1050});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(300);p.screenshot(path='/mnt/data/wwg-v13-home.png',full_page=True);p.close()
 for slug,name,setup in [
  ('frostline-rescue','frostline',"player.x=470;player.y=210;fires[0].heat=65;"),
  ('signal-choir','choir',"clearTimers();playing=false;seq=[0,2,4,1,3];input=[0,2];sync();flash(4);"),
  ('terrace-keeper','terrace',"plots[0]={type:'Sunleaf',age:1,watered:false};plots[1]={type:'Glowbean',age:2,watered:true};plots[3]={type:'Bloomroot',age:2,watered:false};coins=92;harvested=8;render();"),
  ('emberdeck-pilgrim','emberdeck',"state.enemy.hp=0;victory();")
 ]:
  p=b.new_page(viewport={'width':1200,'height':780});p.set_content(raw(slug, {'wwg:emberdeck-meta':json.dumps({'clears':3,'boon':'coalheart'})} if slug=='emberdeck-pilgrim' else None),wait_until='domcontentloaded');p.wait_for_timeout(100);p.evaluate(setup);p.wait_for_timeout(140);p.screenshot(path=f'/mnt/data/wwg-v13-{name}.png',full_page=True);p.close()
 b.close()
