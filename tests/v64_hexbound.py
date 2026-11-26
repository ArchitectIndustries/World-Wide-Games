from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'games/hexbound-tactics/index.html'
PRE="""<script>(()=>{const s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>Object.keys(s).forEach(k=>delete s[k])},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});})();</script>"""

def inline_html():
    src=GAME.read_text(errors='ignore')
    i=src.lower().find('<script>')
    return src[:i]+PRE+src[i:]

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':960,'height':700}); errors=[]; console=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.on('console',lambda m: console.append(m.text) if m.type=='error' else None)
    page.set_content(inline_html(),wait_until='domcontentloaded'); page.wait_for_timeout(30)

    # Historical defect: simultaneous lethal damage with unequal overkill clamped to a visible 0-0
    # but was still declared a player victory, incrementing the local win counter.
    page.evaluate("""()=>eval(`
      localStorage.clear();window.__events=[];setup();
      pcore=1;ecore=3;turn=4;gameOver=false;
      lanes=[{p:[clone({name:'Hexblade',cost:3,atk:5,hp:3,text:''})],e:[]},{p:[],e:[clone({name:'Ashguard',cost:1,atk:2,hp:3,text:''},true)]},{p:[],e:[]}];
      resolve();
    `)""")
    page.wait_for_timeout(20)
    mutual=page.evaluate("""()=>({pcore:eval('pcore'),ecore:eval('ecore'),gameOver:eval('gameOver'),title:document.querySelector('#result').textContent,text:document.querySelector('#resultText').textContent,wins:Number(localStorage.getItem('wwg:hexbound-wins')||0),events:window.__events.map(e=>e.event)})""")
    assert mutual['pcore']<0 and mutual['ecore']<0, mutual
    assert mutual['title']=='STALEMATE', mutual
    assert 'Both citadels fell' in mutual['text'], mutual
    assert mutual['wins']==0 and 'win' not in mutual['events'], mutual

    # Single-sided rival destruction remains a legitimate win with persistence/telemetry.
    page.evaluate("""()=>eval(`
      localStorage.clear();window.__events=[];setup();
      pcore=5;ecore=2;turn=4;gameOver=false;
      lanes=[{p:[clone({name:'Rune Archer',cost:2,atk:3,hp:2,text:''})],e:[]},{p:[],e:[]},{p:[],e:[]}];
      resolve();
    `)""")
    page.wait_for_timeout(20)
    win=page.evaluate("""()=>({pcore:eval('pcore'),ecore:eval('ecore'),title:document.querySelector('#result').textContent,wins:Number(localStorage.getItem('wwg:hexbound-wins')||0),events:window.__events.map(e=>e.event)})""")
    assert win['pcore']>0 and win['ecore']<=0, win
    assert win['title']=='HEXBOUND VICTORY' and win['wins']==1 and win['events']==['win'], win

    # Single-sided player destruction remains a loss and cannot increment wins.
    page.evaluate("""()=>eval(`
      localStorage.clear();window.__events=[];setup();
      pcore=2;ecore=5;turn=4;gameOver=false;
      lanes=[{p:[],e:[]},{p:[],e:[clone({name:'Rune Archer',cost:2,atk:3,hp:2,text:''},true)]},{p:[],e:[]}];
      resolve();
    `)""")
    page.wait_for_timeout(20)
    loss=page.evaluate("""()=>({pcore:eval('pcore'),ecore:eval('ecore'),title:document.querySelector('#result').textContent,wins:Number(localStorage.getItem('wwg:hexbound-wins')||0),events:window.__events.map(e=>e.event)})""")
    assert loss['pcore']<=0 and loss['ecore']>0, loss
    assert loss['title']=='RIVAL ASCENDANT' and loss['wins']==0 and loss['events']==[], loss

    # Positive equal cores at the eight-turn limit remain a normal stalemate.
    page.evaluate("""()=>eval(`localStorage.clear();window.__events=[];setup();pcore=7;ecore=7;turn=8;gameOver=false;lanes=[{p:[],e:[]},{p:[],e:[]},{p:[],e:[]}];resolve();`)""")
    page.wait_for_timeout(10)
    timed=page.evaluate("""()=>({title:document.querySelector('#result').textContent,wins:Number(localStorage.getItem('wwg:hexbound-wins')||0)})""")
    assert timed=={'title':'STALEMATE','wins':0}, timed

    # Real interaction: selecting an affordable card and lane deploys one unit and spends energy.
    page.evaluate("()=>eval(`localStorage.clear();setup()`)"); page.wait_for_timeout(10)
    before=page.evaluate("()=>({energy:eval('energy'),units:eval('lanes[0].p.length')})")
    cards=page.locator('#hand .card')
    affordable=None
    for i in range(cards.count()):
        cost=page.evaluate(f"()=>eval('hand[{i}].cost')")
        if cost<=before['energy']:
            affordable=i; break
    assert affordable is not None
    cost=page.evaluate(f"()=>eval('hand[{affordable}].cost')")
    cards.nth(affordable).click(); page.locator('[data-lane="0"]').click(); page.wait_for_timeout(10)
    after=page.evaluate("()=>({energy:eval('energy'),units:eval('lanes[0].p.length')})")
    assert after['units']==1 and after['energy']==before['energy']-cost, (before,cost,after)

    # 390px mobile layout stays horizontally contained with playable cards/end-turn control.
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(20)
    mobile=page.evaluate("""()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,end:document.querySelector('#end').getBoundingClientRect(),cards:[...document.querySelectorAll('#hand .card')].map(x=>x.getBoundingClientRect())})""")
    assert mobile['sw']<=mobile['iw']+2, mobile
    assert mobile['end']['width']>60 and mobile['end']['height']>30, mobile
    assert mobile['cards'] and all(x['width']>=120 and x['height']>70 for x in mobile['cards']), mobile
    assert not errors and not console, (errors,console)
    browser.close()

print({'hexbound11':'pass','mutualDestruction':'stalemate','falseWinCounter':'blocked','singleSidedWinLoss':'pass','interaction':'pass','mobile':'pass'})
