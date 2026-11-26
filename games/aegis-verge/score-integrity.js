/* Aegis Verge F3D61: first-party competitive record eligibility boundary.
 * The game is client-side and this is local record integrity, NOT anti-cheat.
 * Progression/unlocks remain available from genuine unranked practice clears.
 */
(function(root){
 'use strict';
 function eligible(rankedRun,chainWins,operation){
  return rankedRun===true&&Number.isInteger(operation)&&operation>=0&&operation<3&&chainWins===operation;
 }
 function record(meta,operation,points,qualified){
  if(!qualified||!meta||!Array.isArray(meta.best)||!Number.isInteger(operation)||operation<0||operation>=3||!Number.isFinite(points)||points<0)return false;
  const n=Math.min(100000000,Math.round(points));
  const prior=Number.isSafeInteger(meta.best[operation])&&meta.best[operation]>=0?meta.best[operation]:0;
  if(n<=prior)return false;
  meta.best[operation]=n;
  return true;
 }
 const api=Object.freeze({eligible,record});
 root.AegisScoreIntegrity=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
