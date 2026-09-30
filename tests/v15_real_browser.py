from playwright.sync_api import sync_playwright
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import threading,os,json
ROOT=Path('.').resolve();os.chdir(ROOT)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),Quiet);threading.Thread(target=srv.serve_forever,daemon=True).start();port=srv.server_address[1];base=f'http://127.0.0.1:{port}'
out={}
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for path,key in [('/index.html','home'),('/game.html?id=driftglass-links','driftglass-shell'),('/games/driftglass-links/index.html','driftglass-raw'),('/games/tideglass-surveyor/index.html','tideglass-raw'),('/games/prism-duel/index.html','prism-raw')]:
   p=b.new_page(viewport={'width':1200,'height':800});errs=[];p.on('pageerror',lambda e,errs=errs:errs.append(str(e)));r=p.goto(base+path,wait_until='domcontentloaded',timeout=10000);p.wait_for_timeout(180);assert r and r.status==200,(path,r.status if r else None);assert not errs,(path,errs);out[key]={'status':r.status,'title':p.title()};
   if key=='home':assert p.locator('#gameGrid .game-card').count()==47
   if key=='driftglass-shell':assert p.locator('#gameTitle').inner_text()=='Driftglass Links'
   p.close()
  b.close()
finally:srv.shutdown();srv.server_close()
print(json.dumps(out))
