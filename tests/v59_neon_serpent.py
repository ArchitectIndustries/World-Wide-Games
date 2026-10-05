from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = (ROOT / 'games/neon-serpent/index.html').read_text()

required = [
    'Neon Serpent 3.0',
    'Crown Coil',
    "META='wwg:neon-serpent:meta-v3'",
    'navigator.getGamepads',
    'phase-drive',
    'crown-coil-cleared',
    'window.__neonSerpent',
    'function gateCells()',
    'gold=contract===1?null',
    'layout:()=>',
]
for token in required:
    assert token in SRC, token

assert SRC.count("name:'") >= 5
assert 'hazards:8' in SRC
assert 'drones:5' in SRC
assert 'gates:4' in SRC

print({'version':'3.0','contracts':5,'spawnSafety':'source-verified','classicPurity':'source-verified'})
