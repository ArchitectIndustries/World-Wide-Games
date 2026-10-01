# Focused source-level event regression for v24 additions. Full browser completion lives in v24_quick.py.
from pathlib import Path
import json
star=Path('games/starfall-observatory/index.html').read_text();ember=Path('games/emberdeck-pilgrim/index.html').read_text()
assert "game:'starfall-observatory',event:'survey-complete'" in star
assert "game:'emberdeck-pilgrim',event:win?'pilgrimage-complete':'pilgrimage-ended'" in ember
assert "event:'route-mastered'" in ember
assert "score," in star and "score," in ember
print(json.dumps({'currentEvents':['starfall-observatory:survey-complete','emberdeck-pilgrim:pilgrimage-complete','emberdeck-pilgrim:route-mastered'],'carriedForwardScoredReleases':53}))
