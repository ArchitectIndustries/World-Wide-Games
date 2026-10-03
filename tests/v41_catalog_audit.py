from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re

ROOT=Path(__file__).resolve().parents[1]
CAT=(ROOT/'js/games.js').read_text()
paths=re.findall(r"\bpath\s*:\s*['\"]([^'\"]+)['\"]",CAT)
ids=re.findall(r"\bid\s*:\s*['\"]([^'\"]+)['\"]",CAT)
assert len(paths)==len(ids)==75,(len(ids),len(paths))
input_js=(ROOT/'assets/wwg-input.js').read_text()
PRE="""<script>const __ls={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__ls,k)?__ls[k]:null,setItem:(k,v)=>__ls[k]=String(v),removeItem:k=>delete __ls[k],clear:()=>{for(const k in __ls)delete __ls[k]}},configurable:true});</script>"""
fail=[];changed=0
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    for game_id,rel in zip(ids,paths):
        page=browser.new_page(viewport={'width':960,'height':720})
        errs=[]; page.on('pageerror',lambda e,errs=errs: errs.append(str(e)))
        try:
            html=(ROOT/rel).read_text()
            html=re.sub(r'<script\s+src=["\'][^"\']*wwg-input\.js["\']\s*></script>',lambda _:f'<script>{input_js}</script>',html,flags=re.I)
            pos=html.lower().find('<script')
            html=html[:pos]+PRE+html[pos:] if pos>=0 else PRE+html
            page.set_content(html,wait_until='domcontentloaded',timeout=8000)
            page.wait_for_timeout(60)
            before=page.locator('body').inner_text()[:4000]
            for key in ['ArrowRight','ArrowDown','Space','Enter']:
                page.keyboard.press(key)
            page.wait_for_timeout(50)
            after=page.locator('body').inner_text()[:4000]
            if after!=before: changed+=1
            if errs: fail.append({'id':game_id,'errors':errs[:3]})
        except Exception as e:
            fail.append({'id':game_id,'errors':[str(e)]})
        finally: page.close()
    browser.close()
assert not fail,fail
print(json.dumps({'runtimeClean':len(ids),'genericChanged':changed,'genericNoChange':len(ids)-changed}))
