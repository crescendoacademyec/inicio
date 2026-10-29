(function(){
'use strict';
const E=window.CrescendoStudyLab,M=window.CrescendoFretboardModels,B=window.CrescendoStudyBridge,P=window.CrescendoPitchSpelling,S=window.CrescendoStudyScore;
const host=document.getElementById('studyLab'),toggle=document.getElementById('studyLabToggle');if(!host||!E||!B)return;
const TOPICS={
 pairs:{label:'Pares de estructuras',description:'Alterna dos tríadas o tétradas sobre un acorde base. Estudia A–B o A–B–B–A como bloques o arpegios, manteniendo la región.',source:'Guitarra 2, pp. 46–48; Guitarra 4, pp. 8–9.',tip:'Compara las tensiones que produce cada estructura. El acorde base se conserva también al reanudar desde una nota intermedia.'},
 mixed:{label:'Cuartas + Drop 2',description:'Alterna un acorde Drop 2 y un bloque cuartal dentro de la misma progresión. Puedes recorrer ii–V–I o los siete grados de la escala.',source:'Guitarra 3, pp. 24–29.',tip:'Selecciona una escala de siete notas arriba. Cada par de bloques comparte la raíz del grado correspondiente.'},
 guide:{label:'Voz guía libre',description:'Mantén fija la voz superior o el bajo mientras las demás voces se desplazan. Compara movimientos diatónicos y cromáticos con regreso al bloque inicial.',source:'Guitarra 4, pp. 32–35.',tip:'El modo cromático permite estudiar bloques fuera de la escala. La voz fija y los movimientos de las otras voces aparecen en la tabla de enlace.'},
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
const defaults={cycleMode:'transpose',degreeCycle:'1',diatonicVoices:'4',allKeys:false,triadLayout:'closed',secondUpper:'minor',secondRoot:'4',pairOrder:'ab',pairRepeats:'2',pairArticulation:'arpeggio',guideSource:'triad',guideMotion:'chromatic',guideDirection:'auto',hold:'top',cellSize:'3',outsideArticulation:'melodic',hybridFamily:'closed',customPattern:[0,2,1,3],model:'nearest',range:'full',startDegree:'0',voicingSource:'formula',referenceFamily:'drop23',referenceType:'all',meter:'4/4',tab:true,kind:'cycles',cycle:'5',pattern:'ascending',rhythm:'even',noteBeats:.5,triad:'major',quality:'maj7',family:'drop2',inversion:'all',group:'all',anchor:5,voices:'3',degree:'all',upper:'minor',upperRoot:'2',progression:'iiMajor',shift:'frets',reference:'current',beats:4,tempo:80,loop:false,accompaniment:true};
let cfg={...defaults},frames=[],index=0,timer=null,playing=false,voices=[],baseVoices=[],run=0,context=null,activeBaseKey=null;
try{const saved=JSON.parse(localStorage.getItem('diapason-study-lab-v1')||'{}');for(const k of ['tempo','anchor','group'])if(k in saved)cfg[k]=saved[k];}catch(_){}
if(!Number.isFinite(+cfg.anchor)||cfg.anchor<0||cfg.anchor>17)cfg.anchor=5;if(!['all','low','mid','high'].includes(cfg.group))cfg.group='all';if(!Number.isFinite(+cfg.tempo)||cfg.tempo<30||cfg.tempo>240)cfg.tempo=80;
host.innerHTML=`<div class="lab-heading"><div><h2>Estudio guiado</h2></div><button type="button" id="labClose" aria-label="Cerrar estudio guiado">×</button></div>
<div class="lab-topics" role="group" aria-label="Temas de estudio"></div>
<div class="lab-files"><label>Nombre del ejercicio<input id="labTitle" maxlength="100" value="Estudio de diapasón"></label><button type="button" id="labSave">Guardar ejercicio</button><button type="button" id="labRestore">Recuperar último</button><button type="button" id="labOpen">Abrir archivo</button><button type="button" id="labExport" disabled>Exportar</button><input id="labProjectFile" type="file" accept=".json,application/json" hidden></div><div class="lab-description"><p id="labDescription"></p><small id="labSource"></small></div>
<div class="lab-fields" id="labFields"></div>
<div class="lab-actions"><button type="button" id="labGenerate" class="lab-primary">Preparar ejercicio</button><button type="button" id="labPlay" disabled>▶ Escuchar</button><button type="button" id="labPause" disabled>Ⅱ Pausa</button><button type="button" id="labStop" disabled>■ Detener</button><button type="button" id="labPrev" aria-label="Paso anterior" disabled>←</button><button type="button" id="labNext" aria-label="Paso siguiente" disabled>→</button><label>BPM <input type="number" id="labTempo" min="30" max="240" value="${cfg.tempo}"></label><label><input type="checkbox" id="labLoop"> Repetir</label><button type="button" id="labRelease" disabled>Volver a exploración</button></div>
<p id="labStatus" class="lab-status" role="status">Elige un tema y prepara el ejercicio.</p>
<div id="labResult" hidden><div id="labTimeline" class="lab-timeline" role="group" aria-label="Recorrido del ejercicio"></div><div class="lab-current"><div><h3 id="labCurrent"></h3><p id="labContext"></p></div><span id="labCounter"></span></div><div class="lab-tables"><div class="lab-table-wrap"><table><caption>Notas y digitación · alturas sonoras</caption><thead><tr><th>Nota</th><th>Intervalo</th><th>Función</th><th>Cuerda / traste</th></tr></thead><tbody id="labNotes"></tbody></table></div><div id="labMotion" class="lab-motion" hidden></div></div></div>
<p class="lab-tip" id="labTip"></p><details id="labFullScore" class="lab-full-score" hidden><summary>Partitura completa y tablatura</summary><p id="labScoreStatus" role="status"></p><div id="labScoreSurface" class="lab-score-surface"></div></details>`;
const $=id=>document.getElementById(id),topicButtons=new Map(),scoreView=new S.ScoreView(document.getElementById('labScoreSurface'));
const PROJECT_KEY='diapason-study-project-v1';let saveTimer=null,autoTitle='Estudio de diapasón';
// Keep the real instrument and Bravura staff next to the study controls.
const boardRow=document.querySelector('.top-row'),boardHome=document.createComment('live instrument home');
boardRow.before(boardHome);
const workspace=document.createElement('div');workspace.className='lab-workspace';
const controlSide=document.createElement('div');controlSide.className='lab-control-side';
const visualSide=document.createElement('div');visualSide.className='lab-visual-side';
for(const selector of ['.lab-description','.lab-fields','.lab-actions','.lab-status','.lab-tip'])controlSide.append(host.querySelector(selector));
visualSide.append($('labResult'));workspace.append(controlSide,visualSide);host.append(workspace,$('labFullScore'));
function fold(label,className){const d=document.createElement('details'),summary=document.createElement('summary');d.className=className;summary.textContent=label;d.append(summary);return d;}
const settings=fold('Ajustar ejercicio','lab-settings');settings.append(controlSide.querySelector('.lab-description'),$('labFields'),controlSide.querySelector('.lab-tip'),$('labGenerate'),$('labRelease'));controlSide.append(settings);
const files=fold('Guardar, abrir o exportar','lab-project-tools');files.append(host.querySelector('.lab-files'));const savedHint=document.createElement('p');savedHint.textContent='El ejercicio se guarda automáticamente en este navegador.';files.append(savedHint);
const free=fold('Crear un ejercicio libre','lab-free-study'),freeLabel=document.createElement('label');freeLabel.textContent='Tipo de ejercicio';const topicSelect=document.createElement('select');topicSelect.id='labTopicSwitch';for(const [key,topic] of Object.entries(TOPICS))topicSelect.add(new Option(topic.label,key));freeLabel.append(topicSelect);free.append(freeLabel);host.querySelector('.lab-topics').hidden=true;
topicSelect.onchange=()=>{topicButtons.get(topicSelect.value)?.click();route.open=false;settings.open=true;};
const noteDetails=fold('Notas, digitación y conducción de voces','lab-note-details'),tables=$('labResult').querySelector('.lab-tables');tables.before(noteDetails);noteDetails.append(tables);
host.append(free,files,$('labFullScore'));
$('labPause').hidden=true;


const curriculum=window.CrescendoStudyCurriculum||[],route=document.createElement('details');route.className='lab-curriculum';route.open=true;
route.innerHTML='<summary>Ruta de estudio · cuatro niveles de guitarra</summary><p>Orden de temas de Guitarra 1–4. Explicaciones y ejercicios interactivos propios; el repertorio de los libros se practica con tu ejemplar o una partitura autorizada.</p><div class="lab-route-selectors"><label>Nivel<select id="labLevel"></select></label><label>Unidad<select id="labUnit"></select></label></div><div class="lab-route-goal"><strong id="labUnitTitle"></strong><p id="labUnitGoal"></p><small id="labUnitSource"></small></div><div class="lab-route-actions"><button type="button" id="labUnitPrev">← Unidad anterior</button><button type="button" id="labUnitStart">Estudiar esta unidad</button><button type="button" id="labUnitNext">Unidad siguiente →</button><label><input type="checkbox" id="labUnitDone"> Practicada</label><span id="labRouteProgress"></span></div>';
workspace.before(route);let routeLevel=0,routeUnit=0,routeStarted=false,routeDone={};
try{const saved=JSON.parse(localStorage.getItem('diapason-curriculum-v1')||'{}');routeLevel=Math.max(0,Math.min(curriculum.length-1,Number(saved.level)||0));routeUnit=Math.max(0,Math.min(curriculum[routeLevel].units.length-1,Number(saved.unit)||0));routeDone=saved.done&&typeof saved.done==='object'?saved.done:{};}catch(_){}
function saveRoute(){try{localStorage.setItem('diapason-curriculum-v1',JSON.stringify({level:routeLevel,unit:routeUnit,done:routeDone}));}catch(_){} }
function renderRoute(){
 const level=curriculum[routeLevel],unit=level.units[routeUnit];$('labLevel').replaceChildren(...curriculum.map((l,i)=>new Option('Nivel '+l.id+' · '+l.title,String(i))));$('labLevel').value=String(routeLevel);
 $('labUnit').replaceChildren(...level.units.map((u,i)=>new Option((routeDone[u.id]?'✓ ':'')+(i+1)+'. '+u.title,String(i))));$('labUnit').value=String(routeUnit);$('labUnitTitle').textContent='Nivel '+level.id+' · Unidad '+(routeUnit+1)+' · '+unit.title;$('labUnitGoal').textContent=unit.goal;$('labUnitSource').textContent=level.book+' · '+unit.reference;$('labUnitDone').checked=!!routeDone[unit.id];$('labUnitPrev').disabled=routeLevel===0&&routeUnit===0;$('labUnitNext').disabled=routeLevel===curriculum.length-1&&routeUnit===level.units.length-1;
 const count=curriculum.flatMap(l=>l.units).filter(u=>routeDone[u.id]).length;$('labRouteProgress').textContent=count+' / '+curriculum.flatMap(l=>l.units).length+' unidades practicadas';
}
async function loadUnit(){
 stop();release();route.open=true;free.open=false;files.open=false;settings.open=false;const unit=curriculum[routeLevel].units[routeUnit],preset=unit.preset,c=B.context();
 if(c.pitches.length!==6){Object.assign(c,{instrument:'guitar',instrumentLabel:'Guitarra',tuning:'standard',capo:0,pitches:[64,59,55,50,45,40]});}
 Object.assign(c,{scaleKey:preset.scale||'mayor',arpeggio:preset.arpeggio||'',chordValue:preset.chord||'',rootName:preset.rootName||(['1-penta-minor','1-blues-minor','1-cycle','1-motifs'].includes(unit.id)?'A':'C')});
 B.restoreContext(c);cfg={...defaults,tempo:cfg.tempo,...preset};cfg.kind=preset.kind;$('labTempo').value=cfg.tempo;$('labLoop').checked=false;renderFields();autoTitle=unit.title;$('labTitle').value=unit.title;routeStarted=true;generate(unit.title);saveRoute();
}
$('labLevel').onchange=()=>{routeLevel=Number($('labLevel').value);routeUnit=0;renderRoute();saveRoute();loadUnit();};$('labUnit').onchange=()=>{routeUnit=Number($('labUnit').value);renderRoute();saveRoute();loadUnit();};$('labUnitStart').onclick=loadUnit;
for(const [id,delta] of [['labUnitPrev',-1],['labUnitNext',1]])$(id).onclick=()=>{routeUnit+=delta;if(routeUnit<0){routeLevel--;routeUnit=curriculum[routeLevel].units.length-1;}if(routeUnit>=curriculum[routeLevel].units.length){routeLevel++;routeUnit=0;}renderRoute();loadUnit();};
$('labUnitStart').textContent='Restablecer unidad';settings.append($('labUnitStart'));
$('labUnitDone').onchange=()=>{routeDone[curriculum[routeLevel].units[routeUnit].id]=$('labUnitDone').checked;saveRoute();renderRoute();};renderRoute();

for(const [key,t] of Object.entries(TOPICS)){const b=document.createElement('button');b.type='button';b.textContent=t.label;b.dataset.topic=key;b.setAttribute('aria-pressed','false');b.onclick=()=>{stop();release();cfg.kind=key;cfg.inversion='all';cfg.range='full';cfg.model='nearest';cfg.family=['open','hybrid'].includes(key)?'closed':'drop2';if(key==='outside')cfg.group='low';renderFields();};host.querySelector('.lab-topics').append(b);topicButtons.set(key,b);}
function options(items){return items.map(([value,label])=>({value:String(value),label}));}
const triads=options(Object.entries(E.CHORDS).filter(([,d])=>d.tones.length===3).map(([k,d])=>[k,d.label]));
const qualities=options(Object.entries(E.CHORDS).filter(([,d])=>d.tones.length>=4).map(([k,d])=>[k,d.label]));
const patterns=options([['groups5','Células de 5'],['groups6','Células de 6'],['groups7','Células de 7'],['perm213','Permutación 2–1–3'],['perm321','Permutación 3–2–1'],['custom','Motivo personalizado'],['ascending','Ascendente'],['descending','Descendente'],['roundtrip','Subir y bajar'],['thirds','Terceras'],['groups3','Grupos de 3'],['groups4','Grupos de 4'],['motif','Motivo 1–3–2–4']]);
function select(key,label,items){
 const wrap=document.createElement('label');wrap.textContent=label;const el=document.createElement('select');el.id='lab-'+key;
 items.forEach(o=>el.add(new Option(o.label,o.value)));if(!items.some(o=>o.value===String(cfg[key])))cfg[key]=items[0].value;el.value=String(cfg[key]);
 el.onchange=()=>{stop();release();cfg[key]=el.value;if(['voices','quality','cycleMode','diatonicVoices','outsideArticulation','pattern','guideSource','voicingSource'].includes(key))renderFields();};wrap.append(el);$('labFields').append(wrap);
}
function renderFields(){
 $('labFields').replaceChildren();const kind=cfg.kind,t=TOPICS[kind];topicButtons.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===kind)));$('labDescription').textContent=t.description;$('labSource').textContent=t.source;$('labTip').textContent=t.tip;if(topicSelect)topicSelect.value=kind;
 if(kind==='cycles')select('cycleMode','Tipo de ciclo',options([['transpose','Transportar la misma estructura'],['diatonic','Grados de la escala']]));
 if(kind==='cycles'&&cfg.cycleMode!=='diatonic')select('cycle','Ciclo',options([[5,'Cuartas'],[7,'Quintas'],[2,'Tonos'],[3,'Terceras menores'],[4,'Terceras mayores'],[1,'Semitonos']]));
 if(['cycles','patterns','super','pairs','outside'].includes(kind)){select('pattern','Recorrido',patterns);select('rhythm','Ritmo',options([['triplets','Tresillos de corchea'],['sextuplets','Seis notas por pulso'],['dotted','Corchea con puntillo y semicorchea'],['even','Uniforme'],['syncopated','Dos corcheas y negra'],['motif','Negra, dos corcheas y negra']]));select('noteBeats','Figura del recorrido',options([[1,'Negras'],[.5,'Corcheas'],[.25,'Semicorcheas']]));}
 if(['open','hybrid','outside','guide'].includes(kind))select('triad','Tríada',triads);
 if(['super','pairs','extensions','outside','guide'].includes(kind))select('quality','Acorde base',qualities);
 if(['super','pairs'].includes(kind))select('upper','Estructura superpuesta',options([['pentaMajor','Pentatónica mayor'],['pentaMinor','Pentatónica menor'],...Object.entries(E.CHORDS).filter(([k,d])=>d.tones.length<=4&&M.ARPEGGIOS[({major:'mayor',minor:'menor',aug:'aumentado',dim:'disminuido'})[k]||k]).map(([k,d])=>[k,d.label])]));
 if(['super','pairs','hybrid'].includes(kind))select('upperRoot','Fundamental superior respecto al bajo',options(Array.from({length:12},(_,i)=>[i,['Unísono','♭2','2','♭3','3','4','♯4 / ♭5','5','♭6','6','♭7','7'][i]])));
 if(['super','pairs'].includes(kind)){
  const l=document.createElement('label');l.className='lab-check';const c=document.createElement('input');c.type='checkbox';c.checked=cfg.accompaniment;c.onchange=()=>{stop();cfg.accompaniment=c.checked;};l.append(c,document.createTextNode('Escuchar acorde base'));$('labFields').append(l);
 }
 if(['super','pairs','outside','guide'].includes(kind))select('reference','Escala de referencia',options([['current','La seleccionada arriba'],['major','Mayor'],['minor','Menor natural'],['dorian','Dórica'],['lydian','Lidia'],['mixolydian','Mixolidia'],['melodic','Menor melódica'],['harmonic','Menor armónica']]));
 if(['quartal','mixed','guide'].includes(kind))select('voices','Voces cuartales',options([[3,'Tres'],[4,'Cuatro']]));
 if(kind==='quartal'){select('degree','Grado de partida',options([['all','Todos los grados'],...[0,1,2,3,4,5,6].map(i=>[i,'Grado '+(i+1)])]));}
 if(kind==='voices')select('progression','Progresión',options([['iiMajor','ii–V–I mayor'],['iiMinor','iiø–V♭9–i menor'],['diatonic','Siete grados de la escala'],['blues','Blues mayor'],['bluesMinor','Blues menor'],['iiTriads','ii–V–I con tríadas']]));
 if(['extensions','voices','pairs','guide'].includes(kind)||kind==='cycles'&&cfg.cycleMode==='diatonic')select('family','Disposición',options([['closed','Bloque cerrado'],['drop2','Drop 2'],['drop3','Drop 3'],['drop23','Drop 2&3'],['doubleDrop3','Drop 3 · dos octavas']]));
 if(kind==='extensions'){
  select('voicingSource','Estudiar',options([['formula','Fórmula del acorde'],['reference','Bloques del libro 4 · p. 20']]));
  if(cfg.voicingSource==='reference'){
   select('referenceFamily','Esquema de referencia',options([['drop23','Drop 2&3'],['doubleDrop3','Doble Drop 3']]));select('referenceType','Tipo del esquema',options([['all','Los cuatro tipos'],[0,'Tipo 1'],[1,'Tipo 2'],[2,'Tipo 3'],[3,'Tipo 4']]));select('degree','Grado del bloque',options([['all','Todos'],...[0,1,2,3,4,5,6].map(i=>[i,'Grado '+(i+1)])]));
  }
 }
 if(kind==='hybrid')select('hybridFamily','Disposición del bloque',options([['closed','Bajo + tríada'],['drop2','Drop 2'],['drop3','Drop 3'],['drop23','Drop 2&3'],['doubleDrop3','Drop 3 · dos octavas']]));
 if(['open','quartal','hybrid','extensions','outside'].includes(kind)){
  const count=kind==='quartal'?Number(cfg.voices):kind==='extensions'?E.CHORDS[cfg.quality].tones.length:3;
  select('inversion',kind==='hybrid'?'Inversión de la tríada':'Inversión',options([['all',kind==='outside'?'Posición más cercana':'Todas, una por vez'],...Array.from({length:count},(_,i)=>[i,i===0?'Fundamental':i+'ª inversión'])]));
 }
 if(kind==='outside')select('shift','Desplazar por',options([['frets','Semitonos · ida y regreso'],['strings','Cuerdas · ida y regreso']]));

 if(kind==='cycles'&&cfg.cycleMode==='diatonic'){
  select('degreeCycle','Orden de los grados',options([[1,'Segundas'],[2,'Terceras'],[3,'Cuartas'],[4,'Quintas'],[5,'Sextas'],[6,'Séptimas']]));
  select('diatonicVoices','Armonizar con',options([[3,'Tríadas'],[4,'Tétradas']]));
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=cfg.allKeys;check.onchange=()=>{stop();release();cfg.allKeys=check.checked;};label.className='lab-check';label.append(check,document.createTextNode('Recorrer las doce tonalidades'));$('labFields').append(label);
 }
 if(['cycles','pairs','voices','guide'].includes(kind))select('triadLayout','Disposición de tríadas',options([['closed','Cerradas'],['open','Abiertas']]));
 if(kind==='pairs'){
  const structures=options(Object.entries(E.CHORDS).filter(([k,d])=>d.tones.length<=4&&M.ARPEGGIOS[({major:'mayor',minor:'menor',aug:'aumentado',dim:'disminuido'})[k]||k]).map(([k,d])=>[k,d.label]));
  select('secondUpper','Segunda estructura · B',structures);select('secondRoot','Fundamental B respecto al bajo',options(Array.from({length:12},(_,i)=>[i,['1','♭2','2','♭3','3','4','♯4','5','♭6','6','♭7','7'][i]])));
  select('pairOrder','Alternancia',options([['ab','A–B'],['abba','A–B–B–A']]));select('pairRepeats','Vueltas',options([[1,'Una'],[2,'Dos'],[4,'Cuatro']]));select('pairArticulation','Tocar como',options([['arpeggio','Arpegios'],['block','Bloques']]));
 }
 if(kind==='mixed')select('mixedProgression','Recorrido armónico',options([['iiMajor','ii–V–I'],['diatonic','Siete grados de la escala']]));
 if(kind==='guide'){
  select('guideSource','Bloque inicial',options([['triad','Tríada'],['tetrad','Tétrada'],['quartal','Cuartal']]));select('hold','Mantener fijo',options([['top','Voz superior'],['bass','Bajo']]));select('guideDirection','Dirección del recorrido',options([['auto','Alejarse de la voz fija'],['up','Ascendente'],['down','Descendente']]));select('guideMotion','Movimiento de otras voces',options([['chromatic','Cromático · contexto libre'],['diatonic','Diatónico · escala seleccionada']]));
 }
 if(kind==='outside'){select('outsideArticulation','Articulación de la célula',options([['melodic','Melódica'],['block','Bloque simultáneo']]));if(cfg.outsideArticulation==='melodic')select('cellSize','Notas por célula',options([[3,'Tres'],[4,'Cuatro'],[5,'Cinco · 3+2'],[6,'Seis · 4+2'],[7,'Siete · 3+4']]));}
 if(['cycles','patterns','super','pairs','outside'].includes(kind)&&cfg.pattern==='custom'){
  const label=document.createElement('label');label.textContent='Motivo · números de grado';const input=document.createElement('input');input.id='lab-customPattern';input.value=cfg.customPattern.map(n=>n+1).join(' ');input.placeholder='1 3 2 4';input.onchange=()=>{const parsed=input.value.trim().split(/[ ,;–-]+/).map(Number);if(!parsed.length||parsed.length>12||parsed.some(n=>!Number.isInteger(n)||n<1||n>12)){input.setCustomValidity('Escribe de 1 a 12 números entre 1 y 12.');input.reportValidity();return;}input.setCustomValidity('');stop();release();cfg.customPattern=parsed.map(n=>n-1);};label.append(input);$('labFields').append(label);
 }
 if(['cycles','patterns'].includes(kind)){
  const c=B.context(),available=M.models({rootPc:c.root,pitches:c.pitches,maxFret:c.maxFret,scheme:c.scheme,kind:c.material==='arpeggio'?'arpeggio':'scale',arpeggio:c.arpeggio||'maj7',steps:c.steps,key:c.scaleKey});
  select('model','Modelo del recorrido',options([['nearest','Más cercano a la región'],...available.map(m=>[m.id,m.label+' · '+m.source])]));
  select('range','Registro del estudio',options([['full','Modelo completo'],['one','Una octava'],['two','Dos octavas']]));select('startDegree','Grado de inicio del registro',options((c.material==='arpeggio'?M.ARPEGGIOS[c.arpeggio].intervals:c.scale).map((n,i)=>[i,'Grado '+(i+1)])));
 }
 select('meter','Compás de la partitura',options([['4/4','4/4'],['3/4','3/4'],['2/4','2/4'],['6/8','6/8']]));
 select('group','Grupo de cuerdas',options([['all','Todas'],['low','Graves'],['mid','Centrales'],['high','Agudas']]));
 const label=document.createElement('label');label.textContent='Región · traste central';const input=document.createElement('input');input.type='number';input.min=0;input.max=17;input.value=cfg.anchor;input.id='lab-anchor';input.onchange=()=>{stop();release();cfg.anchor=Math.max(0,Math.min(17,Number(input.value)||0));input.value=cfg.anchor;};label.append(input);$('labFields').append(label);
 if(!['patterns','super'].includes(kind))select('beats','Duración de cada bloque',options([[4,'Cuatro tiempos'],[2,'Dos tiempos'],[1,'Un tiempo']]));
}
function stop(){run++;playing=false;clearTimeout(timer);timer=null;voices.forEach(v=>v?.stop?.());baseVoices.forEach(v=>v?.stop?.());voices=[];baseVoices=[];activeBaseKey=null;$('labPlay').textContent='▶ Escuchar';$('labPlay').setAttribute('aria-pressed','false');$('labPause').disabled=true;}
function release(){frames=[];index=0;B.clear();if(!host.hidden)visualSide.prepend(boardRow);$('labResult').hidden=true;$('labFullScore').hidden=true;$('labExport').disabled=true;['labPlay','labPause','labStop','labPrev','labNext','labRelease'].forEach(id=>$(id).disabled=true);if(!host.hidden)$('labPlay').disabled=false;$('labStatus').textContent='Pulsa Escuchar para preparar el ejercicio con estos ajustes.';}
function noteName(midi,frame){
 const rootName=context.name(frame.root),quality=E.CHORDS[cfg.quality];
 if(cfg.kind==='hybrid'&&midi===frame.cells[0].midi)return context.name(context.root);
 if(frame.upperRoot!==undefined)return P.spell(midi,context.name(frame.upperRoot),frame.upperSuffix||'').name;
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
 if(['cycles','patterns','quartal','mixed'].includes(cfg.kind)&&context.material!=='arpeggio'&&context.scale.length===7){
  const spellingRoot=cfg.kind==='cycles'&&cfg.cycleMode!=='diatonic'?frame.root:context.root,iv=E.mod(midi-spellingRoot),degree=context.scale.indexOf(iv);
  if(degree>=0){const letters='CDEFGAB',letter=letters[(letters.indexOf(context.name(spellingRoot)[0])+degree)%7],naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11},alter=((E.mod(midi)-naturals[letter]+18)%12)-6;return letter+(alter<0?'b'.repeat(-alter):'#'.repeat(alter));}
 }
 const suffix=['open','hybrid','outside'].includes(cfg.kind)?E.CHORDS[cfg.triad].suffix:context.material==='arpeggio'&&['patterns','cycles'].includes(cfg.kind)?(context.arpeggio==='dim7'?'dim7':M.ARPEGGIOS[context.arpeggio].label):cfg.kind==='cycles'&&context.chord?context.chord.suffix:quality?.suffix||'';return P.spell(midi,rootName,suffix).name;
}
function generate(unitTitle){
 stop();B.stopScore();context=B.context();cfg.anchor=Number($('lab-anchor').value);cfg.noteBeats=Number(cfg.noteBeats);cfg.beats=Number(cfg.beats);
 const references={...E.SCALES,dorian:[0,2,3,5,7,9,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10]};if(['super','pairs','outside','guide'].includes(cfg.kind)&&references[cfg.reference])context.scale=references[cfg.reference];
 try{
  frames=E.makeStudy(cfg,context,M);index=0;if(typeof unitTitle==='string'){$('labTitle').value=unitTitle;autoTitle=unitTitle;}else if($('labTitle').value===autoTitle){autoTitle=TOPICS[cfg.kind].label+' · '+context.name(context.root);$('labTitle').value=autoTitle;}
  frames.forEach(f=>{f.characteristic=['cycles','patterns'].includes(cfg.kind)?M.characteristic(context.scaleKey,context.scale).map(n=>E.mod((cfg.kind==='cycles'?f.root:context.root)+n.interval)):[];f.names={};for(const c of [...f.cells,...(f.reference||[])])f.names[c.midi]=noteName(c.midi,f);});
  $('labResult').hidden=false;$('labResult').insertBefore(boardRow,noteDetails);['labPlay','labStop','labPrev','labNext','labRelease'].forEach(id=>$(id).disabled=false);
  $('labStatus').textContent=`${frames.length} eventos listos. Usa Escuchar o las flechas para avanzar.${frames.warnings.length?' '+frames.warnings.join(' '):''}`;
  try{localStorage.setItem('diapason-study-lab-v1',JSON.stringify({tempo:cfg.tempo,anchor:cfg.anchor,group:cfg.group}));}catch(_){}
  renderTimeline();show();drawFullScore();saveProject(true);
 }catch(error){release();$('labStatus').textContent=error.message;}
}
function renderTimeline(){
 const container=$('labTimeline');container.replaceChildren();let previous='';
 frames.forEach((f,i)=>{if(f.group&&f.group===previous)return;previous=f.group||'';const b=document.createElement('button');b.type='button';b.textContent=f.label;b.dataset.index=i;b.onclick=()=>{stop();index=i;show();};container.append(b);});container.hidden=container.childElementCount<2;
}
function show(){
 const f=frames[index];if(!f)return;B.show(f);$('labCurrent').textContent=f.label;$('labCounter').textContent=`${index+1} / ${frames.length}`;
 const reference=['super','pairs','outside','guide'].includes(cfg.kind)?` · Referencia: ${context.name(context.root)} ${cfg.reference==='current'?context.scaleKey.replace(/_/g,' '):$('lab-reference').selectedOptions[0].textContent}`:'';
 $('labContext').textContent=`${f.beats} tiempo${f.beats===1?'':'s'} · Región ${cfg.anchor}${reference}`;
 $('labTimeline').querySelectorAll('button').forEach(b=>{const start=Number(b.dataset.index),next=b.nextElementSibling?Number(b.nextElementSibling.dataset.index):frames.length;b.setAttribute('aria-current',String(index>=start&&index<next));});
 const tbody=$('labNotes');tbody.replaceChildren();const cells=f.reference||f.cells,roleText={root:'Fundamental',structural:'Nota estructural',tension:'Tensión del contexto',unavailable:'Fuera / evitar en referencia'};
 for(const c of cells){const tr=document.createElement('tr');if(f.cells.some(n=>n.string===c.string&&n.fret===c.fret))tr.className='lab-active-note';
  const name=f.names[c.midi]||noteName(c.midi,f),accidental=[...name.slice(1)].reduce((n,c)=>n+(c==='b'?-1:1),0),octave=Math.round((c.midi-({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[name[0]]-accidental)/12)-1;
  for(const [i,text] of [name+octave,E.intervalLabel(c.midi,f.root,f.chordTones),roleText[c.role]+(c.midi===f.heldMidi?' · voz fija':''),`${c.string+1} / ${c.fret}`].entries()){const td=document.createElement('td');td.textContent=text;if(i===0){const span=document.createElement('span');span.className='lab-note lab-role-'+c.role;span.textContent=text;td.replaceChildren(span);}tr.append(td);}tbody.append(tr);
 }
 const motion=$('labMotion');motion.replaceChildren();motion.hidden=!f.motion;
 if(f.motion){const h=document.createElement('h4');h.textContent='Enlace desde el acorde anterior';motion.append(h);const summary=document.createElement('p');summary.textContent=`Movimiento total: ${f.motion.distance} semitonos · Notas comunes: ${f.motion.common.length}`;motion.append(summary);for(const v of f.motion.voices){const line=document.createElement('p');line.textContent=`${P.name(v.from,context.name(context.root))}${Math.floor(v.from/12)-1} → ${P.name(v.to,context.name(context.root))}${Math.floor(v.to/12)-1} · ${v.delta===0?'permanece':(v.delta>0?'+':'')+v.delta+' semitonos'}`;motion.append(line);}}
 $('labPrev').disabled=index===0;$('labNext').disabled=index===frames.length-1;scoreView.highlight(index);schedulePositionSave();
}
function tick(token){
 if(!playing||token!==run)return;
 voices.forEach(v=>v?.stop?.());voices=[];
 const f=frames[index];show();const seconds=60/cfg.tempo*f.beats;
 for(const c of f.cells)voices.push(B.play(c.midi,seconds*.92));
 if(cfg.accompaniment&&f.accompaniment){const baseKey=f.baseGroup||f.accompaniment.map(c=>c.midi).join(',');if(activeBaseKey!==baseKey||!baseVoices.length){baseVoices.forEach(v=>v?.stop?.());baseVoices=[];activeBaseKey=baseKey;let beats=0;for(let n=index;n<frames.length&&(frames[n].baseGroup||frames[n].accompaniment?.map(c=>c.midi).join(','))===baseKey;n++)beats+=frames[n].beats;for(const c of f.accompaniment)baseVoices.push(B.play(c.midi,Math.max(seconds,beats*60/cfg.tempo)*.98));}}
 timer=setTimeout(()=>{if(token!==run)return;if(index+1<frames.length){index++;tick(token);}else if(cfg.loop){index=0;tick(token);}else{stop();$('labStatus').textContent='Ejercicio completado.';}},seconds*1000);
}
async function play(){
 if(!frames.length)generate();if(!frames.length)return;
 stop();B.stopScore();playing=true;const token=run;$('labPlay').textContent='Cargando sonido…';
 await B.ready();if(!playing||token!==run)return;
 if(index===frames.length-1)index=0;$('labPlay').textContent='Ⅱ Pausar';$('labPlay').setAttribute('aria-pressed','true');$('labPause').disabled=false;$('labStatus').textContent='Reproduciendo el ejercicio.';tick(token);
}
function close(){stop();release();boardHome.after(boardRow);host.hidden=true;toggle.setAttribute('aria-expanded','false');}
toggle.onclick=()=>{if(!host.hidden){close();return;}host.hidden=false;visualSide.prepend(boardRow);toggle.setAttribute('aria-expanded','true');renderFields();if(!routeStarted&&!frames.length)loadUnit();};$('labClose').onclick=close;
$('labGenerate').onclick=generate;$('labPlay').onclick=()=>{if(playing)$('labPause').onclick();else play();};$('labPause').onclick=()=>{stop();$('labStatus').textContent='En pausa. Escuchar reanuda desde este evento.';};$('labStop').onclick=()=>{stop();index=0;show();$('labStatus').textContent='Detenido. Ejercicio al inicio.';};$('labRelease').onclick=()=>{stop();release();};$('labPrev').onclick=()=>{stop();index=Math.max(0,index-1);show();};$('labNext').onclick=()=>{stop();index=Math.min(frames.length-1,index+1);show();};
$('labTempo').onchange=()=>{stop();cfg.tempo=Math.max(30,Math.min(240,Number($('labTempo').value)||80));$('labTempo').value=cfg.tempo;};$('labLoop').onchange=()=>cfg.loop=$('labLoop').checked;
// An explicit change in the original controls returns ownership to normal exploration.
document.querySelector('.panel').addEventListener('change',event=>{if(event.target.id==='volume'||event.target.id==='soundType')return;stop();release();},true);
for(const id of ['clearAllBtn','clearSelectionBtn','scorePlayBtn','scoreNextBtn','guitarBankMenu','plus','minus'])$(id)?.addEventListener('click',()=>{stop();if(frames.length)release();},true);
$('board').addEventListener('pointerdown',()=>{if(frames.length){stop();release();}},true);
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
host.addEventListener('keydown',event=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(event.target.tagName))return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();stop();index=Math.max(0,Math.min(frames.length-1,index+(event.key==='ArrowRight'?1:-1)));show();}});
function serialContext(){const copy={...context};delete copy.name;return copy;}
function snapshot(){return {kind:'crescendo-study',version:1,title:$('labTitle').value.trim()||'Estudio de diapasón',config:{...cfg},context:serialContext(),frames,index,savedAt:new Date().toISOString()};}
function schedulePositionSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(frames.length)try{localStorage.setItem(PROJECT_KEY+'-position',JSON.stringify({index,tempo:cfg.tempo,loop:cfg.loop}));}catch(_){}},400);}
function saveProject(automatic=false){if(!frames.length){if(!automatic)$('labStatus').textContent='Prepara un ejercicio antes de guardarlo.';return;}try{localStorage.setItem(PROJECT_KEY,JSON.stringify(snapshot()));localStorage.removeItem(PROJECT_KEY+'-position');if(!automatic)$('labStatus').textContent='Ejercicio completo guardado en este navegador.';}catch(error){$('labStatus').textContent='No hay espacio para el guardado local. Puedes exportar el proyecto JSON.';}}
async function drawFullScore(){
 if(!frames.length)return;$('labFullScore').hidden=false;$('labExport').disabled=false;$('labScoreStatus').textContent='Dibujando la partitura completa…';
 try{const xml=S.musicXML(frames,context,cfg,$('labTitle').value||TOPICS[cfg.kind]?.label||'Estudio');await scoreView.update(xml,frames,cfg.meter);$('labScoreStatus').textContent='Notación escrita para el instrumento · sonido a altura real · TAB con la digitación del ejercicio.';scoreView.highlight(index);}catch(error){$('labScoreStatus').textContent='No se pudo dibujar la partitura: '+error.message;}
}
async function restoreProject(project){
 const valid=S.validateProject(project);if(!TOPICS[valid.config?.kind])throw Error('Tema de estudio no reconocido.');
 stop();B.restoreContext(valid.context);
 context={...valid.context,name:n=>n===valid.context.root?(valid.context.rootName||P.name(n)):P.name(n)};cfg={...defaults,...valid.config};
 cfg.tempo=Math.max(30,Math.min(240,Number(cfg.tempo)||80));cfg.anchor=Math.max(0,Math.min(17,Number(cfg.anchor)||0));
 frames=valid.frames;frames.warnings=[];index=Math.max(0,Math.min(frames.length-1,Number.isInteger(valid.index)?valid.index:0));
 host.hidden=false;toggle.setAttribute('aria-expanded','true');renderFields();$('labTitle').value=String(valid.title||'Estudio recuperado').slice(0,100);$('labTempo').value=cfg.tempo;$('labLoop').checked=!!cfg.loop;
 $('labResult').hidden=false;$('labResult').insertBefore(boardRow,noteDetails);['labPlay','labStop','labPrev','labNext','labRelease'].forEach(id=>$(id).disabled=false);renderTimeline();show();await drawFullScore();$('labStatus').textContent='Ejercicio recuperado con sus notas, digitaciones y ajustes.';
}
$('labSave').onclick=()=>saveProject();$('labRestore').onclick=async()=>{try{const text=localStorage.getItem(PROJECT_KEY);if(!text)throw Error('Todavía no hay un ejercicio guardado en este navegador.');const project=JSON.parse(text),position=JSON.parse(localStorage.getItem(PROJECT_KEY+'-position')||'null');if(position){project.index=position.index;Object.assign(project.config,{tempo:position.tempo,loop:position.loop});}await restoreProject(project);}catch(error){$('labStatus').textContent=error.message;}};
$('labOpen').onclick=()=>$('labProjectFile').click();$('labProjectFile').onchange=async()=>{const file=$('labProjectFile').files[0];if(!file)return;try{if(file.size>10*1024*1024)throw Error('El proyecto supera el tamaño permitido de 10 MB.');await restoreProject(JSON.parse(await file.text()));saveProject(true);}catch(error){$('labStatus').textContent='No se pudo abrir el proyecto: '+error.message;}finally{$('labProjectFile').value='';}};
$('labTitle').onchange=()=>{if(frames.length){saveProject(true);drawFullScore();}};
function filename(name,ext){return (String(name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').trim().slice(0,100)||'Estudio de diapasón')+'.'+ext;}
async function writeFile(blob,name,directory,handle){if(directory){const file=await directory.getFileHandle(name,{create:true}),writer=await file.createWritable();await writer.write(blob);await writer.close();}else if(handle){const writer=await handle.createWritable();await writer.write(blob);await writer.close();}else{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}}
$('labExport').onclick=()=>{
 if(!frames.length)return;stop();const dialog=document.createElement('dialog');dialog.className='lab-export-dialog';dialog.setAttribute('aria-label','Exportar ejercicio');dialog.innerHTML='<form><h2>Exportar ejercicio</h2><label>Formato<select name="format"><option value="pdf">PDF · todas las páginas</option><option value="png">Imágenes PNG · páginas en ZIP</option><option value="musicxml">MusicXML · partitura y digitación</option><option value="json">Proyecto JSON · editable en esta app</option></select></label><label>Nombre<input name="name" required maxlength="100"></label><button type="button" data-folder>Elegir carpeta</button><small data-folder-name>Descargas del navegador</small><p data-help>Las páginas PNG se entregan juntas en un archivo ZIP.</p><p data-error role="status"></p><div><button type="button" data-cancel>Cancelar</button><button type="submit">Exportar</button></div></form>';
 const input=dialog.querySelector('input'),format=dialog.querySelector('select'),form=dialog.querySelector('form');input.value=$('labTitle').value;let directory=null;const folder=dialog.querySelector('[data-folder]');folder.disabled=!window.showDirectoryPicker;
 if(!window.showDirectoryPicker)dialog.querySelector('[data-folder-name]').textContent='La carpeta se elige desde las preferencias de descarga del navegador.';
 folder.onclick=async()=>{try{directory=await window.showDirectoryPicker({mode:'readwrite'});dialog.querySelector('[data-folder-name]').textContent=directory.name;}catch(error){if(error.name!=='AbortError')dialog.querySelector('[data-error]').textContent=error.message;}};
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
 form.onsubmit=async event=>{
  event.preventDefault();const type=format.value,title=input.value.trim()||'Estudio',submit=form.querySelector('[type=submit]');let handle=null;
  try{
   const pagesCount=Math.max(1,$('labScoreSurface').querySelectorAll('svg').length),ext=type==='png'?'zip':type;
   const name=filename(title,ext);submit.disabled=true;dialog.querySelector('[data-error]').textContent='Preparando archivo…';
   let blob;
   if(type==='json')blob=new Blob([JSON.stringify({...snapshot(),title},null,2)],{type:'application/json'});
   else if(type==='musicxml')blob=new Blob([S.musicXML(frames,context,cfg,title)],{type:'application/vnd.recordare.musicxml+xml'});
   else{
    await scoreView.update(S.musicXML(frames,context,cfg,title),frames,cfg.meter);const canvases=await scoreView.raster();
    if(type==='pdf'){const pages=[];for(const canvas of canvases){const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.97));if(!jpeg)throw Error('No se pudo preparar una página del PDF.');pages.push({width:canvas.width,height:canvas.height,bytes:new Uint8Array(await jpeg.arrayBuffer())});}blob=new Blob([S.pdfPages(pages)],{type:'application/pdf'});}
    else{const files=[];for(let i=0;i<canvases.length;i++){const png=await new Promise(resolve=>canvases[i].toBlob(resolve,'image/png'));if(!png)throw Error('No se pudo crear la imagen.');files.push({name:filename(title+' - '+(i+1),'png'),bytes:new Uint8Array(await png.arrayBuffer())});}blob=new Blob([S.zip(files)],{type:'application/zip'});}
   }
   await writeFile(blob,name,directory,handle);$('labStatus').textContent='Archivo exportado: '+name;dialog.close();
  }catch(error){if(error.name!=='AbortError')dialog.querySelector('[data-error]').textContent='No se pudo exportar: '+error.message;}finally{submit.disabled=false;}
 };
};

renderFields();
})();
