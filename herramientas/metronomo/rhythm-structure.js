(function(root){'use strict';
const EPS=1e-7;
const keyNames=[['Do♭ mayor / La♭ menor',-7],['Sol♭ mayor / Mi♭ menor',-6],['Re♭ mayor / Si♭ menor',-5],['La♭ mayor / Fa menor',-4],['Mi♭ mayor / Do menor',-3],['Si♭ mayor / Sol menor',-2],['Fa mayor / Re menor',-1],['Do mayor / La menor',0],['Sol mayor / Mi menor',1],['Re mayor / Si menor',2],['La mayor / Fa♯ menor',3],['Mi mayor / Do♯ menor',4],['Si mayor / Sol♯ menor',5],['Fa♯ mayor / Re♯ menor',6],['Do♯ mayor / La♯ menor',7]];
function meter(value='4/4'){const m=/^(\d+)\/(1|2|4|8|16|32)$/.exec(String(value));if(!m||+m[1]<1||+m[1]>32)throw Error('Compás no válido.');return {label:`${+m[1]}/${+m[2]}`,top:+m[1],bottom:+m[2],capacity:+m[1]*4/+m[2]};}
function at(marks,type,bar,fallback){const changes=marks.filter(m=>m.type===type&&m.bar<=bar).sort((a,b)=>a.bar-b.bar);return changes.length?changes.at(-1):fallback;}
function keyAt(marks,bar){return Math.max(-7,Math.min(7,Math.round(Number(at(marks,'key',bar,{fifths:0}).fifths)||0)));}
function timeline(base='4/4',marks=[],bars=4){const starts=[0],capacities=[],meters=[],keys=[];for(let bar=0;bar<bars;bar++){const m=meter(at(marks,'meter',bar,{meter:base}).meter);meters.push(m);capacities.push(m.capacity);keys.push(keyAt(marks,bar));starts.push(starts.at(-1)+m.capacity);}return {starts,capacities,meters,keys,total:starts.at(-1),absolute:(bar,offset=0)=>(starts[bar]??starts.at(-1))+offset,locate(beat){if(beat>=starts.at(-1))return {bar:bars-1,beat:capacities.at(-1)};const bar=Math.max(0,Math.min(bars-1,starts.findIndex((s,i)=>i<bars&&beat<starts[i+1]-EPS)));return {bar,beat:Math.max(0,beat-starts[bar])};}};}
function signatureAccidental(letter,fifths){return (fifths>0?'FCGDAEB':'BEADGCF').slice(0,Math.abs(fifths)).includes(letter)?(fifths>0?'sharp':'flat'):'natural';}
const symbols={sharp:'#',flat:'b',natural:''};
function parsePitch(note){const m=/^([A-G])([#b♯♭]?)(-?\d+)$/.exec(String(note));if(!m)throw Error('Nota no válida: '+note);return {letter:m[1],octave:+m[3],plain:m[1]+m[3],explicit:m[2]?['#','♯'].includes(m[2])?'sharp':'flat':null};}
function pitchFromMidi(midi){return ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][midi%12]+(Math.floor(midi/12)-1);}
function resolve(events,marks=[]){
 const carry=new Map(),result=new Map();
 [...events].sort((a,b)=>(a.bar||0)-(b.bar||0)||(a.offset||0)-(b.offset||0)||(b.grace?1:0)-(a.grace?1:0)).forEach(e=>{
  if(e.kind==='rest'){result.set(e,{...e});return;}
  const raw=e.notes||[e.note||(Number.isFinite(e.midi)?pitchFromMidi(e.midi):'C5')],displayAccidentals=[],sounding=[];
  for(const n of raw){const p=parsePitch(n),key=[e.staff||1,e.bar||0,p.plain].join(':'),prior=carry.get(key)??signatureAccidental(p.letter,keyAt(marks,e.bar||0));
   const requested=e.accidentalsByNote?.[p.plain]??(raw.length===1?e.accidental:null)??p.explicit,value=requested??prior;
   displayAccidentals.push(requested&&requested!==prior?requested:null);sounding.push(p.letter+symbols[value]+p.octave);if(requested)carry.set(key,requested);
  }
  const next={...e,note:sounding[0],displayAccidentals};if(e.notes)next.notes=sounding;
  // The effective spelling, including a key signature, is authoritative for audio.
  delete next.midi;result.set(e,next);
 });return events.map(e=>result.get(e));
}
function chromaticPitch(note,direction){
 const p=parsePitch(note),midi=(p.octave+1)*12+({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[p.letter])+(p.explicit==='sharp'?1:p.explicit==='flat'?-1:0)+(direction>0?1:-1);
 const name=(direction>0?['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']:['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'])[((midi%12)+12)%12];
 return name+(Math.floor(midi/12)-1);
}
function transposeHead(events,marks,index,head,direction){
 const entry=events[index];if(!entry||entry.kind==='rest')return false;
 const sounding=resolve(events,marks)[index],notes=[...(sounding.notes||[sounding.note])];if(!notes[head])return false;
 const next=chromaticPitch(notes[head],direction),pitch=parsePitch(next),diatonic=pitch.octave*7+'CDEFGAB'.indexOf(pitch.letter),staffIndex=((entry.staff||1)===2?28:40)-diatonic;
 if(staffIndex< -8||staffIndex>20||notes.some((n,i)=>i!==head&&parsePitch(n).plain===pitch.plain))return false;
 // Pin each chord head to its sounding pitch before moving one of them.
 notes[head]=next;entry.note=notes[0];if(entry.notes)entry.notes=notes;
 entry.accidentalsByNote=Object.fromEntries(notes.map(n=>{const p=parsePitch(n);return [p.plain,p.explicit||'natural'];}));
 delete entry.accidental;delete entry.midi;return true;
}
function editBars(events,marks,bars,index,operation){
 const inserting=operation==='insert';
 if(!['insert','remove'].includes(operation)||!Number.isInteger(index)||index<0||index>(inserting?bars:bars-1))return {message:'Compás no válido.'};
 if(inserting&&bars>=16)return {message:'El máximo es de 16 compases.'};
 if(!inserting&&bars<=1)return {message:'Debe quedar al menos un compás.'};
 const delta=inserting?1:-1,nextEvents=events.filter(e=>inserting||(e.bar||0)!==index).map(e=>({...e,bar:(e.bar||0)+((e.bar||0)>=index?delta:0)}));
 const ids=new Set(nextEvents.map(e=>e.id).filter(Boolean));
 for(const e of nextEvents)for(const field of ['tieToId','slurToId','glissandoToId'])if(e[field]&&!ids.has(e[field]))delete e[field];
 const nextMarks=[];
 for(const mark of marks){
  const m={...mark};
  if(inserting){if(m.bar>=index)m.bar++;if(m.endBar!==undefined&&m.endBar>=index)m.endBar++;nextMarks.push(m);continue;}
  if(m.endBar!==undefined){
   if(m.bar===index&&m.endBar===index)continue;
   if(m.bar===index){m.offset=0;}else if(m.bar>index)m.bar--;
   if(m.endBar===index){m.endBar=index-1;delete m.endOffset;}else if(m.endBar>index)m.endBar--;
  }else if(m.bar===index){
   // Preserve the local meter/key governing the music that follows the removed bar.
   if(!['meter','key'].includes(m.type)||index===bars-1||marks.some(n=>n.type===m.type&&n.bar===index+1))continue;
  }else if(m.bar>index)m.bar--;
  nextMarks.push(m);
 }
 if(inserting&&index===0)for(const type of ['meter','key']){const first=marks.find(m=>m.type===type&&m.bar===0);if(first)nextMarks.push({...first,bar:0});}
 return {events:nextEvents,marks:nextMarks,bars:bars+delta};
}
function keyGlyphs(fifths,previous=0){const old=(previous>0?'FCGDAEB':'BEADGCF').slice(0,Math.abs(previous)),next=(fifths>0?'FCGDAEB':'BEADGCF').slice(0,Math.abs(fifths)),order=previous>0?[4,1,5,2,-1,3,0]:[0,3,-1,2,-2,1,-3],glyphs=[];old.split('').forEach((letter,i)=>{if(Math.sign(previous)!==Math.sign(fifths)||!next.includes(letter))glyphs.push({code:0xE261,step:order[i]});});const positions=fifths>0?[4,1,5,2,-1,3,0]:[0,3,-1,2,-2,1,-3];for(let i=0;i<Math.abs(fifths);i++)glyphs.push({code:fifths>0?0xE262:0xE260,step:positions[i]});return glyphs;}
function keyWidth(fifths,previous=0){const count=keyGlyphs(fifths,previous).length;return count?count*11+6:0;}
function keySVG(fifths,previous,x,top,staff){return keyGlyphs(fifths,previous).map((g,i)=>`<text class="rhythm-key-accidental" x="${x+i*11}" y="${top+20-(g.step-(staff===2?2:0))*5}" font-family="Bravura Metronome" font-size="40">${String.fromCodePoint(g.code)}</text>`).join('');}
function slots(duration,capacity,events=[],pulse=1,span=duration){const step=Math.min(duration,pulse),values=new Set([0]);for(let beat=0,n=0;beat<capacity-EPS&&n<2048;beat+=step,n++)values.add(Number(beat.toFixed(7)));for(const e of events){if(e.grace)continue;values.add(e.offset||0);values.add((e.offset||0)+e.beats);}return [...values].filter(beat=>beat>=0&&beat<capacity-EPS&&beat+span<=capacity+EPS).sort((a,b)=>a-b);}
function validate(events,tl,marks=[]){return marks.every(m=>(m.offset===undefined||m.offset>=0&&m.offset<tl.capacities[m.bar])&&(m.endOffset===undefined||m.endOffset>=0&&m.endOffset<=tl.capacities[m.endBar??m.bar]))&&events.every(e=>e.bar>=0&&e.bar<tl.capacities.length&&(e.offset||0)>=0&&(e.offset||0)+(e.beats||0)<=tl.capacities[e.bar]+.0001);}
const api={editBars,chromaticPitch,transposeHead,meter,timeline,keyAt,keyNames,signatureAccidental,parsePitch,resolve,keyGlyphs,keyWidth,keySVG,slots,validate};if(typeof module!=='undefined')module.exports=api;else root.CrescendoRhythmStructure=api;
})(typeof window==='undefined'?globalThis:window);
