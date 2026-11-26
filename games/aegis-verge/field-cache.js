/* Architect Industries — original field-salvage channel, F3D18.
 * Three once-per-operation repair/energy modules. The channel is a real-world
 * interaction, interrupted by motion, shield use or hull damage. No score.
 * Used stations alone survive the cleared-relay checkpoint boundary.
 */
(function(root){
'use strict';
const COUNT=3, RADIUS=3.2, CHANNEL=1.35, HEAL=22, CHARGE=32;
const valid=a=>Array.isArray(a)&&a.length===COUNT&&[0,1,2].every(i=>Object.prototype.hasOwnProperty.call(a,i)&&typeof a[i]==='boolean');
function create(sites,used){
 if(!Array.isArray(sites)||sites.length!==COUNT||!sites.every(s=>s&&Number.isFinite(s.x)&&Number.isFinite(s.z)))throw Error('invalid field-cache sites');
 if(used!==undefined&&!valid(used))throw Error('invalid field-cache checkpoint');
 return {sites:sites.map(s=>Object.freeze({x:s.x,z:s.z})),used:used?[...used]:[false,false,false],channel:-1,left:0,anchor:null,hullAt:0};
}
const snapshot=s=>[...s.used];
function visible(s,index,player,blocks,firstCover){
 const site=s?.sites?.[index];return !!site&&!!player&&Number.isFinite(player.x)&&Number.isFinite(player.z)&&
  Math.hypot(player.x-site.x,player.z-site.z)<=RADIUS&&
  !(typeof firstCover==='function'&&firstCover(player.x,player.z,site.x,site.z,blocks||[],.08));
}
function ready(s,index,player,blocks,firstCover){
 return Number.isInteger(index)&&index>=0&&index<COUNT&&s.channel===-1&&!s.used[index]&&
  (player.hull<100||player.energy<95)&&visible(s,index,player,blocks,firstCover);
}
function begin(s,index,player,blocks,firstCover){
 if(!ready(s,index,player,blocks,firstCover))return false;
 s.channel=index;s.left=CHANNEL;s.anchor={x:player.x,z:player.z};s.hullAt=player.hull;return true;
}
function cancel(s){if(!s||s.channel<0)return false;s.channel=-1;s.left=0;s.anchor=null;return true;}
function tick(s,player,dt,shielded,blocks,firstCover){
 if(s.channel<0||!Number.isFinite(dt)||dt<0)return null;
 const i=s.channel;
 if(shielded||player.hull<s.hullAt||!visible(s,i,player,blocks,firstCover)||
    Math.hypot(player.x-s.anchor.x,player.z-s.anchor.z)>.7){cancel(s);return 'interrupted';}
 s.left=Math.max(0,s.left-dt);
 if(s.left>0)return 'channeling';
 s.used[i]=true;cancel(s);
 const oldHull=player.hull,oldEnergy=player.energy;
 player.hull=Math.min(100,oldHull+HEAL);
 player.energy=Math.min(100,oldEnergy+CHARGE);
 return {type:'recovered',index:i,hull:player.hull-oldHull,energy:player.energy-oldEnergy};
}
const api=Object.freeze({COUNT,RADIUS,CHANNEL,HEAL,CHARGE,valid,create,snapshot,visible,ready,begin,cancel,tick});
root.AegisFieldCache=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
