from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==47,len(games)
assert len({g['id'] for g in games})==47
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='driftglass-links'
genres={x for g in games for x in g['genres']}; assert len(genres)>=76,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['driftglass-links','tideglass-surveyor','prism-duel']:
    assert any(g['id']==slug for g in games)
drift=next(g for g in games if g['id']=='driftglass-links');assert drift['scoreMeta']['direction']=='low' and drift['scoreMeta']['unit']=='strokes'
prism=next(g for g in games if g['id']=='prism-duel');assert set(prism.get('modes',[]))=={'Solo','Local Multiplayer'}
assert sum(bool(g.get('remappable')) for g in games)>=9
sw=(ROOT/'sw.js').read_text();assert "wwg-v15" in sw
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
    assert "'./"+g['path']+"'" in sw,g['path']
    assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('driftglass-links')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text();gp=(ROOT/'js/game-page.js').read_text()
assert 'Aim & Arc' in app and 'Aim & Arc' in idx
assert 'modeFilter' in app and 'modeFilter' in idx and 'playModes' in app
for aid in ['links-finisher','tide-cartographer','prism-soloist']:assert aid in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:');assert ach==50,ach
assert "lowerIsBetter" in gp and "scoreMeta.direction==='low'" in gp
assert "wwg-input.js" in (ROOT/'games/circuit-rush/index.html').read_text()
assert "wwg-input.js" in (ROOT/'games/orbit-breaker/index.html').read_text()
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p;public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'driftglass-links','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games),'lowScoreGames':[g['id'] for g in games if g['scoreMeta']['direction']=='low']}))
