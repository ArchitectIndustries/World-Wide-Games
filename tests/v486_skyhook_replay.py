"""Chromium controller replay: controlled finish fixture and simulated pad polling."""
import sys,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]); out=Path(sys.argv[2]); start=time.monotonic()
h=(root/'games/skyhook-sprint/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
h=h.replace('</head>', '''<script>window.requestAnimationFrame=()=>0;window.scores=[];window.addEventListener('message',e=>{if(e.data?.event==='skyline-cleared')scores.push(e.data)});let store={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)}});window.pad={axes:[0,0],buttons:[{pressed:false},{pressed:false}]};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.pad],configurable:true});</script></head>''',1)
checks=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,ht in [(1280,800),(390,844),(568,320)]:
  pg=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_content(h)
  def ev(s):return pg.evaluate(s)
  def check(n,expr):
   v=ev(expr) if isinstance(expr,str) else expr;checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)});print(w,n,bool(v),flush=True)
  def poll():ev('step(lt+16)')
  def setpad(a=False,b=False,x=0,y=0):ev(f'window.pad={{axes:[{x},{y}],buttons:[{{pressed:{str(a).lower()}}},{{pressed:{str(b).lower()}}}]}}')
  def finish():
   ev('reset();scores.length=0;p.x=4050;p.y=483;p.on=true;runStarted=true;activeMs=12000;stars[0].got=true;advanceTraversal(.01,0)');pg.wait_for_timeout(35)
  for button in [0,1]:
   setpad(a=button==0,b=button==1,x=.8);finish();check('earned finish','finished&&scores.length===1&&best>0')
   poll();poll();check('held inputs do not erase earned finish','finished&&scores.length===1')
   setpad();poll();check('neutral alone does not replay','finished')
   setpad(x=.8);poll();check('stick alone does not replay','finished')
   setpad(a=button==0,b=button==1);poll();check('fresh A or B replays','!finished&&!runStarted&&activeMs===0&&p.x===70&&stars.every(s=>!s.got)')
   poll();poll();check('held replay does not start clock or jump','!finished&&!runStarted&&activeMs===0&&p.y===483&&p.vy===0')
   setpad();poll();setpad(x=.8);poll();poll();check('new stick action starts real traversal','!finished&&runStarted&&activeMs>0&&p.x>70')
   check('no duplicate rank event and best retained','scores.length===1&&best>0&&Number(store[BEST_KEY])===best')
  setpad();finish();poll();ev('pauseForFocus(true)');setpad(a=True);poll();check('paused replay ignored','finished');ev('pauseForFocus(false)');poll();check('held on resume ignored','finished');setpad();poll();setpad(b=True);poll();check('fresh resumed action replays','!finished&&!runStarted');setpad();finish();ev('window.pad=null');poll();setpad(a=True);poll();check('reconnect held A ignored','finished');setpad();poll();setpad(a=True);poll();check('reconnect neutral then press replays','!finished&&!runStarted');setpad();finish();pg.keyboard.press('KeyR');check('keyboard R replay preserved','!finished&&!runStarted&&activeMs===0');check('no runtime exceptions',not errors);pg.close()
 b.close()
res={'scope':'Chromium isolated documents; actual first-party traversal and frame handler, seeded supported finish, synthetic controller; not physical devices','passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-start,3),'checks':checks};out.write_text(json.dumps(res,indent=2));sys.exit(res['passed']!=res['total'])
