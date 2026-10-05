from pathlib import Path
import re, json
ROOT=Path(__file__).resolve().parents[1]
src=(ROOT/'games/ironlight-breach/index.html').read_text()
for token in ['meta-v4','meta-v3','warden','overseer','combat-chain','overseer-downed','gamepad()','window.__ironlight','P pauses','OVERSEER DOWN']:
    assert token in src,token
chunk=src.split('const levels=[',1)[1].split('];',1)[0]
rows=re.findall(r"'([^']+)'",chunk)
levels=[rows[i:i+18] for i in range(0,len(rows),18)]
assert len(levels)==5
assert all(len(row)==19 for level in levels for row in level)
assert any('W' in row for row in levels[2]) and any('W' in row for row in levels[3])
assert sum(row.count('O') for row in levels[4])==1
for invariant in [
    "type==='overseer'?18:type==='warden'?7",
    "shots=e.type==='overseer'?[-.12,0,.12]:[0]",
    "damage=e.type==='overseer'?12:e.type==='warden'?10:16",
    "killstreak>=8",
    "const bossAlive=enemies.some(e=>e.type==='overseer'&&e.hp>0)",
    "meta.bestStreak",
    "meta.overseers",
    "paused=!paused",
]:
    assert invariant in src,invariant
print(json.dumps({'version':'4.0','sectors':5,'eliteWardens':2,'finalBoss':'overseer','bossVolley':3,'combatChain':8,'sourceInvariants':'pass'}))
