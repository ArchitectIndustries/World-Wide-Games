/* Architect Industries original Aegis Verge F3D62: gamepad neutral/identity interlock.
 * A newly seen controller must release EVERY mapped gameplay action before
 * its button edges can invoke game actions. Pure state checks, no external code.
 */
(function(root){
'use strict';
const ACTION_BUTTONS=Object.freeze([0,1,2,3,4,5,8,9,11,12,13,14,15]);
function identity(pad){
 if(!pad||pad.connected===false||!Number.isInteger(pad.index)||pad.index<0)return null;
 return String(pad.index)+'|'+(typeof pad.id==='string'?pad.id:'');
}
function neutral(pad){
 if(identity(pad)===null)return false;
 const axes=pad.axes,buttons=pad.buttons;
 if(!axes||!buttons||typeof buttons.length!=='number')return false;
 const x=axes[0]===undefined?0:axes[0],y=axes[1]===undefined?0:axes[1];
 if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>=.18||Math.abs(y)>=.18)return false;
 return ACTION_BUTTONS.every(i=>{
  const b=buttons[i];return !b||!(b.pressed===true||(Number.isFinite(b.value)&&b.value>.5));
 });
}
const api=Object.freeze({ACTION_BUTTONS,identity,neutral});
root.AegisGamepadNeutral=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
