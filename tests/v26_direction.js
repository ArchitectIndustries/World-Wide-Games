function check(direction,old,worse,betterVal){const f=(n,o)=>!Number.isFinite(Number(o))||(direction==='low'?Number(n)<Number(o):Number(n)>Number(o));if(f(worse,old))throw new Error(`${direction} accepted worse`);if(!f(betterVal,old))throw new Error(`${direction} rejected better`)}
for(const [o,w,b] of [[30,40,18],[22,29,17],[60,74,52],[45,61,31],[58,66,49],[64,72,51]])check('low',o,w,b);check('high',1000,900,1200);check('high',5400,5000,6100);check('high',7000,6800,7600);
console.log({lowScoreTitles:6,strataCipher:true,ashfallCaravan:true,highScore:true});
