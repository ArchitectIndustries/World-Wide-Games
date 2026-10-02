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
featured=[g['id'] for g in games if g.get('featured')]; assert featured==['verdant-echoes'],featured
g=next(x for x in games if x['id']=='verdant-echoes')
assert g.get('version')=='2.0' and g.get('updated')=='2026-10-02' and g.get('remappable')
for phrase in ['rootvault','moon seeds','npc forging quest','persistent equipment','hollow stag','thorn regent']:
    assert phrase in g['description'].lower(), phrase
for item in games: assert (ROOT/item['path']).exists() and (ROOT/item['cover']).exists(),item['id']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v35" in sw and './games/verdant-echoes/index.html' in sw and './covers/verdant-echoes.svg' in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v35',title:'Verdant Echoes 2.0'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2]; assert hist.count('{version:')==6 and "version:'v29'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]; assert ach.count("{id:")==102
assert "rootvault-warden" in ach and "moonsteel-oath" in ach
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url']=='game.html?id=verdant-echoes' and manifest['shortcuts'][0]['name']=='Verdant Echoes'
assert 'ROOTVAULT 2.0' in (ROOT/'covers/verdant-echoes.svg').read_text()
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for f in public:
    t=f.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']: assert term not in t,f
print(json.dumps({'games':72,'genres':120,'achievements':102,'remappable':46,'featured':'verdant-echoes','cache':'wwg-v35','verdantVersion':'2.0','publicFilesScanned':len(public)}))
