from pathlib import Path
import json,subprocess,re
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True)); base=(ROOT/'game.html').read_text(); games_js=(ROOT/'js/games.js').read_text(); page_js=(ROOT/'js/game-page.js').read_text()
PRE="<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})(),configurable:true});</script>"
def doc(slug):
    js=page_js.replace("id=new URLSearchParams(location.search).get('id')",f"id='{slug}'")
    h=base.replace('<link rel="stylesheet" href="assets/styles.css"/>','').replace('<script src="js/games.js"></script>',f'<script>{games_js}</script>').replace('<script src="js/game-page.js"></script>',f'<script>{js}</script>')
    return h.replace('<body class="game-detail-page">','<body class="game-detail-page">'+PRE)
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1280,'height':900})
    for g in games:
        p.set_content(doc(g['id']),wait_until='domcontentloaded',timeout=8000)
        assert p.locator('#controlsList li').count()>=3,g['id']
        if g.get('remappable'):
            assert not p.locator('#keyboardProfile').evaluate('e=>e.hidden'),g['id']
            txt=p.locator('#keyboardProfile').inner_text()
            for token in ['Up','W','Down','S','Left','A','Right','D','Primary','Space','Secondary','E']:
                assert token in txt,(g['id'],token,txt)
        else:
            assert p.locator('#keyboardProfile').evaluate('e=>e.hidden'),g['id']
    p.set_content(doc('tessera-commons'),wait_until='domcontentloaded')
    txt=p.locator('#controlsList').inner_text()
    assert 'Space default' in txt and 'E default' in txt and 'W/A/S/D defaults' in txt,txt
    b.close()
print(json.dumps({'gameDetailControlPages':len(games),'remappableProfiles':sum(bool(g.get('remappable')) for g in games),'representativeExpansion':'tessera-commons'}))
