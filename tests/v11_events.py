from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve()
PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def raw(slug):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 cases={
  'ashfall-caravan':"for(let z=0;z<8;z++)choose(0);",
  'twinforge-expedition':"sector=2;energy=70;score=2000;finish();",
  'mothlight-museum':"room=2;found=new Set([0,1,2,3,4]);roomDone();",
  'windward-cargo':"delivery=4;score=2600;finish();",
  'cipher-court':"idx=cases.length-1;score=2500;selected=cases[idx].culprit;document.querySelector('#accuse').click();",
  'moonwake-angler':"catches=5;score=3000;finish();"
 }
 out={}
 for slug,code in cases.items():
  p=b.new_page(viewport={'width':960,'height':540});errs=[];p.on('pageerror',lambda e,errs=errs:errs.append(str(e)));p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(60);p.evaluate(code);p.wait_for_timeout(70);ev=p.evaluate('window.__events');num=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))];assert num,(slug,ev,errs);out[slug]=num[-1]['event'];assert not errs,(slug,errs);p.close()
 print({'scoredGames':len(out),'events':out});b.close()
