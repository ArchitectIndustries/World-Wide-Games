from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
GAME=(ROOT/'games/harbor-pulse/index.html').read_text()
INDEX=(ROOT/'index.html').read_text(); GAMES=(ROOT/'js/games.js').read_text(); RULES=(ROOT/'js/event-rules.js').read_text(); APP=(ROOT/'js/app.js').read_text(); CSS=(ROOT/'assets/styles.css').read_text()
PRE="""<script>
window.__events=[];addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});
Object.defineProperty(window,'localStorage',{value:(()=>{const s={};return{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k]),key:i=>Object.keys(s)[i]||null,get length(){return Object.keys(s).length}}})(),configurable:true});
</script>"""
GAME=GAME.replace('<script>',PRE+'<script>',1)

def storage_script(seed):
    encoded={k:json.dumps(v) for k,v in seed.items()}
    return "<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s="+json.dumps(encoded)+";return{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k]),key:i=>Object.keys(s)[i]||null,get length(){return Object.keys(s).length}}})(),configurable:true});</script>"

def home_doc(seed):
    h=INDEX.replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{CSS}</style>')
    h=re.sub(r'<script src="js/games\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{GAMES}</script>',h)
    h=re.sub(r'<script src="js/event-rules\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{RULES}</script>',h)
    h=re.sub(r'<script src="js/app\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{APP}</script>',h)
    return h.replace('<body>','<body>'+storage_script(seed),1)

def new_game_page(browser, viewport=None, **kwargs):
    page=browser.new_page(viewport=viewport or {'width':960,'height':540}, **kwargs)
    page.set_content(GAME,wait_until='domcontentloaded',timeout=10000)
    page.wait_for_timeout(60)
    return page

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    errors=[]

    # Historical v71 defect is blocked: reputation collapse is an explicit unscored failure and cannot set the best.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("()=>{credits=120;rep=0;time=35;step(performance.now()+16)}")
    page.wait_for_timeout(40)
    ev=page.evaluate('()=>window.__events')
    assert [e['event'] for e in ev]==['shift-complete','shift-failed'],ev
    assert all('score' not in e for e in ev),ev
    assert ev[0]['meta']['outcome']=='shift-failed' and ev[1]['meta']['outcome']=='shift-failed',ev
    assert page.evaluate("()=>localStorage.getItem('wwg:harbor-best')") is None
    assert 'Harbor closed' in page.locator('#tip').inner_text()
    page.close()

    # A legitimate full shift clears and is the only result allowed to submit a score/best.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("()=>{credits=140;rep=2;time=0;step(performance.now()+16)}")
    page.wait_for_timeout(40)
    ev=page.evaluate('()=>window.__events')
    assert [e['event'] for e in ev]==['shift-complete','shift-cleared'],ev
    assert 'score' not in ev[0] and ev[0]['meta']['outcome']=='shift-cleared',ev
    assert ev[1].get('score')==140 and ev[1]['meta']['outcome']=='shift-cleared',ev
    assert page.evaluate("()=>localStorage.getItem('wwg:harbor-best')")=='140'
    assert 'Shift cleared' in page.locator('#tip').inner_text()
    page.click('#restart'); page.wait_for_timeout(25)
    restarted=page.evaluate('()=>({over,rep,time,credits})'); assert restarted['over'] is False and restarted['rep']==5 and restarted['credits']==0 and 89<restarted['time']<=90,restarted
    page.close()

    # Real pointer routing still selects a ship and assigns a matching berth.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("()=>{ships=[{id:1,x:250,y:300,vx:0,vy:0,c:0,target:null,r:13,done:false}];selected=null;spawn=999}")
    page.mouse.click(250,300); page.wait_for_timeout(15)
    assert page.evaluate('()=>selected&&selected.id')==1
    page.mouse.click(250,465); page.wait_for_timeout(15)
    routed=page.evaluate('()=>({selected:selected===null,target:ships[0].target&&{x:ships[0].target.x,y:ships[0].target.y,c:ships[0].target.c}})')
    assert routed=={'selected':True,'target':{'x':250,'y':465,'c':0}},routed
    page.close()

    # Narrow/coarse layout remains usable without horizontal overflow.
    mobile=new_game_page(browser,viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    dims=mobile.evaluate('()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,restart:getComputedStyle(document.querySelector("#restart")).display,tip:getComputedStyle(document.querySelector("#tip")).display})')
    assert dims['sw']<=dims['iw']+2,dims
    assert dims['restart']!='none' and dims['tip']!='none',dims
    mobile.close()

    # Platform classification: neutral/failure events never clear or earn a Daily Circuit milestone; shift-cleared does.
    page=browser.new_page(viewport={'width':1280,'height':900}); page.on('pageerror',lambda e:errors.append(str(e)))
    day=page.evaluate("()=>new Date().toLocaleDateString('en-CA')")
    fail_events={'harbor-pulse:shift-complete':1,'harbor-pulse:shift-failed':1}
    page.set_content(home_doc({'wwg:events':fail_events,'wwg:daily':{day:{'plays':1,'unique':['harbor-pulse'],'brain':0,'milestones':99,'ratings':0,'eventKeys':list(fail_events)}}}),wait_until='domcontentloaded',timeout=10000); page.wait_for_timeout(100)
    assert re.search(r'0\s*games cleared',page.locator('#profileStats').inner_text()),page.locator('#profileStats').inner_text()
    norm=json.loads(page.evaluate("()=>localStorage.getItem('wwg:daily')"))[day]; assert norm['milestones']==0,norm
    page.select_option('#statusFilter','Cleared'); page.wait_for_timeout(30); assert page.locator('#gameGrid .game-card').count()==0

    clear_events={**fail_events,'harbor-pulse:shift-cleared':1}
    page.set_content(home_doc({'wwg:events':clear_events}),wait_until='domcontentloaded',timeout=10000); page.wait_for_timeout(100)
    assert re.search(r'1\s*games cleared',page.locator('#profileStats').inner_text()),page.locator('#profileStats').inner_text()
    page.select_option('#statusFilter','Cleared'); page.wait_for_timeout(30); cards=page.locator('#gameGrid .game-card'); assert cards.count()==1 and 'Harbor Pulse' in cards.first.inner_text()
    rules=page.evaluate("()=>({clear:WWG_EVENT_RULES.isCompletionKey('harbor-pulse:shift-cleared'),fail:WWG_EVENT_RULES.isCompletionKey('harbor-pulse:shift-failed'),neutral:WWG_EVENT_RULES.isCompletionKey('harbor-pulse:shift-complete'),milestone:WWG_EVENT_RULES.isMilestoneKey('harbor-pulse:shift-cleared')})")
    assert rules=={'clear':True,'fail':False,'neutral':False,'milestone':True},rules
    assert not errors,errors
    browser.close()

print({'harborPulse':'pass','failureUnscored':True,'clearScored':True,'pointerRouting':'pass','mobile':'pass','platformClear':'pass'})