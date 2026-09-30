from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==57,len(games); assert len({g['id'] for g in games})==57
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='mirrormesh-relay'
genres={x for g in games for x in g['genres']}; assert len(genres)>=90,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['mirrormesh-relay','hushwave-operator']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable')
assert next(g for g in games if g['id']=='pulsevine-parkour')['scoreMeta']['direction']=='low'
assert sum(bool(g.get('remappable')) for g in games)>=22
for slug in ['cloudforge-pinball','neon-stack']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g.get('version')=='1.1'
sw=(ROOT/'sw.js').read_text(); assert "wwg-v20" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']; assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('mirrormesh-relay')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text();
for token in ['Board & Tabletop','Signals & Circuits','Daily Pick','Competition Night','Living Networks','restoreDiscoveryUrl','syncDiscoveryUrl','shareDiscovery']:
 assert token in app or token in idx,token
for aid in ['pulsevine-runner','commons-steward','tabletop-tourist','mesh-closer','quiet-band','mix-curator']:
 assert aid in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==67,ach
assert 'Share discovery' in idx
for slug in ['cloudforge-pinball','neon-stack']:
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'mirrormesh-relay','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
