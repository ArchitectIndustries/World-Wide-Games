"""Aetherfoil Circuit: once a touch is scored the exchange is halted, so a
lunge that was already in flight must not score a second touch before the
fighters reset.

Drives real bouts through the public test API with a fixed timestep and the
game's seeded RNG, so the run is deterministic. On the unfixed game several
"late" touches land 17-100 ms after the previous one.

Added by the daily studio automation.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / 'games/aetherfoil-circuit/index.html').as_uri()
CHROME = os.environ.get('WWG_CHROMIUM') or next(
    (p for p in ('/usr/bin/chromium', '/opt/pw-browsers/chromium') if Path(p).exists()), None)
HALT = 0.65  # seconds between a touch and the exchange reset

PLAY = '''([every, trade]) => {
  const A = window.__aetherfoil, DT = 1 / 60, late = [];
  A.start();
  let prev = A.state(), lastAward = -9, t = 0;
  for (let i = 0; i < 60 * 240; i++) {
    const s = A.state();
    if (s.phase !== 'play') {
      if (s.phase === 'campaign') break;
      A.continueFlow(); lastAward = -9; prev = A.state(); continue;
    }
    const gap = s.rival.x - s.player.x;
    dispatchEvent(new KeyboardEvent(gap > 150 ? 'keydown' : 'keyup', {code: 'ArrowRight'}));
    if (gap < 170 && i % every === 0) A.attack();
    if (trade && s.rival.attack > 0) A.attack();
    A.step(DT); t += DT;
    const n = A.state();
    if (n.ps !== prev.ps || n.rs !== prev.rs) {
      if (t - lastAward < HALT_S) late.push({bout: n.boutIndex + 1, after: +(t - lastAward).toFixed(3), score: [n.ps, n.rs], before: [prev.ps, prev.rs]});
      lastAward = t;
    }
    prev = n;
  }
  return {late, phase: A.state().phase};
}'''.replace('HALT_S', str(HALT))

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=CHROME,
                                 args=['--no-sandbox', '--disable-gpu'])
    page = browser.new_page(viewport={'width': 960, 'height': 600})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for every in (3, 7, 11):
        for trade in (False, True):
            page.goto(URL)
            page.wait_for_function('!!window.__aetherfoil')
            page.evaluate("localStorage.removeItem('wwg:aetherfoil-circuit')")
            r = page.evaluate(PLAY, [every, trade])
            assert r['phase'] == 'campaign', r
            assert not r['late'], f'touch scored during the halt (every={every}, trade={trade}): {r["late"]}'
    assert not errors, errors
    browser.close()
print({'aetherfoilTouchAfterHalt': 'pass'})
