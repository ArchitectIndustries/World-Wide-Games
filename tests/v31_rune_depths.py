from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); SRC=(ROOT/'games/rune-depths/index.html').read_text()
for token in ["SAVE_KEY='wwg:rune-depths-save'","function saveRun(phase='play')","function restoreRun(s)","function purePath()","event:'triple-path-mastered'","event:`${path}-mastered`"]: assert token in SRC,token

def raw(seed=None):
    data=json.dumps(seed or {})
    pre=f"<script>const __s={data};window.__store=__s;Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k],key:i=>Object.keys(__s)[i]||null,get length(){{return Object.keys(__s).length}}}},configurable:true}});window.__events=[];window.postMessage=(d)=>{{if(d&&d.type==='wwg:game-event')window.__events.push(d)}};window.addEventListener('message',e=>{{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)}});</script>"
    h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
    return h.replace('<script>',pre+'<script>',1)

BFS="""(target)=>{const q=[[player.x,player.y]],prev=new Map([[player.x+','+player.y,null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];let end=null;while(q.length){const cur=q.shift();if(cur[0]===target.x&&cur[1]===target.y){end=cur;break}for(const d of dirs){const nx=cur[0]+d[0],ny=cur[1]+d[1],k=nx+','+ny;if(nx<0||ny<0||nx>=N||ny>=N||grid[ny][nx]||prev.has(k))continue;prev.set(k,cur);q.push([nx,ny])}}if(!end)throw new Error('no path');const path=[];for(let cur=end;prev.get(cur.join(','));){const old=prev.get(cur.join(','));path.push([cur[0]-old[0],cur[1]-old[1]]);cur=old}path.reverse();for(const d of path)move(d[0],d[1]);return path.length}"""
COMPLETE="""(pick)=>{const pathTo=(target)=>{const q=[[player.x,player.y]],prev=new Map([[player.x+','+player.y,null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];let end=null;while(q.length){const cur=q.shift();if(cur[0]===target.x&&cur[1]===target.y){end=cur;break}for(const d of dirs){const nx=cur[0]+d[0],ny=cur[1]+d[1],k=nx+','+ny;if(nx<0||ny<0||nx>=N||ny>=N||grid[ny][nx]||prev.has(k))continue;prev.set(k,cur);q.push([nx,ny])}}if(!end)return null;const path=[];for(let cur=end;prev.get(cur.join(','));){const old=prev.get(cur.join(','));path.push([cur[0]-old[0],cur[1]-old[1]]);cur=old}return path.reverse()};for(let floor=1;floor<=5;floor++){let guard=0;while(sigils.length&&guard++<3000&&!dead){if(player.hp<=3&&player.potions)drink();const targets=[...sigils].sort((a,b)=>(Math.abs(a.x-player.x)+Math.abs(a.y-player.y))-(Math.abs(b.x-player.x)+Math.abs(b.y-player.y)));const path=pathTo(targets[0]);if(!path||!path.length)throw new Error('no sigil path');move(path[0][0],path[0][1])}guard=0;while(player.count>=4&&!won&&!dead&&guard++<3000){if(player.hp<=3&&player.potions)drink();const path=pathTo(exit);if(!path||!path.length){if(player.x===exit.x&&player.y===exit.y)break;throw new Error('no exit path')}move(path[0][0],path[0][1]);if(choosing||won)break}if(dead)return {dead:true,floor,score:runScore};if(floor<5){if(!choosing)throw new Error('floor did not clear');chooseRelic(pick)}}return {depth,won,dead,hp:player.hp,mastered:[...meta.mastered],clears:meta.clears,bestScore:meta.bestScore,save:localStorage.getItem(SAVE_KEY)}}"""

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1050,'height':760});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(raw(),wait_until='domcontentloaded');p.wait_for_timeout(60)
    # New runs immediately create an active autosave.
    assert p.evaluate("localStorage.getItem(SAVE_KEY)!==null")
    # Move one legal step and verify the save tracks position.
    step=p.evaluate("()=>[[1,0],[-1,0],[0,1],[0,-1]].find(d=>grid[player.y+d[1]]&&grid[player.y+d[1]][player.x+d[0]]===0)")
    before=p.evaluate('({x:player.x,y:player.y})');p.evaluate('(d)=>move(d[0],d[1])',step);after=p.evaluate('({x:player.x,y:player.y})');assert after!=before
    saved=p.evaluate("JSON.parse(localStorage.getItem(SAVE_KEY))");assert saved['player']['x']==after['x'] and saved['player']['y']==after['y']
    seed=p.evaluate('window.__store')
    p.close()

    # Reload from the captured store: resume prompt appears and restores exact run state.
    q=b.new_page(viewport={'width':1050,'height':760});ee=[];q.on('pageerror',lambda e:ee.append(str(e)));q.set_content(raw(seed),wait_until='domcontentloaded');q.wait_for_timeout(50)
    assert q.locator('#overTitle').inner_text()=='Continue the Delve';q.locator('#resumeBtn').click();q.wait_for_timeout(20);rest=q.evaluate('({x:player.x,y:player.y,depth,phase:JSON.parse(localStorage.getItem(SAVE_KEY)).phase})');assert rest['x']==after['x'] and rest['y']==after['y'] and rest['phase']=='play'
    # Complete all three pure relic paths against the authored deterministic enemy population and real floor/relic transitions.
    results=[]
    for pick in ['heart','edge','flask']:
        q.evaluate('newRun()');res=q.evaluate(COMPLETE,pick);assert res['won'] and res['save'] is None,res;results.append(res)
    meta=q.evaluate('meta');assert set(meta['mastered'])=={'heart','edge','flask'} and meta['clears']==3 and meta['bestScore']>0,meta
    events=[e['event'] for e in q.evaluate('window.__events')]
    for ev in ['heart-mastered','edge-mastered','flask-mastered','triple-path-mastered','depths-mastered']: assert ev in events,events
    # Death/end boundary clears an active save but preserves mastery meta.
    q.evaluate('newRun();finish(false)');assert q.evaluate('localStorage.getItem(SAVE_KEY)') is None;assert set(q.evaluate('meta.mastered'))=={'heart','edge','flask'}
    # Corrupt save is ignored and replaced by a clean new run.
    corrupt=q.evaluate('window.__store');corrupt['wwg:rune-depths-save']='{"bad":true}'
    q.close();z=b.new_page();zz=[];z.on('pageerror',lambda e:zz.append(str(e)));z.set_content(raw(corrupt),wait_until='domcontentloaded');z.wait_for_timeout(40);assert not z.locator('#overlay').is_visible();assert z.evaluate('depth')==1;assert z.evaluate("JSON.parse(localStorage.getItem(SAVE_KEY)).v")==1
    assert not errs and not ee and not zz,(errs,ee,zz)
    b.close()
print(json.dumps({'autosave':'action-level','resume':'exact-position','purePaths':['heart','edge','flask'],'mastery':'3/3','clears':3,'completionClearsSave':True,'deathClearsSave':True,'corruptSaveRecovery':True}))
