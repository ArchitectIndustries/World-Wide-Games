from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); SRC=(ROOT/'games/emberfield-survival/index.html').read_text(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in ['Emberfield Survival 2.0','Ash Verge','Cinderstorm','Pyre Crown','function nova()','function spawnBoss(','function completeCampaign()','wwg:emberfield-survival:progress:v2','Pyre Regent','data-up="reactor"']:
    assert token in SRC, token

def raw(seed=None):
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>', f'<script>{INPUT}</script>')
    initial=json.dumps(seed or {})
    pre=f"""<script>const __s={initial};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});</script>"""
    i=h.lower().find('<script')
    return h[:i]+pre+h[i:]

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1000,'height':700})
    errs=[]; events=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw({'wwg:emberfield-survival:progress:v2':json.dumps({'best':900,'clears':2,'highestLevel':5,'novaUses':4})}),wait_until='domcontentloaded',timeout=10000)
    p.wait_for_timeout(120)
    assert not errs, errs
    p.evaluate("window.__events=[]; window.postMessage=(m)=>window.__events.push(m); window.__emberfield.state.paused=true")
    assert p.evaluate('save.best')==900 and p.evaluate('save.clears')==2

    # Six upgrade paths remain functional and the run resumes cleanly.
    p.evaluate("window.__emberfield.state.paused=true; choose('vigor')")
    assert p.evaluate('window.__emberfield.player.maxHp')==112
    assert p.evaluate('window.__emberfield.state.paused') is False
    p.evaluate("window.__emberfield.state.paused=true; const old=window.__emberfield.player.coreGain; choose('reactor'); window.__emberTestCoreGain=[old,window.__emberfield.player.coreGain]")
    assert p.evaluate('__emberTestCoreGain[1]>__emberTestCoreGain[0]') is True

    # Nova must require a full core, clear projectiles and damage nearby enemies/bosses.
    p.evaluate("window.__emberfield.state.paused=false; window.__emberfield.setCore(99)")
    assert p.evaluate('window.__emberfield.nova()') is False
    p.evaluate("window.__emberfield.setCore(100); enemies=[{x:480,y:180,r:12,hp:50,type:'drifter'}]; enemyShots=[{x:480,y:200,vx:0,vy:0,r:5,life:4}]")
    assert p.evaluate('window.__emberfield.nova()') is True
    assert p.evaluate('Math.round(window.__emberfield.state.core)')==0
    assert p.evaluate('enemyShots.length')==0
    assert p.evaluate('enemies[0].hp')<50
    assert p.evaluate("window.__events.some(e=>e.event==='nova-burst')") is True

    # Boss damage is durable and clearing the first Warden advances phase.
    p.evaluate("window.__emberfield.state.paused=true; window.__emberfield.spawnBoss(false)")
    assert p.evaluate('window.__emberfield.state.boss.name')=='Cinder Warden'
    p.evaluate('window.__emberfield.state.boss.hp-=77')
    hp=p.evaluate('window.__emberfield.state.boss.hp'); p.wait_for_timeout(120)
    assert p.evaluate('window.__emberfield.state.boss.hp')==hp
    p.evaluate('window.__emberfield.damageBoss(9999)')
    assert p.evaluate('window.__emberfield.state.phase')==1
    assert p.evaluate('window.__emberfield.state.boss') is None

    # Final Pyre Regent completion records and emits the campaign result.
    p.evaluate("window.__emberfield.state.phase=2; window.__emberfield.state.bossSpawned=false; window.__emberfield.state.paused=true; window.__emberfield.spawnBoss(true)")
    assert p.evaluate('window.__emberfield.state.boss.name')=='Pyre Regent'
    p.evaluate('window.__emberfield.damageBoss(9999)')
    assert p.evaluate('window.__emberfield.state.won') is True
    assert p.evaluate('save.clears')>=3
    assert p.evaluate("window.__events.some(e=>e.event==='campaign-complete')") is True
    saved=p.evaluate("JSON.parse(__s['wwg:emberfield-survival:progress:v2'])")
    assert saved['clears']>=3 and saved['best']>=900

    # Restart and custom Secondary mapping remain safe.
    p.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyR',bubbles:true})); window.__emberfield.setCore(100); localStorage.setItem('wwg:keymap',JSON.stringify({secondary:'KeyQ'})); window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}))")
    p.wait_for_timeout(40)
    assert p.evaluate('window.__emberfield.state.core')==0
    assert p.evaluate('window.__emberfield.state.over') is False
    assert not errs, errs
    p.close()

    m=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True); merr=[];m.on('pageerror',lambda e:merr.append(str(e)))
    m.set_content(raw(),wait_until='domcontentloaded',timeout=10000);m.wait_for_timeout(120)
    assert not merr,merr
    assert m.evaluate('document.documentElement.scrollWidth<=innerWidth') is True
    assert m.locator('.mobile button').count()==6
    assert m.locator('#nova').is_visible()
    assert m.locator('#dash').is_visible()
    m.close();b.close()
print(json.dumps({'emberfield':'2.0','phases':3,'nova':'pass','bossPersistence':'pass','campaignPersistence':'pass','remap':'pass','mobile':'pass'}))
