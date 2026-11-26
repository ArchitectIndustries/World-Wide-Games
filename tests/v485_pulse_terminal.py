"""Pulse Maze terminal collision ordering, actual Chromium game tick, controlled boards.
No production test hooks, no natural full campaign or origin/PWA assertion.
"""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]); out=Path(sys.argv[2]); checks=[]; t=time.monotonic()
h=(root/'games/pulse-maze/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
h=h.replace('</head>', '''<script>const store={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)}});window.events=[];window.postMessage=e=>events.push(e);window.requestAnimationFrame=()=>1;</script></head>''',1)
def ck(name,value,detail=None):
 checks.append({'name':name,'pass':bool(value),'detail':None if value else detail})
setup='''({stageNo,where,life,lastItem,powered})=>{build(stageNo,false);stageEntryScore=100;score=100;meta={unlocked:stageNo,best:100,clears:0};events.length=0;overlayOpen=false;$('#ov').classList.remove('show');player={x:2,y:1};dir={x:1,y:0};queued={x:1,y:0};lives=life;pellets=new Set(lastItem==='shard'?['3,1']:[]);powers=new Set();fruitSpawned=true;bonusClaimed=lastItem==='shard';fruit=bonusClaimed?null:{x:3,y:1};powerTicks=powered?10:0;hunters=where==='none'?[]:[{x:where==='before'?3:4,y:1,sx:19,sy:19,type:0,last:{x:-1,y:0}}];tick();}'''
state='''()=>({stage,score,lives,playing,runEnded,stageAwarded,unlocked:meta.unlocked,clears:meta.clears,heading:$('#ot').textContent,button:$('#next').textContent,hudLives:$('#lives').textContent,events:events.map(e=>({event:e.event,score:e.score??null})),stored:JSON.parse(store[META]||'{}')})'''
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,he,touch in [(1280,800,False),(390,844,True),(568,320,True)]:
  ctx=b.new_context(viewport={'width':w,'height':he},is_mobile=touch,has_touch=touch); p=ctx.new_page(); errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(h);p.locator('#next').click();tag=f'{w}x{he}'
  for stageNo in (1,2,3):
   for where in ('before','after'):
    for lastItem in ('shard','cache'):
     label=f'{tag} maze {stageNo} {where} {lastItem}';p.evaluate(setup,dict(stageNo=stageNo,where=where,life=1,lastItem=lastItem,powered=False));s=p.evaluate(state);points=110 if lastItem=='shard' else 600
     ck(label+' loss is only terminal event',s['events']==[{'event':'run-ended','score':None}],s)
     ck(label+' no award or unlock',not s['stageAwarded'] and s['unlocked']==stageNo and s['clears']==0 and s['score']==points and s['stored'].get('unlocked')==stageNo,s)
     ck(label+' loss screen and zero lives',s['heading']=='Signal lost' and s['button']=='Retry' and s['lives']==0 and s['hudLives']=='0' and s['runEnded'] and not s['playing'],s)
     p.evaluate('tick();tick()');ck(label+' idempotent terminal tick',p.evaluate(state)==s)
     p.locator('#next').click();r=p.evaluate(state);ck(label+' retry same maze and rollback',r['stage']==stageNo and r['score']==100 and r['lives']==3 and r['playing'] and not r['runEnded'],r)
   for where,life,powered in [('none',1,False),('after',2,False),('before',1,True)]:
    label=f'{tag} maze {stageNo} survival {where} {life} {powered}';p.evaluate(setup,dict(stageNo=stageNo,where=where,life=life,lastItem='shard',powered=powered));s=p.evaluate(state);expected=['maze-complete']+(['campaign-complete'] if stageNo==3 else [])
    ck(label+' earned clear',s['stageAwarded'] and not s['playing'] and [e['event'] for e in s['events']]==expected and s['lives']>0,s)
    ck(label+' ranking and unlock',s['unlocked']==min(3,stageNo+1) and s['clears']==int(stageNo==3) and all((e['score'] is not None)==(e['event']=='campaign-complete') for e in s['events']),s)
    p.evaluate('tick();tick()');ck(label+' exact once',p.evaluate(state)==s)
  ck(tag+' no runtime errors',not errors,errors);ctx.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total'],r['seconds']);sys.exit(0 if r['passed']==r['total'] else 1)
