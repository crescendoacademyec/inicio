(function(root){'use strict';
 const mod=n=>((n%12)+12)%12,STANDARD=[64,59,55,50,45,40],MAJOR=[0,2,4,5,7,9,11];
 // Frets in C, first string to sixth. These are individual fingerings, never fret windows.
 // Source: user-supplied Guitarra 1 p.20; Guitarra 3 pp.5,31.
 const MAJOR_MODELS=[
  [[3,5],[3,5,6],[2,4,5],[2,3,5],[2,3,5],[3,5]],
  [[5,7,8],[5,6,8],[4,5,7],[5,7],[5,7,8],[5,7,8]],
  [[7,8,10],[8,10],[7,9,10],[7,9,10],[7,8,10],[7,8,10]],
  [[10,12,13],[10,12,13],[9,10,12],[9,10,12],[10,12],[10,12,13]],
  [[12,13,15],[12,13,15],[12,14],[12,14,15],[12,14,15],[12,13,15]]
 ];
 const MELODIC_MODELS=[
  [[3,5,7],[3,4,6],[2,4,5],[3,5],[2,3,5,6],[3,5]],
  [[5,7,8],[6,8],[5,7,8],[5,7,9],[5,6,8],[5,7,8]],
  [[7,8,10,11],[8,10],[7,8,10],[7,9,10],[8,10],[8,10,11]],
  [[10,11,13],[10,12,13],[10,12],[9,10,12,13],[10,12],[10,11,13]],
  [[13,15],[12,13,15,16],[12,14],[12,13,15],[12,14,15],[13,15]]
 ];
 const HARMONIC_MODELS=[
  [[3,4,7],[3,4,6],[4,5],[3,5,6],[2,3,5,6],[3,4]],
  [[7,8],[6,8,9],[5,7],[5,6,9],[5,6,8],[7,8]],
  [[7,8,10,11],[8,9],[7,8,10],[9,10],[8,10,11],[8,10,11]],
  [[10,11,13],[12,13],[10,12,13],[9,10,12,13],[10,11],[10,11,13]],
  [[13,15],[12,13,15,16],[12,13],[12,13,15],[11,14,15],[13,15]]
 ];
 // Cmaj7 arpeggios across all six strings: Guitarra 2 p.11.
 const ARP_MODELS=[
  [[3,7],[5],[4,5],[2,5],[2,3],[3]],
  [[7,8],[5,8],[5],[5,9],[7],[7,8]],
  [[7,8],[8],[9],[9,10],[7,10],[7,8]],
  [[8,12],[8,12],[9],[9,10],[10],[8,12]],
  [[12],[12,13],[12],[14],[14,15],[12,15]]
 ];
 const ARPEGGIOS={mayor:{label:'Mayor · 1–3–5',intervals:[0,4,7]},menor:{label:'Menor · 1–♭3–5',intervals:[0,3,7]},aumentado:{label:'Aumentado · 1–3–♯5',intervals:[0,4,8]},disminuido:{label:'Disminuido · 1–♭3–♭5',intervals:[0,3,6]},maj7:{label:'maj7',intervals:[0,4,7,11]},m7:{label:'m7',intervals:[0,3,7,10]},dom7:{label:'7',intervals:[0,4,7,10]},m7b5:{label:'m7♭5',intervals:[0,3,6,10]},dim7:{label:'dim7',intervals:[0,3,6,9]},mMaj7:{label:'m(maj7)',intervals:[0,3,7,11]},maj7s5:{label:'maj7♯5',intervals:[0,4,8,11]},dom7s5:{label:'7♯5',intervals:[0,4,8,10]},dom7b5:{label:'7♭5',intervals:[0,4,6,10]},maj7b5:{label:'maj7♭5',intervals:[0,4,6,11]},sus7:{label:'7sus4',intervals:[0,5,7,10]},six:{label:'6',intervals:[0,4,7,9]},m6:{label:'m6',intervals:[0,3,7,9]}};
 // Color notes are pedagogical focal tones, independent of chord-tension availability.
 const COLORS={jonico:[{interval:5,degree:'4'},{interval:11,degree:'7'}],mayor:[{interval:5,degree:'4'},{interval:11,degree:'7'}],dorico:[{interval:9,degree:'6'}],frigio:[{interval:1,degree:'♭2'}],lidio:[{interval:6,degree:'♯4'}],mixolidio:[{interval:10,degree:'♭7'}],eolico:[{interval:8,degree:'♭6'}],locrio:[{interval:6,degree:'♭5'},{interval:1,degree:'♭2'}]};
 const MODE_FORMULAS={mayor_armonica:['♭6','7'],menor_armonica:['♭6','7'],menor_melodica:['6','7'],jonico_b6:['4','♭6','7'],locrio_s2s6:['2','♭5','6'],mixolidio_b2_s2_no4:['♭2','♯2','♭7'],dorico_s4_s7:['♯4','6','7'],mixolidio_b2:['♭2','♭7'],lidio_s2_s5:['♯2','♯4','♯5'],locrio_b7:['♭2','♭5','♭♭7'],eolico_s7:['♭6','7'],locrio_s6:['♭2','♭5','6'],jonico_aumentado:['4','♯5','7'],dorico_s4:['♯4','6'],mixolidio_b2b6:['♭2','♭6','♭7'],lidio_s2:['♯2','♯4'],locrio_b4b7:['♭4','♭5','♭♭7'],dorico_s7:['6','7'],dorico_b2:['♭2','6'],lidio_aumentado:['♯4','♯5'],lidio_dominante:['♯4','♭7'],mixolidio_b6:['♭6','♭7'],locrio_s2:['2','♭5'],alterado:['♭2','♯2','♭5','♯5']};
 function degreeInterval(text){const number=Number(text.replace(/[♭♯]/g,''));return mod(MAJOR[number-1]+(text.match(/♯/g)||[]).length-(text.match(/♭/g)||[]).length);}
 function characteristic(key,intervals=[]){const notes=COLORS[key]||MODE_FORMULAS[key]?.map(degree=>({degree,interval:degreeInterval(degree)}))||[];return notes.filter(n=>intervals.includes(n.interval));}
 function intervals(steps){const result=[0];for(let i=0;i<steps.length-1;i++)result.push(result.at(-1)+steps[i]);return result;}
 function fit(cells,maxFret){
  if(!cells.length)return [];
  const candidates=[0,-12,12,-24,24].map(shift=>cells.map(c=>({...c,fret:c.fret+shift,midi:c.midi+shift}))).filter(cs=>cs.every(c=>c.fret>=0&&c.fret<=maxFret));
  return candidates[0]||[];
 }
 function transpose(template,reference,referenceRoot,target,targetRoot,pitches,maxFret,raw=false){
  const cells=[];
  template.forEach((frets,string)=>frets.forEach(fret=>{const midi=STANDARD[string]+fret,index=reference.indexOf(mod(midi-referenceRoot));if(index<0||target[index]===undefined)return;const next=midi+targetRoot-referenceRoot+target[index]-reference[index];cells.push({string,fret:next-pitches[string],midi:next,interval:target[index]});}));
  return raw?cells:fit(cells,maxFret);
 }
 function sequential(rootPc,collection,pitches,startIndex,maxFret){
  let midi=pitches.at(-1);while(mod(midi-rootPc)!==collection[startIndex%collection.length])midi++;
  const cells=[];
  for(let string=pitches.length-1;string>=0;string--){for(let n=0;n<3;n++){cells.push({string,fret:midi-pitches[string],midi,interval:mod(midi-rootPc)});do{midi++;}while(!collection.includes(mod(midi-rootPc)));}}
  return fit(cells,maxFret);
 }
 function boxed(rootPc,collection,pitches,startIndex,maxFret){
  let low=pitches.at(-1);while(mod(low-rootPc)!==collection[startIndex%collection.length])low++;
  const anchor=low-pitches.at(-1),count=collection.length===8?4:collection.length<5?2:3,cells=[];
  pitches.forEach((open,string)=>{let midi=open+anchor;while(!collection.includes(mod(midi-rootPc)))midi++;for(let n=0;n<count;n++){cells.push({string,fret:midi-open,midi,interval:mod(midi-rootPc)});do{midi++;}while(!collection.includes(mod(midi-rootPc)));}});
  return fit(cells,maxFret);
 }
 function models({rootPc=0,steps=[],key='',kind='scale',arpeggio='maj7',pitches=STANDARD,maxFret=22,scheme='free'}={}){
  const collection=kind==='arpeggio'?ARPEGGIOS[arpeggio]?.intervals:intervals(steps);if(!collection?.length)return [];
  let templates=MAJOR_MODELS,reference=MAJOR,referenceRoot=0,target=collection;
  if(kind==='arpeggio'){templates=ARP_MODELS;reference=[0,4,7,11];}
  else if(key==='menor_melodica'){templates=MELODIC_MODELS;reference=[0,2,3,5,7,9,11];}
  else if(key==='menor_armonica'){templates=HARMONIC_MODELS;reference=[0,2,3,5,7,8,11];}
  else if(key==='pentatonica_menor'||key==='blues'){referenceRoot=9;reference=[0,3,5,7,10];templates=MAJOR_MODELS.map(t=>t.map((fs,s)=>fs.filter(f=>reference.includes(mod(STANDARD[s]+f-9)))));target=[0,3,5,7,10];}
  else if(['pentatonica_mayor','pentatonica_dominante','blues_mayor'].includes(key)){reference=[0,2,4,7,9];templates=MAJOR_MODELS.map(t=>t.map((fs,s)=>fs.filter(f=>reference.includes(mod(STANDARD[s]+f)))));target=key==='pentatonica_dominante'?[0,2,4,7,10]:reference;}
  const isSix=pitches.length===6;
  let modelRoot=rootPc;
  if(isSix&&scheme!=='3nps'&&templates[0]){
    const first=transpose(templates[0],reference,referenceRoot,target,rootPc,pitches,maxFret,true);
    const shifts=first.length&&Math.min(...first.map(c=>c.fret))>=12?[-12,0,12,-24,24]:[0,12,-12,24,-24];
    const shift=shifts.find(shift=>first.length&&first.every(c=>c.fret+shift>=0&&c.fret+shift<=maxFret));
    modelRoot+=shift||0;
  }
  const count=scheme==='3nps'&&collection.length===7?7:!isSix&&kind==='arpeggio'?collection.length:key==='por_tonos'?1:key.startsWith('disminuida_')?2:5;
  const result=[];
  for(let i=0;i<count;i++){
   let cells;
   if(scheme==='3nps')cells=sequential(rootPc,collection,pitches,i,maxFret);
   else if(!isSix||collection.length===6&&!['blues','blues_mayor'].includes(key)||collection.length===8)cells=boxed(rootPc,collection,pitches,i,maxFret);
   else cells=transpose(templates[i],reference,referenceRoot,target,modelRoot,pitches,maxFret);
   if(['blues','blues_mayor'].includes(key)&&cells.length){const extra=key==='blues'?6:3,min=Math.min(...cells.map(c=>c.fret)),max=Math.min(maxFret,Math.max(...cells.map(c=>c.fret))+1);for(let string=0;string<pitches.length;string++)for(let fret=min;fret<=max;fret++)if(mod(pitches[string]+fret-rootPc)===extra)cells.push({string,fret,midi:pitches[string]+fret,interval:extra});}
   cells.sort((a,b)=>b.string-a.string||a.fret-b.fret);
   result.push({id:'model'+(i+1),label:'Modelo '+(i+1),cells,minFret:cells.length?Math.min(...cells.map(c=>c.fret)):0,maxFret:cells.length?Math.max(...cells.map(c=>c.fret)):0});
  }
  return result;
 }
 const api={models,intervals,characteristic,ARPEGGIOS,MAJOR_MODELS,MELODIC_MODELS,HARMONIC_MODELS,ARP_MODELS};if(typeof module!=='undefined')module.exports=api;else root.CrescendoFretboardModels=api;
})(typeof window==='undefined'?globalThis:window);
