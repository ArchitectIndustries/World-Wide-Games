from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==45,len(games)
assert len({g['id'] for g in games})==45
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='spanwright'
genres={x for g in games for x in g['genres']}; assert len(genres)>=73,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['spanwright','lantern-line']:
    assert any(g['id']==slug for g in games)
lantern=next(g for g in games if g['id']=='lantern-line'); assert lantern['scoreMeta']['direction']=='low' and lantern.get('remappable')
assert sum(bool(g.get('remappable')) for g in games)>=7
sw=(ROOT/'sw.js').read_text(); assert "wwg-v14" in sw
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
    assert "'./"+g['path']+"'" in sw,g['path']
    assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('spanwright')
app=(ROOT/'js/app.js').read_text(); gp=(ROOT/'js/game-page.js').read_text(); idx=(ROOT/'index.html').read_text(); moss=(ROOT/'games/mosslight-vale/index.html').read_text()
assert 'Build & Operate' in app and 'Build & Operate' in idx
assert 'spanwright-certified' in app and 'night-operator' in app and 'precision-service' in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:');assert ach==45,ach
assert "lowerIsBetter" in gp and "function better" in gp and "scoreMeta.direction==='low'" in gp
assert 'Moonroot Hollow' in moss and 'Dusk Orchid' in moss and 'moonroot-restored' in moss and 'hollowStage' in moss
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'spanwright','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games),'lowScoreGames':[g['id'] for g in games if g['scoreMeta']['direction']=='low']}))
