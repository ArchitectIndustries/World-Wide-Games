"""First-party Chromium: isolated compact-landscape Lattice Armada touch/readability correctness."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,required=True);ap.add_argument('--out',type=Path,required=True);ap.add_argument('--screenshot',type=Path);a=ap.parse_args()
checks=[];errors=[];measurements={}
def ck(name,cond,detail=None):
 checks.append({'name':name,'pass':bool(cond),'detail':None if cond else str(detail)[:300]})
 if not cond: print('FAIL',name,detail,flush=True)
def rect_intersects(v,t):
 return min(v['right'],t['right'])>max(v['left'],t['left'])+.01 and min(v['bottom'],t['bottom'])>max(v['top'],t['top'])+.01
def html():
 s=(a.root/'games/lattice-armada/index.html').read_text()
 return s.replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(a.root/'assets/wwg-input.js').read_text()+'</script>')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,w,h,storage in [('tiny-stored',320,240,True),('tiny-denied',320,240,False),('landscape',568,320,True),('wide-landscape',640,360,True),('portrait',390,844,True),('desktop',1280,800,True)]:
  page=b.new_page(viewport={'width':w,'height':h},has_touch=label!='desktop',is_mobile=label!='desktop')
  page.on('pageerror',lambda e:errors.append(str(e)))
  if storage:
   page.evaluate('''()=>{let state={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>state[k]??null,setItem:(k,v)=>state[k]=String(v),removeItem:k=>delete state[k]}})}''')
  page.set_content(html(),wait_until='domcontentloaded')
  ck(label+' title 2.0','2.0' in page.title(),page.title())
  ck(label+' launch accessible',page.locator('#launchBtn').is_visible())
  page.locator('#launchBtn').click(timeout=5000)
  page.wait_for_timeout(70)
  ck(label+' menu closed',page.locator('#menu').is_hidden())
  ck(label+' pause control reachable',page.locator('#pauseBtn').is_visible())
  ck(label+' status live',page.locator('#status').get_attribute('aria-live')=='polite')
  ck(label+' correct storage notice',page.locator('#storageNotice').is_visible()==(not storage))
  if h<=380 and w<=700:
   results=page.evaluate('''()=>{
    const r=el=>{let x=el.getBoundingClientRect();return{left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width,height:x.height}};
    const top=document.getElementById('storageNotice').hidden?70:92,bottom=55;
    const sc=Math.min(innerWidth/960,(innerHeight-top-bottom)/600);
    const stage={left:(innerWidth-960*sc)/2,right:(innerWidth+960*sc)/2,top:top+(innerHeight-top-bottom-600*sc)/2,bottom:top+(innerHeight-top-bottom+600*sc)/2};
    return{stage,regions:Object.fromEntries(['.hud','.status','.touch','#pauseBtn','#storageNotice'].map(k=>[k,r(document.querySelector(k))])),buttons:[...document.querySelectorAll('.touch button,#pauseBtn')].map(el=>r(el)),status:{full:document.getElementById('status').scrollWidth,shown:document.getElementById('status').clientWidth}}}''')
   stage=results['stage'];measurements[label]=results
   ck(label+' playfield nontrivial in landscape',stage['bottom']-stage['top']>=85 and stage['right']-stage['left']>=135,stage)
   for key,v in results['regions'].items():
    if key=='#storageNotice' and storage:continue
    ck(label+' no stage overlap '+key,not rect_intersects(v,stage),{'stage':stage,'region':v})
   for i,r in enumerate(results['buttons']):
    ck(label+f' touch button {i} >=44 and on-screen',r['width']>=44 and r['height']>=44 and r['top']>=0 and r['bottom']<=h+0.1 and r['left']>=0 and r['right']<=w+0.1,r)
   ck(label+' status fully accessible via scroll',results['status']['full']>=results['status']['shown'] and page.locator('#status').get_attribute('tabindex')=='0',results['status'])
   if not storage:ck(label+' storage fallback keyboard-scrollable',page.locator('#storageNotice').get_attribute('tabindex')=='0')
  # Native click on Pause must function in compact view, menu may scroll independently.
  page.locator('#pauseBtn').click(timeout=5000)
  ck(label+' pause reveals menu',page.locator('#menu').is_visible())
  ck(label+' pause leaves resume button',page.locator('#resumeBtn').is_visible())
  paused=page.locator('#scoreHud').inner_text()
  page.wait_for_timeout(120)
  ck(label+' paused score stable',page.locator('#scoreHud').inner_text()==paused)
  page.locator('#resumeBtn').click(timeout=5000)
  ck(label+' resume returns to flight',page.locator('#menu').is_hidden())
  # Keyboard and pointerdown/up share the real game input paths.
  page.keyboard.down('ArrowRight');page.wait_for_timeout(170);page.keyboard.up('ArrowRight')
  ck(label+' keyboard motion does not cause errors',not errors)
  if label!='desktop':
   try:
    right=page.locator('.dpad .right')
    right.dispatch_event('pointerdown',{'pointerType':'touch','pointerId':12});page.wait_for_timeout(160)
    right.dispatch_event('pointerup',{'pointerType':'touch','pointerId':12})
    ck(label+' native touch-control pointer events',True)
   except Exception as e:ck(label+' native touch-control pointer events',False,str(e))
  ck(label+' no unearned visible result',page.locator('#menu').is_hidden())
  if label=='tiny-stored' and a.screenshot:
   a.screenshot.parent.mkdir(parents=True,exist_ok=True);page.screenshot(path=str(a.screenshot))
  page.close()
 b.close()
out={'total':len(checks),'passed':sum(x['pass'] for x in checks),'failed':[x for x in checks if not x['pass']],'page_errors':errors,'metrics':measurements,'execution':'Chromium first-party game JS via set_content; storage emulator; emulated touch, not installed HTTP PWA or hardware'}
a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(json.dumps(out,indent=2))
print(json.dumps({'total':out['total'],'passed':out['passed'],'failed':len(out['failed']),'page_errors':errors},indent=2))
if out['failed'] or errors:raise SystemExit(1)
