(function(root){'use strict';
 const singleInstrument=new URLSearchParams(root.location?.search||'').get('workspace')==='metronome';
 const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function search(entries,query){const words=fold(query).trim().split(/\s+/).filter(Boolean);return entries.filter(entry=>words.every(word=>fold(entry.title+' '+(entry.composer||'')).includes(word)));}
 function storageKey(key,single=singleInstrument){return single&&['jml-score-exercise-library-v1','jml-score-canvas-autosave-v1','crescendo-editor-instrument'].includes(key)?'metronome-'+key:key;}
 function assertSingle(data){const systems=data?.systems||[],parts=new Set(systems.map(system=>system.partId||'legacy-'+(system.instrumentId||data.playbackInstrument||'piano')));const sounds=new Set(systems.map(system=>system.instrumentId||data.playbackInstrument||'piano'));if(parts.size>1||sounds.size>1)throw Error('Este proyecto contiene varios instrumentos. Ábrelo en Editor Crescendo o importa una parte como MusicXML.');}
 function assetUrl(path,base){const home=new URL(base),url=new URL(path,home);if(url.origin!==home.origin||!decodeURIComponent(url.pathname).startsWith(decodeURIComponent(home.pathname)+'Melodías/')||! /\.(musicxml|xml|mei|mxl)$/i.test(url.pathname)||url.search||url.hash)throw Error('Ruta de melodía no válida.');return url;}
 function choosePart(doc){
  const parts=[...doc.querySelectorAll('score-partwise > part')];if(parts.length<2)return Promise.resolve(doc);
  return new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.className='arrangement-dialog project-library-dialog';dialog.setAttribute('aria-label','Seleccionar instrumento');
   const form=document.createElement('form');form.className='arrangement-body';const h=document.createElement('h2');h.textContent='Seleccionar instrumento';const p=document.createElement('p');p.textContent='El editor del metrónomo trabaja con un instrumento. Elige la parte que quieres abrir; se conservarán sus pentagramas y voces.';
   const select=document.createElement('select');select.setAttribute('aria-label','Parte de la partitura');parts.forEach((part,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=[...doc.querySelectorAll('part-list > score-part')].find(node=>node.getAttribute('id')===part.getAttribute('id'))?.querySelector('part-name')?.textContent||'Parte '+(index+1);select.append(option);});
   const actions=document.createElement('div');actions.className='arrangement-actions';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';cancel.onclick=()=>dialog.close();const open=document.createElement('button');open.type='submit';open.textContent='Abrir esta parte';actions.append(cancel,open);form.append(h,p,select,actions);dialog.append(form);document.body.append(dialog);
   let result=null;form.onsubmit=event=>{event.preventDefault();const selected=parts[Number(select.value)];parts.filter(part=>part!==selected).forEach(part=>part.remove());[...doc.querySelectorAll('part-list > score-part')].filter(part=>part.getAttribute('id')!==selected.getAttribute('id')).forEach(part=>part.remove());result=doc;dialog.close();};dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('close',()=>{dialog.remove();resolve(result);});dialog.showModal();select.focus();
  });
 }
 async function prepareImport(text){if(!singleInstrument)return text;const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('MusicXML no válido.');const chosen=await choosePart(doc);return chosen?new XMLSerializer().serializeToString(chosen):null;}
 function openLibrary({importFile,base=new URL('../../aac/',document.baseURI),fetchImpl=root.fetch.bind(root)}={}){
  const dialog=document.createElement('dialog');dialog.className='arrangement-dialog melody-library-dialog';dialog.setAttribute('aria-label','Melodías');const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent='Melodías';close.textContent='Cerrar';close.type='button';close.onclick=()=>dialog.close();header.append(title,close);
  const body=document.createElement('div');body.className='arrangement-body';const input=document.createElement('input');input.type='search';input.placeholder='Buscar título o compositor';input.setAttribute('aria-label','Buscar melodía');const status=document.createElement('p');status.setAttribute('role','status');const list=document.createElement('div');list.className='melody-library-results';const more=document.createElement('button');more.type='button';more.textContent='Mostrar más';more.hidden=true;body.append(input,status,list,more);dialog.append(header,body);document.body.append(dialog);dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();input.focus();
  let entries=[],limit=80,busy=false;
  function draw(){const results=search(entries,input.value);list.replaceChildren();status.textContent=results.length+' melodías'+(results.length>limit?' · mostrando '+limit:'');for(const entry of results.slice(0,limit)){const button=document.createElement('button');button.type='button';const name=document.createElement('strong'),credit=document.createElement('span');name.textContent=entry.title;credit.textContent=entry.composer||'';button.append(name,credit);button.disabled=busy;button.onclick=async()=>{if(busy)return;busy=true;draw();status.textContent='Abriendo '+entry.title+'…';try{const url=assetUrl(entry.musicxml,base),response=await fetchImpl(url);if(!response.ok)throw Error('No se pudo descargar la partitura ('+response.status+').');const file=new File([await response.blob()],decodeURIComponent(url.pathname.split('/').at(-1)),{type:'application/xml'});if(await importFile(file))dialog.close();else status.textContent='La apertura se canceló o el archivo no pudo importarse.';}catch(error){status.textContent=error.message;}finally{busy=false;if(dialog.open){list.querySelectorAll('button').forEach(b=>b.disabled=false);input.focus();}}};list.append(button);}more.hidden=results.length<=limit;}
  input.oninput=()=>{limit=80;draw();};more.onclick=()=>{limit+=80;draw();};status.textContent='Cargando biblioteca…';
  fetchImpl(new URL('Melodías/catalog.json',base)).then(response=>{if(!response.ok)throw Error('No se pudo cargar la biblioteca.');return response.json();}).then(catalog=>{entries=(catalog.examples||[]).filter(entry=>entry.title&&entry.musicxml);draw();}).catch(error=>{status.textContent=error.message;});return dialog;
 }
 function download(blob,filename){
  // Start the browser download in the top-level document when this editor is
  // embedded in the metronome; some browser hosts ignore iframe blob links.
  let host=root;
  if(singleInstrument&&root.parent!==root){try{if(root.parent.location.origin===root.location.origin)host=root.parent;}catch{}}
  const url=host.URL.createObjectURL(blob),link=host.document.createElement('a');link.href=url;link.download=filename;host.document.body.append(link);link.click();link.remove();root.setTimeout(()=>host.URL.revokeObjectURL(url),30000);
 }
 function mount({stop}){
  if(!singleInstrument)return;
  document.documentElement.classList.add('is-metronome-editor');document.title='Editor del metrónomo';
  const link=document.querySelector('.ipad-navigation-brand');if(link){link.setAttribute('aria-label','Metrónomo Crescendo');link.href='../../metronomo/';link.target='_top';link.title='Volver al metrónomo';}
  document.getElementById('ipad-nav-instruments')?.remove();document.getElementById('ipad-panel-instruments')?.remove();
  document.querySelectorAll('[data-palette-item="orchestrate-voices"]').forEach(node=>node.remove());
  root.addEventListener('message',event=>{if(event.origin===root.location.origin&&event.source===root.parent&&event.data?.type==='crescendo-metronome-editor-stop')stop();});
 }
 const api={singleInstrument,search,storageKey,assertSingle,assetUrl,prepareImport,openLibrary,download,mount};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreWorkspace=api;
})(typeof window==='undefined'?globalThis:window);
