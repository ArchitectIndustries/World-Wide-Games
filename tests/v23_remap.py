import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v22_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def pre():
 data=json.dumps({'wwg:keymap':json.dumps(MAP)});return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',pre()+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('prismweave-atelier'),wait_until='domcontentloaded');p.wait_for_timeout(50);before=p.evaluate('band');p.keyboard.press('KeyL');after=p.evaluate('band');assert after!=before;p.keyboard.press('KeyF');assert p.evaluate('moves')==1;out['prismweave-atelier']=(before,after);p.close()
 p=b.new_page(viewport={'width':1000,'height':720});p.set_content(raw('bastion-bloom'),wait_until='domcontentloaded');p.wait_for_timeout(50);before=p.evaluate('selectedNode');p.keyboard.press('KeyL');after=p.evaluate('selectedNode');assert after!=before;p.keyboard.press('KeyF');assert p.evaluate('towers.length')==1;out['bastion-bloom']=(before,after);p.close();b.close()
 print({'inheritedV22Remappable':30,'newChecks':out,'remappableGames':32})
