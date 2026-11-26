/* Architect Industries, Aegis Verge F3D59: independent pointer-owned slide steering.
 * First-party module; no gameplay/scoring authority and no third-party dependencies.
 */
(function(root){
'use strict';
const DIRECTIONS=['up','down','left','right'];
function install(steer,onChange){
 if(!steer||typeof onChange!=='function')return null;
 const buttons=DIRECTIONS.map(key=>({key,button:steer.querySelector('[data-k="'+key+'"]')}));
 if(buttons.some(x=>!x.button))return null;
 const contacts=new Map();
 let previous='';
 function under(x,y){
  for(const {key,button} of buttons){
   const r=button.getBoundingClientRect();
   if(r.width>0&&r.height>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return key;
  }
  return null;
 }
 function emit(){
  const next=Object.fromEntries(DIRECTIONS.map(k=>[k,false]));
  for(const key of contacts.values())if(key)next[key]=true;
  const stamp=DIRECTIONS.filter(k=>next[k]).join('|');
  for(const {key,button} of buttons)button.classList.toggle('active',next[key]);
  if(stamp!==previous){previous=stamp;onChange(next);}
 }
 function down(e,key,button){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();
  contacts.set(e.pointerId,key);emit();
  try{button.setPointerCapture(e.pointerId)}catch{}
 }
 function move(e){
  if(!contacts.has(e.pointerId))return;
  const key=under(e.clientX,e.clientY);
  if(contacts.get(e.pointerId)!==key){contacts.set(e.pointerId,key);emit();}
 }
 function end(e){
  if(contacts.delete(e.pointerId))emit();
 }
 for(const {key,button} of buttons){
  button.addEventListener('pointerdown',e=>down(e,key,button));
  button.addEventListener('pointermove',move);
  button.addEventListener('pointerup',end);
  button.addEventListener('pointercancel',end);
  button.addEventListener('lostpointercapture',end);
 }
 function reset(){contacts.clear();emit();}
 return Object.freeze({reset});
}
const api=Object.freeze({install});
root.AegisTouchSteering=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
