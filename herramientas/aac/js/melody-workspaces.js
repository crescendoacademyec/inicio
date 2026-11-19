/* Private per-edition drafts: switching a melody never reuses another song's analysis. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACMelodyWorkspaces=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const title=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 function keyFor(melody){
  if(!melody?.id||!melody.originalXml)return null;
  let hash=2166136261;for(const char of melody.originalXml)hash=Math.imul(hash^char.charCodeAt(0),16777619);
  return `${melody.id}:${(hash>>>0).toString(16)}`;
 }
 function matches(state,melody){const doc=state?.document;return !!(doc?.melody&&keyFor(doc.melody)===keyFor(melody)&&title(doc.title)===title(melody.title));}
 function withEditionMetadata(state,edition){
  if(!matches(state,edition))throw Error('El borrador no corresponde a esta edición.');
  const updated=structuredClone(state),melody=updated.document.melody;
  for(const key of ['sourceImage','sourceFile','sourceFormat','sourceLabel','sourceBook','printedPage','pdfPage']){
   if(Object.hasOwn(edition,key))melody[key]=edition[key];else delete melody[key];
  }
  return updated;
 }
 function createStore(storage=globalThis.indexedDB){
  const memory=new Map();let database;
  const open=()=>database||(database=new Promise((resolve,reject)=>{if(!storage){reject(Error('Almacenamiento privado no disponible.'));return;}const r=storage.open('aac-melody-workspaces',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Almacenamiento privado bloqueado.'));}));
  async function request(mode,action){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts',mode),r=action(tx.objectStore('drafts'));let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('No se pudo guardar el borrador.'));});}
  return {
   async save(state){const melody=state?.document?.melody,key=keyFor(melody);if(!key||!matches(state,melody))return false;const record={key,state:structuredClone(state),updatedAt:Date.now()};memory.set(key,record);try{await request('readwrite',store=>store.put(record));return true;}catch{return false;}},
   async load(melody){const key=keyFor(melody);if(!key)return null;let record=memory.get(key);if(!record)try{record=await request('readonly',store=>store.get(key));}catch{}return matches(record?.state,melody)?structuredClone(record.state):null;}
  };
 }
 return {keyFor,matches,withEditionMetadata,createStore};
});
