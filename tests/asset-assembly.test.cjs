'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {spawnSync}=require('node:child_process'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),official=JSON.parse(fs.readFileSync(path.join(root,'tools/asset-sources.json'),'utf8'));
const modulePromise=import(pathToFileURL(path.join(root,'tools/fetch-public-assets.mjs')));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const allOutputs=manifest=>manifest.sources.flatMap(s=>s.format==='file'?[s]:s.entries);

function tarFile(entries){
 const chunks=[];
 for(const {name,bytes=Buffer.alloc(0),type='0'} of entries){
  const header=Buffer.alloc(512);header.write(name,0,100,'utf8');header.write('0000644\0',100);header.write('0000000\0',108);header.write('0000000\0',116);header.write(bytes.length.toString(8).padStart(11,'0')+'\0',124);header.write('00000000000\0',136);header.fill(32,148,156);header.write(type,156);header.write('ustar\0',257);header.write('00',263);
  const checksum=header.reduce((n,b)=>n+b,0);header.write(checksum.toString(8).padStart(6,'0')+'\0 ',148);chunks.push(header,bytes,Buffer.alloc((512-bytes.length%512)%512));
 }
 return zlib.gzipSync(Buffer.concat([...chunks,Buffer.alloc(1024)]));
}
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wwg-public-source-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));fs.mkdirSync(path.join(dir,'tools'));
 const manifest=structuredClone(official),responses=new Map(),expected=new Map();let serial=0;
 for(const source of manifest.sources){
  let bytes;
  if(source.format==='file'){bytes=Buffer.from('known-public-texture-fixture-'+(++serial));expected.set(source.output,bytes);}
  else{
   const entries=source.entries.map(entry=>{const content=Buffer.from(entry.entry.endsWith('three.module.js')?"export {fixture} from './three.core.js';\n":"export const fixture='upstream-core';\n");entry.bytes=content.length;entry.sha256=sha(content);expected.set(entry.output,content);return{name:entry.entry,bytes:content};});bytes=tarFile(entries);
  }
  source.bytes=bytes.length;source.sha256=sha(bytes);responses.set(source.url,bytes);
 }
 const write=()=>fs.writeFileSync(path.join(dir,'tools/asset-sources.json'),JSON.stringify(manifest));write();
 fs.copyFileSync(path.join(root,'tools/fetch-public-assets.mjs'),path.join(dir,'tools/fetch-public-assets.mjs'));
 const requests=[];
 const fetchImpl=async(url,options)=>{requests.push(url);assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');const bytes=responses.get(url);return new Response(bytes||null,{status:bytes?200:404,headers:bytes?{'content-length':String(bytes.length)}:{}});};
 return{dir,manifest,responses,expected,requests,fetchImpl,write};
}
function verifyAll(f,base=f.dir){
 for(const output of allOutputs(f.manifest)){const bytes=fs.readFileSync(path.join(base,output.output));assert.equal(bytes.length,output.bytes);assert.equal(sha(bytes),output.sha256);assert.deepEqual(bytes,f.expected.get(output.output));}
}
function noGenerated(f){for(const output of allOutputs(f.manifest))assert(!fs.existsSync(path.join(f.dir,output.output)),output.output);}

