(function(root){'use strict';
 // Pitches in the score are written pitches. Transposition is applied once,
 // at the sound boundary, and reversed when orchestrating a concert pitch.
 const instruments=Object.freeze(Object.fromEntries(Object.entries({
  piano:{name:'Piano',bank:'acoustic_grand_piano',program:1,family:'Teclados'},
  guitar:{name:'Guitarra',bank:'acoustic_guitar_nylon',program:25,transpose:-12,diatonic:-7,family:'Cuerdas pulsadas'},
  requinto:{name:'Requinto',bank:'acoustic_guitar_nylon',program:25,transpose:-7,diatonic:-4,family:'Cuerdas pulsadas'},
  bass:{name:'Bajo eléctrico',bank:'electric_bass_finger',program:34,family:'Cuerdas pulsadas',clef:'clef-f'},
  violin:{name:'Violín',bank:'violin',program:41,family:'Cuerdas frotadas'},
  ukulele:{name:'Ukelele',bank:'acoustic_guitar_nylon',program:25,short:true,family:'Cuerdas pulsadas'},
  viola:{name:'Viola',bank:'viola',program:42,clef:'clef-c',family:'Cuerdas frotadas'},
  cello:{name:'Violonchelo',bank:'cello',program:43,clef:'clef-f',family:'Cuerdas frotadas'},
  contrabass:{name:'Contrabajo',bank:'contrabass',program:44,clef:'clef-f',transpose:-12,diatonic:-7,family:'Cuerdas frotadas'},
  trumpet:{name:'Trompeta en Si♭',bank:'trumpet',program:57,transpose:-2,diatonic:-1,family:'Viento metal'},
  trombone:{name:'Trombón',bank:'trombone',program:58,clef:'clef-f',family:'Viento metal'},
  horn:{name:'Trompa en Fa',bank:'french_horn',program:61,transpose:-7,diatonic:-4,family:'Viento metal'},
  tuba:{name:'Tuba',bank:'tuba',program:59,clef:'clef-f',family:'Viento metal'},
  sopranoSax:{name:'Saxofón soprano en Si♭',bank:'soprano_sax',program:65,transpose:-2,diatonic:-1,family:'Viento madera'},
  altoSax:{name:'Saxofón alto en Mi♭',bank:'alto_sax',program:66,transpose:-9,diatonic:-5,family:'Viento madera'},
  tenorSax:{name:'Saxofón tenor en Si♭',bank:'tenor_sax',program:67,transpose:-14,diatonic:-8,family:'Viento madera'},
  baritoneSax:{name:'Saxofón barítono en Mi♭',bank:'baritone_sax',program:68,transpose:-21,diatonic:-12,family:'Viento madera'},
  flute:{name:'Flauta',bank:'flute',program:74,family:'Viento madera'},
  piccolo:{name:'Flautín',bank:'piccolo',program:73,transpose:12,diatonic:7,family:'Viento madera'},
  clarinet:{name:'Clarinete en Si♭',bank:'clarinet',program:72,transpose:-2,diatonic:-1,family:'Viento madera'},
  oboe:{name:'Oboe',bank:'oboe',program:69,family:'Viento madera'},
  bassoon:{name:'Fagot',bank:'bassoon',program:71,clef:'clef-f',family:'Viento madera'},
  vibraphone:{name:'Vibráfono',bank:'vibraphone',program:12,family:'Teclados'}
 }).map(([id,sound])=>[id,Object.freeze({clef:'clef-g',transpose:0,diatonic:0,...sound})])));
 const normalize=id=>Object.hasOwn(instruments,id)?id:'piano';
 function readPreference(){try{return normalize(root.localStorage?.getItem(root.JMLScoreWorkspace?.storageKey('crescendo-editor-instrument')||'crescendo-editor-instrument'));}catch{return 'piano';}}
 function remember(id){try{root.localStorage?.setItem(root.JMLScoreWorkspace?.storageKey('crescendo-editor-instrument')||'crescendo-editor-instrument',normalize(id));}catch{}}
 function createLoader({getContext,loadInstrument,createOutput}){
  const cache=new Map();
  return async function load(id,{preload=false,track=''}={}){
   id=normalize(id);const context=getContext();if(!context)return null;
   if(!preload&&context.state==='suspended')await context.resume();
   const key=id+':'+track;
   if(!cache.has(key))cache.set(key,Promise.resolve().then(()=>loadInstrument(context,instruments[id].bank)).then(instrument=>createOutput(instrument,context,instruments[id])).catch(error=>{cache.delete(key);throw error;}));
   const output=await cache.get(key);output.recalibrate?.();return output;
  };
 }
 function soundingMidi(midi,id,transpose){return Number(midi)+(Number.isFinite(transpose)?transpose:instruments[normalize(id)].transpose);}
 function fromProgram(program){return Object.keys(instruments).find(id=>instruments[id].program===Number(program))||'piano';}
 function audible(system,systems){return !system.muted&&(!systems.some(s=>s.solo)||!!system.solo);}
 function normalizePan(value){const n=Number(value);return Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;}
 function createChannel(context){
  const gain=context.createGain(),pan=context.createStereoPanner();
  gain.connect(pan);pan.connect(context.destination);
  return {gain,pan,disconnect(){gain.disconnect();pan.disconnect();}};
 }
 async function ensemble(systems,load){
  const outputs=await Promise.all(systems.map(async(system,index)=>{
   if(system.kind==='percussion-line')return null;
   const id=normalize(system.instrumentId),output=await load(id,{track:system.id||String(index)});
   if(!output)throw Error('No se pudo cargar '+instruments[id].name+'.');return output;
  }));
  const result={name:'Conjunto · '+outputs.filter(Boolean).length+' pentagramas',state:'connected',
   send(message,time,systemIndex){if(Number.isInteger(systemIndex))outputs[systemIndex]?.send(message,time);},
   clear(){for(const output of outputs)output?.clear?.();},
   recalibrate(){for(const output of outputs)output?.recalibrate?.();}
  };result.setMix=current=>outputs.forEach((output,index)=>{const system=current[index];if(system){output?.setVolume?.(audible(system,current)?Math.max(0,Math.min(100,Number(system.volume??80)))/100:0);output?.setPan?.(normalizePan(system.pan));}});result.setMix(systems);return result;
 }
 const api={instruments,normalize,readPreference,remember,createLoader,soundingMidi,fromProgram,ensemble,audible,normalizePan,createChannel};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreInstruments=api;
})(typeof window==='undefined'?globalThis:window);
