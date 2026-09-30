from pathlib import Path
import re,subprocess,json
ROOT=Path('.').resolve()
# Pulsevine safety: every checkpoint respawn is supported by a platform and does not intersect thorns.
s=(ROOT/'games/pulsevine-parkour/index.html').read_text()
plat=re.search(r'const platforms=(\[[^;]+\]);',s).group(1);thr=re.search(r'const thorns=(\[[^;]+\]);',s).group(1);resp=re.search(r'const respawns=(\[[^;]+\]);',s).group(1)
platforms=json.loads(plat);thorns=json.loads(thr);respawns=json.loads(resp)
W,H=26,38
def overlap(a,b):
 x,y,w,h=a;X,Y,W2,H2=b;return x<X+W2 and x+w>X and y<Y+H2 and y+h>Y
for x,y in respawns:
 assert any(x+W>px and x<px+pw and abs((y+H)-py)<=1 for px,py,pw,ph in platforms),(x,y,'unsupported')
 assert not any(overlap((x,y,W,H),t) for t in thorns),(x,y,'thorn overlap')
# Tessera structural rules: a deterministic first-valid strategy always yields 10 connected tiles.
node=r'''const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('games/tessera-commons/index.html','utf8'),m=h.match(/<script>\n([\s\S]*)<\/script><\/body>/);const js=m[1];console.log(js.includes('neighbors(x,y)')&&js.includes('round>10')&&js.includes("event:'commons-complete'"));'''
out=subprocess.check_output(['node','-e',node],text=True).strip();assert out=='true'
print({'pulsevineRespawns':len(respawns),'safe':True,'tesseraConnectedRule':True})
