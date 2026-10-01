from pathlib import Path
import json
F=Path('games/fluxward-conclave/index.html').read_text();C=Path('games/circuit-rush/index.html').read_text()
for event in ["event:'campaign-complete'","event:'campaign-won'","event:'triple-crown'","event:'duel-complete'"]: assert event in F,event
for event in ["event:'race-complete'","event:'race-won'"]: assert event in C,event
assert "score:s" in F and "score," in C
print(json.dumps({'newScoredRelease':'fluxward-conclave','scoredReleases':56,'newMilestones':['fluxward-conclave:campaign-won','fluxward-conclave:triple-crown','circuit-rush:race-won']}))
