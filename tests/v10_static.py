from pathlib import Path
import re, subprocess, json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==34, len(games)
assert len({g['id'] for g in games})==34
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='windward-cargo'
genres={x for g in games for x in g['genres']};assert len(genres)==55,len(genres)
assert all(g.get('scoreMeta') for g in games)
sw=(ROOT/'sw.js').read_text();assert "wwg-v10" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']
 assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']
 assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text());assert manifest['shortcuts'][0]['url'].endswith('windward-cargo');assert manifest['icons']
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower();assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p;public.append(str(p.relative_to(ROOT)))
# v10 feature assertions
app=(ROOT/'js/app.js').read_text();assert "Slow & Cozy" in app and "Mind Games" in app and "wwg:sessions" in (ROOT/'js/game-page.js').read_text()
moss=(ROOT/'games/mosslight-vale/index.html').read_text();assert 'Sunfall Reach' in moss and 'Sunbell' in moss and 'reachStage' in moss and 'Sunsteel IV' in moss
atlas=(ROOT/'games/atlas-below/index.html').read_text();assert 'wallChance' in atlas and 'resourceCount' in atlas and 'gasCount' in atlas
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'windward-cargo','publicFilesScanned':len(public),'scoreMeta':sum(bool(g.get('scoreMeta')) for g in games)}))
