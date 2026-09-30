from pathlib import Path
import re, subprocess, json
ROOT=Path('.').resolve()
# Evaluate registry with node and emit JSON.
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==31
assert len({g['id'] for g in games})==31
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='deepwater-signal'
genres={x for g in games for x in g['genres']};assert len(genres)==49,len(genres)
sw=(ROOT/'sw.js').read_text();assert "wwg-v9" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']
 assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']
 assert "'./"+g['cover']+"'" in sw,g['cover']
assert "'./assets/app-icon.svg'" in sw and (ROOT/'assets/app-icon.svg').exists()
manifest=json.loads((ROOT/'manifest.webmanifest').read_text());assert manifest['shortcuts'][1]['url'].endswith('deepwater-signal');assert manifest['icons']
# Public-facing branding scan only.
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower()
 assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p
 public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'deepwater-signal','publicFilesScanned':len(public),'icons':len(manifest['icons'])}))
