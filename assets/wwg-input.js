(()=>{
  const DEFAULTS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',primary:'Space',secondary:'KeyE'};
  const FALLBACKS={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],primary:['Space'],secondary:['KeyE']};
  const read=()=>{try{return {...DEFAULTS,...JSON.parse(localStorage.getItem('wwg:keymap')||'{}')}}catch{return {...DEFAULTS}}};
  const label=code=>({KeyW:'W',KeyA:'A',KeyS:'S',KeyD:'D',KeyI:'I',KeyJ:'J',KeyK:'K',KeyL:'L',KeyQ:'Q',KeyE:'E',KeyF:'F',KeyC:'C',KeyX:'X',KeyZ:'Z',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Space:'Space',Enter:'Enter',ShiftLeft:'Left Shift',ShiftRight:'Right Shift'}[code]||code);
  const is=(e,action,extra=[])=>{const map=read(),chosen=map[action];return e.code===chosen || (!localStorage.getItem('wwg:keymap') && (FALLBACKS[action]||[]).includes(e.code)) || extra.includes(e.code)};
  window.WWGInput={defaults:DEFAULTS,read,is,label};
})();