from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();PRE="<script>window.__events=[];window.postMessage=d=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>__s[k]||null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('prismweave-atelier'),wait_until='domcontentloaded');p.wait_for_timeout(50)
 proof=p.evaluate("""()=>LEVELS.map(L=>{let b=cloneTarget(L);for(const op of L.scramble)applyShift(b,...op);const scrambled=!b.every((r,y)=>r.join('')===L.target[y]);for(const op of [...L.scramble].reverse())applyShift(b,op[0],op[1],-op[2]);return {name:L.name,scrambled,solved:b.every((r,y)=>r.join('')===L.target[y]),moves:L.scramble.length,par:L.par}})""")
 assert len(proof)==6 and all(x['scrambled'] and x['solved'] for x in proof),proof;assert all(x['moves']==x['par'] for x in proof),proof;p.close()
 p=b.new_page(viewport={'width':1000,'height':760});p.set_content(raw('bastion-bloom'),wait_until='domcontentloaded');p.wait_for_timeout(50)
 info=p.evaluate("({waves:WAVE_TABLE,types:Object.keys(TYPES),path:path.length,nodes:nodes.length})");assert len(info['waves'])==10 and info['types']==['bloom','frost','spore'];assert info['path']>100 and info['nodes']==8
 assert info['waves'][4]['units'].get('boss')==1 and info['waves'][9]['units'].get('boss')==2
 assert all(sum(w['units'].values())>0 for w in info['waves'])
 # Exercise real spawn and damage paths for every enemy type.
 for typ in ['seedling','moth','brute','boss']:
  p.evaluate(f"spawnEnemy('{typ}')");assert p.evaluate('enemies.length')>=1;p.evaluate("()=>{const e=enemies[enemies.length-1];damageEnemy(e,e.max+1)}")
 assert p.evaluate('kills')==4
 p.evaluate("()=>{wave=10;waveActive=true;waveQueue=[];enemies=[];resolveWave()}");assert any(e.get('event')=='campaign-complete' for e in p.evaluate('window.__events'));p.close();b.close()
 print({'prismweaveCommissions':6,'inverseSolutionsVerified':6,'bastionWaves':10,'towerTypes':3,'bossWaves':[5,10],'enemyArchetypesExercised':4})
