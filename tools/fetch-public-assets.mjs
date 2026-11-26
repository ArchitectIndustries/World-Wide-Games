import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const registryURL='https://registry.npmjs.org/three/-/three-0.187.0.tgz';
const materialRoot='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/';
const approvedFiles=new Map([
  [materialRoot+'forrest_ground_01/forrest_ground_01_diff_1k.jpg','assets/materials/forest-color.jpg'],
  [materialRoot+'forrest_ground_01/forrest_ground_01_nor_gl_1k.jpg','assets/materials/forest-normal.jpg'],
  [materialRoot+'forrest_ground_01/forrest_ground_01_rough_1k.jpg','assets/materials/forest-roughness.jpg'],
  [materialRoot+'mossy_rock/mossy_rock_diff_1k.jpg','assets/materials/rock-color.jpg'],
  [materialRoot+'mossy_rock/mossy_rock_nor_gl_1k.jpg','assets/materials/rock-normal.jpg'],
  [materialRoot+'mossy_rock/mossy_rock_rough_1k.jpg','assets/materials/rock-roughness.jpg']
]);
const approvedEntries=new Map([
  ['package/build/three.core.js','assets/vendor/three-r187/three.core.js'],
  ['package/build/three.module.js','assets/vendor/three-r187/three.module.js']
]);
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function integrityDescriptor(value){
  return record(value)&&Number.isSafeInteger(value.bytes)&&value.bytes>0&&value.bytes<=16*1024*1024&&typeof value.sha256==='string'&&/^[a-f0-9]{64}$/.test(value.sha256);
}

export function validateSources(manifest){
  if(!record(manifest)||manifest.schema!==1||!Array.isArray(manifest.sources)||manifest.sources.length!==7)throw new Error('Missing or invalid approved public asset sources');
  const urls=new Set(),outputs=new Set();
  for(const source of manifest.sources){
    if(!integrityDescriptor(source)||typeof source.url!=='string'||urls.has(source.url))throw new Error('Invalid or duplicate public source');
    urls.add(source.url);
    if(source.format==='file'){
      if(approvedFiles.get(source.url)!==source.output)throw new Error('Unapproved public asset source or output: '+source.url);
      if(outputs.has(source.output))throw new Error('Duplicate generated output');outputs.add(source.output);
    }else if(source.format==='tar.gz'){
      if(source.url!==registryURL||!Array.isArray(source.entries)||source.entries.length!==2)throw new Error('Unapproved public archive source');
      const entries=new Set();
      for(const entry of source.entries){
        if(!integrityDescriptor(entry)||approvedEntries.get(entry.entry)!==entry.output||entries.has(entry.entry)||outputs.has(entry.output))throw new Error('Unapproved archive entry or generated output');
        entries.add(entry.entry);outputs.add(entry.output);
      }
    }else throw new Error('Unapproved public source format');
  }
  if(urls.size!==7||outputs.size!==8||!urls.has(registryURL)||[...approvedFiles.keys()].some(url=>!urls.has(url)))throw new Error('Missing approved public asset source');
  return manifest.sources;
}

