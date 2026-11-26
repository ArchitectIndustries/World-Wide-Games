"""Browser regression checks. Inlined source with mocked storage; no live-origin claims."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'assets/wwg-campaign.js').read_text()
HOOK="window.__qa={state:()=>state,phase:()=>phase,stage:()=>stage,begin,finish,move,rescue,defense,draw,keys};"
assert SRC.endswith('})();\n')
SHIM='''<script>const store={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]},configurable:true});window.events=[];addEventListener('message',e=>window.events.push(e.data));</script>'''
checks=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for slug in ['stormwake-rescue','iron-meridian']:
  for viewport in [{'width':1000,'height':700},{'width':390,'height':844}]:
   page=browser.new_page(viewport=viewport);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   src=SRC[:-len('})();\n')]+HOOK+'})();\n';html=(ROOT/'games'/slug/'index.html').read_text().replace('</head>',SHIM+'</head>').replace('<script src="../../assets/wwg-campaign.js"></script>','<script>'+src+'</script>');page.set_content(html,wait_until='domcontentloaded');menu=page.locator('#menu');assert menu.is_visible();page.locator('#launch').click();assert not menu.is_visible();assert page.evaluate("__qa.phase()")=='play';assert page.evaluate("getComputedStyle(document.querySelector('#menu')).pointerEvents")=='none';x=page.evaluate('__qa.state().p.x');page.keyboard.down('ArrowRight');page.wait_for_timeout(280);page.keyboard.up('ArrowRight');assert page.evaluate('__qa.state().p.x')>x
   page.locator('#pause').click();assert menu.is_visible() and page.evaluate('__qa.phase()')=='paused';page.locator('#launch').click();assert not menu.is_visible();page.keyboard.press('KeyP');assert menu.is_visible();page.keyboard.press('KeyP');assert not menu.is_visible();page.locator('#restart').click();assert page.evaluate('__qa.state().t')<.5
   if slug=='stormwake-rescue':
    # Verify two-person capacity, dock delivery, boost expenditure, collision damage, timeout, retry.
    page.evaluate('''()=>{const s=__qa.state(),p=s.p;p.x=200;p.y=270;for(const o of s.entities.slice(0,3)){o.x=p.x;o.y=p.y};__qa.rescue(0)}''');assert page.evaluate('__qa.state().cargo')==2
    page.evaluate('''()=>{const s=__qa.state();s.p.x=80;s.p.y=270;__qa.rescue(0)}''');assert page.evaluate('__qa.state().saved')==2 and page.evaluate('__qa.state().cargo')==0
    page.evaluate('''()=>{__qa.keys.add('ArrowRight');__qa.keys.add('Space');__qa.move(.1);__qa.keys.clear()}''');assert page.evaluate('__qa.state().p.energy')<100
    page.evaluate('''()=>{const s=__qa.state(),p=s.p;p.x=s.reef[0].x+10;p.y=s.reef[0].y;__qa.rescue(0)}''');assert page.evaluate('__qa.state().p.hp')<100
    page.evaluate('''()=>{__qa.state().time=0;__qa.rescue(.02)}''');assert menu.is_visible() and page.evaluate('__qa.phase()')=='ended';page.locator('#launch').click();assert not menu.is_visible()
    for stage in range(3):
     assert page.evaluate('__qa.stage()')==stage
     page.evaluate('''()=>{let s=__qa.state();s.saved=s.goal;__qa.rescue(0)}''');assert menu.is_visible()
     if stage<2:page.locator('#launch').click();assert not menu.is_visible()
   else:
    # Verify firing, construction cost/cap, core repair, real projectile collision and loss.
    page.evaluate('''()=>{const s=__qa.state();s.p.x=350;s.p.y=270;__qa.keys.add('KeyE');__qa.defense(.01);__qa.keys.clear()}''');assert page.evaluate('__qa.state().turrets.length')==3 and page.evaluate('__qa.state().credits')==40
    page.evaluate('''()=>{const s=__qa.state();s.entities=[{x:365,y:270,hp:20,max:20,speed:0,damage:0,cd:100,heavy:false,fast:false}];__qa.keys.add('Space');__qa.defense(.01);__qa.keys.clear();__qa.defense(.03)}''');assert page.evaluate('__qa.state().kills')>=1
    page.evaluate('''()=>{const s=__qa.state();s.p.x=480;s.p.y=270;s.base=70;__qa.defense(.1)}''');assert page.evaluate('__qa.state().base')>70
    page.evaluate('''()=>{__qa.state().base=0;__qa.state().p.x=300;__qa.defense(0)}''');assert menu.is_visible();page.locator('#launch').click();assert not menu.is_visible()
    for stage in range(3):
     assert page.evaluate('__qa.stage()')==stage
     page.evaluate('''()=>{const s=__qa.state();s.kills=s.goal;s.entities=[];__qa.defense(0)}''');assert menu.is_visible()
     if stage<2:page.locator('#launch').click();assert not menu.is_visible()
   page.wait_for_timeout(100);assert page.evaluate("events.filter(e=>e.event==='campaign-complete').length") == 1;assert page.evaluate("events.filter(e=>e.event==='run-ended').length") == 1;assert page.evaluate("Number(localStorage.getItem(document.body.dataset.game+':best'))")>0;assert not errors,errors;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');checks.append({'game':slug,'viewport':viewport,'result':'pass'});page.close()
 browser.close()
print(json.dumps(checks,indent=2))
