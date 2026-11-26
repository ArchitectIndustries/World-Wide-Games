"""Bounded first-party Chromium smoke in isolated documents, not real-origin PWA."""
import json,os,re,subprocess,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(sys.argv[1]).resolve(); out=Path(sys.argv[2]); start=time.monotonic()
games=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"],cwd=R,text=True))
pre='''<script>(()=>{let s={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>{s={}}}});})();</script>'''
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for i,g in enumerate(games):
  p=R/g['path']; h=p.read_text(); errors=[]; missing=[]
  def inline(m):
   u=(p.parent/m.group(1).split('?')[0]).resolve()
   if not u.is_relative_to(R) or not u.is_file():missing.append(m.group(1));return m.group(0)
   return '<script>'+u.read_text()+'</script>'
  h=re.sub(r'<script\s+src=["\']([^"\']+)["\']\s*></script>',inline,h,flags=re.I); h=re.sub(r'</head>',pre+'</head>',h,count=1,flags=re.I)
  if pre not in h:h=pre+h
  mobile=i%2==1; pg=b.new_page(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},is_mobile=mobile,has_touch=mobile);pg.on('pageerror',lambda e:errors.append(str(e)))
  t=time.monotonic();r={'id':g['id'],'mobileEmulated':mobile,'missingScripts':missing}
  try:
   pg.set_content(h,wait_until='domcontentloaded',timeout=4500);pg.wait_for_timeout(25)
   r['body']=pg.locator('body').count()==1
   pg.keyboard.press('ArrowRight');pg.keyboard.press('KeyD');pg.keyboard.press('Escape');pg.wait_for_timeout(15)
   r['viewport']=pg.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
   r['elapsedMs']=round((time.monotonic()-t)*1000)
  except Exception as e:r['exception']=str(e)
  r['runtimeErrors']=errors;r['pass']=bool(r.get('body')) and not(errors or missing or r.get('exception'));results.append(r);pg.close()
  print(i+1,g['id'],r['pass'],flush=True)
  out.write_text(json.dumps({'passed':sum(x['pass'] for x in results),'total':len(results),'results':results},indent=2))
 b.close()
summary={'scope':'isolated real Chromium document startup and three key presses; alternating desktop/mobile emulation; no full playthrough, offline registration or physical-device benchmark','passed':sum(r['pass'] for r in results),'total':len(results),'elapsedSeconds':round(time.monotonic()-start,3),'results':results};out.write_text(json.dumps(summary,indent=2));print(summary['passed'],summary['total']);sys.exit(0 if summary['passed']==summary['total'] else 1)
