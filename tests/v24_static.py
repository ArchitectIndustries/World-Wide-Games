from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==63,len(games)
assert len({g['id'] for g in games})==63
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='starfall-observatory'
genres={x for g in games for x in g['genres']}; assert len(genres)==101,len(genres)
assert 'Astronomy' in genres
assert all(g.get('scoreMeta') for g in games)
star=next(g for g in games if g['id']=='starfall-observatory'); assert star.get('remappable') and star.get('version')=='1.0'
ember=next(g for g in games if g['id']=='emberdeck-pilgrim'); assert ember.get('remappable') and ember.get('version')=='1.3' and ember.get('updated')=='2026-10-01'
assert sum(bool(g.get('remappable')) for g in games)==34
sw=(ROOT/'sw.js').read_text(); assert "wwg-v24" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']
 assert '"./'+g['path']+'"' in sw,g['path']; assert '"./'+g['cover']+'"' in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('starfall-observatory')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text()
for token in ['Science & Discovery','releaseHistory','releaseHistoryButton','Recently Updated','Craft & Create','Fresh Genre']:
 assert token in app or token in idx,token
for aid in ['sky-surveyor','dual-pilgrim','release-archivist','atelier-weaver','garden-warden']:
 assert aid in app,aid
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==78,ach
for slug in ['starfall-observatory','emberdeck-pilgrim']:
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t and 'ARCHITECT INDUSTRIES' in t
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); blocked=['chat'+'gpt','open'+'ai','internal'+' agent']; assert all(term not in t for term in blocked),p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'starfall-observatory','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games),'emberVersion':ember['version']}))
