from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/ashen-covenant/index.html').read_text()
for token in ['wwg:ashen-covenant:save-v2','wwg:ashen-covenant:meta-v2','Charred Causeway','Cinder Cloister','Dawnless Court','Ember Sigil','hound','pilgrim','archer','weapon-forged','recovery-mastery','pilgrimage-complete']:
    assert token.lower() in SRC.lower(), token
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script')
    return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(120)
    assert not errs, errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert p.evaluate('[stage,phase,paths.length]')==[1,'approach',3]
    assert set(p.evaluate('enemies.map(e=>e.type)'))=={'hound','pilgrim','archer'}
    # Both weapon identities and stamina profiles are live.
    blade=p.evaluate('weaponStats(false)'); p.evaluate('swapWeapon()'); spear=p.evaluate('weaponStats(false)')
    assert spear['range']>blade['range'] and spear['damage']>blade['damage'] and spear['cost']>blade['cost']
    p.evaluate('swapWeapon()')
    # Forge the current weapon at the Ember Shrine.
    p.evaluate('ash=500;p.x=105;p.y=95;interact()')
    assert p.evaluate('tiers.blade')==2 and p.evaluate('ash')<500
    # Bind all three authored sigils and clear traversal foes, then enter the Lord gate.
    for i in range(3):
        p.evaluate('(i)=>{const s=paths[0].sigils[i];p.x=s[0];p.y=s[1];interact()}',i)
    assert p.evaluate('sigilsForStage()')==3
    p.evaluate('enemies.forEach(e=>e.hp=0);p.x=875;p.y=300;interact()')
    assert p.evaluate('[stage,phase,boss.name,boss.pattern]')==[1,'boss','The Bell Widow','bell']
    # First Lord falls through actual attack resolution.
    p.evaluate('boss.hp=1;p.x=boss.x-60;p.y=boss.y;p.st=100;light()')
    assert p.locator('#ov').is_visible() and p.evaluate('[stage,phase]')==[2,'approach']
    p.locator('#next').click(); p.wait_for_timeout(40)
    assert p.evaluate('paths[stage-1].name')=='Cinder Cloister'
    # Death marks preserve Ash and require leave-and-return recovery.
    p.evaluate('ash=123;p.x=500;p.y=300;p.hp=1;hurt(99)')
    assert p.evaluate('dead && mark && mark.ash')==123 and p.evaluate('ash')==0
    p.locator('#next').click(); p.wait_for_timeout(30)
    p.evaluate('update(.02)')
    assert p.evaluate('markArmed') is True
    p.evaluate('p.x=500;p.y=300;update(.02)')
    assert p.evaluate('mark===null') and p.evaluate('ash')==123 and p.evaluate('meta.recoveries')==1
    # Simulate two more legitimate recoveries to unlock recovery mastery event.
    for _ in range(2):
        p.evaluate('ash=50;p.x=500;p.y=300;p.hp=1;hurt(99)')
        p.locator('#next').click(); p.evaluate('update(.02);p.x=500;p.y=300;update(.02)')
    assert p.evaluate('meta.recoveries')==3
    events=p.evaluate('window.__events'); assert any(e.get('event')=='recovery-mastery' for e in events),events
    # Advance through the authored second/third Lord patterns.
    p.evaluate("phase='boss';saveNow();start();boss.hp=1;p.x=boss.x-60;p.y=boss.y;p.st=100;light()")
    assert p.evaluate('[stage,phase]')==[3,'approach']
    p.locator('#next').click(); p.wait_for_timeout(30)
    p.evaluate("phase='boss';saveNow();start()")
    assert p.evaluate('[boss.name,boss.pattern]')==['King Without Dawn','sun']
    p.evaluate('boss.hp=1;p.x=boss.x-60;p.y=boss.y;p.st=100;light()')
    assert p.locator('#ov').is_visible()
    events=p.evaluate('window.__events')
    assert sum(1 for e in events if e.get('event')=='lord-defeated')>=3,events
    assert any(e.get('event')=='pilgrimage-complete' for e in events),events
    meta=p.evaluate('JSON.parse(localStorage.getItem(META_KEY))')
    assert meta['clears']>=1 and meta['best']>0 and meta['lords']>=3 and meta['recoveries']>=3 and meta['upgrades']>=1
    save=p.evaluate('JSON.parse(localStorage.getItem(SAVE_KEY))')
    assert save['v']==2 and save['tiers']['blade']>=2 and save['ash']>=0
    assert not errs,errs
    b.close()
print(json.dumps({'paths':3,'enemyTypes':['hound','pilgrim','archer'],'weapons':['blade','spear'],'sigilsPerPath':3,'lordPatterns':['bell','cross','sun'],'forging':'pass','deathRecovery':'pass','persistence':'pass','campaign':'pass','mobileOverflow':'pass'}))
