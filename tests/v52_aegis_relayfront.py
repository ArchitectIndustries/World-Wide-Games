from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
ENGINE=(ROOT/'assets/wwg-webgl.js').read_text()
PRE='''<script>
const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'}),'wwg:aegis-verge:meta-v1':JSON.stringify({unlocked:3,best:[1200,2300,3400],clears:2})};
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
    renderer=page.evaluate('engine.mode');assert renderer in ('webgl2','canvas2d')
    st=page.evaluate('window.__aegisVerge.state()');assert st['unlocked']==3 and st['best'][:3]==[1200,2300,3400],st
    page.evaluate('window.__aegisVerge.start()');page.wait_for_timeout(20)
    x0=page.evaluate('window.__aegisVerge.state().x');page.keyboard.down('ArrowRight');page.evaluate('update(.25)');page.keyboard.up('ArrowRight');assert page.evaluate('window.__aegisVerge.state().yaw')!=0
    z0=page.evaluate('window.__aegisVerge.state().z');page.keyboard.down('KeyI');page.evaluate('update(.3)');page.keyboard.up('KeyI');assert page.evaluate('window.__aegisVerge.state().z')!=z0
    page.keyboard.press('Space');page.evaluate('update(.01)');assert page.evaluate('window.__aegisVerge.state().shots')>=1
    e0=page.evaluate('window.__aegisVerge.state().energy');page.keyboard.down('KeyE');page.evaluate('update(.12)');page.keyboard.up('KeyE');assert page.evaluate('window.__aegisVerge.state().energy')<e0
    page.evaluate('window.__aegisVerge.damage(8,true)');assert page.evaluate('window.__aegisVerge.state().clean') is True
    page.evaluate('window.__aegisVerge.damage(1,false)');assert page.evaluate('window.__aegisVerge.state().clean') is False
    page.evaluate('window.__aegisVerge.resetOperation(0)')
    for op in range(3):
        if op>0:
            page.evaluate(f'window.__aegisVerge.resetOperation({op})')
        for relay in range(3):
            page.evaluate('window.__aegisVerge.clearWave();window.__aegisVerge.teleportRelay();window.__aegisVerge.captureCurrent()')
        page.evaluate('window.__aegisVerge.teleportExit();update(.02)')
        st=page.evaluate('window.__aegisVerge.state()');assert st['finished'] and st['op']==op,st
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='relay-secured')>=9,ev
    assert sum(1 for e in ev if e.get('event')=='operation-complete')>=3,ev
    assert any(e.get('event')=='campaign-complete' for e in ev),ev
    assert any(e.get('event')=='untouched-verge' for e in ev),ev
    meta=page.evaluate("JSON.parse(localStorage.getItem('wwg:aegis-verge:meta-v1'))")
    assert meta['unlocked']==3 and meta['clears']>=3 and all(x>0 for x in meta['best']),meta
    assert not errs,errs
    browser.close()
print(json.dumps({'renderer':renderer,'version':'1.1','operations':3,'relays':9,'v1SaveMigration':'pass','universalControls':'pass','customRemap':'pass','actionFallbacks':'pass','shield':'pass','campaign':'pass','persistence':'pass','legacyAchievementEvent':'pass','touchWidth390':'pass'}))
