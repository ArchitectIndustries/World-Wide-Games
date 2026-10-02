from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/astral-menagerie/index.html').read_text()
for token in ['save-v3','meta-v3','V2_SAVE_KEY','habitat-study','habitat-scholar','trainer-rematch','mastery-triad','ascendant-warden','constellation-master','Starlight','Atlas Mastery Trials','Canopy Well','Lumen Pool','Cinder Lens']:
    assert token.lower() in SRC.lower(), token

def raw(preload=None):
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    seed=json.dumps(preload or {})
    pre=f"""<script>const __s={seed};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];const __pm=window.postMessage;window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d);try{{__pm.call(window,d,'*')}}catch{{}}}};</script>"""
    i=h.lower().find('<script')
    return h[:i]+pre+h[i:]

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':390,'height':844}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
    p.set_content(raw(),wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(100)
    assert not errs, errs
    assert p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    p.locator('[data-s="0"]').click()
    # Stable four-member party for deterministic campaign/mastery combat.
    p.evaluate("state.party=[creature(0,20),creature(1,20),creature(2,20),creature(4,20)];state.active=0;state.party.forEach(c=>{c.hp=c.max;c.skillCd=2});save();sync()")
    # Three authored habitat study nodes provide distinct rewards and one-time persistence.
    caps0=p.evaluate('state.caps')
    p.evaluate("state.hab=1;state.x=habitats[1].study.x;state.y=habitats[1].study.y;studyHabitat()")
    assert p.evaluate('state.attuned[1]') and p.evaluate('state.caps')==caps0+2
    xp0=p.evaluate('state.party[0].xp')
    p.evaluate("state.hab=2;state.x=habitats[2].study.x;state.y=habitats[2].study.y;studyHabitat()")
    assert p.evaluate('state.attuned[2]') and p.evaluate('state.party.every(c=>c.skillCd===0)') and p.evaluate('state.party[0].xp')>xp0
    max0=p.evaluate('state.party[0].max')
    p.evaluate("state.hab=3;state.x=habitats[3].study.x;state.y=habitats[3].study.y;studyHabitat()")
    assert p.evaluate('state.attuned[3]') and p.evaluate('state.party[0].max')==max0+2
    assert p.evaluate('meta.starlight')==3 and p.evaluate('meta.studies')==3
    events=p.evaluate('window.__events'); assert any(e.get('event')=='habitat-scholar' for e in events),events
    # Original authored Atlas loop still works: trainer gauntlet + Warden in all three habitats.
    for h in [1,2,3]:
        p.evaluate('(h)=>{battle=null;state.hab=h;state.questWins[h]=2;state.trainers[h]=false;state.questDone[h]=false;state.active=0;state.party.forEach(c=>c.hp=c.max);startBattle(\'trainer\')}',h)
        assert p.evaluate('battle.queue.length')==2
        for _ in range(2): p.evaluate('battle.wild.hp=1;attack()')
        assert p.evaluate('(h)=>state.trainers[h]&&state.questDone[h]',h)
        p.evaluate("startBattle('warden');battle.wild.hp=1;attack()")
    assert p.evaluate('state.crests')==3 and p.evaluate('meta.clears')>=1 and p.evaluate('trialsUnlocked()')
    p.locator('#next').click()
    # Constellation rematches are three-opponent gauntlets and reward persistent Starlight.
    for h in [1,2,3]:
        p.evaluate('(h)=>startMastery(h,\'rematch\')',h)
        assert p.evaluate('battle.kind')=='rematch' and p.evaluate('battle.queue.length')==3
        for _ in range(3): p.evaluate('battle.wild.hp=1;attack()')
        assert p.evaluate('(h)=>meta.rematches[h]>=1',h)
    assert p.evaluate('meta.starlight')==9
    events=p.evaluate('window.__events'); assert any(e.get('event')=='mastery-triad' for e in events),events
    # Each rematch unlocks an Ascendant Warden; all three complete constellation mastery.
    for h in [1,2,3]:
        p.evaluate('(h)=>startMastery(h,\'ascendant\')',h)
        assert p.evaluate('battle.kind')=='ascendant'
        p.evaluate('battle.wild.hp=1;attack()')
        assert p.evaluate('(h)=>meta.ascendants[h]>=1',h)
    assert p.evaluate('meta.starlight')==18 and p.evaluate('meta.trialsMastered') is True
    events=p.evaluate('window.__events')
    assert any(e.get('event')=='constellation-master' for e in events),events
    assert sum(1 for e in events if e.get('event')=='ascendant-warden')>=3
    p.evaluate('showTrials()')
    assert p.locator('[data-rematch]').count()==3 and p.locator('[data-asc]').count()==3
    saved=p.evaluate('JSON.parse(localStorage.getItem(SAVE_KEY))'); meta=p.evaluate('JSON.parse(localStorage.getItem(META_KEY))')
    assert all(saved['attuned'][str(h)] for h in [1,2,3])
    assert meta['starlight']==18 and all(meta['rematches'][str(h)]>=1 for h in [1,2,3]) and all(meta['ascendants'][str(h)]>=1 for h in [1,2,3])
    assert not errs,errs
    # v2 save/meta migrate into v3 without losing party/campaign progression.
    old_save={'hab':2,'crests':1,'caps':7,'party':[{'i':2,'lvl':8,'xp':3,'hp':40,'max':60,'skillCd':0}],'reserve':[],'codex':[0,1,2],'x':200,'y':220,'active':0,'questWins':{'1':2,'2':1,'3':0},'trainers':{'1':True,'2':False,'3':False},'questDone':{'1':True,'2':False,'3':False}}
    old_meta={'clears':1,'best':4321,'trainerWins':3,'codexMastered':True}
    preload={'wwg:astral-menagerie:save-v2':json.dumps(old_save),'wwg:astral-menagerie:meta-v2':json.dumps(old_meta)}
    p2=b.new_page(viewport={'width':900,'height':700}); migerrs=[]; p2.on('pageerror',lambda e:migerrs.append(str(e)))
    p2.set_content(raw(preload),wait_until='domcontentloaded',timeout=8000);p2.wait_for_timeout(80)
    assert not migerrs,migerrs
    assert p2.evaluate('[state.hab,state.crests,state.party[0].i,meta.clears,meta.best]')==[2,1,2,1,4321]
    assert p2.evaluate('JSON.stringify(state.attuned)')==json.dumps({'1':False,'2':False,'3':False},separators=(',',':'))
    p2.evaluate('save()')
    assert p2.evaluate("localStorage.getItem('wwg:astral-menagerie:save-v3')!==null && localStorage.getItem('wwg:astral-menagerie:meta-v3')!==null")
    p2.close(); b.close()
print(json.dumps({'species':15,'studyNodes':3,'trainerRematches':3,'ascendantWardens':3,'starlight':18,'v2Migration':'pass','autosave':'pass','mobileOverflow':'pass'}))
