from pathlib import Path
import subprocess,json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==72 and len({g['id'] for g in games})==72
assert len({x for g in games for x in g['genres']})==120
assert all(g.get('scoreMeta') for g in games) and all(g.get('controls') and len(g['controls'])>=3 for g in games)
assert all(len(g.get('description',''))>=60 for g in games)
assert sum(bool(g.get('remappable')) for g in games)==46
featured=[g['id'] for g in games if g.get('featured')]; assert featured==['ironlight-breach'],featured
new=['ironlight-breach','verdant-echoes','ashen-covenant','astral-menagerie','polyforge-studio','neon-serpent']
for gid in new:
 g=next(x for x in games if x['id']==gid); assert g.get('version')=='1.0' and g.get('added')=='2026-10-01' and g.get('remappable')
for g in games: assert (ROOT/g['path']).exists() and (ROOT/g['cover']).exists(),g['id']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v32" in sw
for gid in new: assert f'./games/{gid}/index.html' in sw and f'./covers/{gid}.svg' in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v32',title:'Flagship Genre Expansion'" in app and "'Flagship Worlds'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2];assert hist.count('{version:')==6
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2];assert ach.count("{id:")==100,ach.count("{id:")
for ev in ['ironlight-breach:campaign-complete','verdant-echoes:campaign-complete','ashen-covenant:pilgrimage-complete','astral-menagerie:atlas-complete','polyforge-studio:studio-mastered','neon-serpent:campaign-complete']: assert ev in ach
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url']=='game.html?id=ironlight-breach'
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for p in public:
 t=p.read_text(errors='ignore').lower()
 for term in ['chat'+'gpt','open'+'ai','internal'+' agent']: assert term not in t,p
print(json.dumps({'games':72,'genres':120,'achievements':100,'remappable':46,'featured':'ironlight-breach','cache':'wwg-v32','publicFilesScanned':len(public)}))
