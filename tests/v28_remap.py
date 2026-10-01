import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v26_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 pre=f"<script>const __s={{'wwg:keymap':{json.dumps(json.dumps(MAP))}}};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});</script>"
 i=s.lower().find('<script');return s[:i]+pre+s[i:]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('fluxward-conclave'));p.wait_for_timeout(40)
 before=p.evaluate('({x:cursor.x,y:cursor.y})');p.keyboard.press('KeyL');after=p.evaluate('({x:cursor.x,y:cursor.y})');assert after['x']!=before['x']
 p.evaluate('cursor={x:0,y:6};current=0;actions=2;board[6][0].charge=1');p.keyboard.press('KeyH');assert p.evaluate('board[6][0].charge')==2
 p.keyboard.press('KeyF');assert p.evaluate('selected&&selected.x===0&&selected.y===6')
 p.close();b.close()
print({'inheritedRemappable':38,'fluxwardCustomMap':'I/J/K/L/F/H','remappableGames':39})
