/* Architect Industries | Aegis Verge F3D58 compact cockpit.
 * Adds only view state; does not synthesize, swallow, or redefine combat input.
 */
(function(root){
 'use strict';
 const doc=root.document;if(!doc)return;
 const controls=[
  ['compactBriefButton','compact-brief-open'],
  ['compactToolsButton','compact-tools-open'],
  ['compactMenuButton','compact-menu-open']
 ];
 const buttons=controls.map(([id,cls])=>({button:doc.getElementById(id),cls}));
 function set(id,open){
  const item=buttons.find(x=>x.button&&x.button.id===id);if(!item)return false;
  doc.body.classList.toggle(item.cls,!!open);
  item.button.setAttribute('aria-expanded',String(!!open));
  return true;
 }
 function close(){for(const {button} of buttons)if(button)set(button.id,false)}
 for(const {button,cls} of buttons){if(!button)continue;
  button.addEventListener('click',()=>{
   const opening=!doc.body.classList.contains(cls);
   close();set(button.id,opening);
  });
 }
 doc.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   const open=buttons.find(x=>x.button&&doc.body.classList.contains(x.cls));
   if(open){event.preventDefault();close();open.button.focus();}
  }
 });
 // Full-screen result and replay should never inherit an obscuring menu.
 doc.addEventListener('click',event=>{
  if(event.target.closest?.('#start,#continue,#resume'))close();
 });
 root.AegisCompactHUD=Object.freeze({close,isOpen:id=>{
  const item=buttons.find(x=>x.button?.id===id);return !!item&&doc.body.classList.contains(item.cls);
 }});
})(typeof window==='object'?window:globalThis);
