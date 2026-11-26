'''Bastion Bloom terminal tick: actual game engine with controlled browser RAF and enemy fixtures.'''
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,json,time
root=Path(sys.argv[1]);out=Path(sys.argv[2]);start=time.monotonic();checks=[]
s=(root/'games/bastion-bloom/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>','<script>'+(root/'assets/wwg-input.js').read_text()+'</script>')
s=s.replace('<head>','<head><script>window.events=[];addEventListener("message",e=>{if(e.data?.type==="wwg:game-event")events.push(e.data)});requestAnimationFrame=()=>0;</script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,h in [(1280,800),(390,844),(640,360)]:
  p=b.new_page(viewport={'width':w,'height':h},has_touch=w<700,is_mobile=w<700);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(s)
  def ev(js):return p.evaluate(js)
  def ck(name,condition):checks.append({'viewport':[w,h],'name':name,'pass':bool(condition)})
  def fixture(kind,life,extra,stage):
   ev(f'''reset();events=[];wave={stage};startWave();waveQueue=[];lives={life};spawnEnemy('{kind}');enemies[0].p=path.length-2;enemies[0].speed=5000;{ "spawnEnemy('seedling');enemies[1].p=path.findIndex(p=>Math.hypot(p[0]-nodes[0][0],p[1]-nodes[0][1])<100);enemies[1].hp=1;placeOrUpgrade(0);" if extra else "" }lt=performance.now()-34;loop(performance.now())''');p.wait_for_timeout(40)
  for kind,life,extra,stage in [('boss',1,True,10),('seedling',1,True,3),('boss',3,False,10)]:
   fixture(kind,life,extra,stage);label=f'{kind}/{life}/{stage}'
   ck(label+' zero lives (never negative)',ev('lives===0&&L.textContent==="0"'))
   ck(label+' defeat locked',ev('over&&!cleared&&!waveActive&&!RESULT.hidden'))
   ck(label+' no postmortem kills',ev('kills===0&&shots.length===0'))
   ck(label+' only unranked defeat',ev('events.length===1&&events[0].event==="garden-ended"&&!("score" in events[0])'))
   ck(label+' displayed and reported attempt agree',ev('events[0].meta.attemptValue===score&&Number(S.textContent)===score&&events[0].meta.lives===lives'))
   ck(label+' stable after subsequent frames',ev('(()=>{const before=JSON.stringify([score,sun,kills,lives,wave]);loop(lt+32);resolveWave();return before===JSON.stringify([score,sun,kills,lives,wave])})()'))
  fixture('seedling',2,True,3)
  ck('nonlethal leak continues',ev('!over&&lives===1&&kills===1&&wave===4'))
  ck('no terminal event for nonlethal',ev('events.length===0'))
  ev('reset();events=[];for(let i=0;i<10;i++){startWave();waveQueue=[];enemies=[];resolveWave()}');p.wait_for_timeout(40)
  ck('legitimate ten-wave clear',ev('over&&cleared&&wave===10&&lives===20'))
  ck('one ranked completion with consistent score',ev('events.length===1&&events[0].event==="campaign-complete"&&events[0].score===score&&score>0'))
  ck('no late reward on victory',ev('(()=>{let s=score;resolveWave();loop(lt+32);return s===score})()'))
  (p.locator('#waveBtn').tap() if w<700 else p.locator('#waveBtn').click());ck('native replay resets',ev('!over&&wave===1&&lives===20&&score===0&&RESULT.hidden'))
  p.keyboard.press('ArrowRight');ck('keyboard controls after replay',ev('selectedNode===1'));ck('no runtime errors',not errors);p.close()
 b.close()
r={'passed':sum(c['pass'] for c in checks),'total':len(checks),'seconds':round(time.monotonic()-start,3),'checks':checks};out.write_text(json.dumps(r,indent=2));print(r['passed'],r['total']);sys.exit(r['passed']!=r['total'])
