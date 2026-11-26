from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
GAME=(ROOT/'games/vector-league/index.html').read_text()
INPUT=(ROOT/'assets/wwg-input.js').read_text()
INDEX=(ROOT/'index.html').read_text(); GAMES=(ROOT/'js/games.js').read_text(); RULES=(ROOT/'js/event-rules.js').read_text(); APP=(ROOT/'js/app.js').read_text(); CSS=(ROOT/'assets/styles.css').read_text()
GAME=GAME.replace('<script src="../../assets/wwg-input.js"></script>', '<script>'+INPUT+'</script>')
PRE="<script>window.__events=[];addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
GAME=GAME.replace('<script>','<script>'+PRE.replace('<script>','').replace('</script>','')+'</script><script>',1)

def storage_script(seed):
    return "<script>Object.defineProperty(window,'localStorage',{value:(()=>{const s="+json.dumps({k:json.dumps(v) for k,v in seed.items()})+";return{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k]),key:i=>Object.keys(s)[i]||null,get length(){return Object.keys(s).length}}})(),configurable:true});</script>"

def home_doc(seed):
    h=INDEX.replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{CSS}</style>')
    h=re.sub(r'<script src="js/games\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{GAMES}</script>',h)
    h=re.sub(r'<script src="js/event-rules\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{RULES}</script>',h)
    h=re.sub(r'<script src="js/app\.js(?:\?v\d+)?"></script>',lambda _:f'<script>{APP}</script>',h)
    return h.replace('<body>','<body>'+storage_script(seed),1)

def new_game_page(browser, viewport=None, **kwargs):
    page=browser.new_page(viewport=viewport or {'width':960,'height':540}, **kwargs)
    page.set_content(GAME,wait_until='domcontentloaded',timeout=10000)
    page.wait_for_timeout(70)
    return page

def finish(page, you, rival, timed_out=False):
    page.evaluate('(v)=>{ys=v[0];as=v[1];YOU.textContent=ys;AI.textContent=as;if(v[2])start=performance.now()-91000}',[you,rival,timed_out])
    page.wait_for_timeout(120)
    return page.evaluate('()=>window.__events')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    errors=[]

    # Legitimate win: compatibility telemetry plus the only clearable outcome.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e))); ev=finish(page,5,2)
    assert [e['event'] for e in ev]==['match-complete','match-won'],ev
    assert 'score' not in ev[0] and ev[0]['meta']['outcome']=='match-won',ev
    assert isinstance(ev[1].get('score'),(int,float)) and ev[1]['score']>0 and ev[1]['meta']['outcome']=='match-won',ev
    page.keyboard.press('Space'); page.wait_for_timeout(40)
    assert page.evaluate('()=>({over,ys,as})')=={'over':False,'ys':0,'as':0}

    page.close()

    # Loss and draw remain terminal results but cannot emit the clear event or submit a best-score candidate.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e))); loss=finish(page,2,5)
    assert [e['event'] for e in loss]==['match-complete','match-lost'] and not any(e['event']=='match-won' for e in loss),loss
    assert all('score' not in e for e in loss),loss
    page.close()
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e))); draw=finish(page,2,2,True)
    assert [e['event'] for e in draw]==['match-complete','match-draw'] and not any(e['event']=='match-won' for e in draw),draw
    assert all('score' not in e for e in draw),draw
    page.close()

    # Real movement input still works after the event change.
    page=new_game_page(browser); page.on('pageerror',lambda e:errors.append(str(e))); x0=page.evaluate('()=>p.x'); page.keyboard.down('ArrowRight'); page.wait_for_timeout(120); page.keyboard.up('ArrowRight'); x1=page.evaluate('()=>p.x'); assert x1>x0+1,(x0,x1)

    page.close()

    # Narrow/coarse layout retains usable touch controls without horizontal overflow.
    mobile=new_game_page(browser,viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    dims=mobile.evaluate('()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,buttons:[...document.querySelectorAll(".mobile button")].map(b=>({txt:b.textContent.trim(),display:getComputedStyle(b).display}))})')
    assert dims['sw']<=dims['iw']+2,dims
    assert len(dims['buttons'])==5 and all(b['display']!='none' for b in dims['buttons']),dims
    mobile.close()

    # Platform classification: losses/draws/neutral match-complete never clear; match-won does.
    page=browser.new_page(viewport={'width':1280,'height':900}); page.on('pageerror',lambda e:errors.append(str(e)))
    day=page.evaluate("()=>new Date().toLocaleDateString('en-CA')")
    fail_events={'vector-league:match-complete':1,'vector-league:match-lost':1,'vector-league:match-draw':1}
    page.set_content(home_doc({'wwg:events':fail_events,'wwg:daily':{day:{'plays':1,'unique':['vector-league'],'brain':0,'milestones':99,'ratings':0,'eventKeys':list(fail_events)}}}),wait_until='domcontentloaded',timeout=10000); page.wait_for_timeout(100)
    assert re.search(r'0\s*games cleared',page.locator('#profileStats').inner_text()),page.locator('#profileStats').inner_text()
    norm=json.loads(page.evaluate("()=>localStorage.getItem('wwg:daily')"))[day]; assert norm['milestones']==0,norm
    page.select_option('#statusFilter','Cleared'); page.wait_for_timeout(30); assert page.locator('#gameGrid .game-card').count()==0

    win_events={**fail_events,'vector-league:match-won':1}
    page.set_content(home_doc({'wwg:events':win_events}),wait_until='domcontentloaded',timeout=10000); page.wait_for_timeout(100)
    assert re.search(r'1\s*games cleared',page.locator('#profileStats').inner_text()),page.locator('#profileStats').inner_text()
    page.select_option('#statusFilter','Cleared'); page.wait_for_timeout(30); cards=page.locator('#gameGrid .game-card'); assert cards.count()==1 and 'Vector League' in cards.first.inner_text()
    rules=page.evaluate("()=>({win:WWG_EVENT_RULES.isCompletionKey('vector-league:match-won'),loss:WWG_EVENT_RULES.isCompletionKey('vector-league:match-lost'),draw:WWG_EVENT_RULES.isCompletionKey('vector-league:match-draw'),neutral:WWG_EVENT_RULES.isCompletionKey('vector-league:match-complete')})")
    assert rules=={'win':True,'loss':False,'draw':False,'neutral':False},rules
    assert not errors,errors
    browser.close()
print({'vectorLeague':'pass','winEvent':'match-won','lossExcluded':True,'drawExcluded':True,'restart':'pass','keyboard':'pass','mobile':'pass','platformClear':'pass'})
