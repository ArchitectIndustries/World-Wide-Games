from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
base=(ROOT/'game.html').read_text(); games_js=(ROOT/'js/games.js').read_text(); page_js=(ROOT/'js/game-page.js').read_text()
page_js=page_js.replace("id=new URLSearchParams(location.search).get('id')","id='rift-relay'")
store="""<script>const __store={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,setItem:(k,v)=>__store[k]=String(v),removeItem:k=>delete __store[k]},configurable:true});</script>"""
h=base.replace('<link rel="stylesheet" href="assets/styles.css"/>','').replace('<script src="js/games.js"></script>',f'<script>{games_js}</script>').replace('<script src="js/game-page.js"></script>',f'<script>{page_js}</script>')
h=h.replace('<body class="game-detail-page">','<body class="game-detail-page">'+store)
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1100,'height':800}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(h,wait_until='domcontentloaded',timeout=8000)
    frame=p.locator('#gameFrame')
    src="""<script>setTimeout(()=>{parent.postMessage({type:'wwg:game-event',gameId:'rift-relay',event:'compat-id',score:321},'*');parent.postMessage({type:'wwg:game-event',game:'rift-relay',event:'compat-legacy',score:654},'*')},30)</script>"""
    frame.evaluate('(el,src)=>el.setAttribute("srcdoc",src)',src)
    p.wait_for_timeout(160)
    events=p.evaluate("JSON.parse(localStorage.getItem('wwg:events')||'{}')")
    scores=p.evaluate("JSON.parse(localStorage.getItem('wwg:scores')||'{}')")
    hist=p.evaluate("JSON.parse(localStorage.getItem('wwg:run-history')||'[]')")
    assert events.get('rift-relay:compat-id')==1,events
    assert events.get('rift-relay:compat-legacy')==1,events
    assert scores.get('rift-relay')==654,scores
    assert len(hist)>=2,hist
    assert not errs,errs
    b.close()
print(json.dumps({'gameIdEvent':'pass','legacyGameEvent':'pass','scoreBridge':'pass'}))
