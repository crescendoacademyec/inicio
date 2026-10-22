(function(root){'use strict';
 const instruments=Object.freeze({piano:{name:'Piano',bank:'acoustic_grand_piano'},guitar:{name:'Guitarra',bank:'acoustic_guitar_nylon'},bass:{name:'Bajo',bank:'electric_bass_finger'},violin:{name:'Violín',bank:'violin'},ukulele:{name:'Ukelele',bank:'acoustic_guitar_nylon',short:true}});
 const normalize=id=>Object.hasOwn(instruments,id)?id:'piano';
 function readPreference(){try{return normalize(root.localStorage?.getItem('crescendo-editor-instrument'));}catch{return 'piano';}}
 function remember(id){try{root.localStorage?.setItem('crescendo-editor-instrument',normalize(id));}catch{}}
 function createLoader({getContext,loadInstrument,createOutput}){
  const cache=new Map();
  return async function load(id,{preload=false}={}){
   id=normalize(id);const context=getContext();if(!context)return null;
   if(!preload&&context.state==='suspended')await context.resume();
   if(!cache.has(id))cache.set(id,Promise.resolve().then(()=>loadInstrument(context,instruments[id].bank)).then(instrument=>createOutput(instrument,context,instruments[id])).catch(error=>{cache.delete(id);throw error;}));
   const output=await cache.get(id);output.recalibrate?.();return output;
  };
 }
 const api={instruments,normalize,readPreference,remember,createLoader};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreInstruments=api;
})(typeof window==='undefined'?globalThis:window);
