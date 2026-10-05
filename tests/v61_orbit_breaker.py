from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve()
SRC=(ROOT/'games/orbit-breaker/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()

for token in [
    'Orbit Breaker 2.0', 'SECTORS=[', 'Debris Corridor', 'Hunter Belt', 'Breaker Core',
    'pulseBurst', "emit('campaign-complete'", "emit('pulse-burst'", SAVE_KEY if False else "wwg:orbit-breaker:progress:v2",
    'Missed enemies never do', 'shipCollision', 'shipHit', 'spawnBreakerCore'
]:
    assert token in SRC, token

def raw(seed=None):
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>', f'<script>{INPUT}</script>')
    initial=json.dumps(seed or {})
    pre=f"""<script>const __s={initial};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});</script>"""
    i=h.lower().find('<script')
    return h[:i]+pre+h[i:]

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':900,'height':700})
    errs=[]
    p.on('pageerror', lambda e: errs.append(str(e)))
    p.set_content(raw({'wwg:orbit-breaker:best':'321'}), wait_until='domcontentloaded', timeout=10000)
    p.wait_for_timeout(120)
    assert not errs, errs
    p.evaluate("window.__events=[]; window.postMessage=(m)=>window.__events.push(m); paused=true")

    # Legacy best migrates into the v2 campaign record.
    assert p.evaluate('progress.version') == 2
    assert p.evaluate('progress.best') == 321

    # Missing a threat never damages the player.
    p.evaluate("hp=3;invuln=0;enemies=[{type:'asteroid',x:50,y:H+50,r:14,hp:1,v:0,phase:0,worth:12,col:'#fff'}];paused=false")
    p.wait_for_timeout(90)
    p.evaluate('paused=true')
    assert p.evaluate('hp') == 3
    assert p.evaluate('enemies.length') == 0

    # Direct contact damages once and grants invulnerability.
    p.evaluate("hp=3;invuln=0;enemies=[{type:'asteroid',x:player.x,y:player.y,r:14,hp:1,v:0,phase:0,worth:12,col:'#fff'}];paused=false")
    p.wait_for_timeout(70)
    p.evaluate('paused=true')
    assert p.evaluate('hp') == 2
    assert p.evaluate('invuln') > 0
    p.evaluate("enemies=[{type:'armored',x:player.x,y:player.y,r:23,hp:3,v:0,phase:0,worth:35,col:'#fff'}];paused=false")
    p.wait_for_timeout(70)
    p.evaluate('paused=true')
    assert p.evaluate('hp') == 2
    assert p.evaluate("player.x=2; shipCollision({x:W-2,y:player.y,r:14})") is True

    # Sector 1 completion advances campaign and persists unlocks.
    p.evaluate("configureSector(0); paused=true; sectorKills=11; totalKills=11; enemies=[{type:'asteroid',x:100,y:100,r:14,hp:1,v:0,phase:0,worth:12,col:'#fff'}]; damageEnemy(0,1)")
    assert p.evaluate('sector') == 1
    assert p.evaluate('progress.unlocked') >= 2
    assert p.evaluate("JSON.parse(__s['wwg:orbit-breaker:progress:v2']).unlocked") >= 2

    # Armored/drone ecosystem and shield-cell recovery stay functional.
    p.evaluate("configureSector(1); paused=true; totalKills=6; sectorKills=0; hp=2; enemies=[{type:'drone',x:player.x,y:120,r:15,hp:1,v:0,phase:0,worth:28,col:'#f59e0b'}]; damageEnemy(0,1)")
    assert p.evaluate('pickups.length') == 1
    p.evaluate("pickups[0].x=player.x; pickups[0].y=player.y; collectPickups()")
    assert p.evaluate('hp') == 3
    assert p.evaluate('pickups.length') == 0
    p.evaluate("spawnEnemy('drone')")
    assert p.evaluate("enemies.some(e=>e.type==='drone'&&e.hp===2)") is True
    p.evaluate('enemies=[]')

    # Pulse Burst requires a full reactor, clears nearby threats, and emits telemetry.
    p.evaluate("configureSector(1); paused=true; reactor=99; enemies=[{type:'asteroid',x:player.x,y:100,r:14,hp:1,v:0,phase:0,worth:12,col:'#fff'}]")
    assert p.evaluate('paused=false; const r=pulseBurst(); paused=true; r') is False
    p.evaluate("reactor=100; enemies=[{type:'asteroid',x:player.x,y:150,r:14,hp:1,v:0,phase:0,worth:12,col:'#fff'},{type:'drone',x:player.x+50,y:170,r:15,hp:2,v:0,phase:0,worth:28,col:'#fff'}]")
    assert p.evaluate('paused=false; const r=pulseBurst(); paused=true; r') is True
    assert 0 <= p.evaluate('reactor') < 100
    assert p.evaluate('enemies.length') == 0
    assert p.evaluate("__events.some(e=>e.event==='pulse-burst')") is True

    # Final core takes durable damage and campaign completion records a clear.
    p.evaluate("configureSector(2); paused=true; sectorKills=8; spawnBreakerCore();")
    assert p.evaluate("enemies.some(e=>e.type==='core'&&e.hp===24)") is True
    p.evaluate("let i=enemies.findIndex(e=>e.type==='core'); damageEnemy(i,5)")
    assert p.evaluate("enemies.find(e=>e.type==='core').hp") == 19
    p.wait_for_timeout(160)
    assert p.evaluate("enemies.find(e=>e.type==='core').hp") == 19
    p.evaluate("let i=enemies.findIndex(e=>e.type==='core'); enemies[i].hp=1; damageEnemy(i,1)")
    assert p.evaluate('won') is True
    assert p.evaluate('progress.clears') >= 1
    assert p.evaluate("__events.some(e=>e.event==='campaign-complete')") is True
    saved=p.evaluate("JSON.parse(__s['wwg:orbit-breaker:progress:v2'])")
    assert saved['version']==2 and saved['clears']>=1 and saved['best']>=321

    # Pause/resume and restart remain safe from keyboard.
    p.evaluate("won=false;over=false;paused=false; window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',bubbles:true}))")
    assert p.evaluate('paused') is True
    p.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',bubbles:true}))")
    assert p.evaluate('paused') is False
    p.evaluate("hp=1;sector=2;reactor=77; window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyR',bubbles:true}))")
    assert p.evaluate('[hp,sector,Math.round(reactor)]') == [3,0,0]

    # Remapped Secondary activates Pulse Burst from keyboard.
    p.evaluate("won=false;over=false;paused=false;reactor=100; localStorage.setItem('wwg:keymap',JSON.stringify({secondary:'KeyQ'})); window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));")
    p.wait_for_timeout(30)
    assert p.evaluate('reactor') == 0

    assert not errs, errs
    p.close()

    # Mobile-width/touch presentation remains contained and exposes all four touch actions.
    m=b.new_page(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True)
    merr=[]; m.on('pageerror',lambda e:merr.append(str(e)))
    m.set_content(raw(), wait_until='domcontentloaded', timeout=10000)
    m.wait_for_timeout(120)
    assert not merr, merr
    assert m.evaluate('document.documentElement.scrollWidth<=innerWidth') is True
    assert m.locator('.mobile button').count()==4
    assert m.locator('[data-act="pulse"]').is_visible()
    m.close(); b.close()

print(json.dumps({'orbitBreaker':'2.0','campaignSectors':3,'pulseBurst':'pass','collisionRule':'pass','persistence':'pass','mobile':'pass'}))
