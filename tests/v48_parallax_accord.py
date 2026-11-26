from pathlib import Path
from playwright.sync_api import sync_playwright
import json
from parallax_test_instrument import instrument

ROOT=Path('.').resolve()
SRC=(ROOT/'games/parallax-accord/index.html').read_text()
assert "window.__parallaxAccord" not in SRC
for token in [
    'Parallax Accord','const OPPONENTS=[','const DISTRICTS=[','const CARD_TYPES={',
    "wwg:parallax-accord:meta-v1","post('campaign-complete'","post('sweep-match'",
    'navigator.getGamepads','ARCHITECT INDUSTRIES'
]: assert token in SRC,token
assert SRC.count("name:'") >= 9

PRE='''<script>
const __s={};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});
window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};
</script>'''

def html():
    i=SRC.lower().find('<script>')
    return instrument(SRC[:i]+PRE+SRC[i:])

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(html(),wait_until='domcontentloaded',timeout=8000);page.wait_for_timeout(80)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__parallaxAccord.OPPONENTS.length')==3
    assert page.evaluate('window.__parallaxAccord.DISTRICTS.length')==3
    assert page.evaluate('Object.keys(window.__parallaxAccord.CARD_TYPES).length')==6

    # Keyboard district selection and a real card commit.
    assert page.evaluate('window.__parallaxAccord.state().selectedDistrict')==0
    page.keyboard.press('ArrowRight')
    assert page.evaluate('window.__parallaxAccord.state().selectedDistrict')==1
    page.evaluate('window.__parallaxAccord.setEnergy(6);window.__parallaxAccord.setSelectedCard(0)')
    before=page.evaluate('window.__parallaxAccord.state()')
    page.keyboard.press('Enter')
    after=page.evaluate('window.__parallaxAccord.state()')
    assert after['energy']<before['energy'],(before,after)
    assert after['youTotals'][1]>0,after

    # End round executes the rival AI and advances to round two.
    page.keyboard.press('KeyE');page.wait_for_timeout(30)
    st=page.evaluate('window.__parallaxAccord.state()')
    assert st['round']==2 and st['energy']==2,st
    assert sum(st['aiTotals'])>0,st

    # Retry restores campaign checkpoint and round state.
    page.evaluate('window.__parallaxAccord.setScore(9999);window.__parallaxAccord.retry()')
    st=page.evaluate('window.__parallaxAccord.state()')
    assert st['round']==1 and st['score']==0 and not st['finished'],st

    # Complete all three delegations through the real result/continue path.
    prior=0
    for idx in range(3):
        st=page.evaluate('window.__parallaxAccord.state()');assert st['opponent']==idx,st
        assert page.evaluate('window.__parallaxAccord.forceWin(true)') is True
        st=page.evaluate('window.__parallaxAccord.state()')
        assert st['finished'] and st['won'] and st['score']>prior,st
        prior=st['score']
        if idx<2:
            page.locator('#continueBtn').click();page.wait_for_timeout(20)
            nxt=page.evaluate('window.__parallaxAccord.state()')
            assert nxt['opponent']==idx+1 and nxt['score']==prior,nxt

    events=page.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='match-complete')>=3,events
    assert sum(1 for e in events if e.get('event')=='sweep-match')>=3,events
    assert any(e.get('event')=='campaign-complete' for e in events),events
    assert all(e.get('game')=='parallax-accord' and e.get('gameId')=='parallax-accord' for e in events),events[:3]
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:parallax-accord:meta-v1'))")
    assert meta['clears']>=1 and meta['furthest']==3 and meta['best']>0 and meta['sweeps']>=3,meta
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs,errs
    browser.close()

print(json.dumps({'delegations':3,'districts':3,'cardTypes':6,'keyboard':'pass','realCommit':'pass','aiRound':'pass','checkpoint':'pass','campaign':'pass','persistence':'pass','telemetry':'pass','mobileOverflow':'pass'}))
