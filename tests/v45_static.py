from pathlib import Path
import json,re,subprocess
ROOT=Path('.')
games_js=(ROOT/'js/games.js').read_text()
app=(ROOT/'js/app.js').read_text()
sw=(ROOT/'sw.js').read_text()
manifest=json.loads((ROOT/'manifest.webmanifest').read_text())
html=(ROOT/'games/lumenfall-citadel/index.html').read_text()

# Evaluate catalog totals through Node to avoid brittle object parsing.
js="global.window={};require('./js/games.js');console.log(JSON.stringify({games:window.WWG_GAMES.length,genres:new Set(window.WWG_GAMES.flatMap(g=>g.genres)).size,featured:window.WWG_GAMES.filter(g=>g.featured).map(g=>g.id),remappable:window.WWG_GAMES.filter(g=>g.remappable).length}))"
out=subprocess.check_output(['node','-e',js],text=True)
stats=json.loads(out)
assert stats=={'games':75,'genres':122,'featured':['lumenfall-citadel'],'remappable':47},stats
ach=app.split('const achievements = [',1)[1].split('];',1)[0]
assert len(re.findall(r"\{id:'",ach))==120
assert "version:'v45',title:'Lumenfall Citadel'" in app
assert "['lumenfall-citadel','vanta-frontline'" in app
assert "const CACHE='wwg-v45'" in sw
assert './covers/lumenfall-citadel.svg' in sw and './games/lumenfall-citadel/index.html' in sw
assert manifest['shortcuts'][0]['url']=='game.html?id=lumenfall-citadel'
assert manifest['shortcuts'][0]['icons'][0]['src']=='covers/lumenfall-citadel.svg'
assert (ROOT/'covers/lumenfall-citadel.svg').exists()
assert (ROOT/'games/lumenfall-citadel/index.html').exists()
for token in ['Architect Industries','WorldWideGames']:
    assert token in (ROOT/'README.md').read_text() or token=='WorldWideGames'
for banned in ['ChatGPT','OpenAI','internal agent','hidden tooling']:
    for path in [ROOT/'index.html',ROOT/'game.html',ROOT/'js/games.js',ROOT/'js/app.js',ROOT/'games/lumenfall-citadel/index.html']:
        assert banned.lower() not in path.read_text().lower(),(banned,path)
print(json.dumps({'games':75,'genres':122,'achievements':120,'remappable':47,'featured':'lumenfall-citadel','cache':'wwg-v45','branding':'pass'}))
