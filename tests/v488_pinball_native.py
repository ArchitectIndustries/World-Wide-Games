"""Real Chromium native control regression with explicit fixed physics steps."""
import sys,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]); out=Path(sys.argv[2]); t=time.monotonic(); checks=[]
h=(root/'games/cloudforge-pinball/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>requestAnimationFrame=()=>0;</script><script>'+ (root/'assets/wwg-input.js').read_text()+'</script>')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  p=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700); errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(h)
  def ev(s):return p.evaluate(s)
  def ck(n,v):checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)})
  for side,other in [('left','right'),('right','left')]:
   for activation in ['Space','Enter','semantic']:
    ev('reset();last=1000');btn=p.locator('#'+side);btn.focus()
    if activation=='semantic':btn.evaluate('(el)=>el.click()')
    else:p.keyboard.press(activation)
    ck(side+' '+activation+' activates only intended flipper',ev(f'{side}&&!{other}'))
    ev('step(last+1000/60)');ck(side+' '+activation+' survives a physics tick',ev(side))
    ev('for(let j=0;j<12;j++)step(last+1000/60)');ck(side+' '+activation+' releases automatically',ev('!left&&!right'))
   ev('reset();last=1000');p.locator('#'+side).evaluate('(el)=>el.click()');ev('interrupt();resume()');ck(side+' interruption clears pulse',ev('!left&&!right'))
   ev('reset();last=1000');p.locator('#'+side).evaluate('(el)=>el.click()');ev('reset()');ck(side+' reset clears pulse',ev('!left&&!right'))
   ev('reset();last=1000');btn=p.locator('#'+side)
   if w<700:btn.tap()
   else:btn.click()
   ck(side+' pointer tap does not leave duplicate activation',ev('!left&&!right'))
   ev('reset();last=1000');p.locator('#launch').focus();p.keyboard.down('ArrowLeft' if side=='left' else 'ArrowRight');ck(side+' directional input works after launch focus',ev(side));p.keyboard.up('ArrowLeft' if side=='left' else 'ArrowRight');ck(side+' directional release',ev('!left&&!right'))
  ev('reset();last=1000');p.locator('#left').evaluate('(el)=>el.click()');p.locator('#right').evaluate('(el)=>el.click()');ck('independent simultaneous semantic activation',ev('left&&right'))
  ev('reset();last=1000');p.locator('#launch').focus();p.keyboard.press('Space');ck('native launch still exactly once',ev('balls.length===1&&remaining===2&&nudgesLeft===2'))
  ev('reset();last=1000');p.locator('#left').evaluate('(el)=>el.click()');ev('balls=[{x:414,y:430,vx:0,vy:120,r:9,trail:[]}];step(last+1000/60)');ck('semantic flipper produces real upward ball impulse',ev('balls[0].vy< -100'))
  ev('reset();last=1000');p.locator('#left').evaluate('(el)=>el.click()');ev('endGame()');ck('terminal state clears native pulse',ev('over&&!left&&!right'))
  ev('reset();last=1000');p.locator('#left').evaluate('(el)=>el.click()');p.locator('#launch').focus();p.keyboard.down('ArrowRight');ev('for(let j=0;j<12;j++)step(last+1000/60)');ck('pulse expiry preserves independent held keyboard input',ev('!left&&right'));p.keyboard.up('ArrowRight')
  ck('no uncaught runtime errors',not errors);p.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
