import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]); baseline='--baseline' in sys.argv
html=(root/'games/lantern-line/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>').replace('<script>\nconst C=', '<script>\nwindow.requestAnimationFrame=()=>0;\nconst C=',1)
rows=[]
def ck(name,ok): rows.append({'name':name,'pass':bool(ok)});print(name,bool(ok),flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,h in [(1280,800),(390,844),(568,320)]:
  p=b.new_page(viewport={'width':w,'height':h},is_mobile=w<700,has_touch=w<700);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(html);label=f'{w}x{h}'
  def test(name,exp):ck(label+' '+name,p.evaluate(exp))
  def step(ms):p.evaluate('ms=>update(last+ms)',ms)
  p.locator('#shiftBtn').click();p.locator('#resetBtn').focus();p.keyboard.press('Space');test('Space on Reset actually resets',"phase==='ready'&&penalty===0&&activeMs===0")
  p.evaluate('reset()');p.locator('#shiftBtn').focus();p.keyboard.press('Enter');test('Enter starts shift',"phase==='active'&&penalty===0")
  p.locator('#resetBtn').focus();p.keyboard.press('Enter');test('Enter resets',"phase==='ready'")
  p.locator('#shiftBtn').focus();p.keyboard.press('Space');test('Space starts',"phase==='active'")
  p.evaluate('document.activeElement.blur()');p.keyboard.down('ArrowUp');step(250);p.keyboard.up('ArrowUp');test('global throttle moves', 'speed>0&&progress>0')
  p.evaluate('reset();beginShift();progress=.08;speed=0');p.keyboard.press('Space');test('global Space opens doors', 'nextStop===1')
  if w<700:
   up=p.locator('[data-a="up"]');dn=p.locator('[data-a="down"]');door=p.locator('[data-a="primary"]')
   p.evaluate('reset()');up.focus();p.keyboard.down('Space');step(250);p.keyboard.up('Space');test('focused throttle Space accelerates','phase==="active"&&speed>1')
   p.evaluate('reset();beginShift();speed=5');dn.focus();p.keyboard.down('Enter');step(250);p.keyboard.up('Enter');test('focused brake Enter decelerates','speed<2')
   p.evaluate('reset();beginShift();progress=.08;speed=0');door.focus();p.keyboard.press('Enter');test('focused door Enter services platform','nextStop===1&&penalty===0')
   p.evaluate('reset();beginShift();progress=.08;speed=0');door.evaluate('el=>el.click()');test('click-only door services platform','nextStop===1&&penalty===0')
   p.evaluate('reset()');up.evaluate('el=>el.click()');step(250);test('click-only throttle moves','phase==="active"&&speed>1')
   if not baseline:
    step(250);v=p.evaluate('speed');step(250);ck(label+' click pulse expires',p.evaluate('speed')<v)
    p.evaluate('reset();beginShift()');up.focus();p.keyboard.down('Space');step(250);p.locator('#resetBtn').focus();v=p.evaluate('speed');step(250);p.keyboard.up('Space');ck(label+' focus loss releases held control',p.evaluate('speed')<v)
    p.evaluate('reset();beginShift();progress=.08;speed=0');door.evaluate("el=>el.addEventListener('click',e=>window.clickInfo={detail:e.detail,pointerType:e.pointerType,source:e.sourceCapabilities?.firesTouchEvents,constructor:e.constructor.name})");door.tap();print('CLICK',p.evaluate('window.clickInfo'));print('TOUCH',p.evaluate('({nextStop,penalty,phase,windowBlurred,msg:msg.textContent})'));test('touch door triggers exactly once','nextStop===1&&penalty===0')
    p.evaluate('reset();beginShift();progress=.9;speed=0;nextStop=5;activeMs=10000');door.focus();p.keyboard.press('Enter');test('keyboard final station ranks legitimately','done&&nextStop===6&&msg.textContent.includes("Ranked service delay")')
    p.evaluate('reset();beginShift();activeMs=87990');step(20);test('deadline remains unranked','done&&msg.textContent.includes("unranked")')
  ck(label+' no uncaught errors',not errors);p.close()
 b.close()
result={'baseline':baseline,'scope':'real Chromium isolated document, native focus/keyboard, emulated touch, controlled gameplay frames and station fixtures; not physical AT','passed':sum(x['pass'] for x in rows),'total':len(rows),'checks':rows};out.write_text(json.dumps(result,indent=2));print(result['passed'],result['total']);sys.exit(0 if baseline or result['passed']==result['total'] else 1)
