from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,re,json
ROOT=Path('.').resolve();PRE="<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];window.addEventListener('message',e=>{if(e.data&&e.data.type==='wwg:game-event')window.__events.push(e.data)});</script>"
def data_uri(p):return 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode()
def home():
 h=(ROOT/'index.html').read_text();css=(ROOT/'assets/styles.css').read_text();games=(ROOT/'js/games.js').read_text();app=(ROOT/'js/app.js').read_text()
 for p in re.findall(r"cover: '([^']+)'",games):games=games.replace(p,data_uri(p))
 h=re.sub(r'<link rel="manifest"[^>]+>','',h).replace('<link rel="stylesheet" href="assets/styles.css" />',f'<style>{css}</style>').replace('<script src="js/games.js"></script><script src="js/app.js"></script>',PRE+f'<script>{games}</script><script>{app}</script>');return h
def raw(slug):return (ROOT/'games'/slug/'index.html').read_text().replace('<script>',PRE+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 p=b.new_page(viewport={'width':1280,'height':900});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content(home(),wait_until='domcontentloaded');p.wait_for_timeout(180)
 assert p.locator('#gameGrid .game-card').count()==28
 assert p.locator('#gameCount').inner_text()=='28'
 assert p.locator('#achievementGrid .achievement').count()==20
 p.locator('#searchInput').fill('typing');assert p.locator('#gameGrid .game-card').count()==1;assert 'Glyphsmith' in p.locator('#gameGrid').inner_text();p.locator('#searchInput').fill('')
 p.locator('#statusFilter').select_option('Unplayed');assert p.locator('#gameGrid .game-card').count()==28;p.locator('#statusFilter').select_option('All')
 p.locator('#profileButton').click();p.locator('#highContrast').check();assert p.locator('html').evaluate("e=>e.classList.contains('high-contrast')");p.locator('#textScale').fill('115');assert float(p.locator('html').evaluate("e=>e.style.getPropertyValue('--wwg-text-scale')"))>=1.1;p.locator('.dialog-close').click();print('home-ok',flush=True)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(30);d=p.evaluate('({sw:document.documentElement.scrollWidth,iw:innerWidth})');assert d['sw']<=d['iw'],d
 checks={}
 for slug in ['railspire-dispatch','glyphsmith','solar-loom','atlas-below']:
  q=b.new_page(viewport={'width':960,'height':540});ee=[];q.on('pageerror',lambda e,ee=ee:ee.append(str(e)));q.set_content(raw(slug),wait_until='domcontentloaded');q.wait_for_timeout(100)
  if slug=='railspire-dispatch':q.keyboard.press('Digit1');q.keyboard.press('Digit2');print('railspire-ui',flush=True);q.evaluate("delivered=8;finish('Shift cleared.')")
  elif slug=='glyphsmith':q.keyboard.type('GLYPH');q.keyboard.press('Enter');assert int(q.locator('#score').inner_text())>0;print('glyph-ui',flush=True);q.evaluate('score=1750;finish()')
  elif slug=='solar-loom':q.evaluate('place(1)');q.locator('[data-type="garden"]').click();q.evaluate('place(2)');q.locator('#advance').click();print('solar-ui',flush=True);q.evaluate("worlds=['garden','rocky','garden','ice','rocky','ice'];epoch=9;finish('The loom holds.')")
  else:q.keyboard.press('ArrowRight');q.keyboard.press('Space');assert q.locator('#rank').count()==1;q.evaluate('p.ore=6;p.crystal=2;craft();p.x=exit.x;p.y=exit.y;finish(true)');assert q.evaluate("JSON.parse(localStorage.getItem('wwg:atlas-meta')).clears")==1;print('atlas-ui',flush=True)
  q.wait_for_timeout(40);ev=q.evaluate('window.__events');assert any(isinstance(x.get('score'),(int,float)) for x in ev), (slug,ev);assert not ee,(slug,ee);checks[slug]=len(ev);q.close()
 assert not errs,errs
 print(json.dumps({'cards':28,'achievements':20,'mobile':d,'checks':checks},indent=2));b.close()
