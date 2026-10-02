from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==72 and len({g['id'] for g in games})==72
assert len({x for g in games for x in g['genres']})==120
assert sum(bool(g.get('remappable')) for g in games)==46
featured=[g['id'] for g in games if g.get('featured')]; assert featured==['astral-menagerie'],featured
g=next(x for x in games if x['id']=='astral-menagerie')
assert g.get('version')=='3.0' and g.get('updated')=='2026-10-02' and g.get('remappable')
for phrase in ['field-study','rematches','ascendant','starlight']:
    assert phrase in g['description'].lower(),phrase
for item in games: assert (ROOT/item['path']).exists() and (ROOT/item['cover']).exists(),item['id']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v40" in sw and './games/astral-menagerie/index.html' in sw and './covers/astral-menagerie.svg' in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v40',title:'Astral Menagerie 3.0'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2]; assert hist.count('{version:')==6 and "version:'v34'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]; ids=re.findall(r"\{id:'([^']+)'",ach); assert len(ids)==113 and len(set(ids))==113
for ident in ['habitat-scholar','constellation-challenger','ascendant-atlas']: assert ident in ach
assert "'astral-menagerie'].includes(g.id)" in app
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url']=='game.html?id=astral-menagerie' and manifest['shortcuts'][0]['name']=='Astral Menagerie'
cover=(ROOT/'covers/astral-menagerie.svg').read_text(); assert '3.0 · ASCENDANT ATLAS' in cover
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for f in public:
    t=f.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']: assert term not in t,f
print(json.dumps({'games':72,'genres':120,'achievements':113,'remappable':46,'featured':'astral-menagerie','cache':'wwg-v40','astralVersion':'3.0','publicFilesScanned':len(public)}))
