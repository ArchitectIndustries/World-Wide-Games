from pathlib import Path
import subprocess,json
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==66 and len({g['id'] for g in games})==66
assert len({x for g in games for x in g['genres']})==106
assert all(g.get('scoreMeta') for g in games) and all(g.get('controls') and len(g['controls'])>=3 for g in games)
assert all(len(g.get('description',''))>=60 for g in games)
assert sum(bool(g.get('remappable')) for g in games)==40
assert sum(1 for g in games if g.get('featured'))==1 and next(g['id'] for g in games if g.get('featured'))=='fluxward-conclave'
a=next(g for g in games if g['id']=='aetherstead-colony');assert a.get('version')=='2.0' and a.get('updated')=='2026-10-01' and a.get('remappable')
p=next(g for g in games if g['id']=='pulsevine-parkour');assert p.get('version')=='2.0' and p.get('updated')=='2026-10-01' and p.get('remappable') and len(p.get('controls',[]))>=8
m=next(g for g in games if g['id']=='mosslight-vale');assert m.get('version')=='1.8' and m.get('updated')=='2026-10-01' and m.get('remappable')
for g in games: assert (ROOT/g['path']).exists() and (ROOT/g['cover']).exists(),g['id']
sw=(ROOT/'sw.js').read_text();assert "wwg-v30" in sw and './games/aetherstead-colony/index.html' in sw and './games/mosslight-vale/index.html' in sw
app=(ROOT/'js/app.js').read_text();assert "{version:'v30',title:'Pulsevine Expansion / Explicit Controls'" in app and "'Long Campaigns'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2];assert hist.count('{version:')==6 and "version:'v23'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2];assert ach.count("{id:")==90,ach.count("{id:")
assert 'aetherstead-colony:colony-campaign-complete' in ach and 'mosslight-vale:campaign-complete' in ach and 'pulsevine-parkour:campaign-complete' in ach
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for p in public:
 t=p.read_text(errors='ignore').lower()
 for term in ['chat'+'gpt','open'+'ai','internal'+' agent']:assert term not in t,p
print(json.dumps({'games':66,'genres':106,'achievements':90,'remappable':40,'featured':'fluxward-conclave','cache':'wwg-v30','publicFilesScanned':len(public)}))
