from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}

def raw(slug,seed=None,keymap=False):
    s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    state=dict(seed or {})
    if keymap: state['wwg:keymap']=json.dumps(MAP)
    pre="<script>const __s="+json.dumps(state)+";Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],clear:()=>Object.keys(__s).forEach(k=>delete __s[k]),_s:__s},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
    i=s.lower().find('<script'); return s[:i]+pre+s[i:]

def build(p,items):
    for tool,i in items:p.evaluate('(x)=>{tool=x[0];build(x[1])}',[tool,i])

def finish_founders(p):
    p.evaluate("choosePolicy('homestead')")
    build(p,[('house',0),('house',1),('park',9),('farm',16),('farm',17),('water',25),('power',30)])
    for _ in range(12):
        t=p.evaluate('turn')
        if t==3:p.evaluate("tool='farm';build(24)")
        if t==5:p.evaluate("tool='power';build(31)")
        if t==7:p.evaluate("tool='farm';build(16)")
        if t==9:p.evaluate("tool='park';build(8)")
        p.evaluate('advance()')
        if p.evaluate('done'):break
    assert p.evaluate('success')

def finish_tempest(p):
    p.evaluate('nextCharter()'); p.evaluate("choosePolicy('reserve')")
    build(p,[('house',0),('house',1),('house',8),('farm',16),('farm',17),('water',25),('power',30),('lab',31)])
    for _ in range(12):
        t=p.evaluate('turn');cr=p.evaluate('credits')
        if t==3 and cr>=32:p.evaluate("tool='park';build(9)")
        if t==5 and p.evaluate('credits')>=35:p.evaluate("tool='house';build(7)")
        if t==7 and p.evaluate('credits')>=45:p.evaluate("tool='power';build(29)")
        if t==9 and p.evaluate('credits')>=30:p.evaluate("tool='farm';build(24)")
        p.evaluate('advance()')
        if p.evaluate('done'):break
    assert p.evaluate('success')

