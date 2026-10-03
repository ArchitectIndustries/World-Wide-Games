from pathlib import Path
import json, re
import xml.etree.ElementTree as ET

ROOT=Path('.').resolve()
games=(ROOT/'js/games.js').read_text()
app=(ROOT/'js/app.js').read_text()
sw=(ROOT/'sw.js').read_text()
manifest=json.loads((ROOT/'manifest.webmanifest').read_text())
html=(ROOT/'games/aetherglass-breaker/index.html').read_text()

assert "id:'aetherglass-breaker'" in games
assert "genres:['Brick Breaker','Arcade','Action','Physics','Score Attack']" in games
assert "version:'1.0',featured:true,basePopularity:445" in games
assert "id: 'neon-stack'" in games and "featured: false" in games[games.index("id: 'neon-stack'"):games.index("id: 'neon-stack'")+900]
assert len(re.findall(r"\bid\s*:\s*['\"][^'\"]+['\"]",games))>=74
assert "'aetherglass-breaker':'Brick Breaker'" in app
assert "{version:'v44',title:'Aetherglass Breaker'" in app
ach=app[app.index('const achievements = ['):app.index('];',app.index('const achievements = ['))+2]
ids=re.findall(r"\{id:'([^']+)'",ach)
assert len(ids)==len(set(ids))==118
assert 'aetherglass-sealer' in ach and 'prism-chain' in ach
assert "const CACHE='wwg-v44'" in sw
assert './games/aetherglass-breaker/index.html' in sw
assert './covers/aetherglass-breaker.svg' in sw
urls=[x['url'] for x in manifest.get('shortcuts',[])]
assert urls[:3]==['game.html?id=aetherglass-breaker','game.html?id=neon-stack','game.html?id=pulse-maze']
ET.parse(ROOT/'covers/aetherglass-breaker.svg')
for token in ['STAGES=[','Focus','campaign-complete','combo-master','Architect Industries','applyPower','updateBricks','Safety Shield']:
    assert token in html,token
assert 'http://' not in html and 'https://' not in html
print('v44 static integration: pass')
