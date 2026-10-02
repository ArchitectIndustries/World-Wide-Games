from pathlib import Path
import subprocess,json,re,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True));INPUT=(ROOT/'assets/wwg-input.js').read_text()
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"""
def html(g):
 h=(ROOT/g['path']).read_text(errors='ignore').replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 i=h.lower().find('<script');return h[:i]+PRE+h[i:] if i>=0 else PRE+h

def sig(p):
 return p.evaluate("""()=>({t:document.body.innerText.slice(0,8000),h:document.body.innerHTML.length,c:[...document.querySelectorAll('canvas')].map(x=>{try{return x.toDataURL().slice(-160)}catch(e){return''}}),v:[...document.querySelectorAll('input,select')].map(e=>e.value)})""")
keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','KeyD','KeyS','KeyA','KeyW','Space','KeyE','KeyF','Enter']
res=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':960,'height':700})
 for n,g in enumerate(games,1):
  pe=[];ce=[];p.remove_listener('pageerror',lambda e:None) if False else None
  def perr(e,arr=pe):arr.append(str(e))
  def cerr(m,arr=ce):
   if m.type=='error':arr.append(m.text)
  p.on('pageerror',perr);p.on('console',cerr)
  err=None
  try:
   p.set_content(html(g),wait_until='domcontentloaded',timeout=6000);p.wait_for_timeout(50);before=sig(p)
   for k in keys:
    try:p.keyboard.press(k)
    except:pass
   # click at most first 2 game buttons
   loc=p.locator('button:visible'); clicked=[]
   for j in range(min(loc.count(),2)):
    try:
     lab=(loc.nth(j).inner_text() or '').strip()
     if not re.search(r'home|back',lab,re.I):loc.nth(j).click(timeout=250);clicked.append(lab[:50])
    except:pass
   if p.locator('canvas').count():
    try:
     bb=p.locator('canvas').first.bounding_box()
     if bb:p.mouse.click(bb['x']+bb['width']*.5,bb['y']+bb['height']*.5)
    except:pass
   p.wait_for_timeout(60);after=sig(p);events=p.evaluate('window.__events||[]')
   src=(ROOT/g['path']).read_text(errors='ignore');scripts='\n'.join(re.findall(r'<script[^>]*>(.*?)</script>',src,re.S|re.I))
   fn=len(re.findall(r'\bfunction\s+\w+|\b(?:const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>',scripts)); loops=len(re.findall(r'requestAnimationFrame|setInterval|setTimeout',scripts));state=sum(scripts.count(tk) for tk in ['score','level','wave','stage','health','hp','win','lose','gameOver','complete','localStorage','inventory','round','mission','quest'])
   res.append({'id':g['id'],'title':g['title'],'bytes':len(src.encode()),'errors':pe+ce,'changed':before!=after,'events':[e.get('event') for e in events if isinstance(e,dict)][:8],'buttons':p.locator('button:visible').all_inner_texts()[:12],'canvas':p.locator('canvas').count(),'fn':fn,'loops':loops,'state':state,'controls':g.get('controls',[]),'genres':g.get('genres',[]),'version':g.get('version')})
  except Exception as e:
   err=str(e);res.append({'id':g['id'],'title':g['title'],'audit_error':err,'errors':pe+ce})
  p.remove_listener('pageerror',perr);p.remove_listener('console',cerr)
  print(f'{n:02d} {g["id"]}',flush=True)
 b.close()
for r in res:
 s=0
 if r.get('audit_error') or r.get('errors'):s+=12
 if not r.get('changed',False):s+=5
 if r.get('bytes',99999)<6500:s+=3
 if r.get('fn',99)<5:s+=3
 if r.get('state',99)<8:s+=2
 if r.get('canvas',0)==0 and len(r.get('buttons',[]))<2:s+=2
 r['suspicion']=s
rank=sorted(res,key=lambda x:(-x.get('suspicion',0),x.get('bytes',999999)))
summary={'games':len(res),'audit_errors':[r['id'] for r in res if r.get('audit_error')],'runtime_error_games':[r['id'] for r in res if r.get('errors')],'no_change':[r['id'] for r in res if not r.get('changed',False)],'top_suspicious':[{k:r.get(k) for k in ['id','suspicion','bytes','fn','loops','state','changed','buttons','canvas','events']} for r in rank[:20]]}
Path('/mnt/data/wwg_full_catalog_fast_v26.json').write_text(json.dumps(res,indent=2));Path('/mnt/data/wwg_full_catalog_fast_v26_summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
