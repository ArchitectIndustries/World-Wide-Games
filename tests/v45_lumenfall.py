from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path('.').resolve()
SRC=(ROOT/'games/lumenfall-citadel/index.html').read_text()

for token in [
    "const gates=", "dawn", "veil", "ember", "Bell-Warden", "gamepad()",
    "post('rune-claimed'", "post('boss-defeated'", "post('campaign-complete'",
    "wwg:lumenfall-citadel:save-v1", "wwg:lumenfall-citadel:meta-v1", "data-act=\"jump\""
]: assert token in SRC, token
assert len(re.findall(r"id:'[a-f]'",SRC))==6

PRE='''<script>
const __s={};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});
window.__events=[];window.parent={postMessage:(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};
</script>'''

def html():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>','')
    i=h.lower().find('<script>')
    return h[:i]+PRE+h[i:]

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(html(),wait_until='domcontentloaded',timeout=8000)
    page.wait_for_timeout(80)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    st=page.evaluate('window.__lumen.state()')
    assert st['runes']==[] and not st['gateDawn'] and st['bossHp']==14

    x0=st['x']; page.keyboard.down('ArrowRight'); page.wait_for_timeout(120); page.keyboard.up('ArrowRight')
    assert page.evaluate('window.__lumen.state().x')>x0
    page.evaluate('window.__lumen.teleport(250,619)'); page.wait_for_timeout(40)
    y0=page.evaluate('window.__lumen.state().y'); page.keyboard.press('Space'); page.wait_for_timeout(50)
    assert page.evaluate('window.__lumen.state().y')<y0

    assert page.evaluate("window.__lumen.claim('dawn')") is True
    st=page.evaluate('window.__lumen.state()'); assert st['gateDawn'] and not st['gateVeil']
    page.evaluate('window.__lumen.teleport(1000,590);window.__lumen.dash();window.__lumen.update(.05)')
    assert page.evaluate('window.__lumen.state().x')>1000
    assert page.evaluate("window.__lumen.claim('veil')") is True
    st=page.evaluate('window.__lumen.state()'); assert st['gateVeil'] and not st['gateSeal']
    page.evaluate('window.__lumen.teleport(2700,590);window.__lumen.jump();window.__lumen.update(.08);window.__lumen.jump()')
    assert page.evaluate('window.__lumen.state().y')<590
    assert page.evaluate("window.__lumen.claim('ember')") is True
    assert page.evaluate('window.__lumen.state().gateSeal') is True
    page.evaluate('window.__lumen.bolt()')
    assert page.evaluate("shots.some(s=>s.owner==='p')") is True

    page.evaluate('window.__lumen.teleport(1660,590);window.__lumen.update(.02)')
    st=page.evaluate('window.__lumen.state()'); assert st['checkpoint']==1660
    saved=page.evaluate("JSON.parse(localStorage.getItem('wwg:lumenfall-citadel:save-v1'))")
    assert saved['checkpoint']==1660 and set(saved['runes'])=={'dawn','veil','ember'}
    page.evaluate('window.__lumen.damage(5)')
    st=page.evaluate('window.__lumen.state()'); assert st['hp']==5 and st['x']==1660

    page.evaluate('window.__lumen.teleport(3970,619);window.__lumen.killBoss()')
    page.wait_for_timeout(350)
    st=page.evaluate('window.__lumen.state()')
    assert st['finished'] and not st['bossAlive']
    events=page.evaluate('window.__events')
    names=[e.get('event') for e in events]
    assert 'three-runes' in names and 'boss-defeated' in names and 'campaign-complete' in names, names
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:lumenfall-citadel:meta-v1'))")
    assert meta['clears']>=1 and meta['bestScore']>=1000 and meta['bestTime']>0
    assert page.locator('#pause').get_attribute('class').find('show')>=0
    assert not errs, errs
    browser.close()

print(json.dumps({'runes':3,'gates':3,'keyboardMovement':'pass','doubleJump':'pass','dash':'pass','runeBolt':'pass','checkpoint':'pass','respawn':'pass','boss':'pass','campaign':'pass','mobileOverflow':'pass'}))
