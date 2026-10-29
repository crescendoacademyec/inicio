/* Study exercises: exact rational timing, Bravura engraving and portable files. */
(function(root){'use strict';
const TICKS=12,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const durations=[[48,'whole',0],[36,'half',1],[24,'half',0],[18,'quarter',1],[12,'quarter',0],[9,'eighth',1],[6,'eighth',0],[4,'eighth',0,3],[3,'16th',0],[2,'16th',0,3],[1,'32nd',0,3]];
function timeline(frames,meter='4/4'){
 const [top,bottom]=meter.split('/').map(Number);if(![2,3,4,6].includes(top)||![4,8].includes(bottom))throw Error('Compás no compatible.');
 const capacity=Math.round(top*4/bottom*TICKS),bars=[];let pos=0;
 frames.forEach((f,index)=>{const ticks=Math.round(f.beats*TICKS);if(!Number.isFinite(ticks)||ticks<=0||Math.abs(ticks/TICKS-f.beats)>1e-6)throw Error('Duración no representable.');let left=ticks,offset=0;
  while(left){const bar=Math.floor(pos/capacity),available=capacity-pos%capacity;bars[bar]||=[];let chunk=Math.min(left,available);
   while(chunk){const d=durations.find(d=>d[0]<=chunk);const entry={index,start:pos,ticks:d[0],type:d[1],dots:d[2],tuplet:d[3]||0,tieStop:offset>0,tieStart:left>d[0],frame:f};bars[bar].push(entry);pos+=d[0];offset+=d[0];chunk-=d[0];left-=d[0];}
  }
 });
 if(bars.length){let padStart=pos,remain=capacity-pos%capacity;if(remain!==capacity)while(remain){const d=durations.find(d=>d[0]<=remain);bars.at(-1).push({rest:true,start:padStart,ticks:d[0],type:d[1],dots:d[2],tuplet:d[3]||0});remain-=d[0];padStart+=d[0];}}
 return {bars,capacity,top,bottom,total:pos,starts:frames.reduce((a,f,i)=>{a.push(i?a.at(-1)+Math.round(frames[i-1].beats*TICKS):0);return a;},[])};
}
function pitch(midi,name){const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11};name=name||['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'][(midi%12+12)%12];const step=name[0],alter=[...name.slice(1)].reduce((n,c)=>n+(c==='b'?-1:1),0),octave=Math.round((midi-natural[step]-alter)/12)-1;return `<pitch><step>${step}</step><alter>${alter}</alter><octave>${octave}</octave></pitch>`;}
function musicXML(frames,context,config={},title='Estudio de diapasón'){
 const time=timeline(frames,config.meter||'4/4'),tab=config.tab!==false,transpose=12,staffs=tab?2:1,strings=context.pitches.length;
 const tune=context.pitches.slice().reverse().map((midi,i)=>{const name=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][midi%12];const match=pitch(midi,name);return `<staff-tuning line="${i+1}">${match.replace('<pitch>','').replace('</pitch>','').replaceAll('<step>','<tuning-step>').replaceAll('</step>','</tuning-step>').replaceAll('<alter>','<tuning-alter>').replaceAll('</alter>','</tuning-alter>').replaceAll('<octave>','<tuning-octave>').replaceAll('</octave>','</tuning-octave>')}</staff-tuning>`;}).join('');
 let previousLabel='';
 const measure=time.bars.map((events,bar)=>{
  let body=bar===0?`<attributes><divisions>${TICKS}</divisions><key><fifths>0</fifths></key><time><beats>${time.top}</beats><beat-type>${time.bottom}</beat-type></time>${tab?'<staves>2</staves>':''}<clef number="1"><sign>G</sign><line>2</line></clef>${tab?'<clef number="2"><sign>TAB</sign><line>5</line></clef>':''}${tab?`<staff-details number="2"><staff-lines>${strings}</staff-lines>${tune}</staff-details>`:''}<transpose number="1"><diatonic>0</diatonic><chromatic>0</chromatic><octave-change>-1</octave-change></transpose>${tab?'<transpose number="2"><diatonic>0</diatonic><chromatic>0</chromatic></transpose>':''}</attributes><direction><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${Number(config.tempo)||80}</per-minute></metronome></direction-type><sound tempo="${Number(config.tempo)||80}"/></direction>`:'';
  for(let staff=1;staff<=staffs;staff++){
   if(staff===2)body+=`<backup><duration>${time.capacity}</duration></backup>`;
   for(const [eventIndex,e] of events.entries()){const f=e.frame;
    if(staff===1&&f&&!e.tieStop&&f.label!==previousLabel){body+=`<direction placement="above"><direction-type><words font-family="Times New Roman" font-size="10">${esc(f.label.split(' · ')[0])}</words></direction-type><staff>1</staff></direction>`;previousLabel=f.label;}
    const cells=e.rest?[null]:f.cells;
    cells.forEach((c,i)=>{const ties=c?(e.tieStop?'<tie type="stop"/>':'')+(e.tieStart?'<tie type="start"/>':''):'';const tupletActual=e.tuplet?(config.rhythm==='sextuplets'&&e.ticks===2?6:3):0,tupletNormal=tupletActual===6?4:2;const tupletMark=tupletActual?((e.start%12===0?'<tuplet type="start" bracket="yes"/>':'')+((e.start+e.ticks)%12===0?'<tuplet type="stop"/>':'')):'';const notations=tupletMark+(c?(e.tieStop?'<tied type="stop"/>':'')+(e.tieStart?'<tied type="start"/>':'')+(staff===2?`<technical><string>${c.string+1}</string><fret>${c.fret}</fret></technical>`:''):'');
      const level={eighth:1,'16th':2,'32nd':3}[e.type]||0;
      const beam=(!i&&c)?Array.from({length:level},(_,j)=>{const l=j+1,eligible=n=>n&&!n.rest&&Math.floor(n.start/12)===Math.floor(e.start/12)&&({eighth:1,'16th':2,'32nd':3}[n.type]||0)>=l,prev=eligible(events[eventIndex-1]),next=eligible(events[eventIndex+1]);return prev||next?`<beam number="${l}">${prev?(next?'continue':'end'):'begin'}</beam>`:l>1?`<beam number="${l}">${eventIndex&&events[eventIndex-1]?.start/12>=Math.floor(e.start/12)?'backward hook':'forward hook'}</beam>`:'';}).join(''):'';
      body+=`<note${!c&&staff===2?' print-object="no"':''}${c?` id="study-${e.index}-${bar}-${staff}-${i}-${e.start}"`:''}>${i?'<chord/>':''}${c?pitch(c.midi+(staff===1?transpose:0),f.names?.[c.midi]):'<rest/>'}<duration>${e.ticks}</duration>${ties}<voice>${staff}</voice><type>${e.type}</type>${'<dot/>'.repeat(e.dots)}${e.tuplet?`<time-modification><actual-notes>${tupletActual}</actual-notes><normal-notes>${tupletNormal}</normal-notes><normal-type>${e.type}</normal-type></time-modification>`:''}<staff>${staff}</staff>${beam}${notations?'<notations>'+notations+'</notations>':''}</note>`;
    });
   }
  }
  return `<measure number="${bar+1}">${bar&&bar%4===0?'<print new-system="yes"/>':''}${body}</measure>`;
 }).join('');
 return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${esc(title)}</work-title></work><identification><creator type="composer">Crescendo Academy</creator></identification><defaults><scaling><millimeters>7</millimeters><tenths>40</tenths></scaling></defaults><part-list><score-part id="P1"><part-name>${esc(context.instrumentLabel||'Guitarra')}</part-name></score-part></part-list><part id="P1">${measure}</part></score-partwise>`;
}
function pdfPages(pages){
 const encode=s=>new TextEncoder().encode(s),parts=[],offsets=[0];let size=0;const add=b=>{parts.push(b);size+=b.length;},text=s=>add(encode(s)),object=(id,body)=>{offsets[id]=size;text(`${id} 0 obj\n${body}\nendobj\n`);};
 text('%PDF-1.4\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,`<< /Type /Pages /Kids [${pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')}] /Count ${pages.length} >>`);
 pages.forEach((p,i)=>{const id=3+i*3;object(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);
  offsets[id+1]=size;text(`${id+1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`);add(p.bytes);text('\nendstream\nendobj\n');
  const scale=Math.min(547.28/p.width,793.89/p.height),w=p.width*scale,h=p.height*scale,commands=`q ${w.toFixed(3)} 0 0 ${h.toFixed(3)} 24 ${(817.89-h).toFixed(3)} cm /Im1 Do Q\n`;object(id+2,`<< /Length ${encode(commands).length} >>\nstream\n${commands}endstream`);
 });
 const start=size;text(`xref\n0 ${3+pages.length*3}\n0000000000 65535 f \n`);for(let i=1;i<3+pages.length*3;i++)text(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);text(`trailer\n<< /Size ${3+pages.length*3} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
 const result=new Uint8Array(size);let pos=0;for(const p of parts){result.set(p,pos);pos+=p.length;}return result;
}
function zip(files){
 const chunks=[],central=[];let offset=0,centralLength=0;
 const crc=bytes=>{let n=0xffffffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;};
 const record=(size)=>{const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)};};
 for(const file of files){const name=new TextEncoder().encode(file.name),sum=crc(file.bytes),local=record(30+name.length);local.view.setUint32(0,0x04034b50,true);local.view.setUint16(4,20,true);local.view.setUint16(6,0x800,true);local.view.setUint32(14,sum,true);local.view.setUint32(18,file.bytes.length,true);local.view.setUint32(22,file.bytes.length,true);local.view.setUint16(26,name.length,true);local.bytes.set(name,30);chunks.push(local.bytes,file.bytes);
  const entry=record(46+name.length);entry.view.setUint32(0,0x02014b50,true);entry.view.setUint16(4,20,true);entry.view.setUint16(6,20,true);entry.view.setUint16(8,0x800,true);entry.view.setUint32(16,sum,true);entry.view.setUint32(20,file.bytes.length,true);entry.view.setUint32(24,file.bytes.length,true);entry.view.setUint16(28,name.length,true);entry.view.setUint32(42,offset,true);entry.bytes.set(name,46);central.push(entry.bytes);centralLength+=entry.bytes.length;offset+=local.bytes.length+file.bytes.length;
 }
 const end=record(22);end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,files.length,true);end.view.setUint16(10,files.length,true);end.view.setUint32(12,centralLength,true);end.view.setUint32(16,offset,true);const output=new Uint8Array(offset+centralLength+22);let pos=0;for(const chunk of [...chunks,...central,end.bytes]){output.set(chunk,pos);pos+=chunk.length;}return output;
}

function validateProject(input){
 if(!input||input.kind!=='crescendo-study'||input.version!==1||!Array.isArray(input.frames)||!input.frames.length||input.frames.length>4000)throw Error('El archivo no es un ejercicio de estudio válido.');
 const c=input.context;if(!c||!Array.isArray(c.pitches)||![4,6].includes(c.pitches.length)||c.pitches.some(n=>!Number.isInteger(n)||n<0||n>127)||!Number.isInteger(c.maxFret)||c.maxFret<1||c.maxFret>36)throw Error('Afinación del proyecto no válida.');
 if(!Array.isArray(c.scale)||c.scale.length>12||c.scale.some(n=>!Number.isInteger(n)||n<0||n>11)||!Number.isInteger(c.root)||c.root<0||c.root>11)throw Error('Contexto musical no válido.');
 for(const f of input.frames){if(f.names&&Object.values(f.names).some(n=>typeof n!=='string'||!/^([A-G])([#b]{0,2})$/.test(n)))throw Error('Nombre de nota no válido.');if(!Number.isInteger(f.root)||f.root<0||f.root>11||!Array.isArray(f.chordTones)||f.chordTones.some(n=>!Number.isInteger(n)||n<0||n>48))throw Error('Acorde del proyecto no válido.');if(typeof f.label!=='string'||f.label.length>300||!Number.isFinite(f.beats)||f.beats<=0||f.beats>16||!Array.isArray(f.cells)||!f.cells.length||f.cells.length>12)throw Error('Evento musical no válido.');for(const cell of [...f.cells,...(f.reference||[]),...(f.accompaniment||[])])if(!Number.isInteger(cell.string)||cell.string<0||cell.string>=c.pitches.length||!Number.isInteger(cell.fret)||cell.fret<0||cell.fret>c.maxFret||cell.midi!==c.pitches[cell.string]+cell.fret)throw Error('Una digitación no corresponde a la afinación guardada.');}
 timeline(input.frames,input.config?.meter||'4/4');return input;
}
// OSMD lays TAB tuplets out independently from the rhythmic staff. Keep its
// string/fret glyphs, but anchor each event to the engraved note head above it.
// Rhythm is read on the normal staff; TAB therefore needs no duplicate stems.
function alignTab(host,frames,meter){
 const events=timeline(frames,meter).bars.flat(),notes=[...host.querySelectorAll('.vf-stavenote')],tabs=[...host.querySelectorAll('.vf-tabnote')];
 if(notes.length!==events.length||tabs.length!==events.filter(e=>!e.rest).length)return;
 let index=0;
 events.forEach((event,i)=>{if(event.rest)return;const target=notes[i].querySelector('.vf-notehead')||notes[i],tab=tabs[index++],a=target.getBBox(),b=tab.getBBox();tab.setAttribute('transform',`translate(${a.x+a.width/2-b.x-b.width/2},0)`);});
 for(const svg of host.querySelectorAll('svg')){let tablature=false;for(const group of [...svg.children]){if(group.classList.contains('vf-stavenote')||group.classList.contains('vf-clef'))tablature=false;if(group.classList.contains('vf-tabnote'))tablature=true;if(tablature&&(group.classList.contains('vf-stem')||group.classList.contains('vf-beam')))group.remove();}}
}
class ScoreView{
 constructor(host){this.host=host;this.engine=null;this.revision=0;this.pending=null;this.busy=false;this.ready=Promise.resolve();}
 update(xml,frames,meter){this.pending={xml,frames,meter,revision:++this.revision};this.ready=this.flush();return this.ready;}
 async flush(){if(this.busy)return;this.busy=true;try{while(this.pending){const request=this.pending;this.pending=null;if(!this.engine)this.engine=new root.opensheetmusicdisplay.OpenSheetMusicDisplay(this.host,{backend:'svg',drawingParameters:'default',autoResize:false,drawTitle:true,drawComposer:false,drawPartNames:false,followCursor:false,pageFormat:'A4_P',autoBeam:true});await this.engine.load(request.xml);if(request.revision!==this.revision)continue;this.engine.render();alignTab(this.host,request.frames,request.meter);this.time=timeline(request.frames,request.meter);this.host.querySelectorAll('svg').forEach(svg=>{svg.style.background='#fff';});}}finally{this.busy=false;}}
 highlight(index){if(!this.engine?.cursor||!this.time)return;try{const cursor=this.engine.cursor,target=this.time.starts[index]/(4*TICKS);cursor.reset();let guard=0;while(!cursor.Iterator.EndReached&&cursor.Iterator.CurrentSourceTimestamp?.RealValue<target-1e-6&&guard++<20000)cursor.next();cursor.show();}catch(_){} }
 async raster(){await this.ready;if(this.busy)throw Error('Espera a que termine de dibujarse la partitura.');const svgs=[...this.host.querySelectorAll('svg')];if(!svgs.length)throw Error('La partitura no está disponible.');const pages=[];for(const svg of svgs){const clone=svg.cloneNode(true);clone.querySelectorAll('[id^="cursor"]').forEach(n=>n.remove());clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const width=svg.viewBox.baseVal.width||Number(svg.getAttribute('width')),height=svg.viewBox.baseVal.height||Number(svg.getAttribute('height'));const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}));try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const canvas=document.createElement('canvas'),scale=Math.min(2,2200/width);canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);pages.push(canvas);}finally{URL.revokeObjectURL(url);}}return pages;}
}
const api={TICKS,timeline,pitch,musicXML,pdfPages,zip,validateProject,ScoreView};if(typeof module!=='undefined')module.exports=api;else root.CrescendoStudyScore=api;
})(typeof window==='undefined'?globalThis:window);
