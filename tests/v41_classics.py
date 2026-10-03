from pathlib import Path
from playwright.sync_api import sync_playwright
import json,subprocess
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()

def prep(path,seed=None):
    h=(ROOT/path).read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    store=json.dumps(seed or {})
    pre=f'''<script>const __s={store};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};</script>'''
    i=h.lower().find('<script'); return h[:i]+pre+h[i:]

custom={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    # Snake classic contract really is hazard-free and still honors universal aliases.
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(prep('games/neon-serpent/index.html',custom),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(50)
    assert p.evaluate('[cfg.length,cfg[0].name,cfg[0].drones,cfg[0].gates]')==[4,'Classic Snake',0,0]
    p.keyboard.press('ArrowUp'); assert p.evaluate('queued.y')==-1
    p.keyboard.press('KeyD'); assert p.evaluate('queued.x')==1
    p.keyboard.press('KeyL'); assert p.evaluate('queued.x')==1
    p.evaluate('contract=1;score=120;finish()'); ev=p.evaluate('window.__events'); assert any(x.get('event')=='classic-cleared' for x in ev),ev
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2') and not errs,errs
    p.close()
    # New original maze-chase title: campaign events, power collision, persistent clear.
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(prep('games/pulse-maze/index.html',custom),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(40)
    p.locator('#next').click(); assert p.evaluate('playing') is True and p.evaluate('pellets.size')>20
    p.keyboard.press('ArrowUp'); assert p.evaluate('queued.y')==-1
    p.keyboard.press('KeyD'); assert p.evaluate('queued.x')==1
    # Powered contact defeats a hunter instead of costing a life.
    p.evaluate('powerTicks=10;player={x:5,y:5};hunters[0].x=5;hunters[0].y=5;const l=lives;collision();window.__lifeAfter=[l,lives];')
    assert p.evaluate('window.__lifeAfter[0]===window.__lifeAfter[1]')
    # Deterministically clear all three authored mazes through the actual tick/end path.
    for st in [1,2,3]:
        p.evaluate('(s)=>{build(s,true);hunters=[];pellets=new Set([key(player.x+1,player.y)]);powers=new Set();queued={x:1,y:0};dir={x:1,y:0};tick()}',st)
        if st<3:
            assert p.locator('#ov').evaluate('e=>e.classList.contains("show")')
        else:
            assert p.evaluate('meta.clears')>=1
    ev=p.evaluate('window.__events'); assert sum(1 for x in ev if x.get('event')=='maze-complete')>=3 and any(x.get('event')=='campaign-complete' for x in ev),ev
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2') and not errs,errs
    p.close(); b.close()
print(json.dumps({'neonSerpentClassic':'pass','pulseMazeCampaign':'pass','universalAliases':'pass'}))