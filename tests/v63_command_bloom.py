from pathlib import Path
from collections import deque
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'games/command-bloom/index.html'
PRE = """<script>
window.__events=[];
window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});
</script>"""

def inline_html():
    src = GAME.read_text(errors='ignore')
    i = src.lower().find('<script>')
    return src[:i] + PRE + src[i:]

def shortest(level):
    n=8
    cores={tuple(c):i for i,c in enumerate(level['c'])}
    full=(1<<len(cores))-1
    start=(level['s'][0],level['s'][1],level['s'][2],0)
    q=deque([(start,'')]); seen={start}
    while q:
        (x,y,d,m),seq=q.popleft()
        if m==full and [x,y]==level['g']:
            return seq
        for cmd in 'FLRP':
            nx,ny,nd,nm=x,y,d,m
            if cmd=='L': nd=(d+3)%4
            elif cmd=='R': nd=(d+1)%4
            elif cmd=='P':
                if (x,y) in cores: nm=m|(1<<cores[(x,y)])
            else:
                ds=[(0,-1),(1,0),(0,1),(-1,0)]
                dx,dy=ds[d]; tx,ty=x+dx,y+dy
                if 0<=tx<n and 0<=ty<n and [tx,ty] not in level['w']:
                    nx,ny=tx,ty
            st=(nx,ny,nd,nm)
            if st not in seen:
                seen.add(st); q.append((st,seq+cmd))
    return None

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':960,'height':700}); errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(inline_html(),wait_until='domcontentloaded')
    page.wait_for_timeout(50)

    levels=page.evaluate("()=>eval('levels.map(l=>JSON.parse(JSON.stringify(l)))')")
    paths=[shortest(l) for l in levels]
    assert all(paths), paths
    assert max(map(len,paths)) <= 30, [len(x) for x in paths]

    # Historical defect reproduction: stage 6 was selectable immediately and solving only it
    # incorrectly declared all six programs stabilized. It may still be selected for open-order
    # play, but campaign completion must require six unique clears.
    page.evaluate("()=>eval(`idx=5;resetStage();cores.forEach(c=>c.got=true);bot.x=levels[idx].g[0];bot.y=levels[idx].g[1];check()`)")
    page.wait_for_timeout(20)
    one=page.evaluate("()=>({done:eval('done'),cleared:[...eval('cleared')],idx:eval('idx'),solved:document.querySelector('#solved').textContent,events:window.__events.map(e=>e.event),tip:document.querySelector('#tip').textContent,stage6Disabled:document.querySelector('[data-level=\"5\"]').disabled})")
    assert one['done'] is False, one
    assert one['cleared']==[5] and one['solved']=='1', one
    assert one['events']==[], one
    assert one['stage6Disabled'] is True, one
    assert '1/6' in one['tip'], one

    # Solve the five remaining maps through the same completion function. The final event should
    # fire exactly once only after the sixth unique map is stabilized.
    for _ in range(5):
        page.evaluate("()=>eval(`cores.forEach(c=>c.got=true);bot.x=levels[idx].g[0];bot.y=levels[idx].g[1];check()`)")
        page.wait_for_timeout(10)
    final=page.evaluate("()=>({done:eval('done'),cleared:[...eval('cleared')].sort(),events:window.__events.map(e=>e.event),tip:document.querySelector('#tip').textContent})")
    assert final['done'] is True and final['cleared']==[0,1,2,3,4,5], final
    assert final['events']==['program-complete'], final
    assert 'All six programs stabilized' in final['tip'], final

    # Escape after completion must start a clean six-stage campaign.
    page.keyboard.press('Escape'); page.wait_for_timeout(20)
    reset=page.evaluate("()=>({done:eval('done'),cleared:[...eval('cleared')],idx:eval('idx'),solved:document.querySelector('#solved').textContent})")
    assert reset=={'done':False,'cleared':[],'idx':0,'solved':'0'}, reset

    # Narrow layout remains usable and does not overflow horizontally.
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(20)
    mobile=page.evaluate("()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,buttons:[...document.querySelectorAll('.commands button')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})")
    assert mobile['sw'] <= mobile['iw']+2, mobile
    assert len(mobile['buttons'])==4 and all(b['w']>40 and b['h']>30 for b in mobile['buttons']), mobile
    assert not errors, errors
    browser.close()

print({'commandBloomCampaignIntegrity':'pass','uniqueStageClears':6,'allStagesReachable':'pass','maxShortestCommands':max(map(len,paths)),'mobile':'pass'})
