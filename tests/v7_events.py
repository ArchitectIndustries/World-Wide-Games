from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve()
PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def raw(slug):
    h=(ROOT/'games'/slug/'index.html').read_text()
    return h.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-gpu'])
    cases={
      'atlas-below':"p.ore=6;p.crystal=2;craft();p.x=exit.x;p.y=exit.y;finish(true);",
      'aetherstead-colony':"pop=35;food=50;power=50;morale=80;turn=16;advance();",
      'prism-duel':"s1=4;s2=0;score(1);",
      'starweaver-drift':"beacons.forEach(b=>b.scanned=true);ship.x=relay.x;ship.y=relay.y;step(performance.now()+1000);",
      'pulse-archive':"start=performance.now()-100000;loop(performance.now());",
      'skyhook-sprint':"p.x=4050;step(performance.now()+1000);",
      'vector-league':"ys=5;loop(performance.now()+1000);",
      'crownline-tactics':"round=13;endCheck();",
      'echo-bazaar':"for(let i=0;i<12;i++)next();",
      'lumen-relay':"idx=levels.length-1;totalMoves=8;moves=4;won=true;nextStage();",
      'neon-stack':"score=4321;reported=false;report();",
      'rune-depths':"player.count=5;player.x=exit.x-1;player.y=exit.y;grid[exit.y][exit.x]=0;move(1,0);",
      'gravity-foundry':"cores.forEach(c=>c.got=true);probe.x=levels[li].goal[0];probe.y=levels[li].goal[1];status='fly';step(performance.now()+16);",
      'hexbound-tactics':"ecore=0;pcore=12;turn=5;finish();",
      'rift-relay':"score=8;time=42;shield=4;step(performance.now()+16);",
      'bastion-bloom':"lives=0;over=false;reported=false;enemies=[{p:path.length-1,hp:1,max:1,speed:0,slow:0,r:8}];loop(performance.now()+16);"
    }
    out={}
    for slug,code in cases.items():
        p=browser.new_page(viewport={'width':960,'height':540}); errs=[];p.on('pageerror',lambda e,errs=errs:errs.append(str(e)))
        p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(80)
        p.evaluate(code);p.wait_for_timeout(120)
        ev=p.evaluate('window.__events')
        numeric=[e for e in ev if isinstance(e,dict) and isinstance(e.get('score'),(int,float))]
        assert numeric,(slug,ev,errs)
        out[slug]=numeric[-1]
        if slug in {'atlas-below','prism-duel','starweaver-drift','pulse-archive','skyhook-sprint','vector-league'}:
            assert isinstance(out[slug].get('duration'),(int,float)),(slug,out[slug])
            assert out[slug].get('meta',{}).get('unit')=='pts',(slug,out[slug])
        assert not errs,(slug,errs)
        p.close()
    print(out)
    browser.close()
