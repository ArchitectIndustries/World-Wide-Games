from pathlib import Path
import re,threading,http.server,socketserver,urllib.request,time,os,json
ROOT=Path(__file__).resolve().parents[1]; os.chdir(ROOT)
sw=(ROOT/'sw.js').read_text(); paths=['./']+[m.group(1) for m in re.finditer(r'^\s*"(\.\/[^\"]+)"',sw,re.M)]
class H(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a): pass
srv=socketserver.TCPServer(('127.0.0.1',0),H); port=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start(); time.sleep(.05)
failed=[]
for p in paths:
 u='/' if p=='./' else '/'+p[2:]
 try:
  with urllib.request.urlopen(f'http://127.0.0.1:{port}{u}',timeout=3) as r:
   if r.status!=200: failed.append((u,r.status))
 except Exception as e: failed.append((u,type(e).__name__))
srv.shutdown();srv.server_close(); assert not failed,failed
print(json.dumps({'serviceWorkerHttpPaths':len(paths),'passed':len(paths),'status':200}))