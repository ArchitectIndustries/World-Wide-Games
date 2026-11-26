// Focus-contract tests execute the production focus/render functions against a
// minimal DOM boundary. They do not replace keyboard checks in a real browser.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../../games/tabletop-commons/game.js'),'utf8');
const focusSource=source.slice(source.indexOf('function humanTurn()'),source.indexOf('function finish('));
const renderSource=source.slice(source.indexOf('function render()'),source.indexOf('function humanDomino('));
function fixture(kind='four'){
  const doc={body:{name:'body'},documentElement:{name:'html'},activeElement:null};doc.activeElement=doc.body;
  const elements={};
  function button(name,disabled=false){return{name,disabled,focus(){if(!this.disabled)doc.activeElement=this;}};}
  for(const id of ['playLeft','playRight','draw','game','start'])elements[id]=button(id);
  for(const id of ['turnName','turnMark','localRecord'])elements[id]={textContent:'',style:{}};
  elements.hand={children:[],querySelectorAll(){return this.children;}};
  const context={document:doc,kind,local:false,phase:'playing',turn:1,selected:-1,focusReturn:null,routeRender:()=>{},cellButtons:[],name:p=>p===1?'You':'Computer',record:()=>({}),$:id=>elements[id]};
  context.boardRender=()=>{
    if(context.cellButtons.includes(doc.activeElement))doc.activeElement=doc.body;
    context.cellButtons=Array.from({length:kind==='checkers'?64:42},(_,i)=>button('cell-'+i,kind==='checkers'&&(Math.floor(i/8)+i%8)%2===0));
  };
  context.dominoRender=()=>{
    if(kind!=='domino')return;
    if(elements.hand.children.includes(doc.activeElement))doc.activeElement=doc.body;
    elements.hand.children=context.turn===1||context.local?[button('tile-0'),button('tile-1')]:[];
    elements.playLeft.disabled=true;elements.playRight.disabled=true;
    elements.draw.disabled=context.turn!==1||context.canPlayDomino!==false;
  };
  vm.createContext(context);vm.runInContext(focusSource+'\n'+renderSource,context);context.boardRender();context.dominoRender();return{context,doc,elements};
}
test('Checkers initial focus falls back to an enabled dark square',()=>{
  const f=fixture('checkers');f.context.focusBoard(0);assert.equal(f.doc.activeElement.name,'cell-1');assert.equal(f.doc.activeElement.disabled,false);
});
test('Board focus survives a computer turn that replaces every square',()=>{
  const f=fixture();f.context.cellButtons[35].focus();f.context.turn=2;f.context.render();assert.equal(f.doc.activeElement,f.doc.body);assert.equal(f.context.focusReturn.index,35);
  f.context.turn=1;f.context.render();assert.equal(f.doc.activeElement.name,'cell-35');assert.equal(f.context.focusReturn,null);
});
test('A selector chosen during the computer turn keeps focus when the board returns',()=>{
  const f=fixture();f.context.cellButtons[35].focus();f.context.turn=2;f.context.render();f.elements.game.focus();f.context.turn=1;f.context.render();assert.equal(f.doc.activeElement,f.elements.game);assert.equal(f.context.focusReturn,null);
});
test('Terminal render and later focus requests cannot steal focus from replay',()=>{
  const f=fixture('checkers');f.context.phase='over';f.elements.start.focus();f.context.render();f.context.focusBoard(35);assert.equal(f.doc.activeElement,f.elements.start);
});
test('A domino action returns focus to the new hand after the computer turn',()=>{
  const f=fixture('domino');f.elements.playRight.disabled=false;f.elements.playRight.focus();f.context.turn=2;f.context.render();assert.equal(f.context.focusReturn.kind,'hand');f.context.turn=1;f.context.render();assert.equal(f.doc.activeElement.name,'tile-0');
});
test('Repeated legal Draw activation stays focused while the player still needs tiles',()=>{
  const f=fixture('domino');f.context.canPlayDomino=false;f.elements.draw.disabled=false;f.elements.draw.focus();f.context.render();assert.equal(f.doc.activeElement,f.elements.draw);assert.equal(f.context.focusReturn,null);
});

const E=require('../../games/tabletop-commons/engine.js');
const choiceSource=source.slice(source.indexOf('function routeKey('),source.indexOf('function routeRender('));
function routeFixture(){
  const board=Array(64).fill(0);board[51]=1;for(const i of [42,26,44,28])board[i]=2;
  const played=[],announcements=[],focus={count:0};
  const context={E,board,turn:1,phase:'playing',kind:'checkers',local:false,selected:51,moves:[],routeChoices:[],generation:4,humanTurn:()=>true,render:()=>{},say:s=>announcements.push(s),focusBoard:()=>{},playLine:()=>{},doCheckers:m=>played.push(m),$:()=>({querySelector:()=>({focus:()=>focus.count++})})};
  vm.createContext(context);vm.runInContext(choiceSource,context);return{context,board,played,announcements,focus};
}
test('An ambiguous Checkers destination opens choices without applying either route',()=>{
  const f=routeFixture(),before=[...f.board];f.context.clickCell(19);assert.equal(f.played.length,0);assert.equal(f.context.routeChoices.length,2);assert.deepEqual(f.board,before);assert.equal(f.focus.count,1);assert.match(f.announcements[0],/2 capture routes/);
});
test('Only an explicit current legal route choice can apply the selected capture sequence',()=>{
  const f=routeFixture();f.context.clickCell(19);const selected=f.context.routeChoices[1],stamp=f.context.boardStamp();f.context.chooseRoute(selected,stamp,4);assert.equal(f.played.length,1);assert.deepEqual(f.played[0].captured,[44,28]);
  f.context.chooseRoute(selected,stamp,3);f.context.chooseRoute(selected,'stale board',4);f.context.routeChoices=[];f.context.chooseRoute(selected,stamp,4);assert.equal(f.played.length,1);
});
