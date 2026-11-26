"""Real Chromium controlled game states, synthetic Gamepad API; no hardware certification."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);start=time.monotonic();checks=[]
h=(root/'games/moonwake-angler/index.html').read_text().replace('</head>','''<script>requestAnimationFrame=()=>0;window.pads=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>pads});window.mk=(id)=>({id,connected:true,buttons:[{pressed:false}]});window.events=[];addEventListener('message',e=>{if(e.data?.game==='moonwake-angler')events.push(e.data)})</script></head>''',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  p=None;errors=[]
  def ev(s):return p.evaluate(s)
  def ck(n,v):checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)});print(w,n,bool(v),flush=True)
  def setup(slots='[a]'):
   global p
   if p is not None:p.close()
   p=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(h);ev('window.a=mk("A");window.b=mk("B");pads='+slots+';window.frame=()=>tick(last+16);frame()')
  def press(v):ev('a.buttons[0].pressed='+str(v).lower()+';frame()')
  for slots in ['[a]','[null,a]']:
   setup(slots);press(True);ck(slots+' A casts',ev('phase==="waiting"&&clockStarted'));press(False)
   ev('phase="bite";biteAt=Infinity');press(True);ck(slots+' A hooks and reels',ev('phase==="fight"&&reeling&&lineRemaining<100'));press(False);ck(slots+' A release stops reeling',ev('!reeling'))
   # Last fish legitimately lands through original simulation, while A is held.
   ev('catches=4;score=1000;stamina=0;lineRemaining=.1;tension=25');press(True);p.wait_for_timeout(20)
   ck(slots+' fifth fish ranks exactly once',ev('ended&&catches===5&&events.filter(e=>e.event==="night-haul"&&e.score===score).length===1'))
   ev('frame();frame()');ck(slots+' held A preserves result',ev('ended&&catches===5'))
   press(False);ck(slots+' release preserves result',ev('ended'));press(True);ck(slots+' fresh A retries to ready',ev('!ended&&phase==="ready"&&!clockStarted&&score===0&&catches===0&&activeMs===0'))
   ev('frame();frame()');ck(slots+' held retry cannot cast',ev('phase==="ready"&&!clockStarted'));press(False);press(True);ck(slots+' fresh A casts next haul',ev('phase==="waiting"&&clockStarted'))
  setup();press(True);ev('activeMs=89999;frame()');p.wait_for_timeout(20)
  ck('timeout unranked',ev('ended&&events.some(e=>e.event==="night-haul-ended"&&!("score" in e))'));ev('frame()');ck('held timeout A retains result',ev('ended'))
  press(False);ev('window.dispatchEvent(new Event("blur"))');press(True);ck('inactive A cannot retry',ev('ended'));ev('window.dispatchEvent(new Event("focus"));frame()');ck('held A after focus cannot retry',ev('ended'));press(False);press(True);ck('fresh A after focus retries',ev('!ended&&!clockStarted'))
  setup();ev('catches=5;activeMs=50000;finish();frame();pads=[];frame();b.buttons[0].pressed=true;pads=[b];frame()');ck('replacement held A retains result',ev('ended'));ev('b.buttons[0].pressed=false;frame();b.buttons[0].pressed=true;frame()');ck('replacement fresh A retries',ev('!ended&&!clockStarted'))
  setup();ev('catches=5;activeMs=50000;finish();frame()');p.locator('#castBtn').focus();p.keyboard.press('Enter');ck('native keyboard replay stays ready',ev('!ended&&!clockStarted'));p.locator('#castBtn').focus();p.keyboard.press('Enter');ck('native keyboard casts',ev('phase==="waiting"&&clockStarted'))
  ev('finish(false)');el=p.locator('#castBtn');el.tap() if w<700 else el.click();ck('native pointer replay stays ready',ev('!ended&&!clockStarted'));ck('no horizontal overflow',ev('document.documentElement.scrollWidth<=innerWidth+2'));ck('no page errors',not errors);p.close()
 b.close()
r={'scope':'real Chromium; controlled final catch and timeout; synthetic pads; native keyboard and pointer; mobile emulation','passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-start,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
