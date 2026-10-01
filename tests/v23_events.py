from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>__s[k]||null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 p=b.new_page(viewport={'width':960,'height':700});p.set_content(raw('prismweave-atelier'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 for _ in range(6):
  p.evaluate("()=>{const L=LEVELS[li];for(const op of [...L.scramble].reverse()){axis=op[0];band=op[1];shift(-op[2])}}")
  p.wait_for_timeout(540)
 ev=p.evaluate('window.__events');num=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))];assert num,ev;out['prismweave-atelier']=num[-1]['event'];p.close()
 p=b.new_page(viewport={'width':960,'height':700});p.set_content(raw('bastion-bloom'),wait_until='domcontentloaded');p.wait_for_timeout(60);p.evaluate("()=>{wave=10;waveActive=true;waveQueue=[];enemies=[];resolveWave()}");p.wait_for_timeout(60);ev=p.evaluate('window.__events');num=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))];assert num,ev;out['bastion-bloom']=num[-1]['event'];p.close();b.close();print({'newScoredPaths':len(out),'events':out,'inheritedVerifiedV22ScoredGames':51,'totalCovered':52})
