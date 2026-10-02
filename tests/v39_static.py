from pathlib import Path
import subprocess,json,re,collections
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==72 and len({g['id'] for g in games})==72
assert len({x for g in games for x in g['genres']})==120
assert all(g.get('scoreMeta') for g in games) and all(g.get('controls') and len(g['controls'])>=3 for g in games)
assert all(len(g.get('description',''))>=60 for g in games)
assert sum(bool(g.get('remappable')) for g in games)==46
featured=[g['id'] for g in games if g.get('featured')]; assert featured==['ironlight-breach'],featured
g=next(x for x in games if x['id']=='ironlight-breach')
assert g.get('version')=='3.0' and g.get('updated')=='2026-10-02' and g.get('remappable')
for phrase in ['five-sector','arc lance','cipher','ranged sentry','vault']:
    assert phrase in g['description'].lower(),phrase
for item in games: assert (ROOT/item['path']).exists() and (ROOT/item['cover']).exists(),item['id']
sw=(ROOT/'sw.js').read_text(); assert "wwg-v39" in sw and './games/ironlight-breach/index.html' in sw and './covers/ironlight-breach.svg' in sw
app=(ROOT/'js/app.js').read_text(); assert "{version:'v39',title:'Ironlight Breach 3.0'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2]; assert hist.count('{version:')==6 and "version:'v33'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]; ids=re.findall(r"\{id:'([^']+)'",ach); assert len(ids)==110 and len(set(ids))==110
assert 'arc-lancer' in ach and 'cipher-diver' in ach and 'ashen-lordfall' in ach
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); assert manifest['shortcuts'][0]['url']=='game.html?id=ironlight-breach' and manifest['shortcuts'][0]['name']=='Ironlight Breach'
cover=(ROOT/'covers/ironlight-breach.svg').read_text(); assert 'BREACH 3.0' in cover and 'ARC LANCE · CIPHER VAULTS · SENTRIES' in cover
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for f in public:
    t=f.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']: assert term not in t,f
print(json.dumps({'games':72,'genres':120,'achievements':110,'remappable':46,'featured':'ironlight-breach','cache':'wwg-v39','ironlightVersion':'3.0','publicFilesScanned':len(public)}))
