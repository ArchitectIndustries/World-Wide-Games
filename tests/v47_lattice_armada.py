from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT=Path('.').resolve()
SRC=(ROOT/'games/lattice-armada/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in [
    "const SECTORS=[", "Prism Wake", "Crown Lattice", "Shoot 'Em Up Campaign",
    "wwg:lattice-armada:meta-v1", "post('campaign-complete'", "post('boss-defeated'",
    "phase-burst", "core-collected", "navigator.getGamepads", "window.__latticeArmada", "wwg:prefs"
]: assert token in SRC, token
assert SRC.count("name:'") >= 4

PRE='''<script>
const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'})};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});
window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};
</script>'''

def html():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script')
    return h[:i]+PRE+h[i:]

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(html(),wait_until='domcontentloaded',timeout=8000); page.wait_for_timeout(80)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__latticeArmada.SECTORS.length')==4

    # Universal aliases remain valid even with IJKL remap saved.
    page.evaluate('window.__latticeArmada.start(0)')
    x0=page.evaluate('window.__latticeArmada.state().shipX')
    page.keyboard.down('ArrowRight'); page.evaluate('window.__latticeArmada.step(.12)'); page.keyboard.up('ArrowRight')
    x1=page.evaluate('window.__latticeArmada.state().shipX'); assert x1>x0,(x0,x1)
    page.evaluate('window.__latticeArmada.reset()')
    x0=page.evaluate('window.__latticeArmada.state().shipX')
    page.keyboard.down('KeyD'); page.evaluate('window.__latticeArmada.step(.12)'); page.keyboard.up('KeyD')
    assert page.evaluate('window.__latticeArmada.state().shipX')>x0
    page.evaluate('window.__latticeArmada.reset()')
    x0=page.evaluate('window.__latticeArmada.state().shipX')
    page.keyboard.down('KeyL'); page.evaluate('window.__latticeArmada.step(.12)'); page.keyboard.up('KeyL')
    assert page.evaluate('window.__latticeArmada.state().shipX')>x0

    # Fire and power systems.
    assert page.evaluate('window.__latticeArmada.shoot()') is True
    assert page.evaluate('window.__latticeArmada.state().shots')>=1
    page.evaluate("window.__latticeArmada.applyPower('rapid');window.__latticeArmada.applyPower('spread');window.__latticeArmada.applyPower('shield')")
    st=page.evaluate('window.__latticeArmada.state()'); assert st['rapid']>0 and st['spread']>0 and st['shield']==1,st

    # Shield absorbs one hit and invulnerability prevents a chain hit.
    hull=st['hull']; assert page.evaluate('window.__latticeArmada.damage()') is True
    st=page.evaluate('window.__latticeArmada.state()'); assert st['hull']==hull and st['shield']==0,st
    assert page.evaluate('window.__latticeArmada.damage()') is False

    # Burst clears hostile bullets and damages the Crown Array.
    page.evaluate('window.__latticeArmada.start(3);window.__latticeArmada.spawnBoss();window.__latticeArmada.addEnemyShot();window.__latticeArmada.chargeBurst()')
    before=page.evaluate('window.__latticeArmada.state()')
    assert before['enemyShots']>=1 and before['bossHp']>0
    assert page.evaluate('window.__latticeArmada.burst()') is True
    after=page.evaluate('window.__latticeArmada.state()')
    assert after['enemyShots']==0 and after['bossHp']<before['bossHp'],(before,after)

    # Pause/resume and sector score checkpoint on reset.
    page.evaluate('window.__latticeArmada.start(1,4321)')
    page.keyboard.press('KeyP'); assert page.evaluate('window.__latticeArmada.state().paused') is True
    page.keyboard.press('KeyP'); assert page.evaluate('window.__latticeArmada.state().paused') is False
    page.evaluate('window.__latticeArmada.setScore(4999);window.__latticeArmada.reset()')
    assert page.evaluate('window.__latticeArmada.state().score')==4321

    # Clear four sectors with cumulative campaign score and persistent unlocks.
    page.evaluate('window.__latticeArmada.start(0,0)')
    prev_score=0
    for sector in range(4):
        st=page.evaluate('window.__latticeArmada.state()'); assert st['sector']==sector,st
        assert page.evaluate('window.__latticeArmada.forceSectorClear()') is True
        st=page.evaluate('window.__latticeArmada.state()'); assert st['finished'] and st['score']>prev_score,st
        prev_score=st['score']
        if sector<3:
            page.locator('#launchBtn').click()
            st=page.evaluate('window.__latticeArmada.state()'); assert st['sector']==sector+1 and st['score']==prev_score,st

    events=page.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='sector-complete')>=4,events
    assert any(e.get('event')=='campaign-complete' for e in events),events
    assert any(e.get('event')=='phase-burst' for e in events),events
    assert all(e.get('game')=='lattice-armada' and e.get('gameId')=='lattice-armada' for e in events),events[:4]
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:lattice-armada:meta-v1'))")
    assert meta['clears']>=1 and meta['bestSector']==4 and meta['best']>0,meta
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs,errs
    browser.close()

print(json.dumps({'sectors':4,'universalMovement':'pass','savedRemap':'pass','fire':'pass','powerCores':'pass','damageGate':'pass','phaseBurst':'pass','bossDamage':'pass','pause':'pass','scoreCheckpoint':'pass','campaign':'pass','persistence':'pass','mobileOverflow':'pass'}))
