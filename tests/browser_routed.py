from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlparse, unquote
import mimetypes, json
ROOT=Path('.').resolve()
errors=[]

def route_handler(route):
    u=urlparse(route.request.url)
    rel=unquote(u.path.lstrip('/')) or 'index.html'
    p=(ROOT/rel).resolve()
    if ROOT not in p.parents and p!=ROOT:
        return route.abort()
    if p.is_dir(): p=p/'index.html'
    if not p.exists(): return route.fulfill(status=404, body='not found')
    mt=mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
    route.fulfill(status=200, body=p.read_bytes(), content_type=mt)

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    ctx=browser.new_context(viewport={'width':1440,'height':1000}, service_workers='block')
    page=ctx.new_page(); page.route('https://wwg.test/**', route_handler); page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('https://wwg.test/index.html', wait_until='domcontentloaded'); page.wait_for_timeout(350)
    assert page.locator('#gameGrid .game-card').count()==13, page.locator('#gameGrid .game-card').count()
    assert page.locator('#recommendationGrid .game-card').count()==3
    assert page.locator('#gameCount').inner_text()=='13'
    page.locator('#searchInput').fill('card tactics'); page.wait_for_timeout(60)
    assert page.locator('#gameGrid .game-card').count()==1
    assert 'Hexbound Tactics' in page.locator('#gameGrid').inner_text()
    page.locator('#searchInput').fill(''); page.locator('#profileButton').click();
    assert page.locator('#achievementGrid .achievement').count()==7
    page.locator('#reducedMotion').check(); assert page.locator('html').evaluate("e=>e.classList.contains('reduced-motion')")
    page.locator('.dialog-close').click(); page.screenshot(path='/mnt/data/wwg-v3-home.png', full_page=True)
    # mobile width check
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(120)
    dims=page.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})'); assert dims['sw']<=dims['iw'],dims
    # game detail + rating + iframe boot
    page.set_viewport_size({'width':1280,'height':850}); page.goto('https://wwg.test/game.html?id=mosslight-vale', wait_until='domcontentloaded'); page.wait_for_timeout(400)
    assert page.locator('#gameTitle').inner_text()=='Mosslight Vale'
    page.locator('[data-rate="5"]').click(); assert '5/5' in page.locator('#ratingNote').inner_text()
    frame=page.frame_locator('#gameFrame'); assert frame.locator('canvas').count()==1
    frame.locator('canvas').press('ArrowRight'); frame.locator('canvas').press('Space'); frame.locator('canvas').press('KeyE'); page.wait_for_timeout(100)
    page.screenshot(path='/mnt/data/wwg-v3-mosslight.png', full_page=True)
    # direct new-game interaction smoke
    cases=[
      ('gravity-foundry','canvas'),('hexbound-tactics','.card'),('harbor-pulse','canvas'),('rift-relay','canvas')
    ]
    for slug,sel in cases:
        p=ctx.new_page(); p.route('https://wwg.test/**', route_handler); local=[]; p.on('pageerror',lambda e,local=local: local.append(str(e)))
        p.goto(f'https://wwg.test/games/{slug}/index.html', wait_until='domcontentloaded'); p.wait_for_timeout(150)
        assert p.locator(sel).count()>0,(slug,sel)
        if slug=='gravity-foundry':
            box=p.locator('canvas').bounding_box(); p.mouse.move(box['x']+95,box['y']+430); p.mouse.down(); p.mouse.move(box['x']+40,box['y']+485,steps=4); p.mouse.up()
        elif slug=='hexbound-tactics':
            p.locator('.card').first.click(); p.locator('.lane').first.click(); p.locator('#end').click()
        elif slug=='harbor-pulse': p.locator('#restart').click()
        else:
            p.keyboard.down('KeyD'); p.keyboard.down('ArrowLeft'); p.wait_for_timeout(80); p.keyboard.up('KeyD'); p.keyboard.up('ArrowLeft')
        p.wait_for_timeout(100); assert not local,(slug,local); p.close()
    assert not errors, errors
    print(json.dumps({'cards':13,'recommendations':3,'achievements':7,'mobile':dims,'errors':0,'screenshots':['/mnt/data/wwg-v3-home.png','/mnt/data/wwg-v3-mosslight.png']},indent=2))
    browser.close()
