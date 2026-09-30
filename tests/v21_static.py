from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==59,len(games)
assert len({g['id'] for g in games})==59
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='kiteglass-drift'
genres={x for g in games for x in g['genres']}; assert len(genres)>=94,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['kiteglass-drift','runelight-locksmith']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g.get('version')=='1.0'
assert next(g for g in games if g['id']=='kiteglass-drift')['scoreMeta']['direction']=='low'
assert sum(bool(g.get('remappable')) for g in games)>=26
sw=(ROOT/'sw.js').read_text(); assert "wwg-v21" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('kiteglass-drift')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text()
for token in ['Air & Altitude','In Progress','Uncleared','Signals & Circuits','restoreDiscoveryUrl','syncDiscoveryUrl','shareDiscovery']:
 assert token in app or token in idx,token
for aid in ['kiteglass-pilot','runelight-master','mesh-closer','quiet-band','mix-curator']:
 assert aid in app,aid
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==69,ach
for slug in ['kiteglass-drift','runelight-locksmith']:
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t and 'ARCHITECT INDUSTRIES' in t
for slug in ['starweaver-drift','windward-cargo']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g.get('version')=='1.1'
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'kiteglass-drift','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
