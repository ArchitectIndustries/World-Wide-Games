from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); HTML=(ROOT/'games/circuit-rush/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];Object.defineProperty(window,'parent',{value:{postMessage:(m)=>{if(m&&m.type==='wwg:game-event')window.__events.push(m)}},configurable:true});</script>"""
i=HTML.lower().find('<script');HTML=HTML[:i]+PRE+HTML[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1100,'height':720});p.set_content(HTML);p.wait_for_timeout(80)
    assert p.evaluate('CP.length')==8 and p.evaluate('rivals.length')==3
    assert p.locator('#lap').inner_text()=='1/3' and p.locator('#place').inner_text().endswith('/4')
    # Shared keyboard input drives throttle and steering flags.
    p.keyboard.down('ArrowUp'); assert p.evaluate('keys.up') is True; p.keyboard.up('ArrowUp'); assert p.evaluate('keys.up') is False
    # Pause and resume preserve the race state.
    p.keyboard.press('KeyP'); assert p.evaluate('paused') is True; p.keyboard.press('KeyP'); assert p.evaluate('paused') is False
    # Boost pad materially changes velocity.
    p.evaluate('car.x=CP[2].x;car.y=CP[2].y;car.v=100;boostLock={};checkBoosts(performance.now())'); assert p.evaluate('car.v')>100
    # Traverse every ordered checkpoint for three laps, proving lap gate state and completion events.
    p.evaluate("""(()=>{let t=start+1000;while(!finished&&t<start+30000){const q=CP[nextCP];car.x=q.x;car.y=q.y;hitCheckpoint(t);t+=250}})()""")
    assert p.evaluate('finished') is True
    events=p.evaluate('window.__events'); names=[e['event'] for e in events]
    assert 'race-complete' in names and 'race-won' in names
    e=[e for e in events if e['event']=='race-complete'][-1]; assert e['meta']['place']==1 and e['score']>0
    p.close();b.close()
print({'circuit-rush':'ordered checkpoints + rivals + boost + pause + podium event'})
