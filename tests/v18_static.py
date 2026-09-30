from pathlib import Path
import subprocess,json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==53,len(games); assert len({g['id'] for g in games})==53
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='glasswing-polo'
genres={x for g in games for x in g['genres']}; assert len(genres)>=84,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['glasswing-polo','rootsong-architect']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g['scoreMeta']['direction']=='high'
assert sum(bool(g.get('remappable')) for g in games)>=16
assert set(next(g for g in games if g['id']=='glasswing-polo').get('modes',[]))=={'Solo','Local Multiplayer'}
atlas=next(g for g in games if g['id']=='atlas-below');assert 'three selectable contracts' in atlas['description'] and atlas.get('remappable')
sw=(ROOT/'sw.js').read_text(); assert "wwg-v18" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']; assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('glasswing-polo')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text();
for token in ['Competition Night','Living Networks','Daily Pick','Systems Lab']:
 assert token in app and token in idx
for aid in ['glasswing-champion','rootsong-restorer','atlas-contractor','catalog-fifty']: assert aid in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==61,ach
assert 'playDayStreak' in app and 'play-day streak' in app and "state.sort==='updated'" in app and 'Recently updated' in idx
for gid,ver in [('atlas-below','1.4'),('mosslight-vale','1.7'),('emberdeck-pilgrim','1.2'),('prism-duel','1.1')]: assert next(g for g in games if g['id']==gid).get('version')==ver
at=(ROOT/'games/atlas-below/index.html').read_text();
for token in ['Survey Sweep','Crystal Census','Deep Beacon','contract-mastered','data-contract="0"']: assert token in at
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'glasswing-polo','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
