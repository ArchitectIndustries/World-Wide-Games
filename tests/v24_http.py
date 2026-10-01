from pathlib import Path
import subprocess,json,threading,http.server,socketserver,urllib.request,time
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a): pass
srv=socketserver.TCPServer(('127.0.0.1',0),Handler);port=srv.server_address[1]
t=threading.Thread(target=srv.serve_forever,daemon=True);t.start();time.sleep(.05)
paths=['/','/index.html','/game.html','/assets/styles.css','/assets/wwg-input.js','/js/games.js','/js/app.js']+[('/'+g['path']) for g in games]+[('/'+g['cover']) for g in games]
failed=[]
for p in paths:
 try:
  with urllib.request.urlopen(f'http://127.0.0.1:{port}{p}',timeout=2) as r:
   if r.status!=200: failed.append((p,r.status))
 except Exception as e: failed.append((p,str(e)))
srv.shutdown();srv.server_close()
assert not failed,failed
print(json.dumps({'paths':len(paths),'status':200}))
