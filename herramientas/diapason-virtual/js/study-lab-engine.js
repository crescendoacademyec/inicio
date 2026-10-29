/* Original interactive exercises based on the topics in Guitarra 1–4.
 * All positions are computed from sounding pitches; no book diagrams are embedded. */
(function(global){
'use strict';
const mod=n=>((n%12)+12)%12;
const CHORDS={
 major:{label:'Mayor',suffix:'',tones:[0,4,7]},minor:{label:'Menor',suffix:'m',tones:[0,3,7]},aug:{label:'Aumentado',suffix:'+',tones:[0,4,8]},dim:{label:'Disminuido',suffix:'dim',tones:[0,3,6]},
 maj7:{label:'maj7',suffix:'maj7',tones:[0,4,7,11]},m7:{label:'m7',suffix:'m7',tones:[0,3,7,10]},dom7:{label:'7',suffix:'7',tones:[0,4,7,10]},m7b5:{label:'m7♭5',suffix:'m7b5',tones:[0,3,6,10]},dim7:{label:'dim7',suffix:'dim7',tones:[0,3,6,9]},sus7:{label:'7sus4',suffix:'7sus4',tones:[0,5,7,10]},
 mMaj7:{label:'m(maj7)',suffix:'m(maj7)',tones:[0,3,7,11]},maj7s5:{label:'maj7♯5',suffix:'maj7#5',tones:[0,4,8,11]},m7s5:{label:'m7♯5',suffix:'m7#5',tones:[0,3,8,10]},maj7b5:{label:'maj7♭5',suffix:'maj7b5',tones:[0,4,6,11]},dom7b5:{label:'7♭5',suffix:'7b5',tones:[0,4,6,10]},dom7s5:{label:'7♯5',suffix:'7#5',tones:[0,4,8,10]},six:{label:'6',suffix:'6',tones:[0,4,7,9]},m6:{label:'m6',suffix:'m6',tones:[0,3,7,9]},
 maj9:{label:'maj9 · sin 5ª',suffix:'maj9',tones:[0,4,11,14]},m9:{label:'m9 · sin 5ª',suffix:'m9',tones:[0,3,10,14]},nine:{label:'9 · sin 5ª',suffix:'9',tones:[0,4,10,14]},sixNine:{label:'6/9 · sin 5ª',suffix:'6/9',tones:[0,4,9,14]},thirteen:{label:'13 · sin 5ª ni 9ª',suffix:'13',tones:[0,4,10,21]},sevenFlat9:{label:'7♭9 · sin 5ª',suffix:'7b9',tones:[0,4,10,13]},sevenSharp9:{label:'7♯9 · sin 5ª',suffix:'7#9',tones:[0,4,10,15]},sevenSharp11:{label:'7♯11 · sin 5ª',suffix:'7#11',tones:[0,4,10,18]},sevenFlat13:{label:'7♭13 · sin 5ª',suffix:'7b13',tones:[0,4,10,20]},nineThirteen:{label:'9(13) · cinco voces',suffix:'9(13)',tones:[0,4,10,14,21]},nineFlat13:{label:'9(♭13) · cinco voces',suffix:'9(b13)',tones:[0,4,10,14,20]},flat9Thirteen:{label:'7(♭9,13) · cinco voces',suffix:'7(b9,13)',tones:[0,4,10,13,21]}
};
const SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],melodic:[0,2,3,5,7,9,11],harmonic:[0,2,3,5,7,8,11]};
const DEGREE=['1','♭9','9','♯9 / ♭3','3','11','♯11 / ♭5','5','♭13 / ♯5','13','♭7','7'];
function cycle(root,step){const result=[];let n=mod(root);do{result.push(n);n=mod(n+step);}while(n!==mod(root)&&result.length<12);return result;}
function combinations(list,n){if(!n)return [[]];if(list.length<n)return [];return list.flatMap((x,i)=>combinations(list.slice(i+1),n-1).map(t=>[x,...t]));}
function rotate(tones,i){const sorted=tones.slice().sort((a,b)=>a-b);const seq=sorted.slice(i).concat(sorted.slice(0,i).map(n=>n+12));for(let k=1;k<seq.length;k++)while(seq[k]<=seq[k-1])seq[k]+=12;return seq;}
function ordered(tones,family,inversion){
 let seq=rotate(tones.map(mod).sort((a,b)=>a-b),inversion);
 if(family==='open'&&seq.length===3)seq=[seq[0],seq[2],seq[1]+12];
 if(['drop23','doubleDrop3'].includes(family)&&seq.length>=4){const indices=family==='drop23'?[seq.length-2,seq.length-3]:[seq.length-3];for(const i of indices)seq[i]-=family==='doubleDrop3'?24:12;seq.sort((a,b)=>a-b);}
 if(family==='drop2'&&seq.length>=4){seq[seq.length-2]-=12;seq.sort((a,b)=>a-b);}
 if(family==='drop3'&&seq.length>=4){seq[seq.length-3]-=12;seq.sort((a,b)=>a-b);}
 return seq;
}
function movement(a,b){
 const aa=a.map(c=>c.midi).sort((x,y)=>x-y),bb=b.map(c=>c.midi).sort((x,y)=>x-y);
 if(aa.length!==bb.length)return {distance:Infinity,common:[],voices:[]};
 const voices=aa.map((from,i)=>({from,to:bb[i],delta:bb[i]-from}));
 return {distance:voices.reduce((n,v)=>n+Math.abs(v.delta),0),common:aa.filter(n=>bb.includes(n)),voices};
}
function solve({root=0,tones=[0,4,7],family='closed',inversion='all',pitches=[64,59,55,50,45,40],maxFret=22,anchor=5,group='all',previous=[],limit=24,orders=null,strings=null,bassOrder=null,absolute=false}={}){
 if(tones.length>pitches.length)return [];
 const sets=combinations(pitches.map((_,i)=>i),tones.length).filter(ss=>{
  if(strings&&ss.some(s=>!strings.includes(s)))return false;const mid=ss.reduce((n,s)=>n+s,0)/ss.length;
  return group==='all'||group==='low'&&mid>=(pitches.length-1)/2||group==='high'&&mid<=(pitches.length-1)/2||group==='mid'&&Math.min(...ss)>0&&Math.max(...ss)<pitches.length-1;
 });
 const seqs=orders||tones.map((_,i)=>ordered(tones,family,i));const found=[],keys=new Set();
 seqs.forEach(seq=>{
  const bassPc=mod(seq[0]),bassIndex=(bassOrder||tones.map(mod).sort((a,b)=>a-b)).indexOf(bassPc);
  if(inversion!=='all'&&bassIndex!==Number(inversion))return;
  for(let octave=absolute?0:1;octave<=(absolute?0:7);octave++){
   const midis=seq.map(n=>root+octave*12+n);
   sets.forEach(ss=>{
    const descending=ss.slice().sort((a,b)=>pitches[a]-pitches[b]||b-a);
    const cells=midis.map((midi,i)=>({string:descending[i],fret:midi-pitches[descending[i]],midi}));
    if(cells.some(c=>c.fret<0||c.fret>maxFret))return;
    const fretted=cells.filter(c=>c.fret>0).map(c=>c.fret),span=fretted.length?Math.max(...fretted)-Math.min(...fretted):0;
    if(span>5)return;
    const center=cells.reduce((n,c)=>n+c.fret,0)/cells.length;
    const move=previous.length?movement(previous,cells).distance:0;
    const score=Math.abs(center-anchor)*2+span*1.6+(Number.isFinite(move)?move*3:0);
    const key=cells.map(c=>c.string+':'+c.fret).join(',');if(keys.has(key))return;keys.add(key);
    found.push({cells,inversion:bassIndex,score,motion:previous.length?movement(previous,cells):null});
   });
  }
 });
 return found.sort((a,b)=>a.score-b.score).slice(0,limit);
}
function classify(midi,root,chordTones,scale){const iv=mod(midi-root);if(iv===0)return 'root';if(chordTones.map(mod).includes(iv))return chordTones.some(t=>mod(t)===iv&&t>=12)?'tension':'structural';if(!scale.includes(iv))return 'unavailable';if(iv===5&&chordTones.map(mod).includes(4))return 'unavailable';return 'tension';}
function sequence(cells,pattern='ascending'){
 const sorted=[...new Map(cells.slice().sort((a,b)=>a.midi-b.midi).map(c=>[c.midi,c])).values()],n=sorted.length;
 if(pattern==='descending')return sorted.reverse();
 if(pattern==='roundtrip')return sorted.concat(sorted.slice(0,-1).reverse());
 if(pattern==='thirds')return sorted.flatMap((c,i)=>i+2<n?[c,sorted[i+2]]:[]);
 let offsets=/^groups[3-7]$/.test(pattern)?Array.from({length:Number(pattern.at(-1))},(_,i)=>i):pattern==='motif'?[0,2,1,3]:pattern==='perm213'?[1,0,2]:pattern==='perm321'?[2,1,0]:Array.isArray(pattern)?pattern:null;
 return offsets?sorted.flatMap((_,i)=>i+Math.max(...offsets)<n?offsets.map(o=>sorted[i+o]):[]):sorted;
}
function diatonic(scale,degree,count=4,skip=2){const raw=Array.from({length:count},(_,i)=>{const k=degree+i*skip;return scale[k%scale.length]+12*Math.floor(k/scale.length);});return {root:mod(raw[0]),tones:raw.map(n=>n-raw[0])};}
function nearestModel(models,anchor){return models.filter(m=>m.cells.length).sort((a,b)=>Math.abs((a.minFret+a.maxFret)/2-anchor)-Math.abs((b.minFret+b.maxFret)/2-anchor))[0];}
function inGroup(c,count,group){return group==='all'||group==='low'&&c.string>=Math.floor(count/2)||group==='high'&&c.string<Math.ceil(count/2)||group==='mid'&&c.string>0&&c.string<count-1;}
function intervalLabel(midi,root,tones){const iv=mod(midi-root),chord=tones.map(mod);if(iv===3)return tones.includes(15)?'♯9':chord.includes(3)?'♭3':'♯9';if(iv===6)return tones.includes(18)?'♯11':chord.includes(6)?'♭5':'♯11';if(iv===8)return tones.includes(20)?'♭13':chord.includes(8)?'♯5':'♭13';if(iv===9&&tones.includes(9)&&!tones.includes(21))return '6';if(iv===2&&tones.includes(2)&&!tones.includes(14))return '2';if(iv===5&&tones.includes(5))return '4';return DEGREE[iv];}

