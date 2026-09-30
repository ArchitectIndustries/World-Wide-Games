from pathlib import Path
import json,re,subprocess
ROOT=Path('.').resolve()
node="const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/games.js','utf8'),c);console.log(JSON.stringify(c.window.WWG_GAMES));"
games=json.loads(subprocess.check_output(['node','-e',node],text=True))
assert len(games)==59
index=(ROOT/'index.html').read_text()
app=(ROOT/'js/app.js').read_text()
assert 'Air & Altitude' in index
assert 'In Progress' in app
assert 'Uncleared' in app
assert 'kiteglass-pilot' in app and 'runelight-master' in app
assert app.count('{id:')>=69
for slug in ['kiteglass-drift','runelight-locksmith','starweaver-drift','windward-cargo']:
    text=(ROOT/'games'/slug/'index.html').read_text()
    assert '../../assets/wwg-input.js' in text and 'WWGInput' in text
print({'cards':59,'achievements':69,'airCollection':True,'inProgressFilter':True})
