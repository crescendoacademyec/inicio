/* Notation transformations and MIDI share the same musical timeline. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACMelodyCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11},mod=n=>(n%12+12)%12;
 function document(xml,Parser=globalThis.DOMParser){
  if(typeof xml!=='string'||xml.length>4*1024*1024||/<!ENTITY/i.test(xml))throw Error('MusicXML no compatible o demasiado grande.');
  const doc=new Parser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror')||doc.documentElement.localName!=='score-partwise'||!doc.querySelector('part'))throw Error('Selecciona un MusicXML score-partwise válido.');
  if(doc.querySelectorAll('note').length>100000)throw Error('La partitura contiene demasiados eventos.');return doc;
 }
 function writtenPitch(node){const p=node.querySelector('pitch');if(!p)return null;return (+p.querySelector('octave')?.textContent+1)*12+natural[p.querySelector('step')?.textContent]+ +(p.querySelector('alter')?.textContent||0);}
 function spelling(midi,fifths){const order=fifths<0?'BEADGCF':'FCGDAEB',alterFor=s=>order.slice(0,Math.abs(fifths)).includes(s)?Math.sign(fifths):0;const choices=[];for(const [step,pc]of Object.entries(natural))for(let alter=-1;alter<=1;alter++)if(mod(pc+alter)===mod(midi))choices.push({step,alter,score:4*Math.abs(alter-alterFor(step))+.1*Math.abs(alter)+.2*(fifths<0&&alter>0||fifths>=0&&alter<0)});const best=choices.sort((a,b)=>a.score-b.score)[0];return {...best,octave:Math.round((midi-natural[best.step]-best.alter)/12)-1};}
 function shiftedKey(old,amount){const tonic=mod(old*7+amount),options=[];for(let n=-7;n<=7;n++)if(mod(n*7)===tonic)options.push(n);return options.sort((a,b)=>Math.abs(a)-Math.abs(b)||((old<0?1:-1)*(a-b)))[0];}
 function transposePitch(midi,step,octave,amount,fifths){
  const tonics=['Cb','Gb','Db','Ab','Eb','Bb','F','C','G','D','A','E','B','F#','C#'],letters='CDEFGAB',old=tonics[fifths+7]||'C',next=tonics[shiftedKey(fifths,amount)+7],pc=name=>natural[name[0]]+(name[1]==='b'?-1:name[1]==='#'?1:0);
  const octaves=Math.round((pc(old)+amount-pc(next))/12),steps=letters.indexOf(next[0])-letters.indexOf(old[0])+7*octaves,index=letters.indexOf(step)+7*octave+steps,newStep=letters[((index%7)+7)%7],newOctave=Math.floor(index/7),alter=midi+amount-12*(newOctave+1)-natural[newStep];
  return Math.abs(alter)<=2?{step:newStep,octave:newOctave,alter}:spelling(midi+amount,shiftedKey(fifths,amount));
 }
 function transposeDocument(doc,amount){
  if(!Number.isInteger(amount)||amount< -24||amount>24)throw Error('Transposición fuera de rango.');if(!amount)return doc;
  for(const part of doc.querySelectorAll('part')){let fifths=0,changed=0;
   for(const measure of part.children){if(measure.localName!=='measure')continue;for(const item of measure.children){
    if(item.localName==='attributes'){for(const key of item.querySelectorAll('key')){const node=key.querySelector('fifths');if(node){fifths=+node.textContent||0;changed=shiftedKey(fifths,amount);node.textContent=changed;}}}
    if(item.localName==='harmony'){for(const tag of ['root','bass']){const node=item.querySelector(tag);if(!node)continue;const pc=natural[node.querySelector(tag+'-step')?.textContent]+ +(node.querySelector(tag+'-alter')?.textContent||0);if(!Number.isFinite(pc))continue;const value=transposePitch(pc+60,node.querySelector(tag+'-step').textContent,4,amount,fifths);node.querySelector(tag+'-step').textContent=value.step;let alt=node.querySelector(tag+'-alter');if(!alt){alt=doc.createElementNS(doc.documentElement.namespaceURI,tag+'-alter');node.append(alt);}alt.textContent=value.alter;}}
    if(item.localName!=='note')continue;const midi=writtenPitch(item);if(midi===null)continue;if(!Number.isFinite(midi)||midi+amount<0||midi+amount>127)throw Error('La transposición sale del rango MIDI.');const sourcePitch=item.querySelector('pitch'),value=transposePitch(midi,sourcePitch.querySelector('step').textContent,+sourcePitch.querySelector('octave').textContent,amount,fifths),pitch=sourcePitch;pitch.replaceChildren();for(const [tag,val]of [['step',value.step],['alter',value.alter],['octave',value.octave]]){const el=doc.createElementNS(doc.documentElement.namespaceURI,tag);el.textContent=val;pitch.append(el);}item.querySelectorAll('accidental').forEach(el=>el.remove());
   }}
  }return doc;
 }
 function setTempo(doc,bpm){if(!Number.isFinite(bpm)||bpm<20||bpm>360)throw Error('El tempo debe estar entre 20 y 360 BPM.');const sounds=[...doc.querySelectorAll('sound[tempo]')],original=+(sounds[0]?.getAttribute('tempo')||120),factor=bpm/original;if(!sounds.length){const measure=doc.querySelector('part > measure'),direction=doc.createElementNS(doc.documentElement.namespaceURI,'direction'),sound=doc.createElementNS(doc.documentElement.namespaceURI,'sound');sound.setAttribute('tempo',bpm);const type=doc.createElementNS(doc.documentElement.namespaceURI,'direction-type'),words=doc.createElementNS(doc.documentElement.namespaceURI,'words');words.textContent='Tempo '+bpm;type.append(words);direction.append(type,sound);measure.insertBefore(direction,[...measure.children].find(el=>el.localName==='note')||null);}else sounds.forEach(el=>el.setAttribute('tempo',Math.round(+el.getAttribute('tempo')*factor*100)/100));doc.querySelectorAll('metronome > per-minute').forEach(el=>{el.textContent=Math.round(+el.textContent*factor*100)/100;});return doc;}
 function edit(xml,{transpose=0,bpm=null}={}){const doc=document(xml);transposeDocument(doc,transpose);if(bpm!==null)setTempo(doc,bpm);return new XMLSerializer().serializeToString(doc);}
 function info(xml){const doc=document(xml),score=doc.documentElement;return {title:score.querySelector('work-title')?.textContent||score.querySelector('movement-title')?.textContent||'Partitura importada',composer:score.querySelector('creator[type="composer"]')?.textContent||'',meter:(score.querySelector('time > beats')?.textContent||4)+'/'+(score.querySelector('time > beat-type')?.textContent||4),fifths:+(score.querySelector('key > fifths')?.textContent||0),bars:score.querySelector('part')?.querySelectorAll('measure').length||0};}
 function harmony(xml){const doc=document(xml),part=doc.querySelector('part');let divisions=1;return [...part.querySelectorAll(':scope > measure')].map((measure,index)=>{const d=measure.querySelector('attributes > divisions');if(d)divisions=+d.textContent;let beat=0,last=0;const chords=[];for(const el of measure.children){if(el.localName==='backup')beat-=+(el.querySelector('duration')?.textContent||0)/divisions;if(el.localName==='forward')beat+=+(el.querySelector('duration')?.textContent||0)/divisions;if(el.localName==='note'&&!el.querySelector('chord,grace')){last=beat;beat+=+(el.querySelector('duration')?.textContent||0)/divisions;}if(el.localName==='harmony'){const root=el.querySelector('root'),step=root?.querySelector('root-step')?.textContent;if(!step)continue;const accidental=n=>+n<0?'b'.repeat(Math.min(2,-n)):'#'.repeat(Math.min(2,+n)),kind=el.querySelector('kind'),suffix={major:'',minor:'m',dominant:'7','major-seventh':'maj7','minor-seventh':'m7','half-diminished':'m7b5',diminished:'dim','diminished-seventh':'dim7','major-sixth':'6','minor-sixth':'m6',augmented:'aug','suspended-fourth':'sus4'}[kind?.textContent]??kind?.getAttribute('text')??'';let symbol=step+accidental(root.querySelector('root-alter')?.textContent||0)+suffix;for(const degree of el.querySelectorAll('degree'))symbol+=accidental(degree.querySelector('degree-alter')?.textContent||0)+(degree.querySelector('degree-value')?.textContent||'');const bass=el.querySelector('bass');if(bass)symbol+='/'+bass.querySelector('bass-step').textContent+accidental(bass.querySelector('bass-alter')?.textContent||0);chords.push({beat:beat+ +(el.querySelector('offset')?.textContent||0)/divisions,symbol});}}return {index,number:measure.getAttribute('number')||String(index+1),implicit:measure.getAttribute('implicit')==='yes',form:measure.querySelector('rehearsal')?.textContent||'',leftBar:measure.querySelector('repeat[direction=forward]')?'|:':'|',rightBar:measure.querySelector('repeat[direction=backward]')?':||':measure.querySelector('bar-style')?.textContent==='light-heavy'?'|||':'|',ending:measure.querySelector('ending[type=start]')?.getAttribute('number')||'',jump:measure.querySelector('sound[dacapo]')?'D.C.':measure.querySelector('sound[dalsegno]')?'D.S.':'',chords};});}
 function annotate(xml,rows,show=true){
  const doc=document(xml),measures=[...doc.querySelector('part').children].filter(n=>n.localName==='measure');
  if(rows.length!==measures.length)throw Error('La cantidad de compases del análisis no coincide con la partitura.');
  let divisions=1;
  const make=(tag,text)=>{const node=doc.createElementNS(doc.documentElement.namespaceURI,tag);if(text!==undefined)node.textContent=String(text);return node;};
  const originalHarmonies=harmony(xml);
  measures.forEach((measure,index)=>{const originals=[...measure.querySelectorAll('harmony')];divisions=+(measure.querySelector('divisions')?.textContent||divisions);measure.querySelectorAll('harmony').forEach(n=>n.remove());measure.querySelectorAll('direction').forEach(n=>{if(n.getAttribute('data-aac-analysis')||String(n.getAttribute('id')||'').startsWith('aac-analysis-'))n.remove();});const anchor=[...measure.children].find(n=>n.localName==='note')||null;
   for(const slot of rows[index].slots){if(!slot.chord)continue;const match=slot.chord.match(/^([A-G])([b#]{0,2})(.*?)(?:\/([A-G])([b#]{0,2}))?$/);if(!match)throw Error('Cifrado no compatible: '+slot.chord);
    const harmony=make('harmony'),r=make('root');r.append(make('root-step',match[1]));if(match[2])r.append(make('root-alter',match[2].includes('b')?-match[2].length:match[2].length));harmony.append(r);
    const suffix=match[3],kind=make('kind',({'':'major',m:'minor','7':'dominant',maj7:'major-seventh',m7:'minor-seventh',m7b5:'half-diminished',dim:'diminished',dim7:'diminished-seventh','6':'major-sixth',m6:'minor-sixth',sus4:'suspended-fourth'})[suffix]||'other');kind.setAttribute('text',suffix);harmony.append(kind);
    if(match[4]){const bass=make('bass');bass.append(make('bass-step',match[4]));if(match[5])bass.append(make('bass-alter',match[5].includes('b')?-match[5].length:match[5].length));harmony.append(bass);}
    const previous=(originalHarmonies[index]?.chords||[]).findIndex(c=>c.symbol===slot.chord&&Math.abs(c.beat-slot.beat)<1e-6);
    if(previous>=0&&originals[previous]){const clone=originals[previous].cloneNode(true);clone.querySelectorAll('offset').forEach(n=>n.remove());clone.append(make('offset',Math.round(slot.beat*divisions)));measure.insertBefore(clone,anchor);}else{harmony.append(make('offset',Math.round(slot.beat*divisions)));measure.insertBefore(harmony,anchor);}
    const lines=[slot.degree,slot.mode,[slot.sectionLabel,slot.originScale].filter(Boolean).join(' · ')].filter(Boolean);
    if(show&&lines.length){const direction=make('direction');direction.setAttribute('placement','above');direction.setAttribute('id',`aac-analysis-${index}-${slot.index??slot.beat}`);const type=make('direction-type'),words=make('words',lines.join('\n'));words.setAttribute('font-size','9');words.setAttribute('color','#9B5714');type.append(words);direction.append(type,make('offset',Math.round(slot.beat*divisions)));measure.insertBefore(direction,anchor);}
   }
  });return new XMLSerializer().serializeToString(doc);
 }
 function frameAt(timeline,time){
  time=Math.max(0,Math.min(timeline.duration,time));const visit=timeline.visits.find(v=>time>=v.start-1e-9&&time<v.end-1e-9)||timeline.visits.at(-1);if(!visit)return null;
  const writtenBeat=timeline.writtenBeatAtTime(time),localBeat=Math.max(0,Math.min(visit.sourceEnd-visit.sourceStart,writtenBeat-visit.startBeat));
  return {time,writtenBeat,measure:visit.index,localBeat,sourceBeat:visit.sourceStart+localBeat,active:timeline.events.map((e,index)=>({e,index})).filter(({e})=>time>=e.start-1e-9&&time<e.start+e.dur-1e-9)};
 }
 function layoutScore(xml,rows,width=720,visual=false,manualBreaks=null){
  const doc=document(xml);if(visual)doc.querySelectorAll('direction').forEach(n=>{if(n.getAttribute('id')==='aac-performance')n.remove();});const measures=[...doc.querySelector('part').children].filter(n=>n.localName==='measure'),available=Math.max(220,width/.9-110);let used=0;
  const make=tag=>doc.createElementNS(doc.documentElement.namespaceURI,tag);
  measures.forEach((measure,i)=>{measure.querySelectorAll('print').forEach(n=>n.remove());if(visual)measure.querySelectorAll('direction').forEach(n=>{if(String(n.getAttribute('id')||'').startsWith('aac-analysis-'))n.remove();});
   const slots=rows[i]?.slots.filter(s=>s.chord)||[],notes=measure.querySelectorAll('note').length;
   const cost=Math.max(measure.getAttribute('implicit')==='yes'?75:125,notes*12+55,slots.length?slots.reduce((sum,s)=>sum+Math.max(190,Math.min(240,Math.max(...[s.chord,s.degree,s.mode,s.sectionLabel,s.originScale].map(t=>String(t||'').length))*7+38)),0):0);
   if(i&&(manualBreaks?manualBreaks.includes(i):used+cost>available)){const print=make('print');print.setAttribute('new-system','yes');measure.insertBefore(print,measure.firstChild);used=0;}used+=cost;
  });return new XMLSerializer().serializeToString(doc);
 }
 function reflowBreaks(starts,selected,direction,count){
  if(!['up','down'].includes(direction))throw Error('Dirección de salto no válida.');
  const clean=[...new Set([0,...starts])].filter(n=>Number.isInteger(n)&&n>=0&&n<count).sort((a,b)=>a-b),start=clean.filter(n=>n<=selected).at(-1),next=clean.find(n=>n>selected);
  if(!Number.isInteger(selected)||selected<0||selected>=count)throw Error('Selecciona un compás válido.');
  if(direction==='up'){if(start===0)throw Error('El compás ya está en el primer pentagrama.');return [...new Set(clean.filter(n=>n!==start).concat(selected+1<count?[selected+1]:[]))].sort((a,b)=>a-b);}
  if(selected===start)throw Error('Ese compás ya inicia un pentagrama. Selecciona otro para mover el salto hacia abajo.');
  return [...new Set(clean.filter(n=>n!==next).concat(selected))].sort((a,b)=>a-b);
 }
 function performance(xml,swing){
  const doc=document(xml),measure=doc.querySelector('part > measure'),ns=doc.documentElement.namespaceURI,make=tag=>doc.createElementNS(ns,tag);
  doc.querySelectorAll('direction').forEach(n=>{if(n.getAttribute('id')==='aac-performance'||(!n.querySelector('direction-type')&&n.querySelector('sound > swing')))n.remove();});doc.querySelectorAll('sound > swing').forEach(n=>n.remove());
  const direction=make('direction'),type=make('direction-type'),words=make('words'),sound=make('sound'),node=make('swing');direction.setAttribute('id','aac-performance');words.textContent=swing?'Swing (2:1)':'Corcheas rectas';type.append(words);
  for(const [name,value]of swing?[['first','2'],['second','1'],['swing-type','eighth']]:[['straight',null]]){const child=make(name);if(value)child.textContent=value;node.append(child);}sound.append(node);direction.append(type,sound);measure.insertBefore(direction,[...measure.children].find(n=>n.localName==='note')||null);return new XMLSerializer().serializeToString(doc);
 }
 function swingTimeline(timeline,enabled){
  const inverse=secondsAt=>seconds=>{let low=0,high=timeline.visits.at(-1)?.endBeat||0;for(let i=0;i<40;i++){const mid=(low+high)/2;if(secondsAt(mid)<seconds)low=mid;else high=mid;}return (low+high)/2;};
  if(!enabled)return {...timeline,writtenBeatAtTime:inverse(timeline.secondsAt)};
  // Warp each beat continuously: written offbeat 1/2 becomes 2/3. Beats and bar lengths stay fixed.
  const straight=new Set();for(const e of timeline.events)for(const b of [e.beat,e.endBeat])if(Math.abs(b*2-Math.round(b*2))>1e-6)straight.add(Math.floor(b));
  const warp=b=>{const whole=Math.floor(b),f=b-whole;if(straight.has(whole))return b;return whole+(f<=.5?f*4/3:2/3+(f-.5)*2/3);},secondsAt=b=>timeline.secondsAt(warp(b));
  return {...timeline,secondsAt,duration:secondsAt(timeline.visits.at(-1)?.endBeat||0),visits:timeline.visits.map(v=>Number.isFinite(v.startBeat)?{...v,start:secondsAt(v.startBeat),end:secondsAt(v.endBeat)}:v),events:timeline.events.map(e=>({...e,beat:warp(e.beat),endBeat:warp(e.endBeat),start:secondsAt(e.beat),dur:secondsAt(e.endBeat)-secondsAt(e.beat)})),clicks:timeline.clicks.map(c=>({...c,time:secondsAt(c.beat)})),writtenBeatAtTime:seconds=>{let low=0,high=timeline.visits.at(-1)?.endBeat||0;for(let i=0;i<40;i++){const mid=(low+high)/2;if(secondsAt(mid)<seconds)low=mid;else high=mid;}return (low+high)/2;}};
 }
 const bytes=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255],ascii=s=>[...s].map(c=>c.charCodeAt(0));
 function variable(n){n=Math.max(0,Math.round(n));let out=[n&127];while(n>>=7)out.unshift((n&127)|128);return out;}
 function midi(timeline,{meter='4/4',title='Melodía'}={}){
  const ppq=480,list=[];const add=(tick,data,order=1)=>list.push({tick:Math.round(tick),data,order});const [beats,unit]=meter.split('/').map(Number);
  add(0,[0xff,0x58,4,beats||4,Math.round(Math.log2(unit||4)),24,8],-5);const name=Array.from(new TextEncoder().encode(title));add(0,[0xff,3,...variable(name.length),...name],-6);add(0,[0xc0,0],-4);
  for(const tempo of timeline.tempoChanges.length?timeline.tempoChanges:[{beat:0,tempo:120}]){const value=Math.round(60000000/tempo.tempo);add(tempo.beat*ppq,[0xff,0x51,3,(value>>16)&255,(value>>8)&255,value&255],-3);}
  for(const note of timeline.events){if(!Number.isFinite(note.midi)||note.midi<0||note.midi>127||note.endBeat<=note.beat)throw Error('Evento MIDI no válido');add(note.beat*ppq,[0x90,Math.round(note.midi),88],1);add(note.endBeat*ppq,[0x80,Math.round(note.midi),0],0);}
  list.sort((a,b)=>a.tick-b.tick||a.order-b.order);let previous=0,data=[];for(const event of list){data.push(...variable(event.tick-previous),...event.data);previous=event.tick;}const end=timeline.visits.at(-1)?.endBeat*ppq||previous;data.push(...variable(Math.max(0,end-previous)),0xff,0x2f,0);return new Uint8Array([...ascii('MThd'),...bytes(6),0,0,0,1,(ppq>>8)&255,ppq&255,...ascii('MTrk'),...bytes(data.length),...data]);
 }
 return {document,writtenPitch,spelling,shiftedKey,transposePitch,annotate,performance,frameAt,layoutScore,reflowBreaks,swingTimeline,transposeDocument,setTempo,edit,info,harmony,midi};
});
