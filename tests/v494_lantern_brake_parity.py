'''Controlled real Chromium physics and ranked scoring across input modes.'''
import json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]); out=Path(sys.argv[2]); t=time.monotonic(); checks=[]; observations=[]
html=(root/'games/lantern-line/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>').replace('<script>\nconst C=', '''<script>
requestAnimationFrame=()=>0;window.events=[];addEventListener('message',e=>{if(e.data?.type==='wwg:game-event')events.push(e.data)});window.testPad=null;Object.defineProperty(navigator,'getGamepads',{value:()=>[testPad]});
const C=''',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,h in [(1280,800),(390,844),(568,320)]:
  p=b.new_page(viewport={'width':w,'height':h},has_touch=w<700,is_mobile=w<700); errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(html)
  def ev(s,arg=None):return p.evaluate(s,arg)
  def ck(n,x):checks.append({'viewport':[w,h],'name':n,'pass':bool(x)})
  def setup(v):
   ev('v=>{testPad=null;reset();beginShift();speed=v;progress=.9;nextStop=5;activeMs=69000;comfort=79.6;totalDelay=.06;events=[];sync();document.activeElement.blur()}',v)
  def pad():ev('testPad={connected:true,mapping:"standard",axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};gamepad();testPad.buttons[6]={pressed:true,value:1}')
  def step(ms):ev('ms=>update(last+ms)',ms)
  def snap():return ev('({speed,comfort,progress,activeMs,penalty})')
  def finish():
   ev('testPad=null;speed=0;progress=.9;openDoors()');p.wait_for_timeout(25)
   return ev('({event:events[0]?.event,score:events[0]?.score,comfort:events[0]?.meta?.comfort,events:events.length})')
  for initial in [12,8,4]:
   for hz in [30,60]:
    setup(initial);p.keyboard.down('ArrowDown')
    for _ in range(hz//2):step(1000/hz)
    p.keyboard.up('ArrowDown');ref=snap();ref_end=finish()
    setup(initial);pad()
    for _ in range(hz//2):step(1000/hz)
    actual=snap();actual_end=finish();label=f'{initial} speed {hz}Hz'
    observations.append({'viewport':[w,h],'case':label,'keyboard':ref,'controller':actual,'keyboardResult':ref_end,'controllerResult':actual_end})
    ck(label+' braking physics parity',all(abs(ref[k]-actual[k])<1e-7 for k in ['speed','progress','activeMs','penalty']))
    ck(label+' comfort parity',abs(ref['comfort']-actual['comfort'])<1e-7)
    ck(label+' ranked result parity',actual_end==ref_end and ref_end['event']=='route-complete' and ref_end['events']==1)
    if w<700:
     setup(initial);dn=p.locator('[data-a="down"]');dn.dispatch_event('pointerdown',{'pointerType':'touch','button':0})
     for _ in range(hz//2):step(1000/hz)
     dn.dispatch_event('pointerup',{'pointerType':'touch','button':0});touch=snap();ck(label+' touch parity',all(abs(ref[k]-touch[k])<1e-7 for k in ref));ck(label+' touch ranked parity',finish()==ref_end)
  setup(12);pad();p.keyboard.down('ArrowDown');step(200);p.keyboard.up('ArrowDown');both=snap();setup(12);p.keyboard.down('ArrowDown');step(200);p.keyboard.up('ArrowDown');ck('simultaneous brake charged once',all(abs(both[k]-snap()[k])<1e-7 for k in both))
  setup(10);step(200);ck('coasting below speeding threshold does not reduce comfort',abs(snap()['comfort']-79.6)<1e-7)
  setup(12);pad();step(200);ev('testPad.buttons[6]={pressed:false,value:0};speed=10');before=snap()['comfort'];step(200);ck('released gamepad brake stops comfort penalty',abs(snap()['comfort']-before)<1e-7)
  setup(12);pad();step(200);ev('pauseShift()');before=snap();step(500);ck('pause freezes scoring',snap()==before)
  ck('no uncaught runtime errors',not errors);p.close()
 b.close()
res={'scope':'real Chromium, injected first-party game and input helper, manual frame timestamps, native keyboard and emulated touch, simulated standard gamepad, controlled final-stop fixtures','passed':sum(x['pass'] for x in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks,'observations':observations};out.write_text(json.dumps(res,indent=2));print(res['passed'],res['total'],res['seconds']);sys.exit(res['passed']!=res['total'])
