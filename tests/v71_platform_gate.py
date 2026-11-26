from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json, subprocess

ROOT=Path(__file__).resolve().parents[1]
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True))
base=(ROOT/'game.html').read_text(); games_js=(ROOT/'js/games.js').read_text(); event_rules=(ROOT/'js/event-rules.js').read_text(); page_js=(ROOT/'js/game-page.js').read_text()
PRE="<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})(),configurable:true});</script>"

def detail_doc(slug):
    js=page_js.replace("id=new URLSearchParams(location.search).get('id')",f"id='{slug}'")
    h=base.replace('<link rel="stylesheet" href="assets/styles.css"/>','')
    h=re.sub(r'<script src="js/games\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{games_js}</script>',h)
    h=re.sub(r'<script src="js/event-rules\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{event_rules}</script>',h)
    h=re.sub(r'<script src="js/game-page\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{js}</script>',h)
    h=h.replace('<body class="game-detail-page">','<body class="game-detail-page">'+PRE)
    return h

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for g in games:
        errors.clear(); page.set_content(detail_doc(g['id']),wait_until='domcontentloaded',timeout=5000)
        assert not errors,(g['id'],errors)
        assert page.locator('#gameTitle').inner_text()==g['title'],g['id']
        assert page.locator('#controlsList li').count()>=3,g['id']
        obj=page.locator('#gameObjective').inner_text().strip()
        assert obj.startswith('How to win:') and len(obj)>=40,(g['id'],obj)
        if g.get('remappable'):
            assert not page.locator('#keyboardProfile').evaluate('e=>e.hidden'),g['id']
        else:
            assert page.locator('#keyboardProfile').evaluate('e=>e.hidden'),g['id']
    # Actual platform DOM/CSS at narrow width, with local assets inlined to avoid network dependence.
    home=(ROOT/'index.html').read_text(); css=(ROOT/'assets/styles.css').read_text(); app=(ROOT/'js/app.js').read_text()
    home=home.replace('<link rel=\"stylesheet\" href=\"assets/styles.css\" />',f'<style>{css}</style>')
    home=re.sub(r'<script src=\"js/games\.js(?:\?v\d+)?\"></script>',lambda _:f'<script>{games_js}</script>',home)
    home=re.sub(r'<script src=\"js/app\.js(?:\?v\d+)?\"></script>',lambda _:f'<script>{app}</script>',home)
    home=home.replace('<body>','<body>'+PRE)
    page.set_viewport_size({'width':390,'height':844}); errors.clear(); page.set_content(home,wait_until='domcontentloaded',timeout=8000); page.wait_for_timeout(120)
    assert not errors,errors
    dims=page.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})'); assert dims['sw']<=dims['iw']+2,dims
    assert page.locator('#gameCount').inner_text()==str(len(games))
    assert page.locator('#gameGrid .game-card').count()==len(games)
    browser.close()
print(json.dumps({'detailPages':len(games),'objectivePanels':len(games),'remappableProfiles':sum(bool(g.get('remappable')) for g in games),'homepageCards':len(games),'homepageMobile':dims,'pageErrors':0}))
