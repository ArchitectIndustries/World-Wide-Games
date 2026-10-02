from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); MAP=json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})
PRE=f"""<script>Object.defineProperty(window,'localStorage',{{value:(()=>{{const s={{'wwg:keymap':JSON.stringify({MAP})}};return{{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}}}})(),configurable:true}});</script>"""
def raw(gid):
 h=(ROOT/f'games/{gid}/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>'); i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 def page(gid):
  p=b.new_page(viewport={'width':800,'height':650}); p.set_content(raw(gid),wait_until='domcontentloaded'); p.wait_for_timeout(50); return p
 p=page('neon-serpent'); p.evaluate('playing=false'); p.keyboard.press('i'); p.evaluate('playing=true;tick();playing=false'); assert p.evaluate('snake[0].y')==11; p.close()
 p=page('ironlight-breach'); x=p.evaluate('p.x'); p.keyboard.down('i'); p.wait_for_timeout(180); p.keyboard.up('i'); assert p.evaluate('p.x')>x; p.close()
 p=page('verdant-echoes'); x=p.evaluate('p.x'); p.keyboard.down('l'); p.wait_for_timeout(180); p.keyboard.up('l'); assert p.evaluate('p.x')>x; p.close()
 p=page('ashen-covenant'); st=p.evaluate('p.st'); p.keyboard.press('f'); assert p.evaluate('p.st')<st; p.close()
 p=page('astral-menagerie'); p.locator('[data-s="0"]').click(); x=p.evaluate('state.x'); p.keyboard.down('l'); p.wait_for_timeout(180); p.keyboard.up('l'); assert p.evaluate('state.x')>x; p.close()
 p=page('polyforge-studio'); p.evaluate("add('cube')"); x=p.evaluate('objs[0].x'); p.keyboard.press('l'); assert p.evaluate('objs[0].x')>x; p.close(); b.close()
print(json.dumps({'customMap':'I/J/K/L/F/H','newGames':6,'status':'pass'}))
