const fs=require('fs'),vm=require('vm');
function el(){return{textContent:'',innerHTML:'',src:'',alt:'',href:'',hidden:false,classList:{toggle(){},add(){},remove(){}},style:{setProperty(){}},addEventListener(type,fn){this['on'+type]=fn},requestFullscreen(){}}}
const els={};const ids=['gameGenre','inputBadges','remapNote','gameTitle','gameDescription','gameCover','controlsList','gameDate','gameBadge','footerGame','gameFrame','favoriteButton','restartFrameButton','fullscreenButton','gameFrameWrap','shareButton','localBest','runSummary','ratingControl','ratingNote'];for(const id of ids)els[id]=el();
els.gameFrame.contentWindow={};
const listeners={};const store={'wwg:scores':JSON.stringify({'lantern-line':30})};
const context={console,Math,Date,JSON,URLSearchParams,window:null,location:{search:'?id=lantern-line',protocol:'http:',href:'http://local/game.html?id=lantern-line'},navigator:{},document:{documentElement:{classList:{toggle(){}},style:{setProperty(){}}},querySelector(s){return s[0]==='#'?els[s.slice(1)]||el():el()},querySelectorAll(){return[]}},localStorage:{getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},setTimeout(fn){fn()},clearTimeout(){}};context.window=context;context.globalThis=context;
vm.createContext(context);vm.runInContext(fs.readFileSync('js/games.js','utf8'),context);vm.runInContext(fs.readFileSync('js/game-page.js','utf8'),context);
const send=score=>{for(const fn of listeners.message||[])fn({source:els.gameFrame.contentWindow,data:{type:'wwg:game-event',game:'lantern-line',event:'route-complete',score,meta:{direction:'low',unit:'sec'}}})};
if(!els.localBest.textContent.includes('lower is better'))throw new Error('missing low-direction hint');
send(40);let scores=JSON.parse(store['wwg:scores']);if(scores['lantern-line']!==30)throw new Error('worse low score replaced best');
send(18);scores=JSON.parse(store['wwg:scores']);if(scores['lantern-line']!==18)throw new Error('better low score did not replace best');
console.log(JSON.stringify({initial:30,worseRejected:40,bestAccepted:scores['lantern-line'],label:els.localBest.textContent}));
