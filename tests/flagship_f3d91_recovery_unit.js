'use strict';
const assert=require('node:assert/strict'),R=require('../games/aegis-verge/renderer-recovery.js');let n=0;
function check(v){assert.ok(v);n++;}
class Canvas{
 constructor(id='c'){this.id=id;this.contexts=[];this.replacement=null;}
 getContext(type){this.contexts.push(type);return type==='2d'?{}:null;}
 cloneNode(){return new Canvas(this.id)}
 replaceWith(next){this.replacement=next;}
}
const build=canvas=>{const gl=canvas.getContext('webgl2');if(!gl&&!canvas.getContext('2d'))throw Error('No graphics');return {mode:gl?'webgl2':'canvas2d',dispose(){}};};
{
 const c=new Canvas(),o=R.boot(c,{create:build,install:()=>{}});check(o.canvas===c);check(!o.recovered);check(o.engine.mode==='canvas2d');check(!c.replacement);check(c.contexts.join(',')==='webgl2,2d');
}
{
 const c=new Canvas();let attempts=0,installs=0;const o=R.boot(c,{create:target=>{attempts++;if(target===c){target.getContext('webgl2');throw Error('GPU fail');}return build(target);},install:()=>{installs++;}});
 check(attempts===2);check(installs===1);check(o.recovered);check(o.canvas!==c);check(c.replacement===o.canvas);check(o.canvas.id==='c');check(o.engine.mode==='canvas2d');check(o.canvas.contexts.join(',')==='2d');check(!Object.hasOwn(o.canvas,'getContext'));check(c.contexts.join(',')==='webgl2');
}
{
 const c=new Canvas();let disposed=0,installs=0;const o=R.boot(c,{create:t=>({...build(t),dispose(){disposed++;}}),install:()=>{if(++installs===1)throw Error('Adapter failed');}});check(disposed===1);check(o.recovered);check(installs===2);check(!!o.engine);
}
{
 const c=new Canvas();let attempts=0;const o=R.boot(c,{create:target=>{attempts++;throw Error('No graphics');},install:()=>{throw Error('must not install');}});check(attempts===2);check(o.engine===null);check(o.canvas!==c);check(!Object.hasOwn(o.canvas,'getContext'));
}
{
 const c=new Canvas();let attempts=0;const o=R.boot(c,{software:true,create:target=>{attempts++;return build(target);},install:()=>{}});check(attempts===1);check(!c.contexts.length);check(o.recovered&&o.canvas!==c);check(o.canvas.contexts.join(',')==='2d');check(!Object.hasOwn(o.canvas,'getContext'));
}
console.log(JSON.stringify({passed:n,failed:0}));
