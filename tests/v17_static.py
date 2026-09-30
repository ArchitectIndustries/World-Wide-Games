from pathlib import Path
import subprocess,json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==51,len(games); assert len({g['id'] for g in games})==51
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='stoneveil-ascent'
genres={x for g in games for x in g['genres']}; assert len(genres)>=81,len(genres)
assert all(g.get('scoreMeta') for g in games)
for slug in ['stoneveil-ascent','tidal-foundry']:
 g=next(x for x in games if x['id']==slug); assert g.get('remappable') and g['scoreMeta']['direction']=='high'
assert sum(bool(g.get('remappable')) for g in games)>=12
moss=next(g for g in games if g['id']=='mosslight-vale'); assert 'six linked regions' in moss['description'] and 'Starbloom Canopy' in moss['description']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v17" in sw
for g in games:
 assert (ROOT/g['path']).exists(),g['path']; assert (ROOT/g['cover']).exists(),g['cover']; assert "'./"+g['path']+"'" in sw,g['path']; assert "'./"+g['cover']+"'" in sw,g['cover']
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url'].endswith('stoneveil-ascent')
app=(ROOT/'js/app.js').read_text();idx=(ROOT/'index.html').read_text();gp=(ROOT/'js/game-page.js').read_text()
assert 'Systems Lab' in app and 'Systems Lab' in idx and 'Daily Pick' in app and 'dailyPickGrid' in idx
for aid in ['stoneveil-summit','pressurewright','daily-explorer','canopy-restorer']: assert aid in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2].count('{id:'); assert ach==57,ach
m=(ROOT/'games/mosslight-vale/index.html').read_text(); assert 'starbloom-restored' in m and 'starLilies' in m and 'Starwood VI' in m and 'W=4400' in m
public=[]
for p in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
 t=p.read_text(errors='ignore').lower(); assert 'chatgpt' not in t and 'openai' not in t and 'internal agent' not in t,p; public.append(str(p.relative_to(ROOT)))
print(json.dumps({'games':len(games),'genres':len(genres),'featured':'stoneveil-ascent','achievements':ach,'publicFilesScanned':len(public),'remappable':sum(bool(g.get('remappable')) for g in games)}))
