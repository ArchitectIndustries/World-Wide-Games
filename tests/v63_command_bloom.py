from pathlib import Path
from collections import deque

ROOT = Path(__file__).resolve().parents[1]
GAME = (ROOT / "games/command-bloom/index.html").read_text(errors="ignore")

for token in [
    'id="solved"',
    'cleared=new Set()',
    'cleared.size===levels.length',
    'cleared.size!==levels.length',
    'program-complete',
    "cleared.has(Number(b.dataset.level))",
]:
    assert token in GAME, token

levels = [
    {"s":[1,6,0],"g":[6,1],"c":[[3,6]],"w":[[4,4],[4,5]]},
    {"s":[1,1,1],"g":[6,6],"c":[[5,1],[6,4]],"w":[[3,2],[3,3],[3,4],[5,5]]},
    {"s":[6,1,2],"g":[1,6],"c":[[4,3],[2,5]],"w":[[5,2],[5,3],[3,4],[2,4]]},
    {"s":[1,6,0],"g":[6,1],"c":[[2,3],[5,5],[5,2]],"w":[[3,3],[4,3],[3,4],[4,4]]},
    {"s":[1,1,1],"g":[6,6],"c":[[2,6],[6,2],[4,5]],"w":[[2,2],[3,2],[4,2],[5,4],[5,5]]},
    {"s":[6,6,3],"g":[1,1],"c":[[6,3],[4,1],[2,4]],"w":[[3,3],[4,3],[5,3],[3,5],[4,5]]},
]

def shortest(level):
    cores={tuple(c):i for i,c in enumerate(level["c"])}
    full=(1<<len(cores))-1
    start=(level["s"][0],level["s"][1],level["s"][2],0)
    q=deque([(start,0)]); seen={start}
    while q:
        (x,y,d,mask),steps=q.popleft()
        if mask==full and [x,y]==level["g"]:
            return steps
        for cmd in "FLRP":
            nx,ny,nd,nm=x,y,d,mask
            if cmd=="L": nd=(d+3)%4
            elif cmd=="R": nd=(d+1)%4
            elif cmd=="P":
                if (x,y) in cores: nm=mask|(1<<cores[(x,y)])
            else:
                dx,dy=[(0,-1),(1,0),(0,1),(-1,0)][d]
                tx,ty=x+dx,y+dy
                if 0<=tx<8 and 0<=ty<8 and [tx,ty] not in level["w"]:
                    nx,ny=tx,ty
            state=(nx,ny,nd,nm)
            if state not in seen:
                seen.add(state); q.append((state,steps+1))
    return None

paths=[shortest(level) for level in levels]
assert paths == [13,13,16,22,27,24], paths
print({"commandBloomIntegrity":"pass","shortest":paths})
