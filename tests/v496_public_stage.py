"""Public staging contract: actual loopback HTTP bytes, fail-closed fixtures, no remote writes."""
import functools, hashlib, http.server, importlib.util, json, shutil, sys, tempfile, threading, time, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(sys.argv[1]).resolve(); PUBLIC=Path(sys.argv[2]).resolve(); OUT=Path(sys.argv[3])
spec=importlib.util.spec_from_file_location('stage_public',ROOT/'tools/stage_public.py'); mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
checks=[]
def ck(label, ok): checks.append({'label':label,'pass':bool(ok)})
def run_server(root):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start(); return server

def get(server, path):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}/'+path,timeout=5) as r:return r.status,r.read()
    except urllib.error.HTTPError as e:return e.code,b''
start=time.monotonic(); original=run_server(ROOT); staged=run_server(PUBLIC)
try:
    files=mod.inventory(ROOT); actual=sorted(p.relative_to(PUBLIC).as_posix() for p in PUBLIC.rglob('*') if p.is_file()); ck('exact public inventory',files==actual)
    for rel in files:
        status,data=get(staged,rel);ck('public byte exact '+rel,status==200 and data==(ROOT/rel).read_bytes())
    for url in mod.precache_urls(ROOT):
        status,data=get(staged,url[2:]);ck('precache HTTP exact '+url,status==200 and data==(ROOT/mod.asset_file(url)).read_bytes())
    denied=['PROJECT_STATE.md','TEST_REPORT.md','RELEASE_RECORD.json','tests/v495_moonwake_controller_replay.py','services/cyber_wars/relay.py','SOURCE_SHA256_MANIFEST.json','.github/workflows/release-package.yml','tools/stage_public.py','tests/','services/']
    for p in denied:
        # Root server baseline demonstrates exposure only on a generic static host, not current Vercel.
        ck('generic raw-root host exposes '+p,get(original,p)[0]==200)
        ck('staged host excludes '+p,get(staged,p)[0]==404)
    ck('legacy redirect preserved',get(staged,'games/vector-shatter-v2/index.html')[0]==200)
finally:
    original.shutdown(); staged.shutdown(); original.server_close(); staged.server_close()
with tempfile.TemporaryDirectory() as tmp:
    tmp=Path(tmp); fixture=tmp/'src';shutil.copytree(PUBLIC,fixture)
    def reject(label, fn):
        try:fn();ck(label,False)
        except ValueError:ck(label,True)
    reject('existing destination refused',lambda:mod.stage(fixture,PUBLIC));reject('source-descendant destination refused',lambda:mod.stage(fixture,fixture/'dist'))
    p=fixture/'assets'/'.env';p.write_text('dummy fixture');reject('hidden secret-like file rejected',lambda:mod.stage(fixture,tmp/'bad1'));p.unlink();ck('no bad destination',not(tmp/'bad1').exists())
    p=fixture/'assets'/'debug.py';p.write_text('# fixture');reject('unreviewed extension rejected',lambda:mod.stage(fixture,tmp/'bad2'));p.unlink()
    p=fixture/'assets'/'external.js';p.symlink_to(tmp/'missing');reject('symlink rejected',lambda:mod.stage(fixture,tmp/'bad3'));p.unlink()
    p=fixture/'assets'/'wwg-input.js';p.unlink();reject('missing precache asset rejected',lambda:mod.stage(fixture,tmp/'bad4'));shutil.copyfile(PUBLIC/'assets/wwg-input.js',p)
    for url in ['../x','./../x','./%2e%2e/x','./%5cfoo','./.env','./x#bad','https://other.invalid/x']:
        reject('reject unsafe precache '+url,lambda u=url:mod.asset_file(u))
    manifest=mod.stage(fixture,tmp/'clean');ck('repeat stage exact bytes',manifest['files']=={x:mod.digest(PUBLIC/x) for x in files})
report={'passed':sum(x['pass'] for x in checks),'total':len(checks),'seconds':round(time.monotonic()-start,3),'checks':checks,'scope':'actual Python HTTP byte checks and local fail-closed fixture tests; not Vercel origin qualification'};OUT.write_text(json.dumps(report,indent=2));print(report['passed'],report['total'],report['seconds']);sys.exit(0 if all(x['pass'] for x in checks) else 1)
