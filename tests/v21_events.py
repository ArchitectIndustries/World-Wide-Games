from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>__s[k]||null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 cases={
  'kiteglass-drift':"for(const g of GATES){y=g.y;gateCheck(g.x-1,g.x+1)};finish();",
  'runelight-locksmith':"li=5;load();pins=Array(LEVELS[li].pins).fill(true);total=4200;completeLock();"
 }
 for slug,code in cases.items():
  p=b.new_page(viewport={'width':960,'height':700});errs=[];p.on('pageerror',lambda e,errs=errs:errs.append(str(e)));p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(70);p.evaluate(code);p.wait_for_timeout(80);ev=p.evaluate('window.__events');num=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))];assert num,(slug,ev,errs);out[slug]=num[-1]['event'];assert not errs,(slug,errs);p.close()
 b.close();print({'newScoredGames':len(out),'events':out,'inheritedVerifiedV20ScoredGames':47,'totalCovered':49})
