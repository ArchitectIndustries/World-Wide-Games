from playwright.sync_api import sync_playwright
from pathlib import Path
import math
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
def raw(slug):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 pre="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};</script>"
 return h.replace('<script>',pre+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 # Stoneveil: prove every handcrafted route has a stamina-feasible path under real movement constraints.
 p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw('stoneveil-ascent'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 route_data=p.evaluate("ROUTES.map((q,ri)=>({start:Math.max(72,100-ri*4),holds:q.holds}))")
 costs=[]
 for ri,r in enumerate(route_data):
  hs=r['holds'];n=len(hs);best=[10**9]*n;best[0]=0
  for i,(x,y,t0) in enumerate(hs):
   for j in range(i+1,n):
    xx,yy,typ=hs[j];d=math.hypot(xx-x,yy-y)
    if yy<y+16 and d<=132:
     c=d*.11+[2,4,7,0][typ]+ri*.8
     best[j]=min(best[j],best[i]+c)
  assert best[-1] <= r['start']+34, (ri+1,best[-1],r['start']+34)
  costs.append(round(best[-1],1))
 p.close()
 # Tidal Foundry: each authored solution connects source to receiver under the exact flow solver.
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('tidal-foundry'),wait_until='domcontentloaded');p.wait_for_timeout(50)
 solved=[]
 for si in range(6):
  ok=p.evaluate("(si)=>{window.eval('si='+si);load();tiles.forEach(t=>{if(t.route)t.m=t.sol});live=compute();const sink=ROUTES[si].at(-1);return live.has(key(...sink))&&live.size===ROUTES[si].length}",si)
  assert ok,si;solved.append(si+1)
 p.close()
 # Mosslight: v1.7 state persists Starbloom quest, VI gear and collectibles.
 p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw('mosslight-vale'),wait_until='domcontentloaded');p.wait_for_timeout(50)
 p.evaluate("questStage=4;postStage=3;fenStage=3;reachStage=3;hollowStage=3;canopyStage=2;blade=6;starLilies[0].got=true;player.x=4070;player.y=420;save()")
 p.evaluate("canopyStage=0;blade=1;starLilies.forEach(x=>x.got=false);player.x=260;loadSave()")
 state=p.evaluate("({canopyStage,blade,lily:starLilies[0].got,x:player.x})")
 assert state['canopyStage']==2 and state['blade']==6 and state['lily'] and state['x']==4070,state
 p.close();b.close()
print({'stoneveilOptimalCosts':costs,'tidalSolved':solved,'mosslightSave':'starbloom-persisted'})
