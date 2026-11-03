"""Aegis Verge: restarting (R) or selecting an operation (1-3) while the
operation-complete overlay is open must close that overlay, so the restarted
run is visible and Continue cannot skip past it.

Added by the daily studio automation.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / 'games/aegis-verge/index.html').as_uri()
CHROME = os.environ.get('WWG_CHROMIUM') or next(
    (p for p in ('/usr/bin/chromium', '/opt/pw-browsers/chromium') if Path(p).exists()), None)


def finish_operation(page):
    page.evaluate('window.__aegisVerge.start()')
    page.evaluate('window.__aegisVerge.destroyCore()')
    assert page.evaluate('window.__aegisVerge.state().finished')
    assert page.locator('#done').is_visible()


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=CHROME,
                                 args=['--no-sandbox', '--disable-gpu'])
    page = browser.new_page(viewport={'width': 960, 'height': 700})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL)
    page.wait_for_function('!!window.__aegisVerge')

    # R while the results overlay is open restarts the same operation and hides the overlay.
    finish_operation(page)
    page.keyboard.press('KeyR')
    s = page.evaluate('window.__aegisVerge.state()')
    assert not s['finished'] and s['op'] == 0 and s['relay'] == 0, s
    assert not page.locator('#done').is_visible(), 'results overlay still covers the restarted run'
    # Continue is no longer reachable, so it cannot advance past a run in progress.
    assert page.evaluate('window.__aegisVerge.state().op') == 0

    # Digit selection while the overlay is open does the same.
    finish_operation(page)
    page.keyboard.press('Digit2')
    s = page.evaluate('window.__aegisVerge.state()')
    assert not s['finished'] and s['op'] == 1, s
    assert not page.locator('#done').is_visible(), 'results overlay still covers the selected operation'

    # Normal Continue flow is unchanged: finish op 2, Continue advances to op 3.
    finish_operation(page)
    page.click('#continue')
    s = page.evaluate('window.__aegisVerge.state()')
    assert s['op'] == 2 and not s['finished'], s
    assert not page.locator('#done').is_visible()

    assert not errors, errors
    browser.close()
print({'aegisVergeOverlayReset': 'pass'})
