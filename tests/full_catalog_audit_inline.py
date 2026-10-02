from pathlib import Path
import subprocess,json,re,time,hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True))
INPUT=(ROOT/'assets/wwg-input.js').read_text()
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){return Object.keys(__s).length}},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"""

def html_for(g):
    h=(ROOT/g['path']).read_text(errors='ignore')
    h=h.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    h=h.replace("<script src='../../assets/wwg-input.js'></script>",f'<script>{INPUT}</script>')
    # Insert localStorage shim before first executable script
    idx=h.lower().find('<script')
    return h[:idx]+PRE+h[idx:] if idx>=0 else PRE+h

def signature(p):
    return p.evaluate("""() => ({
      text:document.body.innerText.slice(0,16000),
      html:document.body.innerHTML.length,
      canvases:[...document.querySelectorAll('canvas')].map(c=>{try{return c.toDataURL()}catch(e){return ''}}),
      values:[...document.querySelectorAll('input,select')].map(e=>e.value),
      disabled:[...document.querySelectorAll('button')].map(b=>b.disabled)
    })""")

keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','KeyD','KeyS','KeyA','KeyW','Space','KeyE','KeyF','KeyQ','Enter','ShiftLeft']
shots=Path('/mnt/data/wwg-audit-shots-v26'); shots.mkdir(exist_ok=True)
results=[]
with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for i,g in enumerate(games,1):
    p=b.new_page(viewport={'width':960,'height':700})
    pe=[];ce=[]
    p.on('pageerror',lambda e,a=pe:a.append(str(e)))
    p.on('console',lambda m,a=ce:a.append(m.text) if m.type=='error' else None)
    h=html_for(g); t=time.time(); audit_error=None
    try:
      p.set_content(h,wait_until='domcontentloaded',timeout=10000);p.wait_for_timeout(220)
      before=signature(p)
      btn_labels=p.locator('button:visible').all_inner_texts()
      # interact: common keyboard
      for k in keys:
        try:p.keyboard.press(k)
        except:pass
      # game-specific UI gets a few semantic clicks
      clicked=[]
      for sel in ['button:visible','[role="button"]:visible']:
        loc=p.locator(sel)
        for j in range(min(loc.count(),5)):
          try:
            el=loc.nth(j); lab=(el.inner_text() or '').strip()
            if re.search(r'home|back|github|external',lab,re.I):continue
            el.click(timeout=500);clicked.append(lab[:60]);p.wait_for_timeout(60)
          except:pass
        if clicked: break
      if p.locator('canvas').count():
        try:
          box=p.locator('canvas').first.bounding_box()
          if box:
            p.mouse.click(box['x']+box['width']*.3,box['y']+box['height']*.5)
            p.mouse.click(box['x']+box['width']*.7,box['y']+box['height']*.4)
        except: pass
      p.wait_for_timeout(300)
      after=signature(p)
      changed=(before!=after)
      events=p.evaluate('window.__events||[]')
      # mobile layout on same page
      p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(60)
      mobile=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth,sh:document.documentElement.scrollHeight})')
      p.set_viewport_size({'width':960,'height':700});p.wait_for_timeout(30)
      p.screenshot(path=str(shots/f'{i:02d}-{g["id"]}.png'))
      src=(ROOT/g['path']).read_text(errors='ignore')
      scripts='\n'.join(re.findall(r'<script[^>]*>(.*?)</script>',src,re.S|re.I))
      fn=len(re.findall(r'\bfunction\s+\w+|\b(?:const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>',scripts))
      loops=len(re.findall(r'requestAnimationFrame|setInterval|setTimeout',scripts))
      state=sum(scripts.count(tk) for tk in ['score','level','wave','stage','health','hp','win','lose','gameOver','complete','localStorage','inventory','round','mission','quest'])
      results.append({'id':g['id'],'title':g['title'],'bytes':len(src.encode()),'load_ms':round((time.time()-t)*1000),'page_errors':pe,'console_errors':ce,'changed':changed,'events':[e.get('event') for e in events if isinstance(e,dict)][:10],'buttons':btn_labels,'clicked':clicked,'canvas':p.locator('canvas').count(),'fn':fn,'loops':loops,'state':state,'mobile_overflow':mobile['sw']>mobile['iw']+2,'mobile':mobile,'controls':g.get('controls',[]),'genres':g.get('genres',[]),'version':g.get('version'),'scoreMeta':g.get('scoreMeta')})
    except Exception as e:
      audit_error=str(e);results.append({'id':g['id'],'title':g['title'],'audit_error':audit_error,'page_errors':pe,'console_errors':ce})
    p.close(); print(f'[{i:02d}/65] {g["id"]}',flush=True)
  b.close()

# pairwise script normalized similarity for clone detection
from difflib import SequenceMatcher
sources={}
for g in games:
  s=(ROOT/g['path']).read_text(errors='ignore')
  # remove css and presentation strings to emphasize mechanics structure
  s=re.sub(r'<style.*?</style>','',s,flags=re.S|re.I)
  s=re.sub(r'#[0-9a-fA-F]{3,8}','',s)
  s=re.sub(r'\s+',' ',s)
  sources[g['id']]=s
pairs=[]
ids=list(sources)
for i in range(len(ids)):
  for j in range(i+1,len(ids)):
    a,bid=ids[i],ids[j]
    # quick length gate
    if min(len(sources[a]),len(sources[bid]))/max(len(sources[a]),len(sources[bid])) < .65: continue
    ratio=SequenceMatcher(None,sources[a][:14000],sources[bid][:14000],autojunk=True).ratio()
    if ratio>.72:pairs.append((round(ratio,3),a,bid))
pairs=sorted(pairs,reverse=True)[:30]
for r in results:
  susp=0
  if r.get('audit_error') or r.get('page_errors') or r.get('console_errors'):susp+=12
  if not r.get('changed',False):susp+=5
  if r.get('bytes',99999)<6500:susp+=3
  if r.get('fn',99)<5:susp+=3
  if r.get('state',99)<8:susp+=2
  if r.get('mobile_overflow'):susp+=3
  if r.get('canvas',0)==0 and len(r.get('buttons',[]))<2:susp+=2
  r['suspicion']=susp
rank=sorted(results,key=lambda x:(-x.get('suspicion',0),x.get('bytes',999999)))
summary={'games':len(results),'audit_errors':[r['id'] for r in results if r.get('audit_error')],'runtime_error_games':[r['id'] for r in results if r.get('page_errors') or r.get('console_errors')],'no_change':[r['id'] for r in results if not r.get('changed',False)],'mobile_overflow':[r['id'] for r in results if r.get('mobile_overflow')],'near_duplicate_pairs':pairs,'top_suspicious':[{k:r.get(k) for k in ['id','suspicion','bytes','fn','loops','state','changed','buttons','canvas','events']} for r in rank[:20]]}
Path('/mnt/data/wwg_full_catalog_audit_v26_inline.json').write_text(json.dumps(results,indent=2))
Path('/mnt/data/wwg_full_catalog_audit_v26_inline_summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
