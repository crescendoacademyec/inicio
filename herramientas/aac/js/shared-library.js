/* One library window, three collections; original analysis storage stays intact. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACSharedLibrary=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const collections=[['melodies','Melodías','score'],['photos','Partituras','photo'],['analysis','Análisis','chart']];
 const composerName=value=>String(value||'').replace(/^\s*\d{4}\s*[-–—:]\s*/,'').trim()||'Compositor no indicado';
 function collectionForViews(views,preferred='melodies'){
  const active=collections.filter(([, ,key])=>views[key]).map(([id])=>id);
  return active.includes(preferred)?preferred:active[0]||preferred;
 }
 function melodiesForReference(catalog,reference,resolve){
  return catalog.filter(entry=>entry.sourceImage&&reference.pages.some(p=>p.image===entry.sourceImage)||(()=>{const match=resolve(entry);return !match.ambiguous&&match.references.some(r=>r.id===reference.id);})());
 }
 function analysisEntries(library,standards,currentFilename,currentStandardFilename){
  return [
   ...library.map(item=>({...item,id:'library:'+item.filename,analysisKind:'library',current:item.filename===currentFilename,canDelete:item.deletable!==false&&item.source!=='static',detail:item.source==='local'?(item.hasStaticBase?'Copia privada':'Guardado privado'):'Análisis incluido'})),
   ...standards.map(item=>({...item,id:'standard:'+(item.curatedFilename||item.filename||item.id),analysisKind:'standard',current:!!currentStandardFilename&&[item.curatedFilename,item.filename].includes(currentStandardFilename),canDelete:false,detail:item.curated||item.standaloneCurated?'Curado AAC':item.kind==='admin-theme'?'Análisis propio':item.kind==='blues'?'Blues precargado':'Standard'}))
  ].sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'es',{sensitivity:'base'}));
 }
 function photoEntries(references,catalog,resolve){
  const composers=new Map(),images=new Map();
  for(const ref of references)for(const page of ref.pages||[]){if(!images.has(page.image))images.set(page.image,[]);images.get(page.image).push(ref.id);}
  for(const entry of catalog){
   if(!entry.composer)continue;
   const match=resolve(entry),ids=new Set([...(images.get(entry.sourceImage)||[]),...(!match.ambiguous?match.references.map(ref=>ref.id):[])]);
   for(const id of ids){if(!composers.has(id))composers.set(id,new Set());composers.get(id).add(entry.composer);}
  }
  return references.map(ref=>({...ref,composer:ref.composer||(composers.get(ref.id)?.size===1?[...composers.get(ref.id)][0]:'')}));
 }
 function mount({dialog,getViews,getCollections,refreshAnalysis,onMelody,onReference,onAnalysis,onDeleteAnalysis}){
  const analysis=dialog.querySelector('.libraryDialogBody'),head=dialog.querySelector('.dialogHead'),tabs=document.createElement('nav');tabs.className='library-collections';tabs.setAttribute('aria-label','Colecciones de la biblioteca');
  const digital=document.createElement('div');digital.className='libraryDigitalBody';digital.hidden=true;
  digital.innerHTML='<section class="librarySection"><div class="librarySectionHead"><h3 id="sharedLibraryTitle"></h3><span id="sharedLibraryCount" class="libraryCount"></span></div><input id="sharedLibrarySearch" class="librarySearchInput" type="search" placeholder="Buscar por título o compositor..." aria-label="Buscar en la colección" autocomplete="off"><p id="sharedLibraryHint" class="libraryHint"></p><div id="sharedLibraryResults" class="libraryList sharedLibraryResults"></div></section>';
  head.after(tabs);dialog.append(digital);
  const input=digital.querySelector('input'),list=digital.querySelector('#sharedLibraryResults'),count=digital.querySelector('#sharedLibraryCount'),hint=digital.querySelector('#sharedLibraryHint'),title=digital.querySelector('h3'),buttons=new Map(),queries=new Map();
  let collection='melodies',preferred='melodies',previousViews={...getViews()},generation=0;
  for(const [id,label]of collections){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.collection=id;button.setAttribute('aria-pressed','false');button.onclick=()=>change(id);tabs.append(button);buttons.set(id,button);}
  function render(){
   const photo=collection==='photos',isAnalysis=collection==='analysis',rows=getCollections()[collection]||[];
   const searchable=rows.map(row=>photo?{...row,composer:[row.composer,row.sourceFile,...row.aliases||[]].join(' ')}:isAnalysis?{...row,composer:[row.composer,row.filename,row.curatedFilename,row.detail].filter(Boolean).join(' ')}:row);
   const result=globalThis.AACMelodyLibrarySearch.find(globalThis.AACMelodyLibrarySearch.createIndex(searchable),input.value,180);
   title.textContent=photo?'Partituras de referencia':isAnalysis?'Análisis':'Melodías';input.placeholder='Buscar por título o compositor...';
   count.textContent=input.value.trim()?`${result.total} de ${rows.length}`:String(rows.length);
   hint.textContent=!result.total?'No se encontraron temas.':result.total>180?`Mostrando 180 de ${result.total}. Escribe para acotar la lista.`:'';hint.hidden=!hint.textContent;
   list.replaceChildren();
   for(const found of result.results){const row=rows.find(r=>r.id===found.id),card=document.createElement('div'),button=document.createElement('button'),name=document.createElement('strong'),detail=document.createElement('span');card.className='sharedLibraryCard';button.type='button';button.className='libraryItem libraryItemOpen'+(row.current?' current':'');name.textContent=row.title;detail.textContent=composerName(row.composer);button.append(name,detail);
    if(isAnalysis)button.title=[row.title,row.composer,row.filename||row.curatedFilename,row.detail].filter(Boolean).join(' · ');
    button.onclick=async()=>{preferred=collection;button.disabled=true;try{if(isAnalysis)await onAnalysis(row);else{await(photo?onReference(row):onMelody(row));dialog.close();}}catch(error){globalThis.alert(error.message);}finally{button.disabled=false;}};card.append(button);
    if(isAnalysis&&row.canDelete){const remove=document.createElement('button');remove.type='button';remove.className='libraryDeleteBtn';remove.textContent=row.hasStaticBase?'Quitar copia':'Eliminar';remove.setAttribute('aria-label',`${remove.textContent}: ${row.title}`);remove.onclick=async()=>{remove.disabled=true;try{await onDeleteAnalysis(row);render();}catch(error){globalThis.alert(error.message);}finally{remove.disabled=false;}};card.append(remove);}
    list.append(card);
   }
  }
  async function change(next){
   queries.set(collection,input.value);collection=next;const token=++generation;dialog.dataset.collection=next;
   for(const [id,button]of buttons){button.setAttribute('aria-pressed',String(id===next));button.classList.toggle('active',id===next);}
   analysis.hidden=true;digital.hidden=false;input.value=queries.get(next)||'';render();
   if(next==='analysis'){await refreshAnalysis();if(token!==generation)return;render();}
   if(dialog.open)input.focus();
  }
  input.addEventListener('input',render);
  return {
   async open(){const next=collectionForViews(getViews(),preferred);document.querySelectorAll('.appMenu[open]').forEach(menu=>menu.removeAttribute('open'));if(!dialog.open)dialog.showModal();await change(next);},
   syncViews(views){const enabled=collections.filter(([, ,key])=>views[key]&&!previousViews[key]);if(enabled.length)preferred=enabled.at(-1)[0];preferred=collectionForViews(views,preferred);previousViews={...views};},
   refresh(){if(dialog.open)render();}
  };
 }
 return {collectionForViews,melodiesForReference,analysisEntries,photoEntries,mount};
});
