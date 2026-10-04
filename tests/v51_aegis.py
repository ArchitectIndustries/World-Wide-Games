from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
ENGINE=(ROOT/'assets/wwg-webgl.js').read_text()
src=(ROOT/'games/aegis-verge/index.html').read_text()
src=src.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
src=src.replace('<script src="../../assets/wwg-webgl.js"></script>',f'<script>{ENGINE}</script>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(src,wait_until='domcontentloaded',timeout=10000);page.wait_for_timeout(180)
    page.evaluate("window.__events=[];addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)})")
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__aegisVerge.engineReady()') is True
    renderer=page.evaluate('engine.mode');assert renderer in ('webgl2','canvas2d')
    page.evaluate('window.__aegisVerge.start()');page.wait_for_timeout(20)
    st=page.evaluate('window.__aegisVerge.state()');assert st['active'] and st['mission']==0 and st['hull']==100 and len(st['pylons'])==3
    z0=st['z'];page.keyboard.down('ArrowUp');page.evaluate('update(.5)');page.keyboard.up('ArrowUp');assert page.evaluate('window.__aegisVerge.state().z')>z0
    e0=page.evaluate('window.__aegisVerge.state().energy');page.keyboard.press('KeyE');page.evaluate('update(.01)');assert page.evaluate('window.__aegisVerge.state().energy')<e0
    page.evaluate('window.__aegisVerge.hit()');assert page.evaluate('window.__aegisVerge.state().damageTaken')>=10
    for op in range(3):
        if op>0:
            page.locator('#continue').click();page.wait_for_timeout(20)
        page.evaluate('window.__aegisVerge.breakPylons()')
        st=page.evaluate('window.__aegisVerge.state()');assert st['core']['exposed'] and all(q['down'] for q in st['pylons'])
        page.evaluate('window.__aegisVerge.destroyCore()')
        st=page.evaluate('window.__aegisVerge.state()');assert st['finished'] and st['mission']==op,st
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='operation-complete')>=3,ev
    assert sum(1 for e in ev if e.get('event')=='pylon-down')>=9,ev
    assert any(e.get('event')=='campaign-complete' for e in ev),ev
    st=page.evaluate('window.__aegisVerge.state()')
    assert st['unlocked']==3 and all(x>0 for x in st['best']),st
    assert not errs,errs
    browser.close()
print(json.dumps({'renderer':renderer,'operations':3,'pylons':9,'movement':'pass','pulse':'pass','touchWidth390':'pass','campaign':'pass','persistence':'pass','telemetry':'pass'}))
