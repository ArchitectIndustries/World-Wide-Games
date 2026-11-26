/* Architect Industries | Aegis Verge 2.28 | Wayback Echo
 * Original first-party, optional, non-authoritative replay overlay.
 * Never changes physical collision, AI, scores, unlocks or ranked eligibility.
 * Store only a bounded sample of a genuinely completed fresh operation.
 */
(function(root){
'use strict';
const PREFIX='wwg:aegis-verge:wayback-v1:', STEP=.25, MAX_SAMPLES=2400, MAX_SECONDS=600, LIMIT_BYTES=90000;
const finite=Number.isFinite;
const quant=v=>Math.round(v*100)/100;
function validSample(s,last=-1){return Array.isArray(s)&&s.length===4&&s.every(finite)&&s[0]>last&&s[0]>=0&&s[0]<=MAX_SECONDS&&Math.abs(s[1])<=38&&Math.abs(s[2])<=38&&Math.abs(s[3])<=Math.PI*8;}
function validate(record,operation){
 if(!record||record.v!==1||record.operation!==operation||!finite(record.duration)||record.duration<3||record.duration>MAX_SECONDS||!Array.isArray(record.samples)||record.samples.length<2||record.samples.length>MAX_SAMPLES)return null;
 let prev=-1;for(const s of record.samples){if(!validSample(s,prev))return null;prev=s[0];}
 if(record.samples[0][0]>.5||prev>record.duration+.001||record.duration-prev>1)return null;
 return {v:1,operation,duration:record.duration,samples:record.samples};
}
function create(){return {samples:[],next:0,eligible:false,previous:null,persisted:false};}
function reset(s,previous=null,eligible=true){s.samples=[];s.next=0;s.eligible=!!eligible;s.previous=previous;s.persisted=false;return s;}
function record(s,t,body){
 if(!s.eligible||!finite(t)||t<0||t>MAX_SECONDS||!body||![body.x,body.z,body.yaw].every(finite)||Math.abs(body.x)>38||Math.abs(body.z)>38||s.samples.length>=MAX_SAMPLES)return false;
 if(t+1e-7<s.next)return false;
 const at=quant(t),last=s.samples[s.samples.length-1];
 if(last&&at<=last[0])return false;
 s.samples.push([at,quant(body.x),quant(body.z),quant(Math.atan2(Math.sin(body.yaw),Math.cos(body.yaw)))]);s.next=t+STEP;return true;
}
function complete(s,operation,duration,store){
 if(!s.eligible||!Number.isInteger(operation)||operation<0||operation>2||!finite(duration)||duration<3||duration>MAX_SECONDS||s.samples.length<2)return {accepted:false,reason:'ineligible'};
 const candidate=validate({v:1,operation,duration:quant(duration),samples:s.samples},operation);
 if(!candidate)return {accepted:false,reason:'invalid'};
 if(s.previous&&s.previous.duration<=candidate.duration)return {accepted:false,reason:'slower'};
 s.previous=candidate;s.persisted=false;
 try{const storage=store(),value=JSON.stringify(candidate);if(value.length>LIMIT_BYTES)return {accepted:false,reason:'oversized'};
  storage.setItem(PREFIX+operation,value);
  s.persisted=storage.getItem(PREFIX+operation)===value;
 }catch(e){return {accepted:true,persisted:false,reason:'storage-unavailable'};}
 return {accepted:true,persisted:s.persisted,reason:s.persisted?'new-fastest':'storage-unavailable'};
}
function load(operation,store){
 if(!Number.isInteger(operation)||operation<0||operation>2)return null;
 try{const raw=store().getItem(PREFIX+operation);if(!raw||raw.length>LIMIT_BYTES)return null;return validate(JSON.parse(raw),operation);}catch{return null;}
}
function position(rec,t){
 if(!rec||!finite(t)||t<0||t>rec.duration)return null;
 const s=rec.samples;if(!s.length)return null;if(t<=s[0][0])return {x:s[0][1],z:s[0][2],yaw:s[0][3]};
 let lo=0,hi=s.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(s[mid][0]<=t)lo=mid;else hi=mid-1;}
 const a=s[lo],b=s[Math.min(lo+1,s.length-1)];if(b===a)return{x:a[1],z:a[2],yaw:a[3]};
 const u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));const diff=Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]));
 return {x:a[1]+(b[1]-a[1])*u,z:a[2]+(b[2]-a[2])*u,yaw:a[3]+diff*u};
}
const api=Object.freeze({PREFIX,STEP,MAX_SAMPLES,MAX_SECONDS,create,reset,record,complete,load,position,validate});
root.AegisReplayGhost=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
