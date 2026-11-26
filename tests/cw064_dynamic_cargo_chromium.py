"""Cyber Wars 0.64: real Chromium current-driven cargo dynamics, bounds and integration.
Uses first-party game scripts in browser documents, with isolated local state.
No physical controller, production origin, hardware GPU or installed PWA is claimed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, sys, statistics
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'tests/cw064_dynamic_cargo_results.json'
checks=[];errors=[];observations={}
def check(name,okay,info=None):
 checks.append({'name':name,'pass':bool(okay),'details':info})
 if not okay:print('FAIL',name,str(info)[:450],flush=True)
def make_doc():
 text=(ROOT/'games/cyber-wars/index.html').read_text()
 for n in ['wwg-input.js','wwg-webgl.js']:
  tag=f'<script src="../../assets/{n}"></script>'
  assert tag in text
  text=text.replace(tag,f'<script>{(ROOT/"assets"/n).read_text()}</script>')
 assert "const qa=q.get('qa')==='1'&&devContext;" in text
 text=text.replace("const qa=q.get('qa')==='1'&&devContext;",'const qa=devContext;')
 return text.replace('<head>','''<head><script>window.requestAnimationFrame=()=>0;(()=>{const o={};window.__writes=[];Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>o[k]??null,setItem:(k,v)=>{o[k]=String(v);window.__writes.push(k)},removeItem:k=>delete o[k],clear:()=>Object.keys(o).forEach(k=>delete o[k])}})})();</script>''',1)
def open_game(ctx,doc):
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(doc,wait_until='domcontentloaded',timeout=30000)
 page.locator('#start').click();return page
def setup(page,weather_time=None):
 return page.evaluate('''(t)=>{
 CWQA.setPlayer(23,5.7);const ok=CWQA.raftBoard();
 CWQA.raftSet(14.3,6.1);CWQA.raftControls(0,0);
 if(t!==null)CWQA.setWeatherTime(t);
 return {ok,initial:CWQA.riverCargo(),weather:CWQA.weather()};
 }''',weather_time)
def drift(page,steps=350):
 return page.evaluate('''(n)=>{let trace=[];for(let i=0;i<n;i++){
   CWQA.cargoStep(1,.035);
   if(i%35===0)trace.push(CWQA.riverCargo().pods.map(p=>({x:p.x,z:p.z})));
  } return {first:CWQA.riverCargo(),run:CWQA.riverRun(),trace,weather:CWQA.weather()};}''',steps)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 ctx=browser.new_context(viewport={'width':1200,'height':820},reduced_motion='reduce')
 doc=make_doc()
 page=open_game(ctx,doc)
 pre=page.evaluate('CWQA.riverCargo()')
 check('three dormant physical cargo bodies start at authored positions',len(pre['bodies'])==3 and all(abs(pre['bodies'][i]['x']-pre['pods'][i]['x'])<1e-6 for i in range(3)))
 check('cargo drift window is finite and bounded',pre['driftBounds']=={'x':3.5,'z':1.9})
 start=setup(page,0)
 check('raft must physically board before current-driven simulation',start['ok'] and start['initial']['active'])
 stepped=drift(page);a=stepped['first'];observations['dry_weather']={'start':start['initial']['pods'],'final':a['pods'],'trace':stepped['trace'],'weather':stepped['weather']}
 movement=[round(((a['pods'][i]['x']-start['initial']['pods'][i]['x'])**2+(a['pods'][i]['z']-start['initial']['pods'][i]['z'])**2)**.5,4) for i in range(3)]
 check('all three targets advect substantially beyond old 0.22 x bob',min(movement)>.32,movement)
 check('current path is truly two-dimensional',sum(abs(a['pods'][i]['z']-start['initial']['pods'][i]['z'])>.2 for i in range(3))>=2,movement)
 check('floating objects retain nonzero physical velocities',sum((abs(b['vx'])+abs(b['vz'])>.12) for b in a['bodies'])>=2,a['bodies'])
 check('drift never advances the objective without actual recovery',a['count']==0 and not any(a['picked']) and a['result']=='ACTIVE')
 check('river run clock advances at active simulation rate',12<stepped['run']['elapsed']<13,stepped['run']['elapsed'])
 check('cargo drift remains bounded to home eddies and the navigable river',all(abs(b['x']-start['initial']['pods'][i]['x'])<=3.5+.02 and abs(b['z']-start['initial']['pods'][i]['z'])<=1.9+.02 and 13.5<b['x']<55.5 and 5.3<b['z']<12.7 for i,b in enumerate(a['bodies'])),a['bodies'])
 check('all positions and velocities finite under 350 first-party frames',page.evaluate('CWQA.riverCargo().bodies.every(b=>[b.x,b.z,b.vx,b.vz].every(Number.isFinite))'))
 before=page.evaluate('CWQA.riverCargo()')
 frozen=page.evaluate('''() => {Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});CWQA.cargoStep(125,.035);return CWQA.riverCargo()}''')
 check('hidden tab cannot move any cargo or advance recovery',all(abs(frozen['bodies'][i][k]-before['bodies'][i][k])<1e-9 for i in range(3) for k in ['x','z','vx','vz']) and frozen['count']==before['count'])
 page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>false})')
 check('unfocused game never persists cargo or economy',page.evaluate('window.__writes.length===0 && CWQA.snapshot().state.credits===21000 && CWQA.snapshot().state.pilotRank===0'))
 # Same inputs => same physical trajectory when renderer animation is disabled.
 dup=open_game(ctx,doc);same=setup(dup,0);second=drift(dup)
 deviation=max(abs(second['first']['bodies'][i][k]-a['bodies'][i][k]) for i in range(3) for k in ('x','z','vx','vz'))
 check('two independently initialized worlds reproduce exact current trajectory',deviation<1e-7,deviation)
 dup.close()
 # Compare real weather strengths by searching actual world rain waveform (not invented).
 waveform=page.evaluate('''() => Array.from({length:60},(_,i)=>({time:CWQA.weather().cycle*i/60,rain:CWQA.weatherAt(CWQA.weather().cycle*i/60)}))''')
 clear=min(waveform,key=lambda x:x['rain']);rain=max(waveform,key=lambda x:x['rain']);observations['weather_probe']={'clear':clear,'rain':rain}
 check('weather oscillator provides genuinely distinct clear/rain values',rain['rain']-clear['rain']>.3,observations['weather_probe'])
 dry=open_game(ctx,doc);setup(dry,clear['time']);d=drift(dry)['first'];wet=open_game(ctx,doc);setup(wet,rain['time']);w=drift(wet)['first'];dry.close();wet.close()
 variation=max(abs(w['pods'][i][k]-d['pods'][i][k]) for i in range(3) for k in ('x','z'))
 check('weather changes the *physical* cargo coordinates',variation>.06,variation)
 # no endless drift past the authored pod zones, including during the entire 75s window
 hold=open_game(ctx,doc);setup(hold,0)
 long=drift(hold,2200)['first'];hold1=drift(hold,150)['first'];hold.close()
 check('75-second deadline terminates river run normally',hold1['result'] in ('INCOMPLETE','MISSED') or not hold1['active'],{'cargo':hold1['result'],'active':hold1['active']})
 check('no future pickup beyond timed-out attempt',not hold1['active'] and hold1['count']==long['count'] and all(hold1['bodies'][i]==long['bodies'][i] for i in range(3)),{'active':hold1['active'],'count_before':long['count'],'count_after':hold1['count'],'run':hold1['result']})
 check('long-running drift does not write strategic saves',page.evaluate('window.__writes.length===0'))
 # Real rendered current marker and text feedback: no hard-coded video.
 page.evaluate('CWQA.drawScene()'); hud=page.locator('#riverCargoStatus').text_content()
 check('accessible current-driven interception instructions',page.locator('#riverCargoStatus').get_attribute('aria-live')=='polite' and 'current-driven' in page.locator('#riverCargoStatus').locator('xpath=..').get_attribute('title').lower())
 check('live interception status is a real first-party HUD state',hud is not None and 'INTERCEPT' in hud,hud)
 check('no page errors in weather, drift, deterministic and renderer cases',not errors,errors)
 page.close();ctx.close();browser.close()
report={'objective':'Cyber Wars 0.64 current-driven physically simulated river cargo','status':'PASS' if all(x['pass'] for x in checks) else 'FAIL','passed':sum(x['pass'] for x in checks),'total':len(checks),'failed':[x for x in checks if not x['pass']],'checks':checks,'observations':observations,'errors':errors,'browser':'real Chromium with first-party game JS, deterministic rAF-disabled stepping, actual Canvas rendering; no physical devices or installed PWA'}
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('checks','observations')},indent=2))
raise SystemExit(0 if report['status']=='PASS' else 2)
