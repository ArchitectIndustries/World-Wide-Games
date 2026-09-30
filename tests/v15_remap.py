from playwright.sync_api import sync_playwright
from pathlib import Path
import json
ROOT=Path('.').resolve();INPUT=(ROOT/'assets/wwg-input.js').read_text();MAP={'up':'KeyI','down':'KeyK','left':'KeyJ','right':'KeyL','primary':'KeyF','secondary':'KeyH'}
def pre():
 data=json.dumps({'wwg:keymap':json.dumps(MAP)});return f"<script>const __s={data};Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]}},configurable:true}});window.__events=[];window.postMessage=(d)=>window.__events.push(d);</script>"
def raw(slug):
 s=(ROOT/'games'/slug/'index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>');return s.replace('<script>',pre()+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu']);out={}
 for slug,var in [('frostline-rescue','player.x'),('atlas-below','p.x'),('quiet-protocol','p.x'),('skyhook-sprint','p.x'),('mosslight-vale','player.x')]:
  p=b.new_page(viewport={'width':1000,'height':700});p.set_content(raw(slug),wait_until='domcontentloaded');p.wait_for_timeout(60);before=p.evaluate(var);p.keyboard.down('KeyL');p.wait_for_timeout(130);p.keyboard.up('KeyL');after=p.evaluate(var);assert after>before,(slug,before,after);out[slug]=(before,after);p.close()
 p=b.new_page(viewport={'width':980,'height':700});p.set_content(raw('lantern-line'),wait_until='domcontentloaded');p.wait_for_timeout(60);before=p.evaluate('speed');p.keyboard.down('KeyI');p.wait_for_timeout(150);p.keyboard.up('KeyI');after=p.evaluate('speed');assert after>before;out['lantern-line']=(before,after);p.close()
 p=b.new_page(viewport={'width':980,'height':700});p.set_content(raw('chronofold-courier'),wait_until='domcontentloaded');p.wait_for_timeout(50);before=p.evaluate('player.x');p.keyboard.press('KeyL');after=p.evaluate('player.x');assert after>before;p.keyboard.press('KeyF');assert p.evaluate('echoes.length')==1;out['chronofold-courier']=(before,after);p.close()
 p=b.new_page(viewport={'width':980,'height':700});p.set_content(raw('circuit-rush'),wait_until='domcontentloaded');p.wait_for_timeout(50);before=p.evaluate('car.v');p.keyboard.down('KeyI');p.wait_for_timeout(160);p.keyboard.up('KeyI');after=p.evaluate('car.v');assert after>before;out['circuit-rush']=(before,after);p.close()
 p=b.new_page(viewport={'width':980,'height':700});p.set_content(raw('orbit-breaker'),wait_until='domcontentloaded');p.wait_for_timeout(50);before=p.evaluate('shots.length');p.keyboard.press('KeyF');p.wait_for_timeout(20);after=p.evaluate('shots.length');assert after>before;out['orbit-breaker']=(before,after);p.close()
 b.close();print({'remappableGames':len(out),'checks':out})
