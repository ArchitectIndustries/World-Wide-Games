from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==62,len(games)
assert len({g['id'] for g in games})==62
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='prismweave-atelier'
genres={x for g in games for x in g['genres']}; assert len(genres)==100,len(genres)
assert all(g.get('scoreMeta') for g in games)
new=next(g for g in games if g['id']=='prismweave-atelier'); assert new.get('remappable') and new.get('version')=='1.0'
bastion=next(g for g in games if g['id']=='bastion-bloom'); assert bastion.get('remappable') and bastion.get('version')=='1.5' and 'Defense' in bastion['genres']
assert sum(bool(g.get('remappable')) for g in games)==32
sw=(ROOT/'sw.js').read_text(); assert "wwg-v23" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']
 assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('prismweave-atelier')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text()
for token in ['Craft & Create','renderUpdated','updatedGrid','Night Shift','Fresh Genre','renderContinue','primaryGenreCount','shareDiscovery']:
 assert token in app or token in idx,token
for aid in ['atelier-weaver','garden-warden','update-explorer','blackglass-warden','salvage-ace']:
 assert aid in app,aid
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==75,ach
for slug in ['prismweave-atelier','bastion-bloom']:
 t=(ROOT/'games'/slug/'index.html').read_text(); assert '../../assets/wwg-input.js' in t and 'WWGInput' in t and 'ARCHITECT INDUSTRIES' in t
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); blocked=['chat'+'gpt','open'+'ai','internal'+' agent']; assert all(term not in t for term in blocked),p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'prismweave-atelier','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games),'bastionVersion':bastion['version']}))
