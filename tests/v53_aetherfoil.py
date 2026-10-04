from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
src=(ROOT/'games/aetherfoil-circuit/index.html').read_text()
src=src.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(src,wait_until='domcontentloaded',timeout=10000)
    page.wait_for_timeout(150)
    page.evaluate("window.__events=[];addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)})")
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert page.evaluate('window.__aetherfoil.engineReady()') is True
    page.evaluate('window.__aetherfoil.start()')
    initial=page.evaluate('window.__aetherfoil.state()')
    assert initial['phase']=='play' and initial['boutIndex']==0 and initial['ps']==0
    # Real action path: after the opening ready beat, a parry costs stamina.
    page.evaluate('window.__aetherfoil.step(.7)')
    assert page.evaluate('window.__aetherfoil.parry()') is True
    after_parry_press=page.evaluate('window.__aetherfoil.state()')
    assert after_parry_press['player']['stamina'] < initial['player']['stamina']
    # Reset then force a deterministic rival lunge into the active parry window.
    page.evaluate('window.__aetherfoil.startBout(0)')
    assert page.evaluate('window.__aetherfoil.forceParry()') is True
    riposte=page.evaluate('window.__aetherfoil.state()')
    assert riposte['player']['counter']>0 and riposte['parries']==1, riposte
    # Clear all three bouts through the same touch-award/finish flow.
    for bout in range(3):
        state=page.evaluate('window.__aetherfoil.state()')
        assert state['boutIndex']==bout and state['phase']=='play', state
        for _ in range(3):
            page.evaluate("window.__aetherfoil.forceTouch('player')")
        state=page.evaluate('window.__aetherfoil.state()')
        if bout<2:
            assert state['phase']=='between-win', state
            page.evaluate('window.__aetherfoil.continueFlow()')
        else:
            assert state['phase']=='campaign', state
    saved=page.evaluate('window.__aetherfoil.save()')
    assert saved['unlocked']==2 and saved['clears']>=1 and saved['best']>0, saved
    ev=page.evaluate('window.__events')
    assert sum(1 for e in ev if e.get('event')=='bout-complete' and e.get('meta',{}).get('won'))==3, ev
    assert any(e.get('event')=='parry' for e in ev), ev
    assert any(e.get('event')=='campaign-complete' for e in ev), ev
    # Restart and pause controls remain live after a campaign clear.
    page.evaluate('window.__aetherfoil.start()')
    page.keyboard.press('KeyP'); assert page.evaluate('window.__aetherfoil.state().paused') is True
    page.keyboard.press('KeyP'); assert page.evaluate('window.__aetherfoil.state().paused') is False
    page.keyboard.press('KeyR'); assert page.evaluate('window.__aetherfoil.state().phase')=='play'
    assert not errs, errs
    browser.close()
print(json.dumps({'engine':'canvas2d','parryRiposte':'pass','threeBoutCampaign':'pass','persistence':'pass','telemetry':'pass','pauseRestart':'pass','touchWidth390':'pass'}))
