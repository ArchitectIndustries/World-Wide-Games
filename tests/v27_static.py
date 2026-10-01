from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==65 and len({g['id'] for g in games})==65
assert len({x for g in games for x in g['genres']})==105
assert all(g.get('scoreMeta') for g in games)
assert all(g.get('controls') and len(g['controls'])>=3 for g in games)
assert all(len(g.get('description',''))>=60 for g in games)
assert sum(bool(g.get('remappable')) for g in games)==38
assert sum(1 for g in games if g.get('featured'))==1
assert next(g['id'] for g in games if g.get('featured'))=='strata-cipher'
for gid in ['signal-choir','glyphsmith','echo-bazaar','lumen-relay','pulse-archive','hushwave-operator']:
    g=next(x for x in games if x['id']==gid)
    assert g.get('version')=='1.1', (gid,g.get('version'))
    assert g.get('updated')=='2026-10-01'
for g in games:
    assert (ROOT/g['path']).exists(),g['path']
    assert (ROOT/g['cover']).exists(),g['cover']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v27" in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v27',title:'Full Catalog Quality Audit'" in app
assert app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2].count('{version:')==6
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for p in public:
    t=p.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']:
        assert term not in t,p
print(json.dumps({'games':65,'genres':105,'achievements':84,'remappable':38,'upgradedLegacyGames':6,'cache':'wwg-v27','publicFilesScanned':len(public)}))
