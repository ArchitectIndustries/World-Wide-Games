from pathlib import Path
import subprocess,json,re
ROOT=Path('.').resolve()
node="""const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"""
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==66
for g in games:
    assert g.get('controls') and len(g['controls'])>=3,g['id']
    text=' '.join(g['controls'])
    if g.get('remappable'):
        assert re.search(r'Remappable|Primary|Secondary|Space|WASD|A / D|direction',text,re.I),g['id']
page=(ROOT/'js/game-page.js').read_text()
for required in ["KEY_DEFAULTS","primary:'Space'","secondary:'KeyE'","Current keyboard map","W/A/S/D defaults","controlDetail"]:assert required in page,required
html=(ROOT/'game.html').read_text();assert 'id="keyboardProfile"' in html
print(json.dumps({'gamesWithControlLists':len(games),'remappableWithExactProfile':sum(bool(g.get('remappable')) for g in games),'defaults':['W','A','S','D','Space','E']}))
