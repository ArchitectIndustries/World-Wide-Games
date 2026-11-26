/* Aegis Verge original tactical directional cues. Node, no Web Audio dependency. */
'use strict';
const assert=require('node:assert/strict');
const SP=require('../games/aegis-verge/spatial-threat.js');
const T=require('../games/aegis-verge/tactics.js');
let count=0;function ok(name,value){assert.ok(value,name);count++;}
const origin={x:0,z:0,yaw:0},pos=(x,z)=>SP.locate(origin,{x,z},[],T.firstCover);
const r=pos(15,0),l=pos(-15,0),a=pos(0,15),b=pos(0,-15);
ok('source to right classified RIGHT',r.direction==='RIGHT');ok('source to left classified LEFT',l.direction==='LEFT');
ok('source behind classified REAR',b.direction==='REAR');ok('source front classified AHEAD',a.direction==='AHEAD');
ok('right pan positive',r.pan>.9);ok('left pan negative',l.pan<-.9);ok('behind center pan',Math.abs(b.pan)<1e-7);
ok('pan clamped',Math.abs(r.pan)<=1);ok('gain positive',r.gain>0);ok('finite',Number.isFinite(r.distance));
ok('closer louder',pos(2,0).gain>r.gain);ok('rotation rotates right to behind',SP.locate({x:0,z:0,yaw:Math.PI/2},{x:15,z:0}).direction==='AHEAD');
ok('right in reverse',SP.locate({x:0,z:0,yaw:Math.PI},{x:-15,z:0}).direction==='RIGHT');
ok('invalid rejected',SP.locate({x:NaN,z:0,yaw:0},{x:3,z:0})===null);
const wall=[{x:7.5,z:0,w:2,d:5}],occ=SP.locate(origin,{x:15,z:0},wall,T.firstCover);
ok('real cover blocks cue',occ.occluded);ok('obstructed sound quieter',occ.gain<r.gain*.5);
ok('cover off trajectory does not muffle',!SP.locate(origin,{x:0,z:15},wall,T.firstCover).occluded);
const voices=[];class Node {constructor(){this.inputs=[];this.connections=[];this.gain=this.frequency=this.pan={value:0,setValueAtTime:(n)=>{this.gain=this.gain||{};this.lastValue=n},exponentialRampToValueAtTime:()=>{}};this.ended=false;}
 connect(node){this.connections.push(node);return node}disconnect() {this.disconnected=true}start(t){this.started=t}stop(t){this.stopped=t;voices.push(this)} }
class MockCtx {constructor(){this.state='suspended';this.currentTime=2;this.destination=new Node();this.created=[];this.filters=[];this.panners=[];}resume(){this.state='running';return Promise.resolve()}
 createOscillator(){const n=new Node();this.created.push(n);return n}createGain(){return new Node()}createStereoPanner(){const n=new Node();this.panners.push(n);return n}createBiquadFilter(){const n=new Node();this.filters.push(n);n.frequency={value:0};return n}}
const state=SP.create();ok('fresh session has no AudioContext',state.context===null);
ok('mute does not allocate context',SP.unlock(state,false,MockCtx)===false&&state.context===null);
ok('user start unlocks context',SP.unlock(state,true,MockCtx));
const heard=SP.signal(state,'lock',r,true);ok('cue labelled lock',heard.text.includes('HOSTILE LOCK'));
ok('cue has right bearing',heard.text.includes('RIGHT'));ok('event counted',state.events===1);
ok('real oscillator created',state.context.created.length===1);ok('panner created',state.context.panners.length===1);
ok('panner right value',state.context.panners[0].lastValue>.9);
ok('sound lasts under quarter second',voices[0].stopped-voices[0].started<.25);
ok('voice count starts one',state.activeVoices===1);
voices[0].onended();ok('voice releases on ended',state.activeVoices===0);
ok('voice disconnects',voices[0].disconnected);
SP.signal(state,'mine',occ,true);ok('occluded audio lowpass',state.context.filters.at(-1).frequency.value===760);
const muted=SP.signal(state,'surge',a,false);ok('muted still visual',muted.text.includes('RELAY SURGE'));
ok('muted creates no new oscillator',state.context.created.length===2);
SP.tick(state,.5);ok('cue clock simulation advances',state.remaining<1);
SP.tick(state,1);ok('cue expires',state.last===null&&state.remaining===0);
const visual=[];SP.signal(state,'volley',r,false);ok('calm visual two cubes',SP.render({cube:(...x)=>visual.push(x)},state,true)===2);
ok('visual creates at world source',visual.every(x=>x[0]>10));
const normal=[];ok('full visual six cubes',SP.render({cube:(...x)=>normal.push(x)},state,false)===6);
SP.reset(state);ok('reset hides cue',SP.render({cube:()=>{}},state,false)===0);
ok('invalid type no cue',SP.signal(state,'nope',r,false)===null);
console.log(JSON.stringify({passed:count,failed:0,title:'Aegis Verge F3D35 directional sound + visual bearings'}));
