/* Architect Industries - Aegis Verge F3D83 prelaunch save protection.
 * R and 1-3 are destructive mission reset/select shortcuts only after a run
 * actually starts. The launch briefing may already hold a valid saved relay.
 * Keep this policy independent of storage availability or the keyboard map.
 */
(function(root){
'use strict';
function mayReset(active,launchHidden){return active===true&&launchHidden===true;}
function protectedShortcut(code){return code==='KeyR'||/^Digit[1-3]$/.test(code||'');}
const api=Object.freeze({mayReset,protectedShortcut});
root.AegisLaunchResetGuard=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
