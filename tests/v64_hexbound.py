from pathlib import Path

root = Path(__file__).resolve().parents[1]
src = (root / "games/hexbound-tactics/index.html").read_text(errors="ignore")
catalog = (root / "js/games.js").read_text(errors="ignore")

checks = [
    "const bothDestroyed=pcore<=0&&ecore<=0",
    "tied=bothDestroyed||pcore===ecore",
    "Both citadels fell in the same combat resolution. The match is a stalemate.",
    "if(win){let w=Number(localStorage.getItem('wwg:hexbound-wins')||0)+1",
]
for check in checks:
    assert check in src, check

assert "version: '1.1'" in catalog
assert "mutual destruction is a stalemate" in catalog
print({"hexbound11":"pass","mutualDestruction":"stalemate","falseWinCounter":"guarded"})
