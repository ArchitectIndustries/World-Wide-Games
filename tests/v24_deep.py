from pathlib import Path
import re,json
star=(Path('games/starfall-observatory/index.html')).read_text()
ember=(Path('games/emberdeck-pilgrim/index.html')).read_text()
# Parse six authored astronomy targets and ensure every one is in legal scope.
body=re.search(r'const TARGETS=\[(.*?)\];',star,re.S).group(1)
rows=re.findall(r"\{name:'([^']+)',az:(\d+),alt:(\d+),filter:(\d+),tol:(\d+),seed:(\d+)\}",body)
assert len(rows)==6,rows
names=set()
for name,az,alt,filt,tol,seed in rows:
 az,alt,filt,tol=map(int,(az,alt,filt,tol)); assert name not in names; names.add(name)
 assert 0<=az<360 and 5<=alt<=85 and 0<=filt<=2 and 3<=tol<=6
# Emberdeck 1.3 structural campaign invariants.
assert "Gate <b id=\"node\">1</b>/5" in ember
for token in ["const RELICS={lantern:","thread:{name:'Iron Thread'","glass:{name:'Emberglass Lens'","state.node>=4","event:'route-mastered'","meta.routes.length===2","Sunspike","Ashveil"]: assert token in ember,token
foes=re.search(r'const foes=\{(.*?)\};',ember,re.S).group(1)
for foe in ['hound','glass','iron','wisp','anvil','saint']: assert foe+':' in foes
print(json.dumps({'starTargets':len(rows),'emberGates':5,'emberRelics':3,'emberFoes':6,'dualRouteMastery':True}))
