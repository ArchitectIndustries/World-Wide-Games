/* Aegis Verge 3.0: concise, read-only combat guidance. Architect Industries, MIT.
 * State is supplied by the existing game. This module has no combat, timer,
 * input, collision, persistence, event or progression authority.
 */
(function(root){
'use strict';
function directive(state){
 if(state.defeated)return'Operation lost. Retry to redeploy.';
 if(state.finished)return'Operation secured. Continue when ready.';
 if(!state.active)return'Choose an operation, then deploy.';
 const relay=Math.min(3,Math.max(1,(Number(state.relay)||0)+1)),hostiles=Math.max(0,Math.floor(Number(state.hostiles)||0));
 if(hostiles)return`Relay ${relay}: defeat ${hostiles} hostile${hostiles===1?'':'s'}.`;
 if(state.relay<3){
  if(state.near)return`Relay ${relay}: hold the beacon · ${Math.min(100,Math.max(0,Math.round((Number(state.capture)||0)/3*100)))}%.`;
  return`Relay ${relay} clear. Follow the cyan route to its beacon.`;
 }
 return'Relays secured. Reach the green extraction pad.';
}
function alert(text){
 text=String(text||'');
 if(text.startsWith('WARDEN SKYBURST /'))return'Skyburst incoming · leave the ring, shield or take cover.';
 if(text.startsWith('RELAY SURGE CHARGING'))return'Relay surge · Pulse, shield or leave the ring.';
 if(text.startsWith('CAPACITOR ARMING'))return text.split(' / ')[0]+'. Clear the ring.';
 if(text.startsWith('FOCUS PAUSED'))return'Paused after switching away. Resume when ready.';
 if(text.startsWith('PAUSED /'))return'Paused · P or Resume to continue.';
 if(text.startsWith('SUSPENDED /'))return'Controls suspended while this page is inactive.';
 const volley=text.match(/^POTENTIAL ([A-Z]+) VOLLEY/);
 if(volley)return volley[1][0]+volley[1].slice(1).toLowerCase()+' volley · leave orange lanes or take cover.';
 const lock=text.match(/^([A-Z]+)(?: THREE-LANE)? LOCK/);
 if(lock)return lock[1][0]+lock[1].slice(1).toLowerCase()+' lock · evade orange lanes or take cover.';
 const stagger=text.match(/(\d+) staggered hostile/);
 if(stagger)return`${stagger[1]} hostile${Number(stagger[1])===1?'':'s'} exposed · double-damage opening.`;
 return text;
}
function copyManual(doc){
 const source=doc.getElementById('missionBriefing'),target=doc.getElementById('fieldGuideBriefing');
 if(!source?.innerHTML||!target)return false;
 target.innerHTML=source.innerHTML;return true;
}
const api=Object.freeze({directive,alert,copyManual});root.AegisCombatPresentation=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
