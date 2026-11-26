/* Aegis Verge renderer lifecycle. Original Architect Industries MIT source. */
(function(root){'use strict';
 function boot(canvas,{create,install,software=false}){
  let engine=null;
  function attempt(target,forceSoftware){
   // A canvas is bound to its first context type. A failed GPU initialization
   // must not reuse that surface. Force only the replacement's first attempt
   // to skip WebGL, without patching the global browser API.
   const own=Object.getOwnPropertyDescriptor(target,'getContext'),get=target.getContext;
   try{
    if(forceSoftware)Object.defineProperty(target,'getContext',{configurable:true,value:function(type,...args){return type==='webgl2'?null:get.call(this,type,...args);}});
    engine=create(target);install(engine);return engine;
   }catch(error){try{engine?.dispose();}catch{}engine=null;return null;}
   finally{if(forceSoftware){if(own)Object.defineProperty(target,'getContext',own);else delete target.getContext;}}
  }
  if(!software&&attempt(canvas,false))return {canvas,engine,recovered:false};
  const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);
  attempt(replacement,true);
  return {canvas:replacement,engine,recovered:true};
 }
 const api={boot};root.AegisRendererRecovery=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
