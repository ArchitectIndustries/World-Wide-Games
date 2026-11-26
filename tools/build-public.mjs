import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {prepareAssets} from './fetch-public-assets.mjs';

// Keep application source and selected regressions in Git, and publish only the
// game runtime. Historical build evidence stays in its preserved source archive.
// Build-only downloads use pinned public URLs and exact hashes; runtime assets are self-hosted.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await prepareAssets();
const output=path.join(root,'dist');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const version='v'+pkg.version.split('.')[0];
const publicRoots=['assets','covers','games','js'];
const publicFiles=['index.html','game.html','manifest.webmanifest','sw.js','LICENSE','THIRD_PARTY_NOTICES.md'];
const extensions=new Set(['.html','.css','.js','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ogg','.mp3','.wav','.wasm']);
const notices=new Set(['PROVENANCE.md','LICENSE','LICENSE.txt','NOTICE','NOTICE.txt']);
const inventory=[];
function walk(relative){
  const filename=path.join(root,relative),stat=fs.lstatSync(filename);
  if(stat.isSymbolicLink())throw new Error('Public symlinks are not supported: '+relative);
  if(relative.split('/').some(part=>part.startsWith('.')))throw new Error('Hidden public path: '+relative);
  if(stat.isDirectory()){
    for(const child of fs.readdirSync(filename).sort())walk(relative+'/'+child);
  }else{
    if(!publicFiles.includes(relative)&&!extensions.has(path.extname(relative).toLowerCase())&&!notices.has(path.basename(relative)))throw new Error('Unreviewed public file: '+relative);
    inventory.push(relative);
  }
}
for(const relative of [...publicFiles,...publicRoots])walk(relative);
inventory.sort();
const ctx=vm.createContext({window:{},document:{getElementById:()=>null},console});
for(const relative of ['js/games.js','js/event-rules.js','js/arcade-expansion.js'])vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),ctx,{filename:relative,timeout:3000});
const games=JSON.parse(JSON.stringify(ctx.window.WWG_GAMES));
if(new Set(games.map(g=>g.id)).size!==games.length)throw new Error('Duplicate catalog game IDs');
for(const game of games){
  for(const field of ['path','cover'])if(!inventory.includes(game[field]))throw new Error('Missing '+field+' for '+game.id);
  if(!game.title||!game.description||!Array.isArray(game.controls)||!game.controls.length)throw new Error('Incomplete player guidance: '+game.id);
}
// Include exact query variants used by the HTML. The worker stays within the
// public inventory and never caches arbitrary/private runtime responses.
const precache=new Set(['./',...inventory.filter(p=>p!=='sw.js'&&!p.endsWith('.md')&&p!=='LICENSE').map(p=>'./'+p)]);
for(const relative of inventory.filter(p=>p.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,relative),'utf8');
  for(const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)){
    const ref=match[1];
    if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;
    const url=new URL(ref,new URL(relative,'https://worldwidegames.invalid/'));
    const local=decodeURIComponent(url.pathname.slice(1));
    if(url.search&&inventory.includes(local))precache.add('./'+local+url.search);
    if(/\.(?:js|css|svg|png|webp|woff2?|wasm)$/.test(url.pathname)&&!inventory.includes(local))throw new Error('Missing HTML asset '+relative+' -> '+ref);
  }
}
let worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
if(!/const ASSETS\s*=\s*\[[\s\S]*?\];/.test(worker))throw new Error('Missing worker inventory');
worker=worker.replace(/const CACHE='[^']+';/,"const CACHE='__WWG_CACHE__';").replace(/const ASSETS\s*=\s*\[[\s\S]*?\];/,'const ASSETS='+JSON.stringify([...precache].sort(),null,2)+';');
// A rebuilt release must replace its cached bytes even when its human-facing
// version is unchanged. Fingerprint the full runtime and normalized worker.
const fingerprint=crypto.createHash('sha256');
for(const relative of inventory){
  fingerprint.update(relative+'\0');
  fingerprint.update(relative==='sw.js'?worker:fs.readFileSync(path.join(root,relative)));
  fingerprint.update('\0');
}
const cache='wwg-'+version+'-'+fingerprint.digest('hex').slice(0,12);
worker=worker.replace("const CACHE='__WWG_CACHE__';","const CACHE='"+cache+"';");
if(process.argv.includes('--update-cache'))fs.writeFileSync(path.join(root,'sw.js'),worker);
if(fs.existsSync(output)&&fs.lstatSync(output).isSymbolicLink())throw new Error('Refusing symlinked output directory');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
const hashes={};
for(const relative of inventory){
  const bytes=relative==='sw.js'?Buffer.from(worker):fs.readFileSync(path.join(root,relative));
  const target=path.join(output,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  hashes[relative]=crypto.createHash('sha256').update(bytes).digest('hex');
}
let commit=process.env.VERCEL_GIT_COMMIT_SHA||'';
let sourceDirty=false;
if(!commit){try{
  commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  sourceDirty=!!execFileSync('git',['status','--porcelain','--untracked-files=normal'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(sourceDirty)commit+='-working-tree';
}catch{commit='uncommitted';sourceDirty=true;}}
const release={version,date:'2026-11-26',owner:'Architect Industries',commit,sourceDirty,catalogCount:games.length,cache,sourceTracks:['catalog-v496','Arcade-Nights','Mosaic-B1','Profile-B2','Aegis-3.0-Worldscape','Cyber-Wars-0.65-Viridia','Dynamic-Campaigns','Solstice-Wilds-1.0','Three-r187'],games:games.map(({id,version,path:gamePath})=>({id,version,path:gamePath})),publicFileCount:inventory.length,sha256:hashes};
fs.writeFileSync(path.join(output,'release.json'),JSON.stringify(release,null,2)+'\n');
console.log(JSON.stringify({version,games:games.length,publicFiles:inventory.length,precacheURLs:precache.size,output,commit}));