function rhythmPattern(config){return config.rhythm==='triplets'?[1/3]:config.rhythm==='sextuplets'?[1/6]:config.rhythm==='dotted'?[.75,.25]:config.rhythm==='syncopated'?[.5,.5,1]:config.rhythm==='motif'?[1,.5,.5,1]:[config.noteBeats||.5];}
function chordName(tones){const signature=tones.map(mod).sort((a,b)=>a-b).join(',');return Object.values(CHORDS).find(d=>d.tones.map(mod).sort((a,b)=>a-b).join(',')===signature)?.suffix||' ['+tones.map(n=>DEGREE[mod(n)]).join('–')+']';}
function moveDiatonic(midi,steps,root,scale){const direction=Math.sign(steps);for(let n=0;n<Math.abs(steps);n++){do{midi+=direction;}while(!scale.includes(mod(midi-root)));}return midi;}
function attachAccompaniment(frames,root,base,tuning){const shape=solve({...tuning,root,tones:base.tones,family:'drop2'})[0]||solve({...tuning,root,tones:base.tones,family:'closed'})[0];if(!shape)throw Error('No hay una posición para el acorde base en este grupo de cuerdas.');frames.forEach(f=>{f.accompaniment=shape.cells;f.baseGroup='base-'+root+'-'+base.suffix;});}

