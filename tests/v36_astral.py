from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/astral-menagerie/index.html').read_text()
for token in ["wwg:astral-menagerie:save-v2","wwg:astral-menagerie:meta-v2","trainer-triad","codex-master","Scorch","Snare","Mend","Static","Guard","reserve","questWins","habitat-quest-complete"]:
    assert token.lower() in SRC.lower(), token
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{__pm.call(window,d,'*')}catch{}};</script>"""
def raw():
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    i=h.lower().find('<script')
    return h[:i]+PRE+h[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(120)
    assert not errs, errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    assert p.evaluate('species.length')==15 and p.evaluate('Object.keys(habitats).length')==3
    p.locator('[data-s="0"]').click()
    assert p.evaluate('state.party.length')==1 and p.evaluate('state.codex.length')==1
    p.evaluate('recruit(1,5);recruit(2,5);recruit(3,5);recruit(4,5)')
    assert p.evaluate('[state.party.length,state.reserve.length]')==[4,1]
    reserve_species=p.evaluate('state.reserve[0].i'); p.evaluate('swapReserve(0)')
    assert p.evaluate('state.party[state.active].i')==reserve_species
    p.locator('#next').click()
    p.evaluate("state.party[0]=creature(0,5);state.active=0;battle={kind:'wild',wild:makeWild(1,5,false),queue:null,slot:0,name:'',guard:false,msg:'test'}")
    hp=p.evaluate('battle.wild.hp'); p.evaluate('skill()')
    assert p.evaluate('battle!==null && battle.wild.status && battle.wild.status.kind')=='Scorch'
    assert p.evaluate('battle.wild.hp')<hp
    p.evaluate('state.party[1]=creature(2,5);state.party[1].hp=20;switchParty(true,1)')
    assert p.evaluate('state.active')==1
    before=p.evaluate('active().hp'); p.evaluate('active().skillCd=0;battle.wild.lvl=1;skill()')
    assert p.evaluate('active().hp')>before, 'Tide Mend should net-heal against a low-level target'
    p.evaluate("battle=null;Math.random=()=>0;startBattle(false);battle.wild.hp=1")
    codex_before=p.evaluate('state.codex.length'); p.evaluate('capture()')
    assert p.evaluate('battle===null') and p.evaluate('state.codex.length')>=codex_before
    p.evaluate("Array.from({length:12},(_,i)=>i).forEach(i=>{if(!state.codex.includes(i))recruit(i,4)})")
    assert p.evaluate('state.codex.length')>=12 and p.evaluate('meta.codexMastered')
    events=p.evaluate('window.__events'); assert any(e.get('event')=='codex-master' for e in events), events
    p.evaluate("battle=null;state.hab=1;state.questWins[1]=2;state.trainers[1]=false;state.questDone[1]=false;state.active=0;state.party.forEach(c=>c.hp=c.max);startBattle('trainer')")
    assert p.evaluate("battle.name")=='Scout Lyra' and p.evaluate('battle.queue.length')==2
    p.evaluate('battle.wild.hp=1;attack()'); assert p.evaluate('battle!==null && battle.slot')==1
    p.evaluate('battle.wild.hp=1;attack()')
    assert p.evaluate('state.trainers[1] && state.questDone[1]')
    p.evaluate("startBattle('warden');battle.wild.hp=1;attack()")
    assert p.evaluate('[state.crests,state.hab]')==[1,2]
    for h in [2,3]:
        p.evaluate('(h)=>{battle=null;state.hab=h;state.questWins[h]=2;state.trainers[h]=false;state.questDone[h]=false;state.active=0;state.party.forEach(c=>c.hp=c.max);startBattle(\'trainer\')}',h)
        p.evaluate('battle.wild.hp=1;attack();battle.wild.hp=1;attack()')
        assert p.evaluate('(h)=>state.trainers[h]&&state.questDone[h]',h)
        p.evaluate("startBattle('warden');battle.wild.hp=1;attack()")
    assert p.evaluate('state.crests')==3 and p.locator('#ov').is_visible()
    events=p.evaluate('window.__events')
    assert any(e.get('event')=='trainer-triad' for e in events), events
    assert any(e.get('event')=='atlas-complete' for e in events), events
    meta=p.evaluate('JSON.parse(localStorage.getItem(META_KEY))')
    assert meta['clears']>=1 and meta['best']>0 and meta['trainerWins']>=3 and meta['codexMastered'] is True
    save=p.evaluate('JSON.parse(localStorage.getItem(SAVE_KEY))')
    assert save['crests']==3 and all(save['trainers'][str(h)] for h in [1,2,3]) and all(save['questDone'][str(h)] for h in [1,2,3])
    assert not errs, errs
    b.close()
print(json.dumps({'species':15,'party':4,'reserve':'pass','switching':'pass','techniques':['Scorch','Snare','Mend','Static','Guard'],'trainers':3,'habitatQuests':3,'wardens':3,'autosave':'pass','meta':'pass','mobileOverflow':'pass'}))
