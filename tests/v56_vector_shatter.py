from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'games/vector-shatter/index.html').read_text(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in ['meta-v2','meta-v1','activateReactor','reactorTime=6','prism-reactor-destroyed','core-exposed','LEGACY_META','touchReactor','window.__vectorShatter']:
    assert token in SRC,token
chunk=SRC.split('const LEVELS=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([.123P]+)'",chunk); expected=[4,5,5,6,7]; levels=[];i=0
for n in expected: levels.append(rows[i:i+n]); i+=n
assert len(levels)==5 and i==len(rows)
PRE="""<script>const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'}),'wwg:vector-shatter:meta-v1':JSON.stringify({best:7000,clears:2,bestSector:5,powerups:9})};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>'); i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(100)
    assert not errs,errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert p.evaluate('window.__vectorShatter.state().meta.best')==7000
    p.evaluate('window.__vectorShatter.start()')
    x0=p.evaluate('window.__vectorShatter.state().paddleX'); p.keyboard.down('ArrowRight'); p.evaluate('window.__vectorShatter.step(.08)'); p.keyboard.up('ArrowRight'); assert p.evaluate('window.__vectorShatter.state().paddleX')>x0
    p.evaluate('window.__vectorShatter.addCharge(100)'); assert p.evaluate('window.__vectorShatter.state().reactor')==100
    assert p.evaluate('window.__vectorShatter.activateReactor()') is True
    st=p.evaluate('window.__vectorShatter.state()'); assert st['reactor']==0 and st['reactorTime']>5.8 and st['balls']>=3 and st['power']['pierce']>0,st
    ev=p.evaluate('window.__events'); assert any(e.get('event')=='reactor-activated' for e in ev),ev
    p.evaluate('window.__vectorShatter.addCharge(100)'); p.keyboard.press('KeyH'); assert p.evaluate('window.__vectorShatter.state().reactor')==0
    p.evaluate('window.__vectorShatter.setSector(4)'); st=p.evaluate('window.__vectorShatter.state()'); assert st['core']['hp']==14 and st['brickCount']>0
    x=p.evaluate('window.__vectorShatter.state().core.x'); p.evaluate('window.__vectorShatter.step(.5)'); assert p.evaluate('window.__vectorShatter.state().core.x')!=x
    p.evaluate('window.__vectorShatter.forcePanels()'); assert p.evaluate('window.__vectorShatter.state().brickCount')==0
    for _ in range(14): p.evaluate("window.__vectorShatter.damageCore({vy:-420,x:480,y:72})")
    st=p.evaluate('window.__vectorShatter.state()'); assert st['finished'] and st['core']['alive'] is False,st
    ev=p.evaluate('window.__events'); assert any(e.get('event')=='prism-reactor-destroyed' for e in ev) and any(e.get('event')=='campaign-complete' for e in ev),ev
    m2=p.evaluate("JSON.parse(localStorage.getItem('wwg:vector-shatter:meta-v2'))"); m1=p.evaluate("JSON.parse(localStorage.getItem('wwg:vector-shatter:meta-v1'))")
    assert m2['coreClears']>=1 and m2['reactors']>=2 and m1['coreClears']>=1
    p.evaluate('window.__vectorShatter.setSector(0)'); p.keyboard.press('KeyP'); assert p.evaluate('window.__vectorShatter.state().paused') is True; p.keyboard.press('KeyP'); assert p.evaluate('window.__vectorShatter.state().paused') is False
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2') and not errs,errs
    b.close()
print(json.dumps({'version':'2.0','sectors':5,'reactor':'pass','secondaryActivation':'pass','finalCore':'pass','legacyMigration':'pass','persistence':'pass','pause':'pass','mobileOverflow':'pass'}))
