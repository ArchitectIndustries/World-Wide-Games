from pathlib import Path
from playwright.sync_api import sync_playwright
from parallax_test_instrument import instrument

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'games/parallax-accord/index.html'
PRE = """<script>(()=>{const s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k])},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});})();</script>"""

def instrumented_html():
    src = GAME.read_text(errors='ignore')
    i = src.lower().find('<script>')
    src = src[:i] + PRE + src[i:]
    return instrument(src)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width':960,'height':700})
    errors=[]; console=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console.append(m.text) if m.type=='error' else None)
    page.set_content(instrumented_html(), wait_until='domcontentloaded')
    page.wait_for_timeout(40)

    # Historical false-win reproduction: one district each, third tied, but player has more total power.
    page.evaluate("()=>{localStorage.clear();window.__events=[];window.__parallaxAccord.newMatch(0,0);window.__parallaxAccord.__setResult([10,1,1],[1,2,1]);window.__parallaxAccord.__finish()}")
    page.wait_for_timeout(20)
    deadlock = page.evaluate("""()=>({state:window.__parallaxAccord.state(),title:document.querySelector('#resultTitle').textContent,text:document.querySelector('#resultText').textContent,events:window.__events.map(e=>e.event)})""")
    assert deadlock['state']['won'] is False and deadlock['state']['draw'] is True, deadlock
    assert deadlock['title']=='Accord deadlocked', deadlock
    assert 'two district wins are required' in deadlock['text'], deadlock
    assert deadlock['events']==['match-deadlocked'], deadlock
    assert deadlock['state']['meta']['furthest']==1 and deadlock['state']['meta']['clears']==0, deadlock

    # Legitimate two-district majority must win even if aggregate power is much lower.
    page.set_content(instrumented_html(), wait_until='domcontentloaded'); page.wait_for_timeout(20)
    page.evaluate("()=>{window.__events=[];window.__parallaxAccord.newMatch(0,0);window.__parallaxAccord.__setResult([2,2,0],[1,1,20]);window.__parallaxAccord.__finish()}")
    page.wait_for_timeout(20)
    win = page.evaluate("""()=>({state:window.__parallaxAccord.state(),title:document.querySelector('#resultTitle').textContent,events:window.__events.map(e=>e.event)})""")
    assert win['state']['won'] is True and win['state']['draw'] is False, win
    assert win['title']=='Delegation defeated', win
    assert win['events']==['match-complete'], win
    assert win['state']['meta']['furthest']==2, win

    # Rival two-district majority remains a real defeat.
    page.set_content(instrumented_html(), wait_until='domcontentloaded'); page.wait_for_timeout(20)
    page.evaluate("()=>{window.__events=[];window.__parallaxAccord.newMatch(0,0);window.__parallaxAccord.__setResult([1,1,20],[2,2,0]);window.__parallaxAccord.__finish()}")
    page.wait_for_timeout(20)
    loss = page.evaluate("""()=>({state:window.__parallaxAccord.state(),title:document.querySelector('#resultTitle').textContent,events:window.__events.map(e=>e.event)})""")
    assert loss['state']['won'] is False and loss['state']['draw'] is False, loss
    assert loss['title']=='Accord rejected' and loss['events']==['match-ended'], loss
    assert loss['state']['meta']['furthest']==1, loss

    # Real keyboard path: choose an affordable card, move district, commit.
    page.set_content(instrumented_html(), wait_until='domcontentloaded'); page.wait_for_timeout(20)
    page.evaluate("()=>{window.__events=[];window.__parallaxAccord.newMatch(0,0)}")
    page.wait_for_timeout(20)
    cards = page.locator('#hand .card')
    affordable = None
    for i in range(cards.count()):
        if not cards.nth(i).is_disabled():
            affordable = i
            break
    assert affordable is not None
    before = page.evaluate("()=>window.__parallaxAccord.state()")
    page.keyboard.press(f'Digit{affordable+1}')
    page.keyboard.press('ArrowRight')
    page.keyboard.press('Enter')
    page.wait_for_timeout(20)
    after = page.evaluate("()=>window.__parallaxAccord.state()")
    assert after['selectedDistrict']==1, (before, after)
    assert after['youTotals'][1] > 0 and after['energy'] < before['energy'], (before, after)

    # Narrow layout remains contained and core actions are usable.
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(20)
    mobile = page.evaluate("""()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,play:document.querySelector('#playBtn').getBoundingClientRect(),end:document.querySelector('#endBtn').getBoundingClientRect(),board:document.querySelector('#board').getBoundingClientRect()})""")
    assert mobile['sw'] <= mobile['iw'] + 2, mobile
    assert mobile['play']['width'] > 70 and mobile['play']['height'] > 30, mobile
    assert mobile['end']['width'] > 70 and mobile['end']['height'] > 30, mobile
    assert mobile['board']['width'] <= mobile['iw'], mobile
    assert not errors and not console, (errors, console)
    browser.close()

print({'parallax11':'pass','falsePowerTiebreak':'blocked','deadlock':'pass','districtMajority':'pass','keyboard':'pass','mobile':'pass'})
