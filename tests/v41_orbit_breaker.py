from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
SRC=(ROOT/'games/orbit-breaker/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
for token in ['shipCollision','shipHit','invuln','Asteroids that fly past you do not cause damage','wwg:orbit-breaker:best']:
    assert token in SRC, token

def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>', f'<script>{INPUT}</script>')
    pre="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"""
    i=h.lower().find('<script')
    return h[:i]+pre+h[i:]

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':900,'height':700})
    errs=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000)
    p.wait_for_timeout(100)
    assert not errs, errs
    # Missed asteroid: pass below the playfield without touching the ship.
    p.evaluate("spawn=999;hp=3;invuln=0;enemies=[{x:50,y:H+45,r:14,hp:1,v:0,phase:0,t:0}]")
    p.wait_for_timeout(100)
    assert p.evaluate('hp') == 3
    assert p.evaluate('enemies.length') == 0
    # Direct collision costs exactly one shield and grants invulnerability.
    p.evaluate("spawn=999;hp=3;invuln=0;enemies=[{x:player.x,y:player.y,r:14,hp:1,v:0,phase:0,t:0}]")
    p.wait_for_timeout(80)
    assert p.evaluate('hp') == 2
    assert p.evaluate('invuln') > 0
    # A second overlap during invulnerability cannot chain-drain another shield.
    p.evaluate("enemies=[{x:player.x,y:player.y,r:22,hp:3,v:0,phase:0,t:0}]")
    p.wait_for_timeout(80)
    assert p.evaluate('hp') == 2
    # Screen-wrap collision math treats opposite edges as adjacent.
    assert p.evaluate("player.x=2; shipCollision({x:W-2,y:player.y,r:14})") is True
    # Objective copy accurately explains the rule.
    guide=p.locator('.guide').inner_text()
    assert 'only drops when an asteroid physically hits your ship' in guide
    assert 'do not cause damage' in guide
    assert not errs, errs
    b.close()
print(json.dumps({'missedAsteroidDamage':'none','directCollisionDamage':1,'invulnerability':'pass','wrapCollision':'pass'}))