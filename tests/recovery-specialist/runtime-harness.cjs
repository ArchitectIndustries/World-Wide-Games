'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
// Node VM fixture: original game code and first-party modules; DOM/canvas are modeled.
// This verifies state transitions, not rendering, real browser input, or hardware.
const ROOT=path.resolve(__dirname,'../..');
const noop=()=>{};
function boot(game,{origin='about:blank',storage={},denyRead=false,denyWrite=false,transformScript=code=>code}={}){
 const file=path.join(ROOT,'games',game,'index.html'),html=fs.readFileSync(file,'utf8'),byId=new Map(),elements=[],events={},writes=[],messages=[];
 const graphics=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(t,p)=>p in t?t[p]:noop});
 let doc;
 class Element{
  constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.dataset={};this.style={};this.id=attrs.id||'';this.value=attrs.value||'';this.textContent='';this.hidden='hidden'in attrs;this.disabled=false;this.checked='checked'in attrs;this.open=false;this.width=1280;this.height=800;this.clientWidth=1280;this.clientHeight=800;this.children=[];this.handlers={};this.innerHTML='';this.className=attrs.class||'';const c=new Set(this.className.split(' '));this.classList={add:(...a)=>a.forEach(x=>c.add(x)),remove:(...a)=>a.forEach(x=>c.delete(x)),toggle:(a,force)=>{if(force??!c.has(a))c.add(a);else c.delete(a)},contains:a=>c.has(a)};for(const [k,v]of Object.entries(attrs)){if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;if(k==='style')for(const a of v.split(';')){const [n,x]=a.split(':');if(n&&x)this.style[n.trim()]=x.trim()}}}
  setAttribute(k,v){this.attrs[k]=String(v)} getAttribute(k){return this.attrs[k]??null} removeAttribute(k){delete this.attrs[k]}
  addEventListener(k,v){(this.handlers[k]??=[]).push(v)} removeEventListener(){} dispatchEvent(e){e.currentTarget=this;for(const h of this.handlers[e.type]||[])h(e)}
  focus(){doc.activeElement=this} click(){this.onclick?.({detail:1,preventDefault:noop});this.dispatchEvent({type:'click',detail:1,preventDefault:noop})}
  appendChild(e){this.children.push(e);return e} append(...e){this.children.push(...e)} replaceWith(e){if(this.id)byId.set(this.id,e)}
  cloneNode(){return new Element(this.tagName,{...this.attrs})} getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight,bottom:this.clientHeight,right:this.clientWidth}}
  getContext(type){return type==='2d'?graphics:null} setPointerCapture(){} releasePointerCapture(){} scrollIntoView(){} requestPointerLock(){} contains(e){return e===this||this.children.includes(e)}
  set innerHTML(value){
   this._innerHTML=String(value);this.children=[];
   // Scope dynamically rendered menu controls to their actual parent. Do not let
   // a sector-grid query overwrite unrelated launch, pause or resume handlers.
   for(const m of this._innerHTML.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*?)>/gi)){
    const attrs={};for(const a of m[2].matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';
    this.children.push(new Element(m[1],attrs));
   }
  }
  get innerHTML(){return this._innerHTML||''}
  showModal(){this.open=true} close(){this.open=false;this.dispatchEvent({type:'close'})} querySelector(s){return this.querySelectorAll(s)[0]||null} querySelectorAll(s){const all=[];const walk=e=>{for(const c of e.children){all.push(c);walk(c)}};walk(this);return all.filter(e=>s.split(',').some(t=>match(e,t.trim())))}
 }
 for(const m of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*?)>/gi)){
  const attrs={};for(const a of m[2].matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';
  const e=new Element(m[1],attrs);elements.push(e);if(e.id)byId.set(e.id,e);
 }
 function match(e,s){if(s.startsWith('#'))return e.id===s.slice(1);if(s.startsWith('.'))return e.className.split(' ').includes(s.slice(1));const a=s.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/);if(a)return a[1]in e.attrs&&(a[2]===undefined||e.attrs[a[1]]===a[2]);return e.tagName.toLowerCase()===s;}
 function queryAll(s){return elements.filter(e=>s.split(',').some(t=>match(e,t.trim())))}
 function query(s){if(s==='meta[name="cyber-wars-relay"]')return null;if(s.startsWith('#')&&!s.includes(' ')){if(!byId.has(s.slice(1)))byId.set(s.slice(1),new Element('div',{id:s.slice(1)}));return byId.get(s.slice(1))}return queryAll(s)[0]||new Element()}
 doc={querySelector:query,querySelectorAll:queryAll,getElementById:id=>query('#'+id),createElement:tag=>new Element(tag),hidden:false,hasFocus:()=>true,activeElement:null,body:elements.find(e=>e.tagName==='BODY')||new Element('body'),addEventListener:(k,h)=>(events[k]??=[]).push(h),exitPointerLock:noop};
 const mem=new Map(Object.entries(storage)),context={document:doc,console,location:origin==='about:blank'?{href:origin,protocol:'about:',hostname:'',search:'?qa=1&seed=VIRIDIA'}:new URL(origin),navigator:{getGamepads:()=>[],clipboard:{writeText:async()=>{}}},URL,URLSearchParams,crypto:crypto.webcrypto,performance:{now:()=>1000},innerWidth:1280,innerHeight:800,devicePixelRatio:1,matchMedia:()=>({matches:false,addEventListener:noop}),requestAnimationFrame:()=>1,cancelAnimationFrame:noop,setTimeout:()=>1,clearTimeout:noop,setInterval:()=>1,clearInterval:noop,addEventListener:(k,h)=>(events[k]??=[]).push(h),removeEventListener:noop,parent:{postMessage:noop},localStorage:{getItem:k=>{if(denyRead)throw new Error('Storage unavailable');return mem.get(k)??null},setItem:(k,v)=>{if(denyWrite)throw new Error('Storage unavailable');writes.push([k,v]);mem.set(k,String(v))},removeItem:k=>mem.delete(k)},getComputedStyle:e=>e.style,CustomEvent:class{constructor(type,init){this.type=type;Object.assign(this,init)}},TextEncoder,TextDecoder};
 context.parent.postMessage=message=>messages.push(JSON.parse(JSON.stringify(message)));context.history={replaceState:noop};context.window=context;context.top=context;vm.createContext(context);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  const src=m[1].match(/src=["']([^"']+)/i);const code=src?fs.readFileSync(path.resolve(path.dirname(file),src[1]),'utf8'):m[2];if(code.trim())vm.runInContext(transformScript(code,src?.[1]||'inline'),context,{filename:src?.[1]||game+'-inline',timeout:15000});
 }
 return{context,document:doc,elements,byId,writes,messages,storage:mem,dispatch:(type,detail={})=>{for(const h of events[type]||[])h({type,preventDefault:noop,...detail})},eval:code=>vm.runInContext(code,context,{timeout:15000})};
}
module.exports={boot};
if(require.main===module){for(const game of ['cyber-wars','aegis-verge']){const r=boot(game);console.log(game,'boot',Object.keys(r.context).filter(x=>x==='CWQA'||x==='__aegisVerge'));r.byId.get('start').click();console.log(game,'started')}}
