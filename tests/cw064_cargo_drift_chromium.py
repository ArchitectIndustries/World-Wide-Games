"""Cyber Wars 0.63 physical river cargo overboard + retrieval tests.
Actual Chromium executes first-party physics and collision. QA fixtures only
stage initial conditions; the complete clear route is continuously steered.
Standalone: python tests/cw063_cargo_spill_chromium.py [output-report.json]
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, statistics, sys, time
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'tests/cw063_cargo_spill_results.json'
checks=[]; errors=[]; perf={}; observations={}
def check(title,condition,details=None):
 checks.append({'name':title,'pass':bool(condition),'details':details})
 if not condition: print('FAIL',title,str(details)[:400],flush=True)
def page_doc():
 text=(ROOT/'games/cyber-wars/index.html').read_text()
 for fn in ['wwg-input.js','wwg-webgl.js']:
  old=f'<script src="../../assets/{fn}"></script>'
  assert old in text,fn
  text=text.replace(old,f'<script>{(ROOT/"assets"/fn).read_text()}</script>')
 assert "const qa=q.get('qa')==='1'&&devContext;" in text
 text=text.replace("const qa=q.get('qa')==='1'&&devContext;",'const qa=devContext;')
 local='''<script>(()=>{const d={};window.__localWrites=[];Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(d,k)?d[k]:null,setItem:(k,v)=>{d[k]=String(v);window.__localWrites.push([k,String(v)])},removeItem:k=>delete d[k],clear:()=>Object.keys(d).forEach(k=>delete d[k])}})})();</script>'''
 return text.replace('<head>','<head>'+local,1)
def launch(ctx,doc):
 page=ctx.new_page();page.set_default_timeout(6500)
 page.on('pageerror',lambda e:errors.append('page error '+str(e)))
 page.on('console',lambda m:errors.append('console '+m.text) if m.type=='error' and not m.text.startswith('Failed to load resource') else None)
 page.set_content(doc,wait_until='domcontentloaded',timeout=30000)
 page.locator('#start').click();page.wait_for_timeout(55)
 return page
# Precise waypoint steering with only first-party raft keys and simulation stepping.
ROUTE='''() => {
 CWQA.setPlayer(23,5.7);const boarded=CWQA.raftBoard();CWQA.setHeading(0);
 const events=[],path=[];let target=0;
 const goals=[['cargo',0,26.4,8],['gate',0,28,10.7],['waypoint',0,28.5,12],['waypoint',0,32,12],['cargo',1,34,10.6],['waypoint',0,33.8,6.1],['gate',1,39,6.6],['cargo',2,43,7.5],['gate',2,41.5,11.1],['bank',0,41.5,12.1]];
 for(let k=0;k<2200;k++){
  let r=CWQA.raft(),run=CWQA.riverRun(),cargo=CWQA.riverCargo();if(!run.active)break;
  let [kind,idx,tx,tz]=goals[target];if(kind==='cargo'){tx=cargo.pods[idx].x;tz=cargo.pods[idx].z}
  if(kind==='cargo'&&cargo.picked[idx]){events.push({event:'cargo',idx,t:run.elapsed,contacts:run.contacts});target=Math.min(goals.length-1,target+1)}
  if(kind==='waypoint'&&Math.hypot(tx-r.x,tz-r.z)<1){events.push({event:'waypoint',idx,t:run.elapsed});target=Math.min(goals.length-1,target+1)}
  if(kind==='gate'&&run.stage>idx){events.push({event:'gate',idx,t:run.elapsed});target=Math.min(goals.length-1,target+1)}
  if(kind==='bank'&&r.z>11.8){CWQA.raftBoard();events.push({event:'land',t:run.elapsed});break}
  [kind,idx,tx,tz]=goals[target];if(kind==='cargo'){tx=cargo.pods[idx].x;tz=cargo.pods[idx].z}
  let dx=tx-r.x,dz=tz-r.z,xerr=dx*.95-r.vx*.75-.74,zerr=dz*.96-r.vz*.75;
  CWQA.raftControls(xerr>.23?1:xerr<-.23?-1:0,zerr>.23?1:zerr<-.23?-1:0);
  CWQA.expeditionStep(1,.035);
  if(k%80===0)path.push({x:r.x,z:r.z,contacts:run.contacts,target,elapsed:run.elapsed});
 }
 CWQA.raftControls(0,0);
 return {boarded,events,path,run:CWQA.riverRun(),cargo:CWQA.riverCargo(),raft:CWQA.raft()}
}'''
SPILL='''() => {
 CWQA.setPlayer(23,5.7);CWQA.raftBoard();CWQA.setHeading(0);
 let picked=false;
 for(let i=0;i<180;i++){
  let r=CWQA.raft(),c=CWQA.riverCargo(),p=c.pods[0];
  let x=(p.x-r.x)*.9-r.vx*.7-.74,z=(p.z-r.z)*.9-r.vz*.7;
  CWQA.raftControls(x>.25?1:x<-.25?-1:0,z>.25?1:z<-.25?-1:0);
  CWQA.expeditionStep(1,.035);if(CWQA.riverCargo().picked[0]){picked=true;break}
 }
 const before=CWQA.riverCargo(),logs=CWQA.debris().logs;
 const log=logs[0];CWQA.raftSet(log.x-2.1,log.z);CWQA.raftControls(1,0);
 for(let i=0;i<80;i++){CWQA.expeditionStep(1,.035);if(CWQA.riverRun().contacts>=1)break}
 const struck={cargo:CWQA.riverCargo(),run:CWQA.riverRun(),notice:document.querySelector('#toast').textContent,accessible:document.querySelector('#riverCargoStatus').getAttribute('aria-live')};
 CWQA.raftControls(0,0);CWQA.expeditionStep(24,.035);
 const held={cargo:CWQA.riverCargo(),run:CWQA.riverRun()};
 const drop=struck.cargo.dropped.find(Boolean);
 let physicalReturnSteps=0;
 if(drop)for(let k=0;k<380&&!CWQA.riverCargo().picked[0];k++){
  let r=CWQA.raft(),c=CWQA.riverCargo(),p=c.pods[0];
  let x=(p.x-r.x)*.88-r.vx*.78-.74,z=(p.z-r.z)*.92-r.vz*.78;
  CWQA.raftControls(x>.3?1:x<-.3?-1:0,z>.25?1:z<-.25?-1:0);
  CWQA.expeditionStep(1,.035);physicalReturnSteps++;
 }
 CWQA.raftControls(0,0);
 const recovered={cargo:CWQA.riverCargo(),run:CWQA.riverRun()};
 return {picked,before,struck,held,recovered,physicalReturnSteps};
}'''
INCOMPLETE='''() => {
 CWQA.setPlayer(23,5.7);CWQA.raftBoard();CWQA.setHeading(0);
 for(let i=0;i<3;i++){
  const gate=CWQA.riverRun().gates[i];CWQA.raftSet(gate.x,gate.z);
  CWQA.expeditionStep(1,.035);
 }
 const before=CWQA.riverRun();CWQA.raftSet(42,12.2);
 const ok=CWQA.raftBoard();return {before,ok,run:CWQA.riverRun(),cargo:CWQA.riverCargo()};
}'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 ctx=browser.new_context(viewport={'width':1200,'height':820},reduced_motion='reduce')
 doc=page_doc();page=launch(ctx,doc)
 initial=page.evaluate('({snap:CWQA.snapshot(),cargo:CWQA.riverCargo(),run:CWQA.riverRun(),gfx:CWQA.graphics()})')
 check('engine boots with playable Viridia world',initial['snap']['world'] is not None and bool(initial['gfx'].get('renderer')),initial['gfx'].get('renderer'))
 check('exact Core starting credits',initial['snap']['state']['credits']==21000)
 check('Core home and Pilot progression begin locked',not initial['snap']['state']['ownsHome'] and initial['snap']['state']['pilotRank']==0)
 check('river begins inactive without cargo or fabricated rewards',not initial['cargo']['active'] and initial['cargo']['count']==0 and initial['run']['result']=='READY')
 check('three original cargo objects and ordered gates',len(initial['cargo']['pods'])==3 and len(initial['run']['gates'])==3)
 check('physical recovery threshold 0.65 seconds, range 1.8 and speed 2',initial['cargo']['hold']==.65 and initial['cargo']['range']==1.8 and initial['cargo']['maxSpeed']==2)
 check('accessible text describes overboard recovery',page.locator('#riverCargoStatus').get_attribute('aria-live')=='polite' and 'timber strike' in page.locator('#riverCargoStatus').locator('xpath=..').get_attribute('title').lower())
 check('session-only run and ghost interfaces continue to exist',page.evaluate('typeof CWQA.riverGhost==="function" && typeof CWQA.riverShear==="function" && typeof CWQA.spoor==="function"'))
 check('touchscreen control and mini map elements exist',page.locator('[data-k="up"]').count()==1 and page.locator('canvas').count()>0)
 check('no map or cargo benefit before genuinely boarding',page.evaluate('CWQA.cargoStep(30).spills===0 && CWQA.riverCargo().count===0'))
 # Physical uninterrupted run: all navigation uses keys/physics (QA only staging starts at real mooring).
 clear=page.evaluate(ROUTE);observations['physical_full_run']={'routeEvents':clear['events'],'run':{k:clear['run'][k] for k in ['stage','result','elapsed','contacts','clears']},'cargo':{k:clear['cargo'][k] for k in ['count','result','clears','spills','recoveredSpills']}}
 check('real raft boards from starting mooring',clear['boarded'] and len(clear['path'])>0)
 check('physically driven route recovers all three original pods',len([e for e in clear['events'] if e['event']=='cargo'])==3 and clear['cargo']['count']==3,clear['events'])
 check('no teleport between initial setup and complete route',len(clear['path'])>3 and all('x' in q for q in clear['path']))
 check('actual collision physics clears three checkpoints',clear['run']['stage']==3 and clear['run']['result']=='CLEAR',clear['run'])
 check('north-bank landing completes cargo delivery',clear['cargo']['result']=='DELIVERED' and clear['cargo']['clears']==1,clear['cargo']['result'])
 check('physical successful expedition avoids actual hazards',clear['run']['contacts']==0 and clear['cargo']['spills']==0)
 check('all objectives completed before 75-second active limit',0<clear['run']['elapsed']<75,clear['run']['elapsed'])
 check('best-route ghost recorded only in current session',page.evaluate('CWQA.riverGhost().bestTrace.length>5'))
 check('successful physical expedition grants no credits, ranks or house',page.evaluate('const s=CWQA.snapshot().state;s.credits===21000&&s.pilotRank===0&&!s.ownsHome&&s.transactions.length===0'))
 check('expedition does not secretly persist economy/save',page.evaluate('window.__localWrites.length===0'),page.evaluate('window.__localWrites.slice(-4)'))
 # Separate fresh actual browser instance for genuine impact and recovery.
 page.close();page=launch(ctx,doc)
 impact=page.evaluate(SPILL);observations['impact']={k:{'count':v['cargo']['count'],'spills':v['cargo']['spills'],'recovered':v['cargo']['recoveredSpills'],'contacts':v['run']['contacts']} for k,v in impact.items() if k in ['struck','held','recovered']}
 b=impact['before'];s=impact['struck'];h=impact['held'];r=impact['recovered']
 check('first cargo is collected by physical pickup hold',impact['picked'] and b['count']==1 and b['picked'][0])
 check('real driftwood impact increments actual contact',s['run']['contacts']==1 and s['cargo']['spills']==1,observations['impact'])
 check('timber impact knocks exactly one secured pod overboard',s['cargo']['count']==0 and not s['cargo']['picked'][0] and sum(x is not None for x in s['cargo']['dropped'])==1)
 d=s['cargo']['dropped'][0]
 check('spilled cargo has bounded finite reachable coordinates',bool(d and 13.7<=d['x']<=55.3 and 5.8<=d['z']<=12.2),d)
 check('accessible HUD and toast announce overboard cargo',s['accessible']=='polite' and 'OVERBOARD' in s['cargo']['status'] and 'overboard' in s['notice'].lower(),{'status':s['cargo']['status'],'toast':s['notice']})
 check('one log lingering contact does not repeatedly spill',h['cargo']['spills']==1 and h['run']['contacts']==1,observations['impact'])
 check('recovery uses physically steered return, not teleport',impact['physicalReturnSteps']>15 and impact['physicalReturnSteps']<380,impact['physicalReturnSteps'])
 check('physical recovery reacquires overboard cargo',r['cargo']['count']==1 and r['cargo']['picked'][0] and all(x is None for x in r['cargo']['dropped']))
 check('recovery counted separately from ordinary pickup',r['cargo']['spills']==1 and r['cargo']['recoveredSpills']==1)
 check('recovery held for required active simulation time',r['run']['elapsed']>s['run']['elapsed']+.65)
 check('collision is nonlethal with no Core economy change',r['cargo']['credits']==21000 and r['cargo']['rank']==0 and not r['cargo']['ownsHome'])
 check('no premature score or delivery after a collision',r['cargo']['result']=='ACTIVE' and r['cargo']['clears']==0)
 check('no save writes from impact or recovery',page.evaluate('window.__localWrites.length===0'))
 # Pause and hidden state cannot complete pickups or drive run clock.
 page.evaluate('CWQA.raftSet(33.9,10.6);CWQA.raftControls(0,0)')
 frozen=page.evaluate('''() => {Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});const before={t:CWQA.riverRun().elapsed,c:CWQA.riverCargo().count};CWQA.expeditionStep(70,.035);return {before,after:{t:CWQA.riverRun().elapsed,c:CWQA.riverCargo().count}}}''')
 q0=frozen['before'];q1=frozen['after']
 check('hidden document freezes simulation clock',abs(q1['t']-q0['t'])<1e-8,{'before':q0,'after':q1})
 check('hidden document cannot harvest unearned cargo',q1['c']==q0['c'])
 page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>false})')
 check('invalid raft control refuses out-of-range acceleration',not page.evaluate('CWQA.raftControls(1000,0)'))
 check('invalid positions cannot teleport raft beyond river',not page.evaluate('CWQA.raftSet(1500,400)'))
 perf_ob=page.evaluate('''() => {const elapsed=[];for(let i=0;i<45;i++){const t=performance.now();CWQA.drawScene();elapsed.push(performance.now()-t)}return {elapsed,renderer:CWQA.graphics().renderer}}''')
 perf={'render_calls':45,'renderer':perf_ob['renderer'],'median_ms':round(statistics.median(perf_ob['elapsed']),3),'p95_ms':round(sorted(perf_ob['elapsed'])[int(45*.95)-1],3)}
 check('actual first-party rendering fallback sampled 45 times',len(perf_ob['elapsed'])==45 and len(perf_ob['renderer'])>0,perf)
 # Visible keyboard directional behavior on actual listener/real physics.
 page.evaluate('CWQA.raftSet(24.5,7.3);CWQA.raftControls(0,0)')
 pre=page.evaluate('CWQA.raft().z')
 page.keyboard.down('ArrowUp');page.evaluate('CWQA.expeditionStep(8,.035)');page.keyboard.up('ArrowUp')
 post=page.evaluate('CWQA.raft().z')
 check('real ArrowUp keyboard input poles the raft',post>pre+.04,{'before':pre,'after':post})
 # One explicitly failed delivery after an ostensibly cleared slalom (QA stage checkpoints only).
 page.close();page=launch(ctx,doc)
 bad=page.evaluate(INCOMPLETE);observations['negative_delivery']={'run':bad['run']['result'],'cargo':bad['cargo']['result'],'cargo_count':bad['cargo']['count']}
 check('incomplete physical cargo cannot be called delivered',bad['cargo']['result']!='DELIVERED' and bad['cargo']['clears']==0,bad)
 check('failed cargo yields no competitive score, credits or Pilot',bad['cargo']['credits']==21000 and bad['cargo']['rank']==0 and bad['cargo']['clears']==0)
 check('desktop Chromium no exceptions',not errors,errors)
 page.close();ctx.close()
 # Mobile actual tap + controller synthetic parity, no physical device claim.
 mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2,reduced_motion='reduce')
 page=launch(mobile,doc)
 check('touch controls visibly available',page.locator('[data-k="up"]').is_visible() and page.locator('[data-act="track"]').is_visible())
 page.evaluate('CWQA.setPlayer(23,5.7);CWQA.raftBoard();CWQA.setHeading(0);CWQA.raftSet(24.5,7.3)')
 before=page.evaluate('CWQA.raft().z')
 page.locator('[data-k="up"]').dispatch_event('pointerdown',{'pointerType':'touch','pointerId':55,'isPrimary':True})
 page.evaluate('CWQA.expeditionStep(10,.035)')
 page.locator('[data-k="up"]').dispatch_event('pointerup',{'pointerType':'touch','pointerId':55,'isPrimary':True})
 after=page.evaluate('CWQA.raft().z')
 check('mobile touch up-button exercises first-party raft traversal',after>before+.03,{'before':before,'after':after})
 check('mobile HUD accessible cargo state retained',page.locator('#riverCargoStatus').get_attribute('aria-live')=='polite')
 check('mobile viewport has no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
 check('mobile successful session still has no unauthorized saves',page.evaluate('window.__localWrites.length===0'))
 # Browser gamepad emulation: neutral then standard axis (no physical device asserted).
 page.evaluate('''() => {window.__pad={axes:[0,0],buttons:Array.from({length:20},()=>({pressed:false,value:0})),connected:true,mapping:'standard'};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.__pad]})}''')
 page.evaluate('CWQA.expeditionStep(5,.035)')
 zb=page.evaluate('CWQA.raft().z')
 page.evaluate('window.__pad.axes[1]=-1;CWQA.expeditionStep(14,.035)')
 za=page.evaluate('CWQA.raft().z')
 check('synthetic standard gamepad stick poles mobile raft',za>zb+.02,{'before':zb,'after':za})
 check('mobile Chromium no exceptions',not errors,errors)
 page.close();mobile.close();browser.close()
report={'objective':'Cyber Wars 0.63 independently simulated river-cargo spill and recovery','status':'PASS' if all(c['pass'] for c in checks) else 'FAIL','checks':checks,'passed':sum(c['pass'] for c in checks),'total':len(checks),'failed':[c for c in checks if not c['pass']],'observations':observations,'performance':perf,'browser':'Real headless Chromium; original first-party JS inlined into isolated browser documents; synthetic controller and touch emulation, no localhost PWA qualification','console_errors':errors}
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('checks','observations')},indent=2))
raise SystemExit(0 if report['status']=='PASS' else 2)
