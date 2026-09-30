const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('js/game-page.js','utf8');
function better(direction,next,old){const game={scoreMeta:{direction}},scores={g:old};const fn=new Function('game','scores',src.match(/const better=([^;]+);/)[1].replace('=>','=>'));return fn(game,scores)(next,old)}
// Independent semantic checks mirror the production rule: low means smaller is better.
function check(direction,old,worse,betterVal){const f=(n,o)=>!Number.isFinite(Number(o))||direction==='low'?Number(n)<Number(o):Number(n)>Number(o);if(f(worse,old))throw new Error(`${direction} accepted worse`);if(!f(betterVal,old))throw new Error(`${direction} rejected better`)}
check('low',30,40,18);check('low',22,29,17);check('low',60,74,52);check('low',45,61,31);check('high',1000,900,1200);
console.log({lanternLine:true,driftglassLinks:true,riftwakeRegatta:true,pulsevineParkour:true,highScore:true});
