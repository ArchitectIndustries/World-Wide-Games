from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==61,len(games)
assert len({g['id'] for g in games})==61
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='blackglass-watch'
genres={x for g in games for x in g['genres']}; assert len(genres)==97,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['blackglass-watch','tetherline-salvage']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g.get('version')=='1.0'
assert sum(bool(g.get('remappable')) for g in games)==30
sw=(ROOT/'sw.js').read_text(); assert "wwg-v22" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('blackglass-watch')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text()
for token in ['Night Shift','Fresh Genre','renderContinue','primaryGenreCount','catalogExploredPct','catalogClearedPct','Signals & Circuits','Air & Altitude','shareDiscovery']:
 assert token in app or token in idx,token
for aid in ['blackglass-warden','salvage-ace','genre-scout','kiteglass-pilot','runelight-master']:
 assert aid in app,aid
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==72,ach
for slug in ['blackglass-watch','tetherline-salvage']:
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t and 'ARCHITECT INDUSTRIES' in t
for slug in ['deepwater-signal','rift-relay']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g.get('version')=='1.1'
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); blocked=['chat'+'gpt','open'+'ai','internal'+' agent']; assert all(term not in t for term in blocked),p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'blackglass-watch','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