function makeStudy(config,context,models){
 const root=context.root,scale=context.scale.length?context.scale:SCALES.major,base=CHORDS[config.quality]||CHORDS.maj7;
 const tuning={pitches:context.pitches,maxFret:context.maxFret,anchor:config.anchor,group:config.group};
 const frames=[];frames.warnings=[];let previous=[];
 function decorate(cells,r=root,tones=base.tones,ref=scale){return cells.map(c=>({...c,role:classify(c.midi,r,tones,ref)}));}
 function chordFrame(r,tones,label,opts={}){
  const shape=solve({...tuning,root:r,tones,family:config.family,inversion:config.inversion,previous:['voices','diatonic','mixed'].includes(config.kind)||config.kind==='cycles'&&config.cycleMode==='diatonic'?previous:[],...opts})[0];
  if(!shape){if(opts.optional){frames.warnings.push(label+' no cabe en este grupo de cuerdas.');return null;}throw Error('No hay una digitación compacta para esta combinación. Prueba otra región, grupo de cuerdas o inversión.');}
  const cells=decorate(shape.cells,r,config.kind==='quartal'||config.kind==='extensions'&&config.voicingSource==='reference'?tones.map(mod):tones,scale);const frame={label,cells,beats:config.beats||4,root:r,chordTones:tones,motion:Number.isFinite(shape.motion?.distance)?shape.motion:null,inversion:shape.inversion};
  frames.push(frame);previous=cells;return frame;
 }
 function melodic(r,collection,label,modelOptions={},rolesRoot=r,rolesTones=base.tones,ref=scale){
  const candidates=models.models({rootPc:r,pitches:context.pitches,maxFret:context.maxFret,scheme:modelOptions.kind==='arpeggio'?'free':context.scheme||'free',...modelOptions});
  const chosen=nearestModel(candidates,config.anchor);
  if(!chosen)throw Error('No hay un modelo disponible con esta afinación y región.');
  let source=chosen.cells.filter(c=>inGroup(c,context.pitches.length,config.group));
  if(config.model&&config.model!=='nearest'){const exact=candidates.find(m=>m.id===config.model);if(exact)source=exact.cells.filter(c=>inGroup(c,context.pitches.length,config.group));}
  if(config.range&&config.range!=='full'){
    const tones=modelOptions.kind==='arpeggio'?models.ARPEGGIOS[modelOptions.arpeggio].intervals:models.intervals(modelOptions.steps||context.steps);
    const startPc=mod(r+tones[Math.min(tones.length-1,Number(config.startDegree)||0)]),starts=source.filter(c=>mod(c.midi)===startPc).sort((a,b)=>a.midi-b.midi);
    if(!starts.length)throw Error('El grado de inicio no está en este grupo de cuerdas.');const start=starts[0].midi,octaves=config.range==='one'?1:2;
    source=source.filter(c=>c.midi>=start&&c.midi<=start+12*octaves);
    if(!source.some(c=>c.midi===start+12*octaves))throw Error('Este modelo no cubre el registro solicitado desde ese grado. Prueba otro modelo o Todas las cuerdas.');
  }
  const cells=decorate(source,rolesRoot,rolesTones,ref),notes=sequence(cells,config.pattern==='custom'?config.customPattern:config.pattern);
  if(!notes.length)throw Error('El modelo no tiene suficientes notas para este patrón.');
  const rhythm=rhythmPattern(config);
  notes.forEach((c,i)=>frames.push({label,cells:[c],reference:cells,beats:rhythm[i%rhythm.length],root:rolesRoot,chordTones:rolesTones,group:label,note:i+1}));
 }
 if(config.kind==='cycles'&&config.cycleMode!=='diatonic'){
  const roots=cycle(root,Number(config.cycle));
  roots.forEach(r=>{
   const label=context.name(r)+(context.chord?.suffix||'')+' · ciclo';
   if(context.material==='chord'){const def=context.chord||base;chordFrame(r,def.tones,label,{family:def.family||config.family,inversion:def.inversion||'all'});}
   else if(context.material==='arpeggio')melodic(r,context.collection,label,{kind:'arpeggio',arpeggio:context.arpeggio},r,context.collection,context.collection);
   else melodic(r,scale,label,{key:context.scaleKey,steps:context.steps},r,diatonic(scale,0).tones,scale);
  });
 }else if(config.kind==='diatonic'||config.kind==='cycles'&&config.cycleMode==='diatonic'){
  if(scale.length!==7)throw Error('Los ciclos diatónicos necesitan una escala de siete notas.');
  const count=Number(config.diatonicVoices)||4,step=Math.max(1,Math.min(6,Number(config.degreeCycle)||1));
  const roots=config.allKeys?cycle(root,5):[root];
  roots.forEach(tonic=>{for(let n=0;n<7;n++){
    const degree=n*step%7,q=diatonic(scale,degree,count),r=mod(tonic+q.root),quality=chordName(q.tones);
    chordFrame(r,q.tones,context.name(r)+quality+' · grado '+(degree+1)+' · '+context.name(tonic),{family:count===3?(config.triadLayout||'closed'):(config.family||'drop2'),inversion:'all'});
  }});
 }else if(config.kind==='pairs'){
  const types=[config.upper||'minor',config.secondUpper||'minor'],roots=[Number(config.upperRoot)||0,Number(config.secondRoot)||0];
  const order=config.pairOrder==='abba'?[0,1,1,0]:[0,1],repeat=Math.max(1,Math.min(8,Number(config.pairRepeats)||2));
  for(let n=0;n<repeat;n++)for(const i of order){const def=CHORDS[types[i]],upper=mod(root+roots[i]),label=context.name(upper)+def.suffix+' · '+(i?'B':'A')+' sobre '+context.name(root)+base.suffix;
    if(config.pairArticulation==='block'){
      const shape=solve({...tuning,root:upper,tones:def.tones,family:def.tones.length===3?(config.triadLayout||'closed'):(config.family||'drop2')})[0];
      if(!shape)throw Error('No hay digitación para una de las dos estructuras.');frames.push({label,cells:decorate(shape.cells),beats:config.beats||2,root,chordTones:base.tones,upperRoot:upper,upperSuffix:def.suffix,group:label});
    }else{
      const start=frames.length,arp={major:'mayor',minor:'menor',aug:'aumentado',dim:'disminuido'}[types[i]]||types[i];
      melodic(upper,def.tones,label,{kind:'arpeggio',arpeggio:arp},root,base.tones,scale);
      for(const f of frames.slice(start)){f.upperRoot=upper;f.upperSuffix=def.suffix;}
    }
  }
  attachAccompaniment(frames,root,base,tuning);
 }else if(config.kind==='mixed'){
  if(scale.length!==7)throw Error('La combinación cuartal necesita una escala de siete notas.');
  const degrees=config.mixedProgression==='diatonic'?[0,1,2,3,4,5,6]:[1,4,0];
  for(const degree of degrees){const q=diatonic(scale,degree),r=mod(root+q.root);
    chordFrame(r,q.tones,context.name(r)+chordName(q.tones)+' · Drop 2',{family:'drop2',inversion:'all'});
    const quartal=diatonic(scale,degree,Number(config.voices)||3,3);
    const frame=chordFrame(r,quartal.tones,context.name(r)+' · bloque cuartal',{family:'quartal',inversion:'all',orders:quartal.tones.map((_,i)=>rotate(quartal.tones,i)),bassOrder:quartal.tones.map(mod)});
    if(frame){frame.cells=decorate(frame.cells,r,quartal.tones.map(mod));frame.motion=null;}
  }
 }else if(config.kind==='guide'){
  const tones=config.guideSource==='quartal'?diatonic(scale,0,Number(config.voices)||3,3).tones:config.guideSource==='tetrad'?base.tones:(CHORDS[config.triad]||CHORDS.major).tones;
  const first=solve({...tuning,root,tones,family:config.guideSource==='quartal'?'quartal':tones.length===3?(config.triadLayout||'closed'):(config.family||'drop2'),orders:config.guideSource==='quartal'?[tones]:null})[0];
  if(!first)throw Error('No hay un bloque inicial para este grupo de cuerdas.');
  const source=first.cells.map(c=>c.midi),held=config.hold==='bass'?0:source.length-1,direction=config.guideDirection==='up'?1:config.guideDirection==='down'?-1:held===0?1:-1,positions=[0,1,2,3,2,1,0].map(n=>n*direction);
  for(const delta of positions){const midis=source.map((midi,i)=>i===held?midi:config.guideMotion==='diatonic'?moveDiatonic(midi,delta,root,scale):midi+delta);
    if(midis.some((n,i)=>i&&n<=midis[i-1]))throw Error('Las voces se cruzan en este recorrido. Prueba otra disposición o bloque inicial.');
    const shape=solve({...tuning,root:0,tones:midis.map(mod),orders:[midis],absolute:true,previous})[0];
    if(!shape)throw Error('El recorrido de voz guía no cabe en este grupo de cuerdas. Prueba otra región.');
    const cells=decorate(shape.cells);frames.push({label:(held?'Voz superior':'Bajo')+' fijo · '+(delta===0?'referencia':delta+' pasos'),cells,beats:config.beats||2,root,chordTones:base.tones,heldMidi:source[held],motion:previous.length?movement(previous,cells):null});previous=cells;
  }
 }else if(config.kind==='patterns'){
  const arp=context.material==='arpeggio';
  melodic(root,context.collection,context.name(root)+' · '+context.materialLabel,arp?{kind:'arpeggio',arpeggio:context.arpeggio}:{key:context.scaleKey,steps:context.steps},root,arp?context.collection:diatonic(scale,0).tones,scale);
 }else if(config.kind==='open'){
  const def=CHORDS[config.triad]||CHORDS.major;
  (config.inversion==='all'?[0,1,2]:[Number(config.inversion)]).forEach(i=>chordFrame(root,def.tones,context.name(root)+def.suffix+' · '+['fundamental','1ª inversión','2ª inversión'][i],{family:'open',inversion:i,optional:config.inversion==='all'}));
 }else if(config.kind==='quartal'){
  if(scale.length!==7)throw Error('Selecciona una escala de siete notas para armonizar por cuartas.');
  const degrees=config.degree==='all'?[0,1,2,3,4,5,6]:[Number(config.degree)];
  degrees.forEach(d=>{const q=diatonic(scale,d,Number(config.voices),3);const invs=config.inversion==='all'?q.tones.map((_,i)=>i):[Number(config.inversion)];invs.forEach(i=>chordFrame(mod(root+q.root),q.tones,'Grado '+(d+1)+' · bloque cuartal · inversión '+i,{family:'quartal',inversion:i,orders:q.tones.map((_,n)=>rotate(q.tones,n)),bassOrder:q.tones.map(mod),optional:config.inversion==='all'}));});
 }else if(config.kind==='super'){
  const upper=mod(root+Number(config.upperRoot)),type=config.upper;
  const label=context.name(upper)+' '+(type==='pentaMajor'?'pentatónica mayor':type==='pentaMinor'?'pentatónica menor':CHORDS[type].label)+' sobre '+context.name(root)+base.suffix;
  if(type.startsWith('penta')){
   const major=type==='pentaMajor';melodic(upper,[],label,{key:major?'pentatonica_mayor':'pentatonica_menor',steps:major?[2,2,3,2,3]:[3,2,2,3,2]},root,base.tones,scale);
  }else{
   const def=CHORDS[type],arp={major:'mayor',minor:'menor',aug:'aumentado',dim:'disminuido'}[type]||type;
   melodic(upper,def.tones,label,{kind:'arpeggio',arpeggio:arp},root,base.tones,scale);
  }
  const bass=solve({...tuning,root,tones:base.tones,family:'closed'})[0];
  if(!bass)throw Error('No hay una posición para el acorde base en este grupo de cuerdas.');
  frames.forEach(f=>{f.accompaniment=bass.cells;f.baseLabel=context.name(root)+base.suffix;});
 }else if(config.kind==='hybrid'){
  const triad=CHORDS[config.triad]||CHORDS.major,upper=Number(config.upperRoot);
  const pcs=triad.tones.map(t=>mod(t+upper));
  const invs=config.inversion==='all'?[0,1,2]:[Number(config.inversion)];
  invs.forEach(i=>{
   let top=rotate(triad.tones,i).map(n=>n+upper);while(top[0]<=0)for(let k=0;k<top.length;k++)top[k]+=12;
   let orders=[[0,...top]];
   if(config.hybridFamily&&config.hybridFamily!=='closed')orders=[0,1,2,3].map(n=>ordered([0,...pcs],config.hybridFamily,n)).filter(seq=>mod(seq[0])===0&&mod(seq[1])===mod(upper+triad.tones[i]));
   const frame=chordFrame(root,[0,...pcs],context.name(mod(root+upper))+triad.suffix+'/'+context.name(root)+' · tríada inversión '+i,{inversion:'all',orders,optional:config.inversion==='all'});
   if(frame){frame.upperInversion=i;frame.upperRoot=mod(root+upper);frame.upperSuffix=triad.suffix;}
  });
 }else if(config.kind==='voices'){
  let progression;
  if(config.progression==='bluesMinor')progression=[{r:0,q:'m7'},{r:0,q:'m7'},{r:0,q:'m7'},{r:0,q:'m7'},{r:5,q:'m7'},{r:5,q:'m7'},{r:0,q:'m7'},{r:0,q:'m7'},{r:8,q:'dom7'},{r:7,q:'dom7s5'},{r:0,q:'m7'},{r:7,q:'dom7s5'}];
  else if(config.progression==='iiTriads')progression=[{r:2,q:'minor'},{r:7,q:'major'},{r:0,q:'major'}];
  else if(config.progression==='iiMinor')progression=[{r:2,q:'m7b5'},{r:7,q:'sevenFlat9'},{r:0,q:'mMaj7'}];
  else if(config.progression==='blues')progression=[0,5,0,0,5,5,0,0,7,5,0,7].map(r=>({r,q:'dom7'}));
  else if(config.progression==='diatonic'){
   if(scale.length!==7)throw Error('El recorrido diatónico necesita una escala de siete notas.');
   progression=Array.from({length:7},(_,d)=>{const q=diatonic(scale,d);return {r:q.root,tones:q.tones,label:'grado '+(d+1)};});
  }else progression=[{r:2,q:'m7'},{r:7,q:'dom7'},{r:0,q:'maj7'}];
  progression.forEach(p=>{const r=mod(root+p.r),def=CHORDS[p.q];chordFrame(r,p.tones||def.tones,context.name(r)+(p.label?' · '+p.label:def.suffix),{inversion:'all'});});
 }else if(config.kind==='outside'){
  const shape=solve({...tuning,root,tones:(CHORDS[config.triad]||CHORDS.major).tones,family:'closed',inversion:config.inversion})[0];
  if(!shape)throw Error('No hay posición inicial disponible.');
  let sourceCells=shape.cells;
  if(config.outsideArticulation==='melodic'){
    const count=Math.max(3,Math.min(7,Number(config.cellSize)||3));
    const pool=[];for(let string=0;string<context.pitches.length;string++)for(let fret=Math.max(0,Math.floor(config.anchor)-3);fret<=Math.min(context.maxFret,Math.floor(config.anchor)+4);fret++){const midi=context.pitches[string]+fret;if(scale.includes(mod(midi-root)))pool.push({string,fret,midi});}
    const seen=new Set(sourceCells.map(c=>c.midi));sourceCells=sourceCells.slice();
    for(const cell of pool.sort((a,b)=>Math.abs(a.midi-sourceCells.at(-1).midi)-Math.abs(b.midi-sourceCells.at(-1).midi)||Math.abs(a.fret-config.anchor)-Math.abs(b.fret-config.anchor))){if(sourceCells.length>=count)break;if(seen.has(cell.midi))continue;seen.add(cell.midi);sourceCells.push(cell);}
    if(sourceCells.length<count)throw Error('No hay suficientes notas para esta célula en la región elegida.');sourceCells=sourceCells.slice(0,count);
  }
  const offsets=config.shift==='strings'?[0,-1,-2,-1,0]:[0,1,2,1,0];
  offsets.forEach((shift,i)=>{
   const cells=sourceCells.map(c=>{const string=c.string+(config.shift==='strings'?shift:0),fret=c.fret+(config.shift==='strings'?0:shift);return {string,fret,midi:context.pitches[string]+fret};});
   if(cells.some(c=>c.string<0||c.string>=context.pitches.length||c.fret<0||c.fret>context.maxFret))throw Error('El desplazamiento sale del diapasón. Usa cuerdas graves o una región más baja.');
   const frame={label:i===0||i===offsets.length-1?'Referencia · regreso':'Estructura visual · '+(config.shift==='strings'?'salto de cuerdas':`+${shift} semitonos`),cells:decorate(cells),beats:config.beats||2,root,chordTones:base.tones,spellingRoot:config.shift==='strings'?null:mod(root+shift)};
   if(config.outsideArticulation==='melodic'){
     const rhythm=rhythmPattern(config),notes=sequence(frame.cells,config.pattern==='custom'?config.customPattern:config.pattern);
     notes.forEach((cell,n)=>frames.push({...frame,cells:[cell],reference:frame.cells,beats:rhythm[n%rhythm.length],group:frame.label+' · '+i,note:n+1}));
   }else frames.push(frame);
  });
 }else if(config.kind==='extensions'&&config.voicingSource==='reference'){
  if(scale.length!==7)throw Error('Los esquemas de referencia necesitan una escala de siete notas.');
  // Guitarra 4 p.20: voice order is explicit, not inferred from an ambiguous label.
  const patterns=config.referenceFamily==='doubleDrop3'?[[0,6,11,15],[0,5,9,15],[0,4,10,16],[0,6,12,17]]:[[0,1,6,11],[0,1,5,9],[0,2,4,10],[0,3,6,12]];
  const types=config.referenceType==='all'?[0,1,2,3]:[Number(config.referenceType)||0],degrees=config.degree==='all'?[0,1,2,3,4,5,6]:[Number(config.degree)||0];
  for(const degree of degrees)for(const type of types){const raw=patterns[type].map(k=>{const d=degree+k;return scale[d%7]+12*Math.floor(d/7);}),r=mod(root+raw[0]),tones=raw.map(n=>n-raw[0]);
   const frame=chordFrame(r,tones,context.name(r)+' · '+(config.referenceFamily==='doubleDrop3'?'Doble Drop 3':'Drop 2&3')+' · tipo '+(type+1),{orders:[tones],inversion:'all',optional:true});if(frame)frame.source='Guitarra 4, p. 20';
  }
 }else if(config.kind==='extensions'){
  const inversions=config.inversion==='all'?base.tones.map((_,i)=>i):[Number(config.inversion)];
  inversions.forEach(i=>chordFrame(root,base.tones,context.name(root)+base.suffix+' · inversión '+i,{inversion:i,optional:config.inversion==='all'}));
 }
 if(!frames.length)throw Error('No hay eventos para este ejercicio.');
 return frames;
}
const api={CHORDS,SCALES,DEGREE,mod,inGroup,intervalLabel,rhythmPattern,chordName,moveDiatonic,cycle,ordered,solve,movement,classify,sequence,diatonic,nearestModel,makeStudy};
if(typeof module!=='undefined')module.exports=api;else global.CrescendoStudyLab=api;
})(typeof window==='undefined'?globalThis:window);
