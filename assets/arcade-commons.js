(function(root){
  'use strict';
  const memory=new Map();let storageFailed=false;
  function storageNotice(){storageFailed=true;const el=document.getElementById('storageStatus');if(el)el.textContent='Saving is unavailable. Records last for this visit only.';}
  const safeStore={
    read(key,fallback){try{const raw=memory.has(key)?memory.get(key):localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{storageNotice();return fallback;}},
    write(key,value){const raw=JSON.stringify(value);memory.set(key,raw);try{localStorage.setItem(key,raw);return true;}catch{storageNotice();return false;}},
    best(key,value){const previous=this.read(key,0);const best=Math.max(Number.isFinite(previous)?previous:0,Number.isFinite(value)?value:0);this.write(key,best);return best;},
    available(){return !storageFailed;}
  };
  function sound(button){let ac=null;const query=new URLSearchParams(location.search);const parsed=Number(query.get('volume')??'.7'),volume=Number.isFinite(parsed)?Math.max(0,Math.min(1,parsed)):.7;const locked=query.get('muted')==='1'||volume===0;let enabled=!locked&&safeStore.read('wwg:arcade:sound',true)!==false;
    function label(){button.textContent=locked?'Sound off':enabled?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(enabled&&!locked));button.disabled=locked;button.title=locked?'Sound is muted by the WorldWideGames player settings.':'Toggle original game audio';}
    function unlock(){if(locked||!enabled)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume().catch(()=>{});}catch{}}
    button.addEventListener('click',()=>{if(locked)return;enabled=!enabled;safeStore.write('wwg:arcade:sound',enabled);label();unlock();});label();
    return {unlock,tone(freq=440,duration=.08,type='sine'){if(locked||!enabled)return;unlock();if(!ac||ac.state!=='running')return;try{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,ac.currentTime);g.gain.setValueAtTime(.045*volume,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+duration+.02);}catch{}}};
  }
  function send(game,event,score){if(parent===window||location.origin==='null')return;const data={type:'wwg:game-event',game,event};if(Number.isFinite(score)&&score>=0)data.score=score;parent.postMessage(data,location.origin);}
  root.WWGArcade={store:safeStore,sound,send,isFormTarget:t=>!!t?.closest?.('button,input,select,textarea,a')};
})(window);
