#!/usr/bin/env python3
"""Original Vanta runtime in real Chromium with isolated QA introspection; no production hook.
Controlled uplink/position inputs avoid claiming natural unassisted mission completion.
"""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
P=argparse.ArgumentParser();P.add_argument('--root',type=Path,required=True);P.add_argument('--out',type=Path,required=True);P.add_argument('--parent-repro',action='store_true');P.add_argument('--screens',type=Path);args=P.parse_args()
root=args.root;src=(root/'games/vanta-frontline/index.html').read_text()
assert src.count('<script src="../../assets/wwg-input.js"></script>')==1
src=src.replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
qa='''window.__vantaQA={
 snapshot:()=>({operation,active,finished,hp,score,opStartScore,secured,progress:meta.bestOperation,clears:meta.clears,best:meta.best,over:document.querySelector('#over').classList.contains('show'),button:document.querySelector('#continue').textContent}),
 secure:()=>{for(const u of uplinks){p.x=u.x;p.y=u.y;keys.use=true;secureUse(1.06);keys.use=false;}p.x=extract.x;p.y=extract.y;update(.015)},
 fail:()=>hurt(900),
 live:()=>({padReady,paused,suspended})
};
function loop(t)'''
assert src.count('function loop(t)')==1
src=src.replace('function loop(t)',qa,1)
pre='''<script>window.__ev=[];window.addEventListener('message',e=>{if(e.data?.type==='wwg:game-event')__ev.push(e.data)});</script>'''
src=src.replace('<script>\n(()=>{',pre+'<script>\n(()=>{',1)
checks=[];samples=[];errors=[]
def ck(name,condition,detail=None):
 checks.append({'name':name,'pass':bool(condition),'detail':detail if not condition else None});
 if not condition:print('FAIL',name,str(detail)[:270],flush=True)
def snap(p):return p.evaluate('__vantaQA.snapshot()')
def events(p):return p.evaluate('window.__ev')
start=time.monotonic()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mobile in (False,True):
  tag='emulated-mobile' if mobile else 'desktop'
  ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},has_touch=mobile,is_mobile=mobile)
  page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(src,wait_until='domcontentloaded');page.wait_for_timeout(50)
  ck(tag+' ready menu',not snap(page)['active'])
  if mobile:page.locator('#start').tap()
  else:page.locator('#start').click()
  ck(tag+' real deploy button initializes operation 1',snap(page)['operation']==0 and snap(page)['active'])
  page.evaluate('__vantaQA.secure()');first=snap(page)
  ck(tag+' operation 1 earned objectives and result',first['secured']==3 and first['finished'] and first['operation']==0,first)
  page.locator('#continue').click();ck(tag+' operation 2 unlocked',snap(page)['operation']==1)
  page.evaluate('__vantaQA.secure()');second=snap(page)
  ck(tag+' operation 2 earned objectives',second['secured']==3 and second['finished'],second)
  page.locator('#continue').click();third=snap(page)
  ck(tag+' operation 3 begins with banked score',third['operation']==2 and third['opStartScore']==second['score'],third)
  bank=third['opStartScore'];page.evaluate('__vantaQA.fail()');lost=snap(page)
  ck(tag+' operation 3 failure is unranked',lost['finished'] and lost['hp']<=0 and lost['button']=='Retry operation',lost)
  ck(tag+' failure does not write high score',lost['clears']==0 and lost['best']==0 and len([e for e in events(page) if e['event']=='campaign-complete'])==0)
  if args.screens and not mobile:
   args.screens.mkdir(parents=True,exist_ok=True);page.screenshot(path=str(args.screens/('v450_vanta_before.png' if args.parent_repro else 'v450_vanta_failure.png')))
  if mobile:page.locator('#continue').tap()
  else:page.locator('#continue').click()
  after=snap(page);samples.append({'mode':tag,'bank':bank,'loss':lost,'retry':after})
  if args.parent_repro:
   ck(tag+' reproduced incorrect reset to operation 1',after['operation']==0 and after['score']==0,after)
  else:
   ck(tag+' retry remains in operation 3',after['operation']==2,after)
   ck(tag+' retry retains earned earlier operation score',after['score']==bank and after['opStartScore']==bank,after)
   ck(tag+' retry clears failed operation state and overlay',after['hp']==100 and after['secured']==0 and not after['finished'] and not after['over'],after)
   ck(tag+' retry keeps prior operation records',after['progress']==2 and after['clears']==0 and after['best']==0,after)
   ck(tag+' failure telemetry remains unscored',all('score' not in e for e in events(page)))
   page.evaluate('__vantaQA.secure()');win=snap(page)
   ck(tag+' legitimate retried final operation can complete',win['operation']==2 and win['finished'] and win['secured']==3 and win['hp']>0,win)
   scored=[e for e in events(page) if 'score' in e]
   ck(tag+' exactly one earned campaign score',len(scored)==1 and scored[0]['event']=='campaign-complete' and scored[0]['score']==win['score'],scored)
   ck(tag+' earned replay record persisted',win['clears']==1 and win['best']==win['score'] and win['progress']==3,win)
   page.evaluate('__vantaQA.secure()')
   ck(tag+' duplicate completion disallowed',len([e for e in events(page) if 'score' in e])==1)
   if mobile:page.locator('#continue').tap()
   else:page.locator('#continue').click()
   restart=snap(page)
   ck(tag+' victory restart begins fresh campaign',restart['operation']==0 and restart['score']==0 and restart['opStartScore']==0,restart)
   ck(tag+' earned records retained after campaign replay',restart['clears']==1 and restart['best']==win['score'],restart)
   if mobile:
    ck(tag+' touch action buttons visible',page.locator('[data-action=fire]').is_visible() and page.locator('[data-action=use]').is_visible())
   else:
    ck(tag+' keyboard remains functional on retry',page.locator('#flow').inner_text()=='ACTIVE')
  ck(tag+' no uncaught errors',len(errors)==0,errors)
  page.close();ctx.close()
 browser.close()
report={'version':'parent-v449-reproduction' if args.parent_repro else 'v450','game':'vanta-frontline','objective':'final-operation failure must retry operation 3, preserve prior earned score, never award failed-run score','checks':checks,'passed':sum(c['pass'] for c in checks),'total':len(checks),'samples':samples,'errors':errors,'durationSeconds':round(time.monotonic()-start,2),'evidenceBoundary':'Real Chromium shipped document plus first-party shared input, controlled/test-only introspection and earned secureUse, emulated touch, not natural FPS full run, no physical controller or installed PWA'}
args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['version','passed','total','durationSeconds']},indent=2))
raise SystemExit(0 if report['passed']==report['total'] else 2)
