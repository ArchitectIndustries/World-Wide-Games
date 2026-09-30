from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==43,len(games)
assert len({g['id'] for g in games})==43
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='frostline-rescue'
genres={x for g in games for x in g['genres']}; assert len(genres)>=69,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['frostline-rescue','signal-choir','terrace-keeper']:
    assert any(g['id']==slug for g in games)
assert {g['id'] for g in games if g.get('remappable')} >= {'frostline-rescue','chronofold-courier','atlas-below'}
sw=(ROOT/'sw.js').read_text(); assert "wwg-v13" in sw and "./assets/wwg-input.js" in sw
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
    assert "'./"+g['path']+"'" in sw,g['path']
    assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('frostline-rescue')
app=(ROOT/'js/app.js').read_text(); gp=(ROOT/'js/game-page.js').read_text(); idx=(ROOT/'index.html').read_text(); game=(ROOT/'game.html').read_text()
assert 'Hands & Heart' in app and 'Remappable' in app and 'wwg:keymap' in app
assert 'keymap-grid' in idx and 'data-key-action="up"' in idx and 'Remappable keyboard' in idx
assert 'remapNote' in game and 'game.remappable' in gp
assert 'rescue-captain' in app and 'signal-keeper' in app and 'terrace-steward' in app and 'key-crafter' in app
assert 'Glass Garden' in (ROOT/'games/emberdeck-pilgrim/index.html').read_text() and 'Iron Kiln' in (ROOT/'games/emberdeck-pilgrim/index.html').read_text()
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'frostline-rescue','publicFilesScanned':len(public),'scoreMeta':sum(bool(g.get('scoreMeta')) for g in games),'remappable':sum(bool(g.get('remappable')) for g in games)}))
