from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/polyforge-studio/index.html').read_text()
for token in ["const mats=[","Snap 0.50","function undo()","function redo()","const blueprints=[","studio-mastered","wwg:polyforge:scene-v2"]: assert token in SRC,token
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
 h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>'); i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
def add_types(p,types):
 for t in types:p.evaluate('(t)=>add(t)',t)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':390,'height':844});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw(),wait_until='domcontentloaded');p.wait_for_timeout(80)
 assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
 # Transform tools, history, snap and autosave.
 p.evaluate("add('cube')"); base=p.evaluate('snapshot()')
 p.evaluate("document.querySelector('#mat').click();document.querySelector('#scaleUp').click();document.querySelector('#rot').click();action('right');autoSave()")
 changed=p.evaluate('snapshot()'); assert changed['objs'][0]['mat']==1 and changed['objs'][0]['s']>1 and changed['objs'][0]['rot']>0 and changed['objs'][0]['x']!=base['objs'][0]['x']
 p.evaluate('undo()'); assert p.evaluate('objs[0].x')==base['objs'][0]['x']
 p.evaluate('redo()'); assert p.evaluate('objs[0].x')==changed['objs'][0]['x']
 assert p.evaluate("JSON.parse(localStorage.getItem(sk)).objs.length")==1
 p.evaluate("document.querySelector('#snap').click()"); assert p.evaluate('snap')==1
 p.evaluate("document.querySelector('#snap').click()"); assert p.evaluate('snap')==.25
 # Complete all five authored certifications through the real certify path.
 p.evaluate('objs=[];sel=-1;bp=1;score=0;history=[];future=[]')
 add_types(p,['cube','cube','pillar','orb']); p.evaluate('certify()'); assert p.evaluate('bp')==2
 p.evaluate("document.querySelector('#ov').classList.remove('show');objs=[];sel=-1")
 add_types(p,['cube','cube','pillar','pillar','orb']); p.evaluate("objs[0].mat=0;objs[1].mat=1;objs[2].y=1.5;certify()"); assert p.evaluate('bp')==3
 p.evaluate("document.querySelector('#ov').classList.remove('show');objs=[];sel=-1")
 add_types(p,['cube','pillar','pillar','orb','orb','orb']); p.evaluate("objs[0].y=1;objs[1].y=1;objs[2].s=1.5;certify()"); assert p.evaluate('bp')==4
 p.evaluate("document.querySelector('#ov').classList.remove('show');objs=[];sel=-1")
 add_types(p,['cube','cube','pillar','pillar','orb','orb']); p.evaluate("objs.forEach((o,i)=>o.mat=i%5);objs[0].rot=.5;certify()"); assert p.evaluate('bp')==5
 p.evaluate("document.querySelector('#ov').classList.remove('show');objs=[];sel=-1")
 add_types(p,['cube','cube','cube','pillar','pillar','pillar','orb','orb','orb'])
 p.evaluate("objs.forEach((o,i)=>{o.mat=i%5;o.x=[-2,0,2][i%3];o.z=[-2,0,2][Math.floor(i/3)%3];if(i<3)o.y=1.25});certify()")
 assert p.locator('#ov').is_visible(); assert 'Polyforge Master' in p.locator('#ot').inner_text(); assert p.evaluate('score')>8000
 events=p.evaluate('window.__events'); assert any(e.get('event')=='studio-mastered' for e in events),events
 m=p.evaluate("JSON.parse(localStorage.getItem(metaKey))"); assert m['bestBlueprint']==5 and m['mastered']>=1
 assert not errs,errs
 b.close()
print(json.dumps({'materials':5,'snapLevels':[0.25,0.5,1.0],'undoRedo':'pass','autosave':'pass','blueprints':5,'masteryEvent':'pass','mobileOverflow':'pass'}))
