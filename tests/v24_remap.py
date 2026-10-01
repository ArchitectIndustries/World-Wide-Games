import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v23_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def pre(seed=None):
 data={'wwg:keymap':json.dumps(MAP)};data.update(seed or {});raw=json.dumps(data);return f"<script>const __s={raw};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
def raw(slug,seed=None):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',pre(seed)+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('starfall-observatory'),wait_until='domcontentloaded');p.wait_for_timeout(60);a=p.evaluate('az');p.keyboard.press('KeyL');a2=p.evaluate('az');assert a2!=a;f=p.evaluate('filter');p.keyboard.press('KeyH');f2=p.evaluate('filter');assert f2!=f;out['starfall-observatory']=(a,a2,f,f2);p.close()
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('emberdeck-pilgrim'),wait_until='domcontentloaded');p.wait_for_timeout(60);s=p.evaluate('selected');p.keyboard.press('KeyL');s2=p.evaluate('selected');assert s2!=s;t=p.evaluate('turn');p.keyboard.press('KeyH');t2=p.evaluate('turn');assert t2==t+1;out['emberdeck-pilgrim']=(s,s2,t,t2);p.close();b.close()
 print({'inheritedV23Remappable':32,'newChecks':out,'remappableGames':34})
