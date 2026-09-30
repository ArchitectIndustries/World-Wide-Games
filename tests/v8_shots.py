from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re
ROOT=Path('.').resolve();PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 h=re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',PRE+f'<script>{games}</script><script>{app}</script>');return h
def raw(slug):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':800});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(120);p.screenshot(path='/mnt/data/wwg-v8-home.png');p.close()
 for slug,name in [('railspire-dispatch','railspire'),('glyphsmith','glyphsmith'),('solar-loom','solar'),('atlas-below','atlas')]:
  p=b.new_page(viewport={'width':960,'height':540});p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(120)
  if slug=='railspire-dispatch':p.keyboard.press('Digit1');p.keyboard.press('Digit3')
  elif slug=='glyphsmith':p.keyboard.type('GLYPH');p.keyboard.press('Enter')
  elif slug=='solar-loom':p.evaluate("place(1);selected='garden';place(2);selected='gas';place(4);calc();build()")
  else:p.evaluate("p.ore=4;p.crystal=1;sync()")
  p.wait_for_timeout(50);p.screenshot(path=f'/mnt/data/wwg-v8-{name}.png');p.close()
 b.close()
