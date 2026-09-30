from pathlib import Path
import subprocess,json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==49,len(games); assert len({g['id'] for g in games})==49
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='riftwake-regatta'
genres={x for g in games for x in g['genres']}; assert len(genres)>=78,len(genres)
assert all(g.get('scoreMeta') for g in games)
reg=next(g for g in games if g['id']=='riftwake-regatta'); assert reg['scoreMeta']['direction']=='low' and reg.get('remappable')
alc=next(g for g in games if g['id']=='archive-alchemist'); assert 'Alchemy' in alc['genres']
assert sum(bool(g.get('remappable')) for g in games)>=10
sw=(ROOT/'sw.js').read_text(); assert "wwg-v16" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']; assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('riftwake-regatta')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text();gp=(ROOT/'js/game-page.js').read_text()
assert 'Motion & Momentum' in app and 'Motion & Momentum' in idx
assert 'Play Later' in idx and "wwg:play-later" in app and "wwg:play-later" in gp
for aid in ['regatta-skipper','formula-restorer','queue-builder']: assert aid in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==53,ach
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'riftwake-regatta','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
