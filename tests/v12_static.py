from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==40,len(games)
assert len({g['id'] for g in games})==40
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='chronofold-courier'
genres={x for g in games for x in g['genres']}; assert len(genres)>=64,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['chronofold-courier','hearthline-kitchen','spectra-safari']:
    assert any(g['id']==slug for g in games)
sw=(ROOT/'sw.js').read_text(); assert "wwg-v12" in sw
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
    assert "'./"+g['path']+"'" in sw,g['path']
    assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('chronofold-courier')
app=(ROOT/'js/app.js').read_text(); gp=(ROOT/'js/game-page.js').read_text(); idx=(ROOT/'index.html').read_text(); game=(ROOT/'game.html').read_text()
assert 'wwg:daily-game-playtime' in gp
assert 'recentGenreTotals' in app and 'renderGenreTrends' in app and 'Skill & Timing' in app
assert 'genreTrends' in idx and 'runSummary' in game
assert "fold-keeper" in app and "hearthline-chef" in app and "field-photographer" in app
assert 'wwg:ashfall-meta' in (ROOT/'games/ashfall-caravan/index.html').read_text()
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'chronofold-courier','publicFilesScanned':len(public),'scoreMeta':sum(bool(g.get('scoreMeta')) for g in games)}))
