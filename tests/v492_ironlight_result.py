"""Result transition tests; isolated Chromium with test-only private closure fixtures."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);t=time.monotonic();checks=[]
s=(root/'games/ironlight-breach/index.html').read_text();assert 'window.__resultQA' not in s
s=s.replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
s=s.replace('</head>', '''<script>window.events=[];window.store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});window.addEventListener('message',e=>{if(e.data?.type==='wwg:game-event')events.push(e.data)});requestAnimationFrame=()=>0;</script></head>''',1)
anchor="load(1,'campaign');requestAnimationFrame(loop);\n})();";assert anchor in s
s=s.replace(anchor,anchor.replace('\n})();', '''\nwindow.__resultQA={state:()=>({sector,locked,rankedAttempt,score,hp,clears:clearedSectors.size,ammo:{...ammo}}),clear:()=>{for(const e of enemies)e.hp=0;for(const c of cores)c.taken=true;p.x=exit.x;p.y=exit.y;update(.016)},lose:()=>{hp=0;die()}};\n})();'''))
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 for w,h in [(1280,800),(390,844),(640,360)]:
  p=b.new_page(viewport={'width':w,'height':h},has_touch=w<700,is_mobile=w<700);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  def fresh():p.goto("about:blank");p.set_content(s)
  def ev(js):return p.evaluate(js)
  def state():return ev('__resultQA.state()')
  def click():ev('document.querySelector("#next").click()')
  def clear():ev('__resultQA.clear()')
  def ck(n,v):checks.append({'viewport':[w,h],'name':n,'pass':bool(v)})
  fresh();start=state();click();ck('hidden Continue cannot advance live sector',state()==start)
  fresh();clear();ck('genuine cleared sector locks and shows result',state()['locked'] and state()['clears']==1 and p.locator('#ov').is_visible());ck('result focuses Continue',ev('document.activeElement.id')=='next');click();ck('first Continue advances one sector',state()['sector']==2 and not state()['locked']);after=state();click();ck('duplicate Continue cannot advance another sector',state()==after)
  fresh();clear();p.locator('#next').focus();p.keyboard.press('Space');ck('Space on result button advances normally',state()['sector']==2 and not state()['locked']);ck('ranked chain preserved',state()['rankedAttempt'])
  fresh();clear();p.keyboard.press('KeyR');after=state();ck('R retry clears result and invalidates ranking',after['sector']==1 and not after['locked'] and not after['rankedAttempt'] and not p.locator('#ov').is_visible());click();ck('stale Continue after R cannot bypass sector',state()==after)
  fresh();ev('__resultQA.lose()');ck('defeat has retry focus',ev('document.activeElement.id')=='next');p.locator('#next').focus();p.keyboard.press('Space');ck('Space retries failed sector',state()['sector']==1 and not state()['locked'] and not state()['rankedAttempt']);after=state();click();ck('duplicate retry cannot bypass sector',state()==after)
  fresh();ev('window.events=[]');valid=True
  for n in range(1,6):
   clear();valid=valid and state()['locked'] and state()['sector']==n and state()['clears']==n
   if n<5:
    (p.locator('#next').tap() if w<700 else p.locator('#next').click())
  ck('five genuine sector completions',valid);p.wait_for_timeout(30);ck('one earned ranked campaign event',ev('events.filter(e=>e.event==="campaign-complete"&&e.score>0).length')==1);ck('final result replay starts sector one',p.locator('#next').inner_text()=='Replay campaign');click();ck('replay resets score and ranking',state()['sector']==1 and state()['score']==0 and state()['rankedAttempt'] and not state()['locked']);after=state();click();ck('duplicate replay cannot skip first sector',state()==after);ck('no runtime errors',not errors);p.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
