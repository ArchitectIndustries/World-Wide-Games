"""Real Chromium, public turn controls and bounded board fixtures; not human play."""
import sys,json,statistics,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]);out=Path(sys.argv[2]);baseline='--baseline' in sys.argv
src=(root/'games/hexbound-tactics/index.html').read_text()
checks=[];details=[]
def ck(label,ok):checks.append({'label':label,'pass':bool(ok)})
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 for w,h in [(980,720),(390,844),(568,320)]:
  p=b.new_page(viewport={'width':w,'height':h},is_mobile=w<600,has_touch=w<600);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(src)
  r=p.evaluate('''()=>{setup();lanes=[{p:[],e:[]},{p:[],e:[]},{p:[clone(cards[4])],e:[]}];ecore=4;pcore=18;turn=3;Math.random=()=>0;const t=performance.now();let plan=typeof rivalPlan==='function'?rivalPlan():null;const ms=performance.now()-t;ai();let units=lanes.map(l=>l.e.map(u=>u.name));resolve();return {units,ecore,pcore,gameOver,plan:plan&&{visited:plan.visited,cost:plan.moves.reduce((n,m)=>n+m.card.cost,0)},ms}}''')
  details.append({'viewport':[w,h],'defense':r});ck(f'{w}: rival defends lethal third lane' if not baseline else f'{w}: old random rival misses lethal third lane',r['ecore']>0 and len(r['units'][2])>0 if not baseline else r['ecore']<=0 and not r['units'][2]);ck(f'{w}: no runtime exception',not errors)
  if baseline:p.close();continue
  ck(f'{w}: energy and bounded search',r['plan']['cost']<=2 and r['plan']['visited']<=4000)
  x=p.evaluate('''()=>{setup();lanes=[{p:[clone(cards[4])],e:[]},{p:[],e:[]},{p:[],e:[]}];pcore=3;ecore=18;const before=JSON.stringify(lanes);const a=rivalPlan(),d=rivalPlan();return {pure:before===JSON.stringify(lanes),repeat:JSON.stringify(a)===JSON.stringify(d),legal:a.moves.reduce((n,m)=>n+m.card.cost,0)<=2,chosen:a.moves.map(m=>m.lane)}}''');ck(f'{w}: pure deterministic search',x['pure'] and x['repeat']);ck(f'{w}: legal attack plan',x['legal'] and any(i!=0 for i in x['chosen']))
  x=p.evaluate('''()=>{setup();for(const l of lanes)l.e=[clone(cards[0],true),clone(cards[0],true),clone(cards[0],true)];let a=rivalPlan();return [a.moves.length,a.visited]}''');ck(f'{w}: all lanes full means no deployment',x==[0,1])
  x=p.evaluate('''()=>{setup();for(const l of lanes)l.e=[clone(cards[0],true),clone(cards[0],true)];let a=rivalPlan();let counts=[2,2,2];for(const m of a.moves)counts[m.lane]++;return counts.every(x=>x<=3)}''');ck(f'{w}: lane capacity',x)
  x=p.evaluate("""()=>{setup();turn=6;let a=rivalPlan();return {cost:a.moves.reduce((n,m)=>n+m.card.cost,0),visited:a.visited}}""");ck(f'{w}: late match budget stays at three',x['cost']<=3 and x['cost']>0 and x['visited']<1000)
  p.evaluate('''()=>{let x=123;Math.random=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};setup();hand=[cards[0],cards[2]];render()}''');p.locator('[data-card="0"]').focus();p.keyboard.press('Enter');p.keyboard.press('Digit2');ck(f'{w}: keyboard deploy',p.evaluate('()=>lanes[1].p.length===1&&energy===3'));p.locator('#end').click();ck(f'{w}: readable rival combat report',p.locator('#message').inner_text().startswith('Rival '));ck(f'{w}: real turn advances',p.evaluate('()=>turn===2||gameOver'));ck(f'{w}: no exceptions after input',not errors)
  p.close()
 if not baseline:
  p=b.new_page();p.set_content(src)
  # Full matches driven through real DOM card, lane and End Turn handlers. The
  # player uses a simple visible-board heuristic, not rivalPlan or hidden data.
  x=p.evaluate('''()=>{let results=[],times=[];for(let seed=1;seed<=24;seed++){let n=seed;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};setup();for(let k=0;k<8&&!gameOver;k++){for(let j=0;j<4;j++){let best=null;for(let c=0;c<hand.length;c++){let card=hand[c];if(card.cost>energy)continue;for(let i=0;i<3;i++){let l=lanes[i];if(l.p.length>=3)continue;let val=(card.atk*2+card.hp)/card.cost/(l.p.length+1)+(l.p.length===0&&l.e.length===0?4:0)+(l.p.length===0&&l.e.length?3:0);if(!best||val>best.val)best={c,i,val}}}if(!best)break;document.querySelector(`[data-card="${best.c}"]`).click();document.querySelector(`[data-lane="${best.i}"]`).click()}const t=performance.now();document.querySelector('#end').click();times.push(performance.now()-t)}results.push({seed,turn,result:document.querySelector('#result').textContent,gameOver,pcore,ecore})}return {results,times}}''');details.append({'matches':x['results'],'turn_handler_ms':{'median':statistics.median(x['times']),'max':max(x['times']),'count':len(x['times'])}});ck('24 automated full matches terminate legally',all(v['gameOver'] and v['turn']<=8 for v in x['results']));ck('simple player strategy can win at least one match',any(v['result']=='HEXBOUND VICTORY' for v in x['results']));p.close()
 b.close()
report={'baseline':baseline,'passed':sum(c['pass'] for c in checks),'total':len(checks),'checks':checks,'details':details};out.write_text(json.dumps(report,indent=2));print(json.dumps({'passed':report['passed'],'total':report['total'],'fail':[c for c in checks if not c['pass']],'matches':{k:sum(v['result']==k for v in x['results']) for k in ['HEXBOUND VICTORY','STALEMATE','RIVAL ASCENDANT']} if not baseline else None},indent=2));sys.exit(0 if report['passed']==report['total'] else 1)
