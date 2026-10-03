from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re

ROOT=Path('.').resolve()
SRC=(ROOT/'games/vector-shatter/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()

chunk=SRC.split('const LEVELS=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([.123P]+)'",chunk)
assert len(rows)==27, len(rows)
expected=[4,5,5,6,7]
levels=[];i=0
for n in expected:
    levels.append(rows[i:i+n]);i+=n
assert i==len(rows)
assert all(any('P' in r for r in lev) for lev in levels)
assert all(any(any(ch in r for ch in '23') for r in lev) for lev in levels[1:])
for token in [
    "powerKinds=['wide','multi','slow','guard','pierce']",
    "post('sector-complete'", "post('campaign-complete'", "post('powerup-collected'",
    "wwg:vector-shatter:meta-v1", "navigator.getGamepads", "pointerdown",
    "WWGInput.is", "gpAxis", "window.__vectorShatter"
]:
    assert token in SRC, token

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
    errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(html(),wait_until='domcontentloaded',timeout=8000)
    page.wait_for_timeout(80)

    assert page.locator('#launch').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__vectorShatter.state().active') is False
    assert page.evaluate('window.__vectorShatter.state().brickCount')>30

    page.evaluate('window.__vectorShatter.start()')
    st=page.evaluate('window.__vectorShatter.state()')
    assert st['active'] and st['sector']==0 and st['served']

    x0=page.evaluate('window.__vectorShatter.state().paddleX')
    page.keyboard.down('ArrowRight');page.evaluate('window.__vectorShatter.step(.1)');page.keyboard.up('ArrowRight')
    x1=page.evaluate('window.__vectorShatter.state().paddleX')
    assert x1>x0,(x0,x1)
    page.evaluate('window.__vectorShatter.paddle.x=480')
    page.keyboard.down('KeyA');page.evaluate('window.__vectorShatter.step(.1)');page.keyboard.up('KeyA')
    x2=page.evaluate('window.__vectorShatter.state().paddleX')
    assert x2<480,x2

    page.evaluate('window.__vectorShatter.launch()')
    assert page.evaluate('window.__vectorShatter.state().served') is False
    page.keyboard.press('KeyP');assert page.evaluate('window.__vectorShatter.state().paused') is True
    page.keyboard.press('KeyP');assert page.evaluate('window.__vectorShatter.state().paused') is False
    page.evaluate("['wide','multi','slow','guard','pierce'].forEach(x=>window.__vectorShatter.applyPower(x))")
    st=page.evaluate('window.__vectorShatter.state()')
    assert st['paddleW']>138 and st['balls']>=3 and st['guard']==1 and st['power']['slow']>0 and st['power']['pierce']>0,st

    lives=st['lives']
    page.evaluate('window.__vectorShatter.dropBall()')
    st=page.evaluate('window.__vectorShatter.state()')
    assert st['lives']==lives and st['guard']==0 and st['served'],st

    page.evaluate('window.__vectorShatter.setScore(1234)')
    page.evaluate('window.__vectorShatter.reset()')
    assert page.evaluate('window.__vectorShatter.state().score')==0

    for sector in range(5):
        page.evaluate('window.__vectorShatter.forceClear()')
        st=page.evaluate('window.__vectorShatter.state()')
        assert st['finished'] and st['sector']==sector,st
        if sector<4:
            page.locator('#launch').click()
            assert page.evaluate('window.__vectorShatter.state().sector')==sector+1
    events=page.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='sector-complete')>=5,events
    assert any(e.get('event')=='campaign-complete' for e in events),events
    assert sum(1 for e in events if e.get('event')=='powerup-collected')>=5,events
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:vector-shatter:meta-v1'))")
    assert meta['clears']>=1 and meta['bestSector']==5 and meta['best']>0,meta

    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs,errs
    browser.close()

print(json.dumps({'sectors':5,'powerups':5,'universalMovement':'pass','pause':'pass','guardRecovery':'pass','checkpointRetry':'pass','campaign':'pass','mobileOverflow':'pass'}))
