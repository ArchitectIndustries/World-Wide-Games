from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();PRE="<script>window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>__s[k]||null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 # Every authored Kiteglass gate can be crossed cleanly at its own centerline; no forced penalty in the intended route.
 p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw('kiteglass-drift'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 p.evaluate("()=>{reset();for(const g of GATES){y=g.y;gateCheck(g.x-1,g.x+1)}}");assert p.evaluate('gate')==7;assert p.evaluate('penalty')==0;p.close()
 # Runelight target windows stay inside the physical track and become stricter across the campaign.
 p=b.new_page(viewport={'width':900,'height':760});p.set_content(raw('runelight-locksmith'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 levels=p.evaluate('LEVELS.map(x=>({pins:x.pins,tol:x.tol,zone:x.zone,speed:x.speed}))');assert len(levels)==6;assert all(len(x['zone'])==x['pins']==len(x['speed']) for x in levels);assert all(all(x['tol'] <= z <= 1-x['tol'] for z in x['zone']) for x in levels);assert levels[-1]['tol']<levels[0]['tol'];p.close()
 b.close();print({'kiteglassCleanGates':7,'runelightLocks':6,'tightens':True})
