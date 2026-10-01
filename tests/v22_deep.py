from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();PRE="<script>window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>__s[k]||null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('blackglass-watch'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 info=p.evaluate('({rooms:ROOMS.length,types:TYPES,shifts:SHIFTS})');assert info['rooms']==6;assert len(info['shifts'])==7;assert {x['type'] for x in info['shifts']}==set(info['types']);assert all(0<=x['room']<6 for x in info['shifts']);assert all(info['shifts'][i]['limit']>info['shifts'][i+1]['limit'] for i in range(6))
 p.evaluate("()=>{for(let i=0;i<SHIFTS.length;i++){const a=active();feed=a.room;type=TYPES.indexOf(a.type);report()}}")
 assert p.evaluate('caught')==7 and p.evaluate('mistakes')==0;assert any(e.get('event')=='watch-complete' for e in p.evaluate('window.__events'));p.close()
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('tetherline-salvage'),wait_until='domcontentloaded');p.wait_for_timeout(60)
 info=p.evaluate('({salvage:SALVAGE_SEED,hazards:HAZARD_SEED,world,bay})');assert len(info['salvage'])==6 and len({tuple(x) for x in info['salvage']})==6;assert len(info['hazards'])==4
 assert all(30<=x<info['world']['w']-30 and 30<=y<info['world']['h']-30 for x,y in info['salvage']);assert 0<info['bay']['x']<info['world']['w'] and 0<info['bay']['y']<info['world']['h']
 p.evaluate("()=>{for(const pod of pods){if(pod.done)continue;ship.x=pod.x;ship.y=pod.y;hook();if(!tether)throw new Error('hook failed');tether.x=bay.x;tether.y=bay.y;if(!tryRecover())throw new Error('recover failed')}}")
 assert p.evaluate('recovered')==6;assert any(e.get('event')=='haul-complete' for e in p.evaluate('window.__events'));p.close()
 b.close();print({'blackglassShifts':7,'blackglassTypes':4,'tetherlineSalvage':6,'tetherlineHazards':4,'fullRecovery':True})
