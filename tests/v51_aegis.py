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
src=(ROOT/'games/aegis-verge/index.html').read_text()
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
    assert page.evaluate('window.__aegisVerge.engineReady()') is True
    renderer=page.evaluate('engine.mode'); assert renderer in ('webgl2','canvas2d')
    page.evaluate('window.__aegisVerge.start()'); page.wait_for_timeout(20)
    st=page.evaluate('window.__aegisVerge.state()'); assert st['active'] and st['op']==0 and st['relay']==0 and st['hostiles']>0
    yaw0=st['yaw'];page.keyboard.down('ArrowLeft');page.evaluate('update(.18)');page.keyboard.up('ArrowLeft');assert page.evaluate('window.__aegisVerge.state().yaw')>yaw0
    z0=page.evaluate('window.__aegisVerge.state().z');page.keyboard.down('KeyI');page.evaluate('update(.22)');page.keyboard.up('KeyI');assert page.evaluate('window.__aegisVerge.state().z')>z0
    page.evaluate('cool=0;shots=[]');page.keyboard.press('Space');assert page.evaluate('window.__aegisVerge.state().shots')>=1
    h0=page.evaluate('window.__aegisVerge.state().hull');page.keyboard.down('KeyH');page.evaluate('window.__aegisVerge.damage(20,true)');page.keyboard.up('KeyH');h1=page.evaluate('window.__aegisVerge.state().hull');assert h0-h1<8
    page.keyboard.down('KeyE');page.evaluate('window.__aegisVerge.damage(20,true)');page.keyboard.up('KeyE');h2=page.evaluate('window.__aegisVerge.state().hull');assert h1-h2<8
    for operation in range(3):
        if operation>0:
            page.locator('#continue').click();page.wait_for_timeout(20)
        for _ in range(3):
            page.evaluate('window.__aegisVerge.clearWave()')
            assert page.evaluate('window.__aegisVerge.captureCurrent()') is True
        page.evaluate('window.__aegisVerge.teleportExit();update(.01)')
        st=page.evaluate('window.__aegisVerge.state()');assert st['finished'] and st['op']==operation,st
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='relay-secured')>=9,ev
    assert sum(1 for e in ev if e.get('event')=='operation-complete')>=3,ev
    assert any(e.get('event')=='campaign-complete' for e in ev),ev
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:aegis-verge:meta-v1'))")
    assert meta['unlocked']==3 and meta['clears']>=1 and all(x>0 for x in meta['best']),meta
    assert not errs,errs
    browser.close()
print(json.dumps({'renderer':renderer,'operations':3,'relays':9,'universalControls':'pass','customRemap':'pass','fireFallback':'pass','shieldFallback':'pass','touchWidth390':'pass','campaign':'pass','persistence':'pass','telemetry':'pass'}))
