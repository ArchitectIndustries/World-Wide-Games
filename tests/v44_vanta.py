from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re

ROOT=Path('.').resolve()
SRC=(ROOT/'games/vanta-frontline/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()

# Authored operation topology and required gameplay ingredients.
chunk=SRC.split('const OPS=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([#A-Z.]+)'",chunk)
assert len(rows)==54, len(rows)
ops=[rows[i:i+18] for i in range(0,len(rows),18)]
assert len(ops)==3 and all(len(r)==25 for op in ops for r in op)
for i,op in enumerate(ops,1):
    joined=''.join(op)
    assert joined.count('P')==1 and joined.count('X')==1, i
    assert joined.count('A')==3, (i,joined.count('A'))
    assert sum(joined.count(x) for x in 'BSR')>=5, i
    assert 'M' in joined and 'C' in joined, i

for token in [
    "pointerLockElement===C", "data-profile=\"low\"", "data-profile=\"high\"",
    "keys.sprint", "keys.leanL", "keys.leanR", "jumpV=2.4", "gamepad()",
    "post('uplink-secured'", "post('operation-complete'", "post('campaign-complete'",
    "opStartScore", "wwg:vanta-frontline:meta-v1"
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
    page.wait_for_timeout(100)

    assert page.locator('#launch').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__vanta.state().active') is False
    page.evaluate("window.__vanta.setProfile('low')")
    assert page.evaluate('window.__vanta.state().profile')=='low'
    page.evaluate("window.__vanta.setProfile('high')")
    assert page.evaluate('window.__vanta.state().profile')=='high'

    page.evaluate('window.__vanta.start()')
    page.wait_for_timeout(50)
    st=page.evaluate('window.__vanta.state()')
    assert st['active'] and st['operation']==0 and st['secured']==0 and st['alive']>=5

    # Universal Arrow/WASD remains valid even with a stored custom directional remap.
    before=page.evaluate('p.y')
    page.keyboard.down('ArrowRight'); page.evaluate('update(.1)'); page.keyboard.up('ArrowRight')
    after=page.evaluate('p.y')
    assert after>before, (before,after)
    before=page.evaluate('p.x')
    page.keyboard.down('KeyW'); page.evaluate('update(.1)'); page.keyboard.up('KeyW')
    after=page.evaluate('p.x')
    assert after>before, (before,after)

    # Reload transfer and armor absorption are deterministic at their boundaries.
    page.evaluate('mag=4;reserve=20;reloading=.01;update(.02)')
    st=page.evaluate('window.__vanta.state()')
    assert st['mag']==24 and st['reserve']==0, st
    page.evaluate('hp=100;armor=50;hurt(20)')
    st=page.evaluate('window.__vanta.state()')
    assert abs(st['armor']-37.6)<.01 and abs(st['hp']-92.4)<.01, st

    # A centered target in a clear corridor is hit and consumes exactly one round.
    page.evaluate("parseOp(0);active=true;finished=false;paused=false;reloading=0;sprint=false;ads=true;p={x:1.5,y:1.5,a:0};enemies=[{x:3.5,y:1.5,type:'rifle',hp:100,shot:9999,hit:0,alert:false,phase:0}];mag=30;reserve=120;lastShot=-999")
    hp0=page.evaluate('enemies[0].hp')
    page.evaluate('shoot()')
    assert page.evaluate('mag')==29
    assert page.evaluate('enemies[0].hp')<hp0

    # Retry restores the operation-start score so deaths cannot be farmed.
    page.evaluate('score=900;opStartScore=125;hp=0;armor=0;fail()')
    assert page.evaluate('window.__vanta.state().finished') is True
    page.locator('#continue').click()
    st=page.evaluate('window.__vanta.state()')
    assert st['score']==125 and st['operation']==0 and not st['finished'], st

    # Clear all three operations through the real extraction condition and continue flow.
    page.evaluate('score=0;opStartScore=0;parseOp(0);active=true')
    for op in range(3):
        page.evaluate('window.__vanta.secureAll();window.__vanta.teleportExtract();update(0)')
        st=page.evaluate('window.__vanta.state()')
        assert st['finished'] and st['operation']==op, st
        if op<2:
            page.locator('#continue').click()
            assert page.evaluate('window.__vanta.state().operation')==op+1
    events=page.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='operation-complete')>=3, events
    assert any(e.get('event')=='campaign-complete' for e in events), events
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:vanta-frontline:meta-v1'))")
    assert meta['clears']>=1 and meta['bestOperation']>=3 and meta['best']>0, meta

    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert not errs, errs
    browser.close()

print(json.dumps({'operations':3,'uplinksPerOperation':3,'graphicsProfiles':3,'universalMovement':'pass','reload':'pass','armor':'pass','shooting':'pass','retryScoreCheckpoint':'pass','campaign':'pass','mobileOverflow':'pass'}))