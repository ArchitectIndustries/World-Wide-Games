from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==73 and len({g['id'] for g in games})==73
assert len({x for g in games for x in g['genres']})==121
assert sum(bool(g.get('remappable')) for g in games)==47
assert [g['id'] for g in games if g.get('featured')]==['pulse-maze']
by={g['id']:g for g in games}
assert by['astral-menagerie']['version']=='3.1' and 'complete' in by['astral-menagerie']['objective'].lower()
assert by['neon-serpent']['version']=='2.0' and 'classic' in (by['neon-serpent']['description']+by['neon-serpent']['objective']).lower()
assert by['pulse-maze']['version']=='1.0' and by['pulse-maze']['remappable']
assert 'retro corridor first-person shooter' in by['ironlight-breach']['description'].lower()
for g in games:
    assert (ROOT/g['path']).exists(),g['id']; assert (ROOT/g['cover']).exists(),g['id']
    assert g.get('objective') or g.get('description'),g['id']
app=(ROOT/'js/app.js').read_text(); sw=(ROOT/'sw.js').read_text(); inp=(ROOT/'assets/wwg-input.js').read_text(); page=(ROOT/'js/game-page.js').read_text(); home=(ROOT/'index.html').read_text()
assert "{version:'v41',title:'Playability & Classic Vault'" in app
assert "'Classics Reimagined'" in app and 'classicArchetypes' in app and 'classicGrid' in home
assert 'How to win:' in page and 'Universal movement:' in page
assert 'DIRECTION_ALIASES' in inp and "ArrowUp" in inp and "KeyW" in inp
assert 'wwg-v41' in sw and './games/pulse-maze/index.html' in sw and './covers/pulse-maze.svg' in sw
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]; ids=re.findall(r"\{id:'([^']+)'",ach); assert len(ids)==115 and len(set(ids))==115,(len(ids),len(set(ids)))
for ident in ['classic-serpent','pulse-maze-master']: assert ident in ach
manifest=json.loads((ROOT/'manifest.webmanifest').read_text()); urls=[x['url'] for x in manifest.get('shortcuts',[])]; assert urls[:3]==['game.html?id=pulse-maze','game.html?id=neon-serpent','game.html?id=ironlight-breach'],urls
for f in [ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg')):
    t=f.read_text(errors='ignore').lower()
    for term in ['chat'+'gpt','open'+'ai','internal'+' agent']: assert term not in t,f
print(json.dumps({'games':73,'genres':121,'achievements':115,'remappable':47,'featured':'pulse-maze','cache':'wwg-v41','classics':'visible'}))