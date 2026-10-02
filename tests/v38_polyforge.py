from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/polyforge-studio/index.html').read_text()
for token in ["Polyforge Studio 3.0","groupSelected()","exportSceneCode()","importSceneCode(code)","setGizmo('move')","80-step","Constellation Pavilion","studio-architect","wwg:polyforge:scene-v3"]: assert token in SRC,token
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
 h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>'); i=h.lower().find('<script'); return h[:i]+PRE+h[i:]
def add_types(p,types):
 for t in types:p.evaluate('(t)=>add(t)',t)
def clear_stage(p,n):
 p.evaluate(f"document.querySelector('#ov').classList.remove('show');objs=[];selected.clear();sel=-1;nextGroup=1;bp={n}")
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':390,'height':844});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw(),wait_until='domcontentloaded');p.wait_for_timeout(100)
 assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
 # Multi-select assembly grouping and group-aware transforms.
 add_types(p,['cube','pillar','orb'])
 p.evaluate('selected=new Set([0,1,2]);sel=0;groupSelected()')
 groups=p.evaluate('objs.map(o=>o.group)'); assert len(set(groups))==1 and groups[0]>0,groups
 assert p.evaluate('groupCount()')==1
 before=p.evaluate('clone(objs)')
 p.evaluate("moveSelection(1,0,0);setGizmo('rotate');rotateSelection(Math.PI/12);setGizmo('scale');scaleSelection(1.25)")
 after=p.evaluate('clone(objs)')
 assert all(after[i]['x']!=before[i]['x'] or after[i]['z']!=before[i]['z'] for i in range(3))
 assert all(after[i]['s']>=before[i]['s'] for i in range(3))
 # Real pointer-drag move gizmo path on a selected object.
 p.evaluate("setGizmo('move');selectOnly(0)")
 geom=p.evaluate("(()=>{const p=project(objs[0]),r=C.getBoundingClientRect();return{x:r.left+p.x*r.width/C.width,y:r.top+p.y*r.height/C.height,before:objs[0].x}})()")
 p.mouse.move(geom['x'],geom['y']);p.mouse.down();p.mouse.move(geom['x']+55,geom['y']);p.mouse.up();p.wait_for_timeout(30)
 assert p.evaluate('objs[0].x')!=geom['before']
 # Portable scene-code round-trip and undoability.
 code=p.evaluate('exportSceneCode()'); assert len(code)>50
 saved=p.evaluate('JSON.stringify(snapshot())')
 p.evaluate("objs=[];selected.clear();sel=-1;sync()")
 assert p.evaluate('(c)=>importSceneCode(c)',code)
 assert p.evaluate('JSON.stringify(snapshot())')==saved
 assert any(e.get('event')=='scene-exported' for e in p.evaluate('window.__events'))
 assert any(e.get('event')=='scene-imported' for e in p.evaluate('window.__events'))
 # History is capped at 80 checkpoints.
 p.evaluate('history=[];future=[];selected=new Set([0]);sel=0')
 for _ in range(90): p.evaluate("document.querySelector('#mat').click()")
 assert p.evaluate('history.length')==80
 # Seven authored certifications, preserving the legacy Master milestone at brief five.
 p.evaluate('objs=[];selected.clear();sel=-1;bp=1;score=0;history=[];future=[];nextGroup=1')
 add_types(p,['cube','cube','pillar','orb']);p.evaluate('certify()');assert p.evaluate('bp')==2
 clear_stage(p,2);add_types(p,['cube','cube','pillar','pillar','orb']);p.evaluate("objs[0].mat=0;objs[1].mat=1;objs[2].y=1.5;certify()");assert p.evaluate('bp')==3
 clear_stage(p,3);add_types(p,['cube','pillar','pillar','orb','orb','orb']);p.evaluate("objs[0].y=1;objs[1].y=1;objs[2].s=1.5;certify()");assert p.evaluate('bp')==4
 clear_stage(p,4);add_types(p,['cube','cube','pillar','pillar','orb','orb']);p.evaluate("objs.forEach((o,i)=>o.mat=i%5);objs[0].rot=.5;certify()");assert p.evaluate('bp')==5
 clear_stage(p,5);add_types(p,['cube','cube','cube','pillar','pillar','pillar','orb','orb','orb']);p.evaluate("objs.forEach((o,i)=>{o.mat=i%5;o.x=[-2,0,2][i%3];o.z=[-2,0,2][Math.floor(i/3)%3];if(i<3)o.y=1.25});certify()");assert p.evaluate('bp')==6
 assert 'Polyforge Master' in p.locator('#ot').inner_text()
 clear_stage(p,6);add_types(p,['cube','cube','cube','cube','pillar','pillar','pillar','orb']);p.evaluate("objs.forEach((o,i)=>o.group=i<3?1:undefined);objs[0].x=-1;objs[1].x=1;objs[0].z=0;objs[1].z=0;certify()");assert p.evaluate('bp')==7
 clear_stage(p,7);add_types(p,['cube']*4+['pillar']*4+['orb']*4);p.evaluate("objs.forEach((o,i)=>{o.group=i<6?1:2;o.mat=i%5;o.x=(i%4)*2-3;o.z=Math.floor(i/4)*3-3;if(i<4)o.y=1.25;if(i<2)o.rot=.5});certify()")
 assert p.locator('#ov').is_visible(); assert 'Polyforge Architect' in p.locator('#ot').inner_text(); assert p.evaluate('score')>12000
 events=p.evaluate('window.__events'); assert any(e.get('event')=='studio-mastered' for e in events),events; assert any(e.get('event')=='studio-architect' for e in events),events; assert any(e.get('event')=='group-created' for e in events),events
 m=p.evaluate("JSON.parse(localStorage.getItem(metaKey))"); assert m['bestBlueprint']==7 and m['architected']>=1 and m['mastered']>=1,m
 assert not errs,errs
 b.close()
print(json.dumps({'version':'3.0','grouping':'pass','gizmoDrag':'pass','sceneCode':'pass','historyLimit':80,'blueprints':7,'legacyMasterMilestone':'pass','architectEvent':'pass','mobileOverflow':'pass'}))
