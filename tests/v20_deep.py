from pathlib import Path
import re,ast
# Independent authored-solvability check for Mirrormesh.
text=(Path('games/mirrormesh-relay/index.html')).read_text()
levels=[
{'src':[0,3,'R'],'target':[6,1],'mirrors':[[2,3,1],[2,1,1]],'beacons':[[2,2],[4,1]]},
{'src':[0,1,'R'],'target':[6,5],'mirrors':[[2,1,0],[2,4,1],[5,4,0],[5,5,1]],'beacons':[[2,3],[5,4]]},
{'src':[1,6,'U'],'target':[6,0],'mirrors':[[1,4,1],[4,4,1],[4,0,1]],'beacons':[[1,5],[4,2],[5,0]]},
{'src':[0,6,'R'],'target':[6,0],'mirrors':[[2,6,0],[2,2,1],[5,2,0],[5,0,1]],'beacons':[[2,5],[2,2],[5,2]]},
{'src':[6,6,'L'],'target':[0,0],'mirrors':[[4,6,1],[4,3,0],[1,3,1],[1,0,0]],'beacons':[[5,6],[4,3],[1,3]]},
{'src':[0,2,'R'],'target':[6,4],'mirrors':[[1,2,0],[1,5,1],[3,5,0],[3,1,1],[5,1,0],[5,4,1]],'beacons':[[1,4],[3,5],[3,2],[5,1],[5,4]]},
]
dirs={'R':(1,0),'L':(-1,0),'U':(0,-1),'D':(0,1)}
def slash(d,o): return ({'R':'U','U':'R','L':'D','D':'L'} if o==0 else {'R':'D','D':'R','L':'U','U':'L'})[d]
def win(L,bits):
 mm={(m[0],m[1]):bits[i] for i,m in enumerate(L['mirrors'])}; be=set(map(tuple,L['beacons'])); hit=set(); x,y,d=L['src']
 for _ in range(100):
  if (x,y) in be:hit.add((x,y))
  if [x,y]==L['target']: return len(hit)==len(be)
  dx,dy=dirs[d];x+=dx;y+=dy
  if not(0<=x<=6 and 0<=y<=6):return False
  if (x,y) in mm:d=slash(d,mm[(x,y)])
 return False
solutions=[]
for L in levels:
 found=[]
 for mask in range(1<<len(L['mirrors'])):
  bits=[(mask>>j)&1 for j in range(len(L['mirrors']))]
  if win(L,bits):found.append(bits)
 assert found, L
 solutions.append(found[0])
# Hushwave target domain and progression checks.
h=(Path('games/hushwave-operator/index.html')).read_text();m=re.search(r'const TARGETS=(\[\[.*?\]\]);',h)
assert m
T=ast.literal_eval(m.group(1));assert len(T)==6 and all(len(x)==3 and all(0<=v<=100 for v in x) for x in T)
assert 'a>=86' in h and 'band-decoded' in h
print({'mirrormeshRelays':len(levels),'solutions':solutions,'hushwaveSignals':len(T),'lockThreshold':86})
