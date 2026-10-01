from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('.').resolve(); INPUT=(ROOT/'assets/wwg-input.js').read_text(); HTML=(ROOT/'games/fluxward-conclave/index.html').read_text().replace('<script src="../../assets/wwg-input.js"></script>',f'<script>{INPUT}</script>')
PRE="""<script>const __s={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(__s,k)?__s[k]:null,setItem:(k,v)=>__s[k]=String(v),removeItem:k=>delete __s[k]},configurable:true});window.__events=[];const __realParent=window.parent;Object.defineProperty(window,'parent',{value:{postMessage:(m)=>{if(m&&m.type==='wwg:game-event')window.__events.push(m)}},configurable:true});</script>"""
i=HTML.lower().find('<script'); HTML=HTML[:i]+PRE+HTML[i:]
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    p=b.new_page(viewport={'width':1100,'height':820}); p.set_content(HTML); p.wait_for_timeout(80)
    assert p.locator('#modeBtn').inner_text()=='SOLO CAMPAIGN'
    assert p.evaluate('board.length')==7 and p.evaluate('board[6][0].owner')==0
    box=p.locator('#c').bounding_box(); assert box
    def click_cell(x,y): p.mouse.click(box['x']+(x+.5)*box['width']/7,box['y']+(y+.5)*box['height']/7)
    click_cell(0,6); assert p.evaluate('selected && selected.x===0 && selected.y===6')
    click_cell(1,6); p.wait_for_timeout(30); assert p.evaluate('board[6][1].owner')==0
    assert int(p.locator('#ap').inner_text())==1
    # A strength-3 pulse converts a weaker orthogonal rival.
    p.evaluate("current=0;actions=2;cursor={x:0,y:6};board[6][0].charge=2;board[6][1].owner=1;board[6][1].charge=1;secondary()")
    assert p.evaluate('board[6][1].owner')==0 and p.evaluate('board[6][0].charge')==1
    # Keyboard navigation is live through the shared remappable input layer.
    before=p.evaluate('({x:cursor.x,y:cursor.y})'); p.keyboard.press('ArrowUp'); after=p.evaluate('({x:cursor.x,y:cursor.y})'); assert after['y']!=(before['y'])
    # Local pass-and-play mode resets cleanly and exposes the same board loop.
    p.locator('#modeBtn').click(); assert p.locator('#modeBtn').inner_text()=='LOCAL DUEL'; assert p.evaluate("mode")=='local'
    p.evaluate('endTurn()'); assert p.evaluate('current')==1
    # Force a final campaign match through public game logic and verify standardized events.
    p.evaluate("mode='ai';arenaIndex=2;campaignWins=[2,0];campaignScore=[400,100];buildArena();for(let y=0;y<7;y++)for(let x=0;x<7;x++){const c=board[y][x];if(!c.wall){c.owner=0;c.charge=2}}campaignWins=[2,0];campaignScore=[400,100];finishMatch()")
    events=p.evaluate('window.__events')
    names=[e['event'] for e in events]
    assert 'campaign-complete' in names and 'campaign-won' in names and 'triple-crown' in names
    complete=[e for e in events if e['event']=='campaign-complete'][-1]; assert isinstance(complete['score'],(int,float)) and complete['score']>0
    p.close()
    m=b.new_page(viewport={'width':390,'height':844}); m.set_content(HTML); m.wait_for_timeout(50)
    dims=m.evaluate("({w:document.documentElement.scrollWidth,v:innerWidth,c:document.querySelector('#c').getBoundingClientRect().width})")
    assert dims['w']<=dims['v']+1 and dims['c']<=dims['v']
    m.close(); b.close()
print({'fluxward':'pointer expansion + pulse conversion + remapped keyboard + local turn + campaign events','mobile':'no horizontal overflow'})
