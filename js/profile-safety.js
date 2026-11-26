/* Architect Industries · WorldWideGames homepage profile boundary.
 * Local profiles are untrusted JSON. This module performs bounded in-memory
 * normalization and supplies a truthful volatile overlay on Web Storage errors.
 * It never silently rewrites corrupted stored records on read.
 */
(() => {
  'use strict';
  const overlay = new Map();
  const notice = () => document.getElementById('storageNotice');
  let ephemeral = false;
  let malformed = false;
  const record = v => v !== null && typeof v === 'object' && !Array.isArray(v) &&
    (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  const number = (v, fallback=0) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e12 ? v : fallback;
  const count = v => Math.max(0, number(v));
  const slug = v => typeof v === 'string' && v.length <= 128 && /^[\w:-]+$/.test(v);
  const safeKey = k => typeof k === 'string' && k.length <= 140 && !['__proto__','prototype','constructor'].includes(k) && /^[\w:-]+$/.test(k);
  const shortText = (v, length=160) => typeof v === 'string' ? v.slice(0, length) : '';
  const pairs = v => record(v) ? Object.entries(v).slice(0, 1500).filter(([k]) => safeKey(k)) : [];
  const boundedList = (v, limit=200) => Array.isArray(v) ? v.slice(0, limit) : [];
  const ids = (v, limit=150) => [...new Set(boundedList(v,limit).filter(slug))];
  const numberMap = (v, nonnegative=true) => Object.fromEntries(pairs(v).filter(([,n]) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n)<=1e12 && (!nonnegative || n>=0)).map(([k,n]) => [k,n]));
  const prefsDefault = {reducedMotion:false, muted:false, volume:.7, highContrast:false, textScale:1};
  function normalize(key, value, fallback) {
    if (['wwg:favorites','wwg:recent','wwg:play-later'].includes(key)) return ids(value);
    if (key === 'wwg:run-history') return boundedList(value,20).filter(record).map(r => ({
      id:slug(r.id)?r.id:'', score:number(r.score), event:shortText(r.event||'run'),
      at:shortText(r.at,60), duration:r.duration==null?null:count(r.duration),
      meta:record(r.meta)?Object.fromEntries(pairs(r.meta).filter(([,v])=>['string','number','boolean'].includes(typeof v)).slice(0,20)):{}
    })).filter(r=>r.id);
    if (['wwg:plays','wwg:ratings','wwg:events','wwg:playtime','wwg:daily-playtime'].includes(key)) {
      const map = numberMap(value, key!=='wwg:ratings');
      if(key==='wwg:ratings') return Object.fromEntries(Object.entries(map).filter(([,n])=>Number.isInteger(n)&&n>=1&&n<=5));
      return map;
    }
    if(key==='wwg:scores') return numberMap(value,false);
    if(key==='wwg:daily-game-playtime') return Object.fromEntries(pairs(value).map(([k,v])=>[k,numberMap(v)]));
    if(key==='wwg:sessions') return Object.fromEntries(pairs(value).filter(([,v])=>record(v)).map(([k,v])=>[k,{count:count(v.count),last:count(v.last),longest:count(v.longest)}]));
    if(key==='wwg:score-runs') return Object.fromEntries(pairs(value).filter(([,v])=>record(v)&&typeof v.score==='number'&&Number.isFinite(v.score)).map(([k,v])=>[k,{
      score:number(v.score),event:shortText(v.event),at:shortText(v.at,60),duration:v.duration==null?null:count(v.duration)
    }]));
    if(key==='wwg:daily') return Object.fromEntries(pairs(value).filter(([,v])=>record(v)).map(([k,v])=>[k,{
      plays:count(v.plays),unique:ids(v.unique),brain:count(v.brain),milestones:count(v.milestones),
      ratings:count(v.ratings),eventKeys:ids(v.eventKeys,400)
    }]));
    if(key==='wwg:prefs') {const v=record(value)?value:{};return {
      reducedMotion:typeof v.reducedMotion==='boolean'?v.reducedMotion:false,
      muted:typeof v.muted==='boolean'?v.muted:false,
      volume:typeof v.volume==='number'&&Number.isFinite(v.volume)?Math.max(0,Math.min(1,v.volume)):.7,
      highContrast:typeof v.highContrast==='boolean'?v.highContrast:false,
      textScale:typeof v.textScale==='number'&&Number.isFinite(v.textScale)?Math.max(.9,Math.min(1.25,v.textScale)):1
    };}
    if(key==='wwg:keymap') return Object.fromEntries(pairs(value).filter(([,v])=>typeof v==='string'&&v.length<30));
    if(key==='wwg:mixes') return count(value);
    if(Array.isArray(fallback)) return Array.isArray(value)?value:fallback;
    if(record(fallback)) return record(value)?value:fallback;
    if(typeof fallback==='number') return number(value,fallback);
    return typeof value===typeof fallback?value:fallback;
  }
  const recordKeys = new Set(['wwg:plays','wwg:ratings','wwg:events','wwg:playtime','wwg:daily-playtime','wwg:daily-game-playtime','wwg:sessions','wwg:scores','wwg:score-runs','wwg:daily','wwg:prefs','wwg:keymap']);
  const listKeys = new Set(['wwg:favorites','wwg:recent','wwg:play-later','wwg:run-history']);
  function refreshNotice() {
    const n=notice();if(!n)return;
    n.hidden=!(ephemeral||malformed);
    n.textContent=ephemeral ? 'Browser profile storage is unavailable or full. Favorites, preferences and other changes on this page may disappear after reload. Export your profile to keep a copy.' : 'Some saved profile data has an unexpected format and is being safely ignored for this page. Existing stored data was not deleted; export a copy before replacing it.';
  }
  function persistenceError() { ephemeral=true;refreshNotice(); }
  const storage={
    getItem(k) {
      if(overlay.has(k))return overlay.get(k);
      try {return window.localStorage.getItem(k);}catch{persistenceError();return null;}
    },
    setItem(k,v) {
      const s=String(v);
      try {window.localStorage.setItem(k,s);overlay.delete(k);return true;}
      catch {overlay.set(k,s);persistenceError();return false;}
    },
    removeItem(k) {
      try {window.localStorage.removeItem(k);overlay.delete(k);return true;}
      catch {overlay.set(k,null);persistenceError();return false;}
    },
    key(i) {return Array.from(allKeys())[i]||null;},
    get length(){return allKeys().size;}
  };
  function allKeys(){
    const keys=new Set();
    try {const n=window.localStorage.length;for(let i=0;i<Math.min(n,10000);i++){const k=window.localStorage.key(i);if(k!==null)keys.add(k);}}catch{persistenceError();}
    for(const [k,v] of overlay){if(v===null)keys.delete(k);else keys.add(k);}
    return keys;
  }
  function load(key,fallback){
    const value=storage.getItem(key);
    if(value===null)return fallback;
    try {
      const parsed=JSON.parse(value);
      if((recordKeys.has(key)&&!record(parsed))||(listKeys.has(key)&&!Array.isArray(parsed))||(key==='wwg:mixes'&&typeof parsed!=='number')){malformed=true;refreshNotice();return fallback;}
      return normalize(key,parsed,fallback);
    } catch {malformed=true;refreshNotice();return fallback;}
  }
  function validImportShape(key, v) {
    if(listKeys.has(key)){
      if(!Array.isArray(v)||v.length>1500)return false;
      if(key==='wwg:run-history')return v.every(r=>record(r)&&slug(r.id)&&typeof r.score==='number'&&Number.isFinite(r.score)&&(!r.meta||record(r.meta)));
      return v.every(slug);
    }
    if(recordKeys.has(key)){
      if(!record(v)||Object.keys(v).length>1500)return false;
      if(['wwg:plays','wwg:ratings','wwg:events','wwg:playtime','wwg:daily-playtime','wwg:scores'].includes(key))
        return Object.entries(v).every(([id,n])=>safeKey(id)&&typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e12&&(key!=='wwg:ratings'||(n>=1&&n<=5&&Number.isInteger(n))));
      if(key==='wwg:daily-game-playtime')return Object.values(v).every(n=>record(n)&&Object.values(n).every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0));
      if(key==='wwg:sessions')return Object.values(v).every(x=>record(x)&&['count','last','longest'].every(n=>x[n]===undefined||(typeof x[n]==='number'&&Number.isFinite(x[n])&&x[n]>=0)));
      if(key==='wwg:score-runs')return Object.values(v).every(x=>record(x)&&typeof x.score==='number'&&Number.isFinite(x.score));
      if(key==='wwg:daily')return Object.values(v).every(x=>record(x)&&Array.isArray(x.unique)&&x.unique.every(slug)&&Array.isArray(x.eventKeys)&&x.eventKeys.every(slug));
      if(key==='wwg:prefs')return ['reducedMotion','muted','highContrast'].every(n=>v[n]===undefined||typeof v[n]==='boolean')&&['volume','textScale'].every(n=>v[n]===undefined||(typeof v[n]==='number'&&Number.isFinite(v[n])));
      if(key==='wwg:keymap')return Object.values(v).every(x=>typeof x==='string'&&x.length<30);
    }
    return key==='wwg:mixes'?typeof v==='number'&&Number.isFinite(v)&&v>=0:true;
  }
  function validateImport(raw) {
    if(!record(raw)||!record(raw.data)||Object.keys(raw.data).length>2000)throw new Error('Invalid profile envelope');
    const entries=[];let bytes=0;
    for(const [k,v] of Object.entries(raw.data)){
      if(!k.startsWith('wwg:'))continue;
      if(k.length>200 || k==='wwg:__proto__' || typeof v!=='string' || v.length>1000000)throw new Error('Invalid profile value');
      bytes+=k.length+v.length;if(bytes>3000000)throw new Error('Profile too large');
      if(recordKeys.has(k)||listKeys.has(k)||k==='wwg:mixes'){
        const decoded=JSON.parse(v);
        if((recordKeys.has(k)&&!record(decoded))||(listKeys.has(k)&&!Array.isArray(decoded))||(k==='wwg:mixes'&&typeof decoded!=='number'))throw new Error('Invalid profile schema');
        // Verify the input before any writes. Historical extra metadata is okay.
        if(!validImportShape(k,decoded))throw new Error('Invalid profile fields');
      }
      entries.push([k,v]);
    }
    if(!entries.length)throw new Error('No supported profile entries');
    return entries;
  }
  // A failed import must not reload, overwrite memory state, or knowingly leave
  // a partially committed native profile. Back up old values and roll back on
  // failure; reporting still warns if browser storage itself denies rollback.
  function importProfile(raw){
    let entries, native, backup;
    try {
      entries=validateImport(raw);
      native=window.localStorage;
      backup=entries.map(([k])=>[k,native.getItem(k)]);
      const applied=[];
      try {
        for(const [k,v] of entries){native.setItem(k,v);applied.push(k);}
      } catch(err){
        for(const k of applied)try{native.removeItem(k)}catch{persistenceError();}
        for(const [k,v] of backup)try{if(v===null)native.removeItem(k);else native.setItem(k,v)}catch{persistenceError();}
        throw err;
      }
      for(const [k] of entries)overlay.delete(k);
      return {ok:true,count:entries.length};
    }catch(e){if(e?.name==='QuotaExceededError'||e?.name==='SecurityError'||!native)persistenceError();return {ok:false,error:e?.message||'Import failed'};}
  }
  window.WWG_PROFILE_SAFETY={storage,load,importProfile,validateImport,normalize};
})();
