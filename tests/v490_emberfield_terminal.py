"""Terminal-state fixtures in isolated Chromium, never exported by the game."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);t=time.monotonic();checks=[]
h=(root/'games/emberfield-survival/index.html').read_text()
shim='''<script>window.events=[];window.store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)}});window.addEventListener('message',e=>{if(e.data?.type==='wwg:game-event')events.push(e.data)});requestAnimationFrame=()=>0;</script>'''
h=h.replace('<head>','<head>'+shim,1).replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
mark='reset();requestAnimationFrame(loop);';assert h.count(mark)==1
h=h.replace(mark,'''window.qa={seed:(kind, lethal=true)=>{reset();events.length=0;st.spawn=st.fire=999;st.phase=2;spawnBoss(true);st.boss.x=800;st.boss.y=350;st.boss.hp=1;st.boss.speed=0;st.boss.shot=99;p.hp=lethal?1:60;p.xp=p.next-1;gems=[{x:p.x,y:p.y}];pickups=[{x:p.x,y:p.y,life:10}];bullets=[{x:800,y:350,vx:0,vy:0,dmg:18,life:1}];if(kind==='shot')enemyShots=[{x:p.x,y:p.y,vx:0,vy:0,r:5,life:1}];if(kind==='contact')enemies=[{x:p.x,y:p.y,r:10,speed:0,hit:0,shot:99,hp:20,type:'drifter'}];if(kind==='boss'){st.boss.x=p.x;st.boss.y=p.y;bullets[0].x=p.x;bullets[0].y=p.y}if(kind==='nonfinal'){st.phase=0;st.finalBoss=false}if(kind==='nohit')bullets=[];sync()},step:()=>update(1/60),state:()=>({hp:p.hp,level:p.level,xp:p.xp,score:st.score,kills:st.kills,over:st.over,won:st.won,paused:st.paused,boss:!!st.boss,phase:st.phase,clears:save.clears,best:save.best,core:st.core,gems:gems.length,heal:pickups.length}),choose};'''+mark)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,ht in [(1280,800),(390,844),(640,360)]:
  page=b.new_page(viewport={'width':w,'height':ht},is_mobile=w<700,has_touch=w<700);errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(h)
  def ev(s):return page.evaluate(s)
  def ck(n,v):checks.append({'viewport':[w,ht],'name':n,'pass':bool(v)})
  def seed(kind,lethal=True):ev(f'qa.seed({json.dumps(kind)},{str(lethal).lower()})');page.wait_for_timeout(10);ev('events.length=0')
  for kind in ['shot','contact','boss']:
   seed(kind);before=ev('qa.state()');ev('qa.step()');page.wait_for_timeout(10);a=ev('qa.state()');events=ev('events')
   ck(kind+' loss only',a['over'] and not a['won'] and [e['event'] for e in events]==['run-complete']);ck(kind+' no postmortem boss reward',a['score']==0 and a['kills']==0 and a['boss']);ck(kind+' no postmortem healing or XP',a['hp']<=0 and a['level']==1 and a['gems']==1 and a['heal']==1);ck(kind+' no competing modal',not a['paused'] and not page.locator('#upgrade').is_visible() and page.locator('#overlay').is_visible());ck(kind+' HUD health is zero',page.locator('#hp').inner_text().startswith('0/'));ck(kind+' focus result',ev('document.activeElement.id==="restart"'));ck(kind+' no saved victory',a['clears']==before['clears'] and a['best']==before['best']);ev('qa.choose("vigor");qa.step()');ck(kind+' stale upgrade and later tick do not mutate terminal',ev('qa.state()')==a)
  seed('none',False);before=ev('qa.state()');ev('qa.step()');page.wait_for_timeout(10);a=ev('qa.state()');wins=[e for e in ev('events') if e['event']=='campaign-complete'];ck('legitimate bullet kill wins exactly once',a['won'] and a['over'] and len(wins)==1);ck('score and persisted best agree',len(wins)==1 and wins[0]['score']==a['score']==a['best']==3804);ck('no postwin pickups or modal',a['level']==1 and a['hp']==60 and a['gems']==9 and a['heal']==1 and not a['paused'] and not page.locator('#upgrade').is_visible());ck('win focus',ev('document.activeElement.id==="restart"'));ck('one saved clear',a['clears']==before['clears']+1);ev('qa.choose("vigor");qa.step()');ck('win state frozen',ev('qa.state()')==a)
  page.locator('#restart').click();ck('native replay resets run',ev('!qa.state().over&&qa.state().hp===100&&qa.state().score===0'))
  seed('nonfinal',False);ev('qa.step()');page.wait_for_timeout(10);a=ev('qa.state()');ck('nonfinal boss advances and allows upgrade',a['phase']==1 and not a['over'] and a['level']==2 and a['paused'] and page.locator('#upgrade').is_visible());ck('nonfinal reward and healing preserved',a['kills']==1 and a['hp']==88);page.locator('[data-up=vigor]').click();ck('legitimate upgrade works',not ev('qa.state().paused') and ev('qa.state().hp')==112)
  seed('nohit',False);ev('qa.step()');ck('ordinary XP and heal preserved',ev('qa.state().level===2&&qa.state().hp===88&&!qa.state().over'));ck('no runtime errors',not errs);page.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-t,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
