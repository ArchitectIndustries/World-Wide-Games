(()=>{
  const DEFAULTS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',primary:'Space',secondary:'KeyE'};
  const DIRECTION_ALIASES={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight']};
  const ACTION_FALLBACKS={primary:['Space'],secondary:['KeyE']};
  const KEY_CODES=new Set(['KeyW','KeyA','KeyS','KeyD','KeyI','KeyJ','KeyK','KeyL','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','ShiftLeft','KeyQ','KeyE','KeyF','KeyC','KeyX','KeyZ']);
  const read=()=>{
    const map={...DEFAULTS};
    try{
      const stored=JSON.parse(localStorage.getItem('wwg:keymap')||'{}');
      if(stored&&typeof stored==='object'&&!Array.isArray(stored))for(const action of Object.keys(DEFAULTS)){
        const value=stored[action];
        if(typeof value==='string'&&KEY_CODES.has(value))map[action]=value;
      }
    }catch{}
    return map;
  };
  const label=code=>({KeyW:'W',KeyA:'A',KeyS:'S',KeyD:'D',KeyI:'I',KeyJ:'J',KeyK:'K',KeyL:'L',KeyQ:'Q',KeyE:'E',KeyF:'F',KeyC:'C',KeyX:'X',KeyZ:'Z',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Space:'Space',Enter:'Enter',ShiftLeft:'Left Shift',ShiftRight:'Right Shift'}[code]||code);
  const hasCustom=()=>{try{return !!localStorage.getItem('wwg:keymap')}catch{return false}};
  const is=(e,action,extra=[])=>{
    const map=read(),chosen=map[action];
    if(e.code===chosen||extra.includes(e.code))return true;
    // Movement is intentionally universal across WorldWideGames: Arrow keys and
    // WASD remain valid even after a player saves a custom remapping profile.
    if((DIRECTION_ALIASES[action]||[]).includes(e.code))return true;
    // Non-directional defaults remain fallbacks only until a custom profile is saved.
    return !hasCustom()&&(ACTION_FALLBACKS[action]||[]).includes(e.code);
  };
  window.WWGInput={defaults:DEFAULTS,read,is,label,directionAliases:DIRECTION_ALIASES};
})();