from playwright.sync_api import sync_playwright
URL='http://127.0.0.1:4173/index.html'
with sync_playwright() as p:
    b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    page=b.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until='domcontentloaded', timeout=12000)
        page.wait_for_timeout(1000)
        print('URL', page.url)
        print('TITLE', page.title())
        print('CARDS', page.locator('.game-card').count())
        print('TEXT', page.locator('body').inner_text()[:220].replace('\n',' | '))
        print('ERRORS', len(errors), errors[:3])
        page.screenshot(path='/mnt/data/wwg-v3-home.png', full_page=True)
    except Exception as e:
        print('NAVFAIL', type(e).__name__, str(e).splitlines()[0])
    b.close()