def finish_scholar(p):
    p.evaluate('nextCharter()'); p.evaluate("choosePolicy('academy')")
    build(p,[('house',0),('house',1),('house',8),('house',7),('farm',16),('farm',17),('water',25),('power',30),('lab',31)])
    for _ in range(12):
        t=p.evaluate('turn');cr=p.evaluate('credits')
        if t==3 and cr>=32:p.evaluate("tool='park';build(9)")
        if t==5 and p.evaluate('credits')>=30:p.evaluate("tool='farm';build(24)")
        if t==7 and p.evaluate('credits')>=45:p.evaluate("tool='power';build(29)")
        if t==9 and p.evaluate('credits')>=39:p.evaluate("tool='lab';build(31)")
        p.evaluate('advance()')
        if p.evaluate('done'):break
    assert p.evaluate('success')

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    # Aetherstead: real campaign path and persistence.
    p=b.new_page(viewport={'width':1120,'height':820});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw('aetherstead-colony'),wait_until='domcontentloaded');p.wait_for_timeout(30)
    p.evaluate("choosePolicy('homestead')");build(p,[('house',0),('house',1),('park',9),('farm',16),('farm',17),('water',25),('power',30)])
    p.evaluate('advance()');p.evaluate('advance()');save=p.evaluate("localStorage.getItem('wwg:aetherstead-save')");meta=p.evaluate("localStorage.getItem('wwg:aetherstead-meta')")
    q=b.new_page();q.set_content(raw('aetherstead-colony',{'wwg:aetherstead-save':save,'wwg:aetherstead-meta':meta}),wait_until='domcontentloaded');q.wait_for_timeout(20);assert q.evaluate('turn')==3 and q.evaluate("cells.filter(c=>c.t!=='empty').length")==7 and q.evaluate('policy')=='homestead';q.close();assert not errs,errs;p.close()
    # restart clean and finish the authored 36-turn campaign with legal builds.
    p=b.new_page(viewport={'width':1120,'height':820});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw('aetherstead-colony'),wait_until='domcontentloaded');p.wait_for_timeout(20);finish_founders(p);finish_tempest(p);finish_scholar(p)
    p.wait_for_timeout(60);aevents=p.evaluate('window.__events');assert [e['event'] for e in aevents].count('charter-complete')==3 and any(e['event']=='colony-campaign-complete' for e in aevents),aevents
    afinal=p.evaluate("({campaignScore,meta:JSON.parse(localStorage.getItem('wwg:aetherstead-meta')),save:JSON.parse(localStorage.getItem('wwg:aetherstead-save'))})")
    assert afinal['campaignScore']>15000 and afinal['meta']['clears']==1 and len(afinal['meta']['completed'])==3 and afinal['save']['done']
    # Custom remap contract + narrow layout.
    r=b.new_page(viewport={'width':390,'height':844});r.set_content(raw('aetherstead-colony',keymap=True),wait_until='domcontentloaded');r.wait_for_timeout(20);before=r.evaluate('cursor');r.keyboard.press('KeyL');assert r.evaluate('cursor')!=before;r.keyboard.press('KeyF');assert r.evaluate("cells.filter(c=>c.t==='house').length")==1;tool0=r.evaluate('tool');r.keyboard.press('KeyH');assert r.evaluate('tool')!=tool0;assert r.evaluate('document.documentElement.scrollWidth<=390');r.close();assert not errs,errs;p.close()

    # Mosslight: traverse the real quest/combat state machine through all six regions and finale.
    p=b.new_page(viewport={'width':1120,'height':760});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw('mosslight-vale'),wait_until='domcontentloaded');p.wait_for_timeout(40)
    def go(expr,wait=18):p.evaluate(expr);p.wait_for_timeout(wait)
    go('player.x=elder.x;player.y=elder.y;interact()');assert p.evaluate('questStage')==1
    for i in range(4):go(f'player.x=shardPos[{i}].x;player.y=shardPos[{i}].y',35)
    assert p.evaluate('questStage')==2 and p.evaluate('player.shards')==4
    go("(()=>{const e=enemies.find(x=>x.boss&&!x.final);player.x=e.x-20;player.y=e.y;for(let i=0;i<8;i++){attackT=0;attack()}})()");assert p.evaluate('questStage')==3
    go('player.x=elder.x;player.y=elder.y;interact()');assert p.evaluate('questStage')==4
    go('player.x=iona.x;player.y=iona.y;interact()');
    for i in range(3):go(f'player.x=memorySeeds[{i}].x;player.y=memorySeeds[{i}].y',35)
    go('player.x=iona.x;player.y=iona.y;interact()');assert p.evaluate('postStage')==3
    go('player.x=senn.x;player.y=senn.y;interact()')
    for i in range(3):go(f'player.x=lumenReeds[{i}].x;player.y=lumenReeds[{i}].y;attackT=0;attack()')
    go('player.x=senn.x;player.y=senn.y;interact()');assert p.evaluate('fenStage')==3
    mid=p.evaluate("localStorage.getItem('wwg:mosslight-save')")
    q=b.new_page();q.set_content(raw('mosslight-vale',{'wwg:mosslight-save':mid}),wait_until='domcontentloaded');q.wait_for_timeout(30);assert q.evaluate('fenStage')==3 and q.evaluate('blade')==3 and q.evaluate('epilogueStage')==0;q.close()
    go('player.x=orrin.x;player.y=orrin.y;interact()')
    for i in range(3):go(f'player.x=sunbells[{i}].x;player.y=sunbells[{i}].y;attackT=0;attack()')
    go('player.x=orrin.x;player.y=orrin.y;interact()');assert p.evaluate('reachStage')==3
    go('player.x=nera.x;player.y=nera.y;interact()')
    for i in range(3):go(f'player.x=duskOrchids[{i}].x;player.y=duskOrchids[{i}].y;attackT=0;attack()')
    go('player.x=nera.x;player.y=nera.y;interact()');assert p.evaluate('hollowStage')==3
    go('player.x=elian.x;player.y=elian.y;interact()')
    for i in range(3):go(f'player.x=starLilies[{i}].x;player.y=starLilies[{i}].y;attackT=0;attack()')
    go('player.x=elian.x;player.y=elian.y;interact()');assert p.evaluate('canopyStage')==3 and p.evaluate('epilogueStage')==1
    go("(()=>{const e=enemies.find(x=>x.final);player.x=e.x-20;player.y=e.y;for(let i=0;i<5;i++){attackT=0;attack()}})()");assert p.evaluate('epilogueStage')==2 and p.evaluate('enemies.find(x=>x.final).dead')
    go('player.x=elian.x;player.y=elian.y;interact()');assert p.evaluate('epilogueStage')==3
    mevents=p.evaluate('window.__events');names=[e['event'] for e in mevents];assert names==['vale-restored','memory-garden-restored','silverfen-restored','sunfall-restored','moonroot-restored','starbloom-restored','starshade-defeated','campaign-complete'],names
    finalsave=p.evaluate("localStorage.getItem('wwg:mosslight-save')");finalmeta=p.evaluate("localStorage.getItem('wwg:mosslight-meta')");q=b.new_page();q.set_content(raw('mosslight-vale',{'wwg:mosslight-save':finalsave,'wwg:mosslight-meta':finalmeta}),wait_until='domcontentloaded');q.wait_for_timeout(30);assert q.evaluate('epilogueStage')==3 and q.evaluate('enemies.find(x=>x.final).dead') and q.evaluate('blade')==6;q.close();assert not errs,errs;p.close()
    b.close()
print(json.dumps({'aetherstead':'3-charter legal completion + save/reload + custom remap','mosslight':'six-region progression + two bosses + autosave/reload + campaign completion'}))
