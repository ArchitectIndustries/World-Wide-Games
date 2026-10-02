from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/verdant-echoes/index.html').read_text()
for token in ["wwg:verdant-echoes:save-v2","wwg:verdant-echoes:meta-v2","Rootkeeper Mira","Moon Seeds","Hollow Stag","moonsteel","barkguard","rootvault-cleared","moonsteel-forged"]:
    assert token in SRC, token
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
    assert p.evaluate("area")=='grove' and p.evaluate("[W,H]")==[44,28]
    # Preserve the legacy bomb/dash contract from 1.0.
    b0=p.evaluate('bombs'); p.evaluate('plant()'); assert p.evaluate('bombs')==b0-1
    p.evaluate('dashGo()'); assert p.evaluate('inv')>0
    # Rootkeeper quest starts through the real interaction path.
    p.evaluate("p.x=4.5;p.y=4.5;interact()")
    assert p.evaluate('quest')==1
    # Restore first two Echo Relics to awaken the Rootvault shrine.
    for i in [0,1]:
        p.evaluate('(i)=>{const q=RELIC_SPECS[i];p.x=q[0];p.y=q[1];update(.01)}',i)
    assert p.evaluate('takenRelics.size')==2
    p.evaluate("p.x=21.5;p.y=12.5;interact()")
    assert p.evaluate("area")=='rootvault' and p.evaluate('[W,H]')==[30,20]
    # Ranged Wisp pressure is active in the dungeon.
    p.evaluate("e=enemies.find(x=>x.type==='wisp');p.x=e.x+2;p.y=e.y;e.cool=0;enemyUpdate(.02)")
    assert p.evaluate('projectiles.length')>=1
    # Barkguard raises maximum health.
    p.evaluate("p.x=10.5;p.y=16.5;update(.01)")
    assert p.evaluate("charm")=='barkguard' and p.evaluate('p.maxHp')==7
    # Three Moon Seeds open the sanctum and spawn the Hollow Stag.
    for i in [0,1,2]:
        p.evaluate('(i)=>{const q=SEED_SPECS[i];p.x=q[0];p.y=q[1];update(.01)}',i)
    assert p.evaluate('takenSeeds.size')==3 and p.evaluate("boss&&boss.id")=='stag'
    # Defeat the Hollow Stag through sword attacks and claim the Rootsigil.
    p.evaluate("p.x=boss.x-.8;p.y=boss.y;Array.from({length:16}).forEach(()=>attack())")
    assert p.evaluate('rootSigil') and p.evaluate("defeatedBosses.has('stag')")
    events=p.evaluate('window.__events'); assert any(e.get('event')=='rootvault-cleared' for e in events), events
    # Return to Mira and forge Moonsteel.
    p.evaluate("p.x=2.5;p.y=2.5;interact();p.x=4.5;p.y=4.5;interact()")
    assert p.evaluate("area")=='grove' and p.evaluate("weapon")=='moonsteel' and p.evaluate('quest')==3
    events=p.evaluate('window.__events'); assert any(e.get('event')=='moonsteel-forged' for e in events), events
    # Autosave captures the durable campaign equipment/progression state.
    save=p.evaluate("JSON.parse(localStorage.getItem(SAVE_KEY))")
    assert save['weapon']=='moonsteel' and save['charm']=='barkguard' and save['rootSigil'] is True and len(save['takenSeeds'])==3
    # Collect remaining relics, spawn the end boss, verify Moonsteel damage, then complete campaign.
    for i in [2,3]:
        p.evaluate('(i)=>{const q=RELIC_SPECS[i];p.x=q[0];p.y=q[1];update(.01)}',i)
    p.evaluate("p.x=38;p.y=24;update(.01)")
    assert p.evaluate("boss&&boss.id")=='regent'
    hp=p.evaluate('boss.hp'); p.evaluate("p.x=boss.x-.8;p.y=boss.y;attack()")
    assert p.evaluate('boss.hp')==hp-2
    p.evaluate("Array.from({length:8}).forEach(()=>attack())")
    assert p.locator('#ov').is_visible()
    events=p.evaluate('window.__events'); assert any(e.get('event')=='campaign-complete' for e in events), events
    meta=p.evaluate("JSON.parse(localStorage.getItem(META_KEY))")
    assert meta['clears']>=1 and meta['best']>0 and meta['rootvaultClears']>=1 and meta['questClears']>=1
    assert not errs, errs
    b.close()
print(json.dumps({'areas':2,'echoRelics':4,'moonSeeds':3,'equipment':['moonsteel','barkguard'],'bosses':['Hollow Stag','Thorn Regent'],'quest':'pass','autosave':'pass','campaign':'pass','mobileOverflow':'pass'}))
