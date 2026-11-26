// Execute the actual first-party service worker under a strict CacheStorage model.
// Not a real installed service worker. Pass an explicit source root and optional --baseline.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const baseline=process.argv.includes('--baseline'),origin='https://wwg.invalid/';
const key=r=>new URL(typeof r==='string'?r:r.url,origin).href;
const checks=[];const check=(label,pass,detail)=>checks.push({label,pass:!!pass,detail});
const source=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const name=source.match(/const CACHE='([^']+)'/)[1];
const listeners={},rows=new Map(),network=[],cacheNames=new Map([[name,rows],['other-app',new Map()]]);let offline=false,skipped=false,claimed=false,failAsset=null;
const response=body=>({ok:true,status:200,body,clone(){return response(body)}});
function cacheFor(map){return {async addAll(entries){const keys=entries.map(key);if(new Set(keys).size!==keys.length)throw new Error('Duplicate request in atomic batch');const staged=[];for(const url of keys){if(url===failAsset)throw Error('asset unavailable');const u=new URL(url),file=path.join(root,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));staged.push([url,response(fs.readFileSync(file,'utf8'))]);}for(const [k,v] of staged)map.set(k,v)},async match(req,opts={}){const u=key(req);if(!opts.ignoreSearch)return map.get(u);const trim=s=>{const v=new URL(s);v.search='';return v.href};return [...map].find(([k])=>trim(k)===trim(u))?.[1]},async put(req,res){map.set(key(req),res)}}}
const context={self:{addEventListener:(t,f)=>listeners[t]=f,skipWaiting:()=>{skipped=true},clients:{claim:()=>{claimed=true}}},caches:{open:async n=>{if(!cacheNames.has(n))cacheNames.set(n,new Map());return cacheFor(cacheNames.get(n))},keys:async()=>[...cacheNames.keys()],delete:async n=>cacheNames.delete(n)},fetch:async req=>{network.push(key(req));if(offline)throw Error('offline');return response('network:'+key(req))}};
vm.createContext(context);vm.runInContext(source,context);const assets=vm.runInContext('ASSETS',context);
const manifest=new Set(assets.map(key));
const cat={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/games.js'),'utf8'),cat);const games=cat.window.WWG_GAMES;
function dispatch(type,request){let reply,wait=[];listeners[type]({request,waitUntil:p=>wait.push(Promise.resolve(p)),respondWith:p=>reply=Promise.resolve(p)});return {reply:()=>reply,wait:()=>Promise.all(wait)}}
function refs(page){const html=fs.readFileSync(path.join(root,page),'utf8');return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m=>new URL(m[1],new URL(page,origin)).href).filter(x=>x.startsWith(origin))}
async function run(){
 const duplicates=assets.length-manifest.size;const shells=['index.html','game.html'];const missingShell=shells.flatMap(p=>refs(p).filter(u=>!manifest.has(u)).map(u=>({page:p,url:u})));
 if(baseline){let rejected=false;try{await dispatch('install').wait()}catch{rejected=true}check('parent has duplicate precache request keys',duplicates===2,duplicates);check('strict atomic install rejects parent duplicate batch',rejected);check('parent omits seven shell script occurrences',missingShell.length===7,missingShell);check('parent install did not activate',!skipped);console.log(JSON.stringify({mode:'baseline',checks,missingShell,duplicates},null,2));return}
 check('all precache request keys unique',duplicates===0,duplicates);check('all shell script occurrences have exact URL entries',missingShell.length===0,missingShell);
 check('homepage/detail share same current catalog script URL',refs('index.html')[0]===refs('game.html')[0]);
 for(const g of games){check(g.id+' game and direct scripts in manifest',manifest.has(key(g.path))&&refs(g.path).every(u=>manifest.has(u)));}
 failAsset=key('./js/game-page.js?v259');let rejected=false;try{await dispatch('install').wait()}catch{rejected=true}check('missing required exact URL prevents activation',rejected&&!skipped&&rows.size===0);failAsset=null;
 await dispatch('install').wait();check('install populates complete manifest before activation',skipped&&rows.size===manifest.size,rows.size);cacheNames.set('wwg-v479',new Map());await dispatch('activate').wait();check('activate removes old owned cache and preserves foreign',claimed&&!cacheNames.has('wwg-v479')&&cacheNames.has('other-app'));
 offline=true;for(const page of shells){for(const u of refs(page)){const e=dispatch('fetch',{method:'GET',mode:'same-origin',url:u});const r=await e.reply();check('cold offline '+page+' '+u.split('/').at(-1),r.body===fs.readFileSync(path.join(root,new URL(u).pathname),'utf8'));}}
 check('offline shell scripts require zero network requests',network.length===0,network.length);
 const page=dispatch('fetch',{method:'GET',mode:'navigate',url:key('game.html?id=orbit-breaker')});check('offline detail query resolves precached game shell',(await page.reply()).body===fs.readFileSync(path.join(root,'game.html'),'utf8'));
 let missing=false;try{await dispatch('fetch',{method:'GET',mode:'same-origin',url:key('js/games.js?arbitrary=other')}).reply()}catch{missing=true}check('unrecognized query not silently aliased',missing);
 offline=false;const e=dispatch('fetch',{method:'GET',mode:'same-origin',url:key('js/games.js?arbitrary=other')});check('unknown version uses network when available',(await e.reply()).body.startsWith('network:'));await e.wait();
 check('non-GET request not intercepted',dispatch('fetch',{method:'POST',mode:'same-origin',url:key('api/save')}).reply()===undefined);
 console.log(JSON.stringify({mode:'candidate',manifestEntries:assets.length,registeredGames:games.length,checks},null,2));
}
run().then(()=>{if(checks.some(c=>!c.pass))process.exitCode=1}).catch(e=>{console.error(e);process.exitCode=1});