function verifyBytes(bytes,descriptor,label){
  if(bytes.length!==descriptor.bytes||sha(bytes)!==descriptor.sha256)throw new Error('Public asset integrity mismatch: '+label);
  return bytes;
}
function safeOutput(root,relative){
  const parts=relative.split('/');let current=root;
  for(const part of parts){
    current=path.join(current,part);
    try{if(fs.lstatSync(current).isSymbolicLink())throw new Error('Generated asset symlink is not allowed: '+relative);}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return current;
}
function readVerifiedLocal(root,descriptor){
  const filename=safeOutput(root,descriptor.output);
  if(!fs.existsSync(filename))return null;
  if(!fs.lstatSync(filename).isFile())throw new Error('Generated asset is not a file: '+descriptor.output);
  const stat=fs.statSync(filename);if(stat.size!==descriptor.bytes)return null;
  const bytes=fs.readFileSync(filename);return sha(bytes)===descriptor.sha256?bytes:null;
}
function octal(bytes,label){
  const value=bytes.toString('ascii').replace(/\0.*$/s,'').trim();
  if(!/^[0-7]+$/.test(value))throw new Error('Invalid tar '+label);
  const number=parseInt(value,8);if(!Number.isSafeInteger(number)||number<0)throw new Error('Oversized tar '+label);return number;
}
function tarText(bytes){
  const end=bytes.indexOf(0),text=bytes.subarray(0,end<0?bytes.length:end).toString('utf8');
  if(/[\u0000-\u001f\\\ufffd]/.test(text))throw new Error('Invalid tar path encoding');return text;
}
function extractApprovedEntries(archive,entries){
  // Nothing is unpacked to disk. Only two exact, regular-file entry names are
  // copied from a bounded, checksummed tar stream; links and extensions fail.
  const tar=gunzipSync(archive,{maxOutputLength:32*1024*1024}),wanted=new Map(entries.map(e=>[e.entry,e])),found=new Map(),seen=new Set();
  let offset=0,ended=false,count=0;
  while(offset+512<=tar.length){
    const header=tar.subarray(offset,offset+512);
    if(header.every(byte=>byte===0)){
      if(offset+1024>tar.length||!tar.subarray(offset).every(byte=>byte===0))throw new Error('Invalid tar end marker');ended=true;break;
    }
    if(++count>10000)throw new Error('Too many tar entries');
    const checksum=octal(header.subarray(148,156),'checksum');let actual=0;
    for(let i=0;i<512;i++)actual+=i>=148&&i<156?32:header[i];
    if(actual!==checksum)throw new Error('Tar header checksum mismatch');
    if(header.subarray(257,262).toString('ascii')!=='ustar')throw new Error('Unsupported tar header');
    const name=tarText(header.subarray(0,100)),prefix=tarText(header.subarray(345,500)),filename=prefix?prefix+'/'+name:name;
    if(!filename.startsWith('package/')||filename.startsWith('/')||filename.split('/').some(part=>part==='..'||part==='.')||seen.has(filename))throw new Error('Unapproved or duplicate tar path');
    seen.add(filename);
    const type=header[156],size=octal(header.subarray(124,136),'size');
    if(type!==0&&type!==48&&type!==53)throw new Error('Tar links and extended entries are not allowed');
    if(type===53&&size!==0)throw new Error('Nonempty tar directory');
    const start=offset+512,end=start+size,next=start+Math.ceil(size/512)*512;
    if(end>tar.length||next>tar.length)throw new Error('Truncated tar entry');
    if(wanted.has(filename)){
      if(type===53)throw new Error('Requested tar entry is not a regular file');
      const descriptor=wanted.get(filename),bytes=Buffer.from(tar.subarray(start,end));
      found.set(filename,verifyBytes(bytes,descriptor,filename));
    }
    offset=next;
  }
  if(!ended||found.size!==wanted.size)throw new Error('Missing approved tar entries or end marker');
  return found;
}

async function download(source,{fetchImpl,timeoutMs,attempts}){
  for(let attempt=1;attempt<=attempts;attempt++){
    const controller=new AbortController();let timer;
    try{
      const request=(async()=>{
        const response=await fetchImpl(source.url,{method:'GET',redirect:'error',credentials:'omit',signal:controller.signal,headers:{Accept:'application/octet-stream'}});
        if(response.status!==200){const error=new Error('Public asset download status '+response.status+': '+source.url);error.retryable=response.status===429||response.status>=500;throw error;}
        const declared=response.headers?.get('content-length');
        if(declared!==null&&declared!==undefined&&(!/^\d+$/.test(declared)||Number(declared)!==source.bytes))throw new Error('Public asset byte count mismatch: '+source.url);
        if(!response.body||typeof response.body.getReader!=='function')throw new Error('Missing public asset response body');
        const reader=response.body.getReader(),chunks=[];let total=0;
        try{
          while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>source.bytes)throw new Error('Oversized public asset response');chunks.push(Buffer.from(value));}
        }finally{try{await reader.cancel();}catch{}}
        return verifyBytes(Buffer.concat(chunks,total),source,source.url);
      })();
      const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();const error=new Error('Public asset download timeout: '+source.url);error.retryable=true;reject(error);},timeoutMs);});
      return await Promise.race([request,timeout]);
    }catch(error){
      const retryable=error.retryable===true||error instanceof TypeError||error.name==='AbortError';
      if(!retryable||attempt===attempts)throw error;
      await delay(250*attempt);
    }finally{clearTimeout(timer);controller.abort();}
  }
  throw new Error('Public asset download failed');
}

/** Build-only public downloads. Runtime URLs always point to local assets. */
export async function prepareAssets({root=projectRoot,fetchImpl=globalThis.fetch,timeoutMs=15000,attempts=2}={}){
  if(typeof fetchImpl!=='function'||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000||!Number.isInteger(attempts)||attempts<1||attempts>3)throw new Error('Invalid bounded public asset fetch configuration');
  root=path.resolve(root);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/asset-sources.json'),'utf8')),sources=validateSources(manifest),pending=[];
  let downloadedSources=0,reusedOutputs=0,totalBytes=0;
  // Verify all planned paths before performing any network request or write.
  for(const source of sources)for(const output of source.format==='file'?[source]:source.entries)safeOutput(root,output.output);
  for(const source of sources){
    const outputs=source.format==='file'?[source]:source.entries,missing=outputs.filter(output=>!readVerifiedLocal(root,output));
    totalBytes+=outputs.reduce((sum,o)=>sum+o.bytes,0);reusedOutputs+=outputs.length-missing.length;
    if(!missing.length)continue;
    const bytes=await download(source,{fetchImpl,timeoutMs,attempts});downloadedSources++;
    if(source.format==='file')pending.push({descriptor:source,bytes});
    else {const extracted=extractApprovedEntries(bytes,source.entries);for(const descriptor of missing)pending.push({descriptor,bytes:extracted.get(descriptor.entry)});}
  }
  // No output is changed until every required download and archive entry passed.
  for(const {descriptor,bytes} of pending){
    const output=safeOutput(root,descriptor.output);fs.mkdirSync(path.dirname(output),{recursive:true});const temporary=output+'.prepare-'+process.pid;let created=false;
    try{const fd=fs.openSync(temporary,'wx');created=true;try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}fs.renameSync(temporary,output);created=false;}
    finally{if(created)fs.unlinkSync(temporary);}
  }
  return{assets:8,bytes:totalBytes,downloadedSources,reusedOutputs};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await prepareAssets()));
