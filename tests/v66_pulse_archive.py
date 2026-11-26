from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'games/pulse-archive/index.html'
PRE = """<script>window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"""

def instrumented_html():
    src = GAME.read_text(errors='ignore')
    i = src.lower().find('<script>')
    return src[:i] + PRE + src[i:]

def force_result(page, hits, judged):
    page.evaluate("""([h,j])=>{
      window.__events=[];
      score=0;combo=0;hits=h;judged=j;
      notes=[{lane:0,time:-1,hit:true,miss:false}];
      start=performance.now()-5000;ended=false;cleared=false;
    }""", [hits, judged])
    page.wait_for_timeout(180)
    return page.evaluate("()=>({ended,cleared,hits,judged,events:window.__events,score:Number(document.querySelector('#score').textContent.replace(/,/g,'')),acc:document.querySelector('#acc').textContent})")

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width':960,'height':700})
    errors=[]; console=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console.append(m.text) if m.type=='error' else None)
    page.set_content(instrumented_html(), wait_until='domcontentloaded')
    page.wait_for_timeout(40)

    # Historical false-clear path: zero accuracy must not emit archive-cleared.
    zero = force_result(page, 0, 10)
    assert zero['ended'] and not zero['cleared'], zero
    assert zero['events'] and zero['events'][-1]['event']=='archive-desynced', zero
    assert not [e for e in zero['events'] if e['event']=='archive-cleared'], zero
    assert zero['acc']=='0%', zero
    assert zero['events'][-1]['meta']['accuracy']==0, zero

    # Below threshold remains a failed synchronization.
    low = force_result(page, 6, 10)
    assert not low['cleared'] and low['events'][-1]['event']=='archive-desynced', low
    assert low['acc']=='60%', low

    # Published 70% threshold clears and preserves completion telemetry.
    good = force_result(page, 7, 10)
    assert good['cleared'] and good['events'][-1]['event']=='archive-cleared', good
    assert good['acc']=='70%' and good['events'][-1]['meta']['accuracy']==70, good

    assert not errors and not console, (errors, console)
    page.close()

    # Real keyboard timing path still records a hit in a fresh document.
    page = browser.new_page(viewport={'width':960,'height':700})
    errors=[]; console=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console.append(m.text) if m.type=='error' else None)
    page.set_content(instrumented_html(), wait_until='domcontentloaded'); page.wait_for_timeout(30)
    page.evaluate("()=>{score=combo=hits=judged=0;notes=[{lane:0,time:.05,hit:false,miss:false}];start=performance.now()-50;ended=false;cleared=false;updateHud()}")
    page.keyboard.press('d'); page.wait_for_timeout(20)
    live = page.evaluate("()=>({hits,judged,hit:notes[0].hit,score,acc:document.querySelector('#acc').textContent})")
    assert live['hits']==1 and live['judged']==1 and live['hit'] and live['score']>0 and live['acc']=='100%', live

    # Narrow viewport: lane buttons remain accessible and no horizontal overflow.
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(20)
    mobile = page.evaluate("""()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,buttons:[...document.querySelectorAll('[data-lane]')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,l:r.left,r:r.right}})})""")
    assert mobile['sw'] <= mobile['iw'] + 2, mobile
    assert len(mobile['buttons'])==4 and all(b['w']>60 and b['h']>=60 and b['l']>=0 and b['r']<=mobile['iw']+1 for b in mobile['buttons']), mobile
    assert not errors and not console, (errors, console)
    browser.close()

print({'pulseArchive12':'pass','zeroHitFalseClear':'blocked','threshold':'70%','keyboard':'pass','mobile':'pass'})
