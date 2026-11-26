import json, sys, time, re, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).resolve().parents[1]).resolve(); mode=sys.argv[2] if len(sys.argv)>2 else 'candidate'
results=[]
def check(label, actual, expected=True):
 results.append(dict(check=label,actual=actual,expected=expected,passed=actual==expected))
def focus(p): return p.evaluate('document.activeElement.id || (document.activeElement.classList.contains("tile") ? [...document.querySelectorAll(".tile")].indexOf(document.activeElement) : document.activeElement.tagName)')
def tab_hits(p):
 p.locator('#restart').focus()
 hits=[]
 for _ in range(8):
  p.keyboard.press('Tab');hits.append(focus(p))
 return sum(isinstance(x,int) for x in hits)
with sync_playwright() as w:
 browser=w.chromium.launch(executable_path=os.environ.get('WWG_CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox'])
 for width,height in [(1280,800),(390,844),(320,568)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600)
  p=ctx.new_page(); errors=[]; p.on('pageerror',lambda e:errors.append(str(e)))
  html=(root/'games/mosaic-memory/index.html').read_text(); game=root/'games/mosaic-memory'; html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+ (game/m[1]).read_text()+'</style>',html); html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (game/m[1]).read_text()+'</script>',html); html=html.replace('<script>', '<script>const mem=new Map(); Object.defineProperty(window,"localStorage",{value:{getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v))}});</script><script>',1); p.set_content(html,wait_until='domcontentloaded'); p.locator('#start').wait_for(); prefix=f'{width}x{height} '
  check(prefix+'initial covered board has no keyboard stops',tab_hits(p),0)
  p.locator('#start').click();check(prefix+'start focus',focus(p),0)
  p.keyboard.press('ArrowRight');p.keyboard.press('ArrowRight');check(prefix+'arrow selection',focus(p),2)
  p.keyboard.press('Enter');check(prefix+'keyboard revealed card',p.locator('.tile').nth(2).get_attribute('aria-label')!='Tile 3: face down')
  p.keyboard.press('p');check(prefix+'pause focuses Resume',focus(p),'start');check(prefix+'paused board invisible',p.locator('#board').evaluate('(e)=>getComputedStyle(e).visibility'),'hidden')
  clock=p.locator('#clock').inner_text();p.wait_for_timeout(1100);check(prefix+'pause clock frozen',p.locator('#clock').inner_text(),clock)
  p.locator('#start').click();check(prefix+'resume restores tile position',focus(p),2);check(prefix+'revealed card preserved',p.locator('.tile').nth(2).get_attribute('aria-label')!='Tile 3: face down')
  p.keyboard.press('r');check(prefix+'keyboard restart focuses entry',focus(p),'start');check(prefix+'restart clears board',p.locator('#pairs').inner_text(),'0 / 6')
  if mode=='candidate':
   check(prefix+'ready board unavailable to accessibility tree','Tile 1:' not in p.locator('body').aria_snapshot())
   p.locator('#start').click();p.keyboard.press('ArrowRight');p.keyboard.press('ArrowRight');p.keyboard.press('ArrowRight')
   p.evaluate('window.dispatchEvent(new Event("blur"))');check(prefix+'automatic pause keeps board inert',p.locator('#board').evaluate('(e)=>e.hasAttribute("inert")'))
   check(prefix+'automatic pause does not focus overlay',focus(p)!='start')
   p.locator('#start').click();check(prefix+'automatic pause restores remembered tile',focus(p),3)
   p.locator('#restart').click();check(prefix+'pointer restart focuses entry',focus(p),'start')
   # Complete all three galleries with one legitimate hint per stage, then match via real clicks/taps.
   p.locator('#start').click()
   for stage,pairs in enumerate((6,8,10)):
    check(prefix+f'gallery {stage+1} has playable focus',focus(p),0)
    p.locator('#hint').click();p.wait_for_function('document.querySelectorAll(".tile.revealed").length===document.querySelectorAll(".tile").length')
    labels=p.locator('.tile').evaluate_all('(tiles)=>tiles.map(e=>e.getAttribute("aria-label").split(": ")[1])')
    p.wait_for_function('document.querySelectorAll(".tile.revealed").length===0',timeout=6000)
    for name in dict.fromkeys(labels):
     for i,v in enumerate(labels):
      if v==name:
       b=p.locator('.tile').nth(i);b.tap() if width<600 else b.click()
    check(prefix+f'gallery {stage+1} earned all pairs',p.locator('#pairs').inner_text(),f'{pairs} / {pairs}')
    check(prefix+f'gallery {stage+1} result focuses action',focus(p),'start')
    check(prefix+f'gallery {stage+1} board is inert',p.locator('#board').evaluate('(e)=>e.inert'))
    check(prefix+f'gallery {stage+1} result excludes covered board from accessibility tree','Tile 1:' not in p.locator('body').aria_snapshot())
    if stage<2:p.locator('#start').click()
   score=int(p.locator('#score').inner_text());check(prefix+'positive expedition score',score>0)
   check(prefix+'earned local record',p.evaluate('JSON.parse(localStorage.getItem("wwg:mosaic-memory:best"))'),score)
   p.locator('#start').click();check(prefix+'play again resets score',p.locator('#score').inner_text(),'0');check(prefix+'play again restores first tile',focus(p),0)
   check(prefix+'no horizontal overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
   check(prefix+'no errors',errors,[])
  ctx.close()
 browser.close()
print(json.dumps({'mode':mode,'checks':len(results),'passed':sum(r['passed'] for r in results),'results':results},indent=2))
if mode=='candidate' and not all(r['passed'] for r in results):sys.exit(1)
