from pathlib import Path
import subprocess,json,re
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
PRE="""<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})(),configurable:true});</script>"""
def raw(g):
    h=(ROOT/g['path']).read_text(errors='ignore').replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');i=h.lower().find('<script');return h[:i]+PRE+h[i:]
keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','KeyD','KeyS','KeyA','KeyW','Space','KeyE','KeyF','Enter']
fail=[];changed=[];clean=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    for g in games:
        p=b.new_page(viewport={'width':960,'height':700});errs=[];p.on('pageerror',lambda e,a=errs:a.append(str(e)));p.on('console',lambda m,a=errs:a.append(m.text) if m.type=='error' else None)
        try:
            p.set_content(raw(g),wait_until='domcontentloaded',timeout=5000);p.wait_for_timeout(20)
            before=p.evaluate("()=>({t:document.body.innerText.slice(0,4000),c:[...document.querySelectorAll('canvas')].map(x=>{try{return x.toDataURL().slice(-80)}catch(e){return''}}),h:document.body.innerHTML.length})")
            for k in keys:
                try:p.keyboard.press(k)
                except:pass
            if p.locator('button:visible').count():
                try:p.locator('button:visible').first.click(timeout=150)
                except:pass
            p.wait_for_timeout(25)
            after=p.evaluate("()=>({t:document.body.innerText.slice(0,4000),c:[...document.querySelectorAll('canvas')].map(x=>{try{return x.toDataURL().slice(-80)}catch(e){return''}}),h:document.body.innerHTML.length})")
            if before!=after:changed.append(g['id'])
            if errs:fail.append((g['id'],errs))
            else:clean.append(g['id'])
        except Exception as e:fail.append((g['id'],[str(e)]))
        p.close()
    b.close()
assert len(clean)==65 and not fail,fail
# Generic input isn't expected to hit geometry-specific actions; direct checks in v27_fixes cover the known exceptions.
print(json.dumps({'runtimeClean':len(clean),'genericStateChangeObserved':len(changed),'genericNoChange':[g['id'] for g in games if g['id'] not in changed]}))
