"""Chromium gameplay with synthetic Gamepad API slots; no physical hardware claim."""
import sys,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);t=time.monotonic();checks=[]
h=(root/'games/neon-serpent/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>requestAnimationFrame=()=>0;window.pads=[];Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>window.pads});window.mk=(id)=>({id,connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))});</script><script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
mark='start(1);requestAnimationFrame(loop);'
assert h.count(mark)==1
h=h.replace(mark,'''window.qa={reset:()=>{start(1,'qa');food={x:22,y:22};focusPaused=false},poll:pollGamepad,tick,interrupt:interrupted,state:()=>({ready,paused,head:{...snake[0]},phase,phaseDrive,overlayMode,brake,turns:turnQueue.length}),lose:()=>crash('collision')};'''+mark)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  p=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(h)
  def ev(s):return p.evaluate(s)
  def ck(n,v):checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)})
  def setup(arr):ev('pads=[];qa.poll();qa.reset();window.a=mk("A");window.b=mk("B");pads='+arr+';qa.poll()')
  for arr in ['[null,a]','[null,null,a]','[Object.assign(b,{connected:false}),a]','[a]']:
   setup(arr);ev('a.axes[1]=-1;qa.poll();qa.tick()');ck(arr+' steering moves actual head',ev('!qa.state().ready&&qa.state().head.y===11'))
   ev('a.axes[1]=0;qa.poll();a.buttons[0].pressed=true;qa.poll()');ck(arr+' phase activates',ev('qa.state().phaseDrive>0'))
   ev('a.buttons[0].pressed=false;qa.poll();a.buttons[9].pressed=true;qa.poll()');ck(arr+' pause activates',ev('qa.state().paused'))
  setup('[null,a]');ev('b.axes[1]=-1;pads[0]=b;qa.poll();qa.tick()');ck('new lower slot does not steal control',ev('qa.state().ready'));ev('a.axes[1]=-1;qa.poll();qa.tick()');ck('original slot retains control',ev('qa.state().head.y===11'))
  setup('[a,b]');ev('b.axes[1]=-1;pads[0]=null;qa.poll();qa.tick()');ck('handoff held direction ignored',ev('qa.state().ready'));ev('b.axes[1]=0;qa.poll();b.axes[1]=-1;qa.poll();qa.tick()');ck('handoff fresh direction moves',ev('qa.state().head.y===11'))
  setup('[a]');ev('b.axes[1]=-1;pads[0]=b;qa.poll();qa.tick()');ck('same slot different identity requires neutral',ev('qa.state().ready'));ev('b.axes[1]=0;qa.poll();b.axes[1]=-1;qa.poll();qa.tick()');ck('same slot replacement fresh direction moves',ev('qa.state().head.y===11'))
  setup('[null,a]');ev('qa.lose();qa.poll();a.buttons[0].pressed=true;qa.poll()');ck('secondary slot retries terminal overlay',ev('qa.state().overlayMode===null&&qa.state().ready'))
  setup('[a,b]');ev('qa.lose();qa.poll();b.buttons[0].pressed=true;pads[0]=null;qa.poll()');ck('held replacement A does not erase result',ev('qa.state().overlayMode==="lost"'));ev('b.buttons[0].pressed=false;qa.poll();b.buttons[0].pressed=true;qa.poll()');ck('fresh replacement A retries',ev('qa.state().overlayMode===null&&qa.state().ready'))
  setup('[null,a]');ev('qa.interrupt(true);a.axes[1]=-1;qa.interrupt(false);qa.poll();qa.tick()');ck('focus recovery rejects held direction',ev('qa.state().ready'));ev('a.axes[1]=0;qa.poll();a.axes[1]=-1;qa.poll();qa.tick()');ck('focus recovery accepts fresh direction',ev('qa.state().head.y===11'))
  setup('[null,null]');p.keyboard.press('ArrowUp');ev('qa.tick()');ck('keyboard works without controller',ev('qa.state().head.y===11'))
  if w<700:
   setup('[null,null]');p.locator('[data-a=up]').tap(timeout=2000);ev('qa.tick()');ck('touch works without controller',ev('qa.state().head.y===11'))
  ck('no runtime errors',not errors);p.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
