from pathlib import Path
import json,re,subprocess,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True))
PRE='''<script>(()=>{const s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k])},configurable:true});window.__ev=[];window.__rej=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__ev.push(e.data)});window.addEventListener('unhandledrejection',e=>window.__rej.push(String(e.reason||'rejection')));})();</script>'''
def doc(g):
 p=ROOT/g['path'];h=p.read_text(errors='ignore')
 def repl(m):
  src=m.group(1);t=(p.parent/src).resolve()
  try:t.relative_to(ROOT.resolve())
  except:return m.group(0)
  return '<script>'+t.read_text(errors='ignore')+'</script>' if t.exists() else m.group(0)
 h=re.sub(r'<script\s+src=["\']([^"\']+)["\']\s*></script>',repl,h,flags=re.I)
 i=h.lower().find('<script');return h[:i]+PRE+h[i:] if i>=0 else PRE+h
def missing(g):
 p=ROOT/g['path'];s=p.read_text(errors='ignore');out=[]
 for _,v in re.findall(r'\b(src|href)=["\']([^"\']+)["\']',s,re.I):
  if v.startswith(('http:','https:','//','data:','#','mailto:','javascript:')):continue
  v=v.split('?',1)[0].split('#',1)[0]
  if not v:continue
  t=(p.parent/v).resolve()
  try:t.relative_to(ROOT.resolve())
  except:continue
  if not t.exists():out.append(v)
 return sorted(set(out))
keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','KeyD','KeyS','KeyA','KeyW','Space','KeyE','KeyF','KeyQ','ShiftLeft','Enter']
start=re.compile(r'\b(start|play|begin|launch|deploy|enter|continue|ready|new game)\b',re.I)
skip=re.compile(r'home|back|github|settings|controls|help',re.I)
res=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':960,'height':700})
 for i,g in enumerate(games,1):
  pe=[];ce=[]
  def onpe(e,a=pe):a.append(str(e))
  def once(m,a=ce):
   if m.type=='error':a.append(m.text)
  p.on('pageerror',onpe);p.on('console',once)
  r={'id':g['id'],'title':g['title'],'missing':missing(g)}
  try:
   p.goto('about:blank',wait_until='commit',timeout=1500)
   p.set_viewport_size({'width':960,'height':700})
   p.set_content(doc(g),wait_until='domcontentloaded',timeout=4000);p.wait_for_timeout(35)
   before=p.evaluate('({t:document.body.innerText.slice(0,10000),h:document.body.innerHTML.length,n:document.getElementsByTagName("*").length})')
   labels=p.locator('button:visible').all_inner_texts()[:30]
   for j,lab in enumerate(labels):
    if lab and start.search(lab) and not skip.search(lab):
     try:p.locator('button:visible').nth(j).click(timeout=200);p.wait_for_timeout(20)
     except:pass
     break
   for k in keys:
    try:p.keyboard.press(k)
    except:pass
   if p.locator('canvas').count():
    try:
     bb=p.locator('canvas').first.bounding_box()
     if bb and bb['width']>10 and bb['height']>10:p.mouse.click(bb['x']+bb['width']*.5,bb['y']+bb['height']*.5)
    except:pass
   try:p.keyboard.press('KeyP');p.keyboard.press('KeyP');p.keyboard.press('KeyR')
   except:pass
   p.wait_for_timeout(40)
   after=p.evaluate('({t:document.body.innerText.slice(0,10000),h:document.body.innerHTML.length,n:document.getElementsByTagName("*").length,ev:window.__ev||[],rej:window.__rej||[]})')
   p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(15)
   mob=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})')
   r.update({'errors':pe+ce+after['rej'],'buttons':labels,'changed':before!= {k:after[k] for k in ('t','h','n')},'events':[e.get('event') for e in after['ev'] if isinstance(e,dict)][:12],'mobile_overflow':mob['sw']>mob['iw']+2,'bad_text':bool(re.search(r'(^|\\s)(NaN|undefined)(\\s|$)',after['t'],re.I)),'canvas':p.locator('canvas').count()})
  except Exception as e:r['audit_error']=str(e);r['errors']=pe+ce
  p.remove_listener('pageerror',onpe);p.remove_listener('console',once)
  r['ok']=not(r.get('audit_error') or r.get('errors') or r['missing'] or r.get('mobile_overflow') or r.get('bad_text'))
  res.append(r);print(f'{i:02d}/{len(games)} {g["id"]} {"PASS" if r["ok"] else "CHECK"}',flush=True)
 b.close()
summary={'games':len(res),'passed':sum(x['ok'] for x in res),'checks':[x['id'] for x in res if not x['ok']],'runtime_errors':{x['id']:x.get('errors') for x in res if x.get('errors')},'audit_errors':{x['id']:x.get('audit_error') for x in res if x.get('audit_error')},'missing_refs':{x['id']:x['missing'] for x in res if x['missing']},'mobile_overflow':[x['id'] for x in res if x.get('mobile_overflow')],'bad_text':[x['id'] for x in res if x.get('bad_text')],'no_change':[x['id'] for x in res if not x.get('changed',False)]}
(ROOT/'tests/v71_full_catalog_fast_results.json').write_text(json.dumps(res,indent=2));(ROOT/'tests/v71_full_catalog_fast_summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2));raise SystemExit(0 if not summary['checks'] else 2)
