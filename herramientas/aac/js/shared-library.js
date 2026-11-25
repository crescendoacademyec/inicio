/* One library window, three collections; original analysis storage stays intact. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACSharedLibrary=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const collections=[['melodies','Melodías','score'],['photos','Partituras','photo'],['analysis','Análisis','chart']];
 function collectionForViews(views,preferred='melodies'){
  const active=collections.filter(([, ,key])=>views[key]).map(([id])=>id);
  return active.includes(preferred)?preferred:active[0]||preferred;
 }
 function melodiesForReference(catalog,reference,resolve){
  return catalog.filter(entry=>entry.sourceImage&&reference.pages.some(p=>p.image===entry.sourceImage)||(()=>{const match=resolve(entry);return !match.ambiguous&&match.references.some(r=>r.id===reference.id);})());
 }
 function mount({dialog,getViews,getCollections,refreshAnalysis,onMelody,onReference}){
  const analysis=dialog.querySelector('.libraryDialogBody'),head=dialog.querySelector('.dialogHead'),tabs=document.createElement('nav');tabs.className='library-collections';tabs.setAttribute('aria-label','Colecciones de la biblioteca');
  const digital=document.createElement('div');digital.className='libraryDigitalBody';digital.hidden=true;
  digital.innerHTML='<section class="librarySection"><div class="librarySectionHead"><h3 id="sharedLibraryTitle"></h3><span id="sharedLibraryCount" class="libraryCount"></span></div><input id="sharedLibrarySearch" class="librarySearchInput" type="search" placeholder="Buscar por título o compositor..." aria-label="Buscar en la colección" autocomplete="off"><p id="sharedLibraryHint" class="libraryHint"></p><div id="sharedLibraryResults" class="libraryList sharedLibraryResults"></div></section>';
  head.after(tabs);dialog.append(digital);
  const input=digital.querySelector('input'),list=digital.querySelector('#sharedLibraryResults'),count=digital.querySelector('#sharedLibraryCount'),hint=digital.querySelector('#sharedLibraryHint'),title=digital.querySelector('h3'),buttons=new Map(),queries=new Map();
  let collection='melodies',preferred='melodies',previousViews={...getViews()},generation=0;
  for(const [id,label]of collections){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.collection=id;button.setAttribute('aria-pressed','false');button.onclick=()=>change(id);tabs.append(button);buttons.set(id,button);}
  function render(){
   if(collection==='analysis')return;
   const photo=collection==='photos',rows=getCollections()[photo?'photos':'melodies']||[];
   const searchable=rows.map(row=>photo?{...row,composer:[row.sourceFile,...row.aliases||[]].join(' ')}:row);
   const result=globalThis.AACMelodyLibrarySearch.find(globalThis.AACMelodyLibrarySearch.createIndex(searchable),input.value,180);
   title.textContent=photo?'Partituras de referencia':'Melodías';input.placeholder=photo?'Buscar por título o libro...':'Buscar por título o compositor...';
   count.textContent=input.value.trim()?`${result.total} de ${rows.length}`:String(rows.length);
   hint.textContent=!result.total?'No se encontraron temas.':result.total>180?`Mostrando 180 de ${result.total}. Escribe para acotar la lista.`:'';hint.hidden=!hint.textContent;
   list.replaceChildren();
   for(const found of result.results){const row=rows.find(r=>r.id===found.id),button=document.createElement('button'),name=document.createElement('strong'),detail=document.createElement('span');button.type='button';button.className='libraryItem libraryItemOpen';name.textContent=row.title;detail.textContent=photo?`${row.sourceFile} · pág. ${row.printedPage} · ${row.pages.length} ${row.pages.length===1?'página':'páginas'}`:`${row.composer||'Sin compositor'} · ${String(row.sourceFormat||'MusicXML').toUpperCase()}`;button.append(name,detail);
    button.onclick=async()=>{preferred=collection;button.disabled=true;try{await(photo?onReference(row):onMelody(row));dialog.close();}catch(error){globalThis.alert(error.message);button.disabled=false;}};list.append(button);
   }
  }
  async function change(next){
   queries.set(collection,input.value);collection=next;const token=++generation;dialog.dataset.collection=next;
   for(const [id,button]of buttons){button.setAttribute('aria-pressed',String(id===next));button.classList.toggle('active',id===next);}
   analysis.hidden=next!=='analysis';digital.hidden=next==='analysis';
   if(next==='analysis'){await refreshAnalysis();if(token===generation&&dialog.open)dialog.querySelector('#librarySearchInput')?.focus();}
   else{input.value=queries.get(next)||'';render();if(dialog.open)input.focus();}
  }
  input.addEventListener('input',render);
  return {
   async open(){const next=collectionForViews(getViews(),preferred);document.querySelectorAll('.appMenu[open]').forEach(menu=>menu.removeAttribute('open'));if(!dialog.open)dialog.showModal();await change(next);},
   syncViews(views){const enabled=collections.filter(([, ,key])=>views[key]&&!previousViews[key]);if(enabled.length)preferred=enabled.at(-1)[0];preferred=collectionForViews(views,preferred);previousViews={...views};},
   refresh(){if(dialog.open)render();}
  };
 }
 return {collectionForViews,melodiesForReference,mount};
});
