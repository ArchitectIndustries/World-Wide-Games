"""Real Chromium document-injected game shell tests. Local origin navigation is blocked.
Actual shipped HTML and JS; isolated storage fixture and same-window message event.
"""
from pathlib import Path
import os,json,re,time,sys,shutil
from playwright.sync_api import sync_playwright
R=Path(os.environ.get('WWG_ROOT',Path(__file__).resolve().parents[1])); OUT=Path(os.environ.get('WWG_QA_OUT','/tmp/wwgqa')); OUT.mkdir(parents=True,exist_ok=True)
parent='--parent' in sys.argv
base=(R/'game.html').read_text(); base=re.sub(r'<script src="([^"?]+)(?:\?[^\"]*)?"></script>',lambda m: ('<script>window.WWG_GAMES=[...window.WWG_GAMES].sort((a,b)=>Number(b.id==="aetherfoil-circuit")-Number(a.id==="aetherfoil-circuit"));</script>' if m[1]=='js/game-page.js' else '')+'<script>'+ (R/m[1]).read_text()+'</script>',base)
base=base.replace('<link rel="stylesheet" href="assets/styles.css"/>','<style>'+(R/'assets/styles.css').read_text()+'</style>')
fixtures=[('null prefs',{'wwg:prefs':None}),('null plays',{'wwg:plays':None}),('wrong recent',{'wwg:recent':{}}),('wrong favorites',{'wwg:favorites':{}}),('wrong later',{'wwg:play-later':False}),('null ratings',{'wwg:ratings':None}),('null score map',{'wwg:scores':None}),('nested session',{'wwg:sessions':{'aetherfoil-circuit':3}}),('nested daily',{'wwg:daily':{'TODAY':3}}),('wrong event history',{'wwg:run-history':{}}),('malformed events',{'wwg:events':None})]
checks=[]; start=time.monotonic()
def ck(label,cond):
 checks.append({'name':label,'pass':bool(cond)})
 if not cond: print('FAIL',label,flush=True)
def fixture(seed,deny=False):
 raw={k:json.dumps(v) for k,v in seed.items()}
 pre='''<script>window.__store=SEED; if(Object.hasOwn(__store,'wwg:daily')) __store['wwg:daily']=__store['wwg:daily'].replace('TODAY',new Date().toLocaleDateString('en-CA'));window.__initial={...__store};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(__store,k)?__store[k]:null,setItem:(k,v)=>{if(DENY)throw new DOMException('quota','QuotaExceededError');__store[k]=String(v)},removeItem:k=>delete __store[k]}});</script>'''.replace('SEED',json.dumps(raw)).replace('DENY',str(deny).lower())
 return base.replace('</head>',pre+'</head>',1)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('WWG_CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1280,800),(390,844)]:
  for name,seed in fixtures+[('clean',{}),('valid existing',{'wwg:favorites':['aetherfoil-circuit'],'wwg:plays':{'aetherfoil-circuit':4},'wwg:scores':{'aetherfoil-circuit':1234567890123.125}}),('storage quota',{})]:
   page=b.new_page(viewport={'width':width,'height':height},is_mobile=width<500,has_touch=width<500);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(fixture(seed,name=='storage quota'),wait_until='domcontentloaded');page.wait_for_timeout(40)
   prefix=f'{width} {name}'
   # first game id obtained from actual catalog, not hardcoded event source
   game=page.evaluate('window.WWG_GAMES[0].id'); title=page.locator('#gameTitle').inner_text();
   boot=title!='Loading game…' and not errors
   if parent:
    if name in ['null prefs','null plays','wrong recent','wrong favorites','wrong later','null ratings','null score map','nested daily']:
     ck(prefix+' reproduced shell exception',not boot)
    page.close();continue
   ck(prefix+' boot and no exception',boot)
   ck(prefix+' game iframe source',page.locator('#gameFrame').get_attribute('src') is not None)
   if not boot:page.close();continue
   page.locator('#favoriteButton').click(); page.locator('#laterButton').click(); page.locator('[data-rate="4"]').click()
   page.evaluate('''(id)=>window.dispatchEvent(new MessageEvent('message',{source:document.querySelector('#gameFrame').contentWindow,origin:location.origin,data:{type:'wwg:game-event',game:id,event:'qa-test',score:42.125}}))''',game)
   ck(prefix+' interactions no exception',not errors)
   ck(prefix+' favorite and later usable',('Favorite' in page.locator('#favoriteButton').inner_text() and 'Play later' in page.locator('#laterButton').inner_text()))
   ck(prefix+' recent score shown', '42.125' in page.locator('#runSummary').inner_text())
   if name not in ['clean','valid existing','storage quota']:
    ck(prefix+' original corrupt storage retained',page.evaluate('(k)=>__store[k]===__initial[k]',next(iter(seed))))
    ck(prefix+' recovery notice shown',page.locator('#storageNotice').is_visible())
   if name=='storage quota':ck(prefix+' quota notice shown',page.locator('#storageNotice').is_visible())
   if name=='valid existing' and game=='aetherfoil-circuit':ck(prefix+' large precise score retained',page.evaluate("JSON.parse(__store['wwg:scores'])['aetherfoil-circuit']") == 1234567890123.125)
   page.close()
 b.close()
result={'mode':'parent' if parent else 'candidate','passed':sum(x['pass'] for x in checks),'total':len(checks),'elapsedSeconds':round(time.monotonic()-start,3),'checks':checks,'scope':'real Chromium document injection, localStorage and message fixture; no production or installed PWA'}
(OUT/('profile-parent.json' if parent else 'profile-final.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='checks'}));sys.exit(any(not x['pass'] for x in checks))
