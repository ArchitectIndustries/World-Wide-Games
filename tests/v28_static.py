from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==66 and len({g['id'] for g in games})==66
assert len({x for g in games for x in g['genres']})==106
assert all(g.get('scoreMeta') for g in games)
assert all(g.get('controls') and len(g['controls'])>=3 for g in games)
assert all(len(g.get('description',''))>=60 for g in games)
assert sum(bool(g.get('remappable')) for g in games)==39
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='fluxward-conclave'
f=next(g for g in games if g['id']=='fluxward-conclave')
assert f.get('modes')==['Solo','Local Multiplayer'] and f.get('version')=='1.0'
c=next(g for g in games if g['id']=='circuit-rush'); assert c.get('version')=='2.0' and c.get('updated')=='2026-10-01' and 'Competitive' in c.get('genres',[])
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v28" in sw and './covers/fluxward-conclave.svg' in sw and './games/fluxward-conclave/index.html' in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v28',title:'Fluxward Conclave / Circuit Rush 2.0'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2]; assert hist.count('{version:')==6 and "version:'v22'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]; assert ach.count("{id:")==87,ach.count("{id:")
assert "fluxward-conclave:campaign-won" in ach and "fluxward-conclave:triple-crown" in ach and "circuit-rush:race-won" in ach
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for p in public:
    t=p.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']:
        assert term not in t,p
print(json.dumps({'games':66,'genres':106,'achievements':87,'remappable':39,'featured':'fluxward-conclave','cache':'wwg-v28','publicFilesScanned':len(public)}))
