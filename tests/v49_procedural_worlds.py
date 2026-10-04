from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
ENGINE=(ROOT/'assets/wwg-webgl.js').read_text()
PRE='''<script>
const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'})};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});
window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};
</script>'''
def inline(name):
    src=(ROOT/f'games/{name}/index.html').read_text()
    src=src.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    src=src.replace('<script src="../../assets/wwg-webgl.js"></script>',f'<script>{ENGINE}</script>')
    i=src.lower().find('<script')
    return src[:i]+PRE+src[i:]

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    # Cinderline
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(inline('cinderline-velocity'),wait_until='domcontentloaded',timeout=10000);page.wait_for_timeout(180)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__cinderlineVelocity.engineReady()') is True
    renderer=page.evaluate('engine.mode')
    assert renderer in ('webgl2','canvas2d')
    page.evaluate('window.__cinderlineVelocity.start()');page.wait_for_timeout(20)
    st=page.evaluate('window.__cinderlineVelocity.state()');assert st['active'] and st['course']==0 and st['lap']==1
    x0,z0=st['x'],st['z'];page.keyboard.down('ArrowUp');page.wait_for_timeout(30);page.keyboard.up('ArrowUp');page.evaluate('update(.15)');st=page.evaluate('window.__cinderlineVelocity.state()');assert abs(st['x']-x0)+abs(st['z']-z0)>.01
    for course in range(3):
        if course>0:
            page.locator('#continue').click();page.wait_for_timeout(20)
        for _ in range(6): page.evaluate('window.__cinderlineVelocity.forceGate()')
        st=page.evaluate('window.__cinderlineVelocity.state()');assert st['finished'] and st['course']==course,st
    ev=page.evaluate('window.__events');assert sum(1 for e in ev if e.get('event')=='circuit-complete')>=3,ev
    assert any(e.get('event')=='campaign-complete' for e in ev),ev
    assert any(e.get('event')=='clean-circuit' for e in ev),ev
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:cinderline-velocity:meta-v1'))")
    assert meta['unlocked']==3 and meta['clears']>=1 and all(x>0 for x in meta['best']),meta
    assert not errs,errs
    # Glasswild
    page2=browser.new_page(viewport={'width':390,'height':844})
    errs2=[];page2.on('pageerror',lambda e:errs2.append(str(e)))
    page2.set_content(inline('glasswild-ascent'),wait_until='domcontentloaded',timeout=10000);page2.wait_for_timeout(180)
    assert page2.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page2.evaluate('window.__glasswildAscent.engineReady()') is True
    renderer2=page2.evaluate('engine.mode')
    assert renderer2 in ('webgl2','canvas2d')
    page2.evaluate('window.__glasswildAscent.start()');page2.wait_for_timeout(20)
    y0=page2.evaluate('window.__glasswildAscent.state().y');page2.keyboard.press('Space');page2.evaluate('update(.05)');assert page2.evaluate('window.__glasswildAscent.state().y')>y0
    page2.keyboard.press('KeyH');assert page2.evaluate('window.__glasswildAscent.state().dashCd')>0
    # exercise a real void recovery on course one
    page2.evaluate('window.__glasswildAscent.forceFall()');assert page2.evaluate('window.__glasswildAscent.state().falls')==1
    for course in range(3):
        if course>0:
            page2.locator('#continue').click();page2.wait_for_timeout(20)
        page2.evaluate('window.__glasswildAscent.collectAll();window.__glasswildAscent.teleportExit();update(.01)')
        st=page2.evaluate('window.__glasswildAscent.state()');assert st['finished'] and st['course']==course,st
    ev2=page2.evaluate('window.__events');assert sum(1 for e in ev2 if e.get('event')=='expedition-complete')>=3,ev2
    assert any(e.get('event')=='campaign-complete' for e in ev2),ev2
    meta2=page2.evaluate("JSON.parse(localStorage.getItem('wwg:glasswild-ascent:meta-v1'))")
    assert meta2['unlocked']==3 and meta2['clears']>=1 and all(x>0 for x in meta2['best']),meta2
    assert not errs2,errs2
    browser.close()
print(json.dumps({'renderer':renderer,'renderer2':renderer2,'webgl2Source':'validated-statically','cinderlineCircuits':3,'cinderlineCampaign':'pass','glasswildExpeditions':3,'glasswildCampaign':'pass','touchWidth390':'pass','persistentRecords':'pass','dualTelemetry':'pass'}))
