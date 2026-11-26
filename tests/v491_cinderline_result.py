"""Actual Chromium result lifecycle fixtures using directed gate crossings; synthetic pad, isolated storage."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from v361_cinderline_fixture import instrument
R=Path(sys.argv[1]);out=Path(sys.argv[2]);t=time.monotonic();checks=[]
raw=(R/'games/cinderline-velocity/index.html').read_text();assert 'window.__cinderlineVelocity=' not in raw
h=instrument(raw)
for f in ('wwg-input.js','wwg-webgl.js'):h=h.replace(f'<script src="../../assets/{f}"></script>','<script>'+(R/'assets'/f).read_text()+'</script>')
h=h.replace('<head>','<head><script>window.events=[];window.store={};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)}});window.addEventListener("message",e=>{if(e.data?.type==="wwg:game-event")events.push(e.data)});requestAnimationFrame=()=>0;window.pad={connected:true,axes:[0,0],buttons:Array.from({length:10},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,"getGamepads",{value:()=>[pad]});</script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  p=None;errs=[]
  def ev(s):return p.evaluate(s)
  def ck(n,v):checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)})
  def fresh():
   global p
   if p is not None:p.close()
   p=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700);p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(h);p.locator('#start').click();p.wait_for_timeout(10)
  def finish():ev('for(let i=0;i<6;i++)__cinderlineVelocity.forceGate()');p.wait_for_timeout(10)
  def state():return ev('__cinderlineVelocity.state()')
  def rank():return ev('__cinderlineVelocity.ranking()')
  def shown():return p.locator('#over').is_visible()
  fresh();ck('fresh circuit active',state()['active'] and state()['course']==0 and not shown());p.keyboard.press('KeyR');ck('unfinished R retains ranked eligibility',rank()=={'rankedChain':True,'nextRankedCourse':0});ev('document.querySelector("#continue").click()');ck('stale continue cannot skip unfinished race',state()['course']==0 and state()['gate']==0)
  fresh();finish();ck('six directed gates complete first circuit',state()['finished'] and shown() and state()['course']==0);ck('native result focus',ev('document.activeElement.id')=='continue');ck('podium advances ranking chain once',rank()=={'rankedChain':True,'nextRankedCourse':1});saved=state()['best'];p.keyboard.press('KeyR');ck('R retries current circuit and dismisses result',not state()['finished'] and not shown() and state()['course']==0);ck('retry starts zero gates and restores score',state()['score']==0 and state()['gate']==0 and state()['lap']==1);ck('completed retry is explicitly unranked',not rank()['rankedChain']);ck('best time survives retry',state()['best']==saved);ev('document.querySelector("#continue").click()');ck('stale result cannot skip restarted race',state()['course']==0)
  fresh();finish();p.keyboard.press('Digit2');ck('digit practice selection dismisses completed result',state()['course']==1 and not state()['finished'] and not shown());ck('digit practice cannot inherit ranked chain',not rank()['rankedChain']);ev('document.querySelector("#continue").click()');ck('practice still cannot skip',state()['course']==1)
  fresh();finish();ev('document.querySelector("[data-action=reset]").click()');ck('semantic reset dismisses result',not shown() and not state()['finished']);ck('reset practice is unranked',not rank()['rankedChain'])
  fresh();finish();p.locator('#continue').focus();p.keyboard.press('Space');ck('Space activates focused result button',state()['course']==1 and not state()['finished'] and not shown());ck('legitimate continue retains ranking',rank()=={'rankedChain':True,'nextRankedCourse':1});ev('document.querySelector("#continue").click()');ck('duplicate continue ignored',state()['course']==1)
  fresh();finish();(p.locator('#continue').tap() if w<700 else p.locator('#continue').click());finish();p.locator('#continue').click();finish();a=state();ck('all eighteen gates complete legitimate championship',a['course']==2 and a['finished'] and shown());ck('one ranked event',ev('events.filter(e=>e.event==="campaign-complete"&&Number.isSafeInteger(e.score)).length')==1);p.locator('#continue').click();ck('campaign replay starts fresh ranked chain',state()['course']==0 and state()['score']==0 and not shown() and rank()=={'rankedChain':True,'nextRankedCourse':0});ck('replay retains unlocked courses',state()['unlocked']==3)
  fresh();ev('gamepad();pad.buttons[9].pressed=true');finish();ev('gamepad()');ck('held Start at finish does not advance',state()['course']==0 and shown());ev('pad.buttons[9].pressed=false;gamepad();pad.buttons[9].pressed=true;gamepad()');ck('fresh pad Start continues result',state()['course']==1 and not shown());ev('gamepad()');ck('held Start cannot skip again',state()['course']==1);ck('no runtime errors',not errs);p.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
