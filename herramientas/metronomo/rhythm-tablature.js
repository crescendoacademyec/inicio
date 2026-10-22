(function(root){'use strict';
 const Strings=root.JMLScoreGuitar||(typeof require==='function'?require('../editor-crescendo/src/score-editor-guitar.js'):null);
 const Structure=root.CrescendoRhythmStructure||(typeof require==='function'?require('./rhythm-structure.js'):null);
 const Audio=root.CrescendoRhythmAudio||(typeof require==='function'?require('./rhythm-audio.js'):null);
 const ns='http://www.w3.org/2000/svg';
 const pitch=midi=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][((midi%12)+12)%12]+(Math.floor(midi/12)-1);
 function noteMidis(entry){return (entry.notes||[entry.note]).map(note=>Audio.midiFor({...entry,note}));}
 function setPosition(events,marks,index,head,id,{string,fret,position='I'}){
  const instrument=Strings.forInstrument(id),entry=events[index];
  if(!instrument||!entry||entry.kind==='rest')return 'Selecciona una nota válida.';
  const midi=instrument.midi(string,fret);if(midi===null)return 'Cuerda o posición no válida.';
  const sounding=Structure.resolve(events,marks)[index],notes=[...(sounding.notes||[sounding.note])];if(!notes[head])return 'Selecciona una nota válida.';
  const previous=noteMidis(sounding)[head],midis=noteMidis(sounding);midis[head]=midi;
  if(new Set(midis).size!==midis.length)return 'Esa altura ya está escrita en el acorde.';
  const chosen={string,fret,midi,...(!instrument.fretted?Strings.technique(fret,position):{})};
  const saved=(entry.stringFingerings?.[id]||[]).filter(p=>p.midi!==previous);
  const fingerings=instrument.fingering(midis,[...saved,chosen]);if(fingerings.length!==midis.length)return 'Esa cuerda está ocupada por otra nota del acorde.';
  notes[head]=pitch(midi-(entry.ottava?12:0));
  const plains=notes.map(note=>Structure.parsePitch(note).plain);
  if(new Set(plains).size!==plains.length)return 'Las notas del acorde deben tener distintas posiciones en el pentagrama.';
  entry.note=notes[0];if(entry.notes)entry.notes=notes;
  entry.accidentalsByNote=Object.fromEntries(notes.map(note=>{const p=Structure.parsePitch(note);return [p.plain,p.explicit||'natural'];}));
  delete entry.midi;delete entry.accidental;
  entry.stringFingerings={...entry.stringFingerings,[id]:fingerings};return '';
 }
 function render(host,{events,marks,instrument:id,score,onEdit}){
  const instrument=Strings.forInstrument(id);host.hidden=!instrument;if(!instrument)return;
  const enabled=host.dataset.enabled!=='false';host.replaceChildren();
  const control=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=enabled;
  control.append(toggle,document.createTextNode(instrument.fretted?' TAB · '+instrument.name:' Digitación · Violín'));
  toggle.onchange=()=>{host.dataset.enabled=String(toggle.checked);render(host,{events,marks,instrument:id,score,onEdit});};host.appendChild(control);
  if(!enabled)return;
  const original=score.querySelector('svg');if(!original)return;
  const width=Number(original.getAttribute('width')),boxes=[...score.querySelectorAll('.rhythm-measure-hit')];
  const rows=[...new Set(boxes.map(box=>box.dataset.top))].sort((a,b)=>Number(a)-Number(b));
  const rowHeight=instrument.tuning.length*17+28;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('width',width);svg.setAttribute('height',rows.length*rowHeight);svg.setAttribute('viewBox',`0 0 ${width} ${rows.length*rowHeight}`);svg.setAttribute('aria-label',`${instrument.fretted?'Tablatura':'Digitación'} de ${instrument.name}`);svg.setAttribute('role','group');
  const add=(name,attrs,text)=>{const node=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;svg.appendChild(node);return node;};
  const resolved=Structure.resolve(events,marks),heads=[...score.querySelectorAll('.rhythm-head-target')];
  rows.forEach((top,row)=>{
   const y=row*rowHeight+22,rowBoxes=boxes.filter(box=>box.dataset.top===top),staff=Number(rowBoxes[0].dataset.staff);
   add('text',{x:8,y:y-10,'font-size':10,fill:'#555'},instrument.name+(staff===2?' · Fa':' · Sol'));
   instrument.labels.forEach((name,i)=>{const cy=y+i*17;add('line',{x1:65,x2:width-20,y1:cy,y2:cy,stroke:'#666','stroke-width':.8});add('text',{x:8,y:cy+4,'font-size':10,fill:'#555'},`${i+1} ${name}`);});
   rowBoxes.forEach(box=>{const bar=Number(box.dataset.bar),end=Number(box.getAttribute('x'))+Number(box.getAttribute('width'));add('line',{x1:end,x2:end,y1:y,y2:y+(instrument.tuning.length-1)*17,stroke:'#555'});
    resolved.forEach((entry,index)=>{if((entry.bar||0)!==bar||(entry.staff||1)!==staff||entry.kind==='rest')return;
     const midis=noteMidis(entry),positions=instrument.fingering(midis,entry.stringFingerings?.[id]||[]);
     midis.forEach((midi,head)=>{const anchor=heads.find(node=>Number(node.dataset.event)===index&&Number(node.dataset.head)===head);if(!anchor)return;
      const x=Number(anchor.getAttribute('cx')),p=positions.find(p=>p.midi===midi);if(!p){add('text',{x,y:y-7,fill:'#a33','font-size':12},'—');return;}
      const cy=y+(p.string-1)*17,tech=Strings.technique(p.fret,p.position),text=instrument.fretted?String(p.fret):tech.finger===null?`b${p.fret}`:`${tech.finger}·${tech.position}`;
      add('rect',{x:x-(instrument.fretted?9:24),y:cy-9,width:instrument.fretted?18:48,height:17,fill:'#fffdf8'});
      const label=add('text',{x,y:cy+5,'text-anchor':'middle','font-size':14,fill:'#111',tabindex:0,role:'button',class:'string-tab-number','aria-label':`Editar cuerda ${p.string}, ${instrument.fretted?'traste':'banda'} ${p.fret}`,style:'cursor:pointer'},text);
      const edit=event=>{event.preventDefault();root.CrescendoStringTab.edit({instrument,position:p,onApply:(string,fret,position)=>onEdit(index,head,{string,fret,position})});};
      label.addEventListener('click',edit);label.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))edit(event);});
     });
    });
   });
  });
  const strip=document.createElement('div');strip.className='rhythm-tab-scroll';strip.appendChild(svg);host.appendChild(strip);strip.scrollLeft=score.scrollLeft;strip.onscroll=()=>{score.scrollLeft=strip.scrollLeft;};
 }
 const api={setPosition,render,noteMidis};if(typeof module!=='undefined')module.exports=api;else root.CrescendoRhythmTab=api;
})(typeof window==='undefined'?globalThis:window);
