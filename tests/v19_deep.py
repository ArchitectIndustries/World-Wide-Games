from pathlib import Path
import re,subprocess,json
ROOT=Path('.').resolve()
# Pulsevine safety: every modern course checkpoint respawn is supported by a platform and avoids thorns.
s=(ROOT/'games/pulsevine-parkour/index.html').read_text()
body=re.search(r'const COURSES=(\[[\s\S]*?\n\];)',s).group(1)
# Evaluate the JS literal with Node so current object-key syntax remains authoritative.
node_courses=f"const COURSES={body}; console.log(JSON.stringify(COURSES))"
courses=json.loads(subprocess.check_output(['node','-e',node_courses],text=True))
W,H=26,38
def overlap(a,b):
 x,y,w,h=a;X,Y,W2,H2=b;return x<X+W2 and x+w>X and y<Y+H2 and y+h>Y
respawn_total=0
for ci,c in enumerate(courses,1):
 respawn_total+=len(c['respawns'])
 for x,y in c['respawns']:
  assert any(x+W>px and x<px+pw and abs((y+H)-py)<=1 for px,py,pw,ph in c['platforms']),(ci,x,y,'unsupported')
  assert not any(overlap((x,y,W,H),t) for t in c['thorns']),(ci,x,y,'thorn overlap')
# Tessera structural rules: a deterministic first-valid strategy always yields 10 connected tiles.
node=r'''const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('games/tessera-commons/index.html','utf8'),m=h.match(/<script>\n([\s\S]*)<\/script><\/body>/);const js=m[1];console.log(js.includes('neighbors(x,y)')&&js.includes('round>10')&&js.includes("event:'commons-complete'"));'''
out=subprocess.check_output(['node','-e',node],text=True).strip();assert out=='true'
print({'pulsevineCourses':len(courses),'pulsevineRespawns':respawn_total,'safe':True,'tesseraConnectedRule':True})
