'use strict';
// Isolated regression against the real build program. This copies verified
// generated assets; external-download qualification belongs to asset QA.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const output=path.resolve(process.argv[3]||path.join(os.tmpdir(),'wwg-build-fingerprint-verification-'+process.pid+'.json'));
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'wwg-fingerprint-'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const checks=[],builds=[];
function check(name,test){test();checks.push(name)}
function copy(relative){const target=path.join(fixture,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.cpSync(path.join(root,relative),target,{recursive:true});}
function build(label){
 const p=spawnSync(process.execPath,['--import',path.join(fixture,'no-network.mjs'),path.join(fixture,'tools/build-public.mjs'),'--update-cache'],{
  cwd:fixture,encoding:'utf8',timeout:45000,env:{...process.env,VERCEL_GIT_COMMIT_SHA:'1'.repeat(40)}
 });
 assert.equal(p.status,0,p.stderr||String(p.error));
 const receipt=JSON.parse(fs.readFileSync(path.join(fixture,'dist/release.json'),'utf8'));
 const worker=fs.readFileSync(path.join(fixture,'dist/sw.js'),'utf8');
 assert(worker.includes("const CACHE='"+receipt.cache+"';"));
 builds.push({label,version:receipt.version,cache:receipt.cache,publicFiles:receipt.publicFileCount});
 return receipt;
}
try{
 for(const folder of ['assets','covers','games','js'])copy(folder);
 for(const file of ['package.json','index.html','game.html','manifest.webmanifest','sw.js','LICENSE','THIRD_PARTY_NOTICES.md','tools/build-public.mjs','tools/asset-sources.json','tools/fetch-public-assets.mjs'])copy(file);
 fs.writeFileSync(path.join(fixture,'no-network.mjs'),"globalThis.fetch=()=>{throw new Error('Unexpected external download in isolated fingerprint fixture');};\n");
 const manifest=JSON.parse(fs.readFileSync(path.join(fixture,'tools/asset-sources.json'),'utf8'));
 const assets=manifest.sources.flatMap(source=>source.entries||[source]);
 check('all eight prepared upstream outputs are independently hash-verified in the isolated fixture',()=>{
  assert.equal(assets.length,8);
  for(const asset of assets){const bytes=fs.readFileSync(path.join(fixture,asset.output));assert.equal(bytes.length,asset.bytes);assert.equal(sha(bytes),asset.sha256,asset.output);}
 });
 const first=build('initial');
 check('initial real build uses the version plus a 12-hex runtime fingerprint',()=>assert.match(first.cache,new RegExp('^wwg-'+first.version+'-[0-9a-f]{12}$')));
 const repeat=build('unchanged');
 check('unchanged repeat is stable even after --update-cache rewrites the source worker',()=>{assert.equal(repeat.cache,first.cache);assert.deepEqual(repeat.sha256,first.sha256);});
 const css=path.join(fixture,'assets/styles.css'),original=fs.readFileSync(css);
 fs.writeFileSync(css,Buffer.concat([original,Buffer.from('\n/* Isolated fingerprint regression: public bytes changed. */\n')]));
 const changed=build('public-css-changed');
 check('changing public bytes changes the cache key without changing the release version',()=>{assert.equal(changed.version,first.version);assert.notEqual(changed.cache,first.cache);});
 check('the changed runtime hashes are exactly the edited stylesheet and regenerated worker',()=>{
  assert.deepEqual(Object.keys(first.sha256),Object.keys(changed.sha256));
  assert.deepEqual(Object.keys(first.sha256).filter(p=>first.sha256[p]!==changed.sha256[p]).sort(),['assets/styles.css','sw.js']);
 });
 fs.writeFileSync(css,original);
 const restored=build('exact-source-revert');
 check('restoring original source bytes restores the original cache key and every public hash',()=>{assert.equal(restored.cache,first.cache);assert.deepEqual(restored.sha256,first.sha256);});
 check('the fixture publishes no build tools or source parts',()=>{
  assert(!fs.existsSync(path.join(fixture,'dist/tools')));assert(!fs.existsSync(path.join(fixture,'dist/source-assets')));
  assert(Object.keys(restored.sha256).every(p=>!p.startsWith('tools/')&&!p.startsWith('source-assets/')));
 });
 const result={ok:true,passed:checks.length,source:root,scope:'Actual build script in an isolated snapshot; verified generated assets copied; fetch disabled; no shared source or dist edits.',checks,builds};
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result,report:output}));
}finally{
 fs.rmSync(fixture,{recursive:true,force:true});
}
