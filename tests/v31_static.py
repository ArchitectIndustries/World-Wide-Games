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
r=next(g for g in games if g['id']=='rune-depths');assert r.get('version')=='2.1' and r.get('updated')=='2026-10-01' and r.get('remappable') and 'autosave' in r['description'].lower()
for g in games: assert (ROOT/g['path']).exists() and (ROOT/g['cover']).exists(),g['id']
sw=(ROOT/'sw.js').read_text();assert "wwg-v31" in sw and './games/rune-depths/index.html' in sw
app=(ROOT/'js/app.js').read_text();assert "{version:'v31',title:'Rune Depths Mastery Pass'" in app and "'Long Campaigns'" in app
hist=app[app.index('const releaseHistory=['):app.index('];',app.index('const releaseHistory=['))+2];assert hist.count('{version:')==6 and "version:'v25'" not in hist
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2];assert ach.count("{id:")==94,ach.count("{id:")
for ev in ['rune-depths:heart-mastered','rune-depths:edge-mastered','rune-depths:flask-mastered','rune-depths:triple-path-mastered']: assert ev in ach
public=[ROOT/'index.html',ROOT/'game.html',ROOT/'manifest.webmanifest',ROOT/'assets/styles.css',ROOT/'assets/wwg-input.js',ROOT/'js/app.js',ROOT/'js/game-page.js',ROOT/'js/games.js']+list((ROOT/'games').glob('*/index.html'))+list((ROOT/'covers').glob('*.svg'))
for p in public:
 t=p.read_text(errors='ignore').lower()
 for term in ['chat'+'gpt','open'+'ai','internal'+' agent']:assert term not in t,p
print(json.dumps({'games':66,'genres':106,'achievements':94,'remappable':40,'featured':'fluxward-conclave','cache':'wwg-v31','runeVersion':'2.1','publicFilesScanned':len(public)}))
