/* Cyber Wars 0.66: local archive reading and a derived district record.
 * Reading never writes gameplay, currency, skill ranks or checkpoint storage.
 */
(function(root){
'use strict';
function districtRecord(state){
 if(state.mission===0)return [{text:'Meet the Viridian steward',done:false}];
 if(state.mission===1)return [
  {text:'Study the Pilot manual',done:!!state.pilotManualFound},
  {text:`Tune relic cores · ${state.cores}/3`,done:state.cores>=3},
  {text:'Report back to the steward',done:false}
 ];
 if(state.mission===2)return (state.obelisks||[]).map((on,i)=>({text:`Restore Solar Obelisk ${i+1}`,done:!!on}));
 if(state.mission===3)return [{text:'Disable the Relic Warden at the southern ruin',done:!!state.bossDefeated}];
 if(!state.ownsHome)return [{text:'Establish an owned home · 100.000 credits',done:false}];
 if(!state.sliceComplete)return [{text:'Return to your owned home and save the checkpoint',done:false}];
 if(state.surveyActive)return [{text:`Inspect survey beacons · ${state.surveyStage}/3`,done:state.surveyStage>=3},{text:'Return to the steward for the verified survey reward',done:false}];
 return [{text:'Viridia foothold established',done:true},{text:'Ask the steward about the next field survey',done:false}];
}
function create(options){
 const {document:doc,collection,getState,enter,leave,openManual,getPad}=options;
 const $=id=>doc.getElementById(id),dialog=$('canopyArchive'),catalog=$('canopyCatalog'),reading=$('canopyReading'),text=$('canopyText');
 const books=collection.readings,visited=new Set();let current=-1,token=null,font=1,padBefore={},catalogButtons=[];
 const buttons=()=>current<0?[...catalogButtons,$('canopyPilot'),$('canopyClose')]:[$('canopyBack'),$('canopyPrevious'),$('canopyNext'),$('canopySmaller'),$('canopyLarger'),$('canopyClose')];
 const padState=()=>{const g=getPad?.();if(!g||g.mapping!=='standard')return {};const b=g.buttons||[],a=g.axes||[];return {confirm:!!b[0]?.pressed,back:!!b[1]?.pressed,start:!!b[9]?.pressed,left:!!b[14]?.pressed||(a[0]||0)<-.65,right:!!b[15]?.pressed||(a[0]||0)>.65,up:!!b[12]?.pressed||(a[1]||0)<-.65,down:!!b[13]?.pressed||(a[1]||0)>.65};};
 function refreshCatalog(){
  const state=getState();$('canopyWelcome').textContent=state.pilotManualFound?'You know where the Pilot path begins. These shelves hold stories, observations and a guide to the hundred-credit roof.':'Begin with the Pilot manual when you are ready to train. The other volumes are readings from the archive.';
  $('canopyPilotState').textContent=state.pilotManualFound?`Pilot Rank ${state.pilotRank}/10 · browse the manual`:'Study the opening pages to begin Pilot Rank 1';
  for(let i=0;i<catalogButtons.length;i++)catalogButtons[i].setAttribute('aria-label',books[i].title+(visited.has(books[i].id)?' · opened this visit':''));
 }
 function showCatalog(focus=true){current=-1;catalog.hidden=false;reading.hidden=true;refreshCatalog();if(focus)(catalogButtons[0]||$('canopyPilot')).focus();}
 function showBook(index,focus=true){
  current=(index+books.length)%books.length;const book=books[current];visited.add(book.id);
  catalog.hidden=true;reading.hidden=false;$('canopyBookTitle').textContent=book.title;
  $('canopyBookMeta').textContent=`${book.category} · ${book.author}`;
  $('canopyBookOrigin').textContent=book.origin==='viridia'?'Viridian shelf':'Shared archive';
  text.innerHTML='';for(const paragraph of book.paragraphs){const p=doc.createElement('p');p.textContent=paragraph;text.appendChild(p);}
  $('canopyPosition').textContent=`Reading ${current+1} of ${books.length}`;
  text.scrollTop=0;if(focus)text.focus();
 }
 function changeSize(delta){font=Math.max(.9,Math.min(1.35,Math.round((font+delta)*100)/100));text.style.fontSize=(font*100)+'%';$('canopySmaller').disabled=font<=.9;$('canopyLarger').disabled=font>=1.35;}
 function close(){if(!dialog.open)return false;dialog.close();return true;}
 function open(id=null){
  if(dialog.open)return false;token=enter();if(!token)return false;
  const index=books.findIndex(b=>b.id===id);if(index>=0)showBook(index,false);else showCatalog(false);
  padBefore=padState();dialog.showModal();if(current<0)(catalogButtons[0]||$('canopyPilot')).focus();else text.focus();return true;
 }
 function cycleFocus(direction){const list=buttons().filter(b=>!b.disabled&&!b.hidden);let i=list.indexOf(doc.activeElement);i=i<0?(direction>0?-1:0):i;list[(i+direction+list.length)%list.length]?.focus();}
 function handleKey(event){
  if(!dialog.open)return false;
  if(event.ctrlKey||event.metaKey||event.altKey)return true;
  if(event.code==='Escape'||event.code==='KeyP'){event.preventDefault();if(!event.repeat)close();return true;}
  if(current<0&&['ArrowUp','ArrowDown'].includes(event.code)){event.preventDefault();if(!event.repeat)cycleFocus(event.code==='ArrowDown'?1:-1);}
  if(current>=0&&['ArrowLeft','ArrowRight'].includes(event.code)){event.preventDefault();if(!event.repeat)showBook(current+(event.code==='ArrowRight'?1:-1));}
  return true;
 }
 function pollPad(){
  if(!dialog.open)return false;const next=padState(),edge=k=>next[k]&&!padBefore[k];
  // Record the whole current sample before an action may close/change a menu.
  const actions={confirm:edge('confirm'),back:edge('back'),start:edge('start'),left:edge('left'),right:edge('right'),up:edge('up'),down:edge('down')};padBefore=next;
  if(actions.back||actions.start){close();return true;}
  if(current>=0&&(actions.left||actions.right)){showBook(current+(actions.right?1:-1));return true;}
  if(actions.up||actions.down){
   if(current>=0&&doc.activeElement===text){text.scrollTop=Math.max(0,(text.scrollTop||0)+(actions.down?160:-160));}
   else cycleFocus(actions.down?1:-1);
  }
  if(actions.confirm){if(current>=0&&doc.activeElement===text)$('canopyBack').focus();else if(buttons().includes(doc.activeElement))doc.activeElement.click();}
  return true;
 }
 for(let i=0;i<books.length;i++){
  const book=books[i],button=doc.createElement('button');button.type='button';button.className='canopy-book';button.setAttribute('data-book',book.id);
  const title=doc.createElement('strong'),type=doc.createElement('span');title.textContent=book.title;type.textContent=book.category;button.appendChild(title);button.appendChild(type);
  button.onclick=()=>showBook(i);$('canopyBooks').appendChild(button);catalogButtons.push(button);
 }
 $('canopyClose').onclick=close;$('canopyBack').onclick=()=>showCatalog();$('canopyPrevious').onclick=()=>showBook(current-1);$('canopyNext').onclick=()=>showBook(current+1);
 $('canopySmaller').onclick=()=>changeSize(-.1);$('canopyLarger').onclick=()=>changeSize(.1);
 $('canopyPilot').onclick=()=>{close();openManual();};
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('close',()=>{const old=token;token=null;padBefore=padState();leave(old);});
 return {open,close,handleKey,pollPad,absorbPad:()=>{padBefore=padState();},isOpen:()=>dialog.open,selectedBook:()=>current<0?null:books[current]?.id,inspect:()=>({open:dialog.open,current,visited:[...visited],font})};
}
const api={create,districtRecord};root.CWCanopyArchive=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
