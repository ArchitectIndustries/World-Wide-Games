from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/ironlight-breach/index.html').read_text()
for token in ["wwg:ironlight-breach:meta-v2","scatterUnlocked","closedDoorAt","SECRET CACHE +350","type==='brute'","type==='drone'","keycards","sectorSecrets"]:
    assert token in SRC, token
# Static reachability: every authored core, exit, key, weapon, cache, recovery pickup, and sealed door can be reached from the entry while respecting the keycard gate.
import re
chunk=SRC.split('const levels=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([^']+)'",chunk)
levels=[rows[i:i+18] for i in range(0,len(rows),18)]
assert len(levels)==3 and all(len(r)==19 for lvl in levels for r in lvl)
for idx,lvl in enumerate(levels,1):
    loc={}
    for y,row in enumerate(lvl):
        for x,ch in enumerate(row): loc.setdefault(ch,[]).append((x,y))
    assert len(loc.get('E',[]))==1 and len(loc.get('X',[]))==1 and len(loc.get('C',[]))==3 and len(loc.get('D',[]))==1 and len(loc.get('K',[]))==1 and len(loc.get('G',[]))==1 and len(loc.get('S',[]))==2
    start=loc['E'][0]; seen=set(); q=[(start[0],start[1],False,False)]
    while q:
        x,y,key,opened=q.pop(0)
        ch=lvl[y][x]
        if ch=='K': key=True
        st=(x,y,key,opened)
        if st in seen: continue
        seen.add(st)
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if not (0<=ny<len(lvl) and 0<=nx<len(lvl[0])): continue
            cell=lvl[ny][nx]
            if cell=='#': continue
            nk,no=key,opened
            if cell=='D' and not opened:
                if not key: continue
                nk,no=False,True
            q.append((nx,ny,nk,no))
    coords={(x,y) for x,y,_,_ in seen}
    needed=[pt for ch in 'CXKGSAHD' for pt in loc.get(ch,[])]
    assert all(pt in coords for pt in needed),(idx,[pt for pt in needed if pt not in coords])

PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script')
    return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000);p.wait_for_timeout(120)
    assert not errs, errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert p.evaluate('[W,H,cores.length,doors.length,sectorSecrets]') == [19,18,3,1,2]
    assert set(p.evaluate('enemies.map(e=>e.type)')) >= {'guard','brute'}
    # Rifle consumes its own ammo.
    before=p.evaluate('ammo.rifle'); p.evaluate('lastShot=-999;shoot()'); assert p.evaluate('ammo.rifle')==before-1
    # Key pickup opens exactly one sealed door and spends the card.
    p.evaluate("q=pickups.find(x=>x.type==='K');p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate('keycards')==1
    p.evaluate("d=doors[0];tryDoor(d.x+.2,d.y+.2)")
    assert p.evaluate('doors[0].open && keycards===0')
    # Scattergun pickup, weapon switch, and multi-target close-range blast.
    p.evaluate("q=pickups.find(x=>x.type==='G');p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate("scatterUnlocked && weapon==='scatter' && ammo.scatter>=12")
    p.evaluate("map=Array.from({length:5},(_,y)=>Array.from({length:5},(_,x)=>(x===0||y===0||x===4||y===4)?'#':'.'));W=5;H=5;doors=[];p={x:1.5,y:2.5,a:0};enemies=[{x:2.4,y:2.45,type:'guard',hp:2,hit:0},{x:3.0,y:2.55,type:'brute',hp:5,hit:0}];weapon='scatter';scatterUnlocked=true;ammo.scatter=5;lastShot=-999;shoot()")
    hpvals=p.evaluate('enemies.map(e=>e.hp)'); assert hpvals[0] <= 0 and hpvals[1] <= 3, hpvals
    # Sector 2 introduces the drone silhouette/class.
    p.evaluate('load(2)'); assert 'drone' in p.evaluate('enemies.map(e=>e.type)')
    # Secret caches are optional durable meta progress and replenish resources.
    p.evaluate("q=pickups.find(x=>x.type==='S');hp=50;ammo.rifle=1;p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate('meta.secrets')==1 and p.evaluate('hp')>50 and p.evaluate('ammo.rifle')>1
    # Retry/R semantics restore the score at sector entry instead of advancing or farming points.
    p.evaluate("score=777;load(2,'advance');score=999;die();document.querySelector('#next').click()")
    assert p.evaluate('sector')==2 and p.evaluate('score')==777
    # Campaign completion updates persistent clear/best records and standardized event.
    p.evaluate('load(3);score=1234;finish()')
    m=p.evaluate('JSON.parse(localStorage.getItem(META))'); assert m['best']>=1234 and m['clears']>=1
    ev=p.evaluate('window.__events'); assert any(e.get('event')=='campaign-complete' for e in ev),ev
    assert not errs, errs
    b.close()
print(json.dumps({'map':'19x18 sectors','weapons':['rifle','scattergun'],'sealedDoors':'pass','secrets':'pass','enemyClasses':['guard','brute','drone'],'metaPersistence':'pass','campaignEvent':'pass','mobileOverflow':'pass'}))
