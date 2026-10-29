/* Course notation and instrument diagrams share one selected SoundFont instrument. */
(function(global){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROLE_COLORS={root:'#4caf6a',chordTone:'#4a90d9',tension:'#e0b93c',avoid:'#d9564a'};
const names=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];
function normalize(notes){return (notes||[]).map(n=>typeof n==='number'?{midi:n}:n).filter(n=>Number.isFinite(n.midi)&&n.midi>=0&&n.midi<=127).map(n=>{
 const diatonic=n.diatonic??n.step,alter=n.alter??(n.acc?[...n.acc].reduce((a,c)=>a+(c==='#'?1:-1),0):undefined);
 const written=Number.isFinite(diatonic)?['Do','Re','Mi','Fa','Sol','La','Si'][((diatonic%7)+7)%7]+((alter||0)>0?'♯'.repeat(alter):'♭'.repeat(-(alter||0))):null;
 return {...(ROLE_COLORS[n.role]?{role:n.role}:{}),midi:n.midi,label:n.label||n.name||written||names[((n.midi%12)+12)%12],...(Number.isFinite(diatonic)?{diatonic,alter:alter??0}:{})};
 });}
function source(notes){return 'data-ci-source="'+esc(JSON.stringify(normalize(notes)))+'"';}
function roles(notes,{kind,root,chordPcs,tensionPcs}={}){
 notes=normalize(notes);if(!notes.length)return notes;
 const pcs=[...new Set(notes.map(n=>n.midi%12))];root=root??notes.find(n=>n.role==='root')?.midi%12;
 if(!Number.isFinite(root))root=notes[0].midi%12;
 kind=kind||(pcs.length>6?'scale':'chord');
 if(!chordPcs){
  const rel=pcs.map(p=>(p-root+12)%12),chord=[0];
  for(const choices of [[4,3,5,2],[7,6,8],[11,10]]){const tone=choices.find(n=>rel.includes(n));if(tone!==undefined)chord.push(tone);}
  if(kind==='chord'&&!rel.some(n=>n===10||n===11)&&rel.includes(9))chord.push(9);
  chordPcs=chord.map(n=>(root+n)%12);
 }
 const dominant=chordPcs.includes((root+4)%12)&&chordPcs.includes((root+10)%12);
 return notes.map(n=>{const pc=n.midi%12,rel=(pc-root+12)%12;
  const role=n.role||(pc===root?'root':chordPcs.includes(pc)?'chordTone':tensionPcs?tensionPcs.includes(pc)?'tension':'avoid':dominant&&[1,3,8].includes(rel)||!chordPcs.some(c=>(pc-c+12)%12===1)?'tension':'avoid');
  return {...n,role};
 });
}
function group(score,notes,{pianoProvided=false,kind,root,chordPcs,tensionPcs}={}){return '<div class="ci-group" data-ci-group'+(kind?' data-ci-kind="'+esc(kind)+'"':'')+' '+source(roles(notes,{kind,root,chordPcs,tensionPcs}))+(pianoProvided?' data-ci-piano-provided="true"':'')+'>'+score+'</div>';}
function tuningFor(instrument){return instrument==='bass'?[43,38,33,28]:[64,59,55,50,45,40];}
// One pitch per string and no duplicated chord tones: a single compact voicing.
function chordPosition(notes,instrument='guitar'){
 notes=normalize(notes);const tuning=tuningFor(instrument),pcs=[...new Set(notes.map(n=>n.midi%12))];
 if(!pcs.length)return [];
 const root=notes.find(n=>n.role==='root')?.midi%12??pcs[0];
 // Four-string bass retains root, guide tones and colour tones before a redundant fifth.
 const priority=pcs.slice().sort((a,b)=>{const rank=p=>p===root?0:[3,4].includes((p-root+12)%12)?1:[10,11].includes((p-root+12)%12)?2:(p-root+12)%12===7?4:3;return rank(a)-rank(b);});
 const target=priority.slice(0,tuning.length);let best=null,bestScore=Infinity;
 for(let start=0;start<=12;start++){
  const end=start+4,options=tuning.map((open,row)=>{const out=[];for(let fret=start;fret<=end;fret++)if(target.includes((open+fret)%12))out.push({string:row+1,fret,midi:open+fret});return out;});
  function visit(row,chosen,used){
   if(chosen.length===target.length){
    const frets=chosen.map(n=>n.fret),midis=chosen.map(n=>n.midi),span=Math.max(...frets)-Math.min(...frets),strings=chosen.map(n=>n.string),gaps=Math.max(...strings)-Math.min(...strings)+1-chosen.length,score=span*3+gaps*8+Math.min(...frets)*.35+(Math.min(...midis)%12===root?0:20);
    if(score<bestScore){bestScore=score;best=chosen.slice();}return;
   }
   if(row===tuning.length||chosen.length+tuning.length-row<target.length)return;
   for(const n of options[row])if(!used.has(n.midi%12)){used.add(n.midi%12);chosen.push(n);visit(row+1,chosen,used);chosen.pop();used.delete(n.midi%12);}
   visit(row+1,chosen,used);
  }
  visit(0,[],new Set());
 }
 return best||[];
}
function piano(notes){
 notes=roles(notes);const active=new Map(notes.map(n=>[n.midi,n]));
 const first=notes.length?Math.floor(Math.min(...notes.map(n=>n.midi))/12)*12:60;
 const last=Math.min(127,notes.length?Math.max(first+12,Math.ceil(Math.max(...notes.map(n=>n.midi))/12)*12):first+12);
 const whites=[];for(let midi=first;midi<=last;midi++)if(![1,3,6,8,10].includes(midi%12))whites.push(midi);
 const width=Math.max(360,whites.length*36),keyWidth=width/whites.length;let out='';
 const key=(midi,x,w,h,black)=>{const n=active.get(midi),label=names[midi%12]+(Math.floor(midi/12)-1);return '<g role="button" tabindex="0" data-ci-midi="'+midi+'" aria-label="'+esc(label)+'"><rect x="'+(x+1)+'" y="4" width="'+(w-2)+'" height="'+h+'" rx="3" fill="'+(n?ROLE_COLORS[n.role]:black?'#171717':'#fffdf6')+'" stroke="'+(black?'#080808':'#aaa69e')+'"/>'+(n?'<text x="'+(x+w/2)+'" y="'+(h-10)+'" text-anchor="middle" fill="#17130a" font-size="12" font-weight="700">'+esc(n.label)+'</text>':'')+'</g>';};
 whites.forEach((midi,i)=>{out+=key(midi,i*keyWidth,keyWidth,132,false);});
 for(let midi=first;midi<=last;midi++)if([1,3,6,8,10].includes(midi%12)){const boundary=whites.filter(n=>n<midi).length*keyWidth;out+=key(midi,boundary-keyWidth*.31,keyWidth*.62,82,true);}
 out=out.replace(/fill="([^"]+)" font-size="([^"]+)"/g,'fill="$1" font-size="$2" style="fill:$1;font-size:$2px"');
 return '<svg class="ci-piano" style="min-width:'+Math.min(1000,Math.max(300,whites.length*28))+'px" viewBox="0 0 '+width+' 144" role="group" aria-label="Piano: notas del ejemplo">'+out+'</svg>';
}
function fretboard(notes,instrument='guitar',{kind}={}){
 notes=roles(notes,{kind});const pitches=new Map();notes.forEach(n=>{if(!pitches.has(n.midi%12))pitches.set(n.midi%12,n);});
 kind=kind||(pitches.size>6?'scale':'chord');const chord=kind==='chord',tuning=tuningFor(instrument),position=chord?chordPosition(notes,instrument):[];
 const start=chord&&position.length?Math.min(...position.map(n=>n.fret)):0,end=Math.max(start+4,chord&&position.length?Math.max(...position.map(n=>n.fret)):4);
 const labels=instrument==='bass'?['Sol2','Re2','La1','Mi1']:['Mi4','Si3','Sol3','Re3','La2','Mi2'];
 const first=Math.max(1,start),cols=end-first+1,width=380,left=56,top=36,gap=32,step=(width-left-24)/cols,height=top+(tuning.length-1)*gap+43;let out='';
 for(let fret=first;fret<=end+1;fret++){const x=left+(fret-first)*step;out+='<line x1="'+x+'" y1="'+(top-8)+'" x2="'+x+'" y2="'+(top+(tuning.length-1)*gap+8)+'" stroke="'+(start===0&&fret===first?'#d8d1c1':'#645f54')+'" stroke-width="'+(start===0&&fret===first?4:1)+'"/>';if(fret<=end)out+='<text x="'+(fret===0?left-19:x+step/2)+'" y="'+(height-4)+'" text-anchor="middle" fill="#ddd7c9" font-size="11">'+fret+'</text>';}
 if(start===0)out+='<text x="'+(left-19)+'" y="'+(height-4)+'" text-anchor="middle" fill="#ddd7c9" font-size="11">0</text>';
 tuning.forEach((open,row)=>{const y=top+row*gap;out+='<line x1="'+left+'" y1="'+y+'" x2="'+(left+cols*step)+'" y2="'+y+'" stroke="#b5afa2" stroke-width="'+(1+row*.22)+'"/><text x="2" y="'+(y+4)+'" fill="#eee9de" font-size="12">'+labels[row]+'</text>';
  for(let fret=start;fret<=end;fret++){
   const midi=open+fret,n=pitches.get(midi%12);if(!n||chord&&!position.some(p=>p.string===row+1&&p.fret===fret))continue;
   const x=fret===0?left-19:left+(fret-first+.5)*step;out+='<g role="button" tabindex="0" data-ci-role="'+n.role+'" data-ci-midi="'+midi+'" aria-label="'+esc(n.label)+', cuerda '+(row+1)+', traste '+fret+'"><circle cx="'+x+'" cy="'+y+'" r="13" fill="'+ROLE_COLORS[n.role]+'" stroke="#17130a" stroke-width="1.5"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="#17130a" font-size="11" font-weight="700">'+esc(n.label.replace(/-?\d+$/,''))+'</text></g>';
  }
 });
 if(chord)for(let row=0;row<tuning.length;row++)if(!position.some(n=>n.string===row+1))out+='<text x="'+(left-19)+'" y="'+(top+row*gap+4)+'" fill="#c5bfae" font-size="10">'+'×</text>';
 out=out.replace(/fill="([^"]+)" font-size="([^"]+)"/g,'fill="$1" font-size="$2" style="fill:$1;font-size:$2px"');
 return '<svg class="ci-fretboard" data-ci-kind="'+kind+'" data-ci-start="'+start+'" data-ci-end="'+end+'" viewBox="0 0 '+width+' '+height+'" role="group" aria-label="'+(instrument==='bass'?'Bajo de cuatro cuerdas':'Guitarra de seis cuerdas')+': '+(chord?'una posición de acorde':'una posición de escala')+'">'+out+'</svg>';
}
function legend(){return '<div class="ci-legend">'+Object.entries({root:'Fundamental',chordTone:'Sonido estructural',tension:'Tensión disponible',avoid:'Nota de paso / evitar en reposo'}).map(([role,label])=>'<span><i style="background:'+ROLE_COLORS[role]+'"></i>'+label+'</span>').join('')+'</div>';}
function fromXML(xml){
 const doc=new global.DOMParser().parseFromString(xml,'application/xml'),notes=[];
 doc.querySelectorAll('note pitch').forEach(p=>{const letter=p.querySelector('step')?.textContent,oct=Number(p.querySelector('octave')?.textContent),alter=Number(p.querySelector('alter')?.textContent||0),pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[letter];if(pc===undefined)return;notes.push({midi:(oct+1)*12+pc+alter,label:{C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'}[letter]+(alter>0?'♯'.repeat(alter):'♭'.repeat(-alter))});});
 return normalize(notes);
}
function notation(notes){
 const P=global.CrescendoPractice;if(!P||!notes.length)return '';
 const letters=['C','C','D','D','E','F','F','G','G','A','A','B'],naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const pitches=notes.map(n=>{const pc=n.midi%12,letter=letters[pc],oct=Math.floor(n.midi/12)-1,alter=pc-naturals[letter];return {midi:n.midi,diatonic:n.diatonic??(oct*7+'CDEFGAB'.indexOf(letter)),alter:n.alter??alter};});
 return P.staff(pitches,{clef:Math.max(...notes.map(n=>n.midi))<60?'bass':'treble',stack:notes.length<=6});
}
const panelSelector='.visual-panel,.chord-panel,.lab-card,.visual-box,.diagram-block,.octatonic-instrument';
const legacyGroups='.chord-explorer-panels,.lab-views,.visual-panel-grid,.visual-three,.visual-two,.chord-diagrams,.octatonic-instruments,[data-reharm-viewer],.baga-detail';
const pianoSelector='[data-scale-piano],[data-interval-piano],[data-int-piano],[data-triad-piano],[data-key-piano],[data-cx="piano"],[data-lab="piano"],[data-progression="piano"],.piano-diagram,.tlm-piano,svg.jz-piano,svg.lab-piano,svg.ci-piano,.baga-piano';
const guitarSelector='[data-scale-guitar],[data-interval-guitar],[data-cx="guitar"],[data-lab="board"],[data-progression="board"],svg.tlm-guitar,svg.visual-guitar-scale,svg.jz-guitar,svg.jz-guitar-h,svg.jz-guitar-shape,svg.lab-fretboard,.chromatic-guitar-box';
function mount(){
 const doc=global.document,states=new WeakMap();let scheduled=false;
 function markPanels(container,selector,instrument){container.querySelectorAll(selector).forEach(el=>{const panel=el.closest('[data-ci-view]')||el.closest(panelSelector);if(panel&&panel!==container&&!panel.contains(container))panel.dataset.ciView=instrument;});}
 function views(container,notes){
  const kind=container.dataset.ciKind||container.querySelector('svg[data-ci-kind]')?.dataset.ciKind||([...new Set(notes.map(n=>n.midi%12))].length>6?'scale':'chord');notes=roles(notes,{kind});
  const signature=JSON.stringify({notes,kind});const changed=states.get(container)!==signature;states.set(container,signature);
  for(const instrument of ['piano','guitar','bass']){
   if(instrument==='piano'&&container.dataset.ciPianoProvided==='true')continue;
   let created=false;let view=[...container.querySelectorAll('[data-ci-view="'+instrument+'"]')].find(el=>el.closest('[data-ci-group]')===container);
   if(!view){created=true;view=doc.createElement('section');view.className='ci-instrument';view.dataset.ciView=instrument;view.dataset.ciGenerated='true';(container.querySelector('[data-ci-slot]')||container).appendChild(view);}
   if(view.dataset.ciGenerated&&(changed||created))view.innerHTML='<div class="ci-instrument-title">'+global.CourseSound.labels[instrument]+'</div><div class="ci-diagram-scroll">'+(instrument==='piano'?piano(notes):fretboard(notes,instrument,{kind}))+'</div>'+legend()+(instrument==='piano'?'':'<p class="ci-map-note">Una posición · pulsa una nota para escucharla.</p>');
  }
 }
 function refresh(){
  scheduled=false;
  // Existing groups preserve their real voicings, selected inversions and event handlers.
  doc.querySelectorAll(legacyGroups).forEach(container=>{
   if(container.closest('[data-ci-notation-only]'))return;
   if(container.closest('[data-ci-view]')||container.querySelector('[data-ci-group]')||container.querySelector(legacyGroups))return;
   if(!container.querySelector('.cp-staff,[data-ci-source]'))return;
   const pianoCount=container.querySelectorAll(pianoSelector).length;
   if(!container.querySelector('.cp-staff')&&pianoCount>1&&!container.querySelector(guitarSelector))return;
   container.dataset.ciGroup='';container.classList.add('ci-group');markPanels(container,pianoSelector,'piano');markPanels(container,guitarSelector,'guitar');
  });
  // Piano-only diagrams also acquire their own score and the other instrument views.
  doc.querySelectorAll('[data-ci-source]').forEach(sourceEl=>{
   if(sourceEl.closest('[data-ci-group]'))return;
   const wrapper=doc.createElement('div');wrapper.className='ci-group';wrapper.dataset.ciGroup='';
   sourceEl.before(wrapper);wrapper.appendChild(sourceEl);sourceEl.dataset.ciView='piano';
  });
  doc.querySelectorAll('.cp-staff').forEach(score=>{
   if(score.closest('[data-ci-notation-only]'))return;
   if(score.closest('[data-ci-group]'))return;
   const wrapper=doc.createElement('div');wrapper.className='ci-group';wrapper.dataset.ciGroup='';score.before(wrapper);wrapper.appendChild(score);
  });
  doc.querySelectorAll('[data-ci-group]').forEach(container=>{
   // A nested example owns its notes; a surrounding comparison keeps its own layout.
   const own=el=>el.closest('[data-ci-group]')===container;
   const explicit=container.matches('[data-ci-source]')?container:[...container.querySelectorAll('[data-ci-source]')].find(own);
   const score=[...container.querySelectorAll('.cp-staff')].find(own);
   let notes=[];try{notes=score?fromXML(score.dataset.cpXml):explicit?normalize(JSON.parse(explicit.dataset.ciSource)):[];}catch(_){return;}
   if(explicit){try{const authored=normalize(JSON.parse(explicit.dataset.ciSource));notes=notes.map(n=>({...n,...(authored.find(a=>a.midi%12===n.midi%12)?.role?{role:authored.find(a=>a.midi%12===n.midi%12).role}:{})}));}catch(_){}}
   if(!score&&!container.querySelector('.ce-score')){
    const html=notation(notes);if(html){const host=doc.createElement('section');host.className='ci-score';host.innerHTML=html;container.prepend(host);}
   }
   if(!notes.length&&!score&&!explicit)return;
   views(container,notes);
  });
  doc.querySelectorAll('[data-lab="strings-field"],[data-progression="strings"]').forEach(el=>{(el.closest('label')||el).dataset.ciView='guitar';});
  applyVisibility();
 }
 function applyVisibility(){const instrument=global.CourseSound.get();doc.querySelectorAll('[data-ci-view]').forEach(el=>{const hidden=el.dataset.ciView!==instrument;if(el.hidden!==hidden)el.hidden=hidden;});}
 function schedule(){if(!scheduled){scheduled=true;global.requestAnimationFrame(refresh);}}
 const observer=new global.MutationObserver(schedule);observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-cp-xml','data-ci-source']});
 global.CourseSound.onChange(applyVisibility);
 doc.addEventListener('click',event=>{const note=event.target.closest('[data-ci-midi]');if(note)global.CourseSound.play([Number(note.dataset.ciMidi)]).catch(()=>{});});
 doc.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-ci-midi]')){event.preventDefault();event.target.dispatchEvent(new global.MouseEvent('click',{bubbles:true}));}});
 schedule();
}
global.CourseInstruments={normalize,source,group,piano,fretboard,fromXML,roles,chordPosition,ROLE_COLORS};
if(global.document){if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',mount);else mount();}
})(window);
