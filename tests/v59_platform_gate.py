from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
games_js = (ROOT / 'js/games.js').read_text()
index = (ROOT / 'index.html').read_text()
detail = (ROOT / 'game.html').read_text()
styles = (ROOT / 'assets/styles.css').read_text()

ids = re.findall(r"id:'([^']+)'", games_js)
assert len(ids) == 82, len(ids)
assert len(set(ids)) == 82
for game_id in ids:
    assert (ROOT / 'games' / game_id / 'index.html').exists(), game_id
    assert (ROOT / 'covers' / f'{game_id}.svg').exists(), game_id

assert 'js/games.js?v59' in index
assert 'js/app.js?v59' in index
assert 'js/games.js?v59' in detail
assert 'game-grid' in styles or 'gameGrid' in index

print({'games':82,'catalogPaths':'pass','v59CacheBusters':'pass','platformShell':'pass'})
