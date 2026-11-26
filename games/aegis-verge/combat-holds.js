/* Architect Industries — Aegis Verge F3D60: independent multi-contact combat holds.
 * Original first-party input controller. Pointer identity, not event ordering,
 * owns sustained FIRE/SHIELD. One-shot abilities fire only on fresh press.
 */
(function(root){
'use strict';
const HOLD=new Set(['fire','shield']);
const ACTIONS=['fire','shield','pulse','dash','decoy','uplink','cache'];
function install(buttons, onHold, onActivate){
 if(!buttons||typeof onHold!=='function'||typeof onActivate!=='function')return null;
 const sources=new Map(),keyboard=new Set(),nodes=new Map();
 let last='';
 function state(){
  const held={fire:false,shield:false};
  for(const action of sources.values())if(HOLD.has(action))held[action]=true;
  for(const action of keyboard)if(HOLD.has(action))held[action]=true;
  const stamp=Number(held.fire)+'|'+Number(held.shield);
  for(const [action,node] of nodes)node.classList.toggle('active',!!held[action]);
  if(stamp!==last){last=stamp;onHold(held);}
 }
 function start(action,id){
  if(sources.has(id))return false;
  sources.set(id,action);
  state();
  onActivate(action);
  return true;
 }
 function stop(id){if(sources.delete(id))state();}
 for(const node of buttons){
  const action=node.dataset.action;
  if(!ACTIONS.includes(action)||nodes.has(action))continue;
  nodes.set(action,node);
  node.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   e.preventDefault();
   if(start(action,e.pointerId)){try{node.setPointerCapture(e.pointerId)}catch{}}
  });
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])node.addEventListener(kind,e=>{
   if(sources.get(e.pointerId)===action)stop(e.pointerId);
  });
  node.addEventListener('keydown',e=>{
   if(!['Enter','Space'].includes(e.code)){return;}
   e.preventDefault();
   if(e.repeat||keyboard.has(action))return;
   keyboard.add(action);state();onActivate(action);
  });
  node.addEventListener('keyup',e=>{
   if(!['Enter','Space'].includes(e.code))return;
   e.preventDefault();keyboard.delete(action);state();
  });
  node.addEventListener('blur',()=>{if(keyboard.delete(action))state();});
 }
 if(!nodes.has('fire')||!nodes.has('shield'))return null;
 function reset(){sources.clear();keyboard.clear();state();}
 state();
 return Object.freeze({reset});
}
const api=Object.freeze({install});
root.AegisCombatHolds=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
