from pathlib import Path
import re,json,collections
E=Path('games/echofall-caverns/index.html').read_text(); R=Path('games/rune-depths/index.html').read_text()
body=re.search(r'const MAPS=\[(.*?)\];\nconst C=',E,re.S).group(1)
maps=[]
for block in re.findall(r'\[(.*?)\]',body,re.S):
 rows=re.findall(r'"([#P123E.]+)"',block)
 if rows: maps.append(rows)
assert len(maps)==6,len(maps)
for m in maps:
 assert len(m)==15 and all(len(r)==15 for r in m)
 pts={};
 for y,row in enumerate(m):
  for x,ch in enumerate(row):
   if ch in 'P123E': pts[ch]=(x,y)
 assert set(pts)==set('P123E'),pts
 def path(a,b):
  q=collections.deque([a]);seen={a}
  while q:
   x,y=q.popleft()
   if (x,y)==b:return True
   for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
    n=(x+dx,y+dy)
    if n not in seen and 0<=n[0]<15 and 0<=n[1]<15 and m[n[1]][n[0]]!='#':seen.add(n);q.append(n)
  return False
 cur=pts['P']
 for target in '123E': assert path(cur,pts[target]),(target,m);cur=pts[target]
for token in ['const RUN_DEPTHS=5','heart:{name:\'Heart Rune\'','edge:{name:\'Edge Rune\'','flask:{name:\'Flask Rune\'','types=[\'shade\',\'shade\',\'wisp\',\'brute\']',"event:success?'depths-mastered':'run-ended'","event:'relic-triad'","meta.forged.length===3"]: assert token in R,token
print(json.dumps({'echoChambers':len(maps),'echoTargetsPerChamber':3,'runeDepths':5,'runeRelics':3,'runeEnemyTypes':3,'persistentRelicTriad':True}))
