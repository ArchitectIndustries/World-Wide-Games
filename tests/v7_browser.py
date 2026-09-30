from playwright.sync_api import sync_playwright
from pathlib import Path
import base64, re, json
ROOT=Path('.').resolve()
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"""

def data_uri(p):
    b=(ROOT/p).read_bytes(); return 'data:image/svg+xml;base64,'+base64.b64encode(b).decode()

def homepage_html():
    h=(ROOT/'index.html').read_text(); css=(ROOT/'assets/styles.css').read_text(); games=(ROOT/'js/games.js').read_text(); app=(ROOT/'js/app.js').read_text()
    for p in re.findall(r"cover: '([^']+)'",games): games=games.replace(p,data_uri(p))
    h=re.sub(r'<link rel="manifest"[^>]+>','',h)
    h=h.replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>')
    h=h.replace('<script src="js/games.js"></script><script src="js/app.js"></script>',PRE+f'<script>{games}</script><script>{app}</script>')
    return h

def game_detail_html():
    h=(ROOT/'game.html').read_text(); css=(ROOT/'assets/styles.css').read_text(); games=(ROOT/'js/games.js').read_text(); gp=(ROOT/'js/game-page.js').read_text()
    for p in re.findall(r"cover: '([^']+)'",games): games=games.replace(p,data_uri(p))
    h=h.replace('<link rel="stylesheet" href="assets/styles.css"/>',f'<style>{css}</style>')
    h=h.replace('<script src="js/games.js"></script><script src="js/game-page.js"></script>',PRE+f'<script>{games}</script><script>{gp}</script>')
    return h

def raw_game(slug):
    h=(ROOT/'games'/slug/'index.html').read_text(); return h.replace('<script>',PRE+'<script>',1)

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':1000}); errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(homepage_html(),wait_until='domcontentloaded'); page.wait_for_timeout(250)
    assert page.locator('#gameGrid .game-card').count()==25
    assert page.locator('#recommendationGrid .game-card').count()==3
    assert page.locator('#gameCount').inner_text()=='25'
    assert page.locator('#challengeGrid .challenge-card').count()==3
    assert page.locator('#weeklyGrid .challenge-card').count()==4
    assert page.locator('#volumePreference').count()==1
    page.locator('#searchInput').fill('crafting'); assert page.locator('#gameGrid .game-card').count()==1; assert 'Atlas Below' in page.locator('#gameGrid').inner_text()
    page.locator('#searchInput').fill('');page.locator('#profileButton').click();assert page.locator('#achievementGrid .achievement').count()==17;page.locator('#reducedMotion').check();assert page.locator('html').evaluate("e=>e.classList.contains('reduced-motion')");page.locator('.dialog-close').click();
    assert page.locator('#streakPanel').count()==1; assert page.locator('#exportData').count()==1; assert page.locator('#importData').count()==1; assert page.locator('#installButton').count()==1
    page.locator('#inputFilter').select_option('Gamepad'); assert page.locator('#gameGrid .game-card').count()>=8; page.locator('#inputFilter').select_option('All');
    page.screenshot(path='/mnt/data/wwg-v7-home.png',full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(50);dims=page.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert dims['sw']<=dims['iw'],dims
    # detail UI rating (iframe navigation is intentionally not relied on in self-contained mode)
    detail=browser.new_page(viewport={'width':1280,'height':850}); derr=[];detail.on('pageerror',lambda e: derr.append(str(e)));detail.set_content(game_detail_html(),wait_until='domcontentloaded');detail.wait_for_timeout(100);assert detail.locator('#gameTitle').inner_text()=='Atlas Below';assert detail.locator('#inputBadges span').count()>=1;detail.locator('[data-rate="5"]').click();assert '5/5' in detail.locator('#ratingNote').inner_text();detail.evaluate("""() => { const f=document.querySelector('#gameFrame'); window.dispatchEvent(new MessageEvent('message',{source:f.contentWindow,data:{type:'wwg:game-event',game:'atlas-below',event:'test-score',score:2345}})); }""");assert '2,345' in detail.locator('#localBest').inner_text();assert detail.evaluate("JSON.parse(localStorage.getItem('wwg:score-runs'))['atlas-below'].score")==2345;assert not derr,derr
    # direct interaction smoke and screenshots
    checks={}
    for slug in ['atlas-below','aetherstead-colony','prism-duel','crownline-tactics','echo-bazaar','lumen-relay','starweaver-drift','pulse-archive','verdant-circuit','quiet-protocol','forgeflow','cloudforge-pinball','mosslight-vale','gravity-foundry','hexbound-tactics','harbor-pulse','rift-relay','circuit-rush','orbit-breaker','skyhook-sprint','vector-league','emberfield-survival']:
        p=browser.new_page(viewport={'width':960,'height':540}); local=[];p.on('pageerror',lambda e,local=local:local.append(str(e)));p.set_content(raw_game(slug),wait_until='domcontentloaded');p.wait_for_timeout(120)
        if slug=='atlas-below':
            assert p.locator('canvas').count()==1;p.keyboard.press('ArrowRight');p.keyboard.press('Space');p.keyboard.press('KeyC');p.screenshot(path='/mnt/data/wwg-v7-atlas.png')
        elif slug=='aetherstead-colony':
            assert p.locator('.cell').count()==40;p.locator('[data-t="farm"]').click();p.locator('.cell').nth(2).click();p.locator('#advance').click();p.evaluate('scrollTo(0,0)');p.screenshot(path='/mnt/data/wwg-v7-aetherstead.png')
        elif slug=='prism-duel':
            assert p.locator('canvas').count()==1;p.keyboard.down('KeyW');p.keyboard.press('KeyF');p.keyboard.down('ArrowUp');p.keyboard.press('Slash');p.wait_for_timeout(80);p.keyboard.up('KeyW');p.keyboard.up('ArrowUp');p.screenshot(path='/mnt/data/wwg-v7-prism.png')
        elif slug=='crownline-tactics':
            assert p.locator('canvas').count()==1;box=p.locator('canvas').bounding_box();p.mouse.click(box['x']+280,box['y']+368);p.mouse.click(box['x']+347,box['y']+368);p.locator('#end').click();p.screenshot(path='/mnt/data/wwg-v6-crownline.png')
        elif slug=='echo-bazaar':
            assert p.locator('.good').count()==4;p.locator('.good').nth(1).click();p.locator('#buy').click();p.locator('#advance').click();p.screenshot(path='/mnt/data/wwg-v6-bazaar.png')
        elif slug=='lumen-relay':
            assert p.locator('canvas').count()==1;box=p.locator('canvas').bounding_box();p.mouse.click(box['x']+224+2*64+32,box['y']+78+2*64+32);p.screenshot(path='/mnt/data/wwg-v6-lumen.png')
        elif slug=='starweaver-drift':
            assert p.locator('canvas').count()==1;p.keyboard.down('ArrowRight');p.wait_for_timeout(80);p.keyboard.up('ArrowRight');p.keyboard.down('KeyE');p.wait_for_timeout(60);p.keyboard.up('KeyE');p.screenshot(path='/mnt/data/wwg-v5-starweaver.png')
        elif slug=='pulse-archive':
            assert p.locator('canvas').count()==1;p.keyboard.press('KeyD');p.keyboard.press('KeyF');p.locator('[data-lane="2"]').click();p.screenshot(path='/mnt/data/wwg-v5-pulse.png')
        elif slug=='verdant-circuit':
            assert p.locator('canvas').count()==1;box=p.locator('canvas').bounding_box();p.mouse.click(box['x']+355,box['y']+165);p.locator('[data-tool="seed"]').click();p.mouse.click(box['x']+420,box['y']+165);p.locator('#advance').click();p.screenshot(path='/mnt/data/wwg-v5-verdant.png')
        elif slug=='quiet-protocol':
            assert p.locator('canvas').count()==1;p.keyboard.press('ArrowRight');p.keyboard.press('KeyE');p.keyboard.press('Space');p.screenshot(path='/mnt/data/wwg-v4-quiet.png')
        elif slug=='forgeflow':
            box=p.locator('canvas').bounding_box();p.mouse.click(box['x']+350,box['y']+200);p.keyboard.press('KeyR')
        elif slug=='cloudforge-pinball':
            p.keyboard.press('Space');p.keyboard.down('KeyA');p.wait_for_timeout(60);p.keyboard.up('KeyA')
        elif slug=='mosslight-vale':
            assert p.locator('canvas').count()==1;p.keyboard.press('ArrowRight');p.keyboard.press('Space');p.keyboard.press('KeyE');p.evaluate("() => { questStage=4; postStage=3; fenStage=1; blade=2; player.x=2050; player.y=760; camX=1440; camY=500; msgT=0; sync(); }");p.wait_for_timeout(180);p.screenshot(path='/mnt/data/wwg-v6-silverfen.png');p.keyboard.press('KeyF');p.wait_for_timeout(60);assert p.evaluate('player.x')<1000;p.keyboard.press('KeyI');assert p.locator('#inventory').evaluate("e=>e.classList.contains('show')")
        elif slug=='gravity-foundry':
            box=p.locator('canvas').bounding_box();p.mouse.move(box['x']+92,box['y']+430);p.mouse.down();p.mouse.move(box['x']+30,box['y']+490,steps=4);p.mouse.up()
        elif slug=='hexbound-tactics':
            assert p.locator('.card').count()>=5;p.locator('.card').first.click();p.locator('.lane').first.click();p.locator('#end').click()
        elif slug=='harbor-pulse':p.locator('#restart').click()
        elif slug=='rift-relay':p.keyboard.down('KeyD');p.keyboard.down('ArrowLeft');p.wait_for_timeout(80);p.keyboard.up('KeyD');p.keyboard.up('ArrowLeft')
        elif slug=='circuit-rush':p.keyboard.down('ArrowUp');p.keyboard.down('ArrowRight');p.wait_for_timeout(90);p.keyboard.up('ArrowUp');p.keyboard.up('ArrowRight')
        elif slug=='orbit-breaker':p.keyboard.down('ArrowRight');p.keyboard.press('Space');p.wait_for_timeout(90);p.keyboard.up('ArrowRight')
        elif slug=='skyhook-sprint':p.keyboard.down('ArrowRight');p.keyboard.press('Space');p.keyboard.press('KeyE');p.wait_for_timeout(90);p.keyboard.up('ArrowRight')
        elif slug=='vector-league':p.keyboard.down('ArrowRight');p.keyboard.press('Space');p.wait_for_timeout(90);p.keyboard.up('ArrowRight')
        elif slug=='emberfield-survival':p.keyboard.down('ArrowRight');p.keyboard.press('Space');p.wait_for_timeout(90);p.keyboard.up('ArrowRight')
        p.wait_for_timeout(80);checks[slug]={'errors':len(local)};assert not local,(slug,local);p.close()
    assert not errors,errors
    print(json.dumps({'cards':25,'recommendations':3,'achievements':17,'challenges':3,'weekly':4,'mobile':dims,'homepage_errors':len(errors),'game_checks':checks},indent=2))
    browser.close()
