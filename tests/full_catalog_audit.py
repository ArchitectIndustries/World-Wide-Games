from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading, subprocess, json, time, re, hashlib, os
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],cwd=ROOT,text=True))

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
os.chdir(ROOT)
srv=ThreadingHTTPServer(('127.0.0.1',0),Quiet)
threading.Thread(target=srv.serve_forever,daemon=True).start()
port=srv.server_address[1]
base=f'http://127.0.0.1:{port}'
shotdir=Path('/mnt/data/wwg-audit-shots-v26'); shotdir.mkdir(exist_ok=True)
results=[]

common_keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','KeyD','KeyS','KeyA','KeyW','Space','KeyE','KeyF','KeyQ','KeyR','Enter','ShiftLeft']
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    ctx=browser.new_context(viewport={'width':960,'height':700},has_touch=True)
    for i,g in enumerate(games,1):
        p=ctx.new_page()
        page_errors=[]; console_errors=[]; request_failures=[]
        p.on('pageerror',lambda e,arr=page_errors: arr.append(str(e)))
        p.on('console',lambda m,arr=console_errors: arr.append(m.text) if m.type=='error' else None)
        p.on('requestfailed',lambda r,arr=request_failures: arr.append(r.url))
        p.add_init_script("""window.__wwgEvents=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__wwgEvents.push(e.data)});""")
        url=base+'/'+g['path']
        t0=time.time(); status='ok'; load_error=None
        try:
            resp=p.goto(url,wait_until='domcontentloaded',timeout=10000)
            p.wait_for_timeout(350)
        except Exception as e:
            status='load-fail'; load_error=str(e)
        load_ms=round((time.time()-t0)*1000)
        if status=='ok':
            try:
                before=p.evaluate("""() => ({
                  text: document.body.innerText.slice(0,12000),
                  html: document.body.innerHTML.length,
                  canvases:[...document.querySelectorAll('canvas')].map(c=>{try{return c.toDataURL().slice(-400)}catch(e){return ''}}),
                  buttons:[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>b.innerText.trim()).filter(Boolean),
                  inputs:[...document.querySelectorAll('input,select')].filter(e=>e.offsetParent!==null).length,
                  sw:document.documentElement.scrollWidth, iw:innerWidth, sh:document.documentElement.scrollHeight
                })""")
                # keyboard exercise
                for k in common_keys:
                    try: p.keyboard.press(k)
                    except: pass
                # pointer/touch exercise on canvas and a few game buttons, avoiding obvious navigation
                canv=p.locator('canvas')
                if canv.count():
                    try:
                        box=canv.first.bounding_box()
                        if box:
                            p.mouse.click(box['x']+box['width']*0.35,box['y']+box['height']*0.55)
                            p.mouse.click(box['x']+box['width']*0.65,box['y']+box['height']*0.40)
                    except: pass
                btns=p.locator('button:visible')
                clicked=[]
                for bi in range(min(btns.count(),4)):
                    try:
                        b=btns.nth(bi); label=(b.inner_text() or '').strip()
                        if re.search(r'home|back|external|github',label,re.I): continue
                        b.click(timeout=600); clicked.append(label[:50]); p.wait_for_timeout(80)
                    except: pass
                p.wait_for_timeout(400)
                after=p.evaluate("""() => ({
                  text: document.body.innerText.slice(0,12000),
                  html: document.body.innerHTML.length,
                  canvases:[...document.querySelectorAll('canvas')].map(c=>{try{return c.toDataURL().slice(-400)}catch(e){return ''}}),
                  events:window.__wwgEvents||[],
                  sw:document.documentElement.scrollWidth, iw:innerWidth
                })""")
                changed = (before['text']!=after['text'] or before['canvases']!=after['canvases'] or before['html']!=after['html'])
                # mobile overflow check
                p.set_viewport_size({'width':390,'height':844}); p.wait_for_timeout(80)
                mobile=p.evaluate("({sw:document.documentElement.scrollWidth,iw:innerWidth})")
                overflow=mobile['sw']>mobile['iw']+2
                # screenshot desktop-ish at mobile? restore first
                p.set_viewport_size({'width':960,'height':700}); p.wait_for_timeout(60)
                p.screenshot(path=str(shotdir/f"{i:02d}-{g['id']}.png"),full_page=False)
                src=(ROOT/g['path']).read_text(errors='ignore')
                script_text='\n'.join(re.findall(r'<script[^>]*>(.*?)</script>',src,re.S|re.I))
                fn_count=len(re.findall(r'\bfunction\s+\w+|\b(?:const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>',script_text))
                state_tokens=sum(src.count(tok) for tok in ['score','level','wave','stage','health','hp','win','lose','gameOver','complete','localStorage','requestAnimationFrame'])
                results.append({
                  'id':g['id'],'title':g['title'],'path':g['path'],'bytes':len(src.encode()),'load_ms':load_ms,
                  'page_errors':page_errors,'console_errors':console_errors,'request_failures':request_failures,
                  'buttons':before['buttons'],'inputs':before['inputs'],'canvas_count':len(before['canvases']),'changed_after_input':changed,
                  'event_count':len(after['events']),'events':[e.get('event') for e in after['events'][:8] if isinstance(e,dict)],
                  'mobile_overflow':overflow,'clicked':clicked,'fn_count':fn_count,'state_tokens':state_tokens,
                  'controls':g.get('controls',[]),'genres':g.get('genres',[]),'version':g.get('version'),'scoreMeta':g.get('scoreMeta')
                })
            except Exception as e:
                results.append({'id':g['id'],'title':g['title'],'path':g['path'],'load_ms':load_ms,'audit_error':str(e),'page_errors':page_errors,'console_errors':console_errors,'request_failures':request_failures})
        else:
            results.append({'id':g['id'],'title':g['title'],'path':g['path'],'load_ms':load_ms,'load_error':load_error,'page_errors':page_errors,'console_errors':console_errors,'request_failures':request_failures})
        p.close()
        print(f"[{i:02d}/{len(games)}] {g['id']}",flush=True)
    browser.close()
srv.shutdown()

out=Path('/mnt/data/wwg_full_catalog_audit_v26.json'); out.write_text(json.dumps(results,indent=2))
# summary & suspicion score
for r in results:
    suspicion=0
    if r.get('page_errors') or r.get('console_errors') or r.get('load_error') or r.get('audit_error'): suspicion+=10
    if not r.get('changed_after_input',False): suspicion+=4
    if r.get('bytes',99999)<6500: suspicion+=3
    if r.get('fn_count',99)<5: suspicion+=2
    if r.get('state_tokens',99)<8: suspicion+=2
    if r.get('mobile_overflow'): suspicion+=2
    if r.get('canvas_count',0)==0 and len(r.get('buttons',[]))<2 and r.get('inputs',0)==0: suspicion+=2
    r['suspicion']=suspicion
rank=sorted(results,key=lambda r:(-r.get('suspicion',0),r.get('bytes',999999)))
summary={
 'games':len(results),
 'load_failures':[r['id'] for r in results if r.get('load_error')],
 'runtime_error_games':[r['id'] for r in results if r.get('page_errors') or r.get('console_errors')],
 'mobile_overflow_games':[r['id'] for r in results if r.get('mobile_overflow')],
 'no_change_after_generic_input':[r['id'] for r in results if not r.get('changed_after_input',False)],
 'top_suspicious':[{k:r.get(k) for k in ['id','title','suspicion','bytes','fn_count','state_tokens','changed_after_input','buttons','canvas_count','event_count']} for r in rank[:20]]
}
Path('/mnt/data/wwg_full_catalog_audit_v26_summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
