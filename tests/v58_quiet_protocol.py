from playwright.sync_api import sync_playwright
from pathlib import Path
import json
from quiet_fixture_instrument import instrument
ROOT=Path(__file__).resolve().parents[1]
INPUT=(ROOT/'assets/wwg-input.js').read_text()
GAME=instrument((ROOT/'games/quiet-protocol/index.html').read_text())
MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyE'}
store={'wwg:keymap':json.dumps(MAP)}
pre=f"<script>const __store={json.dumps(store)};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,setItem:(k,v)=>__store[k]=String(v),removeItem:k=>delete __store[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
HTML=GAME.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>{pre}')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1000,'height':700}); errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded'); page.wait_for_timeout(100)
    assert page.evaluate('!!window.__quietProtocol && __quietProtocol.engineReady()') and not errors,errors
    st=page.evaluate('__quietProtocol.state()'); assert st['missionIndex']==0 and st['relayTotal']==3 and st['jammers']==2
    before=page.evaluate('__quietProtocol.playerInfo().x'); page.keyboard.down('KeyL'); page.wait_for_timeout(160); page.keyboard.up('KeyL'); assert page.evaluate('__quietProtocol.playerInfo().x')>before
    page.evaluate("__quietProtocol.placeAtRelay(0)")
    page.keyboard.down("KeyE")
    for _ in range(4): page.evaluate('__quietProtocol.step(.35)')
    page.keyboard.up("KeyE")
    assert page.evaluate('__quietProtocol.state().relayCount')==1
    page.keyboard.press('KeyF'); assert page.evaluate('__quietProtocol.state().cloaked') is True
    page.keyboard.press('KeyQ'); assert page.evaluate('__quietProtocol.state().jammers')==1
    page.keyboard.press('KeyP'); assert page.evaluate('__quietProtocol.state().paused') is True; page.keyboard.press('KeyP')
    for idx in range(3):
        page.evaluate(f'__quietProtocol.loadMission({idx})'); assert page.evaluate('__quietProtocol.forceComplete()') is True
    save=page.evaluate('__quietProtocol.save()'); assert save['unlocked']==2 and save['clears']>=1 and save['clean']>=3,save
    events=page.evaluate('__events.map(e=>e.event)'); assert 'campaign-complete' in events and events.count('clean-mission')>=3,events
    page.close()
    page=browser.new_page(viewport={'width':390,'height':760}); mobile_errors=[]; page.on('pageerror',lambda e: mobile_errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded'); page.wait_for_timeout(100)
    assert page.evaluate('!!window.__quietProtocol && __quietProtocol.engineReady()') and not mobile_errors,mobile_errors
    assert page.locator('.mobile').evaluate("e=>getComputedStyle(e).display")=='grid'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
    browser.close()
print('PASS v58 Quiet Protocol 2.0: campaign, hacking, cloak, jammer, remap, pause, persistence, telemetry, mobile')
