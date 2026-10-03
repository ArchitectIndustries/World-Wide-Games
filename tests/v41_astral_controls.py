from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/astral-menagerie/index.html').read_text()

def raw(seed=None):
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    store=json.dumps(seed or {})
    pre=f'''<script>const __s={store};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{{__pm.call(window,d,'*')}}catch{{}}}};</script>'''
    i=h.lower().find('<script')
    return h[:i]+pre+h[i:]

custom={'wwg:keymap':json.dumps({'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'})}
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(custom),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(80)
    assert not errs,errs
    p.locator('[data-s="0"]').click(); p.evaluate('stepCool=999')
    assert 'wild field battle' in p.locator('#objective').inner_text().lower()
    # Universal aliases remain active even with a custom I/J/K/L remap.
    x0=p.evaluate('state.x'); p.keyboard.down('ArrowRight'); p.wait_for_timeout(100); p.keyboard.up('ArrowRight'); x1=p.evaluate('state.x'); assert x1>x0+5,(x0,x1)
    x0=x1; p.keyboard.down('KeyD'); p.wait_for_timeout(100); p.keyboard.up('KeyD'); x1=p.evaluate('state.x'); assert x1>x0+5,(x0,x1)
    x0=x1; p.keyboard.down('KeyL'); p.wait_for_timeout(100); p.keyboard.up('KeyL'); x1=p.evaluate('state.x'); assert x1>x0+5,(x0,x1)
    y0=p.evaluate('state.y'); p.keyboard.down('ArrowUp'); p.wait_for_timeout(100); p.keyboard.up('ArrowUp'); y1=p.evaluate('state.y'); assert y1<y0-5,(y0,y1)
    # E must study outside battle instead of being swallowed as Secondary.
    p.evaluate('state.hab=1; state.x=habitats[1].study.x; state.y=habitats[1].study.y; state.attuned[1]=false; sync()')
    p.keyboard.press('KeyE'); p.wait_for_timeout(40)
    assert p.evaluate('state.attuned[1]') is True
    # Objective should explain the next win condition, not just controls.
    p.evaluate('state.questWins[1]=2;state.trainers[1]=false;sync()'); assert 'trainer gauntlet' in p.locator('#objective').inner_text().lower()
    p.evaluate('state.trainers[1]=true;state.questDone[1]=true;sync()'); assert 'warden' in p.locator('#objective').inner_text().lower()
    p.locator('#guideBtn').click(); assert 'campaign' in p.locator('#op').inner_text().lower() and 'arrow keys and wasd' in p.locator('#op').inner_text().lower()
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs,errs
    b.close()
print(json.dumps({'astralUniversalMovement':'pass','astralStudyEConflict':'fixed','objectiveGuide':'pass','mobileOverflow':'pass'}))