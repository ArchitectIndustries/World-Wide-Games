from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT = Path('.').resolve()
GAME = ROOT / 'games/aetherglass-breaker/index.html'
INPUT = (ROOT / 'assets/wwg-input.js').read_text()

def page_source():
    html = GAME.read_text().replace(
        '<script src="../../assets/wwg-input.js"></script>',
        f'<script>{INPUT}</script>'
    )
    shim = """<script>
const __s={'wwg:keymap':JSON.stringify({up:'KeyI',down:'KeyK',left:'KeyJ',right:'KeyL',primary:'KeyF',secondary:'KeyH'})};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});
window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};
</script>"""
    i = html.lower().find('<script')
    return html[:i] + shim + html[i:]

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-gpu'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content(page_source(), wait_until='domcontentloaded', timeout=10000)
    page.wait_for_timeout(70)
    assert page.evaluate('STAGES.length') == 6
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    page.locator('#overlayPrimary').click()
    page.evaluate('cancelAnimationFrame(raf)')
    assert page.evaluate('[mode,stage,bricks.length,balls[0].stuck]') == ['ready', 1, 40, True]

    x0 = page.evaluate('paddle.x')
    page.keyboard.down('ArrowRight'); page.evaluate('update(.12,1000)'); page.keyboard.up('ArrowRight')
    x1 = page.evaluate('paddle.x'); assert x1 > x0
    page.keyboard.down('KeyL'); page.evaluate('update(.12,1100)'); page.keyboard.up('KeyL')
    assert page.evaluate('paddle.x') > x1
    page.keyboard.press('KeyF')
    assert page.evaluate('mode') == 'playing' and page.evaluate('balls[0].stuck') is False

    focus = page.evaluate("()=>{balls=[{x:400,y:400,r:8,vx:100,vy:-100,stuck:false}];mode='playing';focus=50;keys.focus=true;updateBalls(.2);return [balls[0].x,focus]}")
    assert 409 < focus[0] < 412 and focus[1] < 50
    power = page.evaluate("()=>{applyPower('shield');const s=shield;balls=[makeBall(false)];applyPower('multi');applyPower('wide');return [s,balls.length,paddle.w]}")
    assert power[0] == 1 and power[1] >= 3 and power[2] > 132

    event = page.evaluate("()=>{buildStage(1);window.__events.length=0;const q={x:100,y:100,r:8,vx:1,vy:-1,stuck:false};for(const b of bricks.slice(0,8))hitBrick(b,q);return [combo,bestCombo,window.__events.map(e=>e.event)]}")
    assert event[0] >= 8 and event[1] >= 8 and 'combo-master' in event[2]
    types = page.evaluate("()=>{buildStage(6);return [bricks.filter(b=>b.kind==='move').length,bricks.filter(b=>b.kind==='core').length,Math.max(...bricks.filter(b=>b.kind==='core').map(b=>b.maxHp))]}")
    assert types[0] > 0 and types[1] > 0 and types[2] == 3

    page.evaluate("window.__events.length=0;score=0;lives=3;focus=0;buildStage(1)")
    for chamber in range(1, 7):
        state = page.evaluate("()=>{for(const b of bricks)b.hp=0;checkStageClear();return [stage,mode,furthest,clears]}")
        assert state[0] == chamber
        if chamber < 6:
            assert state[1] == 'stageclear'; page.evaluate('advanceStage()')
        else:
            assert state[1] == 'complete' and state[2] == 6 and state[3] >= 1
    events = page.evaluate('window.__events.map(e=>e.event)')
    assert events.count('stage-complete') == 6 and 'campaign-complete' in events

    page.evaluate("buildStage(2);score=321;stageEntryScore=111;lives=2;stageEntryLives=3")
    page.keyboard.press('KeyP'); assert page.evaluate('paused') is True
    page.keyboard.press('KeyP'); page.keyboard.press('KeyR')
    assert page.evaluate('[score,lives,mode]') == [111, 3, 'ready']
    page.dispatch_event('[data-act="left"]', 'pointerdown'); assert page.evaluate('keys.left') is True
    page.dispatch_event('[data-act="left"]', 'pointerup'); assert page.evaluate('keys.left') is False
    assert not errors, errors
    browser.close()

print(json.dumps({'aetherglassBreaker':'pass','sixChambers':'pass','focus':'pass','relics':'pass','comboEvent':'pass','universalMovement':'pass','mobile':'pass'}))
