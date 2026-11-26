/* Expanded play layout. The running iframe is resized, never replaced. */
(() => {
  'use strict';
  function mount({frame, game, storage}) {
    const body=document.body, wrap=document.getElementById('gameFrameWrap');
    const expand=document.getElementById('expandPlayButton');
    const info=document.getElementById('gameInfoButton');
    const back=document.getElementById('returnToGameButton');
    const details=document.getElementById('gameInfoCard');
    const heading=document.getElementById('gameInfoHeading');
    const fullscreen=document.getElementById('fullscreenButton');
    const status=document.getElementById('playerViewStatus');
    if(!frame||!wrap||!expand||!body)return null;
    let saved=null;
    try{saved=storage.getItem('wwg:play-view')}catch{}
    let expanded=saved==='expanded'||(saved!=='standard'&&game.presentation==='world'&&window.innerWidth>=900);
    let scheduled=null,disposed=false;
    const listeners=[];
    function listen(target,type,fn){if(!target)return;target.addEventListener(type,fn);listeners.push(()=>target.removeEventListener(type,fn))}
    function announce(text){if(status){status.hidden=false;status.textContent=text;}}
    function fit(){
      scheduled=null;if(disposed)return;
      if(!expanded){wrap.style.removeProperty('--wwg-play-height');return;}
      const viewport=window.visualViewport?.height||window.innerHeight||720;
      const top=Math.max(0,wrap.getBoundingClientRect().top+(window.scrollY||0));
      const minimum=Math.min(360,Math.max(180,Math.floor(viewport*.45)));
      const height=Math.max(minimum,Math.floor(viewport-top-12));
      const value=height+'px';
      if(wrap.style.getPropertyValue('--wwg-play-height')!==value)wrap.style.setProperty('--wwg-play-height',value);
    }
    function queueFit(){if(scheduled===null&&!disposed)scheduled=window.requestAnimationFrame(fit)}
    function apply(next,persist=false){
      expanded=!!next;
      body.classList.toggle('expanded-play',expanded);
      body.dataset.playerView=expanded?'expanded':'standard';
      expand.textContent=expanded?'Standard view':'Expand game';
      expand.setAttribute('aria-pressed',String(expanded));
      expand.setAttribute('aria-label',expanded?'Use standard game view':'Expand game play area');
      if(persist){
        try{storage.setItem('wwg:play-view',expanded?'expanded':'standard')}catch{}
        announce(expanded?'Expanded play area. Your current game is kept open.':'Standard play area. Your current game is kept open.');
      }
      queueFit();
    }
    listen(expand,'click',()=>apply(!expanded,true));
    listen(info,'click',()=>{
      details?.scrollIntoView({block:'start',behavior:'auto'});
      heading?.focus({preventScroll:true});
    });
    listen(back,'click',()=>{
      wrap.scrollIntoView({block:'center',behavior:'auto'});
      frame.focus({preventScroll:true});
    });
    listen(fullscreen,'click',async()=>{
      try{
        if(!wrap.requestFullscreen)throw new Error('Fullscreen unavailable');
        await wrap.requestFullscreen();
      }catch{
        apply(true,true);
        announce('Expanded view is ready. This browser could not open fullscreen.');
      }
    });
    listen(window,'resize',queueFit);
    listen(window.visualViewport,'resize',queueFit);
    listen(document,'fullscreenchange',queueFit);
    let observer=null;
    if(typeof ResizeObserver==='function'){
      observer=new ResizeObserver(queueFit);
      for(const element of [document.querySelector('.topbar'),document.querySelector('.game-stage-toolbar'),status,document.getElementById('storageNotice')])if(element)observer.observe(element);
    }
    apply(expanded);
    return {
      dispose(){
        if(disposed)return;disposed=true;
        for(const remove of listeners)remove();observer?.disconnect();
        if(scheduled!==null)window.cancelAnimationFrame(scheduled);
      }
    };
  }
  window.WWG_PLAYER_VIEW={mount};
})();
