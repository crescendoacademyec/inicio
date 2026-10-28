(function(){
'use strict';
const E=window.CrescendoStudyLab,M=window.CrescendoFretboardModels,B=window.CrescendoStudyBridge,P=window.CrescendoPitchSpelling;
const host=document.getElementById('studyLab'),toggle=document.getElementById('studyLabToggle');if(!host||!E||!B)return;
const TOPICS={
 cycles:{label:'Ciclos',description:'Transporta el acorde, escala o arpegio seleccionado arriba. Cada nueva tonalidad busca una digitación cercana a la región de estudio.',source:'Guitarra 1, pp. 6, 14–18; Guitarra 2, pp. 8–9.',tip:'Los ciclos por terceras o tonos forman grupos: no todos recorren doce tonalidades antes de repetirse. Cambia la fundamental para estudiar los otros grupos.'},
 patterns:{label:'Motivos y patrones',description:'Recorre el modelo de escala o arpegio por terceras, grupos o una célula de cuatro notas. El patrón se mueve por el modelo y puede combinarse con un motivo rítmico.',source:'Guitarra 1, pp. 7–9; Guitarra 4, pp. 25–27.',tip:'Escucha primero el recorrido y luego crea una variación. El pentagrama muestra la nota que suena y el fondo tenue conserva el modelo.'},
 open:{label:'Tríadas abiertas',description:'Separa las voces de una tríada: desde el bloque cerrado, la voz central sube una octava. Compara las tres inversiones, una por vez.',source:'Guitarra 2, pp. 36–42; Guitarra 4, pp. 22–23.',tip:'Los saltos de cuerda son parte de estas posiciones. Los números de cuerda y traste aparecen debajo del ejercicio.'},
 super:{label:'Superposiciones',description:'Escucha una pentatónica, tríada o tétrada sobre un acorde independiente. Los colores expresan la función de esas notas respecto al acorde base.',source:'Guitarra 1, p. 9; Guitarra 2, pp. 43–48; Guitarra 3, pp. 13–15.',tip:'Verde: fundamental del acorde base; azul: notas estructurales; naranja: tensiones indicadas por el acorde o incluidas en la referencia; rojo: fuera de esa escala o 11 sobre tercera mayor. Rojo no significa que una nota esté prohibida en todo contexto.'},
 quartal:{label:'Armonía cuartal',description:'Armoniza una escala de siete notas apilando cuartas diatónicas. Los intervalos se adaptan a la escala: no todas las cuartas son justas.',source:'Guitarra 3, pp. 24–29.',tip:'Prueba tres voces primero y después cuatro. Compara cada bloque con el grado de la escala sobre el que se construye.'},
 hybrid:{label:'Acordes híbridos',description:'Combina una tríada con un bajo independiente. La nota después de la barra es siempre la voz más grave; la tríada puede cambiar de inversión encima.',source:'Guitarra 4, pp. 16–20.',tip:'Por ejemplo, G/C reúne las notas G–B–D con C en el bajo. No es lo mismo que cambiar únicamente la inversión de G.'},
 extensions:{label:'Voicings y tensiones',description:'Compara bloques cerrados, Drop 2 y Drop 3 con séptimas y tensiones. Cada posición conserva las voces de la fórmula indicada; algunas fórmulas omiten la quinta.',source:'Guitarra 3, pp. 43–60; Guitarra 4, pp. 17–20.',tip:'Las posiciones son sugerencias calculadas para la afinación actual. Si un bloque no cabe en un grupo de cuerdas, cambia ese grupo o la región.'},
 voices:{label:'Conducción de voces',description:'Enlaza acordes de una progresión buscando poco movimiento entre voces ordenadas de grave a agudo. Compara las notas comunes y los desplazamientos en semitonos.',source:'Guitarra 3, pp. 20–26; Guitarra 4, pp. 32–35.',tip:'Es una propuesta de enlace entre digitaciones compactas, no una única solución musical. El recorrido diatónico también sirve para estudiar menor melódica.'},
 outside:{label:'Estructuras outside',description:'Mantén una figura y desplázala por semitonos o entre cuerdas, antes de regresar a la referencia. Al cambiar de cuerdas se conserva el dibujo y se recalculan las alturas.',source:'Guitarra 4, pp. 37–43.',tip:'El regreso hace audible la relación entre tensión y resolución. El rojo indica distancia respecto a la escala de referencia, no un error de escritura.'}
};
const defaults={kind:'cycles',cycle:'5',pattern:'ascending',rhythm:'even',noteBeats:.5,triad:'major',quality:'maj7',family:'drop2',inversion:'all',group:'all',anchor:5,voices:'3',degree:'all',upper:'minor',upperRoot:'2',progression:'iiMajor',shift:'frets',reference:'current',beats:4,tempo:80,loop:false,accompaniment:true};
let cfg={...defaults},frames=[],index=0,timer=null,playing=false,voices=[],baseVoices=[],run=0,context=null;
try{const saved=JSON.parse(localStorage.getItem('diapason-study-lab-v1')||'{}');for(const k of ['tempo','anchor','group'])if(k in saved)cfg[k]=saved[k];}catch(_){}
if(!Number.isFinite(+cfg.anchor)||cfg.anchor<0||cfg.anchor>17)cfg.anchor=5;if(!['all','low','mid','high'].includes(cfg.group))cfg.group='all';if(!Number.isFinite(+cfg.tempo)||cfg.tempo<30||cfg.tempo>240)cfg.tempo=80;
host.innerHTML=`<div class="lab-heading"><div><span class="lab-eyebrow">Estudio del instrumento</span><h2>De la posición a la música</h2></div><button type="button" id="labClose" aria-label="Cerrar estudio guiado">×</button></div>
<div class="lab-topics" role="group" aria-label="Temas de estudio"></div>
<div class="lab-description"><p id="labDescription"></p><small id="labSource"></small></div>
<div class="lab-fields" id="labFields"></div>
<div class="lab-actions"><button type="button" id="labGenerate" class="lab-primary">Preparar ejercicio</button><button type="button" id="labPlay" disabled>▶ Escuchar</button><button type="button" id="labPause" disabled>Ⅱ Pausa</button><button type="button" id="labStop" disabled>■ Detener</button><button type="button" id="labPrev" aria-label="Paso anterior" disabled>←</button><button type="button" id="labNext" aria-label="Paso siguiente" disabled>→</button><label>BPM <input type="number" id="labTempo" min="30" max="240" value="${cfg.tempo}"></label><label><input type="checkbox" id="labLoop"> Repetir</label><button type="button" id="labRelease" disabled>Volver a exploración</button></div>
<p id="labStatus" class="lab-status" role="status">Elige un tema y prepara el ejercicio.</p>
<div id="labResult" hidden><div id="labTimeline" class="lab-timeline" role="group" aria-label="Recorrido del ejercicio"></div><div class="lab-current"><div><h3 id="labCurrent"></h3><p id="labContext"></p></div><span id="labCounter"></span></div><div class="lab-tables"><div class="lab-table-wrap"><table><caption>Notas y digitación · alturas sonoras</caption><thead><tr><th>Nota</th><th>Intervalo</th><th>Función</th><th>Cuerda / traste</th></tr></thead><tbody id="labNotes"></tbody></table></div><div id="labMotion" class="lab-motion" hidden></div></div></div>
<p class="lab-tip" id="labTip"></p>`;
const $=id=>document.getElementById(id),topicButtons=new Map();
// Keep the real instrument and Bravura staff next to the study controls.
const boardRow=document.querySelector('.top-row'),boardHome=document.createComment('live instrument home');
boardRow.before(boardHome);
const workspace=document.createElement('div');workspace.className='lab-workspace';
const controlSide=document.createElement('div');controlSide.className='lab-control-side';
const visualSide=document.createElement('div');visualSide.className='lab-visual-side';
for(const selector of ['.lab-description','.lab-fields','.lab-actions','.lab-status','.lab-tip'])controlSide.append(host.querySelector(selector));
visualSide.append($('labResult'));workspace.append(controlSide,visualSide);host.append(workspace);

for(const [key,t] of Object.entries(TOPICS)){const b=document.createElement('button');b.type='button';b.textContent=t.label;b.dataset.topic=key;b.setAttribute('aria-pressed','false');b.onclick=()=>{stop();release();cfg.kind=key;cfg.inversion='all';cfg.family=['open','hybrid'].includes(key)?'closed':'drop2';if(key==='outside')cfg.group='low';renderFields();};host.querySelector('.lab-topics').append(b);topicButtons.set(key,b);}
function options(items){return items.map(([value,label])=>({value:String(value),label}));}
const triads=options(Object.entries(E.CHORDS).filter(([,d])=>d.tones.length===3).map(([k,d])=>[k,d.label]));
const qualities=options(Object.entries(E.CHORDS).filter(([,d])=>d.tones.length>=4).map(([k,d])=>[k,d.label]));
const patterns=options([['ascending','Ascendente'],['descending','Descendente'],['roundtrip','Subir y bajar'],['thirds','Terceras'],['groups3','Grupos de 3'],['groups4','Grupos de 4'],['motif','Motivo 1–3–2–4']]);
function select(key,label,items){
 const wrap=document.createElement('label');wrap.textContent=label;const el=document.createElement('select');el.id='lab-'+key;
 items.forEach(o=>el.add(new Option(o.label,o.value)));if(!items.some(o=>o.value===String(cfg[key])))cfg[key]=items[0].value;el.value=String(cfg[key]);
 el.onchange=()=>{stop();release();cfg[key]=el.value;if(key==='voices'||key==='quality')renderFields();};wrap.append(el);$('labFields').append(wrap);
}
function renderFields(){
 $('labFields').replaceChildren();const kind=cfg.kind,t=TOPICS[kind];topicButtons.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===kind)));$('labDescription').textContent=t.description;$('labSource').textContent=t.source;$('labTip').textContent=t.tip;
 if(kind==='cycles')select('cycle','Ciclo',options([[5,'Cuartas'],[7,'Quintas'],[2,'Tonos'],[3,'Terceras menores'],[4,'Terceras mayores'],[1,'Semitonos']]));
 if(['cycles','patterns','super'].includes(kind)){select('pattern','Recorrido',patterns);select('rhythm','Ritmo',options([['even','Uniforme'],['syncopated','Dos corcheas y negra'],['motif','Negra, dos corcheas y negra']]));select('noteBeats','Figura del recorrido',options([[1,'Negras'],[.5,'Corcheas'],[.25,'Semicorcheas']]));}
 if(['open','hybrid','outside'].includes(kind))select('triad','Tríada',triads);
 if(['super','extensions','outside'].includes(kind))select('quality','Acorde base',qualities);
 if(kind==='super')select('upper','Estructura superpuesta',options([['pentaMajor','Pentatónica mayor'],['pentaMinor','Pentatónica menor'],...Object.entries(E.CHORDS).filter(([k,d])=>d.tones.length<=4&&M.ARPEGGIOS[({major:'mayor',minor:'menor',aug:'aumentado',dim:'disminuido'})[k]||k]).map(([k,d])=>[k,d.label])]));
 if(['super','hybrid'].includes(kind))select('upperRoot','Fundamental superior respecto al bajo',options(Array.from({length:12},(_,i)=>[i,['Unísono','♭2','2','♭3','3','4','♯4 / ♭5','5','♭6','6','♭7','7'][i]])));
 if(kind==='super'){
  const l=document.createElement('label');l.className='lab-check';const c=document.createElement('input');c.type='checkbox';c.checked=cfg.accompaniment;c.onchange=()=>{stop();cfg.accompaniment=c.checked;};l.append(c,document.createTextNode('Escuchar acorde base'));$('labFields').append(l);
 }
 if(['super','outside'].includes(kind))select('reference','Escala de referencia',options([['current','La seleccionada arriba'],['major','Mayor'],['minor','Menor natural'],['dorian','Dórica'],['lydian','Lidia'],['mixolydian','Mixolidia'],['melodic','Menor melódica'],['harmonic','Menor armónica']]));
 if(kind==='quartal'){select('voices','Voces del bloque',options([[3,'Tres'],[4,'Cuatro']]));select('degree','Grado de partida',options([['all','Todos los grados'],...[0,1,2,3,4,5,6].map(i=>[i,'Grado '+(i+1)])]));}
 if(kind==='voices')select('progression','Progresión',options([['iiMajor','ii–V–I mayor'],['iiMinor','iiø–V♭9–i menor'],['diatonic','Siete grados de la escala'],['blues','Blues de doce compases']]));
 if(['extensions','voices'].includes(kind))select('family','Disposición',options([['closed','Bloque cerrado'],['drop2','Drop 2'],['drop3','Drop 3']]));
 if(['open','quartal','hybrid','extensions','outside'].includes(kind)){
  const count=kind==='quartal'?Number(cfg.voices):kind==='extensions'?E.CHORDS[cfg.quality].tones.length:3;
  select('inversion',kind==='hybrid'?'Inversión de la tríada':'Inversión',options([['all',kind==='outside'?'Posición más cercana':'Todas, una por vez'],...Array.from({length:count},(_,i)=>[i,i===0?'Fundamental':i+'ª inversión'])]));
 }
 if(kind==='outside')select('shift','Desplazar por',options([['frets','Semitonos · ida y regreso'],['strings','Cuerdas · ida y regreso']]));
 select('group','Grupo de cuerdas',options([['all','Todas'],['low','Graves'],['mid','Centrales'],['high','Agudas']]));
 const label=document.createElement('label');label.textContent='Región · traste central';const input=document.createElement('input');input.type='number';input.min=0;input.max=17;input.value=cfg.anchor;input.id='lab-anchor';input.onchange=()=>{stop();release();cfg.anchor=Math.max(0,Math.min(17,Number(input.value)||0));input.value=cfg.anchor;};label.append(input);$('labFields').append(label);
 if(!['cycles','patterns','super'].includes(kind))select('beats','Duración de cada bloque',options([[4,'Cuatro tiempos'],[2,'Dos tiempos'],[1,'Un tiempo']]));
}
function stop(){run++;playing=false;clearTimeout(timer);timer=null;voices.forEach(v=>v?.stop?.());baseVoices.forEach(v=>v?.stop?.());voices=[];baseVoices=[];$('labPlay').textContent='▶ Escuchar';$('labPlay').setAttribute('aria-pressed','false');$('labPause').disabled=true;}
function release(){frames=[];index=0;B.clear();if(!host.hidden)visualSide.prepend(boardRow);$('labResult').hidden=true;['labPlay','labPause','labStop','labPrev','labNext','labRelease'].forEach(id=>$(id).disabled=true);$('labStatus').textContent='Prepara el ejercicio para aplicar estos ajustes.';}
function noteName(midi,frame){
 const rootName=context.name(frame.root),quality=E.CHORDS[cfg.quality];
 if(cfg.kind==='hybrid'){
  if(midi===frame.cells[0].midi)return context.name(context.root);
  return P.spell(midi,context.name(E.mod(context.root+Number(cfg.upperRoot))),E.CHORDS[cfg.triad].suffix).name;
 }
 if(cfg.kind==='super'){
  const upperRoot=context.name(E.mod(context.root+Number(cfg.upperRoot))),def=E.CHORDS[cfg.upper];
  return P.spell(midi,upperRoot,def?.suffix||'').name;
 }
 if(cfg.kind==='outside')return frame.spellingRoot===null?P.name(midi,context.name(context.root)):P.spell(midi,context.name(frame.spellingRoot),E.CHORDS[cfg.triad].suffix).name;

 // Use the collection's diatonic spelling for scalar passages; chord spelling for voicings.
 if(['cycles','patterns','quartal'].includes(cfg.kind)&&context.material!=='arpeggio'&&context.scale.length===7){
  const spellingRoot=cfg.kind==='cycles'?frame.root:context.root,iv=E.mod(midi-spellingRoot),degree=context.scale.indexOf(iv);
  if(degree>=0){const letters='CDEFGAB',letter=letters[(letters.indexOf(context.name(spellingRoot)[0])+degree)%7],naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11},alter=((E.mod(midi)-naturals[letter]+18)%12)-6;return letter+(alter<0?'b'.repeat(-alter):'#'.repeat(alter));}
 }
 const suffix=['open','hybrid','outside'].includes(cfg.kind)?E.CHORDS[cfg.triad].suffix:context.material==='arpeggio'&&['patterns','cycles'].includes(cfg.kind)?(context.arpeggio==='dim7'?'dim7':M.ARPEGGIOS[context.arpeggio].label):cfg.kind==='cycles'&&context.chord?context.chord.suffix:quality?.suffix||'';return P.spell(midi,rootName,suffix).name;
}
function generate(){
 stop();B.stopScore();context=B.context();cfg.anchor=Number($('lab-anchor').value);cfg.noteBeats=Number(cfg.noteBeats);cfg.beats=Number(cfg.beats);
 const references={...E.SCALES,dorian:[0,2,3,5,7,9,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10]};if(['super','outside'].includes(cfg.kind)&&references[cfg.reference])context.scale=references[cfg.reference];
 try{
  frames=E.makeStudy(cfg,context,M);index=0;
  frames.forEach(f=>{f.characteristic=['cycles','patterns'].includes(cfg.kind)?M.characteristic(context.scaleKey,context.scale).map(n=>E.mod((cfg.kind==='cycles'?f.root:context.root)+n.interval)):[];f.names={};for(const c of [...f.cells,...(f.reference||[])])f.names[c.midi]=noteName(c.midi,f);});
  $('labResult').hidden=false;$('labResult').insertBefore(boardRow,$('labResult').querySelector('.lab-tables'));['labPlay','labStop','labPrev','labNext','labRelease'].forEach(id=>$(id).disabled=false);
  $('labStatus').textContent=`${frames.length} eventos listos. Usa Escuchar o las flechas para avanzar.${frames.warnings.length?' '+frames.warnings.join(' '):''}`;
  try{localStorage.setItem('diapason-study-lab-v1',JSON.stringify({tempo:cfg.tempo,anchor:cfg.anchor,group:cfg.group}));}catch(_){}
  renderTimeline();show();
 }catch(error){release();$('labStatus').textContent=error.message;}
}
function renderTimeline(){
 const container=$('labTimeline');container.replaceChildren();let previous='';
 frames.forEach((f,i)=>{if(f.group&&f.group===previous)return;previous=f.group||'';const b=document.createElement('button');b.type='button';b.textContent=f.label;b.dataset.index=i;b.onclick=()=>{stop();index=i;show();};container.append(b);});
}
function show(){
 const f=frames[index];if(!f)return;B.show(f);$('labCurrent').textContent=f.label;$('labCounter').textContent=`${index+1} / ${frames.length}`;
 const reference=['super','outside'].includes(cfg.kind)?` · Referencia: ${context.name(context.root)} ${cfg.reference==='current'?context.scaleKey.replace(/_/g,' '):$('lab-reference').selectedOptions[0].textContent}`:'';
 $('labContext').textContent=`${f.beats} tiempo${f.beats===1?'':'s'} · Región ${cfg.anchor}${reference}`;
 $('labTimeline').querySelectorAll('button').forEach(b=>{const start=Number(b.dataset.index),next=b.nextElementSibling?Number(b.nextElementSibling.dataset.index):frames.length;b.setAttribute('aria-current',String(index>=start&&index<next));});
 const tbody=$('labNotes');tbody.replaceChildren();const cells=f.reference||f.cells,roleText={root:'Fundamental',structural:'Nota estructural',tension:'Tensión del contexto',unavailable:'Fuera / evitar en referencia'};
 for(const c of cells){const tr=document.createElement('tr');if(f.cells.some(n=>n.string===c.string&&n.fret===c.fret))tr.className='lab-active-note';
  const name=f.names[c.midi]||noteName(c.midi,f),accidental=[...name.slice(1)].reduce((n,c)=>n+(c==='b'?-1:1),0),octave=Math.round((c.midi-({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[name[0]]-accidental)/12)-1;
  for(const [i,text] of [name+octave,E.intervalLabel(c.midi,f.root,f.chordTones),roleText[c.role],`${c.string+1} / ${c.fret}`].entries()){const td=document.createElement('td');td.textContent=text;if(i===0){const span=document.createElement('span');span.className='lab-note lab-role-'+c.role;span.textContent=text;td.replaceChildren(span);}tr.append(td);}tbody.append(tr);
 }
 const motion=$('labMotion');motion.replaceChildren();motion.hidden=!f.motion;
 if(f.motion){const h=document.createElement('h4');h.textContent='Enlace desde el acorde anterior';motion.append(h);const summary=document.createElement('p');summary.textContent=`Movimiento total: ${f.motion.distance} semitonos · Notas comunes: ${f.motion.common.length}`;motion.append(summary);for(const v of f.motion.voices){const line=document.createElement('p');line.textContent=`${P.name(v.from,context.name(context.root))}${Math.floor(v.from/12)-1} → ${P.name(v.to,context.name(context.root))}${Math.floor(v.to/12)-1} · ${v.delta===0?'permanece':(v.delta>0?'+':'')+v.delta+' semitonos'}`;motion.append(line);}}
 $('labPrev').disabled=index===0;$('labNext').disabled=index===frames.length-1;
}
function tick(token){
 if(!playing||token!==run)return;
 voices.forEach(v=>v?.stop?.());voices=[];
 const f=frames[index];show();const seconds=60/cfg.tempo*f.beats;
 for(const c of f.cells)voices.push(B.play(c.midi,seconds*.92));
 if(cfg.accompaniment&&f.accompaniment){const first=index===0||frames[index-1].group!==f.group;if(first||!f.group){baseVoices.forEach(v=>v?.stop?.());baseVoices=[];let beats=0;for(let n=index;n<frames.length&&frames[n].group===f.group;n++)beats+=frames[n].beats;for(const c of f.accompaniment)baseVoices.push(B.play(c.midi,Math.max(seconds,beats*60/cfg.tempo)*.98));}}
 timer=setTimeout(()=>{if(token!==run)return;if(index+1<frames.length){index++;tick(token);}else if(cfg.loop){index=0;tick(token);}else{stop();$('labStatus').textContent='Ejercicio completado.';}},seconds*1000);
}
async function play(){
 if(!frames.length)generate();if(!frames.length)return;
 stop();B.stopScore();playing=true;const token=run;$('labPlay').textContent='Cargando sonido…';
 await B.ready();if(!playing||token!==run)return;
 if(index===frames.length-1)index=0;$('labPlay').textContent='▶ Reproduciendo';$('labPlay').setAttribute('aria-pressed','true');$('labPause').disabled=false;$('labStatus').textContent='Reproduciendo el ejercicio.';tick(token);
}
function close(){stop();release();boardHome.after(boardRow);host.hidden=true;toggle.setAttribute('aria-expanded','false');}
toggle.onclick=()=>{if(!host.hidden){close();return;}host.hidden=false;visualSide.prepend(boardRow);toggle.setAttribute('aria-expanded','true');renderFields();};$('labClose').onclick=close;
$('labGenerate').onclick=generate;$('labPlay').onclick=play;$('labPause').onclick=()=>{stop();$('labStatus').textContent='En pausa. Escuchar reanuda desde este evento.';};$('labStop').onclick=()=>{stop();index=0;show();$('labStatus').textContent='Detenido. Ejercicio al inicio.';};$('labRelease').onclick=()=>{stop();release();};$('labPrev').onclick=()=>{stop();index=Math.max(0,index-1);show();};$('labNext').onclick=()=>{stop();index=Math.min(frames.length-1,index+1);show();};
$('labTempo').onchange=()=>{stop();cfg.tempo=Math.max(30,Math.min(240,Number($('labTempo').value)||80));$('labTempo').value=cfg.tempo;};$('labLoop').onchange=()=>cfg.loop=$('labLoop').checked;
// An explicit change in the original controls returns ownership to normal exploration.
document.querySelector('.panel').addEventListener('change',event=>{if(event.target.id==='volume'||event.target.id==='soundType')return;stop();release();},true);
for(const id of ['clearAllBtn','clearSelectionBtn','scorePlayBtn','scoreNextBtn','guitarBankMenu','plus','minus'])$(id)?.addEventListener('click',()=>{stop();if(frames.length)release();},true);
$('board').addEventListener('pointerdown',()=>{if(frames.length){stop();release();}},true);
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
host.addEventListener('keydown',event=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(event.target.tagName))return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();stop();index=Math.max(0,Math.min(frames.length-1,index+(event.key==='ArrowRight'?1:-1)));show();}});
renderFields();
})();
