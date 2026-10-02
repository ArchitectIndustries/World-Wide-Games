from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
PRE="""<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})(),configurable:true});</script>"""
def raw(gid):
 h=(ROOT/f'games/{gid}/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
checks={}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 def page(gid):
  p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e))); p.set_content(raw(gid),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(80); assert not errs,(gid,errs); assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),gid; return p
 p=page('neon-serpent'); h0=p.evaluate('snake[0].x'); p.evaluate("turn('down');tick()") ; assert p.evaluate('snake[0].y')!=12; p.evaluate('start(2)'); assert p.evaluate('contract')==2 and p.evaluate('drones.length')==2; checks['neon']='steer + contract 2'; p.close()
 p=page('ironlight-breach'); a=p.evaluate("typeof ammo==='object'?ammo.rifle:ammo"); p.evaluate('shoot()'); assert p.evaluate("typeof ammo==='object'?ammo.rifle:ammo")==a-1; p.evaluate('load(3)'); assert p.evaluate('sector')==3 and p.evaluate('cores.length')==3; checks['ironlight']='fire + sector 3'; p.close()
 p=page('verdant-echoes'); b0=p.evaluate('bombs'); p.evaluate('plant()'); assert p.evaluate('bombs')==b0-1; p.evaluate('dashGo()'); assert p.evaluate('inv')>0; checks['verdant']='bomb + dash'; p.close()
 p=page('ashen-covenant'); st=p.evaluate('p.st'); p.evaluate('light()'); assert p.evaluate('p.st')<st; p.evaluate('ash=75;p.x=400;p.y=300;die()'); assert p.evaluate('mark&&mark.ash')==75 and not p.evaluate('markArmed'); p.evaluate('start();p.x=700;p.y=500;update(.02)'); assert p.evaluate('markArmed'); p.evaluate('p.x=mark.x;p.y=mark.y;update(.02)'); assert p.evaluate('mark') is None and p.evaluate('ash')==75; checks['ashen']='stamina + deliberate death recovery'; p.close()
 p=page('astral-menagerie'); p.locator('[data-s="0"]').click(); p.evaluate('startBattle(false);Math.random=()=>0'); hp=p.evaluate('battle.wild.hp'); p.evaluate('attack()'); assert p.evaluate('battle===null||battle.wild.hp')<hp if p.evaluate('battle!==null') else True; p.evaluate('startBattle(false);battle.wild.hp=1;capture()'); assert p.evaluate('state.codex.length')>=1; checks['astral']='starter + battle/capture'; p.close()
 p=page('polyforge-studio'); p.evaluate("add('cube');add('cube');add('pillar');add('orb')"); assert p.evaluate('objs.length')==4; x=p.evaluate('objs[sel].x'); p.evaluate("action('right')"); assert p.evaluate('objs[sel].x')>x; p.evaluate('certify()'); assert p.evaluate('bp')==2 and p.evaluate('score')>0; checks['polyforge']='transform + blueprint 1'; p.close(); b.close()
print(json.dumps(checks))
