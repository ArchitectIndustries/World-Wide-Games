// Actual first-party worker in a deterministic CacheStorage model, not a real PWA.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(process.argv[2]||'.'), baseline=process.argv.includes('--baseline');
const source=fs.readFileSync(path.join(root,'sw.js'),'utf8'), base='https://wwg.invalid/';
const key=r=>new URL(typeof r==='string'?r:r.url,base).href;
const checks=[];function check(name,pass){checks.push({name,pass:!!pass});}
const resp=body=>({body,ok:true,status:200,clone(){return resp(body)}});
let offline=false,deny=false,net=[],writes=[],rows=new Map(),handlers={},skipped=false,claimed=false;
const name=source.match(/const CACHE='([^']+)'/)[1], maps=new Map([[name,rows],['other-app',new Map()],['wwg-v479',new Map()]]);
const cache={async addAll(a){for(const u of a)rows.set(key(u),resp('sealed:'+key(u)))},async match(r,o={}){const u=key(r);if(!o.ignoreSearch)return rows.get(u);const p=x=>{let v=new URL(x);v.search='';return v.href};return [...rows].find(([k])=>p(k)===p(u))?.[1]},async put(r,v){writes.push(key(r));rows.set(key(r),v)}};
const ctx={URL,self:{registration:{scope:base},addEventListener:(t,f)=>handlers[t]=f,skipWaiting:()=>{skipped=true},clients:{claim:()=>{claimed=true}}},caches:{open:async()=>{if(deny)throw Error('denied');return cache},keys:async()=>[...maps.keys()],delete:async k=>maps.delete(k)},fetch:async r=>{net.push(key(r));if(offline)throw Error('offline');return resp('live:'+key(r))}};
vm.createContext(ctx);vm.runInContext(source,ctx);
function event(t,r){let reply,wait=[];handlers[t]({request:r,respondWith:p=>reply=Promise.resolve(p),waitUntil:p=>wait.push(Promise.resolve(p))});return {reply,wait:()=>Promise.all(wait)}}
function req(url,mode='same-origin',headers={},method='GET',cache='default'){return {url:key(url),mode,method,cache,headers:{has:k=>Object.keys(headers).some(h=>h.toLowerCase()===k.toLowerCase())}}}
async function request(r){const e=event('fetch',r);const intercepted=!!e.reply;let body,error;try{body=(await(e.reply||ctx.fetch(r)))?.body}catch(e){error=String(e)}await e.wait();return {intercepted,body,error}}
async function run(){await event('install').wait();await event('activate').wait();const size=rows.size;const privateReq=req('api/profile?user=example');const external=req('https://other.invalid/public.json','cors');const unknown=req('js/games.js?v999');const nav=req('game.html?id=orbit-breaker','navigate');
 if(baseline){for(const r of [privateReq,external,unknown,nav])await request(r);check('arbitrary API response retained',rows.has(privateReq.url));check('cross-origin response retained',rows.has(external.url));check('unknown script revision retained',rows.has(unknown.url));check('query-bearing navigation retained',rows.has(nav.url));offline=true;check('cached API returned offline',(await request(privateReq)).body==='live:'+privateReq.url);console.log(JSON.stringify({baseline,checks,writes},null,2));return}
 check('install and activate preserve foreign namespace',skipped&&claimed&&maps.has('other-app')&&!maps.has('wwg-v479'));
 for(const r of [privateReq,external,unknown,req('api/profile','navigate'),req('assets/styles.css','same-origin',{Authorization:'test'}),req('assets/styles.css','same-origin',{Range:'bytes=0-10'}),req('assets/styles.css','same-origin',{},'POST'),req('assets/styles.css','same-origin',{},'GET','no-store')]){let out=await request(r);check('unapproved request bypasses worker '+r.url+' '+r.method+' '+r.cache+' '+JSON.stringify(r.headers),!out.intercepted&&out.body==='live:'+r.url)}
 check('known navigation uses network online',(await request(nav)).body==='live:'+nav.url);check('no runtime cache writes or growth',writes.length===0&&rows.size===size);
 offline=true;for(const r of [privateReq,external,unknown,req('api/profile','navigate')]){let out=await request(r);check('unapproved offline request never returns cached data '+r.url,!out.intercepted&&!!out.error&&!out.body)}
 for(const [url,expected] of [['game.html?id=orbit-breaker','game.html'],['/?q=snake','./'],['games/orbit-breaker/','games/orbit-breaker/index.html'],['games/astral-menagerie/index.html?mode=practice','games/astral-menagerie/index.html']]){const out=await request(req(url,'navigate'));check('known offline navigation '+url,out.body==='sealed:'+key(expected))}
 const assets=vm.runInContext('ASSETS',ctx);const staticAssets=assets.filter(x=>!x.endsWith('/')&&!x.endsWith('.html'));for(const u of staticAssets){let out=await request(req(u));check('exact offline asset '+u,out.body==='sealed:'+key(u))}
 const games=assets.filter(x=>x.startsWith('./games/')&&x.endsWith('/index.html'));for(const u of games){let out=await request(req(u+'?mode=practice','navigate'));check('offline registered game '+u,out.body==='sealed:'+key(u))}
 offline=false;deny=true;check('storage denial uses network',(await request(req('assets/styles.css'))).body==='live:'+key('assets/styles.css'));check('storage denial navigation still works',(await request(nav)).body==='live:'+nav.url);deny=false;rows.delete(key('assets/styles.css'));check('evicted asset network fallback without persistence',(await request(req('assets/styles.css'))).body==='live:'+key('assets/styles.css')&&!rows.has(key('assets/styles.css')));check('zero runtime writes',writes.length===0);
 console.log(JSON.stringify({baseline,checks,passed:checks.filter(c=>c.pass).length,total:checks.length,manifestEntries:size,writes},null,2));}
run().then(()=>{if(checks.some(c=>!c.pass))process.exitCode=1}).catch(e=>{console.error(e);process.exitCode=1});
