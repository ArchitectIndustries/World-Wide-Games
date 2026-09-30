from pathlib import Path
import json,subprocess
ROOT=Path('.').resolve()
node="const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
remap=[g for g in games if g.get('remappable')]
assert len(remap)==26, len(remap)
for g in remap:
    text=(ROOT/g['path']).read_text()
    assert '../../assets/wwg-input.js' in text and 'WWGInput' in text, g['id']
for slug in ['kiteglass-drift','runelight-locksmith','starweaver-drift','windward-cargo']:
    assert next(g for g in remap if g['id']==slug)
print({'remappableGames':len(remap),'sharedInputSource':True})
