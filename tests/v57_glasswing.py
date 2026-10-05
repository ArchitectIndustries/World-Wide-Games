from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'games/glasswing-polo/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in ['meta-v2','RIVALS','activateDrive','wingdrive-activated','bank-goal','circuit-complete','window.__glasswing','ShiftRight']:
    assert token in SRC, token
PRE="""<script>const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'})};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};window.requestAnimationFrame=()=>0;</script>"""
h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
i=h.lower().find('<script'); h=h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(h,wait_until='domcontentloaded',timeout=8000)
    assert not errs and p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    st=p.evaluate('window.__glasswing.state()'); assert st['mode']=='circuit' and st['stage']==0
    p.evaluate("window.__glasswing.setMode('local')"); x1=p.evaluate('window.__glasswing.state().p1.x'); x2=p.evaluate('window.__glasswing.state().p2.x')
    p.keyboard.down('ArrowRight'); p.evaluate('window.__glasswing.step(.12)'); p.keyboard.up('ArrowRight'); st=p.evaluate('window.__glasswing.state()')
    assert abs(st['p1']['x']-x1)<0.6 and st['p2']['x']>x2+1
    x1=st['p1']['x']; p.keyboard.down('KeyL'); p.evaluate('window.__glasswing.step(.12)'); p.keyboard.up('KeyL'); assert p.evaluate('window.__glasswing.state().p1.x')>x1+1
    p.evaluate("window.__glasswing.setMode('circuit')"); p.evaluate('window.__glasswing.addCharge(100)'); p.keyboard.press('KeyH'); st=p.evaluate('window.__glasswing.state()')
    assert st['p1']['drive']==0 and st['p1']['driveTime']>3.8 and any(e.get('event')=='wingdrive-activated' for e in p.evaluate('window.__events'))
    p.evaluate('window.__glasswing.scoreGoal(1,true)'); st=p.evaluate('window.__glasswing.state()'); assert st['s1']==1 and st['meta']['bankGoals']>=1
    p.evaluate('window.__glasswing.scoreGoal(1,false)'); p.evaluate('window.__glasswing.scoreGoal(1,false)'); assert p.evaluate('window.__glasswing.state().done') is True
    assert p.evaluate('window.__glasswing.continueAfterMatch()') is True
    for stage in (1,2):
        for _ in range(3): p.evaluate('window.__glasswing.scoreGoal(1,false)')
        if stage==1: assert p.evaluate('window.__glasswing.continueAfterMatch()') is True
    st=p.evaluate('window.__glasswing.state()'); assert st['meta']['circuitClears']>=1 and st['meta']['wins']>=3
    assert any(e.get('event')=='circuit-complete' for e in p.evaluate('window.__events'))
    saved=p.evaluate("JSON.parse(localStorage.getItem('wwg:glasswing-polo:meta-v2'))"); assert saved['circuitClears']>=1 and saved['bankGoals']>=1 and saved['drives']>=1
    p.evaluate("window.__glasswing.setMode('ai')"); p.keyboard.press('KeyP'); assert p.evaluate('window.__glasswing.state().paused') is True; p.keyboard.press('KeyP'); assert p.evaluate('window.__glasswing.state().paused') is False
    assert not errs; b.close()
print(json.dumps({'version':'2.0','rivals':3,'wingdrive':'pass','bankGoal':'pass','circuit':'pass','localControlIsolation':'pass','persistence':'pass','pause':'pass','mobileOverflow':'pass'}))
