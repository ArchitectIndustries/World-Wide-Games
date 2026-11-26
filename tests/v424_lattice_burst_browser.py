import argparse,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
P=argparse.ArgumentParser();P.add_argument('--root',type=Path,required=True);P.add_argument('--out',type=Path,required=True);P.add_argument('--baseline',action='store_true');P.add_argument('--screenshot',type=Path);a=P.parse_args()
root=a.root
h=(root/'games/lattice-armada/index.html').read_text()
def repl(m):
 s=(root/'games/lattice-armada'/m.group(1)).resolve()
 return '<script>'+s.read_text()+'</script>' if s.exists() else m.group(0)
h=re.sub(r'<script\s+src=["\']([^"\']+)["\']\s*></script>',repl,h)
assert h.count('})();')>=1
idx=h.rfind('})();');h=h[:idx]+'window.__qa={get st(){return st},start,step,burst,rewardKill,reset,togglePause,readPad,clearSector};'+h[idx:]
checks=[]
def ck(name,ok,detail=None):
 checks.append(dict(name=name,passed=bool(ok),observed=detail));print(('PASS' if ok else 'FAIL'),name,detail,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for wh in [(1280,800),(390,844),(320,240)]:
  w,hgt=wh;c=b.new_context(viewport={'width':w,'height':hgt},is_mobile=w<800,has_touch=w<800)
  pg=c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content(h,wait_until='domcontentloaded');pg.wait_for_timeout(80)
  pg.evaluate('window.__qa.start(0);window.__qa.st.spawnT=10000')
  pg.evaluate('window.__qa.st.burst=100')
  pg.keyboard.down('e');pg.wait_for_timeout(40)
  first=pg.evaluate('window.__qa.st.burst')
  ck(f'{w}x{hgt} first deliberate keyboard burst spends meter',first==0,first)
  pg.evaluate('window.__qa.st.burst=100')
  pg.wait_for_timeout(80)
  held=pg.evaluate('window.__qa.st.burst')
  ck(f'{w}x{hgt} held keyboard no auto-spend',held==0 if a.baseline else held==100,held)
  pg.keyboard.up('e');pg.wait_for_timeout(40)
  pg.keyboard.down('e');pg.wait_for_timeout(45)
  again=pg.evaluate('window.__qa.st.burst')
  ck(f'{w}x{hgt} new keyboard press spends recharged meter',again==0,again)
  pg.keyboard.up('e')
  pg.evaluate('window.__qa.st.burst=100')
  # Pointerdown maps to deliberate press, holding must not repeatedly discharge.
  pg.locator('[data-key="KeyE"]').dispatch_event('pointerdown',{'pointerType':'touch','bubbles':True})
  pg.wait_for_timeout(40)
  ck(f'{w}x{hgt} pointerdown burst',pg.evaluate('window.__qa.st.burst')==0,pg.evaluate('window.__qa.st.burst'))
  pg.evaluate('window.__qa.st.burst=100');pg.wait_for_timeout(80)
  touchheld=pg.evaluate('window.__qa.st.burst')
  ck(f'{w}x{hgt} held touch no auto-spend',touchheld==0 if a.baseline else touchheld==100,touchheld)
  pg.locator('[data-key="KeyE"]').dispatch_event('pointerup',{'pointerType':'touch','bubbles':True})
  pg.locator('[data-key="KeyE"]').dispatch_event('pointerdown',{'pointerType':'touch','bubbles':True});pg.wait_for_timeout(30)
  ck(f'{w}x{hgt} fresh touch spends burst',pg.evaluate('window.__qa.st.burst')==0)
  pg.locator('[data-key="KeyE"]').dispatch_event('pointerup',{'pointerType':'touch','bubbles':True})
  pg.evaluate('window.__gpB=false;Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[{axes:[0,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===1&&window.__gpB}))}]})')
  pg.evaluate('window.__qa.reset();window.__qa.st.spawnT=10000');pg.wait_for_timeout(80)
  pg.evaluate('window.__qa.st.burst=100;window.__gpB=true');pg.wait_for_timeout(80)
  pressed=pg.evaluate('window.__qa.st.burst')
  ck(f'{w}x{hgt} gamepad first press consumes',pressed==0,pressed)
  pg.evaluate('window.__qa.st.burst=100');pg.wait_for_timeout(80)
  ck(f'{w}x{hgt} gamepad held no auto-spend',pg.evaluate('window.__qa.st.burst')==100,pg.evaluate('window.__qa.st.burst'))
  pg.evaluate('window.__gpB=false');pg.wait_for_timeout(45);pg.evaluate('window.__gpB=true');pg.wait_for_timeout(80)
  ck(f'{w}x{hgt} gamepad fresh press consumes',pg.evaluate('window.__qa.st.burst')==0,pg.evaluate('window.__qa.st.burst'))
  pg.evaluate('window.__gpB=false');pg.wait_for_timeout(40)
  pg.evaluate('window.__qa.st.burst=100;window.__qa.togglePause()')
  pg.keyboard.press('e');pg.wait_for_timeout(40)
  ck(f'{w}x{hgt} pause refuses burst',pg.evaluate('window.__qa.st.burst')==100)
  pg.keyboard.up('e');pg.evaluate('window.__qa.togglePause()')
  pg.keyboard.press('r');pg.wait_for_timeout(40)
  ck(f'{w}x{hgt} restart resets held/score/burst',pg.evaluate('window.__qa.st.burst===0&&window.__qa.st.score===0&&window.__qa.st.active'))
  if a.screenshot and w==390:
   a.screenshot.parent.mkdir(parents=True,exist_ok=True);pg.screenshot(path=str(a.screenshot))
  ck(f'{w}x{hgt} no browser errors',not errors,errors)
  c.close()
 b.close()
result={'passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'baseline':a.baseline,'browser':'chromium playwright set_content with unchanged first-party game and disposable test accessor','physical_device':False}
a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(json.dumps(result,indent=2)+'\n')
print('TOTAL',result['passed'],result['total'])
raise SystemExit(0 if result['passed']==result['total'] else 1)
