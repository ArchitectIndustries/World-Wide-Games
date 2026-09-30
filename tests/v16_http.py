from pathlib import Path
import http.server,socketserver,threading,urllib.request,subprocess,json
ROOT=Path('.').resolve(); node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""; games=json.loads(subprocess.check_output(['node','-e',node],text=True))
class H(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
handler=lambda *a,**k:H(*a,directory=str(ROOT),**k)
with socketserver.TCPServer(('127.0.0.1',0),handler) as srv:
 port=srv.server_address[1];threading.Thread(target=srv.serve_forever,daemon=True).start();paths=['index.html','game.html','manifest.webmanifest','sw.js','assets/styles.css','assets/wwg-input.js','js/games.js','js/app.js','js/game-page.js']+[g['path'] for g in games]+[g['cover'] for g in games];bad=[]
 for path in paths:
  try:
   with urllib.request.urlopen(f'http://127.0.0.1:{port}/{path}',timeout=3) as r:
    if r.status!=200:bad.append((path,r.status))
  except Exception as e:bad.append((path,str(e)))
 srv.shutdown()
 assert not bad,bad;print({'paths':len(paths),'status':200})
