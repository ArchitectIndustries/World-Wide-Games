from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
def pre(seed=None):
 data=json.dumps(seed or {});return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 return re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',pre()+f'<script>{games}</script><script>{app}</script>')
def raw(slug):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return h.replace('<script>',pre()+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1440,'height':1050});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(250);p.screenshot(path='/mnt/data/wwg-v16-home.png',full_page=True);p.close()
 p=b.new_page(viewport={'width':1200,'height':760});p.set_content(raw('riftwake-regatta'),wait_until='domcontentloaded');p.wait_for_timeout(140);p.evaluate('boat.x=340;boat.y=185;boat.a=.15;trim=.72;cp=2');p.screenshot(path='/mnt/data/wwg-v16-regatta.png');p.close()
 p=b.new_page(viewport={'width':1100,'height':820});p.set_content(raw('archive-alchemist'),wait_until='domcontentloaded');p.wait_for_timeout(100);p.evaluate('selected=[0,1];render()');p.screenshot(path='/mnt/data/wwg-v16-alchemist.png',full_page=True);p.close();b.close()
print('screenshots written')
