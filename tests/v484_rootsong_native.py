"""Real Chromium, first-party document with inline input and storage fixture. No origin/PWA certification."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);checks=[];t=time.monotonic()
h=(root/'games/rootsong-architect/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
h=h.replace('</head>', '''<script>const store={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)}});window.events=[];window.postMessage=e=>events.push(e);</script></head>''',1)
def ck(label,val):
 checks.append({'name':label,'pass':bool(val)});print(label,bool(val),flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,he,touch in [(1280,800,False),(390,844,True),(568,320,True)]:
  tag=f'{w}x{he}';ctx=b.new_context(viewport={'width':w,'height':he},is_mobile=touch,has_touch=touch);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(h);page.wait_for_timeout(50)
  page.keyboard.press('Space');ck(tag+' board Space grows',page.evaluate("spent===1&&grown.has('1,3')"));page.keyboard.press('Backspace');ck(tag+' board Backspace refunds',page.evaluate('spent===0'));page.keyboard.press('ArrowRight');page.keyboard.press('KeyA');ck(tag+' arrows/WASD move cursor',page.evaluate('cursor[0]===1&&cursor[1]===3'))
  if touch:
   right=page.locator('[data-a="right"]');right.focus();page.keyboard.press('Space');ck(tag+' focused right Space moves without growth',page.evaluate('cursor[0]===2&&spent===0&&mistakes===0'))
   page.locator('[data-a="left"]').focus();page.keyboard.press('Enter');ck(tag+' focused left Enter moves',page.evaluate('cursor[0]===1'))
   page.locator('[data-a="grow"]').focus();page.keyboard.press('Space');ck(tag+' focused grow executes once',page.evaluate('spent===1&&mistakes===0'))
   page.locator('[data-a="undo"]').focus();page.keyboard.press('Space');ck(tag+' focused undo refunds without invalid grow',page.evaluate('spent===0&&mistakes===0'))
   page.keyboard.press('KeyR');page.locator('[data-a="grow"]').tap();ck(tag+' touch grow once',page.evaluate('spent===1&&mistakes===0'));page.locator('[data-a="undo"]').tap();ck(tag+' touch undo',page.evaluate('spent===0'))
  page.keyboard.press('KeyR');page.evaluate('events.length=0')
  for i in range(6):
   page.evaluate('i=>{for(const [x,y] of LEVELS[i].solution)grow(x,y)}',i);ck(tag+f' legal garden {i+1} complete',page.evaluate('i=>li===i&&done',i))
   if i<5: page.wait_for_timeout(710)
  ck(tag+' six garden events and one terminal result',page.evaluate("events.length===7&&events[6].event==='grove-complete'&&events[6].score>0"));ck(tag+' terminal replay automatically focused',page.evaluate("document.activeElement.id==='restartRun'"))
  page.locator('#restartRun').focus();page.keyboard.press('Space');ck(tag+' native Space on replay starts clean run',page.evaluate('li===0&&!done&&total===0&&mistakes===0&&FINISH.hidden&&spent===0'))
  ck(tag+' replay returns focus to board',page.evaluate('document.activeElement===C'));page.keyboard.press('Space');ck(tag+' first board move after replay grows exactly once',page.evaluate('spent===1&&mistakes===0'))
  page.keyboard.press('KeyR');page.evaluate('store["wwg:keymap"]=JSON.stringify({primary:"Enter"})');page.keyboard.press('Enter');ck(tag+' remapped Enter grows on board',page.evaluate('spent===1&&mistakes===0'))
  if touch:
   page.locator('[data-a="undo"]').focus();page.keyboard.press('Enter');ck(tag+' native Enter on undo wins over remap',page.evaluate('spent===0&&mistakes===0'))
  ck(tag+' no runtime errors',not errors);ctx.close()
 b.close()
r={'passed':sum(x['pass'] for x in checks),'total':len(checks),'elapsedSeconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(0 if r['passed']==r['total'] else 1)
