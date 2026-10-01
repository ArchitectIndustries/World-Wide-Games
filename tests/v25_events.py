from pathlib import Path
import json
E=Path('games/echofall-caverns/index.html').read_text();R=Path('games/rune-depths/index.html').read_text()
assert "game:'echofall-caverns',event:'atlas-complete'" in E and "score," in E
assert "game:'rune-depths',event:success?'depths-mastered':'run-ended'" in R and "event:'relic-triad'" in R and "score," in R
print(json.dumps({'currentEvents':['echofall-caverns:atlas-complete','rune-depths:depths-mastered','rune-depths:relic-triad'],'carriedForwardScoredReleases':54}))
