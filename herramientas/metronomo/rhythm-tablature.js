(function(root){'use strict';
 const Strings=root.JMLScoreGuitar||(typeof require==='function'?require('../editor-crescendo/src/score-editor-guitar.js'):null);
 const Structure=root.CrescendoRhythmStructure||(typeof require==='function'?require('./rhythm-structure.js'):null);
 const Audio=root.CrescendoRhythmAudio||(typeof require==='function'?require('./rhythm-audio.js'):null);
 const ns='http://www.w3.org/2000/svg';
 const pitch=midi=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][((midi%12)+12)%12]+(Math.floor(midi/12)-1);
 function noteMidis(entry,id='piano'){return (entry.notes||[entry.note]).map(note=>Audio.midiFor({...entry,note},id));}
 function setPosition(events,marks,index,head,id,{string,fret,position='I'}){
  const instrument=Strings.forInstrument(id),entry=events[index];
  if(!instrument||!entry||entry.kind==='rest')return 'Selecciona una nota válida.';
  const midi=instrument.midi(string,fret);if(midi===null)return 'Cuerda o posición no válida.';
  const sounding=Structure.resolve(events,marks)[index],notes=[...(sounding.notes||[sounding.note])];if(!notes[head])return 'Selecciona una nota válida.';
  const previous=noteMidis(sounding,id)[head],midis=noteMidis(sounding,id);midis[head]=midi;
  if(new Set(midis).size!==midis.length)return 'Esa altura ya está escrita en el acorde.';
  const chosen={string,fret,midi,...(!instrument.fretted?Strings.technique(fret,position):{})};
  const saved=(entry.stringFingerings?.[id]||[]).filter(p=>p.midi!==previous);
  const fingerings=instrument.fingering(midis,[...saved,chosen]);if(fingerings.length!==midis.length)return 'Esa cuerda está ocupada por otra nota del acorde.';
  notes[head]=pitch(instrument.writtenMidi(midi)-(entry.ottava?12:0));
  const plains=notes.map(note=>Structure.parsePitch(note).plain);
  if(new Set(plains).size!==plains.length)return 'Las notas del acorde deben tener distintas posiciones en el pentagrama.';
  entry.note=notes[0];if(entry.notes)entry.notes=notes;
  entry.accidentalsByNote=Object.fromEntries(notes.map(note=>{const p=Structure.parsePitch(note);return [p.plain,p.explicit||'natural'];}));
  delete entry.midi;delete entry.accidental;
  entry.stringFingerings={...entry.stringFingerings,[id]:fingerings};return '';
 }
 function render(host,{events,marks,instrument:id,score,onEdit}){
  const instrument=Strings.forInstrument(id),toggle=document.getElementById('rhythmTabEnabled');
  if(toggle)toggle.closest('label').hidden=!instrument;
  host.hidden=true;host.replaceChildren();if(!instrument||toggle?.checked===false)return;
  const original=score.querySelector('svg');if(!original)return;
  const width=Number(original.getAttribute('width')),boxes=[...score.querySelectorAll('.rhythm-measure-hit')];
  const rows=[...new Set(boxes.map(box=>box.dataset.top))].sort((a,b)=>Number(a)-Number(b));
  const svg=original;
  svg.querySelectorAll('.integrated-tab,.string-tab-column,.string-tab-inline').forEach(node=>node.remove());
  const layer=document.createElementNS(ns,'g');layer.classList.add('integrated-tab');layer.addEventListener('pointerdown',e=>e.stopPropagation());layer.addEventListener('click',e=>e.stopPropagation());svg.appendChild(layer);
  const add=(name,attrs,text)=>{const node=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;layer.appendChild(node);return node;};
  const resolved=Structure.resolve(events,marks),heads=[...score.querySelectorAll('.rhythm-head-target')];
  rows.forEach((top,row)=>{
   const y=Number(top)+144,rowBoxes=boxes.filter(box=>box.dataset.top===top),staff=Number(rowBoxes[0].dataset.staff);
   add('rect',{class:'string-tab-surface',x:0,y:y-26,width,height:instrument.tuning.length*17+34,fill:'transparent'});
   add('text',{x:24,y:y-16,'font-size':10,fill:'#555'},instrument.name);
   const left=24,right=Math.max(...rowBoxes.map(box=>Number(box.getAttribute('x'))+Number(box.getAttribute('width')))),bottom=y+(instrument.tuning.length-1)*17;
   instrument.labels.forEach((name,i)=>{const cy=y+i*17;add('line',{x1:left,x2:right,y1:cy,y2:cy,stroke:'#555','stroke-width':.8});});
   ['T','A','B'].forEach((letter,i)=>add('text',{x:left+12,y:y+(instrument.tuning.length-1)*17/2-16+i*18,'font-family':'serif','font-size':20,fill:'#222','text-anchor':'middle'},letter));
   add('line',{class:'staff-tab-connector',x1:left,x2:left,y1:Number(top),y2:bottom,stroke:'#333','stroke-width':1});
   rowBoxes.forEach(box=>{const bar=Number(box.dataset.bar),end=Number(box.getAttribute('x'))+Number(box.getAttribute('width'));add('line',{x1:end,x2:end,y1:Number(top),y2:y+(instrument.tuning.length-1)*17,stroke:'#333',class:'staff-tab-connector'});
    resolved.forEach((entry,index)=>{if((entry.bar||0)!==bar||(entry.staff||1)!==staff||entry.kind==='rest')return;
     const midis=noteMidis(entry,id),positions=instrument.fingering(midis,entry.stringFingerings?.[id]||[]);
     const anchor=heads.find(node=>Number(node.dataset.event)===index);if(!anchor)return;
     const x=Number(anchor.getAttribute('cx')),editable=positions.map(p=>({...p,head:midis.indexOf(p.midi)}));
     const open=root.CrescendoStringTab.column({svg,container:layer,x,y,instrument,positions:editable,key:`metronome:${id}:${entry.id||index}`,onApply:(p,string,fret,position)=>onEdit(index,p.head,{string,fret,position})});
     if(!editable.length)add('text',{x,y:y-7,fill:'#a33','font-size':12},'—');
     editable.forEach(p=>{
      const cy=y+(p.string-1)*17;
      add('rect',{x:x-9,y:cy-9,width:18,height:17,fill:'#fffdf8','pointer-events':'none'});
      const label=add('text',{x,y:cy+5,'text-anchor':'middle','font-size':14,fill:'#111',tabindex:0,role:'button',class:'string-tab-number','data-bar':bar,'data-offset':entry.offset||0,'data-beats':entry.beats||0,'aria-label':`Editar cuerda ${p.string}, ${instrument.fretted?'traste':'banda'} ${p.fret}`,style:'cursor:text'},String(p.fret));
      label.addEventListener('pointerdown',event=>open(event,p));label.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))open(event,p);});
     });
    });
   });
  });

 }
 const api={setPosition,render,noteMidis};if(typeof module!=='undefined')module.exports=api;else root.CrescendoRhythmTab=api;
})(typeof window==='undefined'?globalThis:window);
