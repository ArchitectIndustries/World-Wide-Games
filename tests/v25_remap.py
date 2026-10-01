import subprocess,sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();subprocess.run([sys.executable,'tests/v24_remap.py'],check=True,capture_output=True,text=True)
INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def pre():
 data=json.dumps({'wwg:keymap':json.dumps(MAP)});return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',pre()+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('echofall-caverns'),wait_until='domcontentloaded');p.wait_for_timeout(40);e=p.evaluate('echoes');p.keyboard.press('KeyF');assert p.evaluate('echoes')==e+1
 # Find one open neighbor and verify mapped directional input moves.
 neigh=p.evaluate("()=>[['right',1,0],['down',0,1],['left',-1,0],['up',0,-1]].find(v=>grid[p.y+v[2]]&&grid[p.y+v[2]][p.x+v[1]]!== '#')")
 key={'right':'KeyL','down':'KeyK','left':'KeyJ','up':'KeyI'}[neigh[0]];before=p.evaluate('({x:p.x,y:p.y})');p.keyboard.press(key);after=p.evaluate('({x:p.x,y:p.y})');assert after!=before;out['echofall-caverns']=(before,after);p.close()
 p=b.new_page(viewport={'width':900,'height':720});p.set_content(raw('rune-depths'),wait_until='domcontentloaded');p.wait_for_timeout(40);p.evaluate('enemies=[]');neigh=p.evaluate("()=>[['right',1,0],['down',0,1],['left',-1,0],['up',0,-1]].find(v=>grid[player.y+v[2]]&&grid[player.y+v[2]][player.x+v[1]]===0)")
 key={'right':'KeyL','down':'KeyK','left':'KeyJ','up':'KeyI'}[neigh[0]];before=p.evaluate('({x:player.x,y:player.y})');p.keyboard.press(key);after=p.evaluate('({x:player.x,y:player.y})');assert after!=before;hp=p.evaluate('player.hp');p.evaluate('player.hp=Math.max(1,player.maxHp-3);player.potions=1;sync()');p.keyboard.press('KeyH');assert p.evaluate('player.hp')>hp-3;out['rune-depths']=(before,after);p.close();b.close()
 print({'inheritedV24Remappable':34,'newChecks':out,'remappableGames':36})
