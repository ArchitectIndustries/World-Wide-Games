"""Vanta Frontline frame cadence integrity; first-party JS in headless Chromium; synthetic rAF timestamps.
No game code is modified on disk by this test; injected QA bridge is in memory only.
"""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--parent',action='store_true');p.add_argument('--shot',type=Path);a=p.parse_args()
source=(a.root/'games/vanta-frontline/index.html').read_text()
source=source.replace('<script src="../../assets/wwg-input.js"></script>', '<script>'+(a.root/'assets/wwg-input.js').read_text()+'</script>')
source=source.replace('(()=>{\nconst C=', 'window.requestAnimationFrame=()=>0;\n(()=>{\nconst C=',1)
needle='parseOp(0);requestAnimationFrame(loop);'
assert needle in source
bridge="""
window.__qaVanta={
 setup(){begin();enemies=[];activePlay=0;last=1000;finished=false;paused=false;suspended=false;keys={};padId=null;padReady=false;resetPad();p.a=0;render=()=>{};return {p:{...p},uplinks:uplinks.length};},
 run(hz,moving=false){this.setup();keys.up=moving;let t=1000;for(let i=0;i<hz*2;i++){t+=1000/hz;loop(t)}return {activePlay:+activePlay.toFixed(6),x:+p.x.toFixed(5),y:+p.y.toFixed(5),finished,paused,secured,uplinks:uplinks.length};},
 padRun(hz){this.setup();const b=Array.from({length:16},()=>({pressed:false}));const g={index:0,id:'QA standard',connected:true,buttons:b,axes:[0,-1,0,0]};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[g]});padId='0|QA standard';padReady=true;let t=1000;for(let i=0;i<2*hz;i++){t+=1000/hz;loop(t)}return {activePlay:+activePlay.toFixed(6),x:+p.x.toFixed(5),finished};},
 pause(){this.setup();paused=true;loop(1500);return {activePlay,paused};},
 focus(){this.setup();dispatchEvent(new Event('blur'));loop(1500);return {activePlay,suspended};},
 hidden(){this.setup();document.dispatchEvent(new Event('visibilitychange'));return {activePlay,suspended};},
 stall(){this.setup();loop(3000);return {activePlay,position:p.x,finished};},
 finish(){this.setup();activePlay=7;uplinks.forEach(u=>u.done=true);secured=uplinks.length;p.x=extract.x;p.y=extract.y;update(.016);return {finished,score,best:meta.best,clears:meta.clears,title:document.getElementById('overTitle').textContent};}
};
"""+needle
source=source.replace(needle,bridge,1)
checks=[];observations=[]
def ck(name,ok,detail=None):
 checks.append({'name':name,'passed':bool(ok),'detail':detail if not ok else None})
 if not ok:print('FAIL',name,str(detail)[:450],flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1280,800),(390,844),(568,320)]:
  label=f'{width}x{height}'
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<700,has_touch=width<700)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(source,wait_until='domcontentloaded')
  ck(label+' script boots and has start',page.locator('#start').count()==1)
  ck(label+' original gameplay instructions visible',page.locator('.launch .mission-strap').count()>0)
  still=page.evaluate('''()=>[60,30,10,5,2].map(hz=>({hz,...__qaVanta.run(hz)}))''')
  moving=page.evaluate('''()=>[60,30,10,5,2].map(hz=>({hz,...__qaVanta.run(hz,true)}))''')
  observations.append({'viewport':label,'stationary':still,'moving':moving})
  if a.parent:
   ck(label+' baseline 5Hz active clock loses most foreground time',still[3]['activePlay']<.5,still)
   ck(label+' baseline 2Hz active clock loses most foreground time',still[4]['activePlay']<.25,still)
   ck(label+' baseline 5Hz movement trails 60Hz by more than three tiles',moving[3]['x']<moving[0]['x']-3,moving)
  else:
   for st in still:
    ck(label+f' {st["hz"]}Hz charges 2 seconds foreground',abs(st['activePlay']-2)<.018,st)
    ck(label+f' {st["hz"]}Hz no phantom win',not st['finished'] and st['secured']==0,st)
   for st in moving:
    ck(label+f' {st["hz"]}Hz moving clock complete',abs(st['activePlay']-2)<.018,st)
    ck(label+f' {st["hz"]}Hz movement similar to 60Hz',abs(st['x']-moving[0]['x'])<.1,st)
   pad=page.evaluate('''()=>[60,30,10,5,2].map(hz=>({hz,...__qaVanta.padRun(hz)}))''')
   for st in pad:
    ck(label+f' {st["hz"]}Hz gamepad time parity',abs(st['activePlay']-2)<.018,st)
    ck(label+f' {st["hz"]}Hz gamepad travel parity',abs(st['x']-pad[0]['x'])<.1,st)
   paused=page.evaluate('__qaVanta.pause()')
   ck(label+' pause freezes simulation',paused['paused'] and paused['activePlay']==0,paused)
   focus=page.evaluate('__qaVanta.focus()')
   ck(label+' blur freezes and suspends',focus['suspended'] and focus['activePlay']==0,focus)
   stall=page.evaluate('__qaVanta.stall()')
   ck(label+' foreground two-second stall charges full competitive clock',abs(stall['activePlay']-2)<.018,stall)
   ck(label+' stall physics remains bounded',stall['position']<2 and not stall['finished'],stall)
   earned=page.evaluate('__qaVanta.finish()')
   ck(label+' controlled final completion remains coherent',earned['finished'] and earned['score']>0,earned)
   ck(label+' no Chromium script errors',not errors,errors)
   if a.shot and width==390:
    # Rendering screenshot comes from separate unmodified page since QA bypasses rendering.
    raw=(a.root/'games/vanta-frontline/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(a.root/'assets/wwg-input.js').read_text()+'</script>')
    preview=ctx.new_page();preview.set_content(raw,wait_until='domcontentloaded');preview.locator('#start').click();preview.wait_for_timeout(150);a.shot.parent.mkdir(parents=True,exist_ok=True);preview.screenshot(path=str(a.shot),full_page=True);preview.close()
  ctx.close()
 browser.close()
result={'kind':'first-party Chromium JS rAF timestamps synthetic (not physical device FPS); test-only in-memory bridge', 'parent':a.parent,'observations':observations,'checks':checks,'passed':sum(q['passed'] for q in checks),'total':len(checks)}
a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(json.dumps(result,indent=2)+'\n');print('RESULT',result['passed'],'/',result['total'],flush=True)
if result['passed']!=result['total']:raise SystemExit(1)
