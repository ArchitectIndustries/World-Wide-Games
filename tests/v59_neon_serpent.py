from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'games/neon-serpent/index.html').read_text(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in ['Neon Serpent 3.1','Crown Coil','meta-v3','navigator.getGamepads','phase-drive','crown-coil-cleared','window.__neonSerpent','AudioContext']:
    assert token in SRC, token
PRE="""<script>const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'}),'wwg:neon-serpent:unlocked':'4','wwg:neon-serpent:bests':JSON.stringify({'1':420})};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const oldPM=window.postMessage.bind(window);window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{oldPM(d,'*')}catch{}};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script')
    return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(120)
    assert not errs,errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    st=p.evaluate('window.__neonSerpent.state()'); assert st['contract']==1 and st['unlocked']>=4 and st['goal']==12,st
    m=p.evaluate('window.__neonSerpent.meta()'); assert int(m['bests']['1'])==420,m
    # Universal arrows still steer even when custom movement remaps exist.
    p.keyboard.press('ArrowDown'); p.evaluate('window.__neonSerpent.tick()'); st=p.evaluate('window.__neonSerpent.state()'); assert st['playing'],st
    # Full Phase Drive consumes charge and emits telemetry.
    before=p.evaluate('window.__neonSerpent.state().phase'); p.keyboard.press('KeyF'); st=p.evaluate('window.__neonSerpent.state()'); assert st['phaseDrive']>0 and st['phase']<before,st
    assert any(e.get('event')=='phase-drive' for e in p.evaluate('window.__events'))
    # Classic Coil stays mechanically pure: no gold bonus, drones, gates, or Crown hazards.
    classic=p.evaluate('window.__neonSerpent.layout()'); assert classic['gold'] is None and not classic['drones'] and not classic['gates'] and not classic['hazards'],classic
    # Legacy progression allows contract 4; direct API seed is deterministic.
    layout_a=p.evaluate("()=>{window.__neonSerpent.start(4,'qa-seed');return window.__neonSerpent.layout()}"); a=p.evaluate('window.__neonSerpent.state().seed'); layout_b=p.evaluate("()=>{window.__neonSerpent.start(4,'qa-seed');return window.__neonSerpent.layout()}"); assert p.evaluate('window.__neonSerpent.state().seed')==a; assert layout_b==layout_a
    # Crown Coil placement is deterministic and collision-critical cells never overlap at spawn.
    p.evaluate("window.__neonSerpent.start(5,'layout-qa')"); layout=p.evaluate('window.__neonSerpent.layout()')
    cells=[]
    for key in ('food','gold'):
        if layout[key]: cells.append((layout[key]['x'],layout[key]['y']))
    cells += [(d['x'],d['y']) for d in layout['drones']]
    cells += [(g[k]['x'],g[k]['y']) for g in layout['gates'] for k in ('a','b')]
    cells += [(h['x'],h['y']) for h in layout['hazards']]
    assert len(cells)==len(set(cells)),layout
    body={(q['x'],q['y']) for q in layout['snake']}; assert not body.intersection(cells),layout
    # Completing contract 4 unlocks the Crown Coil finale and persists v3 + legacy mirrors.
    p.evaluate("window.__neonSerpent.start(4,'qa-seed')")
    p.evaluate('window.__neonSerpent.forceComplete()'); m=p.evaluate('window.__neonSerpent.meta()'); assert m['unlocked']==5,m
    saved=p.evaluate("JSON.parse(localStorage.getItem('wwg:neon-serpent:meta-v3'))"); assert saved['unlocked']==5
    assert p.evaluate("localStorage.getItem('wwg:neon-serpent:unlocked')")=='5'
    # Finale completion emits both finale and campaign telemetry and records crown mastery.
    p.evaluate("window.__neonSerpent.start(5,'crown-qa')"); p.evaluate('window.__neonSerpent.forceComplete()')
    ev=p.evaluate('window.__events'); names=[e.get('event') for e in ev]; assert 'crown-coil-cleared' in names and 'campaign-complete' in names,names
    m=p.evaluate('window.__neonSerpent.meta()'); assert m['crown'] is True,m
    # Pause remains functional on the final contract.
    p.evaluate("window.__neonSerpent.start(5,'pause-qa')"); p.keyboard.press('KeyP'); assert p.evaluate('window.__neonSerpent.state().paused') is True; p.keyboard.press('KeyP'); assert p.evaluate('window.__neonSerpent.state().paused') is False
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2') and not errs,errs
    b.close()
print(json.dumps({'version':'3.1','contracts':5,'legacyMigration':'pass','phaseDrive':'pass','crownFinale':'pass','deterministicSeed':'pass','spawnSafety':'pass','classicPurity':'pass','persistence':'pass','pause':'pass','mobileOverflow':'pass'}))
