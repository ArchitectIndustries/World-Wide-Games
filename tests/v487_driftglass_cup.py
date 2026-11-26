"""Real Chromium physics with controlled approach fixtures; no seeded settle timer."""
import sys,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]); out=Path(sys.argv[2]); t=time.monotonic()
h=(root/'games/driftglass-links/index.html').read_text().replace('</head>', '<script>requestAnimationFrame=()=>0;window.events=[];addEventListener("message",e=>{if(e.data?.event==="course-complete")events.push(e.data)})</script></head>',1)
checks=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  p=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(h)
  def ev(s):return p.evaluate(s)
  def check(name,value):
   checks.append({'viewport':[w,ht],'name':name,'pass':bool(value)});print(w,name,bool(value),flush=True)
  for rate in [30,60,120]:
   for speed in [0,2,12,45]:
    res=ev(f'''()=>{{reset();shoot();ball.x=current().cup[0];ball.y=current().cup[1];ball.vx={speed};ball.vy=0;let frames=0;while(hole===0&&frames<{rate}*2){{advanceBall(1/{rate});frames++}}return {{hole,strokes,frames,moving}}}}''')
    check(f'{rate} Hz {speed} speed cup completes without extra stroke',res['hole']==1 and res['strokes']==1 and not res['moving'] and .28<=res['frames']/rate<=.5)
   check(f'{rate} Hz outside cup comes to rest without clear',ev(f'()=>{{reset();shoot();ball.x=current().cup[0]-20;ball.y=current().cup[1];ball.vx=0;ball.vy=0;advanceBall(1/{rate});return hole===0&&!moving&&settle===0&&strokes===1}}'))
   check(f'{rate} Hz fast pass is not captured',ev(f'()=>{{reset();shoot();ball.x=current().cup[0]-18;ball.y=current().cup[1];ball.vx=300;ball.vy=0;for(let i=0;i<Math.ceil({rate}*.25);i++)advanceBall(1/{rate});return hole===0&&settle===0&&strokes===1}}'))
  check('rolling approach from outside cup settles',ev('()=>{reset();shoot();ball.x=current().cup[0]-15;ball.y=current().cup[1];ball.vx=22;ball.vy=0;for(let i=0;i<90&&moving;i++)advanceBall(1/60);return hole===1&&strokes===1}'))
  check('brief contact then exit clears dwell',ev('()=>{reset();shoot();ball.x=current().cup[0]+13.8;ball.y=current().cup[1];ball.vx=9;ball.vy=0;for(let i=0;i<30&&moving;i++)advanceBall(1/60);return hole===0&&settle===0&&strokes===1}'))
  check('early cup contact cannot be shot again',ev('()=>{reset();shoot();ball.x=current().cup[0];ball.y=current().cup[1];ball.vx=2;ball.vy=0;advanceBall(.016);shoot();return hole===0&&moving&&strokes===1&&settle>0}'))
  check('reset clears pending cup dwell',ev('()=>{reset();return hole===0&&strokes===0&&settle===0&&!moving}'))
  check('water penalty still takes precedence',ev('()=>{shoot();let r=current().water[0];ball.x=r.x+r.w/2;ball.y=r.y+r.h/2;ball.vx=0;ball.vy=0;advanceBall(.016);return hole===0&&strokes===2&&!moving&&settle===0&&ball.x===current().s[0]}'))
  ev('reset();events.length=0');
  for k in range(6):
   if w<700:p.locator('[data-a="shoot"]').tap()
   else:p.locator('canvas').focus();p.keyboard.press('Space')
   res=ev('()=>{let c=current().cup;ball.x=c[0]-1;ball.y=c[1];ball.vx=2;ball.vy=0;for(let j=0;j<24&&moving;j++)advanceBall(1/60);return {hole,finished,strokes}}')
   check(f'campaign hole {k+1} real input then low speed approach',res=={'hole':min(k+1,5),'finished':k==5,'strokes':k+1})
  p.wait_for_timeout(30)
  check('one ranked six-stroke result',ev('events.length===1&&events[0].score===6&&events[0].meta.direction==="low"'))
  check('terminal replay visible',p.locator('#replay').is_visible())
  if p.locator('#replay').is_visible():p.locator('#replay').click()
  check('replay resets score without duplicate result',ev('hole===0&&strokes===0&&!finished&&events.length===1'))
  check('no uncaught runtime errors',not errors);p.close()
 b.close()
res={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks,'scope':'isolated Chromium, controlled ball position/velocity, actual input and physics, no seeded dwell; not unassisted gameplay'};out.write_text(json.dumps(res,indent=2));sys.exit(res['passed']!=res['total'])
