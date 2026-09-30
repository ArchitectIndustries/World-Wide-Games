from pathlib import Path
import subprocess,json,threading,urllib.request
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
srv=ThreadingHTTPServer(('127.0.0.1',0),Quiet);thread=threading.Thread(target=srv.serve_forever,daemon=True);thread.start();port=srv.server_address[1]
paths=['','index.html','game.html','assets/styles.css','assets/app-icon.svg','assets/wwg-input.js','js/games.js','js/app.js','js/game-page.js','manifest.webmanifest','sw.js']
for g in games: paths.extend([g['path'],g['cover']])
try:
    for path in paths:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/{path}',timeout=3) as r:
            assert r.status==200,(path,r.status);r.read(32)
finally: srv.shutdown();srv.server_close()
print(json.dumps({'paths':len(paths),'status':200,'games':len(games)}))
