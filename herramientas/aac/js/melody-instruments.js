/* Read-only study views; the melody transport remains the only audio clock. */
(function(){
 'use strict';
 const Pitch=window.CrescendoInstrumentPitch;let host,view,tuning,caption,piano,board,timeline=null,route=[],last='',fifths=0,panelRef,geometry,editionKey=null;
 const keys=new Map(),cells=new Map();
 const name=m=>{const n=window.AACMelodyCore?.spelling(m,fifths);return n?`${n.step}${n.alter<0?'♭'.repeat(-n.alter):'♯'.repeat(n.alter)}${n.octave}`:Pitch.noteInfo(m).name+Pitch.noteInfo(m).octave;};
 function mount(panel){
  panelRef=panel;host=document.createElement('section');host.className='melody-instruments';host.setAttribute('aria-label','Guía instrumental de la melodía');
  host.innerHTML=`<div class="melody-instrument-controls"><label>Guía instrumental <select id="melodyInstrumentView" aria-label="Guía instrumental"><option value="none">Oculta</option><option value="piano" selected>Piano</option><option value="guitar">Guitarra</option><option value="both">Piano y guitarra</option></select></label><label class="melody-guitar-option">Afinación <select id="melodyInstrumentTuning" aria-label="Afinación de la guía de guitarra"></select></label><span class="melody-guitar-option melody-guitar-range" id="melodyGuitarRange" aria-live="off">Digitación automática · 4 trastes</span></div><p id="melodyInstrumentNote" class="melody-instrument-caption" aria-live="off">Selecciona una melodía.</p><div class="melody-keyboard-scroll"><div class="melody-keyboard" role="img" aria-label="Piano a altura real"></div></div><div class="melody-fretboard-scroll"><canvas class="melody-fretboard" role="img" aria-label="Guitarra a altura real; primera cuerda arriba"></canvas></div><div class="melody-instrument-footer"><p class="melody-instrument-help">Altura real · Do4 = do central. Guitarra: una digitación automática por nota, con cuatro trastes por defecto.</p><p class="melody-layout-help">Selecciona un compás y usa ↑ / ↓ para ajustar el salto de pentagrama. ← / →: recorrer las notas.</p></div>`;
  document.body.append(host);new MutationObserver(syncDock).observe(panel,{attributes:true,attributeFilter:['hidden','data-reference-only']});new ResizeObserver(()=>{syncDock();if(timeline){buildGuitar();last='';update(timeline,window.AACMelodyInstruments.time||0,!!window.AACMelodyInstruments.playing);}}).observe(host);
  view=host.querySelector('#melodyInstrumentView');tuning=host.querySelector('#melodyInstrumentTuning');caption=host.querySelector('#melodyInstrumentNote');piano=host.querySelector('.melody-keyboard');piano.classList.add('piano-surface');board=host.querySelector('canvas');
  for(const t of Pitch.GUITAR_TUNINGS)tuning.add(new Option(t.label,t.value));
  view.onchange=()=>{last='';paintVisibility();update(timeline,window.AACMelodyInstruments.time||0,!!window.AACMelodyInstruments.playing);};
  tuning.onchange=()=>{if(editionKey)try{localStorage.setItem('aac:guitar-tuning:'+editionKey,tuning.value);}catch{}buildGuitar();calculateRoute();last='';update(timeline,window.AACMelodyInstruments.time||0,!!window.AACMelodyInstruments.playing);};
  paintVisibility();syncDock();
 }
 function syncDock(){if(!host)return;host.hidden=panelRef.hidden||!timeline||panelRef.dataset.referenceOnly==='true';document.body.classList.toggle('aac-instrument-docked',!host.hidden);document.documentElement.style.setProperty('--aac-instrument-dock-height',host.hidden?'0px':host.offsetHeight+'px');}
 function pitches(){return Pitch.GUITAR_TUNINGS.find(t=>t.value===tuning.value).pitches;}
 function paintVisibility(){if(!host)return;host.querySelector('.melody-keyboard-scroll').hidden=!['piano','both'].includes(view.value);host.querySelector('.melody-fretboard-scroll').hidden=!['guitar','both'].includes(view.value);host.querySelectorAll('.melody-guitar-option').forEach(el=>el.hidden=!['guitar','both'].includes(view.value));caption.hidden=view.value==='none';const help=host.querySelector('.melody-instrument-help');help.hidden=view.value==='none';help.textContent=['guitar','both'].includes(view.value)?'Altura de concierto · la guitarra se escribe una octava por encima de su sonido. Una digitación por nota: cuatro trastes por defecto, con desplazamiento o extensión automática cuando hace falta.':'Las teclas muestran la altura real de la melodía. Do4 es el do central.';}
 function buildPiano(){
  piano.replaceChildren();keys.clear();const notes=(timeline?.events||[]).map(e=>e.midi).filter(n=>n>=21&&n<=108);const min=21,max=108;
  const layout=Pitch.keyboardLayout(min,max),whiteCount=layout.filter(n=>!n.isBlack).length;piano.style.minWidth=Math.max(420,whiteCount*24)+'px';
  for(const note of layout){const key=document.createElement('span');key.className=note.isBlack?'black-key':'white-key';key.dataset.midi=note.midi;key.style.left=note.left+'%';key.style.width=note.width+'%';key.setAttribute('aria-label',name(note.midi));const label=document.createElement('span');label.className='label';label.textContent=name(note.midi);key.append(label);piano.append(key);keys.set(note.midi,key);}
 }
 function buildGuitar(){
  cells.clear();const canvasH=237,width=Math.max(1000,(host.clientWidth||innerWidth)*canvasH/156),boardX=100,padY=22,boardH=canvasH-44,fw=(width-boardX-46)/22,stringGap=boardH/5;
  board.width=width;board.height=canvasH;geometry={width,canvasH,boardX,boardW:22*fw,padY,boardH,stringGap,startY:padY,fw,visibleFrets:22};
  pitches().forEach((open,index)=>{for(let fret=0;fret<=22;fret++)cells.set(`${index+1}:${fret}`,{midi:open+fret,x:fret?boardX+(fret-.5)*fw:boardX-24,y:padY+index*stringGap,active:false,filled:false});});drawGuitar();
 }
 function drawGuitar(){if(!geometry)return;const ctx=board.getContext('2d'),g=geometry;window.CrescendoInstrumentSurfaces.drawFretboardBase(ctx,g);ctx.font='900 16px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#e8e3d8';pitches().forEach((open,index)=>ctx.fillText(`${index+1} · ${name(open)}`,8,g.padY+index*g.stringGap));ctx.textAlign='center';ctx.font='12px Inter,sans-serif';for(let fret=0;fret<=22;fret++)ctx.fillText(String(fret),fret?g.boardX+(fret-.5)*g.fw:g.boardX-24,g.canvasH-6);for(const cell of cells.values())if(cell.active)window.CrescendoInstrumentSurfaces.drawNote(ctx,cell.x,cell.y,name(cell.midi).replace(/-?\d+$/,''),cell.filled);}
 function calculateRoute(){route=timeline?window.AACMelodyGuitar.build(timeline,pitches(),22):[];}
 function setTimeline(value,keyFifths=0,key=null){timeline=value;fifths=keyFifths;last='';if(!host)return;if(key!==editionKey){editionKey=key;let saved;try{saved=key&&localStorage.getItem('aac:guitar-tuning:'+key);}catch{}tuning.value=Pitch.GUITAR_TUNINGS.some(t=>t.value===saved)?saved:'standard';}buildPiano();buildGuitar();calculateRoute();clear();syncDock();caption.textContent='Selecciona una melodía.';update(value,0,false);}
 function clear(){for(const key of keys.values())key.classList.remove('active');for(const cell of cells.values()){cell.active=false;cell.filled=false;}}
 function update(value,time,playing,frame){if(!host||!value)return;window.AACMelodyInstruments.time=time;window.AACMelodyInstruments.playing=playing;const active=frame?.active||window.AACMelodyCore.frameAt(value,time)?.active||[],signature=active.map(n=>n.index).join(',')+'|'+view.value+'|'+playing;if(signature===last)return;last=signature;clear();host.dataset.activeMidi=active.map(n=>n.e.midi).join(',');
  if(!active.length){drawGuitar();caption.textContent=(playing?'Silencio':'Preparado / silencio')+' · las notas se iluminan al reproducir o mover la posición.';return;}
  const details=[],fingering=window.AACMelodyGuitar.frameAt(route,time),range=fingering?.range;
  const rangeLabel=host.querySelector('#melodyGuitarRange');rangeLabel.textContent=range?`Digitación automática · trastes ${range.start}–${range.end} · ${range.width} trastes${range.width>4?' (extensión)':''}`:'Digitación automática · 4 trastes';
  const selected=new Map((fingering?.positions||[]).map(p=>[p.midi,p]));
  for(const {e}of active){keys.get(e.midi)?.classList.add('active');const suggested=selected.get(e.midi);if(suggested){const cell=cells.get(`${suggested.string}:${suggested.fret}`);if(cell){cell.active=true;cell.filled=true;}}let text=name(e.midi);if(['guitar','both'].includes(view.value))text+=suggested?` · cuerda ${suggested.string}, traste ${suggested.fret}`:Pitch.guitarPositions(e.midi,pitches(),22).length?' · sin digitación simultánea disponible':' · fuera del rango de esta guitarra';if(['piano','both'].includes(view.value)&&!keys.has(e.midi))text+=' · fuera del rango del piano de 88 teclas';if(!details.includes(text))details.push(text);}
  drawGuitar();caption.textContent=(playing?'Ahora: ':'Posición: ')+details.join(' | ');

 }
 window.AACMelodyInstruments={mount,setTimeline,update,clear,time:0};
})();
