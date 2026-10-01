import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v25_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def pre():
 data=json.dumps({'wwg:keymap':json.dumps(MAP)});return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',pre()+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('strata-cipher'),wait_until='domcontentloaded');p.wait_for_timeout(40);before=p.evaluate('({x:cursor.x,y:cursor.y,charges})');p.keyboard.press('KeyL');moved=p.evaluate('({x:cursor.x,y:cursor.y})');assert moved['x']!=before['x'];p.keyboard.press('KeyH');assert p.evaluate('charges')==before['charges']-1;p.keyboard.press('KeyF');assert p.evaluate('digs')==1;out['strata-cipher']=(before,moved);p.close()
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('ashfall-caravan'),wait_until='domcontentloaded');p.wait_for_timeout(40);p.keyboard.press('KeyF');assert p.evaluate('contract')=='relief';p.keyboard.press('KeyH');assert p.evaluate('i')==1;out['ashfall-caravan']='primary contract + secondary choice';p.close();b.close()
 print({'inheritedV25Remappable':36,'newChecks':out,'remappableGames':38})
