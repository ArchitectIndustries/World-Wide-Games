from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re
ROOT=Path('.').resolve();OUT=Path('/mnt/data');INPUT=(ROOT/'assets/wwg-input.js').read_text()
def uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text();
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,uri(p))
 h=re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>')
 return h.replace('<script src="js/games.js"></script><script src="js/app.js"></script>',f'<script>{games}</script><script>{app}</script>')
def raw(slug):return (ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1440,'height':1050});p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(250);p.screenshot(path=str(OUT/'wwg-v18-home.png'),full_page=True);p.close()
 for slug,name in [('glasswing-polo','wwg-v18-glasswing.png'),('rootsong-architect','wwg-v18-rootsong.png')]:
  p=b.new_page(viewport={'width':1100,'height':760});p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(250);p.screenshot(path=str(OUT/name));p.close()
 p=b.new_page(viewport={'width':1100,'height':760});p.set_content(raw('atlas-below'),wait_until='domcontentloaded');p.wait_for_timeout(120);p.evaluate("contractIndex=2;make();p.x=18;p.y=12;sync()");p.wait_for_timeout(200);p.screenshot(path=str(OUT/'wwg-v18-atlas.png'));p.close();b.close()
print('screenshots written')
