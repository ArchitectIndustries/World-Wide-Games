from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'games/verdant-echoes/index.html').read_text(); INPUT=(ROOT/'assets/wwg-input.js').read_text()
assert "if(boss&&boss.hp>0)return" in SRC
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.postMessage=(d)=>{if(d&&d.type==='wwg:game-event')window.__events.push(d)};</script>"""
h=SRC.replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
i=h.lower().find('<script'); h=h[:i]+PRE+h[i:]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':960,'height':700}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
 p.set_content(h,wait_until='domcontentloaded',timeout=8000); p.wait_for_timeout(100)
 # Hollow Stag: damage must survive multiple animation frames instead of respawning at full HP.
 p.evaluate("takenSeeds=new Set([0,1,2]);defeatedBosses=new Set();weapon='moonsteel';buildMap('rootvault');p.x=boss.x-.8;p.y=boss.y;inv=10")
 hp0=p.evaluate('boss.hp'); p.evaluate('attack()'); p.wait_for_timeout(180); hp1=p.evaluate('boss.hp')
 assert hp1==hp0-2,(hp0,hp1)
 p.evaluate('p.x=boss.x-.8;p.y=boss.y;attack()'); p.wait_for_timeout(180); hp2=p.evaluate('boss.hp')
 assert hp2==hp0-4,(hp0,hp2)
 # Map transitions clear the previous-area boss before evaluating the new area's spawn conditions.
 p.evaluate("rootSigil=true;takenRelics=new Set([0,1,2,3]);defeatedBosses.add('stag');p.x=38;p.y=24;buildMap('grove')")
 assert p.evaluate("boss&&boss.id")=='regent'
 reg0=p.evaluate('boss.hp'); p.evaluate('p.x=boss.x-.8;p.y=boss.y;attack()'); p.wait_for_timeout(180); reg1=p.evaluate('boss.hp')
 assert reg1==reg0-2,(reg0,reg1)
 # Defeat through spaced real attacks; no single-frame burst required.
 for _ in range(8):
  if p.evaluate('won'): break
  p.evaluate('if(boss){p.x=boss.x-.8;p.y=boss.y;inv=10;attack()}'); p.wait_for_timeout(80)
 assert p.evaluate('won') is True
 assert any(e.get('event')=='campaign-complete' for e in p.evaluate('window.__events'))
 assert not errs,errs
 b.close()
print(json.dumps({'hollowStagDamagePersists':'pass','thornRegentDamagePersists':'pass','spacedBossDefeat':'pass','areaBossReset':'pass'}))
