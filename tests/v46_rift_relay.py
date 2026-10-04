from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re

ROOT=Path('.').resolve()
SRC=(ROOT/'games/rift-relay/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()

for token in [
    "const ARENAS=[", "Solo Link", "Local Duo", "wwg:rift-relay:meta-v2",
    "post('campaign-complete'", "post('duo-campaign-complete'", "post('perfect-arena'",
    "navigator.getGamepads", "gravity wells", "sweep beams", "window.__riftRelay", "wwg:prefs"
]:
    assert token in SRC, token
assert SRC.count("name:'") >= 6

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
    page.set_content(html(),wait_until='domcontentloaded',timeout=8000)
    page.wait_for_timeout(90)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.locator('#soloBtn').is_visible() and page.locator('#duoBtn').is_visible()
    assert page.evaluate('window.__riftRelay.ARENAS.length')==6
    assert page.evaluate('window.__riftRelay.ARENAS.every(a=>a.gates.length===4)')

    # Local Duo keeps P2 on arrows while P1 custom/WASD remains separate.
    page.evaluate("window.__riftRelay.start('duo')")
    st=page.evaluate('window.__riftRelay.state()'); assert st['mode']=='duo' and st['active']
    p1x,p2x=st['p1x'],st['p2x']
    page.keyboard.down('ArrowRight');page.evaluate('window.__riftRelay.step(.12)');page.keyboard.up('ArrowRight')
    st=page.evaluate('window.__riftRelay.state()')
    assert st['p2x']>p2x,(p2x,st['p2x'])
    assert abs(st['p1x']-p1x)<3,(p1x,st['p1x'])
    page.keyboard.press('Enter');assert page.evaluate('window.__riftRelay.state().p2Pulse')>0

    # Solo mode preserves universal Arrow/WASD movement even with a saved IJKL profile.
    page.evaluate("window.__riftRelay.start('solo')")
    x0=page.evaluate('window.__riftRelay.state().p1x')
    page.keyboard.down('ArrowRight');page.evaluate('window.__riftRelay.step(.1)');page.keyboard.up('ArrowRight')
    x1=page.evaluate('window.__riftRelay.state().p1x'); assert x1>x0,(x0,x1)
    page.evaluate("window.__riftRelay.reset()")
    x0=page.evaluate('window.__riftRelay.state().p1x')
    page.keyboard.down('KeyD');page.evaluate('window.__riftRelay.step(.1)');page.keyboard.up('KeyD')
    x1=page.evaluate('window.__riftRelay.state().p1x'); assert x1>x0,(x0,x1)

    # Solo partner actually moves and defensive pulse goes on cooldown.
    y0=page.evaluate('window.__riftRelay.state().p2y')
    page.evaluate('window.__riftRelay.step(.25)')
    st=page.evaluate('window.__riftRelay.state()')
    assert abs(st['p2y']-y0)>0.1 or abs(st['p2x']-630)>0.1,st
    page.evaluate('window.__riftRelay.pulse(0)'); assert page.evaluate('window.__riftRelay.state().p1Pulse')>0
    page.evaluate('for(let i=0;i<10;i++) window.__riftRelay.step(.034)')

    # Damage has a one-hit invulnerability gate; no chain shield loss.
    shield=page.evaluate('window.__riftRelay.state().shield')
    assert page.evaluate('window.__riftRelay.damage(0)') is True
    assert page.evaluate('window.__riftRelay.state().shield')==shield-1
    assert page.evaluate('window.__riftRelay.damage(0)') is False
    assert page.evaluate('window.__riftRelay.state().shield')==shield-1

    # Pause/resume and checkpoint reset.
    page.keyboard.press('KeyP'); assert page.evaluate('window.__riftRelay.state().paused') is True
    page.keyboard.press('KeyP'); assert page.evaluate('window.__riftRelay.state().paused') is False
    page.evaluate('window.__riftRelay.reset()')
    assert page.evaluate('window.__riftRelay.state().shield')==5

    # Clear all six arenas through the real ordered gate and continuation path.
    for arena in range(6):
        assert page.evaluate('window.__riftRelay.state().arena')==arena
        for gate in range(4):
            ok=page.evaluate('window.__riftRelay.forceGate()')
            assert ok is True,(arena,gate,page.evaluate('window.__riftRelay.state()'))
        st=page.evaluate('window.__riftRelay.state()')
        assert st['finished'] and st['gate']==4,st
        if arena==0:
            assert page.evaluate("JSON.parse(localStorage.getItem('wwg:rift-relay:meta-v2')).bestArena")>=2
        if arena<5:
            page.locator('#continueBtn').click()
            assert page.evaluate('window.__riftRelay.state().arena')==arena+1

    events=page.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='gate-complete')>=24,events
    assert sum(1 for e in events if e.get('event')=='arena-complete')>=6,events
    assert sum(1 for e in events if e.get('event')=='perfect-arena')>=6,events
    assert any(e.get('event')=='campaign-complete' for e in events),events
    assert all(e.get('game')=='rift-relay' and e.get('gameId')=='rift-relay' for e in events),events[:3]
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:rift-relay:meta-v2'))")
    assert meta['clears']>=1 and meta['bestArena']==6 and meta['perfects']>=6 and meta['best']>0,meta
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs,errs
    browser.close()

print(json.dumps({'arenas':6,'orderedGates':24,'soloBot':'pass','localDuo':'pass','universalMovement':'pass','pulse':'pass','damageInvulnerability':'pass','pause':'pass','campaign':'pass','persistence':'pass','arenaUnlocks':'pass','mobileOverflow':'pass'}))
