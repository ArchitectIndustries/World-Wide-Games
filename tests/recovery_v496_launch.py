"""Real Chromium launch interactions with exact shared input; test-only read accessors.
In-memory document fixtures, not a production URL, physical device or full playthrough."""
import argparse,json,math
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=Path('.'));p.add_argument('--out',type=Path,required=True);a=p.parse_args();checks=[]
def ck(name,ok,detail=None):
 checks.append({'name':name,'passed':bool(ok),'detail':None if ok else str(detail)[:300]})
 if not ok:print('FAIL',name,detail,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for game,launch,overlay,canvas,anchor,accessor in [
 ('lattice-armada','#launchBtn','#menu','#game','HUD.launch.onclick=()=>start(st.sector);','window.__recoveryPosition=()=>[st.ship.x,st.ship.y];'),
 ('vanta-frontline','#start','#launch','#c','parseOp(0);requestAnimationFrame(loop);','window.__recoveryPosition=()=>[p.x,p.y];')]:
  raw=(a.root/'games'/game/'index.html').read_text();inputjs=(a.root/'assets/wwg-input.js').read_text();src=raw.replace('<script src="../../assets/wwg-input.js"></script>','<script>'+inputjs+'</script>');assert src.count(anchor)==1;src=src.replace(anchor,accessor+anchor,1)
  for w,h in [(1280,800),(390,844),(568,320),(320,240)]:
   name=f'{game} {w}x{h}';ctx=b.new_context(viewport={'width':w,'height':h},has_touch=w<700,is_mobile=w<700);page=ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(src,wait_until='domcontentloaded');page.wait_for_timeout(40)
   ck(name+' ready button visible',page.locator(launch).is_visible());r=page.locator(launch).bounding_box();ck(name+' launch within viewport',r is not None and r['y']>=0 and r['y']+r['height']<=h+1,r)
   if w<700:page.locator(launch).tap(timeout=5000)
   else:page.locator(launch).click(timeout=5000)
   ck(name+' menu hidden',page.locator(overlay).is_hidden());ck(name+' overlay no layout box',page.locator(overlay).bounding_box() is None);ck(name+' canvas visible',page.locator(canvas).is_visible());
   ck(name+' menu does not intercept center',page.evaluate('(q)=>{const el=document.elementFromPoint(innerWidth/2,innerHeight/2);return !!el&&!el.closest(q)}',overlay));
   if w>=700:
    before=page.evaluate('window.__recoveryPosition()');page.keyboard.down('ArrowRight' if game=='lattice-armada' else 'ArrowUp');page.wait_for_timeout(220);page.keyboard.up('ArrowRight' if game=='lattice-armada' else 'ArrowUp');after=page.evaluate('window.__recoveryPosition()');ck(name+' real keyboard movement',math.dist(before,after)>.001,(before,after));
   if game=='lattice-armada':
    page.keyboard.press('p');ck(name+' pause menu opens',page.locator(overlay).is_visible());page.locator('#resumeBtn').click();ck(name+' resume hides menu',page.locator(overlay).is_hidden());
   else:
    ck(name+' active mode',page.locator('#flow').inner_text()=='ACTIVE');page.keyboard.press('p');ck(name+' pause mode',page.locator('#flow').inner_text()=='PAUSED');page.keyboard.press('p');ck(name+' resume mode',page.locator('#flow').inner_text()=='ACTIVE');
   ck(name+' no script errors',not errs,errs);ctx.close()
 b.close()
result={'passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'scope':'in-memory real Chromium, native launch, no full playthrough or physical mobile/controller claims'};a.out.write_text(json.dumps(result,indent=2));print(result['passed'],result['total']);raise SystemExit(result['passed']!=result['total'])
