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
    page.evaluate('window.__aegisVerge.hit();window.__aegisVerge.hit();window.__aegisVerge.hit()')
    page.evaluate('window.__aegisVerge.pulse()')
    before=page.evaluate('window.__aegisVerge.state()')
    assert before['hull']<=70 and before['energy']<100,before
    page.evaluate('window.__aegisVerge.killDrone(0)')
    drops=page.evaluate('window.__aegisVerge.state().pickups')
    assert drops and drops[0]['type']=='repair',drops
    page.evaluate('window.__aegisVerge.collectPickup(0)')
    after_repair=page.evaluate('window.__aegisVerge.state()')
    assert after_repair['hull']>before['hull'],(before,after_repair)
    page.evaluate('window.__aegisVerge.killDrone(2)')
    drops=page.evaluate('window.__aegisVerge.state().pickups')
    assert drops and drops[0]['type']=='energy',drops
    e0=after_repair['energy']
    page.evaluate('window.__aegisVerge.collectPickup(0)')
    after_energy=page.evaluate('window.__aegisVerge.state()')
    assert after_energy['energy']>e0,(e0,after_energy)
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='pickup-drop')>=2,ev
    assert any(e.get('event')=='pickup-repair' for e in ev),ev
    assert any(e.get('event')=='pickup-energy' for e in ev),ev
    assert not errs,errs
    browser.close()
print(json.dumps({'renderer':renderer,'repairDrop':'pass','energyDrop':'pass','collection':'pass','telemetry':'pass','touchWidth390':'pass'}))
