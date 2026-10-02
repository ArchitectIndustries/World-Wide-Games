from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,collections
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/ironlight-breach/index.html').read_text()
for token in ['meta-v3','LEGACY_META','unlocks={scatter:false,arc:false}','ARC LANCE ONLINE','type===\'sentry\'','cipher-opened','vault-mastery','sector<5','projectiles=[]']:
    assert token in SRC, token
chunk=SRC.split('const levels=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([^']+)'",chunk); levels=[rows[i:i+18] for i in range(0,len(rows),18)]
assert len(levels)==5 and all(len(r)==19 for lvl in levels for r in lvl)
for idx,lvl in enumerate(levels,1):
    loc={}
    for y,row in enumerate(lvl):
        for x,ch in enumerate(row): loc.setdefault(ch,[]).append((x,y))
    assert len(loc.get('E',[]))==1 and len(loc.get('X',[]))==1 and len(loc.get('C',[]))==3
    assert len(loc.get('D',[]))==1 and len(loc.get('K',[]))==1 and len(loc.get('G',[]))==1 and len(loc.get('S',[]))==2
    assert len(loc.get('A',[]))==1 and len(loc.get('H',[]))==1
    if idx>=3: assert len(loc.get('L',[]))==1 and len(loc.get('T',[]))>=1
    if idx>=4: assert len(loc.get('Z',[]))==1 and len(loc.get('V',[]))==1
    start=loc['E'][0]; q=collections.deque([(start[0],start[1],False,False,False)]); seen=set()
    while q:
        x,y,key,opened,cipher=q.popleft()
        if lvl[y][x]=='K': key=True
        st=(x,y,key,opened,cipher)
        if st in seen: continue
        seen.add(st)
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if not (0<=ny<18 and 0<=nx<19): continue
            cell=lvl[ny][nx]
            if cell=='#': continue
            nk,no,nc=key,opened,cipher
            if cell=='D' and not opened:
                if not key: continue
                nk,no=False,True
            if cell=='Z' and not cipher: nc=True
            q.append((nx,ny,nk,no,nc))
    coords={(x,y) for x,y,_,_,_ in seen}
    needed=[pt for ch in 'CXKGSAHLVBRTMZ' for pt in loc.get(ch,[])]
    assert all(pt in coords for pt in needed),(idx,[pt for pt in needed if pt not in coords])
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(150)
    assert not errs,errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert p.evaluate('[levels.length,W,H,cores.length,doors.length,sectorSecrets]') == [5,19,18,3,1,2]
    # Rifle still consumes its own ammo and sector-one combat remains live.
    before=p.evaluate('ammo.rifle'); p.evaluate('lastShot=-999;shoot()'); assert p.evaluate('ammo.rifle')==before-1
    # Sector 3 introduces the Arc Lance and ranged sentry class.
    p.evaluate("load(3,'advance')")
    assert 'sentry' in p.evaluate('enemies.map(e=>e.type)')
    p.evaluate("q=pickups.find(x=>x.type==='L');p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate("unlocks.arc && weapon==='arc' && ammo.arc>=8")
    assert any(e.get('event')=='arc-unlocked' for e in p.evaluate('window.__events'))
    # Arc Lance pierces up to three aligned targets and stuns drone/sentry electronics.
    p.evaluate("map=Array.from({length:5},(_,y)=>Array.from({length:7},(_,x)=>(x===0||y===0||x===6||y===4)?'#':'.'));W=7;H=5;doors=[];projectiles=[];p={x:1.5,y:2.5,a:0};enemies=[{x:2.4,y:2.5,type:'guard',hp:3,hit:0,stun:0},{x:3.3,y:2.5,type:'drone',hp:3,hit:0,stun:0},{x:4.2,y:2.5,type:'sentry',hp:3,hit:0,stun:0,lastFire:-999}];weapon='arc';unlocks.arc=true;ammo.arc=5;lastShot=-999;shoot()")
    hpvals=p.evaluate('enemies.map(e=>e.hp)'); assert hpvals==[1,1,1],hpvals
    assert p.evaluate('enemies[1].stun>0 && enemies[2].stun>0')
    # Ranged projectile collision damages the player and clears the bolt.
    p.evaluate("locked=true;enemies=[];p={x:2.5,y:2.5,a:0};hp=100;projectiles=[{x:4.5,y:2.5,vx:-4.5,vy:0,life:3}];updateProjectiles(.4)")
    assert p.evaluate('hp')==84 and p.evaluate('projectiles.length')==0
    # Sector 4 cipher route stays sealed below threshold, then opens at three cumulative secrets.
    p.evaluate("load(4,'advance');d=doors.find(x=>x.kind==='Z');secrets=2")
    assert p.evaluate('tryDoor(d.x+.2,d.y+.2)===true && !d.open')
    p.evaluate('secrets=3'); assert p.evaluate('tryDoor(d.x+.2,d.y+.2)===false && d.open')
    p.evaluate("q=pickups.find(x=>x.type==='V');p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate('vaults')==1
    # Sector 5 carries vault progress; its five-secret cipher route completes vault mastery.
    p.evaluate("load(5,'advance');secrets=5;d=doors.find(x=>x.kind==='Z');tryDoor(d.x+.2,d.y+.2);q=pickups.find(x=>x.type==='V');p.x=q.x;p.y=q.y;collect()")
    assert p.evaluate('vaults')==2
    assert any(e.get('event')=='vault-mastery' for e in p.evaluate('window.__events'))
    # Checkpoint retry restores score/secrets/vault/arsenal rather than retaining failed-attempt farming.
    p.evaluate("score=777;secrets=5;vaults=2;saveCheckpoint();score=999;secrets=9;vaults=4;die();document.querySelector('#next').click()")
    assert p.evaluate('[score,secrets,vaults]')==[777,5,2]
    # Final-sector completion updates durable clear/best and campaign event.
    p.evaluate("score=1234;cores.forEach(c=>c.taken=true);finish()")
    m=p.evaluate('JSON.parse(localStorage.getItem(META))'); assert m['best']>=1234 and m['clears']>=1 and m['vaults']>=2
    assert any(e.get('event')=='campaign-complete' for e in p.evaluate('window.__events'))
    assert not errs,errs
    b.close()
print(json.dumps({'sectors':5,'weapons':['rifle','scattergun','arc-lance'],'cipherRoutes':2,'vaults':2,'enemyClasses':['guard','brute','drone','sentry'],'projectileDamage':'pass','checkpointRetry':'pass','mobileOverflow':'pass'}))
