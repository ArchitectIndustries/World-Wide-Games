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
src=(ROOT/'games/skyvault-cartographer/index.html').read_text()
src=src.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
src=src.replace('<script src="../../assets/wwg-webgl.js"></script>',f'<script>{ENGINE}</script>')
i=src.lower().find('<script')
src=src[:i]+PRE+src[i:]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(src,wait_until='domcontentloaded',timeout=10000);page.wait_for_timeout(180)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__skyvaultCartographer.engineReady()') is True
    renderer=page.evaluate('engine.mode');assert renderer in ('webgl2','canvas2d')
    page.evaluate('window.__skyvaultCartographer.start()');page.wait_for_timeout(20)
    st=page.evaluate('window.__skyvaultCartographer.state()');assert st['active'] and st['mission']==0 and st['beacons']==0
    yaw0=st['yaw'];page.keyboard.down('ArrowRight');page.evaluate('update(.12)');page.keyboard.up('ArrowRight');assert page.evaluate('window.__skyvaultCartographer.state().yaw')>yaw0
    pitch0=page.evaluate('window.__skyvaultCartographer.state().pitch');page.keyboard.down('KeyI');page.evaluate('update(.12)');page.keyboard.up('KeyI');assert page.evaluate('window.__skyvaultCartographer.state().pitch')>pitch0
    e0=page.evaluate('window.__skyvaultCartographer.state().energy');page.keyboard.down('Space');page.evaluate('update(.18)');page.keyboard.up('Space');assert page.evaluate('window.__skyvaultCartographer.state().energy')<e0
    page.evaluate('paused=true;window.__skyvaultCartographer.teleportBeacon()');page.keyboard.down('KeyH');page.evaluate('scanTick(.75)');page.keyboard.up('KeyH');assert page.evaluate('window.__skyvaultCartographer.state().beacons')==1
    page.evaluate('window.__skyvaultCartographer.teleportBeacon()');page.keyboard.down('KeyE');page.evaluate('scanTick(.75)');page.keyboard.up('KeyE');assert page.evaluate('window.__skyvaultCartographer.state().beacons')==2
    page.evaluate('paused=false;window.__skyvaultCartographer.impact()');assert page.evaluate('window.__skyvaultCartographer.state().impacts')==1
    for route in range(3):
        if route>0:
            page.locator('#continue').click();page.wait_for_timeout(20)
        # Freeze autonomous forward flight while exercising deterministic survey helpers.
        # Otherwise the real RAF loop can move the craft between synchronous helper calls
        # and introduce unrelated boundary impacts on slower CI workers.
        page.evaluate('paused=true')
        while page.evaluate('window.__skyvaultCartographer.state().beacons')<5:
            page.evaluate('window.__skyvaultCartographer.scanCurrent()')
        page.evaluate('window.__skyvaultCartographer.teleportExit();paused=false;update(.01)')
        st=page.evaluate('window.__skyvaultCartographer.state()');assert st['finished'] and st['mission']==route,st
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='mission-complete')>=3,ev
    assert sum(1 for e in ev if e.get('event')=='beacon-surveyed')>=15,ev
    assert any(e.get('event')=='campaign-complete' for e in ev),ev
    assert any(e.get('event')=='clean-survey' for e in ev),ev
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:skyvault-cartographer:meta-v1'))")
    assert meta['unlocked']==3 and meta['clears']>=1 and all(x>0 for x in meta['best']),meta
    assert not errs,errs
    browser.close()
print(json.dumps({'renderer':renderer,'routes':3,'beacons':15,'universalControls':'pass','customRemap':'pass','boostFallback':'pass','scanFallback':'pass','touchWidth390':'pass','campaign':'pass','persistence':'pass','telemetry':'pass'}))
