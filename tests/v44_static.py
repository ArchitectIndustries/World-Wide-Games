from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==74 and len({g['id'] for g in games})==74
assert len({x for g in games for x in g['genres']})==122
assert sum(bool(g.get('remappable')) for g in games)==48
assert [g['id'] for g in games if g.get('featured')]==['glassline-breaker']
by={g['id']:g for g in games}; g=by['glassline-breaker']
assert g['version']=='1.0' and g['scoreMeta']['direction']=='high' and g['remappable']
assert 'five vaults' in g['objective'].lower() and 'Brick Breaker' in g['genres']
for item in games:
    assert (ROOT/item['path']).exists(),item['id']
    assert (ROOT/item['cover']).exists(),item['id']
    assert item.get('objective') or item.get('description'),item['id']
app=(ROOT/'js/app.js').read_text(); sw=(ROOT/'sw.js').read_text(); game=(ROOT/'games/glassline-breaker/index.html').read_text(); home=(ROOT/'index.html').read_text()
assert "{version:'v44',title:'Glassline Breaker'" in app
assert "'glassline-breaker':'Brick Breaker'" in app and "const classicOrder=['glassline-breaker'" in app
assert "id:'glassline-restorer'" in app
assert "const CACHE='wwg-v44'" in sw and './games/glassline-breaker/index.html' in sw and './covers/glassline-breaker.svg' in sw
for token in ['layouts=[','finishVault()','shield-save','campaign-complete','MULTIBALL','__GLASSLINE_TEST__']:
    assert token in game,token
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]
ids=re.findall(r"\{id:'([^']+)'",ach); assert len(ids)==117 and len(set(ids))==117,(len(ids),len(set(ids)))
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); urls=[x['url'] for x in manifest.get('shortcuts',[])]; assert urls[0]=='game.html?id=glassline-breaker',urls
for f in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=f.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']:
        assert term not in t,f
print(json.dumps({'games':74,'genres':122,'achievements':117,'remappable':48,'featured':'glassline-breaker','cache':'wwg-v44'}))
