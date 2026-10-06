from pathlib import Path

root=Path(__file__).resolve().parents[1]
game=(root/'games/parallax-accord/index.html').read_text(errors='ignore')
catalog=(root/'js/games.js').read_text(errors='ignore')
checks=[
    "st.won=you>=2;st.draw=!st.won&&ai<2",
    "Accord deadlocked",
    "The Accord requires two district wins",
    "version:'1.1'",
]
for check in checks[:3]:
    assert check in game, check
assert "id:'parallax-accord'" in catalog and "version:'1.1'" in catalog
print({'parallax11':'pass','majorityRule':'present','deadlockRule':'present'})
