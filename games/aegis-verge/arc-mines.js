/* Architect Industries original capacitor-mine encounter, F3D10.
 * Time-based and deterministic; visual warning and proximity have the same
 * coordinates as the player collision/damage checks. No score events.
 */
(function(root){
'use strict';
const COUNT=3,HP=2,TRIGGER=4.1,BLAST=4.6,WARNING=1.35,DAMAGE=15;
const defaults=()=>[HP,HP,HP];
const validHp=a=>Array.isArray(a)&&a.length===COUNT&&[0,1,2].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&Number.isSafeInteger(a[i])&&a[i]>=0&&a[i]<=HP);
function create(sites,health){
 if(!Array.isArray(sites)||sites.length!==COUNT||!sites.every(q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.z)))throw Error('invalid mine sites');
 if(health!==undefined&&!validHp(health))throw Error('invalid mine checkpoint');
 return {sites:sites.map(q=>Object.freeze({x:q.x,z:q.z})),hp:health?[...health]:defaults(),phase:['idle','idle','idle'],left:[0,0,0]};
}
function snapshot(s){return [...s.hp]}
function hit(s,index,amount=1){
 if(!s||!Number.isSafeInteger(index)||index<0||index>=COUNT||!Number.isFinite(amount)||amount<=0||s.hp[index]<=0)return {hit:false,disabled:false};
 const previous=s.hp[index];s.hp[index]=Math.max(0,previous-Math.min(amount,HP));
 const disabled=s.hp[index]===0;if(disabled){s.phase[index]='spent';s.left[index]=0;}
 return {hit:true,disabled,hp:s.hp[index]};
}
function intercept(s,index,ax,az,bx,bz,segmentCircle){
 if(!s||s.hp[index]<=0)return null;
 const q=s.sites[index],t=segmentCircle(ax,az,bx,bz,q.x,q.z,1.35);
 return t===null?null:{index,t,x:ax+(bx-ax)*t,z:az+(bz-az)*t};
}
function tick(s,index,x,z,dt){
 if(!s||!Number.isSafeInteger(index)||index<0||index>=COUNT||s.hp[index]<=0||!Number.isFinite(dt)||dt<0)return null;
 const q=s.sites[index];
 if(s.phase[index]==='idle'&&Math.hypot(x-q.x,z-q.z)<=TRIGGER){s.phase[index]='warning';s.left[index]=WARNING;return 'warning';}
 if(s.phase[index]==='warning'){
  s.left[index]=Math.max(0,s.left[index]-dt);
  if(s.left[index]<=0){s.hp[index]=0;s.phase[index]='spent';return 'blast';}
 }
 return null;
}
// Single authoritative world-space blast query for the rig and live hostiles.
// Cover is queried on each detonation, so previously breached barricades no longer protect.
// A spent mine may be queried exactly once at its 'blast' transition; no ambient damage loop.
function blastTargets(s,index,actors,occluded){
 if(!s||!Number.isSafeInteger(index)||index<0||index>=COUNT||!Array.isArray(actors)||typeof occluded!=='function')return [];
 const site=s.sites[index];
 return actors.filter(actor=>actor&&!actor.dead&&Number.isFinite(actor.x)&&Number.isFinite(actor.z)&&
  Math.hypot(actor.x-site.x,actor.z-site.z)<=BLAST&&!occluded(site,actor));
}
// Exposed structural cover takes real blast damage; first collision must be the target wall.
// The caller resolves actors before altering any live cover, preserving pre-blast shielding.
function blastCover(s,index,blocks,firstCover,breachableIds){
 if(!s||!Number.isSafeInteger(index)||index<0||index>=COUNT||!Array.isArray(blocks)||
    typeof firstCover!=='function'||!Array.isArray(breachableIds))return [];
 const origin=s.sites[index],ids=new Set(breachableIds);
 return blocks.filter(b=>{
  if(!b||!ids.has(b.id)||![b.x,b.z,b.w,b.d].every(Number.isFinite)||b.w<=0||b.d<=0)return false;
  const nearX=Math.max(b.x-b.w/2,Math.min(origin.x,b.x+b.w/2));
  const nearZ=Math.max(b.z-b.d/2,Math.min(origin.z,b.z+b.d/2));
  if(Math.hypot(nearX-origin.x,nearZ-origin.z)>BLAST)return false;
  const first=firstCover(origin.x,origin.z,b.x,b.z,blocks,.02);
  return !!first&&first.block.id===b.id;
 });
}
const api=Object.freeze({COUNT,HP,TRIGGER,BLAST,WARNING,DAMAGE,validHp,create,snapshot,hit,intercept,tick,blastTargets,blastCover});
root.AegisArcMines=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
