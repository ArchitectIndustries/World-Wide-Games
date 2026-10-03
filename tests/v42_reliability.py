from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PRE = """<script>
const __store={};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,setItem:(k,v)=>__store[k]=String(v),removeItem:k=>delete __store[k]},configurable:true});
window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});
</script>"""

def page_html(game):
    src=(ROOT/f'games/{game}/index.html').read_text(errors='ignore')
    i=src.lower().find('<script')
    return src[:i]+PRE+src[i:]

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])

    # Skyhook: checkpoints must always resolve to safe ground segments, never the void.
    p=browser.new_page(viewport={'width':960,'height':700}); errs=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(page_html('skyhook-sprint'),wait_until='domcontentloaded')
    p.wait_for_timeout(80)
    p.evaluate("()=>eval(`p.respawn=620;p.x=1051;p.y=450;p.vx=0;p.vy=0;finished=false`)")
    p.wait_for_timeout(80)
    chk=p.evaluate("()=>eval('({respawn:p.respawn,safe:segs.some(s=>p.respawn>=s[0]+60&&p.respawn<=s[1]-60)})')")
    assert chk['safe'],chk
    assert not (760 < chk['respawn'] < 920),chk
    p.evaluate("()=>eval(`p.y=700;p.vx=0;p.vy=10`)")
    p.wait_for_timeout(80)
    resp=p.evaluate("()=>eval('({x:p.x,y:p.y,respawn:p.respawn,safe:segs.some(s=>p.x>=s[0]+60&&p.x<=s[1]-60)})')")
    assert resp['safe'] and abs(resp['x']-resp['respawn'])<2,resp
    assert not errs,errs
    p.close()

    # Crownline: an enemy must retarget living operatives if a closer unit died earlier in the turn.
    p=browser.new_page(viewport={'width':960,'height':700}); errs=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(page_html('crownline-tactics'),wait_until='domcontentloaded')
    p.wait_for_timeout(40)
    state=p.evaluate("""()=>{eval(`units=[{id:'A',x:6,y:0,hp:0,ap:2},{id:'B',x:0,y:5,hp:4,ap:2}];enemies=[{x:7,y:0,hp:3}];round=1;done=false;captured=new Set();enemyTurn()`);return eval('({units:units.map(u=>({id:u.id,hp:u.hp,x:u.x,y:u.y})),enemy:{...enemies[0]},round})')}""")
    assert state['units']==[{'id':'B','hp':4,'x':0,'y':5}],state
    assert (state['enemy']['x'],state['enemy']['y']) != (7,0),state
    assert not errs,errs
    p.close()

    # Vector League: final whistle must freeze simulation before a same-frame goal can mutate the score.
    p=browser.new_page(viewport={'width':960,'height':700}); errs=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(page_html('vector-league'),wait_until='domcontentloaded')
    p.wait_for_timeout(50)
    p.evaluate("()=>eval(`ys=4;as=0;over=false;start=performance.now()-91000;ball.x=0;ball.y=270;ball.vx=-20;ball.vy=0`)")
    p.wait_for_timeout(80)
    state=p.evaluate("()=>({events:window.__events,state:eval('({ys,as,over})')})")
    assert state['state']=={'ys':4,'as':0,'over':True},state
    assert len(state['events'])==1 and state['events'][0]['event']=='match-complete',state
    assert state['events'][0]['score']==2800,state
    assert not errs,errs
    p.close()


    # Windward Cargo: resource failure must win terminal-state priority over a same-frame final drop.
    p=browser.new_page(viewport={'width':960,'height':700}); errs=[]
    p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(page_html('windward-cargo'),wait_until='domcontentloaded')
    p.wait_for_timeout(50)
    p.evaluate("()=>eval(`delivery=3;hasCargo=true;done=false;p.x=routes[3].drop[0];p.y=routes[3].drop[1];p.vx=0;p.vy=0;p.fuel=0;p.cargo=50`)")
    p.wait_for_timeout(80)
    state=p.evaluate("()=>({events:window.__events.map(e=>e.event),state:eval('({delivery,done,fuel:p.fuel,cargo:p.cargo})')})")
    assert state['events']==['route-ended'],state
    assert state['state']['delivery']==3 and state['state']['done'],state
    assert not errs,errs
    p.close()

    browser.close()

print({'skyhookSafeCheckpoint':'pass','crownlineLivingRetarget':'pass','vectorFinalWhistleFreeze':'pass','windwardSingleTerminalEvent':'pass'})