from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"""
def raw(slug):
    h=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
checks={}
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page();p.set_content(raw('glyphsmith'));p.wait_for_timeout(40)
    first=p.locator('#runes button').first.inner_text();p.locator('#runes button').first.click();assert p.locator('#runes button').first.is_disabled();one=p.locator('#entry').inner_text();p.keyboard.press('Key'+first.upper());assert p.locator('#entry').inner_text()==one;p.keyboard.press('Backspace');assert p.locator('#entry').inner_text()=='';assert not p.locator('#runes button').first.is_disabled();checks['glyphsmith']='finite rune inventory + undo';p.close()
    p=b.new_page();p.set_content(raw('echo-bazaar'));p.wait_for_timeout(20);r0=p.locator('#rumor').inner_text();assert "Tomorrow's rumor" in r0;prices0=p.locator('.good strong').all_inner_texts();p.locator('#advance').click();prices1=p.locator('.good strong').all_inner_texts();assert prices0!=prices1;assert "Tomorrow's rumor" in p.locator('#rumor').inner_text() or 'Final trading day' in p.locator('#rumor').inner_text();checks['echo-bazaar']='forward-looking rumor applied next day';p.close()
    p=b.new_page();p.set_content(raw('signal-choir'));p.wait_for_timeout(30);p.evaluate("playing=false;seq=[0,1,2];input=[];lives=3;done=false;sync()");p.evaluate('press(4)');assert p.locator('#lives').inner_text()=='2';p.evaluate('press(3)');assert p.locator('#lives').inner_text()=='2';checks['signal-choir']='input locked during retry transition';p.close()
    p=b.new_page();p.set_content(raw('pulse-archive'));p.wait_for_timeout(30);p.evaluate("score=1000;hits=8;judged=10;notes=[{lane:0,time:-1,hit:true,miss:false}];start=performance.now()-5000;ended=false");p.wait_for_timeout(80);ev=p.evaluate('window.__events');done=[e for e in ev if e.get('event')=='archive-cleared'];assert done;shown=int(p.locator('#score').inner_text().replace(',',''));assert shown==done[-1]['score'],(shown,done[-1]);checks['pulse-archive']='displayed final score matches emitted score';p.close()
    p=b.new_page();p.set_content(raw('lumen-relay'));p.wait_for_timeout(20);p.evaluate('idx=levels.length-1;totalMoves=9;moves=3;won=true;nextStage()');assert p.evaluate('totalMoves')==0 and p.evaluate('idx')==0;checks['lumen-relay']='completed-run rotation total resets';p.close()
    p=b.new_page();p.set_content(raw('hushwave-operator'));p.wait_for_timeout(20);p.evaluate('sample();sample()');assert p.evaluate('allSamples')==2;checks['hushwave-operator']='total samples tracked across band';p.close()
    # The three generic-smoke false positives receive direct interactions.
    p=b.new_page();p.set_content(raw('lumen-relay'));p.wait_for_timeout(20);before=p.locator('#moves').inner_text();p.evaluate('rotate(2,2)');after=p.locator('#moves').inner_text();assert before!=after;checks['lumen-direct']=f'{before}->{after}';p.close()
    p=b.new_page();p.set_content(raw('hushwave-operator'));p.wait_for_timeout(20);before=p.locator('#fv').inner_text();p.keyboard.press('ArrowRight');after=p.locator('#fv').inner_text();assert before!=after;checks['hushwave-direct']=f'{before}->{after}';p.close()
    p=b.new_page();p.set_content(raw('crownline-tactics'));p.wait_for_timeout(20);before=p.locator('#tip').inner_text();p.evaluate('act(1,0)');after=p.locator('#tip').inner_text();assert before!=after and 'Operative C' in after;checks['crownline-direct']='operative selection';p.close()
    p=b.new_page(viewport={'width':960,'height':540});p.set_content(raw('atlas-below'));p.wait_for_timeout(30);before=p.evaluate('({x:p.x,y:p.y,o2:p.o2})');p.evaluate('move(1,0)');after=p.evaluate('({x:p.x,y:p.y,o2:p.o2})');assert after['x']==before['x']+1 and after['y']==before['y'] and after['o2']<before['o2'];checks['atlas-below-direct']=f"move {before['x']},{before['y']}->{after['x']},{after['y']}";p.close()
    p=b.new_page(viewport={'width':960,'height':540});p.set_content(raw('forgeflow'));p.wait_for_timeout(30);before=p.evaluate('grid[2][2]');p.mouse.click(192+2*72+36,92+2*72+36);after=p.evaluate('grid[2][2]');assert after==(before+1)%4;checks['forgeflow-direct']=f'{before}->{after}';p.close()
    b.close()
print(checks)
