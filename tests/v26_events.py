from pathlib import Path
import json
S=Path('games/strata-cipher/index.html').read_text();A=Path('games/ashfall-caravan/index.html').read_text()
assert "game:'strata-cipher',event:'survey-complete'" in S and "event:'delicate-excavation'" in S and 'score,' in S
assert "game:'ashfall-caravan',event:success?'journey-complete':'journey-ended'" in A and "event:'contract-mastered'" in A and 'score,' in A
print(json.dumps({'currentEvents':['strata-cipher:survey-complete','strata-cipher:delicate-excavation','ashfall-caravan:journey-complete','ashfall-caravan:contract-mastered'],'scoredReleases':55}))
