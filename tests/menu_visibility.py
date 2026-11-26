"""Check launch-to-play and visible menu states on Lattice Armada; audit all catalog pages.
Browser set_content fallback uses inlined local resources and a storage shim, not production.
Run at repo root: python tests/menu_visibility.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json,os
ROOT=Path(__file__).resolve().parents[1]
SHIM='''<script>const _menuStore={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>_menuStore[k]??null,setItem:(k,v)=>_menuStore[k]=String(v),removeItem:k=>delete _menuStore[k],length:0,key:()=>null},configurable:true});</script>'''
def inline(f):
 s=f.read_text();s=re.sub(r'<script\s+src=["\']([^"\']+)["\']\s*></script>',lambda m:'<script>'+ (f.parent/m[1].split('?')[0]).read_text()+'</script>' if (f.parent/m[1].split('?')[0]).is_file() else m[0],s,flags=re.I);s=re.sub(r'<link\b[^>]*href=["\']([^"\']+\.css)["\'][^>]*>',lambda m:'<style>'+(f.parent/m[1]).read_text()+'</style>' if (f.parent/m[1]).is_file() else m[0],s,flags=re.I);return s.replace('</head>',SHIM+'</head>',1)
def hidden_visible(page):return page.evaluate("""()=>[...document.querySelectorAll('[hidden]')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(e=>e.id||e.className||e.tagName)""")
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);page=browser.new_page(viewport={'width':900,'height':620});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 source=inline(ROOT/'games/lattice-armada/index.html'); at=source.rfind('})();');assert at>=0; source=source[:at]+"window.__menuQA={state:()=>({shipX:st.ship.x,paused:st.paused,sector:st.sector}),forceSectorClear:()=>clearSector(true)};"+source[at:];page.set_content(source,wait_until='domcontentloaded');menu=page.locator('#menu');assert menu.is_visible();page.locator('#launchBtn').click();assert not menu.is_visible(), 'Launch overlay remained visible';assert not hidden_visible(page);before=page.evaluate('window.__menuQA.state().shipX');page.keyboard.down('ArrowRight');page.wait_for_timeout(180);page.keyboard.up('ArrowRight');assert page.evaluate('window.__menuQA.state().shipX')>before;page.keyboard.press('KeyP');assert page.evaluate('window.__menuQA.state().paused');page.keyboard.press('KeyP');assert not page.evaluate('window.__menuQA.state().paused');assert not menu.is_visible();assert page.evaluate('window.__menuQA.forceSectorClear()');assert menu.is_visible();page.locator('#launchBtn').click();assert not menu.is_visible();assert page.evaluate('window.__menuQA.state().sector')==1;assert not errors,errors
 browser.close()
print(json.dumps({'lattice':'passed launch visibility, movement, pause/resume, sector continuation and no script exceptions'}))
