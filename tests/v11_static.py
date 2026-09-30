from pathlib import Path
import re, subprocess, json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==37,len(games); assert len({g['id'] for g in games})==37
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='ashfall-caravan'
genres={x for g in games for x in g['genres']}; assert len(genres)>=59,len(genres)
assert all(g.get('scoreMeta') for g in games)
sw=(ROOT/'sw.js').read_text(); assert "wwg-v11" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('ashfall-caravan'); assert manifest['icons']
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
app=(ROOT/'js/app.js').read_text(); gp=(ROOT/'js/game-page.js').read_text(); idx=(ROOT/'index.html').read_text()
assert 'Story & Journey' in app and 'wwg:daily-playtime' in app and 'renderActivity' in app
assert 'wwg:daily-playtime' in gp and 'activityChart' in idx
for slug in ['ashfall-caravan','twinforge-expedition','mothlight-museum']:
 assert any(g['id']==slug for g in games)
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'ashfall-caravan','publicFilesScanned':len(public),'scoreMeta':sum(bool(g.get('scoreMeta')) for g in games)}))
