from pathlib import Path
import re,json
S=Path('games/strata-cipher/index.html').read_text();A=Path('games/ashfall-caravan/index.html').read_text()
body=re.search(r'const SITES=\[(.*?)\];\nconst N=',S,re.S).group(1)
sites=[]
for block in re.findall(r'\[(.*?)\]',body,re.S):
 rows=re.findall(r'"([.AX]+)"',block)
 if rows: sites.append(rows)
assert len(sites)==6,len(sites)
for site in sites:
 assert len(site)==6 and all(len(r)==6 for r in site),site
 flat=''.join(site); assert flat.count('A')==3,flat; assert flat.count('X')==4,flat
assert 'function signal(x,y)' in S and "event:'survey-complete'" in S and "event:'delicate-excavation'" in S and 'totalIntegrity>=48' in S
scene_body=re.search(r'const scenes=\[(.*?)\];\nconst CONTRACTS=',A,re.S).group(1)
assert scene_body.count("{t:")==12,scene_body.count("{t:")
for token in ["relief:{name:'Relief Run'","survey:{name:'Survey Run'","courier:{name:'Courier Run'","contracts:Array.isArray(m.contracts)?m.contracts:[]","event:'contract-mastered'","meta.contracts.length===3","event:success?'journey-complete':'journey-ended'"]:
 assert token in A,token
print(json.dumps({'strataSites':len(sites),'fragmentsPerSite':3,'faultsPerSite':4,'ashfallCrossings':12,'ashfallContracts':3,'backwardCompatibleMeta':True}))
