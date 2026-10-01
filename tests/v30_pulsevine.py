from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); src=(ROOT/'games/pulsevine-parkour/index.html').read_text()
assert src.count("name:'")>=5 and 'Pulse Crown' in src and 'Glassroot Gap' in src and 'Skyline Switchbacks' in src and 'Thornspire Relay' in src
assert "Digit[1-5]" in src and "KeyN" in src and "campaign-complete" in src and "course-complete" in src
html=src.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');i=html.lower().find('<script');html=html[:i]+"<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})(),configurable:true});</script>"+html[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1100,'height':700});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(html,wait_until='domcontentloaded');p.wait_for_timeout(80)
    assert p.locator('#coursebar button').count()==5
    assert p.locator('#coursebar button:not([disabled])').count()==1
    p.wait_for_timeout(160)
    x0=p.evaluate('p.x');p.keyboard.down('d');p.wait_for_timeout(180);p.keyboard.up('d');assert p.evaluate('p.x')>x0
    p.keyboard.press('r');p.wait_for_timeout(120);p.keyboard.press('Space');p.wait_for_timeout(35);assert p.evaluate('p.vy')<0
    # Unlock all via progress state and verify course selection works through the real loadCourse gate.
    p.evaluate("progress.unlocked=5;saveProgress();renderCourseButtons()")
    p.keyboard.press('Digit5');p.wait_for_timeout(20);assert p.evaluate('courseIndex')==4
    p.keyboard.press('KeyR');assert p.evaluate('gate')==0 and p.evaluate('falls')==0

    # Real-physics reachability: hold right and jump at authored gaps/hazards; no teleporting or forced completion.
    p.evaluate('progress.unlocked=5;saveProgress();renderCourseButtons()')
    ai="""()=>{keys.right=1;let cooldown=0;for(let i=0;i<9000&&!done;i++){cooldown=Math.max(0,cooldown-1);if(p.on&&cooldown===0){let q=course.platforms.find(q=>Math.abs((p.y+p.h)-q[1])<3&&p.x+p.w>q[0]&&p.x<q[0]+q[2]);if(q){let trigger=q[0]+q[2]-65;for(const h of course.thorns){if(h[0]>=q[0]&&h[0]<q[0]+q[2]&&h[0]>p.x)trigger=Math.min(trigger,h[0]-90)}if(p.x>=trigger){queueJump();cooldown=12}}}physics(1/60)}keys.right=0;return {done,gate,falls,x:p.x,name:course.name}}"""
    completed=[]
    for ci in range(5):
        p.evaluate(f'loadCourse({ci})');result=p.evaluate(ai);assert result['done'],result;completed.append(result)
    assert [x['gate'] for x in completed]==[5,6,7,7,8],completed
    assert not errs,errs
    b.close()
print(json.dumps({'courses':5,'selection':'1-5 unlocked','movement':'D','jump':'Space','restart':'R','next':'N','physicsReachability':'5/5'}))
