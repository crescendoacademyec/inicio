(function(root){'use strict';
const Structure=root.CrescendoRhythmStructure||(typeof require==='function'?require('./rhythm-structure.js'):null);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function musicXML(events,{meter='4/4',clef='treble',bars=4,writing=root.CrescendoRhythmWriting,marks=[]}={}){
 const timeline=Structure.timeline(meter,marks,bars),divisions=writing.TICKS,staffs=clef==='grand'?[1,2]:[clef==='bass'?2:1];
 const sorted=Structure.resolve(events,marks).sort((a,b)=>(a.bar||0)-(b.bar||0)||(a.offset||0)-(b.offset||0)||(b.grace?1:0)-(a.grace?1:0));
 const notation=writing.notation(sorted,timeline.capacities,bars),ties=new Set(events.filter(e=>e.tieToId).map(e=>e.tieToId)),slurs=events.filter(e=>e.slurToId).map((e,i)=>({start:e.id,end:e.slurToId,number:i+1}));
 const glissandi=events.filter(e=>e.glissandoToId).map((e,i)=>({start:e.id,end:e.glissandoToId,number:i+1}));
 const types={'breve':'breve','whole':'whole','half':'half','quarter':'quarter','eighth':'eighth','sixteenth':'16th','thirty-second':'32nd','sixty-fourth':'64th','one-twenty-eighth':'128th'};
 const pitch=e=>{let note=e.note;if(!note&&e.midi!==undefined){const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];note=names[e.midi%12]+(Math.floor(e.midi/12)-1);}const m=/^([A-G])([#b]?)(-?\d+)$/.exec(note||'C5');return `<pitch><step>${m[1]}</step>${m[2]?`<alter>${m[2]==='#'?1:-1}</alter>`:''}<octave>${Number(m[3])+(e.ottava?1:0)}</octave></pitch>`;};
 let measures='';for(let bar=0;bar<bars;bar++){const {top,bottom,capacity}=timeline.meters[bar],fifths=timeline.keys[bar];
  let body='';if(bar===0)body=`<attributes><divisions>${divisions}</divisions><key><fifths>${fifths}</fifths></key><time><beats>${top}</beats><beat-type>${bottom}</beat-type></time>${staffs.length===2?'<staves>2</staves>':''}${staffs.map((staff,i)=>`<clef number="${i+1}"><sign>${staff===2?'F':'G'}</sign><line>${staff===2?4:2}</line></clef>`).join('')}</attributes>`;
  if(bar>0){const key=fifths!==timeline.keys[bar-1]?`<key><fifths>${fifths}</fifths></key>`:'',time=timeline.meters[bar].label!==timeline.meters[bar-1].label?`<time><beats>${top}</beats><beat-type>${bottom}</beat-type></time>`:'';if(key||time)body+=`<attributes>${key}${time}</attributes>`;}
  const markTools=root.CrescendoRhythmMarks||(typeof require==='function'?require('./rhythm-marks.js'):null),lines=markTools?.barlines(marks,bar)||{left:'',right:''};body+=lines.left;
  staffs.forEach((staff,si)=>{
   if(si)body+=`<backup><duration>${Math.round(capacity*divisions)}</duration></backup>`;
   body+=markTools?.xml(marks,bar,staff,capacity,divisions,si+1,staffs[0])||'';
   const notes=notation.filter(e=>e.staff===staff&&e.bar===bar),beams=new Map();writing.beamGroups(notes,timeline.meters[bar].label).forEach(group=>{for(let level=1;level<=Math.max(...group.map(n=>n.flags));level++){let run=[];const flush=()=>{run.forEach((n,i)=>{if(!beams.has(n.index))beams.set(n.index,[]);beams.get(n.index).push({level,value:run.length===1?(group.indexOf(n)===group.length-1?'backward hook':'forward hook'):i===0?'begin':i===run.length-1?'end':'continue'});});run=[];};for(const n of group){if(n.flags>=level)run.push(n);else flush();}flush();}});
   let ottavaActive=false;const shift=type=>`<direction placement="above"><direction-type><octave-shift type="${type}" size="8" number="1"/></direction-type><staff>${si+1}</staff></direction>`;
   notes.forEach((e,i)=>{
    if(!!e.ottava!==ottavaActive){body+=shift(e.ottava?'down':'stop');ottavaActive=!!e.ottava;}
    const base=e.tupletUnitBeats||e.graceUnitBeats||e.beats,d=writing.durations.find(d=>Math.abs(d[1]-base)<.00001)||writing.durations.find(d=>Math.abs(d[1]*1.5-base)<.00001)||writing.durations.find(d=>Math.abs(d[1]*1.75-base)<.00001)||writing.durations.find(d=>d[0]==='quarter'),dots=e.tupletActual?0:Math.abs(base-d[1]*1.75)<.00001?2:Math.abs(base-d[1]*1.5)<.00001?1:0;
    const tieStart=!!e.tieToId,tieStop=ties.has(e.id),slurMarks=slurs.filter(s=>s.start===e.id||s.end===e.id).map(s=>`<slur type="${s.start===e.id?'start':'stop'}" number="${s.number}"/>`).join('');
    const glissMarks=glissandi.filter(g=>g.start===e.id||g.end===e.id).map(g=>`<glissando type="${g.start===e.id?'start':'stop'}" number="${g.number}" line-type="solid">${g.start===e.id?'gliss.':''}</glissando>`).join('');
    const marks=glissMarks+(tieStart?'<tied type="start"/>':'')+(tieStop?'<tied type="stop"/>':'')+slurMarks+(e.staccato||e.accent?'<articulations>'+(e.staccato?'<staccato/>':'')+(e.accent?'<accent/>':'')+'</articulations>':'')+(e.tupletActual&&e.tuplet?`<tuplet type="${e.tuplet}" bracket="yes" show-number="actual"/>`:'');
    (e.notes||[e.note]).forEach((note,head)=>{const headMarks=head?((tieStart?'<tied type="start"/>':'')+(tieStop?'<tied type="stop"/>':'')):marks;body+=`<note>${head?'<chord/>':''}${e.grace?'<grace slash="yes"/>':''}${e.kind==='rest'?`<rest${e.measureRest?' measure="yes"':''}/>`:pitch({...e,note})}${e.grace?'':`<duration>${Math.round(e.beats*divisions)}</duration>`}${tieStop?'<tie type="stop"/>':''}${tieStart?'<tie type="start"/>':''}<voice>${si+1}</voice>${e.measureRest?'':`<type>${types[d[0]]}</type>${'<dot/>'.repeat(dots)}`}${e.tupletActual?`<time-modification><actual-notes>${e.tupletActual}</actual-notes><normal-notes>${e.tupletNormal}</normal-notes><normal-type>${types[d[0]]}</normal-type></time-modification>`:''}${e.displayAccidentals?.[head]?`<accidental>${e.displayAccidentals[head]}</accidental>`:''}${e.kind!=='rest'&&!beams.has(i)&&!['whole','breve'].includes(d[0])?`<stem>${writing.stemDown(e.note||['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][Number(e.midi||60)%12]+(Math.floor(Number(e.midi||60)/12)-1),staff)?'down':'up'}</stem>`:''}<staff>${si+1}</staff>${(head?[]:beams.get(i)||[]).map(b=>`<beam number="${b.level}">${b.value}</beam>`).join('')}${headMarks?`<notations>${headMarks}</notations>`:''}</note>`;});
   });if(ottavaActive)body+=shift('stop');
  });measures+=`<measure number="${bar+1}">${bar&&bar%4===0?'<print new-system="yes"/>':''}${body}${lines.right}</measure>`;
 }
 return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n<score-partwise version="4.0"><work><work-title>${esc('Ejercicio de ritmo · Crescendo Academy')}</work-title></work><part-list><score-part id="P1"><part-name>Ejercicio</part-name></score-part></part-list><part id="P1">${measures}</part></score-partwise>`;
}
// A single A4 page embeds a high-resolution JPEG of the score. Byte offsets
// are calculated from encoded bytes, including the binary image stream.
function pdf(jpeg,width,height){
 const encode=s=>new TextEncoder().encode(s),parts=[],offsets=[0];let size=0;const add=b=>{parts.push(b);size+=b.length;},text=s=>add(encode(s));
 text('%PDF-1.4\n');const object=(id,body)=>{offsets[id]=size;text(`${id} 0 obj\n${body}\nendobj\n`);};
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=size;text(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);add(jpeg);text('\nendstream\nendobj\n');
 const scale=Math.min(523.28/width,769.89/height),w=width*scale,h=height*scale,commands=`q ${w.toFixed(3)} 0 0 ${h.toFixed(3)} 36 ${(805.89-h).toFixed(3)} cm /Im1 Do Q\n`;
 object(5,`<< /Length ${encode(commands).length} >>\nstream\n${commands}endstream`);const start=size;text('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)text(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);text(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
 const result=new Uint8Array(size);let pos=0;for(const p of parts){result.set(p,pos);pos+=p.length;}return result;
}
const api={musicXML,pdf};if(typeof module!=='undefined')module.exports=api;else root.CrescendoRhythmExport=api;
})(typeof window==='undefined'?globalThis:window);