test('clean preparation fetches seven approved fixture responses and reconstructs eight exact outputs',async t=>{
 const f=fixture(t),{prepareAssets}=await modulePromise;noGenerated(f);
 const result=await prepareAssets({root:f.dir,fetchImpl:f.fetchImpl});verifyAll(f);
 assert.deepEqual(result,{assets:8,bytes:allOutputs(f.manifest).reduce((n,o)=>n+o.bytes,0),downloadedSources:7,reusedOutputs:0});assert.equal(f.requests.length,7);
});
test('verified existing outputs are reused without any network request',async t=>{
 const f=fixture(t),{prepareAssets}=await modulePromise;await prepareAssets({root:f.dir,fetchImpl:f.fetchImpl});
 const result=await prepareAssets({root:f.dir,fetchImpl:()=>{throw Error('network must not be used');}});assert.equal(result.downloadedSources,0);assert.equal(result.reusedOutputs,8);verifyAll(f);
});
test('corrupt local bytes are never reused; failed retrieval preserves existing files and dist',async t=>{
 const f=fixture(t),{prepareAssets}=await modulePromise;await prepareAssets({root:f.dir,fetchImpl:f.fetchImpl});const first=f.manifest.sources[0],filename=path.join(f.dir,first.output),bad=fs.readFileSync(filename);bad[3]^=1;fs.writeFileSync(filename,bad);
 fs.mkdirSync(path.join(f.dir,'dist'));fs.writeFileSync(path.join(f.dir,'dist/last-success.txt'),'keep');const original=f.responses.get(first.url);f.responses.delete(first.url);
 await assert.rejects(prepareAssets({root:f.dir,fetchImpl:f.fetchImpl}),/status 404/);assert.deepEqual(fs.readFileSync(filename),bad);assert.equal(fs.readFileSync(path.join(f.dir,'dist/last-success.txt'),'utf8'),'keep');
 f.responses.set(first.url,original);f.requests.length=0;const result=await prepareAssets({root:f.dir,fetchImpl:f.fetchImpl});assert.equal(result.downloadedSources,1);assert.equal(result.reusedOutputs,7);verifyAll(f);
});
test('bad status, absent response body, size and same-length digest corruption fail before writes',async t=>{
 const {prepareAssets}=await modulePromise;
 for(const kind of ['missing','body','length','digest']){
  const f=fixture(t),first=f.manifest.sources[0];let fetchImpl=f.fetchImpl;
  if(kind==='missing')f.responses.delete(first.url);
  if(kind==='body')fetchImpl=async()=>new Response(null,{status:200});
  if(kind==='length')f.responses.set(first.url,Buffer.from('short'));
  if(kind==='digest'){const bad=Buffer.from(f.responses.get(first.url));bad[0]^=1;f.responses.set(first.url,bad);}
  await assert.rejects(prepareAssets({root:f.dir,fetchImpl}),/status 404|response body|byte count mismatch|integrity mismatch/);noGenerated(f);
 }
});
test('missing, unapproved, duplicate and traversing source declarations fail before networking',async t=>{
 const {prepareAssets}=await modulePromise;
 for(const kind of ['missing','url','duplicate','output','archiveEntry']){
  const f=fixture(t);if(kind==='missing')f.manifest.sources.pop();if(kind==='url')f.manifest.sources[0].url='https://example.invalid/private';if(kind==='duplicate')f.manifest.sources[1]=structuredClone(f.manifest.sources[0]);if(kind==='output')f.manifest.sources[0].output='../escape.jpg';if(kind==='archiveEntry')f.manifest.sources.at(-1).entries[0].entry='../escape';f.write();
  await assert.rejects(prepareAssets({root:f.dir,fetchImpl:f.fetchImpl}),/Missing|Invalid|Unapproved|Duplicate/);assert.equal(f.requests.length,0);noGenerated(f);
 }
});
test('strict tar handling rejects links, traversal, duplicate or missing targets and invalid checksums',async t=>{
 const {prepareAssets}=await modulePromise;
 for(const kind of ['link','traversal','duplicate','missing','checksum']){
  const f=fixture(t),source=f.manifest.sources.at(-1),entries=source.entries.map(e=>({name:e.entry,bytes:f.expected.get(e.output)}));
  if(kind==='link')entries.push({name:'package/symlink',type:'2'});if(kind==='traversal')entries.push({name:'package/../../escape'});if(kind==='duplicate')entries.push(entries[0]);if(kind==='missing')entries.pop();
  let archive=tarFile(entries);if(kind==='checksum'){const data=zlib.gunzipSync(archive);data[100]^=1;archive=zlib.gzipSync(data);}
  source.bytes=archive.length;source.sha256=sha(archive);f.responses.set(source.url,archive);f.write();
  await assert.rejects(prepareAssets({root:f.dir,fetchImpl:f.fetchImpl}),/Tar links|tar path|tar entries|checksum mismatch/);noGenerated(f);
 }
});
test('download timeout is bounded even when a provider never returns',async t=>{
 const f=fixture(t),{prepareAssets}=await modulePromise;let calls=0;
 await assert.rejects(prepareAssets({root:f.dir,fetchImpl:()=>{calls++;return new Promise(()=>{});},timeoutMs:10,attempts:1}),/download timeout/);assert.equal(calls,1);noGenerated(f);
});
test('a generated output symlink is rejected before public downloads',async t=>{
 const f=fixture(t),{prepareAssets}=await modulePromise,first=f.manifest.sources[0],target=path.join(f.dir,first.output);fs.mkdirSync(path.dirname(target),{recursive:true});fs.symlinkSync(path.join(f.dir,'absent-target'),target);
 await assert.rejects(prepareAssets({root:f.dir,fetchImpl:f.fetchImpl}),/symlink/);assert.equal(f.requests.length,0);
});
test('fresh public build uses verified fixture downloads and excludes sources, parts and build tools',async t=>{
 const f=fixture(t),outputs=new Set(allOutputs(f.manifest).map(a=>a.output));
 for(const folder of['assets','covers','games','js'])fs.cpSync(path.join(root,folder),path.join(f.dir,folder),{recursive:true,filter:source=>!outputs.has(path.relative(root,source).split(path.sep).join('/'))});
 for(const file of['index.html','game.html','manifest.webmanifest','sw.js','LICENSE','THIRD_PARTY_NOTICES.md','package.json'])fs.copyFileSync(path.join(root,file),path.join(f.dir,file));
 fs.copyFileSync(path.join(root,'tools/build-public.mjs'),path.join(f.dir,'tools/build-public.mjs'));
 const encoded=Object.fromEntries([...f.responses].map(([url,bytes])=>[url,bytes.toString('base64')]));
 const preload=path.join(f.dir,'fixture-fetch.mjs');fs.writeFileSync(preload,'const responses='+JSON.stringify(encoded)+';globalThis.fetch=async url=>{const bytes=responses[url];return new Response(bytes?Buffer.from(bytes,"base64"):null,{status:bytes?200:404});};');
 noGenerated(f);const result=spawnSync(process.execPath,['--import',preload,path.join(f.dir,'tools/build-public.mjs')],{cwd:f.dir,encoding:'utf8',timeout:30000});assert.equal(result.status,0,result.stderr||String(result.error));verifyAll(f);verifyAll(f,path.join(f.dir,'dist'));
 const receipt=JSON.parse(fs.readFileSync(path.join(f.dir,'dist/release.json'),'utf8')),worker=fs.readFileSync(path.join(f.dir,'dist/sw.js'),'utf8'),assets=JSON.parse(worker.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/)[1]);
 assert(!fs.existsSync(path.join(f.dir,'dist/source-assets')));assert(!fs.existsSync(path.join(f.dir,'dist/tools')));assert(!fs.existsSync(path.join(f.dir,'dist/fixture-fetch.mjs')));
 assert(Object.keys(receipt.sha256).every(p=>!p.startsWith('source-assets/')&&!p.endsWith('.bin')&&!p.includes('asset-sources')));assert(assets.every(p=>!p.includes('source-assets/')&&!p.includes('.bin')&&!p.includes('asset-sources')));
 for(const output of allOutputs(f.manifest)){assert.equal(receipt.sha256[output.output],output.sha256);assert(assets.includes('./'+output.output));}
});
