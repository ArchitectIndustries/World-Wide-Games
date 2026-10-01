import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v28_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 pre=f"<script>const __s={{'wwg:keymap':{json.dumps(json.dumps(MAP))}}};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});</script>"
 i=s.lower().find('<script');return s[:i]+pre+s[i:]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('aetherstead-colony'));p.wait_for_timeout(30)
 before=p.evaluate('cursor');p.keyboard.press('KeyL');assert p.evaluate('cursor')!=before
 p.keyboard.press('KeyF');assert p.evaluate("cells.filter(c=>c.t!=='empty').length")==1
 t=p.evaluate('tool');p.keyboard.press('KeyH');assert p.evaluate('tool')!=t
 p.close();b.close()
print({'inheritedRemappable':39,'aethersteadCustomMap':'I/J/K/L/F/H','remappableGames':40})
