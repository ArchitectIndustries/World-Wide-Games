const fs=require('fs');
const hex=fs.readFileSync('games/hexbound-tactics/index.html','utf8');
if(!hex.includes('const bothDestroyed=pcore<=0&&ecore<=0')) throw new Error('stalemate guard');
if(!hex.includes('Both citadels fell in the same combat resolution')) throw new Error('stalemate text');
console.log(JSON.stringify({release:'v64',status:'pass'}));
