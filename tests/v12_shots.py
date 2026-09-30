from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json,datetime
ROOT=Path('.').resolve()
def pre(seed=None):
 data=json.dumps(seed or {})
 return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre()+f'<script>{games}</script><script>{app}</script>')
def raw(slug,seed=None):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',pre(seed)+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1440,'height':1050});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(300);p.screenshot(path='/mnt/data/wwg-v12-home.png',full_page=True);p.close()
 for slug,name,setup in [
  ('chronofold-courier','chronofold',"act('R');seal();act('U');act('R');"),
  ('hearthline-kitchen','hearthline',"bowl=[...order.i];needle=50;render();"),
  ('spectra-safari','spectra',"animals[0].x=cam.x+40;animals[0].y=cam.y;animals[1].x=cam.x-110;animals[1].y=cam.y+60;"),
  ('ashfall-caravan','ashfall',"for(let z=0;z<8;z++)choose(0);restart();i=2;render();")
 ]:
  p=b.new_page(viewport={'width':1200,'height':760});p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(120);p.evaluate(setup);p.wait_for_timeout(160);p.screenshot(path=f'/mnt/data/wwg-v12-{name}.png',full_page=True);p.close()
 b.close()
