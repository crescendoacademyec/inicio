/* AAC melody pilot: one score supplies notation, playback and every export. */
(function(){
 'use strict';const $=id=>document.getElementById(id),Core=window.AACMelodyCore,DEFAULT_MELODY_ID='autumn-leaves';
 const panel=document.createElement('section');panel.id='melodyPanel';panel.hidden=true;panel.setAttribute('aria-label','Melodía y referencias');
 panel.innerHTML=`<div class="melody-head"><div><div class="melody-kicker">AAC · Melodías</div><h2 id="melodyTitle">Revisar una melodía</h2></div></div>
 <div class="melody-controls"><div class="melody-library-picker"><label for="melodySearch">Melodías <span id="melodyLibraryCount"></span></label><input id="melodySearch" type="search" role="combobox" aria-label="Buscar melodías por título o compositor" aria-autocomplete="list" aria-controls="melodySearchResults" aria-expanded="false" autocomplete="off" placeholder="Buscar título o compositor"><select id="melodyExample" hidden aria-hidden="true" tabindex="-1"><option value="">Selecciona un tema</option></select><div class="melody-library-popup" hidden><p id="melodySearchStatus" role="status"></p><div id="melodySearchResults" role="listbox" aria-label="Resultados de melodías"></div></div></div><label class="melody-file" tabindex="0" role="button" aria-label="Importar partitura MusicXML o MEI" title="MusicXML (.musicxml/.xml) y MEI (.mei)">Importar partitura<input id="melodyImport" type="file" accept=".musicxml,.xml,.mei" hidden></label><button id="melodyEdit" type="button" hidden>Editar acordes y análisis</button><button id="melodyLink" type="button" aria-pressed="false" aria-controls="melodyScore" title="Mostrar u ocultar el análisis armónico sobre la melodía" disabled>Mostrar análisis armónico</button><button id="melodyHarmony" type="button" title="Crear una versión de estudio desde la armonía original" disabled>Crear estudio</button></div>
 <div class="melody-controls"><button id="melodyPlay" class="melody-primary" type="button" disabled>▶ Reproducir melodía</button><button id="melodyStop" type="button" disabled>■ Detener</button><label>Tempo <input id="melodyTempo" type="number" min="20" max="360" value="120" aria-label="Tempo de la melodía"></label><label>Transportar <select id="melodyTranspose" aria-label="Transportar melodía y acordes"></select></label><label>Fraseo <select id="melodySwing" aria-label="Fraseo de corcheas"><option value="straight">Rectas</option><option value="swing">Swing 2:1</option></select></label><label><input id="melodyMetro" type="checkbox">Metrónomo</label><input id="melodySeek" type="range" min="0" max="1" step="0.01" value="0" aria-label="Posición de la melodía"><output id="melodyClock">0:00 / 0:00</output></div>
 <div class="melody-comparison"><div class="melody-original" id="melodyPhotoView"><h3>Partitura de referencia</h3><label id="melodyReferencePicker">Página <select id="melodyReferencePage" aria-label="Página de la partitura de referencia"></select></label><p id="melodyReferenceNotice" class="melody-source-help"></p><label>Ampliación <select id="melodySourceZoom"><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option></select></label><div id="melodyOriginal" class="melody-paper"></div></div><div class="melody-output" id="melodyDigitalView"><div id="melodyScore"></div></div></div>
 <div class="melody-exports"><button id="melodyMidi" type="button" disabled>MIDI</button><button id="melodyXml" type="button" disabled>MusicXML · Dorico / MuseScore</button><button id="melodyPdf" type="button" disabled>PDF</button><label id="melodyPagePicker" hidden>Página <select id="melodyPage" aria-label="Página para exportar imagen"></select></label><button id="melodyPng" type="button" disabled>Imagen PNG</button><button id="melodySvg" type="button" disabled>Imagen SVG</button></div>
`;
 document.querySelector('main.workspace').before(panel);
 // Reuse the SVG transport shapes from Piano Virtual's MusicXML controls.
 const icons={play:'<polygon points="5 3 19 12 5 21 5 3"/>',pause:'<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>',stop:'<rect x="5" y="5" width="14" height="14"/>',prev:'<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>',next:'<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',loop:'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>'};
 const svgIcon=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>`;
 function transportButton(id,label,icon){const button=document.createElement('button');button.id=id;button.type='button';button.className='melody-icon';button.disabled=true;button.title=label;button.setAttribute('aria-label',label);button.innerHTML=icons[icon]?svgIcon(icon):icon;return button;}
 const sticky=document.createElement('div');sticky.className='melody-sticky';const head=panel.querySelector('.melody-head'),themeControls=panel.querySelector('.melody-controls'),transport=panel.querySelectorAll('.melody-controls')[1];
 transport.className='melody-transport';panel.prepend(sticky);sticky.append(head,themeControls);head.append(transport);
 for(const [id,icon,label]of [['melodyPlay','play','Reproducir melodía'],['melodyStop','stop','Detener melodía']]){const button=$(id);button.classList.add('melody-icon');button.innerHTML=svgIcon(icon);button.title=label;button.setAttribute('aria-label',label);}
 transport.prepend(transportButton('melodyPrev','Compás anterior','prev'));$('melodyStop').after(transportButton('melodyNext','Compás siguiente','next'),transportButton('melodyLoopA','Marcar inicio del bucle en este compás','A'),transportButton('melodyLoopB','Marcar final del bucle en este compás','B'),transportButton('melodyLoop','Activar bucle','loop'));
 $('melodyLoop').setAttribute('aria-pressed','false');
 const guideButton=transportButton('melodyGuideTones','Tone Guide: tonos guía en clave de fa','Tone Guide');guideButton.setAttribute('aria-pressed','false');transport.append(guideButton);let guideEnabled=false,analysisVisible=false;
 $('melodyTempo').parentElement.firstChild.textContent='BPM ';
 const settings=document.createElement('details');settings.className='melody-play-settings';settings.innerHTML=`<summary aria-label="Ajustes de reproducción" title="Transporte, swing, metrónomo y bucle">${svgIcon('settings')}</summary><div class="melody-settings-panel"><strong>Reproducción y práctica</strong><div class="melody-settings-options"></div><fieldset><legend>Bucle por compases, incluidos ambos extremos</legend><label>A <select id="melodyLoopStart" aria-label="Compás inicial del bucle"></select></label><label>B <select id="melodyLoopEnd" aria-label="Compás final del bucle"></select></label><p id="melodyLoopInfo">El bucle sigue las repeticiones escritas. A y B marcan el compás de la posición actual.</p></fieldset></div>`;
 for(const id of ['melodyTranspose','melodySwing','melodyMetro'])settings.querySelector('.melody-settings-options').append($(id).parentElement);transport.append(settings);
 sticky.addEventListener('keydown',event=>{if(event.key===' '&&event.target.closest('button'))event.stopPropagation();});
 document.addEventListener('pointerdown',event=>{if(!settings.contains(event.target))settings.open=false;});
 function playbackButton(active){const button=$('melodyPlay'),label=active?'Pausar melodía':'Reproducir melodía';button.innerHTML=svgIcon(active?'pause':'play');button.title=label;button.setAttribute('aria-label',label);}
 function stickyGeometry(){const palette=document.querySelector('.rhythmPaletteBar'),bottom=(!palette?.hidden?palette?.getBoundingClientRect().bottom:document.querySelector('.topbar')?.getBoundingClientRect().bottom)||28;document.documentElement.style.setProperty('--aac-appbar-bottom',Math.ceil(bottom)+'px');document.documentElement.style.setProperty('--aac-melody-sticky-height',sticky.offsetHeight+'px');}
 const stickyObserver=new ResizeObserver(stickyGeometry);stickyObserver.observe(sticky);stickyObserver.observe(document.querySelector('.rhythmPaletteBar'));
 const fileMenu=document.querySelector('.appMenuPanel');const exports=panel.querySelector('.melody-exports');exports.classList.add('melody-file-exports');const exportHeading=document.createElement('strong');exportHeading.textContent='Exportar melodía y análisis';exports.prepend(exportHeading);fileMenu.append(exports);
 panel.insertAdjacentHTML('beforeend',`<dialog id="melodyEditDialog"><form method="dialog"><h3>Acordes y análisis de esta partitura</h3><p>Los cambios se guardan en AAC y se reflejan en la partitura. La melodía permanece intacta.</p><label>Compás <select id="melodyEditMeasure"></select></label><div id="melodyEditFields"></div><button value="cancel">Cerrar</button><button type="button" id="melodyEditSave">Aplicar cambios</button><button type="button" id="melodyAutoAnalyze">Autoanalizar toda la partitura</button><p id="melodyEditStatus" role="status"></p></form></dialog>`);
 panel.querySelector('.melody-file').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();$('melodyImport').click();}});
 window.AACMelodyInstruments?.mount(panel);
 const workspace=document.querySelector('main.workspace');workspace.id='aacAnalysisWorkspace';
 const chartHeading=document.createElement('div');chartHeading.className='melody-chart-heading';chartHeading.hidden=true;workspace.prepend(chartHeading);
 const launch=document.createElement('button');launch.type='button';launch.id='melodyViewToggle';launch.className='melody-launch';launch.textContent='Melodía';launch.setAttribute('aria-controls','melodyDigitalView');launch.title='Mostrar u ocultar la partitura digital reproducible';
 const photoToggle=document.createElement('button');photoToggle.type='button';photoToggle.id='melodyPhotoToggle';photoToggle.className='melody-launch';photoToggle.textContent='Partitura';photoToggle.setAttribute('aria-controls','melodyPhotoView');photoToggle.title='Mostrar u ocultar la foto de referencia del libro';
 const chartToggle=document.createElement('button');chartToggle.type='button';chartToggle.className='melody-launch melody-chart-toggle';chartToggle.textContent='Análisis';chartToggle.setAttribute('aria-controls',workspace.id);chartToggle.title='Mostrar u ocultar el lienzo de análisis del tema seleccionado';
 let viewState={score:true,photo:false,chart:false};
 function setViews(score,photo,chart){
  viewState={score,photo,chart};document.querySelector('.rhythmPaletteBar').hidden=!chart;panel.hidden=!(score||photo||(chart&&current));workspace.hidden=!chart;
  $('melodyDigitalView').hidden=!score;$('melodyPhotoView').hidden=!photo;
  panel.querySelector('.melody-comparison').hidden=!score&&!photo;
  panel.querySelector('.melody-comparison').classList.toggle('melody-single-view',!(score&&photo));
  for(const [button,shown]of [[launch,score],[photoToggle,photo],[chartToggle,chart]]){button.setAttribute('aria-expanded',String(shown));button.setAttribute('aria-pressed',String(shown));}
  if(panel.hidden){if(playing)position=now();stop(false);}stickyGeometry();
 }
 launch.addEventListener('click',()=>setViews(!viewState.score,viewState.photo,viewState.chart));
 photoToggle.addEventListener('click',()=>setViews(viewState.score,!viewState.photo,viewState.chart));
 chartToggle.addEventListener('click',()=>setViews(viewState.score,viewState.photo,!viewState.chart));
 document.querySelector('.appMenuBar').append(launch,photoToggle,chartToggle);
 for(const [button,shown]of [[launch,true],[photoToggle,false],[chartToggle,false]]){button.setAttribute('aria-expanded',String(shown));button.setAttribute('aria-pressed',String(shown));}
 for(let i=-12;i<=12;i++)$('melodyTranspose').add(new Option(i===0?'Tonalidad original':`${i>0?'+':''}${i} semitonos`,String(i)));$('melodyTranspose').value='0';
 let scoreXml='',analysisSignature='',cursorBeat=-1;let catalog=[],referenceIndex=window.AACMelodyReferences.createIndex([]),current=null,xml='',timeline=null,osmd=null,renderToken=0,localExport=false,playing=false,position=0,started=0,playToken=0,raf=0,ctx=null,cache=new Map(),nodes=new Set(),activeVisit=-1,linked=false,loopEnabled=false,activeLoop=null,schedulerTimer=0;
 const librarySearch=window.AACMelodyLibrarySearch.mount({input:$('melodySearch'),list:$('melodySearchResults'),status:$('melodySearchStatus'),select:$('melodyExample')});
 const drafts=window.AACMelodyWorkspaces.createStore();let selectionToken=0,workspaceTimer=0,activationQueue=Promise.resolve();
 const fmt=n=>`${Math.floor(Math.max(0,n)/60)}:${String(Math.floor(Math.max(0,n)%60)).padStart(2,'0')}`;
 const status=(message,error=false)=>{if(error&&message)window.alert(message);};
 const save=(data,name,type)=>{const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
 const filename=()=>`${(current?.title||'Melodía').replace(/[\\/:*?"<>|]/g,' ').trim()} - AAC`;
 function showReferencePage(){
  const host=$('melodyOriginal'),path=$('melodyReferencePage').value;host.replaceChildren();delete host.dataset.referenceImage;
  if(!window.AACMelodyReferences.safeImage(path)){host.textContent='No hay una foto de referencia vinculada a este tema. La melodía digital y el análisis siguen disponibles.';return;}
  host.dataset.referenceImage=path;const img=new Image();img.alt=`Partitura de referencia de ${current.title}`;img.src=path;img.style.width=(100*+$('melodySourceZoom').value)+'%';img.onerror=()=>{if(!img.isConnected)return;host.textContent='La imagen de referencia no está disponible en esta ubicación.';};host.append(img);
 }
 function showSource(){
  const picker=$('melodyReferencePage'),old=picker.dataset.theme===current?.id?picker.value:'';picker.replaceChildren();picker.dataset.theme=current?.id||'';
  const edition=catalog.find(e=>e.id===current?.id)||current,match=referenceIndex(edition),pages=[],seen=new Set();
  if(window.AACMelodyReferences.safeImage(current?.sourceImage))pages.push({image:current.sourceImage,label:`Fuente revisada · ${current.sourceBook||current.title} · pág. ${current.printedPage||''}`});
  for(const ref of match.references)for(const page of ref.pages)if(window.AACMelodyReferences.safeImage(page.image))pages.push({image:page.image,label:`${ref.title} · ${ref.sourceFile} · pág. ${page.printedPage}`});
  if(match.ambiguous&&!current?.sourceImage)picker.add(new Option('Selecciona la referencia por título / edición',''));
  for(const page of pages){if(seen.has(page.image))continue;seen.add(page.image);picker.add(new Option(page.label,page.image));}
  if([...picker.options].some(o=>o.value===old))picker.value=old;
  $('melodyReferencePicker').hidden=pages.length<2&&!match.ambiguous;
  $('melodyReferenceNotice').textContent=current?.sourceImage?'Fuente contrastada para esta edición.':match.ambiguous?'Hay títulos o compositores coincidentes. Selecciona la referencia y comprueba que corresponde a esta obra.':pages.length?'Referencia del libro por coincidencia de título. Puede diferir en tonalidad, forma o arreglo respecto a la melodía digital.':'No hay una coincidencia identificada en los dos libros aportados.';
  showReferencePage();
 }
 $('melodyReferencePage').onchange=showReferencePage;
 function payload(){return {...current,xml:scoreXml,swing:$('melodySwing').value==='swing',originalXml:current.originalXml||xml,transpose:+$('melodyTranspose').value||0,practiceStart:selectedMeasure(),loopStartMeasure:+$('melodyLoopStart').value||0,loopEndMeasure:+$('melodyLoopEnd').value||0,loopEnabled,harmonyMode:current.harmonyMode||'original',tempo:+$('melodyTempo').value||120};}
 function persist(){window.CrescendoAACMelodyBridge?.setMelody(payload());queueWorkspaceSave();}
 function queueWorkspaceSave(){if(current)drafts.save(window.CrescendoAACMelodyBridge.captureWorkspace());}
 async function stashWorkspace(){clearTimeout(workspaceTimer);if(current)await drafts.save(window.CrescendoAACMelodyBridge.captureWorkspace());}
 function refreshChartHeading(){const info=window.CrescendoAACMelodyBridge.getDocumentInfo();chartHeading.hidden=!current;chartHeading.textContent='Análisis separado · '+info.title;}
 async function display(value,{store=true,keepPosition=false}={}){
  const previousPosition=keepPosition&&timeline?now():0;const token=++renderToken;stop();position=previousPosition;const parsed=Core.info(value.xml);current={...value,title:value.title||parsed.title};setViews(viewState.score,viewState.photo,viewState.chart);scoreXml=value.xml;xml=value.xml;linked=!!value.linked;const harmonyMode=value.harmonyMode||(linked?'study':'original');current.harmonyMode=harmonyMode;const showAnalysis=analysisVisible&&linked&&harmonyMode==='study';$('melodyLink').setAttribute('aria-pressed',String(showAnalysis));$('melodyLink').textContent=showAnalysis?'Ocultar análisis armónico':'Mostrar análisis armónico';if(harmonyMode==='original')xml=Core.edit(current.originalXml||scoreXml,{transpose:value.transpose||0,bpm:value.tempo||null});$('melodySwing').value=value.swing?'swing':'straight';const manualBreaks=value[harmonyMode==='study'?'studyBreaks':'originalBreaks']||null;const rows=window.CrescendoAACMelodyBridge?.getAnalysis()||[];analysisSignature=JSON.stringify(rows);if(linked&&harmonyMode==='study')xml=Core.annotate(scoreXml,rows,showAnalysis);xml=Core.layoutScore(xml,showAnalysis?rows:[],$('melodyScore').clientWidth||720,false,manualBreaks);if(guideEnabled){const practice=window.AACGuideTones.add(xml,Core);xml=practice.xml;$('melodyScore').dataset.omittedGuideTones=String(practice.omitted);}xml=Core.performance(xml,!!value.swing);timeline=Core.swingTimeline(CrescendoMusicXML.parse(xml),!!value.swing);$('melodyScore').dataset.playbackRoute=JSON.stringify(timeline.visits.map(visit=>visit.index));$('melodyScore').dataset.playbackAttacks=String(timeline.events.length);cursorBeat=-1;activeVisit=-1;window.AACMelodyInstruments?.setTimeline(timeline,parsed.fifths);practiceControls(value);if(!keepPosition)position=timeline.visits.find(v=>v.index===value.practiceStart)?.start||0;position=Math.min(position,timeline.duration);
  $('melodyTitle').textContent=current.title;librarySearch.sync(current.title);$('melodyExample').value=catalog.some(row=>row.id===current.id)?current.id:'';$('melodyTranspose').value=String(value.transpose||0);$('melodyTempo').value=value.tempo||timeline.baseTempo;
  showSource();
  const host=$('melodyScore');host.replaceChildren();const display=new opensheetmusicdisplay.OpenSheetMusicDisplay(host,{backend:'svg',autoResize:false,drawTitle:true,drawSubtitle:false,drawComposer:false,drawMetronomeMarks:false,newSystemFromXML:true,drawingParameters:'default',cursorsOptions:[{type:0,color:'#ef8500',alpha:.9,follow:false}]});osmd=display;const visualXML=Core.layoutScore(xml,showAnalysis?rows:[],$('melodyScore').clientWidth||720,true,manualBreaks);host.dataset.systemStarts=JSON.stringify([...Core.document(visualXML).querySelector('part').children].filter(n=>n.localName==='measure').flatMap((m,i)=>i===0||m.querySelector('print[new-system="yes"]')?[i]:[]));host.dataset.visualFirstMeasure=new XMLSerializer().serializeToString(Core.document(visualXML).querySelector('part > measure'));await display.load(visualXML);if(token!==renderToken)return;display.Zoom=.9;Object.assign(display.EngravingRules,{MinimumDistanceBetweenSystems:showAnalysis?16:7,MinSkyBottomDistBetweenSystems:showAnalysis?10:5,PageTopMargin:1,TitleTopDistance:0,TitleBottomDistance:showAnalysis?9:2});display.render();
  if(manualBreaks){
   const desired=[...new Set([0,...manualBreaks])].filter(n=>n<parsed.bars).sort((a,b)=>a-b),same=()=>JSON.stringify(window.AACMelodyScoreView.systemStarts(display))===JSON.stringify(desired);
   while(!same()&&display.Zoom>.55){display.Zoom=Math.max(.55,Math.round((display.Zoom-.05)*100)/100);display.render();}
   host.dataset.layoutWarning=same()?'':'La línea está demasiado llena para esa distribución. Mueve menos compases o restablece la distribución automática.';
  }else delete host.dataset.layoutWarning;
  host.dataset.notationZoom=String(display.Zoom);window.AACMelodyScoreView.build(display,timeline,harmonyMode==='study'&&linked?rows:Core.harmony(xml).map((r,i)=>({page:0,measure:i,slots:r.chords.map((c,j)=>({chord:c.symbol,beat:c.beat,index:j}))})),host,{...parsed,showAnalysis:showAnalysis});
  $('melodyPage').replaceChildren();host.querySelectorAll('svg').forEach((svg,index)=>$('melodyPage').add(new Option(String(index+1),String(index))));$('melodyPagePicker').hidden=$('melodyPage').options.length<=1;$('melodyPage').disabled=$('melodyPage').options.length<=1;
  for(const id of ['melodyPlay','melodyStop','melodyPrev','melodyNext','melodyLoop','melodyLoopA','melodyLoopB','melodyLink','melodyHarmony','melodyMidi','melodyXml','melodyPdf','melodyPng','melodySvg'])$(id).disabled=false;
  guideButton.disabled=false;update();refreshChartHeading();if(store)persist();status(timeline.warnings.length?timeline.warnings.join(' '):'');
 }
 guideButton.onclick=attempt(async()=>{if(!current)return;guideEnabled=!guideEnabled;guideButton.setAttribute('aria-pressed',String(guideEnabled));await display(payload(),{keepPosition:true});status('');});
 function stop(reset=true){clearInterval(schedulerTimer);playToken++;playing=false;cancelAnimationFrame(raf);for(const n of nodes)try{n.stop();}catch{}nodes.clear();if(reset)position=loopEnabled&&timeline?practiceRange().start:0;activeLoop=null;playbackButton(false);update();if(timeline)status(reset?'Reproducción detenida.':'Reproducción en pausa.');}
 function audibleTime(){const stamp=ctx.getOutputTimestamp?.();if(stamp?.contextTime>0&&stamp.performanceTime>0)return Math.min(ctx.currentTime,stamp.contextTime+Math.max(0,performance.now()-stamp.performanceTime)/1000);return Math.max(0,ctx.currentTime-(ctx.outputLatency||ctx.baseLatency||0));}
 function now(){return playing?window.AACMelodyPractice.clock(timeline.duration,position,audibleTime()-started,activeLoop):position;}
 function update(follow=playing){if(!timeline)return;const value=now(),frame=Core.frameAt(timeline,value);window.AACMelodyInstruments?.update(timeline,value,playing,frame);window.AACMelodyScoreView?.update(frame,follow);$('melodyScore').dataset.loopCycle=activeLoop?String(Math.max(0,Math.floor((position+Math.max(0,audibleTime()-started)-activeLoop.start)/(activeLoop.end-activeLoop.start)))):'0';$('melodySeek').max=timeline.duration||1;$('melodySeek').value=value;$('melodyClock').textContent=`${fmt(value)} / ${fmt(timeline.duration)}`;}
 function selectedMeasure(){return timeline?(Core.frameAt(timeline,now())?.measure??0):0;}
 function practiceRange(){return window.AACMelodyPractice.range(timeline,+$('melodyLoopStart').value,+$('melodyLoopEnd').value);}
 function loopUI(){const a=$('melodyLoopStart'),b=$('melodyLoopEnd');$('melodyLoop').setAttribute('aria-pressed',String(loopEnabled));$('melodyLoop').title=(loopEnabled?'Desactivar':'Activar')+` bucle · ${a.selectedOptions[0]?.textContent||''} – ${b.selectedOptions[0]?.textContent||''}`;$('melodyLoop').setAttribute('aria-label',loopEnabled?'Desactivar bucle':'Activar bucle');$('melodyLoopA').title='Marcar inicio del bucle · actual: '+(a.selectedOptions[0]?.textContent||'');$('melodyLoopB').title='Marcar final del bucle · actual: '+(b.selectedOptions[0]?.textContent||'');}
 function practiceControls(value){
  const measures=[...Core.document(xml).querySelector('part').children].filter(n=>n.localName==='measure');
  for(const id of ['melodyLoopStart','melodyLoopEnd']){$(id).replaceChildren();measures.forEach((m,i)=>$(id).add(new Option(m.getAttribute('implicit')==='yes'?'Anacrusa':String(m.getAttribute('number')||i+1),String(i))));}
  $('melodyLoopStart').value=String(Math.min(measures.length-1,value.loopStartMeasure||0));$('melodyLoopEnd').value=String(Math.min(measures.length-1,value.loopEndMeasure??measures.length-1));
  if(+$('melodyLoopEnd').value<+$('melodyLoopStart').value)$('melodyLoopEnd').value=$('melodyLoopStart').value;loopEnabled=!!value.loopEnabled;loopUI();
 }
 function seekTo(value,resume=false,follow=false){stop(false);position=Math.max(0,Math.min(timeline.duration,value));if(loopEnabled){const range=practiceRange();if(position<range.start||position>=range.end){loopEnabled=false;loopUI();}}update(follow);if(resume)play();}
 function navigateMelodyNote(event){
  if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!timeline||panel.hidden||!viewState.score)return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="combobox"],[role="menu"],[role="listbox"],dialog,[aria-modal="true"],.appMenu,.reharmonizationMenu,#aacAnalysisWorkspace'))return;
  event.preventDefault();event.stopImmediatePropagation();
  const target=window.AACMelodyPractice.notePosition(timeline,now(),event.key==='ArrowRight'?1:-1);
  if(target!==null)seekTo(target,false,true);
 }
 document.addEventListener('keydown',navigateMelodyNote,true);
 window.AACMelodyMeasureSelected=index=>{if(!timeline)return;const visit=timeline.visits.find(v=>v.index===index);if(visit){seekTo(visit.start,false,true);persist();}};
 function changeLoop(){if(!timeline)return;const resume=playing,value=now();stop(false);position=value;loopUI();persist();if(resume)play();}
 async function loadPiano(){if(window.MIDI?.Soundfont?.acoustic_grand_piano)return;await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/acoustic_grand_piano.js';script.onload=resolve;script.onerror=()=>reject(Error('No se encontró el piano de la biblioteca.'));document.head.append(script);});}
 async function sample(midi){if(cache.has(midi))return cache.get(midi);const names=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],map=window.MIDI?.Soundfont?.acoustic_grand_piano||{},name=names[midi%12]+(Math.floor(midi/12)-1),data=map[name];if(!data)throw Error('No está disponible la muestra de piano para esta nota.');const raw=atob(data.split(',')[1]),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const promise=ctx.decodeAudioData(bytes.buffer);cache.set(midi,promise);return promise;}
 function scheduleWindow(from,to,origin,buffers){
  for(const event of window.AACMelodyPractice.clip(timeline.events,from,to)){
   const source=ctx.createBufferSource(),gain=ctx.createGain(),at=origin+event.start-from,end=at+event.dur;source.buffer=buffers.get(event.midi);source.connect(gain);gain.connect(ctx.destination);gain.gain.setValueAtTime(.65,at);gain.gain.setValueAtTime(.65,Math.max(at,end-.02));gain.gain.linearRampToValueAtTime(0,end);source.start(at);source.stop(end+.001);nodes.add(source);source.onended=()=>{nodes.delete(source);source.disconnect();gain.disconnect();};
  }
  if($('melodyMetro').checked)for(const click of timeline.clicks){if(click.time<from-1e-9||click.time>=to-1e-9)continue;const oscillator=ctx.createOscillator(),gain=ctx.createGain(),time=origin+click.time-from;oscillator.frequency.value=click.accent?1300:900;gain.gain.setValueAtTime(.12,time);gain.gain.exponentialRampToValueAtTime(.001,time+.035);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(time);oscillator.stop(Math.min(time+.04,origin+to-from));nodes.add(oscillator);oscillator.onended=()=>{nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};}
 }
 async function play(){
  if(!timeline)return;if(playing){position=now();stop(false);return;}
  if(position>=timeline.duration)position=0;
  const token=++playToken;
  try{
   activeLoop=loopEnabled?practiceRange():null;if(activeLoop&&(position<activeLoop.start||position>=activeLoop.end))position=activeLoop.start;
   ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();status('Preparando piano local…');await loadPiano();
   const interval=activeLoop||{start:position,end:timeline.duration},pitches=[...new Set(window.AACMelodyPractice.clip(timeline.events,interval.start,interval.end).map(n=>n.midi))],buffers=new Map(await Promise.all(pitches.map(async midi=>[midi,await sample(midi)])));
   if(token!==playToken)return;playing=true;started=ctx.currentTime+.06;
   const scheduler=window.AACMelodyPractice.scheduler({duration:timeline.duration,position,origin:started,loop:activeLoop,lookAhead:1.5,schedule:(from,to,at)=>scheduleWindow(from,to,at,buffers)});
   schedulerTimer=setInterval(()=>{if(playing)scheduler.fill(ctx.currentTime);},100);playbackButton(true);status(activeLoop?`Bucle activo · compases ${$('melodyLoopStart').selectedOptions[0].textContent} a ${$('melodyLoopEnd').selectedOptions[0].textContent}.`:'Reproduciendo la melodía de esta partitura.');
   const tick=()=>{if(!playing)return;scheduler.fill(ctx.currentTime);update();if(!activeLoop&&now()>=timeline.duration){stop();return;}raf=requestAnimationFrame(tick);};tick();
  }catch(error){stop(false);status(error.message,true);}
 }
 async function native(format){const response=await fetch('/api/aac-melody/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({musicxml:xml,format})});if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(error.error||'No se pudo exportar. Inicia el puente local del piloto.');}save(await response.blob(),filename()+'.'+format,format==='pdf'?'application/pdf':'application/octet-stream');}
 async function image(format){const svg=$('melodyScore').querySelectorAll('svg')[+$('melodyPage').value||0];if(!svg)throw Error('No hay una página renderizada.');const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.querySelectorAll('.aac-note-cursor,.aac-measure-target,.aac-chord-target').forEach(n=>n.remove());const data=new XMLSerializer().serializeToString(clone);if(format==='svg'){save(data,filename()+` - página ${+$('melodyPage').value+1}.svg`,'image/svg+xml');return;}const url=URL.createObjectURL(new Blob([data],{type:'image/svg+xml'}));try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('No se pudo convertir la página a PNG.'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=img.naturalWidth*2;canvas.height=img.naturalHeight*2;const c=canvas.getContext('2d');c.fillStyle='white';c.fillRect(0,0,canvas.width,canvas.height);c.drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('No se pudo generar la imagen.');save(blob,filename()+` - página ${+$('melodyPage').value+1}.png`,'image/png');}finally{URL.revokeObjectURL(url);}}
 function attempt(fn){return async()=>{try{await fn();}catch(error){status(error.message,true);}};}
 $('melodyPlay').onclick=play;$('melodyStop').onclick=()=>stop();$('melodySourceZoom').onchange=showReferencePage;
 $('melodySeek').addEventListener('input',()=>{seekTo(+$('melodySeek').value,playing);});
 $('melodyPrev').onclick=()=>window.AACMelodyMeasureSelected(Math.max(0,selectedMeasure()-1));$('melodyNext').onclick=()=>window.AACMelodyMeasureSelected(Math.min(Core.info(xml).bars-1,selectedMeasure()+1));
 $('melodyLoop').onclick=()=>{loopEnabled=!loopEnabled;changeLoop();};
 $('melodyLoopA').onclick=()=>{$('melodyLoopStart').value=String(selectedMeasure());if(+$('melodyLoopEnd').value<+$('melodyLoopStart').value)$('melodyLoopEnd').value=$('melodyLoopStart').value;changeLoop();};
 $('melodyLoopB').onclick=()=>{$('melodyLoopEnd').value=String(selectedMeasure());if(+$('melodyLoopStart').value>+$('melodyLoopEnd').value)$('melodyLoopStart').value=$('melodyLoopEnd').value;changeLoop();};
 $('melodyLoopStart').onchange=()=>{if(+$('melodyLoopEnd').value<+$('melodyLoopStart').value)$('melodyLoopEnd').value=$('melodyLoopStart').value;changeLoop();};$('melodyLoopEnd').onchange=()=>{if(+$('melodyLoopStart').value>+$('melodyLoopEnd').value)$('melodyLoopStart').value=$('melodyLoopEnd').value;changeLoop();};
 $('melodyMetro').onchange=()=>{if(playing){position=now();stop(false);play();}};
 for(const id of ['melodyTempo','melodyTranspose'])$(id).onchange=attempt(async()=>{if(!current)return;const transpose=+$('melodyTranspose').value,bpm=+$('melodyTempo').value;const delta=transpose-(current.transpose||0),base=current.linked?Core.annotate(scoreXml,window.CrescendoAACMelodyBridge.getAnalysis(),false):scoreXml,next=Core.edit(base,{transpose:delta,bpm});await display({...payload(),xml:next,transpose,tempo:bpm,linked:delta===0&&current.linked,swing:$('melodySwing').value==='swing'});if(delta)status('Partitura transportada. El análisis anterior queda separado; carga la armonía transportada y vuelve a analizar para vincularla.');});
 function activateMelody(example,musicxml){const token=++selectionToken;activationQueue=activationQueue.catch(()=>{}).then(()=>activateMelodyNow(example,musicxml,token));return activationQueue;}
 async function activateMelodyNow(example,musicxml,token){
  if(token!==selectionToken)return;
  panel.classList.add('melody-loading');workspace.classList.add('melody-loading');panel.setAttribute('aria-busy','true');workspace.setAttribute('aria-busy','true');
  try{delete panel.dataset.loadedMelody;stop(false);await stashWorkspace();analysisVisible=false;
  if(!musicxml){const response=await fetch(example.musicxml);if(!response.ok)throw Error('No se encontró la partitura del ejemplo.');musicxml=await response.text();}
  const value={...example,xml:musicxml,originalXml:musicxml,transpose:0,tempo:example.tempo,swing:example.swing??['c-jam-blues','autumn-leaves','all-of-me'].includes(example.id),harmonyMode:'original',linked:true};
  const draft=await drafts.load(value);if(token!==selectionToken)return;
  if(draft)await window.CrescendoAACMelodyBridge.restoreWorkspace(window.AACMelodyWorkspaces.withEditionMetadata(draft,value));
  else await window.CrescendoAACMelodyBridge.loadHarmony(Core.harmony(musicxml),Core.info(musicxml),value);
  if(token!==selectionToken)return;
  await display(window.CrescendoAACMelodyBridge.getMelody(),{store:false});await drafts.save(window.CrescendoAACMelodyBridge.captureWorkspace());
  try{localStorage.setItem('aac:last-melody-id',current.id);}catch{}
  status('');panel.dataset.loadedMelody=current.id;
  }catch(error){$('melodyExample').value=current?.id||'';librarySearch.sync(current?.title||'');throw error;}finally{panel.classList.remove('melody-loading');workspace.classList.remove('melody-loading');panel.removeAttribute('aria-busy');workspace.removeAttribute('aria-busy');}
 }
 $('melodyExample').onchange=attempt(async()=>{const example=catalog.find(row=>row.id===$('melodyExample').value);if(example){status('Abriendo el tema y su análisis…');await activateMelody(example);}});
 $('melodyImport').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>4*1024*1024)throw Error('El MusicXML supera 4 MB');const imported=await window.CrescendoScoreFile.read(file),musicxml=imported.content,info=Core.info(musicxml);await activateMelody({id:'imported',title:info.title,composer:info.composer},musicxml);}catch(error){status(error.message,true);}finally{event.target.value='';}};
 $('melodyHarmony').onclick=attempt(async()=>{if(!current)return;const ok=await window.CrescendoAACMelodyBridge?.loadHarmony(Core.harmony(Core.edit(current.originalXml||scoreXml,{transpose:current.transpose||0,bpm:current.tempo||null})),Core.info(xml),{...payload(),harmonyMode:'study'});if(ok){linked=true;current.linked=true;current.harmonyMode='study';persist();status('Versión de estudio creada. Haz clic en un acorde de la partitura para cambiarlo.');}});
 $('melodyXml').onclick=()=>save(xml,filename()+'.musicxml','application/vnd.recordare.musicxml+xml');$('melodyMidi').onclick=attempt(()=>save(Core.midi(timeline,{meter:Core.info(xml).meter,title:current.title}),filename()+'.mid','audio/midi'));
 $('melodyPdf').onclick=attempt(async()=>{if(localExport){status('Generando PDF…');await native('pdf');status('PDF exportado.');}else{document.body.classList.add('aac-melody-print');window.print();}});window.addEventListener('afterprint',()=>document.body.classList.remove('aac-melody-print'));
 $('melodyPng').onclick=attempt(()=>image('png'));$('melodySvg').onclick=attempt(()=>image('svg'));window.addEventListener('pagehide',()=>stop());
 window.addEventListener('aac:document-rendered',event=>{refreshChartHeading();queueWorkspaceSave();const value=event.detail.melody;if(value?.xml&&(value.xml!==scoreXml||JSON.stringify(window.CrescendoAACMelodyBridge.getAnalysis())!==analysisSignature||value.linked!==current?.linked||value.transpose!==current?.transpose||value.tempo!==current?.tempo||value.harmonyMode!==current?.harmonyMode||value.practiceStart!==current?.practiceStart||value.loopEnabled!==current?.loopEnabled||value.loopStartMeasure!==current?.loopStartMeasure||value.loopEndMeasure!==current?.loopEndMeasure||JSON.stringify(value.originalBreaks)!==JSON.stringify(current?.originalBreaks)||JSON.stringify(value.studyBreaks)!==JSON.stringify(current?.studyBreaks))){display(value,{store:false}).catch(error=>status(error.message,true));}else if(!value&&current){stop();current=null;xml='';timeline=null;chartHeading.hidden=true;setViews(false,false,true);showSource();window.AACMelodyInstruments?.setTimeline(null);$('melodyTitle').textContent='Selecciona una melodía';$('melodyScore').replaceChildren();$('melodyPage').replaceChildren();$('melodyPagePicker').hidden=true;$('melodyPage').disabled=true;for(const id of ['melodyPlay','melodyStop','melodyPrev','melodyNext','melodyLoop','melodyLoopA','melodyLoopB','melodyLink','melodyHarmony','melodyMidi','melodyXml','melodyPdf','melodyPng','melodySvg'])$(id).disabled=true;}});

 $('melodySwing').onchange=attempt(()=>display({...payload(),swing:$('melodySwing').value==='swing'}));
 async function toggleScoreAnalysis(){
  if(!current)return;
  if(analysisVisible&&current.linked&&current.harmonyMode==='study'){
   analysisVisible=false;await display(payload(),{keepPosition:true});return;
  }
  const actual=window.CrescendoAACMelodyBridge.getDocumentInfo();
  if(!window.AACMelodyWorkspaces.matches({document:{title:actual.title,melody:{...payload(),linked:true}}},payload()))throw Error('El análisis abierto corresponde a otro tema. Selecciona el análisis de '+current.title+' o crea un estudio desde el original.');
  Core.annotate(scoreXml,window.CrescendoAACMelodyBridge.getAnalysis(),false);
  analysisVisible=true;
  try{await display({...payload(),linked:true,harmonyMode:'study'},{keepPosition:true});}catch(error){analysisVisible=false;throw error;}
 }
 $('melodyLink').onclick=attempt(toggleScoreAnalysis);
 function editFields(){const row=window.CrescendoAACMelodyBridge.getAnalysis()[+$('melodyEditMeasure').value];$('melodyEditFields').replaceChildren();for(const slot of row?.slots||[]){if(!slot.chord)continue;const group=document.createElement('fieldset');group.dataset.slot=slot.index;const legend=document.createElement('legend');legend.textContent=`Tiempo ${slot.beat+1} · ${slot.chord}`;group.append(legend);for(const [field,title]of [['chord','Acorde'],['degree','Grado / función'],['mode','Modo'],['sectionLabel','Tonalidad'],['originScale','Escala de origen']]){const label=document.createElement('label');label.textContent=title;const input=document.createElement('input');input.dataset.field=field;input.value=slot[field]||'';label.append(input);group.append(label);}$('melodyEditFields').append(group);}}
 $('melodyEditMeasure').onchange=editFields;
 $('melodyEdit').onclick=attempt(()=>{if(!current?.linked)throw Error('Vincula primero el análisis actual o carga la armonía de esta edición.');const measures=Core.document(scoreXml).querySelector('part').querySelectorAll('measure');$('melodyEditMeasure').replaceChildren();measures.forEach((m,i)=>$('melodyEditMeasure').add(new Option(`Compás ${m.getAttribute('number')}`,String(i))));const first=window.CrescendoAACMelodyBridge.getAnalysis().findIndex(r=>r.slots.some(s=>s.chord));$('melodyEditMeasure').value=String(Math.max(0,first));editFields();$('melodyEditDialog').showModal();});
 $('melodyAutoAnalyze').onclick=()=>{try{window.CrescendoAACMelodyBridge.analyzeMelody();editFields();$('melodyEditStatus').textContent='Análisis automático actualizado. Puedes corregir sus campos manualmente.';}catch(error){$('melodyEditStatus').textContent=error.message;}};
 $('melodyEditSave').onclick=()=>{try{const row=window.CrescendoAACMelodyBridge.getAnalysis()[+$('melodyEditMeasure').value];for(const group of $('melodyEditFields').children){const values={};for(const input of group.querySelectorAll('input'))values[input.dataset.field]=input.value;if(!window.TonalAnalysis.parseChord(values.chord))throw Error('Revisa el cifrado del acorde.');}for(const group of $('melodyEditFields').children){const values={};for(const input of group.querySelectorAll('input'))values[input.dataset.field]=input.value;window.CrescendoAACMelodyBridge.editAnalysis(row.page,row.measure,+group.dataset.slot,values);}$('melodyEditStatus').textContent='Cambios aplicados a AAC y a la partitura.';}catch(error){$('melodyEditStatus').textContent=error.message;}};

 window.AACMelodyOpenScoreTarget=async(target,event)=>{if(playing)position=now();stop(false);const flat=+target.dataset.sourceMeasure,beat=+target.dataset.sourceBeat,x=event.clientX,y=event.clientY;
  if(current.harmonyMode!=='study'||!current.linked){const source=Core.edit(current.originalXml||scoreXml,{transpose:current.transpose||0,bpm:current.tempo||null});await window.CrescendoAACMelodyBridge.loadHarmony(Core.harmony(source),Core.info(source),{...payload(),harmonyMode:'study',linked:true});}
  const row=window.CrescendoAACMelodyBridge.getAnalysis()[flat],slot=row?.slots.find(s=>Math.abs(s.beat-beat)<1e-6);if(!slot){status('No se encontró el acorde de este compás.',true);return;}
  Object.assign(target.dataset,{kind:'slot',page:String(row.page),measure:String(row.measure),slot:String(slot.index),field:target.dataset.field||'chord'});window.CrescendoAACMelodyBridge.openScoreTarget(target,x,y);
 };

 window.AACMelodyReflow=async(index,direction)=>{
  if(!current)return;const before=payload();
  try{
   const starts=JSON.parse($('melodyScore').dataset.systemStarts||'[0]'),breaks=Core.reflowBreaks(starts,index,direction,Core.info(xml).bars),key=current.harmonyMode==='study'?'studyBreaks':'originalBreaks';
   await display({...before,[key]:breaks},{store:false,keepPosition:true});
   const warning=$('melodyScore').dataset.layoutWarning;
   if(warning){await display(before,{store:false,keepPosition:true});throw Error(warning);}
   persist();window.AACMelodyScoreView.select(index,false);status('Salto ajustado. Se conserva el orden de todos los compases y notas.');
  }catch(error){window.AACMelodyScoreView.select(index,false);status(error.message,true);}
 };
 let resizeTimer=0,lastScoreWidth=0;
 new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width<200||Math.abs(width-lastScoreWidth)<3)return;lastScoreWidth=width;clearTimeout(resizeTimer);resizeTimer=setTimeout(async()=>{if(!current||panel.hidden)return;const resume=playing;try{const rendering=display(payload(),{store:false,keepPosition:true}),expected=playToken;await rendering;if(resume&&playToken===expected)await play();}catch(error){status(error.message,true);}},180);}).observe($('melodyScore'));
 async function openInitialMelody(){
  const existing=window.CrescendoAACMelodyBridge?.getMelody(),example=catalog.find(e=>e.id===DEFAULT_MELODY_ID)||catalog[0];
  if(example){if(existing?.xml)await drafts.save(window.CrescendoAACMelodyBridge.captureWorkspace());await activateMelody(example);}
  else if(existing?.xml)await display(existing,{store:false});
 }
 async function init(){setViews(true,false,false);try{const response=await fetch('Melodías/catalog.json?v=20261125-library-2');if(response.ok){const data=await response.json();catalog=Array.isArray(data.examples)?data.examples:[];$('melodyLibraryCount').textContent='('+catalog.length+')';librarySearch.setCatalog(catalog);for(const example of catalog)$('melodyExample').add(new Option(example.title,example.id));}}catch{}try{const response=await fetch('Melodías/referencias/catalog.json?v=20261125-views-1');if(response.ok){const data=await response.json();referenceIndex=window.AACMelodyReferences.createIndex(data.references||[],catalog);}}catch{}try{const response=await fetch('/api/aac-melody/health');if(response.ok)localExport=!!(await response.json()).nativeExport;}catch{}await openInitialMelody();}

 init().catch(error=>status(error.message,true));
})();
