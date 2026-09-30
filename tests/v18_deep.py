from playwright.sync_api import sync_playwright
from pathlib import Path
import json
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text()
def raw(slug):
 h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
 pre="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};</script>"
 return h.replace('<script>',pre+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw('rootsong-architect'),wait_until='domcontentloaded');p.wait_for_timeout(50);sol=[]
 for i in range(6):
  r=p.evaluate("(i)=>{li=i;load();let ok=true;for(const [x,y] of LEVELS[i].solution){if(!grown.has(key(x,y)))ok=grow(x,y)&&ok}const q=LEVELS[i],c=counts();return {ok:ok&&grown.has(key(...q.goal))&&c.w===q.water.length&&c.n===q.nutrient.length,spent,budget:q.budget}}",i);assert r['ok'] and r['spent']<=r['budget'],(i,r);sol.append(r)
 p.close()
 p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw('atlas-below'),wait_until='domcontentloaded');p.wait_for_timeout(50)
 got=[]
 for i,(ore,cry,caches) in enumerate([(4,2,2),(4,4,0),(6,3,0)]):
  p.evaluate("([i,o,c,k])=>{contractIndex=i;make();p.ore=o;p.crystal=c;p.caches=k;craft();p.x=exit.x;p.y=exit.y;finish(true)}",[i,ore,cry,caches]);got.append(p.evaluate('meta.contracts.slice()'))
 assert got[-1]==['survey','crystal','deep'],got
 ev=p.evaluate('window.__events');assert sum(1 for x in ev if x.get('event')=='contract-mastered')==1,ev
 stored=json.loads(p.evaluate("__s['wwg:atlas-meta']"));assert stored['contracts']==['survey','crystal','deep'] and stored['clears']==3,stored
 p.close();b.close()
print({'rootsongSolutions':sol,'atlasContracts':got[-1],'atlasMasteryEvent':'once'})
